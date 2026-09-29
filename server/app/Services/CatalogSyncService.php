<?php

namespace App\Services;

use App\Jobs\CatalogSyncJob;
use App\Models\CatalogSyncItem;
use App\Models\CatalogSyncLog;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class CatalogSyncService
{
    public function __construct(private readonly RedlenicCatalogClient $client) {}

    public function start(int $userId, bool $fresh): CatalogSyncLog
    {
        $this->requireQueue();
        if (! config('catalog_sync.password')) {
            $this->reject('Configurá REDLENIC_CLAVE en server/.env y reiniciá el worker.');
        }

        return Cache::lock('catalog-sync:start', 30)->block(3, function () use ($userId, $fresh) {
            $active = CatalogSyncLog::whereIn('status', ['scanning', 'applying'])->latest('id')->first();
            if ($active) {
                // Preserve progress when the worker is stopped. A duplicate delivery is
                // harmless: the job checks the persisted step under the run lock.
                if ($active->updated_at->lt(now()->subMinutes(3))
                    && Cache::add('catalog-sync:resume:'.$active->id.':'.$active->step, true, 180)) {
                    CatalogSyncJob::dispatch($active->id, $active->step)->afterCommit();
                }

                return $active;
            }
            if (! $fresh) {
                $recent = CatalogSyncLog::where('status', 'ready')->where('scanned_at', '>', now()->subMinutes(config('catalog_sync.preview_minutes')))->latest('id')->first();
                if ($recent) {
                    return $recent;
                }
            }

            return DB::transaction(function () use ($userId) {
                $run = CatalogSyncLog::create(['user_id' => $userId, 'status' => 'scanning', 'state' => ['pages' => [], 'page_index' => 0]]);
                CatalogSyncJob::dispatch($run->id, 0)->afterCommit();

                return $run;
            });
        });
    }

    public function step(CatalogSyncLog $run): void
    {
        if ($run->status === 'scanning') {
            $this->scanPage($run);
        } elseif ($run->status === 'applying') {
            $this->prepareImageOrApply($run);
        }
    }

    private function scanPage(CatalogSyncLog $run): void
    {
        $state = $run->state;
        $index = $state['page_index'];
        $this->client->restoreSession($run->session);
        if (! $run->session) {
            $this->client->login();
        }
        $page = $this->client->page((string) ($state['pages'][$index]['id'] ?? '99999'));
        if ($index === 0) {
            if (! $page['products']) {
                throw new RuntimeException('La página Todas está vacía. No se calcularán bajas.');
            }
            $state['pages'] = [['id' => '99999', 'name' => 'Todas']];
            foreach ($page['categories'] as $id => $name) {
                $state['pages'][] = ['id' => (string) $id, 'name' => $name];
            }
            $state['categories'] = $page['categories'];
        } elseif ($state['categories'] != $page['categories']) {
            throw new RuntimeException('Las categorías del portal cambiaron durante el escaneo. Volvé a escanear.');
        }

        DB::transaction(function () use ($run, $page, $state, $index) {
            $expectedStep = $run->step;
            $run = CatalogSyncLog::lockForUpdate()->findOrFail($run->id);
            // Cancellation can arrive while the HTTP request is in flight.
            if ($run->status !== 'scanning' || $run->step !== $expectedStep) {
                return;
            }
            $existing = $run->items()->whereIn('supplier_sku', array_column($page['products'], 'supplier_sku'))->get()->keyBy('supplier_sku');
            $inserts = [];
            foreach ($page['products'] as $payload) {
                $item = $existing->get($payload['supplier_sku']);
                if ($item) {
                    if ($item->payload !== $payload) {
                        $item->issues = array_values(array_unique([...($item->issues ?? []), 'conflict']));
                        $item->save();
                    }

                    continue;
                }
                $inserts[] = ['catalog_sync_log_id' => $run->id, 'supplier_sku' => $payload['supplier_sku'],
                    'payload' => json_encode($payload, JSON_THROW_ON_ERROR), 'issues' => '[]',
                    'created_at' => now(), 'updated_at' => now()];
            }
            foreach (array_chunk($inserts, 500) as $chunk) {
                CatalogSyncItem::insert($chunk);
            }
            $state['page_index'] = $index + 1;
            $run->state = $state;
            $run->session = $this->client->session();
            $run->step++;
            $run->save();
            if ($state['page_index'] === count($state['pages'])) {
                $this->buildPreview($run);
            } else {
                CatalogSyncJob::dispatch($run->id, $run->step)->afterCommit();
            }
        });
    }

    private function legacyCodes(): array
    {
        $entries = json_decode(file_get_contents(database_path('seeders/data/redlenic_products.json')), true, 512, JSON_THROW_ON_ERROR);

        return array_column($entries, null, 'id');
    }

    private function isLegacy(Product $product, array $codes): bool
    {
        if ($product->catalog_source !== null || $product->supplier_sku !== null || ! isset($codes[$product->sku]) || ! str_ends_with($product->slug, '-'.$product->sku)) {
            return false;
        }
        // Recognize historical imports without relying on the manually assigned supplier.
        foreach ($product->images ?? [] as $image) {
            if (($image['url'] ?? '') === ($codes[$product->sku]['image'] ?? null)) {
                return true;
            }
        }

        return false;
    }

    private function buildPreview(CatalogSyncLog $run): void
    {
        $legacy = $this->legacyCodes();
        $products = Product::all();
        $linked = $products->filter(fn ($product) => $product->catalog_source === 'redlenic' && $product->supplier_sku !== null)->keyBy('supplier_sku');
        $bySku = $products->groupBy('sku');
        $categories = Category::all()->groupBy(fn ($category) => $this->client->cleanText($category->name));
        $mappings = DB::table('catalog_category_mappings')->where('catalog_source', 'redlenic')->pluck('category_id', 'external_category');
        $seen = [];
        foreach ($run->items()->get() as $item) {
            $seen[$item->supplier_sku] = true;
            $product = $linked->get($item->supplier_sku);
            $candidates = $bySku->get($item->supplier_sku, collect());
            $issues = $item->issues ?? [];
            if (! $product && $candidates->count()) {
                if ($candidates->count() === 1 && $this->isLegacy($candidates->first(), $legacy)) {
                    $product = $candidates->first();
                } else {
                    $issues[] = 'identity';
                }
            }
            $payload = $item->payload;
            $matches = $categories->get($payload['category'], collect());
            $payload['category_id'] = $mappings->get($payload['category']) ?? ($payload['category'] !== '' && $matches->count() === 1 ? $matches->first()->id : null);
            $payload['track_source'] = $product && $product->catalog_source === null;
            $item->fill(['product_id' => $product?->id, 'baseline' => $product?->getAttributes(), 'payload' => $payload, 'issues' => $issues]);
            $this->refreshItem($item);
        }
        foreach ($products as $product) {
            $isLinked = $product->catalog_source === 'redlenic' && $product->supplier_sku !== null;
            if (! $isLinked && ! $this->isLegacy($product, $legacy)) {
                continue;
            }
            $code = $isLinked ? $product->supplier_sku : $product->sku;
            if (isset($seen[$code]) || ! $product->is_active) {
                continue;
            }
            if ($bySku->get($code, collect())->count() > 1) {
                throw new RuntimeException('Hay códigos locales ambiguos entre los posibles descontinuados. No se aplicarán bajas.');
            }
            $run->items()->create(['supplier_sku' => $code, 'product_id' => $product->id, 'action' => 'deactivate',
                'baseline' => $product->getAttributes(), 'issues' => [], 'images_ready' => true,
                'payload' => ['name' => $product->name, 'category' => '', 'category_id' => $product->category_id,
                    'price' => (string) $product->price, 'stock' => $product->stock, 'source_images' => [], 'track_source' => ! $isLinked]]);
        }
        $run->update(['status' => 'ready', 'session' => null, 'scanned_at' => now()]);
        $this->updateCounts($run);
    }

    private function refreshItem(CatalogSyncItem $item): void
    {
        if ($item->action === 'deactivate') {
            return;
        }
        $payload = $item->payload;
        $issues = array_values(array_intersect($item->issues ?? [], ['conflict', 'identity']));
        foreach (['name', 'price', 'stock', 'category_id'] as $field) {
            if ($payload[$field] === null || $payload[$field] === '' || ($field === 'name' && mb_strlen($payload[$field]) > 255)) {
                $issues[] = $field === 'category_id' ? 'category' : $field;
            }
        }
        $item->issues = $issues;
        $item->action = $item->product_id ? 'update' : 'create';
        if ($item->baseline && ! $issues && ! $payload['track_source']) {
            $same = (bool) $item->baseline['is_active'];
            foreach (['name', 'price', 'stock', 'category_id'] as $field) {
                $same = $same && (string) $item->baseline[$field] === (string) $payload[$field];
            }
            $previousImages = json_decode($item->baseline['images'] ?? '[]', true) ?? [];
            $expected = array_map(fn ($url) => $this->client->imagePath($url), $payload['source_images']);
            $actual = array_map(fn ($image) => parse_url($image['url'], PHP_URL_PATH), $previousImages);
            $same = $same && (! $expected || $actual === array_map(fn ($path) => '/storage/'.$path, $expected));
            if ($same) {
                $item->action = 'unchanged';
            }
        }
        $item->save();
    }

    public function resolve(CatalogSyncLog $run, array $data): void
    {
        if ($run->status !== 'ready') {
            $this->reject('El escaneo todavía no está listo para revisar.');
        }
        DB::transaction(function () use ($run, $data) {
            foreach ($data['mappings'] ?? [] as $mapping) {
                if (! Category::whereKey($mapping['category_id'])->exists()) {
                    $this->reject('La categoría elegida ya no existe.');
                }
                foreach ($run->items()->where('action', '!=', 'deactivate')->get() as $item) {
                    if ($item->payload['category'] === $mapping['external_category']) {
                        $payload = $item->payload;
                        $payload['category_id'] = $mapping['category_id'];
                        $item->payload = $payload;
                        $this->refreshItem($item);
                    }
                }
            }
            foreach ($data['stocks'] ?? [] as $stock) {
                $item = $run->items()->whereKey($stock['item_id'])->where('action', '!=', 'deactivate')->firstOrFail();
                $payload = $item->payload;
                $payload['stock'] = $stock['stock'];
                $item->payload = $payload;
                $this->refreshItem($item);
            }
            $this->updateCounts($run);
        });
    }

    public function requestApply(CatalogSyncLog $run, int $userId, bool $skipInvalid): void
    {
        $this->requireQueue();
        Cache::lock('catalog-sync:start', 30)->block(3, function () use ($run, $userId, $skipInvalid) {
            DB::transaction(function () use ($run, $userId, $skipInvalid) {
                $run = CatalogSyncLog::lockForUpdate()->findOrFail($run->id);
                if (in_array($run->status, ['applied', 'applying'], true)) {
                    return;
                }
                if ($run->status !== 'ready' || $run->scanned_at->lt(now()->subMinutes(config('catalog_sync.preview_minutes')))) {
                    $this->reject('El preview venció o no está listo. Volvé a escanear antes de aplicar.');
                }
                if (CatalogSyncLog::whereKeyNot($run->id)->whereIn('status', ['scanning', 'applying'])->exists()) {
                    $this->reject('Hay otra sincronización en curso. Esperá a que termine.');
                }
                if (! $skipInvalid && $run->items()->whereJsonLength('issues', '>', 0)->exists()) {
                    $this->reject('Resolvé los pendientes o elegí explícitamente omitirlos.');
                }
                $run->items()->whereJsonLength('issues', '>', 0)->update(['skipped' => true]);
                $run->items()->whereIn('action', ['unchanged', 'deactivate'])->update(['images_ready' => true]);
                $run->update(['status' => 'applying', 'applied_by' => $userId, 'step' => $run->step + 1]);
                CatalogSyncJob::dispatch($run->id, $run->step)->afterCommit();
            });
        });
    }

    private function prepareImageOrApply(CatalogSyncLog $run): void
    {
        $item = $run->items()->where('skipped', false)->where('images_ready', false)->orderBy('id')->first();
        if (! $item) {
            $this->commit($run);

            return;
        }
        $sources = $item->payload['source_images'];
        $images = $item->images ?? [];
        if (isset($sources[$item->image_cursor])) {
            $image = $this->client->downloadImage($sources[$item->image_cursor], $item->payload['name']);
            if ($image) {
                $images[] = $image;
            }
        }
        DB::transaction(function () use ($run, $item, $images, $sources) {
            $item->images = $images;
            $item->image_cursor++;
            $item->images_ready = $item->image_cursor >= count($sources);
            $item->save();
            $run->increment('step');
            CatalogSyncJob::dispatch($run->id, $run->step)->afterCommit();
        });
    }

    public function commit(CatalogSyncLog $run): void
    {
        DB::transaction(function () use ($run) {
            $run = CatalogSyncLog::lockForUpdate()->findOrFail($run->id);
            if ($run->status === 'applied') {
                return;
            }
            if ($run->status !== 'applying' || $run->state['page_index'] !== count($run->state['pages'])
                || $run->items()->where('skipped', false)->where('images_ready', false)->exists()) {
                throw new RuntimeException('La sincronización no está completa. No se aplicó ningún cambio.');
            }
            $items = $run->items()->where('skipped', false)->orderBy('id')->get();
            $products = Product::whereKey($items->pluck('product_id')->filter()->all())->orderBy('id')->lockForUpdate()->get()->keyBy('id');
            $codes = $items->pluck('supplier_sku')->all();
            $existingCodes = Product::whereIn('sku', $codes)->pluck('sku')->flip();
            $sourceCodes = Product::where('catalog_source', 'redlenic')->whereIn('supplier_sku', $codes)->pluck('supplier_sku')->flip();
            $categoryIds = Category::pluck('id')->flip();
            $categoryMappings = [];
            foreach ($items as $item) {
                $product = $products->get($item->product_id);
                if ($item->product_id && (! $product || $product->getAttributes() != $item->baseline)) {
                    throw new RuntimeException('Un producto cambió desde el preview. Volvé a escanear; no se aplicó ningún cambio.');
                }
                if (! $product && ($existingCodes->has($item->supplier_sku) || $sourceCodes->has($item->supplier_sku))) {
                    throw new RuntimeException('Apareció un código local después del preview. Volvé a escanear.');
                }
                if ($item->action === 'unchanged') {
                    continue;
                }
                if ($item->issues) {
                    throw new RuntimeException('Quedaron productos sin resolver.');
                }
                $payload = $item->payload;
                if ($item->action === 'deactivate') {
                    $product->update(['catalog_source' => 'redlenic', 'supplier_sku' => $item->supplier_sku, 'is_active' => false]);

                    continue;
                }
                if (! $categoryIds->has($payload['category_id'])) {
                    throw new RuntimeException('Una categoría fue eliminada después del preview.');
                }
                $values = ['name' => $payload['name'], 'category_id' => $payload['category_id'], 'price' => $payload['price'],
                    'stock' => $payload['stock'], 'catalog_source' => 'redlenic', 'supplier_sku' => $item->supplier_sku, 'is_active' => true];
                $images = $item->images ?? [];
                // A partially failed gallery download must not erase existing pictures.
                if (count($images) < count($payload['source_images']) && $product?->images) {
                    $images = collect([...$images, ...$product->images])->unique('url')->values()->all();
                }
                $values['images'] = $images ?: ($product?->images ?: [['url' => asset('images/product-unavailable.svg'), 'alt' => 'Imagen no disponible']]);
                if ($product) {
                    $product->update($values);
                } else {
                    $slug = Str::limit(Str::slug($payload['name']), 180, '').'-redlenic-'.$item->supplier_sku;
                    if (Product::where('slug', $slug)->exists()) {
                        $slug .= '-'.Str::lower(Str::random(8));
                    }
                    Product::create([...$values, 'slug' => $slug, 'sku' => $item->supplier_sku, 'description' => $payload['name']]);
                }
                if ($payload['category'] !== '') {
                    $categoryMappings[$payload['category']] = ['catalog_source' => 'redlenic', 'external_category' => $payload['category'],
                        'category_id' => $payload['category_id'], 'created_at' => now(), 'updated_at' => now()];
                }
            }
            if ($categoryMappings) {
                DB::table('catalog_category_mappings')->upsert(array_values($categoryMappings), ['catalog_source', 'external_category'], ['category_id', 'updated_at']);
            }
            $run->update(['status' => 'applied', 'finished_at' => now(), 'session' => null]);
            $this->updateCounts($run);
        });
    }

    private function updateCounts(CatalogSyncLog $run): void
    {
        $items = $run->items()->get();
        $counts = ['create' => 0, 'update' => 0, 'deactivate' => 0, 'unchanged' => 0, 'pending' => 0, 'skipped' => 0];
        foreach ($items as $item) {
            if ($item->skipped) {
                $counts['skipped']++;

                continue;
            }
            $counts[$item->action]++;
            $counts['pending'] += (int) ! empty($item->issues);
        }
        $run->update(['counts' => $counts]);
    }

    private function requireQueue(): void
    {
        if (! in_array(config('queue.default'), ['database', 'redis'], true)) {
            $this->reject('La sincronización necesita QUEUE_CONNECTION=database o redis y un worker activo.');
        }
        if ((int) config('queue.connections.'.config('queue.default').'.retry_after', 90) <= 85) {
            $this->reject('Configurá retry_after de la cola por encima de 85 segundos para evitar trabajos simultáneos.');
        }
    }

    private function reject(string $message): never
    {
        throw ValidationException::withMessages(['sync' => $message]);
    }
}
