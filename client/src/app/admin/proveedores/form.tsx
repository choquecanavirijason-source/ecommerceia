"use client";

import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/presentation/molecules/Modal";
import { FormInput, FormTextarea, FormCheckbox } from "@/presentation/molecules/FormFields";
import { Supplier } from "@/domain/entities/Supplier";
import { useCreateSupplier, useUpdateSupplier } from "@/presentation/hooks/useSuppliers";
import { ApiError } from "@/infrastructure/http/client";

export const supplierSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre o razón social es obligatorio (mínimo 2 caracteres)")
    .max(150, "El nombre no puede exceder 150 caracteres"),
  code: z.string().trim().optional().or(z.literal("")),
  contactName: z.string().trim().optional().or(z.literal("")),
  email: z
    .string()
    .trim()
    .email("Ingresá un correo electrónico válido")
    .optional()
    .or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  address: z.string().trim().optional().or(z.literal("")),
  website: z
    .string()
    .trim()
    .url("Ingresá una URL válida (ej: https://proveedor.com)")
    .optional()
    .or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal("")),
  isActive: z.boolean(),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;

export interface SupplierFormProps {
  isOpen: boolean;
  onClose: () => void;
  supplier?: Supplier | null;
  onSuccess?: () => void;
}

const DEFAULT_VALUES: SupplierFormValues = {
  name: "",
  code: "",
  contactName: "",
  email: "",
  phone: "",
  address: "",
  website: "",
  notes: "",
  isActive: true,
};

export function SupplierForm({
  isOpen,
  onClose,
  supplier,
  onSuccess,
}: SupplierFormProps) {
  const [apiError, setApiError] = useState("");

  const methods = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();

  useEffect(() => {
    if (isOpen) {
      if (supplier) {
        methods.reset({
          name: supplier.name,
          code: supplier.code ?? "",
          contactName: supplier.contactName ?? "",
          email: supplier.email ?? "",
          phone: supplier.phone ?? "",
          address: supplier.address ?? "",
          website: supplier.website ?? "",
          notes: supplier.notes ?? "",
          isActive: supplier.isActive,
        });
      } else {
        methods.reset(DEFAULT_VALUES);
      }
      setApiError("");
    }
  }, [isOpen, supplier, methods]);

  const onSubmit = async (values: SupplierFormValues) => {
    setApiError("");
    try {
      if (supplier) {
        await updateMutation.mutateAsync({
          id: supplier.id,
          data: values,
        });
      } else {
        await createMutation.mutateAsync(values);
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : "Error al guardar proveedor.");
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={supplier ? "Editar Proveedor" : "Nuevo Proveedor"}
      subtitle="Ingresá los datos fiscales y de contacto del proveedor"
      maxWidth="lg"
      onSubmit={methods.handleSubmit(onSubmit)}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 text-xs font-bold text-white bg-[#FF6A00] hover:bg-[#e65f00] rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? "Guardando..." : "Guardar Proveedor"}
          </button>
        </>
      }
    >
      <FormProvider {...methods}>
        <div className="space-y-3.5">
          {apiError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {apiError}
            </div>
          )}

          <FormInput
            name="name"
            label="Nombre / Razón Social"
            placeholder="Ej: Bosch Herramientas"
            required
            autoFocus
          />

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              name="code"
              label="CUIT / Identificador"
              placeholder="30-12345678-9"
            />
            <FormInput
              name="contactName"
              label="Contacto Principal"
              placeholder="Juan Pérez"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              name="email"
              label="Email"
              type="email"
              placeholder="ventas@proveedor.com"
            />
            <FormInput
              name="phone"
              label="Teléfono"
              placeholder="+54 11 4000-0000"
            />
          </div>

          <FormInput
            name="website"
            label="Sitio Web"
            placeholder="https://proveedor.com"
          />

          <FormInput
            name="address"
            label="Dirección / Depósito"
            placeholder="Av. Libertador 1234, CABA"
          />

          <FormTextarea
            name="notes"
            label="Notas / Observaciones"
            placeholder="Información adicional, plazos de entrega, condiciones comerciales..."
            rows={2}
          />

          <FormCheckbox
            name="isActive"
            label="Proveedor Activo"
            description="Si está desactivado, no se podrá asociar a nuevos productos."
          />
        </div>
      </FormProvider>
    </Modal>
  );
}
