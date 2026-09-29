<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;
use App\Models\Post;
use App\Support\AdminTableSort;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class PostController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $limit = (int) $request->input('limit', 10);
        $category = $request->input('category');

        $query = Post::query()
            ->published()
            ->filterByCategory($category)
            ->orderBy('published_at', 'desc')
            ->orderBy('id', 'desc');

        if ($request->has('all') && filter_var($request->input('all'), FILTER_VALIDATE_BOOL)) {
            $posts = $query->get();
            return PostResource::collection($posts)->response();
        }

        $posts = $query->paginate($limit);
        return PostResource::collection($posts)->response();
    }

    public function show($slug): JsonResponse
    {
        $post = Post::query()
            ->published()
            ->where(is_numeric($slug) ? 'id' : 'slug', $slug)
            ->first();

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Artículo no encontrado',
            ], Response::HTTP_NOT_FOUND);
        }

        return (new PostResource($post))
            ->additional(['success' => true])
            ->response()
            ->setStatusCode(Response::HTTP_OK);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:posts,slug',
            'category' => 'required|string|max:255',
            'category_color' => 'nullable|string|max:50',
            'tag_bg' => 'nullable|string|max:255',
            'excerpt' => 'required|string',
            'content' => 'required|string',
            'image' => 'nullable|string|max:500',
            'read_time' => 'nullable|string|max:100',
            'icon' => 'nullable|string|max:100',
            'banner_gradient' => 'nullable|string|max:255',
            'is_published' => 'nullable|boolean',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        $post = Post::create($validated);

        return (new PostResource($post))
            ->additional([
                'success' => true,
                'message' => 'Artículo creado exitosamente',
            ])
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function update(Request $request, Post $post): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|nullable|string|max:255|unique:posts,slug,' . $post->id,
            'category' => 'sometimes|required|string|max:255',
            'category_color' => 'nullable|string|max:50',
            'tag_bg' => 'nullable|string|max:255',
            'excerpt' => 'sometimes|required|string',
            'content' => 'sometimes|required|string',
            'image' => 'nullable|string|max:500',
            'read_time' => 'nullable|string|max:100',
            'icon' => 'nullable|string|max:100',
            'banner_gradient' => 'nullable|string|max:255',
            'is_published' => 'nullable|boolean',
        ]);

        $post->update($validated);

        return (new PostResource($post->fresh()))
            ->additional([
                'success' => true,
                'message' => 'Artículo actualizado exitosamente',
            ])
            ->response()
            ->setStatusCode(Response::HTTP_OK);
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $limit = (int) $request->input('limit', 10);
        $search = $request->input('search');
        $category = $request->input('category');

        $query = Post::query()
            ->when($search, function ($q, $s) {
                $q->where(function ($sub) use ($s) {
                    $sub->where('title', 'like', "%{$s}%")
                        ->orWhere('excerpt', 'like', "%{$s}%");
                });
            })
            ->when($category, fn ($q, $c) => $q->where('category', $c));

        AdminTableSort::apply($query, $request->all(), [
            'id' => 'id',
            'title' => 'title',
            'category' => 'category',
            'is_published' => 'is_published',
            'published_at' => fn (Builder $query, string $direction) => $query
                ->orderByRaw('published_at IS NULL')
                ->orderBy('published_at', $direction),
            'read_time' => function (Builder $query, string $direction) {
                // PostgreSQL: interpreta "4", "4 min" o "4 min de lectura" como minutos.
                // Los textos sin una duración reconocible quedan al final en ambos sentidos.
                $minutes = "CAST(SUBSTRING(LOWER(TRIM(read_time)) FROM '^([0-9]+)([[:space:]]+min([[:space:]]+de[[:space:]]+lectura)?)?$') AS NUMERIC)";
                $query->orderByRaw("{$minutes} {$direction} NULLS LAST");
            },
        ]);

        $posts = $query->paginate($limit);

        return PostResource::collection($posts)->response();
    }

    public function adminShow(Post $post): JsonResponse
    {
        return (new PostResource($post))
            ->additional(['success' => true])
            ->response()
            ->setStatusCode(Response::HTTP_OK);
    }

    public function togglePublish(Post $post): JsonResponse
    {
        $newStatus = !$post->is_published;
        $post->update([
            'is_published' => $newStatus,
            'published_at' => $newStatus && !$post->published_at ? now() : $post->published_at,
        ]);

        return (new PostResource($post->fresh()))
            ->additional([
                'success' => true,
                'message' => $newStatus ? 'Artículo publicado' : 'Artículo cambiado a borrador',
            ])
            ->response()
            ->setStatusCode(Response::HTTP_OK);
    }

    public function destroy(Post $post): JsonResponse
    {
        $post->delete();

        return response()->json([
            'success' => true,
            'message' => 'Artículo eliminado exitosamente',
        ], Response::HTTP_OK);
    }
}
