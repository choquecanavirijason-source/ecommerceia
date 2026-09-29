"use client";

import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/presentation/molecules/Modal";
import { FormInput, FormTextarea, FormCheckbox } from "@/presentation/molecules/FormFields";
import { ImageDropzone } from "@/presentation/molecules/ImageDropzone";
import { 
  useCreateBanner, 
  useUpdateBanner, 
  type BannerData 
} from "@/presentation/hooks/useAdminBanners";
import { ApiError } from "@/infrastructure/http/client";

export const BG_PRESETS = [
  { label: "Naranja & Ámbar (Default)", value: "from-orange-50 via-white to-amber-50", accent: "#FF6A00" },
  { label: "Turquesa & Cian", value: "from-teal-50 via-white to-cyan-50", accent: "#0fa39f" },
  { label: "Naranja & Turquesa Mix", value: "from-orange-50 via-white to-teal-50", accent: "#FF6A00" },
  { label: "Turquesa Intenso", value: "from-[#18D6D1]/20 via-white to-teal-50", accent: "#00a6a0" },
  { label: "Naranja Radiante", value: "from-amber-100 via-orange-50 to-white", accent: "#e65f00" },
];

export const bannerSchema = z.object({
  id: z.number().optional(),
  title: z.string().trim().min(2, "El título principal es obligatorio"),
  subtitle: z.string().trim().optional().or(z.literal("")),
  desc: z.string().trim().optional().or(z.literal("")),
  cta: z.string().trim().optional().or(z.literal("")),
  linkUrl: z.string().trim().optional().or(z.literal("")),
  image: z.string().trim().min(1, "La URL de la imagen es obligatoria"),
  bg: z.string(),
  accent: z.string(),
  position: z.string(),
  order: z.number().int().min(1, "El orden debe ser al menos 1"),
  isActive: z.boolean(),
});

export type BannerFormValues = z.infer<typeof bannerSchema>;

export interface BannerFormProps {
  isOpen: boolean;
  onClose: () => void;
  banner?: BannerData | null;
  defaultOrder?: number;
  onSuccess?: () => void;
}

const DEFAULT_FORM: BannerFormValues = {
  title: "",
  subtitle: "",
  desc: "",
  cta: "Comprá ahora",
  linkUrl: "/categorias",
  bg: "from-orange-50 via-white to-amber-50",
  accent: "#FF6A00",
  image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=700&h=500&fit=crop&auto=format",
  position: "hero",
  order: 1,
  isActive: true,
};

export function BannerForm({
  isOpen,
  onClose,
  banner,
  defaultOrder = 1,
  onSuccess,
}: BannerFormProps) {
  const [apiError, setApiError] = useState("");
  const [imageFile, setImageFile] = useState<File | undefined>();

  const methods = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      ...DEFAULT_FORM,
      order: defaultOrder,
    },
  });

  const currentBg = methods.watch("bg");

  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner();

  useEffect(() => {
    if (isOpen) {
      if (banner) {
        methods.reset({
          id: banner.id,
          title: banner.title,
          subtitle: banner.subtitle || "",
          desc: banner.desc || "",
          cta: banner.cta || "Comprá ahora",
          linkUrl: banner.linkUrl || "/categorias",
          bg: banner.bg || "from-orange-50 via-white to-amber-50",
          accent: banner.accent || "#FF6A00",
          image: banner.image,
          position: banner.position || "hero",
          order: banner.order ?? 1,
          isActive: banner.isActive ?? true,
        });
      } else {
        methods.reset({
          ...DEFAULT_FORM,
          order: defaultOrder,
        });
      }
      setImageFile(undefined);
      setApiError("");
    }
  }, [isOpen, banner, defaultOrder, methods]);

  const onSubmit = async (values: BannerFormValues) => {
    setApiError("");
    try {
      if (banner?.id) {
        await updateMutation.mutateAsync({
          id: banner.id,
          data: { ...values, imageFile },
        });
      } else {
        await createMutation.mutateAsync({ ...values, imageFile });
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : "Error al guardar el banner.");
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={banner ? "Editar Banner" : "Nuevo Banner Principal"}
      subtitle="Completá los textos, estilo e imagen del slide"
      maxWidth="2xl"
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
            {isSaving ? "Guardando..." : "Guardar Banner"}
          </button>
        </>
      }
    >
      <FormProvider {...methods}>
        <div className="space-y-4">
          {apiError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {apiError}
            </div>
          )}

          <FormInput
            name="title"
            label="Título Principal"
            placeholder="Ej: Comprá fácil, rápido y seguro"
            required
            autoFocus
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              name="subtitle"
              label="Subtítulo / Etiqueta"
              placeholder="TODO LO QUE NECESITAS, MÁS CERCA"
            />
            <FormInput
              name="cta"
              label="Texto del Botón (CTA)"
              placeholder="Comprá ahora"
            />
          </div>

          <FormTextarea
            name="desc"
            label="Descripción breve"
            placeholder="Miles de productos con precios imperdibles y envíos a todo el país..."
            rows={2}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <FormInput
                name="image"
                label="URL de imagen (opcional si subís un archivo)"
                type="url"
                placeholder="https://images.unsplash.com/..."
                required={!imageFile}
              />
            </div>
            <ImageDropzone
              value={imageFile}
              existingUrl={methods.watch("image")}
              onChange={setImageFile}
            />
            <FormInput
              name="linkUrl"
              label="Enlace de destino (Link URL)"
              placeholder="/categorias o /ofertas"
            />
          </div>

          {/* Selector de combinación de colores y gradientes */}
          <div>
            <label className="text-xs font-bold text-gray-700 mb-1 block">
              Estilo y Gradiente de Fondo
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {BG_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => {
                    methods.setValue("bg", preset.value);
                    methods.setValue("accent", preset.accent);
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition-all ${
                    currentBg === preset.value
                      ? "border-primary bg-orange-50/50 font-bold text-gray-900 shadow-2xs"
                      : "border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  <span>{preset.label}</span>
                  <span
                    className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: preset.accent }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 items-center">
            <FormInput
              name="order"
              label="Orden (1, 2, 3...)"
              type="number"
              min={1}
            />
            <div className="pt-5">
              <FormCheckbox
                name="isActive"
                label="Banner Visible y Activo"
              />
            </div>
          </div>
        </div>
      </FormProvider>
    </Modal>
  );
}
