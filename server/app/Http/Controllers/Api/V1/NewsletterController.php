<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
use App\Support\AdminTableSort;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class NewsletterController extends Controller
{
    public function subscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255',
        ]);

        $subscriber = NewsletterSubscriber::firstOrCreate(
            ['email' => strtolower(trim($validated['email']))],
            ['is_active' => true]
        );

        if (!$subscriber->is_active) {
            $subscriber->update(['is_active' => true]);
        }

        return response()->json([
            'success' => true,
            'message' => '¡Te sumaste a la comunidad! Revisá tu correo para tu cupón de bienvenida.',
            'data' => [
                'email' => $subscriber->email,
            ],
        ], Response::HTTP_CREATED);
    }

    public function index(Request $request): JsonResponse
    {
        $limit = (int) $request->input('limit', 15);
        $search = $request->input('search');

        $query = NewsletterSubscriber::query()
            ->when($search, fn ($q, $s) => $q->where('email', 'like', "%{$s}%"));

        AdminTableSort::apply($query, $request->all(), [
            'id' => 'id',
            'email' => 'email',
            'created_at' => 'created_at',
            'is_active' => 'is_active',
        ]);

        $subscribers = $query->paginate($limit);

        return response()->json($subscribers);
    }

    public function toggleActive(NewsletterSubscriber $subscriber): JsonResponse
    {
        $subscriber->update(['is_active' => !$subscriber->is_active]);

        return response()->json([
            'success' => true,
            'message' => 'Estado del suscriptor actualizado',
            'data' => $subscriber->fresh(),
        ]);
    }

    public function destroy(NewsletterSubscriber $subscriber): JsonResponse
    {
        $subscriber->delete();

        return response()->json([
            'success' => true,
            'message' => 'Suscriptor eliminado exitosamente',
        ]);
    }
}
