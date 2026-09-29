"use client";

import { useEffect, useRef, useState } from "react";
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
import { apiRequest, ApiError } from "@/infrastructure/http/client";
import type { Post } from "@/domain/entities/Post";

export const CATEGORY_OPTIONS = [
  {
    name: "Herramientas",
    color: "#18D6D1",
    gradient: "from-[#18D6D1]/20 via-[#18D6D1]/5 to-transparent",
    tagBg: "bg-[#18D6D1]/10 text-[#00a6a0] border-[#18D6D1]/30",
    icon: "Wrench",
  },
  {
    name: "Guía UNO",
    color: "#FF6A00",
    gradient: "from-[#FF6A00]/20 via-[#FF6A00]/5 to-transparent",
    tagBg: "bg-[#FF6A00]/10 text-[#FF6A00] border-[#FF6A00]/30",
    icon: "ShieldCheck",
  },
  {
    name: "Hogar y Taller",
    color: "#18D6D1",
    gradient: "from-[#18D6D1]/20 via-[#18D6D1]/5 to-transparent",
    tagBg: "bg-[#18D6D1]/10 text-[#00a6a0] border-[#18D6D1]/30",
    icon: "Home",
  },
  {
    name: "Tecnología",
    color: "#FF6A00",
    gradient: "from-[#FF6A00]/20 via-[#FF6A00]/5 to-transparent",
    tagBg: "bg-[#FF6A00]/10 text-[#FF6A00] border-[#FF6A00]/30",
    icon: "Sparkles",
  },
];

export const ICON_OPTIONS = ["BookOpen", "Wrench", "ShieldCheck", "Home", "Sparkles"];

export const postSchema = z.object({
  title: z.string().trim().min(3, "El título debe tener al menos 3 caracteres"),
  slug: z.string().trim().optional().or(z.literal("")),
  category: z.string().min(1, "Debes seleccionar una categoría"),
  categoryColor: z.string(),
  tagBg: z.string(),
  excerpt: z.string().trim().min(5, "El extracto debe tener al menos 5 caracteres"),
  content: z.string().trim().min(10, "El contenido del artículo debe tener al menos 10 caracteres"),
  image: z.string().trim().optional().or(z.literal("")),
  readTime: z.string().trim(),
  icon: z.string(),
  bannerGradient: z.string(),
  isPublished: z.boolean(),
});

export type PostFormValues = z.infer<typeof postSchema>;

export interface PostFormProps {
  post?: Post | null;
  isEditing?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
  isModal?: boolean;
}

function getPostDefaultValues(post?: Post | null): PostFormValues {
  return {
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    category: post?.category ?? "Herramientas",
    categoryColor: post?.categoryColor ?? "#18D6D1",
    tagBg: post?.tagBg ?? "bg-[#18D6D1]/10 text-[#00a6a0] border-[#18D6D1]/30",
    excerpt: post?.excerpt ?? "",
    content: post?.content ?? "",
    image: post?.image ?? "",
    readTime: post?.readTime ?? "4 min de lectura",
    icon: post?.icon ?? "Wrench",
    bannerGradient: post?.bannerGradient ?? "from-[#18D6D1]/20 via-[#18D6D1]/5 to-transparent",
    isPublished: post?.isPublished ?? true,
  };
}

export function PostForm({
  post,
  isEditing = false,
  onSuccess,
  onCancel,
  isModal = false,
}: PostFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: getPostDefaultValues(post),
  });

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting: formIsSubmitting },
  } = methods;

  useEffect(() => {
    if (post) {
      reset(getPostDefaultValues(post));
    }
  }, [post, reset]);

  const currentCategory = watch("category");
  const prevCategoryRef = useRef(currentCategory);

  useEffect(() => {
    if (prevCategoryRef.current !== currentCategory) {
      prevCategoryRef.current = currentCategory;
      const matched = CATEGORY_OPTIONS.find((c) => c.name === currentCategory);
      if (matched) {
        setValue("categoryColor", matched.color);
        setValue("bannerGradient", matched.gradient);
        setValue("tagBg", matched.tagBg);
        setValue("icon", matched.icon);
      }
    }
  }, [currentCategory, setValue]);

  const onSubmit = async (values: PostFormValues) => {
    setServerError("");
    setIsSubmitting(true);

    const payload = {
      title: values.title.trim(),
      slug: values.slug?.trim() || undefined,
      category: values.category,
      category_color: values.categoryColor,
      tag_bg: values.tagBg,
      excerpt: values.excerpt.trim(),
      content: values.content.trim(),
      image: values.image?.trim() || null,
      read_time: values.readTime.trim(),
      icon: values.icon,
      banner_gradient: values.bannerGradient,
      is_published: values.isPublished,
    };

    try {
      if (isEditing && post) {
        await apiRequest(`/posts/${post.id}`, {
          method: "PUT",
          auth: true,
          body: payload,
        });
      } else {
        await apiRequest("/posts", {
          method: "POST",
          auth: true,
          body: payload,
        });
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/blog");
      }
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        const messages = Object.values(err.errors).flat();
        setServerError(messages.join(" "));
      } else {
        setServerError(err instanceof ApiError ? err.message : "Error al guardar el artículo.");
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
            : "space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm"
        }
      >
        <div className={isModal ? "flex-1 overflow-y-auto p-6 space-y-6" : "space-y-6"}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormInput
              name="title"
              label="Título del artículo"
              placeholder="Ej: 5 claves para comprar por internet de forma segura"
              required
              className="font-heading font-bold"
              containerClassName="md:col-span-2"
            />

            <FormSelect
              name="category"
              label="Categoría"
              options={CATEGORY_OPTIONS.map((cat) => ({
                label: cat.name,
                value: cat.name,
              }))}
              required
            />

            <FormInput
              name="readTime"
              label="Tiempo de lectura estimado"
              placeholder="Ej: 4 min de lectura"
            />

            <FormSelect
              name="icon"
              label="Ícono decorativo"
              options={ICON_OPTIONS.map((ico) => ({
                label: ico,
                value: ico,
              }))}
            />

            <FormInput
              name="slug"
              label="Slug personalizado (opcional)"
              placeholder="se-genera-automaticamente"
            />

            <FormInput
              name="image"
              label="URL de imagen de portada (opcional)"
              placeholder="https://..."
              containerClassName="md:col-span-2"
            />

            <FormTextarea
              name="excerpt"
              label="Extracto breve (resumen para la tarjeta)"
              rows={3}
              placeholder="Breve descripción que se mostrará en las tarjetas del home y la grilla de blog..."
              required
              containerClassName="md:col-span-2"
            />

            <FormTextarea
              name="content"
              label="Contenido completo del artículo"
              rows={8}
              placeholder="Escribí el texto completo del artículo..."
              required
              className="font-mono text-xs leading-relaxed"
              containerClassName="md:col-span-2"
            />
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
            <FormCheckbox
              name="isPublished"
              label="Publicar artículo inmediatamente"
              description="Si está marcado, se mostrará en el blog público y en la sección del home."
            />
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
                router.push("/admin/blog");
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
              : "Publicar artículo"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
