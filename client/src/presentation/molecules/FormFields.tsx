"use client";

import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { cn } from "@/shared/lib/utils";

interface BaseFieldProps {
  name: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
  className?: string;
  containerClassName?: string;
  disabled?: boolean;
}

function getFieldError(errors: Record<string, any>, path: string): string | undefined {
  if (!errors) return undefined;
  const parts = path.split(".");
  let current: any = errors;
  for (const part of parts) {
    if (!current) return undefined;
    current = current[part];
  }
  return current?.message ? String(current.message) : undefined;
}

/* =========================================================================
   FormInput
   ========================================================================= */
export interface FormInputProps
  extends BaseFieldProps,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "required" | "disabled"> {
  valueAsNumber?: boolean;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      name,
      label,
      description,
      required,
      className,
      containerClassName,
      disabled,
      type = "text",
      valueAsNumber,
      ...props
    },
    ref
  ) => {
    const { register, formState: { errors } } = useFormContext();
    const error = getFieldError(errors, name);

    return (
      <div className={cn("space-y-1", containerClassName)}>
        {label && (
          <label htmlFor={name} className="text-xs font-bold text-gray-700 block">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}

        <input
          id={name}
          type={type}
          disabled={disabled}
          {...register(
            name,
            valueAsNumber !== undefined
              ? { valueAsNumber }
              : type === "number"
              ? { valueAsNumber: true }
              : {}
          )}
          ref={(e) => {
            register(name).ref(e);
            if (typeof ref === "function") ref(e);
            else if (ref) (ref as any).current = e;
          }}
          className={cn(
            "w-full text-sm px-3.5 py-2 bg-gray-50 border rounded-xl outline-none transition-all",
            error
              ? "border-red-300 focus:border-red-500 bg-red-50/20 text-red-900"
              : "border-gray-200 focus:border-primary focus:bg-white text-gray-900",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          {...props}
        />

        {description && !error && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}

        {error && (
          <p className="text-xs text-red-600 font-medium mt-1 animate-in fade-in-50">
            {error}
          </p>
        )}
      </div>
    );
  }
);
FormInput.displayName = "FormInput";

/* =========================================================================
   FormTextarea
   ========================================================================= */
export interface FormTextareaProps
  extends BaseFieldProps,
    Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "name" | "required" | "disabled"> {}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      name,
      label,
      description,
      required,
      className,
      containerClassName,
      disabled,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const { register, formState: { errors } } = useFormContext();
    const error = getFieldError(errors, name);

    return (
      <div className={cn("space-y-1", containerClassName)}>
        {label && (
          <label htmlFor={name} className="text-xs font-bold text-gray-700 block">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}

        <textarea
          id={name}
          rows={rows}
          disabled={disabled}
          {...register(name)}
          ref={(e) => {
            register(name).ref(e);
            if (typeof ref === "function") ref(e);
            else if (ref) (ref as any).current = e;
          }}
          className={cn(
            "w-full text-sm px-3.5 py-2 bg-gray-50 border rounded-xl outline-none transition-all resize-none",
            error
              ? "border-red-300 focus:border-red-500 bg-red-50/20 text-red-900"
              : "border-gray-200 focus:border-primary focus:bg-white text-gray-900",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          {...props}
        />

        {description && !error && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}

        {error && (
          <p className="text-xs text-red-600 font-medium mt-1 animate-in fade-in-50">
            {error}
          </p>
        )}
      </div>
    );
  }
);
FormTextarea.displayName = "FormTextarea";

/* =========================================================================
   FormSelect
   ========================================================================= */
export interface FormSelectOption {
  label: string;
  value: string | number;
}

export interface FormSelectProps
  extends BaseFieldProps,
    Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "name" | "required" | "disabled"> {
  options: FormSelectOption[];
  placeholder?: string;
}

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  (
    {
      name,
      label,
      description,
      options,
      placeholder,
      required,
      className,
      containerClassName,
      disabled,
      ...props
    },
    ref
  ) => {
    const { register, formState: { errors } } = useFormContext();
    const error = getFieldError(errors, name);

    return (
      <div className={cn("space-y-1", containerClassName)}>
        {label && (
          <label htmlFor={name} className="text-xs font-bold text-gray-700 block">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}

        <select
          id={name}
          disabled={disabled}
          {...register(name)}
          ref={(e) => {
            register(name).ref(e);
            if (typeof ref === "function") ref(e);
            else if (ref) (ref as any).current = e;
          }}
          className={cn(
            "w-full text-sm px-3.5 py-2 bg-gray-50 border rounded-xl outline-none transition-all",
            error
              ? "border-red-300 focus:border-red-500 bg-red-50/20 text-red-900"
              : "border-gray-200 focus:border-primary focus:bg-white text-gray-900",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {description && !error && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}

        {error && (
          <p className="text-xs text-red-600 font-medium mt-1 animate-in fade-in-50">
            {error}
          </p>
        )}
      </div>
    );
  }
);
FormSelect.displayName = "FormSelect";

/* =========================================================================
   FormCheckbox
   ========================================================================= */
export interface FormCheckboxProps
  extends BaseFieldProps,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "required" | "disabled" | "type"> {}

export const FormCheckbox = React.forwardRef<HTMLInputElement, FormCheckboxProps>(
  (
    {
      name,
      label,
      description,
      className,
      containerClassName,
      disabled,
      ...props
    },
    ref
  ) => {
    const { register, formState: { errors } } = useFormContext();
    const error = getFieldError(errors, name);

    return (
      <div className={cn("pt-1", containerClassName)}>
        <div className="flex items-start gap-2.5">
          <input
            id={name}
            type="checkbox"
            disabled={disabled}
            {...register(name)}
            ref={(e) => {
              register(name).ref(e);
              if (typeof ref === "function") ref(e);
              else if (ref) (ref as any).current = e;
            }}
            className={cn(
              "h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mt-0.5 cursor-pointer",
              disabled && "opacity-50 cursor-not-allowed",
              className
            )}
            {...props}
          />
          <div className="space-y-0.5">
            {label && (
              <label htmlFor={name} className="text-xs font-bold text-gray-700 cursor-pointer block">
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-600 font-medium mt-1 animate-in fade-in-50 pl-6">
            {error}
          </p>
        )}
      </div>
    );
  }
);
FormCheckbox.displayName = "FormCheckbox";
