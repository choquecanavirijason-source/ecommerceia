<?php

namespace App\Services;

use App\Models\Category;
use App\Support\AdminTableSort;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class CategoryService
{
    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = Category::query()
            ->withCount('products')
            ->search($filters['search'] ?? null);

        return AdminTableSort::apply($query, $filters, [
            'id' => 'id',
            'name' => 'name',
            'slug' => 'slug',
            'products_count' => 'products_count',
        ], 'id', 'asc')
            ->paginate(
                $filters['limit'] ?? 10,
                ['*'],
                'page',
                $filters['page'] ?? 1
            );
    }

    public function all(): Collection
    {
        return Category::withCount('products')->orderBy('name', 'asc')->get();
    }

    public function create(string $name, ?string $icon = null): Category
    {
        return Category::create([
            'name' => $name,
            'slug' => Str::slug($name),
            'icon' => $icon,
        ])->loadCount('products');
    }

    public function update(Category $category, string $name, ?string $icon = null): Category
    {
        $category->update([
            'name' => $name,
            'slug' => Str::slug($name),
            'icon' => $icon,
        ]);

        return $category->loadCount('products');
    }

    public function delete(Category $category): void
    {
        $category->delete();
    }
}
