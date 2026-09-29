<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Http\Resources\SupplierResource;
use App\Models\Supplier;
use App\Services\SupplierService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class SupplierController extends Controller
{
    public function __construct(private readonly SupplierService $supplierService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $suppliers = $this->supplierService->paginate($request->all());

        return SupplierResource::collection($suppliers)->response();
    }

    public function all(): JsonResponse
    {
        $suppliers = $this->supplierService->allActive();

        return response()->json([
            'success' => true,
            'data' => SupplierResource::collection($suppliers),
        ]);
    }

    public function show(Supplier $supplier): JsonResponse
    {
        return (new SupplierResource($supplier->loadCount('products')))
            ->additional(['success' => true])
            ->response();
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50'],
            'contact_name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:255'],
            'website' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $supplier = $this->supplierService->create($data);

        return (new SupplierResource($supplier))
            ->additional([
                'success' => true,
                'message' => 'Proveedor creado satisfactoriamente',
            ])
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function update(Request $request, Supplier $supplier): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50'],
            'contact_name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:255'],
            'website' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $supplier = $this->supplierService->update($supplier, $data);

        return (new SupplierResource($supplier))
            ->additional([
                'success' => true,
                'message' => 'Proveedor actualizado satisfactoriamente',
            ])
            ->response()
            ->setStatusCode(Response::HTTP_OK);
    }

    public function toggleActive(Supplier $supplier): JsonResponse
    {
        $supplier = $this->supplierService->toggleActive($supplier);

        return (new SupplierResource($supplier))
            ->additional([
                'success' => true,
                'message' => 'Estado del proveedor actualizado',
            ])
            ->response()
            ->setStatusCode(Response::HTTP_OK);
    }

    public function destroy(Supplier $supplier): JsonResponse
    {
        $this->supplierService->delete($supplier);

        return response()->json([
            'success' => true,
            'message' => 'Proveedor eliminado satisfactoriamente',
        ], Response::HTTP_OK);
    }
}
