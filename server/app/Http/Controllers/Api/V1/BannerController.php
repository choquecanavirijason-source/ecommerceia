<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

use App\Models\Banner;
use Illuminate\Http\JsonResponse;

class BannerController extends Controller
{
    /**
     * List active hero banners for public storefront.
     */
    public function hero(): JsonResponse
    {
        $banners = Banner::active()
            ->where('position', 'hero')
            ->ordered()
            ->get();

        return response()->json(['data' => $banners]);
    }

    /**
     * Admin: List all banners.
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $query = Banner::query();

        if ($request->filled('position')) {
            $query->where('position', $request->position);
        }

        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $banners = $query->ordered()->get();

        return response()->json(['data' => $banners]);
    }

    /**
     * Admin: Store a new banner.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $this->validateBanner($request);

        if ($request->hasFile('image')) {
            $validated['image'] = asset(Storage::url($request->file('image')->store('banners', 'public')));
        }

        $banner = Banner::create([
            'title' => $validated['title'],
            'subtitle' => $validated['subtitle'] ?? null,
            'desc' => $validated['desc'] ?? null,
            'cta' => $validated['cta'] ?? 'Comprá ahora',
            'link_url' => $validated['link_url'] ?? '/categorias',
            'bg' => $validated['bg'] ?? 'from-orange-50 via-white to-amber-50',
            'accent' => $validated['accent'] ?? '#FF6A00',
            'image' => $validated['image'],
            'position' => $validated['position'] ?? 'hero',
            'order' => $validated['order'] ?? 0,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json(['data' => $banner, 'message' => 'Banner creado exitosamente.'], 201);
    }

    private function validateBanner(Request $request): array
    {
        $rules = [
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'desc' => 'nullable|string',
            'cta' => 'nullable|string|max:100',
            'link_url' => 'nullable|string|max:255',
            'bg' => 'nullable|string|max:255',
            'accent' => 'nullable|string|max:50',
            'position' => 'nullable|string|in:hero,side_1,side_2,promo',
            'order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ];

        $rules['image'] = $request->hasFile('image')
            ? 'required|image|mimes:jpeg,png,jpg,webp|max:5120'
            : 'required|string|max:1000';

        return $request->validate($rules);
    }

    /**
     * Admin: Update a banner.
     */
    public function update(Request $request, Banner $banner): JsonResponse
    {
        $validated = $this->validateBanner($request);

        if ($request->hasFile('image')) {
            $this->deleteStoredImage($banner->image);
            $validated['image'] = asset(Storage::url($request->file('image')->store('banners', 'public')));
        }

        $banner->update($validated);

        return response()->json(['data' => $banner, 'message' => 'Banner actualizado exitosamente.']);
    }

    private function deleteStoredImage(?string $url): void
    {
        if (!$url || !str_contains($url, '/storage/')) {
            return;
        }

        $path = Str::after($url, '/storage/');
        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    /**
     * Admin: Toggle active state.
     */
    public function toggleActive(Banner $banner): JsonResponse
    {
        $banner->update(['is_active' => !$banner->is_active]);

        return response()->json(['data' => $banner, 'message' => 'Estado del banner actualizado.']);
    }

    /**
     * Admin: Delete a banner.
     */
    public function destroy(Banner $banner): JsonResponse
    {
        $banner->delete();

        return response()->json(['message' => 'Banner eliminado exitosamente.']);
    }
}
