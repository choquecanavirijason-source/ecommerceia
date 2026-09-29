"use client";

import React, { useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  children: React.ReactNode;
  footer?: React.ReactNode;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  rawContent?: boolean;
  bodyClassName?: string;
  className?: string;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
}

const MAX_WIDTH_CLASSES: Record<NonNullable<ModalProps["maxWidth"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  maxWidth = "2xl",
  children,
  footer,
  onSubmit,
  rawContent = false,
  bodyClassName,
  className,
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
}: ModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Handle Escape key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === "Escape") {
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  useEffect(() => {
    if (!isOpen) return;

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const content = rawContent ? (
    children
  ) : (
    <>
      <div className={cn("flex-1 overflow-y-auto p-6 space-y-4", bodyClassName)}>
        {children}
      </div>

      {footer && (
        <div className="shrink-0 p-4 sm:px-6 border-t border-border bg-gray-50/80 flex items-center justify-end gap-3">
          {footer}
        </div>
      )}
    </>
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
      onClick={(e) => {
        if (closeOnBackdropClick && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={cn(
          "bg-white rounded-3xl w-full shadow-2xl border border-border relative animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col overflow-hidden",
          MAX_WIDTH_CLASSES[maxWidth],
          className
        )}
      >
        {/* Fixed Header */}
        <div className="shrink-0 p-6 border-b border-border flex items-start justify-between bg-white">
          <div>
            {typeof title === "string" ? (
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 font-heading">
                {title}
              </h2>
            ) : (
              title
            )}
            {subtitle && (
              <div className="text-xs text-muted-foreground mt-0.5">
                {subtitle}
              </div>
            )}
          </div>

          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body & Footer (with optional form wrapper) */}
        {onSubmit ? (
          <form
            onSubmit={onSubmit}
            className="flex flex-col flex-1 min-h-0 overflow-hidden"
          >
            {content}
          </form>
        ) : (
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {content}
          </div>
        )}
      </div>
    </div>
  );
}
