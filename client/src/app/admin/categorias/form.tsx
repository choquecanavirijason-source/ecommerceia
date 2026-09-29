"use client";

import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Plus } from "lucide-react";
import { Modal } from "@/presentation/molecules/Modal";
import { Button } from "@/presentation/atoms/button";
import { FormInput } from "@/presentation/molecules/FormFields";
import { useAdminCategories } from "@/presentation/hooks/useAdminCategories";
import { ApiError } from "@/infrastructure/http/client";
import { CATEGORY_ICON_OPTIONS } from "@/shared/lib/categoryIcons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder los 100 caracteres"),
  icon: z.string().min(1, "Seleccioná un icono"),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

export interface CategoryModalData {
  id: number;
  name: string;
  iconName?: string;
}

export interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  category?: CategoryModalData | null;
  onSuccess?: () => void;
}

export function CategoryForm({
  isOpen,
  onClose,
  category,
  onSuccess,
}: CategoryFormProps) {
  const [apiError, setApiError] = useState("");

  const methods = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      icon: "box",
    },
  });

  const { create, isCreating, update, isUpdating } = useAdminCategories({
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    if (isOpen) {
      methods.reset({
        name: category?.name ?? "",
        icon: category?.iconName ?? "box",
      });
      setApiError("");
    }
  }, [isOpen, category, methods]);

  const onSubmit = async (values: CategoryFormValues) => {
    setApiError("");
    try {
      if (category?.id) {
        await update({ id: category.id, name: values.name, icon: values.icon });
      } else {
        await create({ name: values.name, icon: values.icon });
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : "No se pudo guardar la categoría.");
    }
  };

  const isSaving = isCreating || isUpdating;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? "Editar Categoría" : "Nueva Categoría"}
      subtitle="Completá el nombre de la categoría para organizarla en el catálogo"
      maxWidth="lg"
      onSubmit={methods.handleSubmit(onSubmit)}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              "Guardando…"
            ) : category ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Guardar cambios
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-1.5" /> Crear categoría
              </>
            )}
          </Button>
        </>
      }
    >
      <FormProvider {...methods}>
        <div className="space-y-4">
          <FormInput
            name="name"
            label="Nombre de la categoría"
            placeholder="Ej. Herramientas, Jardinería, Climatización"
            required
            autoFocus
          />

          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Icono</p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
              {CATEGORY_ICON_OPTIONS.map((option) => {
                const selected = methods.watch("icon") === option.name;

                return (
                  <button
                    key={option.name}
                    type="button"
                    aria-label={`Seleccionar icono ${option.label}`}
                    aria-pressed={selected}
                    onClick={() => methods.setValue("icon", option.name, { shouldValidate: true })}
                    className={`flex h-14 flex-col items-center justify-center gap-1 rounded-xl border text-muted-foreground transition-colors hover:bg-muted ${
                      selected ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20" : "border-border"
                    }`}
                  >
                    <FontAwesomeIcon icon={option.icon} className="h-5 w-5" />
                    <span className="text-[10px] leading-none">{option.label}</span>
                  </button>
                );
              })}
            </div>
            {methods.formState.errors.icon && <p className="mt-1 text-xs text-destructive">{methods.formState.errors.icon.message}</p>}
          </div>

          {apiError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {apiError}
            </div>
          )}
        </div>
      </FormProvider>
    </Modal>
  );
}
