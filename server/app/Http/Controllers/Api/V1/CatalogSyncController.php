<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CatalogSyncLog;
use App\Services\CatalogSyncService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class CatalogSyncController extends Controller
{
    public function __construct(private readonly CatalogSyncService $sync) {}

    public function preview(Request $request): JsonResponse
    {
        $data = $request->validate(['fresh' => 'sometimes|boolean']);
        $run = $this->sync->start($request->user()->id, $data['fresh'] ?? false);

        return response()->json(['id' => $run->id], 202);
    }

    public function current(): JsonResponse
    {
        // Read-only recovery after navigation/reload; never starts a new scan.
        $run = CatalogSyncLog::whereIn('status', ['scanning', 'applying'])->latest('id')->first()
            ?? CatalogSyncLog::latest('id')->first();

        return response()->json(['id' => $run?->id]);
    }

    public function show(Request $request, CatalogSyncLog $run): JsonResponse
    {
        $data = $request->validate(['page' => 'sometimes|integer|min:1', 'pending' => 'sometimes|boolean', 'action' => 'sometimes|in:create,update,deactivate,unchanged']);
        $query = $run->items()->orderBy('id');
        if ($data['pending'] ?? false) {
            $query->whereJsonLength('issues', '>', 0);
        }
        if (isset($data['action'])) {
            $query->where('action', $data['action']);
        }
        $items = $query->paginate(25);
        $unmapped = [];
        if ($run->status === 'ready') {
            foreach ($run->items()->whereJsonContains('issues', 'category')->get() as $item) {
                $unmapped[$item->payload['category']] = true;
            }
        }
        $state = $run->state ?? [];
        // These totals describe the entire comparison, regardless of the selected page/filter.
        $totals = $run->items()->selectRaw('action, COUNT(*) as total')->groupBy('action')->pluck('total', 'action');
        $eligible = $run->items()->where('skipped', false)->whereJsonLength('issues', 0)
            ->selectRaw('action, COUNT(*) as total')->groupBy('action')->pluck('total', 'action');

        return response()->json([
            'id' => $run->id, 'status' => $run->status, 'counts' => $run->counts, 'error' => $run->error,
            'created_at' => $run->created_at, 'updated_at' => $run->updated_at, 'scanned_at' => $run->scanned_at,
            'stalled' => in_array($run->status, ['scanning', 'applying'], true) && $run->updated_at->lt(now()->subMinutes(3)),
            'expires_at' => $run->scanned_at?->copy()->addMinutes(config('catalog_sync.preview_minutes')),
            'summary' => [
                'external' => (int) $totals->sum() - (int) $totals->get('deactivate', 0),
                'absent' => (int) $totals->get('deactivate', 0), 'compared' => (int) $totals->sum(),
                'eligible' => [
                    'create' => (int) $eligible->get('create', 0), 'update' => (int) $eligible->get('update', 0),
                    'deactivate' => (int) $eligible->get('deactivate', 0), 'unchanged' => (int) $eligible->get('unchanged', 0),
                ],
            ],
            'progress' => ['pages_done' => $state['page_index'] ?? 0, 'pages_total' => count($state['pages'] ?? []),
                'products' => $run->items()->count(),
                'images_done' => $run->items()->where('skipped', false)->where('images_ready', true)->count(),
                'images_total' => $run->items()->where('skipped', false)->count()],
            'unmapped' => array_keys($unmapped),
            'items' => $items->map(fn ($item) => [
                'id' => $item->id, 'supplier_sku' => $item->supplier_sku, 'action' => $item->action,
                'payload' => $item->payload, 'issues' => $item->issues, 'skipped' => $item->skipped,
                'before' => $item->baseline ? array_intersect_key($item->baseline, array_flip(['name', 'price', 'stock', 'category_id', 'supplier_id', 'is_active'])) : null,
            ])->values(),
            'pagination' => ['page' => $items->currentPage(), 'last_page' => $items->lastPage(), 'total' => $items->total()],
        ]);
    }

    public function resolve(Request $request, CatalogSyncLog $run): JsonResponse
    {
        $data = $request->validate([
            'mappings' => 'sometimes|array|max:100', 'mappings.*.external_category' => 'present|nullable|string|max:255',
            'mappings.*.category_id' => 'required|integer|exists:categories,id',
            'stocks' => 'sometimes|array|max:100', 'stocks.*.item_id' => 'required|integer',
            'stocks.*.stock' => 'required|integer|min:0|max:2147483647',
        ]);
        // Laravel converts empty inputs to null; an unnamed external category still needs manual resolution.
        foreach ($data['mappings'] ?? [] as $index => $mapping) {
            $data['mappings'][$index]['external_category'] = $mapping['external_category'] ?? '';
        }
        Cache::lock('catalog-sync:run:'.$run->id, 85)->block(3, fn () => $this->sync->resolve($run->fresh(), $data));

        return response()->json(['id' => $run->id]);
    }

    public function apply(Request $request): JsonResponse
    {
        $data = $request->validate(['id' => 'required|integer|exists:catalog_sync_logs,id', 'skip_invalid' => 'required|boolean']);
        Cache::lock('catalog-sync:run:'.$data['id'], 85)->block(3, fn () => $this->sync->requestApply(CatalogSyncLog::findOrFail($data['id']), $request->user()->id, $data['skip_invalid']));

        return response()->json(['id' => $data['id']], 202);
    }

    public function cancel(CatalogSyncLog $run): JsonResponse
    {
        DB::transaction(function () use ($run) {
            $run = CatalogSyncLog::lockForUpdate()->findOrFail($run->id);
            // Applying already has explicit approval; closing the modal must not interrupt its transaction.
            abort_unless(in_array($run->status, ['scanning', 'ready', 'cancelled'], true), 409, 'Esta ejecución ya no se puede cancelar.');
            $run->update(['status' => 'cancelled', 'session' => null, 'finished_at' => now(), 'step' => $run->step + 1]);
        });

        return response()->json(['id' => $run->id]);
    }
}
