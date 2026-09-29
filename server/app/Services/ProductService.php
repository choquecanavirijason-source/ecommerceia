<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Models\Category;
use Illuminate\Database\Eloquent\Builder;

class ProductService
{
    public function catalog(array $filters): LengthAwarePaginator
    {
        return Product::query()
            ->with(['category', 'supplier'])
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->active()
            ->search($filters['search'] ?? null)
            ->filterByTag($filters['tag'] ?? null)
            ->filterByCategory($filters['category'] ?? null)
            ->when(
                isset($filters['is_featured']) && $filters['is_featured'] !== '',
                fn($query) => $query->where('is_featured', filter_var($filters['is_featured'], FILTER_VALIDATE_BOOL))
            )
            ->when(
                isset($filters['is_flash_deal']) && $filters['is_flash_deal'] !== '',
                fn($query) => $query->where(function ($q) use ($filters) {
                    $val = filter_var($filters['is_flash_deal'], FILTER_VALIDATE_BOOL);
                    if ($val) {
                        $q->where('is_flash_deal', true)
                            ->where(function ($dateQ) {
                                $dateQ->whereNull('flash_deal_ends_at')
                                    ->orWhere('flash_deal_ends_at', '>=', now());
                            });
                    } else {
                        $q->where('is_flash_deal', false);
                    }
                })
            )
            ->sort(
                $filters['sortBy']['sort'] ?? 'id',
                $filters['sortBy']['order'] ?? 'asc'
            )
            ->paginate(
                $filters['limit'] ?? 12,
                ['*'],
                'page',
                $filters['page'] ?? 1
            );
    }

    private function applyAdminSort(Builder $query, ?string $sort, string $direction): void
    {
        $direction = strtolower($direction) === 'desc' ? 'desc' : 'asc';

        switch ($sort) {
            case 'name':
                $query->orderBy('name', $direction);
                break;
            case 'price':
                $query->orderBy('price', $direction);
                break;
            case 'stock':
                $query->orderBy('stock', $direction);
                break;
            case 'status':
                $query->orderBy('is_active', $direction);
                break;
            case 'category':
                // Subconsulta: no choca con with('category') ni con withCount/withAvg
                $query->orderBy(
                    Category::select('name')->whereColumn('categories.id', 'products.category_id'),
                    $direction
                );
                break;
            default:
                $query->orderBy('id', 'desc');
                return;
        }

        // Desempate para que la paginación sea estable
        $query->orderBy('id', 'desc');
    }

    public function adminCatalog(array $filters): LengthAwarePaginator
    {
        $query = Product::query()
            ->with(['category', 'supplier'])
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->search($filters['search'] ?? null)
            ->filterByCategory($filters['category'] ?? null)
            ->when(
                isset($filters['is_active']) && $filters['is_active'] !== '',
                fn($q) => $q->where(
                    'is_active',
                    filter_var($filters['is_active'], FILTER_VALIDATE_BOOL)
                )
            )
            ->when(
                isset($filters['is_featured']) && $filters['is_featured'] !== '',
                fn($q) => $q->where(
                    'is_featured',
                    filter_var($filters['is_featured'], FILTER_VALIDATE_BOOL)
                )
            )
            ->when(
                isset($filters['is_flash_deal']) && $filters['is_flash_deal'] !== '',
                fn($q) => $q->where(
                    'is_flash_deal',
                    filter_var($filters['is_flash_deal'], FILTER_VALIDATE_BOOL)
                )
            );

        $this->applyAdminSort(
            $query,
            $filters['sort'] ?? null,
            $filters['direction'] ?? 'asc'
        );

        return $query->paginate(
            $filters['limit'] ?? 10,
            ['*'],
            'page',
            $filters['page'] ?? 1
        );
    }

    /**
     * Devuelve un Builder con los mismos filtros/sort que adminCatalog
     * pero sin paginar, para la exportación Excel.
     */
    public function adminExportQuery(array $filters): Builder
    {
        $query = Product::query()
            ->with(['category', 'supplier'])
            ->search($filters['search'] ?? null)
            ->filterByCategory($filters['category'] ?? null)
            ->when(
                isset($filters['is_active']) && $filters['is_active'] !== '',
                fn($q) => $q->where(
                    'is_active',
                    filter_var($filters['is_active'], FILTER_VALIDATE_BOOL)
                )
            )
            ->when(
                isset($filters['is_featured']) && $filters['is_featured'] !== '',
                fn($q) => $q->where(
                    'is_featured',
                    filter_var($filters['is_featured'], FILTER_VALIDATE_BOOL)
                )
            )
            ->when(
                isset($filters['is_flash_deal']) && $filters['is_flash_deal'] !== '',
                fn($q) => $q->where(
                    'is_flash_deal',
                    filter_var($filters['is_flash_deal'], FILTER_VALIDATE_BOOL)
                )
            );

        $this->applyAdminSort(
            $query,
            $filters['sort'] ?? null,
            $filters['direction'] ?? 'asc'
        );

        return $query;
    }

    public function all(): Collection
    {
        return Product::with(['category', 'supplier'])
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->active()
            ->orderBy('name', 'asc')
            ->get();
    }

    public function findBySlugOrId($slug): ?Product
    {
        return Product::with(['category', 'supplier'])
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->where(is_numeric($slug) ? 'id' : 'slug', $slug)
            ->first();
    }

    public function create(array $data): Product
    {
        $data['slug'] = $this->uniqueSlug($data['name']);
        $product = Product::create($data);

        $images = $this->resolveImages($data);
        if ($images !== null) {
            $product->update(['images' => $images]);
        }

        return $product;
    }

    public function update(Product $product, array $data): Product
    {
        $data['slug'] = $this->uniqueSlug($data['name'], $product->slug);
        $product->update($data);

        $images = $this->resolveImages($data);
        if ($images !== null) {
            $product->update(['images' => $images]);
        }

        return $product;
    }

    public function delete(Product $product): void
    {
        $this->deleteImageFiles($product->images ?? []);
        $product->delete();
    }

    public function toggleActive(Product $product, bool $isActive): Product
    {
        $product->update(['is_active' => $isActive]);

        return $product;
    }

    private function deleteImageFiles(array $images): void
    {
        foreach ($images as $image) {
            $url = $image['url'] ?? null;
            if (!$url || !str_contains($url, '/storage/')) {
                continue;
            }

            $relative = Str::after($url, '/storage/');
            if (Storage::disk('public')->exists($relative)) {
                Storage::disk('public')->delete($relative);
            }
        }
    }

    private function resolveImages(array $data): ?array
    {
        $images = [];

        foreach ($data['existing_images'] ?? [] as $image) {
            if (is_array($image) && !empty($image['url'])) {
                $images[] = [
                    'url' => $image['url'],
                    'alt' => $image['alt'] ?? '',
                ];
            }
        }

        $rawImages = $data['images'] ?? [];
        $hasUploadedFiles = is_array($rawImages)
            && isset($rawImages[0])
            && $rawImages[0] instanceof UploadedFile;

        if (!$hasUploadedFiles && is_array($rawImages)) {
            foreach ($rawImages as $image) {
                if (is_array($image) && !empty($image['url'])) {
                    $images[] = [
                        'url' => $image['url'],
                        'alt' => $image['alt'] ?? '',
                    ];
                }
            }
        }

        $alts = $data['image_alts'] ?? [];
        if ($hasUploadedFiles) {
            foreach ($rawImages as $index => $file) {
                $path = $file->store('products', 'public');
                $images[] = [
                    'url' => asset(Storage::url($path)),
                    'alt' => $alts[$index] ?? '',
                ];
            }
        }

        foreach ($data['image_urls'] ?? [] as $url) {
            if (is_string($url) && trim($url) !== '') {
                $images[] = [
                    'url' => trim($url),
                    'alt' => $data['name'] ?? '',
                ];
            }
        }

        return $images;
    }

    private function uniqueSlug(string $name, ?string $currentSlug = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $counter = 1;

        $query = Product::where('slug', $slug);
        if ($currentSlug) {
            $query->where('slug', '!=', $currentSlug);
        }

        while ($query->exists()) {
            $slug = $base . '-' . $counter++;
            $query = Product::where('slug', $slug);
            if ($currentSlug) {
                $query->where('slug', '!=', $currentSlug);
            }
        }

        return $slug;
    }

    public function findById($id): ?Product
    {
        return Product::with(['category', 'supplier'])
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->where('id', $id)
            ->first();
    }
}
