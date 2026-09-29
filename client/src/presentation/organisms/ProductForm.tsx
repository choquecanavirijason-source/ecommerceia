"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/presentation/atoms/button";
import {
  FormInput,
  FormSelect,
  FormTextarea,
  FormCheckbox,
} from "@/presentation/molecules/FormFields";
import { ImageDropzone } from "@/presentation/molecules/ImageDropzone";
import { useCategories } from "@/presentation/hooks/useCatalog";
import { useActiveSuppliers } from "@/presentation/hooks/useSuppliers";
import { apiRequest, ApiError } from "@/infrastructure/http/client";
import { cn } from "@/shared/lib/utils";
import type { Product } from "@/domain/entities/Product";

const defaultImage =
  "https://images.unsplash.com/photo-1581147036324-c17ac5b5df98?w=600&h=600&fit=crop&auto=format";

function toDatetimeLocal(iso?: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  } catch {
    return "";
  }
}

export const productSchema = z.object({
  name: z.string().trim().min(2, "El nombre del producto debe tener al menos 2 caracteres"),
  categoryId: z.string().min(1, "Debes seleccionar una categoría"),
  supplierId: z.string().optional().or(z.literal("")),
  price: z.number().positive("El precio debe ser mayor a 0"),
  originalPrice: z.number().positive("El precio anterior debe ser mayor a 0").optional().or(z.nan()),
  sku: z.string().trim().optional().or(z.literal("")),
  image: z.string().trim().min(1, "La URL de la imagen principal es requerida"),
  galleryImages: z.string().optional().or(z.literal("")),
  weight: z.string().trim().optional().or(z.literal("")),
  stock: z
    .number()
    .int("El stock debe ser un número entero")
    .min(0, "El stock no puede ser negativo"),
  badge: z.string().trim().optional().or(z.literal("")),
  warranty: z.string().trim().optional().or(z.literal("")),
  tags: z.string().trim().optional().or(z.literal("")),
  description: z.string().trim().min(5, "La descripción breve debe tener al menos 5 caracteres"),
  longDescription: z.string().trim().optional().or(z.literal("")),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  isFlashDeal: z.boolean(),
  flashDealStartsAt: z.string().optional().or(z.literal("")),
  flashDealEndsAt: z.string().optional().or(z.literal("")),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export interface ProductFormProps {
  product?: Product | null;
  isEditing?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
  isModal?: boolean;
}

function getProductDefaultValues(product?: Product | null): ProductFormValues {
  return {
    name: product?.name ?? "",
    categoryId: product?.categoryId ? String(product.categoryId) : "",
    supplierId: product?.supplierId ? String(product.supplierId) : "",
    price: product?.price ?? ("" as unknown as number),
    originalPrice: product?.originalPrice ?? undefined,
    sku: product?.sku ?? "",
    image: product?.image || defaultImage,
    galleryImages:
      product?.images && product.images.length > 1 ? product.images.slice(1).join("\n") : "",
    weight: product?.weight ?? "1.0kg",
    stock: product?.stock !== undefined ? product.stock : 25,
    badge: product?.badge ?? "Nuevo",
    warranty: product?.warranty ?? "12 meses de garantía",
    tags: product?.tags ? product.tags.join(", ") : "",
    description: product?.description ?? "",
    longDescription: product?.longDescription ?? "",
    isActive: product?.isActive ?? true,
    isFeatured: product?.isFeatured ?? false,
    isFlashDeal: product?.isFlashDeal ?? false,
    flashDealStartsAt: toDatetimeLocal(product?.flashDealStartsAt),
    flashDealEndsAt: toDatetimeLocal(product?.flashDealEndsAt),
  };
}

export function ProductForm({
  product,
  isEditing = false,
  onSuccess,
  onCancel,
  isModal = false,
}: ProductFormProps) {
  const router = useRouter();
  const { data: categories } = useCategories();
  const { data: suppliers } = useActiveSuppliers();

  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const methods = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: getProductDefaultValues(product),
  });

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting: formIsSubmitting },
  } = methods;

  useEffect(() => {
    if (product) {
      reset(getProductDefaultValues(product));
    }
    setImageFiles([]);
  }, [product, reset]);

  const categoryOptions = useMemo(() => {
    return (categories ?? []).map((c) => ({
      label: c.name,
      value: String(c.id),
    }));
  }, [categories]);

  const supplierOptions = useMemo(() => {
    return (suppliers ?? []).map((s) => ({
      label: `${s.name}${s.code ? ` (${s.code})` : ""}`,
      value: String(s.id),
    }));
  }, [suppliers]);

  const currentBadge = watch("badge");
  const isFlashDeal = watch("isFlashDeal");
  const currentImage = watch("image");
  const currentGalleryImages = watch("galleryImages") ?? "";

  const onSubmit = async (values: ProductFormValues) => {
    setServerError("");
    setIsSubmitting(true);

    const extraUrls = values.galleryImages
      ? values.galleryImages
          .split(/[\n,]+/)
          .map((u) => u.trim())
          .filter(
            (u) =>
              u.length > 0 &&
              (u.startsWith("http://") || u.startsWith("https://") || u.startsWith("/"))
          )
      : [];

    const imagesPayload = [
      { url: values.image.trim() || defaultImage, alt: values.name.trim() },
      ...extraUrls.map((url) => ({ url, alt: values.name.trim() })),
    ];

    const tagsPayload = values.tags
      ? values.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : null;

    const payload = {
      name: values.name.trim(),
      category_id: Number(values.categoryId),
      supplier_id: values.supplierId ? Number(values.supplierId) : null,
      price: String(values.price),
      original_price:
        values.originalPrice && !Number.isNaN(values.originalPrice)
          ? String(values.originalPrice)
          : null,
      tag: values.badge?.trim() || null,
      sku: values.sku?.trim() || null,
      stock: Number(values.stock) || 0,
      weight: values.weight?.trim() || null,
      warranty: values.warranty?.trim() || null,
      is_active: values.isActive,
      is_featured: values.isFeatured,
      is_flash_deal: values.isFlashDeal,
      flash_deal_starts_at:
        values.isFlashDeal && values.flashDealStartsAt
          ? new Date(values.flashDealStartsAt).toISOString()
          : null,
      flash_deal_ends_at:
        values.isFlashDeal && values.flashDealEndsAt
          ? new Date(values.flashDealEndsAt).toISOString()
          : null,
      description:
        values.description.trim() ||
        (isEditing
          ? "Producto actualizado desde el panel administrativo."
          : "Producto agregado desde el panel administrativo."),
      long_description: values.longDescription?.trim() || null,
      tags: tagsPayload,
      images: imagesPayload,
    };

    let requestBody: unknown = payload;
    let requestMethod: "POST" | "PUT" = isEditing ? "PUT" : "POST";

    if (imageFiles.length > 0) {
      const formData = new FormData();
      const scalarPayload = payload as Record<string, unknown>;

      Object.entries(scalarPayload).forEach(([key, value]) => {
        if (key === "images" || key === "tags" || value === null || value === undefined) return;
        formData.append(key, typeof value === "boolean" ? (value ? "1" : "0") : String(value));
      });

      if (Array.isArray(scalarPayload.tags)) {
        scalarPayload.tags.forEach((tag) => formData.append("tags[]", String(tag)));
      }

      extraUrls.forEach((url) => formData.append("image_urls[]", url));
      imageFiles.forEach((file) => formData.append("images[]", file));

      if (isEditing) {
        formData.append("_method", "PUT");
        requestMethod = "POST";
      }

      requestBody = formData;
    }

    try {
      if (isEditing && product) {
        await apiRequest(`/products/${product.id}`, {
          method: requestMethod,
          auth: true,
          body: requestBody,
        });
      } else {
        await apiRequest("/products", {
          method: requestMethod,
          auth: true,
          body: requestBody,
        });
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/productos");
      }
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        const messages = Object.values(err.errors).flat();
        setServerError(messages.join(" "));
      } else {
        setServerError(err instanceof ApiError ? err.message : "No se pudo guardar el producto.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBusy = isSubmitting || formIsSubmitting;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={
          isModal
            ? "flex flex-col flex-1 min-h-0"
            : "space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
        }
      >
        <div className={isModal ? "flex-1 overflow-y-auto p-6 space-y-4" : "space-y-4"}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormInput
              name="name"
              label="Nombre del producto"
              placeholder="Ej. Taladro profesional 750W"
              required
              containerClassName="md:col-span-2"
            />

            <FormSelect
              name="categoryId"
              label="Categoría"
              options={categoryOptions}
              placeholder="Seleccioná una categoría…"
              required
            />

            <FormSelect
              name="supplierId"
              label="Proveedor / Fabricante"
              options={supplierOptions}
              placeholder="Ninguno / Proveedor Propio"
            />

            <FormInput name="sku" label="SKU" placeholder="MKT-001" />

            <FormInput
              name="price"
              label="Precio"
              type="number"
              step="0.01"
              min="0"
              placeholder="199.99"
              required
            />

            <FormInput
              name="originalPrice"
              label="Precio anterior (para descuento)"
              type="number"
              step="0.01"
              min="0"
              placeholder="249.99"
              description="Si es mayor al precio actual, el sistema mostrará el precio tachado y la insignia de descuento (ej: -20%)."
            />

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-gray-700 block">
                Imagen principal
              </label>
              <FormInput
                name="image"
                label="URL de imagen (opcional si subís un archivo)"
                placeholder="https://..."
                required={imageFiles.length === 0}
              />
              <ImageDropzone
                multiple
                values={imageFiles}
                existingUrls={[currentImage, ...currentGalleryImages.split(/[\n,]+/).map((url) => url.trim()).filter(Boolean)].filter(Boolean)}
                onChange={() => undefined}
                onFilesChange={setImageFiles}
              />
              <p className="text-xs text-muted-foreground">
                Podés usar una URL o subir un archivo. La imagen se guarda en el storage del servidor.
              </p>
            </div>

            <FormInput name="weight" label="Peso" placeholder="2.5kg" />

            <FormInput name="stock" label="Stock" type="number" min="0" placeholder="25" />

            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700 block">Etiqueta / Badge</label>
                <span className="text-[11px] text-[#00a6a0] font-semibold">
                  Configura Ofertas Flash
                </span>
              </div>
              <FormInput name="badge" placeholder="Ej: Oferta, Nuevo, Destacado" />
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-xs text-muted-foreground mr-1">Sugerencias rápidas:</span>
                {["Oferta", "Nuevo", "Destacado", "Recomendado"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() =>
                      setValue("badge", preset, { shouldValidate: true, shouldDirty: true })
                    }
                    className={cn(
                      "text-xs px-3 py-1 rounded-full border transition-all",
                      currentBadge === preset
                        ? "bg-[#FF6A00] text-white border-[#FF6A00] font-medium"
                        : "bg-secondary text-secondary-foreground border-border hover:border-[#18D6D1]"
                    )}
                  >
                    + {preset}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground pt-1">
                💡 <strong>Ofertas Flash:</strong> Si asignás la etiqueta <strong>Oferta</strong> o{" "}
                <strong>Nuevo</strong>, este producto se mostrará automáticamente en la sección{" "}
                <strong>Ofertas Flash</strong> del Home y en la página <strong>/ofertas</strong>.
              </p>
            </div>

            <FormInput
              name="warranty"
              label="Garantía"
              placeholder="12 meses de garantía"
            />

            <FormInput
              name="tags"
              label="Palabras clave / Tags (opcional)"
              placeholder="ej: taladro, herramientas, percutor"
            />

            <FormTextarea
              name="description"
              label="Descripción breve"
              rows={3}
              placeholder="Describe brevemente las características principales del producto..."
              required
              containerClassName="md:col-span-2"
            />

            <FormTextarea
              name="longDescription"
              label="Descripción detallada / Ficha técnica (opcional)"
              rows={4}
              placeholder="Especificaciones técnicas completas, medidas, potencia, materiales..."
              containerClassName="md:col-span-2"
            />
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Configuración de visibilidad y secciones
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormCheckbox name="isActive" label="Producto activo (en tienda)" />
              <FormCheckbox name="isFeatured" label="⭐ Destacado (Home)" />
              <FormCheckbox name="isFlashDeal" label="⚡ Oferta Flash" />
            </div>

            {isFlashDeal && (
              <div className="pt-3 border-t border-border/80 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FF6A00]/5 rounded-xl p-3.5 border border-[#FF6A00]/20">
                <FormInput
                  name="flashDealStartsAt"
                  label="Inicio de Oferta Flash (opcional)"
                  type="datetime-local"
                />
                <FormInput
                  name="flashDealEndsAt"
                  label="Fin de Oferta Flash (opcional)"
                  type="datetime-local"
                />
                <p className="sm:col-span-2 text-[11px] text-muted-foreground">
                  💡 El temporizador de la tienda calculará automáticamente el tiempo restante hasta
                  la fecha de fin programada.
                </p>
              </div>
            )}
          </div>

          {serverError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {serverError}
            </div>
          )}
        </div>

        <div
          className={
            isModal
              ? "p-4 sm:px-6 border-t border-border bg-gray-50/80 shrink-0 flex items-center justify-end gap-3"
              : "flex gap-3"
          }
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (onCancel) {
                onCancel();
              } else {
                router.push("/admin/productos");
              }
            }}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isBusy}>
            {isBusy
              ? "Guardando…"
              : isEditing
              ? "Guardar cambios"
              : "Agregar producto al marketplace"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}