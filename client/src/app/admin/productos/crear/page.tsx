"use client";

import { ProductForm } from "@/presentation/organisms/ProductForm";

export default function AdminCreateProductPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Panel administrador
        </p>
        <h1 className="mt-2 text-3xl font-black text-foreground">Nuevo producto</h1>
        <p className="text-sm text-muted-foreground">
          Completá los datos para publicar un producto en el marketplace
        </p>
      </div>

      <ProductForm />
    </div>
  );
}