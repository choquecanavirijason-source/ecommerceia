"use client";

import { Modal } from "@/presentation/molecules/Modal";
import { ProductForm } from "@/presentation/organisms/ProductForm";
import { Product } from "@/domain/entities/Product";

export interface ProductModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  isLoading?: boolean;
  onSuccess?: () => void;
}

export function ProductFormModal({
  isOpen,
  onClose,
  product,
  isLoading = false,
  onSuccess,
}: ProductModalFormProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            {product ? "Editar producto" : "Nuevo producto"}
          </p>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 font-heading mt-1">
            {product ? "Modificar datos del producto" : "Crear nuevo producto"}
          </h2>
        </div>
      }
      subtitle={
        product
          ? "Actualizá el precio, stock, especificaciones y fotos del producto."
          : "Completá los datos para publicar un nuevo producto en el catálogo."
      }
      maxWidth="4xl"
      rawContent
    >
      {isLoading ? (
        <div className="py-24 text-center text-sm text-muted-foreground">
          Cargando datos del producto…
        </div>
      ) : (
        <ProductForm
          product={product}
          isEditing={Boolean(product)}
          isModal
          onSuccess={() => {
            if (onSuccess) onSuccess();
            onClose();
          }}
          onCancel={onClose}
        />
      )}
    </Modal>
  );
}
