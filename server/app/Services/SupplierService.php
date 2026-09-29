<?php

namespace App\Services;

use App\Models\Supplier;
use App\Support\AdminTableSort;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class SupplierService
{
    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = Supplier::query()
            ->withCount('products')
            ->search($filters['search'] ?? null)
            ->when(
                isset($filters['is_active']) && $filters['is_active'] !== '',
                fn ($query) => $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOL))
            );

        return AdminTableSort::apply($query, $filters, [
            'id' => 'id',
            'name' => 'name',
            'code' => 'code',
            'contact_name' => 'contact_name',
            'email' => 'email',
            'products_count' => 'products_count',
            'is_active' => 'is_active',
        ])
            ->paginate(
                $filters['limit'] ?? 10,
                ['*'],
                'page',
                $filters['page'] ?? 1
            );
    }

    public function allActive(): Collection
    {
        return Supplier::query()
            ->active()
            ->withCount('products')
            ->orderBy('name', 'asc')
            ->get();
    }

    public function create(array $data): Supplier
    {
        return Supplier::create($data)->loadCount('products');
    }

    public function update(Supplier $supplier, array $data): Supplier
    {
        $supplier->update($data);

        return $supplier->loadCount('products');
    }

    public function toggleActive(Supplier $supplier): Supplier
    {
        $supplier->is_active = !$supplier->is_active;
        $supplier->save();

        return $supplier->loadCount('products');
    }

    public function delete(Supplier $supplier): void
    {
        $supplier->delete();
    }
}
