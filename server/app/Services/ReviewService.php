<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Review;
use Illuminate\Database\Eloquent\Collection;

class ReviewService
{
    public function forProduct(Product $product): Collection
    {
        return Review::with('user')
            ->where('product_id', $product->id)
            ->where('is_approved', true)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function submit(Product $product, int $userId, array $data): Review
    {
        $review = Review::updateOrCreate(
            [
                'product_id' => $product->id,
                'user_id' => $userId,
            ],
            [
                'rating' => $data['rating'],
                'comment' => $data['comment'],
                'is_approved' => true,
            ]
        );

        return $review->load('user');
    }

    public function adminPaginate(array $filters): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        return Review::query()
            ->with(['user', 'product'])
            ->when(
                isset($filters['product_id']) && $filters['product_id'] !== '',
                fn ($query) => $query->where('product_id', $filters['product_id'])
            )
            ->when(
                isset($filters['rating']) && $filters['rating'] !== '',
                fn ($query) => $query->where('rating', (int) $filters['rating'])
            )
            ->when(
                isset($filters['is_approved']) && $filters['is_approved'] !== '',
                fn ($query) => $query->where('is_approved', filter_var($filters['is_approved'], FILTER_VALIDATE_BOOL))
            )
            ->when(
                !empty($filters['search']),
                function ($query) use ($filters) {
                    $term = '%' . strtolower($filters['search']) . '%';
                    $query->where(function ($q) use ($term) {
                        $q->whereRaw('LOWER(comment) LIKE ?', [$term])
                            ->orWhereHas('user', fn ($uq) => $uq->whereRaw('LOWER(name) LIKE ?', [$term])->orWhereRaw('LOWER(email) LIKE ?', [$term]))
                            ->orWhereHas('product', fn ($pq) => $pq->whereRaw('LOWER(name) LIKE ?', [$term]));
                    });
                }
            )
            ->orderBy($filters['sortBy']['sort'] ?? 'created_at', $filters['sortBy']['order'] ?? 'desc')
            ->paginate($filters['limit'] ?? 10, ['*'], 'page', $filters['page'] ?? 1);
    }

    public function stats(): array
    {
        return [
            'total' => Review::count(),
            'approved' => Review::where('is_approved', true)->count(),
            'pending' => Review::where('is_approved', false)->count(),
            'avg_rating' => round((float) (Review::avg('rating') ?? 0), 1),
        ];
    }

    public function toggleApproval(Review $review): Review
    {
        $review->is_approved = !$review->is_approved;
        $review->save();

        return $review->load(['user', 'product']);
    }

    public function delete(Review $review): void
    {
        $review->delete();
    }
}