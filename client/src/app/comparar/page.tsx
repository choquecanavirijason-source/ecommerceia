"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Check, 
  GitCompare, 
  Minus, 
  ShoppingCart, 
  Star, 
  Trash2, 
  X 
} from "lucide-react";
import { StorefrontTemplate } from "@/presentation/templates/StorefrontTemplate";
import { useCompareStore } from "@/infrastructure/state/compareStore";
import { useCart } from "@/presentation/hooks/useCart";
import { useHasMounted } from "@/presentation/hooks/useHasMounted";
import { formatPrice } from "@/shared/lib/format";
import { StarRating } from "@/presentation/molecules/StarRating";
import { apiRequest } from "@/infrastructure/http/client";
import type { Product } from "@/domain/entities/Product";

export default function ComparePage() {
  const mounted = useHasMounted();
  const { items, removeFromCompare, clearCompare } = useCompareStore();
  const { addToCart } = useCart();
  const [highlightDiffs, setHighlightDiffs] = useState(false);
  const [detailedProducts, setDetailedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Sync / fetch fresh comparison details from backend if IDs available
  useEffect(() => {
    if (!mounted || items.length === 0) {
      setDetailedProducts([]);
      return;
    }

    const ids = items.map((i) => i.id).join(",");
    setLoading(true);

    apiRequest<{ data: any[] }>(`/products/compare?ids=${ids}`)
      .then((res) => {
        if (res?.data && res.data.length > 0) {
          // Map backend items to product shape
          const mapped: Product[] = res.data.map((p) => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            price: p.price,
            originalPrice: p.original_price ?? undefined,
            rating: p.rating,
            reviews: p.reviews_count,
            image: p.image ?? "",
            images: p.images ?? [],
            category: p.category ?? "",
            categoryId: p.category_id,
            badge: p.tag ?? undefined,
            weight: p.weight ?? undefined,
            inStock: p.in_stock,
            stock: p.stock,
            isActive: p.is_active,
            sku: p.sku ?? undefined,
            warranty: p.warranty ?? undefined,
            supplierId: p.supplier_id,
            supplierName: p.supplier_name,
            description: p.description ?? undefined,
          }));
          setDetailedProducts(mapped);
        } else {
          setDetailedProducts(items);
        }
      })
      .catch(() => {
        // Fallback to local store products
        setDetailedProducts(items);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [mounted, items]);

  if (!mounted) {
    return (
      <StorefrontTemplate>
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
          Cargando comparador...
        </div>
      </StorefrontTemplate>
    );
  }

  const productsToRender = detailedProducts.length > 0 ? detailedProducts : items;

  if (productsToRender.length === 0) {
    return (
      <StorefrontTemplate>
        <div className="container mx-auto px-4 py-20 text-center max-w-md">
          <div className="w-16 h-16 bg-orange-100 text-[#FF6A00] rounded-3xl flex items-center justify-center mx-auto mb-6">
            <GitCompare className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2 font-heading">
            No tenés productos para comparar
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Navegá por nuestra tienda y hacé clic en el botón de comparar en los productos que quieras cotejar frente a frente.
          </p>
          <Link
            href="/productos"
            className="inline-flex items-center justify-center gap-2 bg-[#FF6A00] hover:bg-[#e65f00] text-white px-6 py-3 rounded-full font-bold text-sm shadow-md transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Explorar catálogo
          </Link>
        </div>
      </StorefrontTemplate>
    );
  }

  // Row definition helper for table
  const rows = [
    {
      label: "Categoría",
      getValue: (p: Product) => p.category || "—",
    },
    {
      label: "Precio",
      getValue: (p: Product) => formatPrice(p.price),
    },
    {
      label: "Disponibilidad",
      getValue: (p: Product) => (p.inStock ? "En Stock" : "Sin Stock"),
      render: (p: Product) => (
        <span className={p.inStock ? "text-emerald-600 font-bold" : "text-rose-500 font-medium"}>
          {p.inStock ? "En stock (" + (p.stock ?? "disponible") + ")" : "Agotado"}
        </span>
      ),
    },
    {
      label: "Calificación",
      getValue: (p: Product) => `${p.rating} (${p.reviews})`,
      render: (p: Product) => (
        <div className="flex items-center gap-1.5 justify-center sm:justify-start">
          <StarRating rating={p.rating} small />
          <span className="text-xs text-muted-foreground">({p.reviews})</span>
        </div>
      ),
    },
    {
      label: "Proveedor / Marca",
      getValue: (p: Product) => p.supplierName || "—",
      render: (p: Product) => (
        <span className="inline-block bg-secondary px-2.5 py-1 rounded-md text-xs font-semibold text-foreground">
          {p.supplierName || "UNO COMPRAS"}
        </span>
      ),
    },
    {
      label: "SKU",
      getValue: (p: Product) => p.sku || "—",
    },
    {
      label: "Garantía",
      getValue: (p: Product) => p.warranty || "—",
    },
    {
      label: "Peso",
      getValue: (p: Product) => p.weight || "—",
    },
    {
      label: "Descripción breve",
      getValue: (p: Product) => p.description || "—",
      render: (p: Product) => (
        <p className="text-xs text-muted-foreground line-clamp-3 text-left">
          {p.description || "Sin descripción disponible"}
        </p>
      ),
    },
  ];

  return (
    <StorefrontTemplate>
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-7xl">
        {/* Header Breadcrumb & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Volver al catálogo
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-heading">
              Comparativa de Productos
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Comparando {productsToRender.length} de 4 productos lado a lado
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setHighlightDiffs(!highlightDiffs)}
              className={`text-xs font-bold px-3.5 py-2 rounded-xl border transition-all ${
                highlightDiffs
                  ? "bg-[#FF6A00]/10 border-[#FF6A00] text-[#FF6A00]"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {highlightDiffs ? "✓ Resaltando diferencias" : "Resaltar diferencias"}
            </button>

            <button
              type="button"
              onClick={clearCompare}
              className="text-xs font-bold px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Limpiar todo
            </button>
          </div>
        </div>

        {/* Comparison Matrix Table */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="p-4 sm:p-6 text-left font-bold text-xs uppercase tracking-wider text-muted-foreground w-48 min-w-[160px]">
                    Producto
                  </th>
                  {productsToRender.map((prod) => (
                    <th
                      key={prod.id}
                      className="p-4 sm:p-6 text-left min-w-[240px] max-w-[280px] align-top relative"
                    >
                      <button
                        type="button"
                        onClick={() => removeFromCompare(prod.id)}
                        className="absolute top-4 right-4 w-7 h-7 rounded-full bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors"
                        title="Quitar"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <div className="w-full h-36 rounded-2xl overflow-hidden bg-gray-100 mb-3 border border-gray-100">
                        {prod.image ? (
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                            Sin imagen
                          </div>
                        )}
                      </div>

                      <h3 className="font-bold text-sm text-gray-900 leading-snug line-clamp-2 min-h-[2.5rem] mb-2">
                        {prod.name}
                      </h3>

                      <div className="text-lg font-black text-primary mb-3">
                        {formatPrice(prod.price)}
                      </div>

                      <button
                        type="button"
                        onClick={() => addToCart(prod)}
                        className="w-full py-2 px-3 rounded-xl bg-[#FF6A00] hover:bg-[#e65f00] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Sumar al carrito
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-sm">
                {rows.map((row, rowIdx) => {
                  const values = productsToRender.map((p) => row.getValue(p));
                  const isDifferent = new Set(values).size > 1;
                  const rowBg = highlightDiffs && isDifferent ? "bg-amber-50/50" : "";

                  return (
                    <tr key={rowIdx} className={`hover:bg-gray-50/50 transition-colors ${rowBg}`}>
                      <td className="p-4 sm:p-5 font-bold text-xs text-gray-500 uppercase tracking-wider bg-gray-50/30">
                        {row.label}
                        {highlightDiffs && isDifferent && (
                          <span className="block text-[10px] text-amber-600 font-normal mt-0.5 lowercase">
                            difiere
                          </span>
                        )}
                      </td>
                      {productsToRender.map((prod) => (
                        <td key={prod.id} className="p-4 sm:p-5 text-gray-700">
                          {row.render ? row.render(prod) : row.getValue(prod)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </StorefrontTemplate>
  );
}
