"use client";

import { Modal } from "@/presentation/molecules/Modal";
import { PostForm } from "@/presentation/organisms/PostForm";
import { Post } from "@/domain/entities/Post";

export interface PostFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  post?: Post | null;
  isLoading?: boolean;
  onSuccess?: () => void;
}

export function PostFormModal({
  isOpen,
  onClose,
  post,
  isLoading = false,
  onSuccess,
}: PostFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            {post ? "Editar artículo" : "Nuevo artículo"}
          </p>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 font-heading mt-1">
            {post ? "Modificar publicación" : "Redactar nuevo artículo"}
          </h2>
        </div>
      }
      subtitle={
        post
          ? "Actualizá el contenido, portada o configuración de publicación."
          : "Completá los datos para publicar una guía, consejo o noticia en el blog."
      }
      maxWidth="4xl"
      rawContent
    >
      {isLoading ? (
        <div className="py-24 text-center text-sm text-muted-foreground">
          Cargando artículo seleccionado…
        </div>
      ) : (
        <PostForm
          post={post}
          isEditing={Boolean(post)}
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
