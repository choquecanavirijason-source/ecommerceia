"use client";

import { useEffect, useId, useState } from "react";

interface ImageDropzoneProps {
  value?: File;
  values?: File[];
  existingUrl?: string;
  existingUrls?: string[];
  onChange: (file?: File) => void;
  onFilesChange?: (files: File[]) => void;
  onClear?: () => void;
  multiple?: boolean;
}

export function ImageDropzone({
  value,
  values = [],
  existingUrl,
  existingUrls = [],
  onChange,
  onFilesChange,
  onClear,
  multiple = false,
}: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(existingUrl ?? "");
  const [previewUrls, setPreviewUrls] = useState<string[]>(existingUrls);
  const inputId = useId();

  useEffect(() => {
    if (!value) {
      setPreviewUrl(existingUrl ?? "");
      return;
    }

    const objectUrl = URL.createObjectURL(value);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [existingUrl, value]);

  useEffect(() => {
    if (!multiple) return;

    const objectUrls = values.map((file) => URL.createObjectURL(file));
    setPreviewUrls([...existingUrls, ...objectUrls]);
    return () => objectUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [existingUrls, multiple, values]);

  const selectFile = (file?: File) => {
    if (file?.type.startsWith("image/")) {
      onChange(file);
    }
  };

  const selectFiles = (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (validFiles.length > 0) {
      onFilesChange?.([...values, ...validFiles]);
    }
  };

  const clearImage = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onChange(undefined);
    onClear?.();
  };

  const removeFile = (index: number) => {
    onFilesChange?.(values.filter((_, fileIndex) => fileIndex !== index));
  };

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          if (multiple) selectFiles(event.dataTransfer.files);
          else selectFile(event.dataTransfer.files[0]);
        }}
        onClick={() => document.getElementById(inputId)?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            document.getElementById(inputId)?.click();
          }
        }}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-3 text-center transition-colors ${
          isDragging
            ? "border-[#FF6A00] bg-orange-50"
            : "border-gray-200 bg-gray-50 hover:border-[#FF6A00] hover:bg-orange-50/50"
        }`}
      >
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple={multiple}
          className="hidden"
          onChange={(event) => {
            if (multiple) selectFiles(event.target.files ?? []);
            else selectFile(event.target.files?.[0]);
            event.currentTarget.value = "";
          }}
        />
        <p className="text-xs font-semibold text-gray-700">
          {multiple ? "Arrastrá imágenes acá o hacé clic para elegirlas" : "Arrastrá una imagen acá o hacé clic para elegirla"}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Se guarda en el storage del servidor
        </p>
      </div>

      {multiple && previewUrls.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {previewUrls.map((url, index) => {
            const isUploadedFile = index >= existingUrls.length;
            const fileIndex = index - existingUrls.length;

            return (
              <div key={`${url}-${index}`} className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                <img src={url} alt={`Imagen ${index + 1}`} className="aspect-square w-full object-cover" />
                {isUploadedFile && (
                  <button
                    type="button"
                    onClick={() => removeFile(fileIndex)}
                    className="absolute right-1.5 top-1.5 rounded-lg bg-red-600 px-2 py-1 text-[11px] font-bold text-white shadow-sm hover:bg-red-700"
                  >
                    Quitar
                  </button>
                )}
                <span className="block truncate px-2 py-1.5 text-[11px] text-muted-foreground">
                  {isUploadedFile ? values[fileIndex]?.name : "Imagen guardada"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {!multiple && <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 min-h-40">
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="Vista previa" className="h-full min-h-40 w-full object-cover" />
            <button
              type="button"
              onClick={clearImage}
              className="absolute right-2 top-2 rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-red-700"
            >
              Quitar imagen
            </button>
          </>
        ) : (
          <div className="flex min-h-40 items-center justify-center text-xs text-muted-foreground">
            La vista previa aparecerá acá
          </div>
        )}
      </div>}
    </div>
  );
}
