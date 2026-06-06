import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  /** Opcional: nodo a la derecha del input (ej. botón de mostrar contraseña). */
  rightAdornment?: ReactNode;
};

/**
 * Campo de formulario con label arriba e input estilo "filled". Soporta
 * mensaje de error inline. Usa forwardRef para integrarse con react-hook-form.
 */
export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(function FormField(
  { label, error, rightAdornment, className, id, ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  const errId = error && inputId ? `${inputId}-error` : undefined;

  return (
    <div className="w-full">
      <label htmlFor={inputId} className="block text-sm font-semibold mb-2 text-on-surface-variant">
        {label}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={errId}
          className={cn(
            "w-full bg-surface-container-low border-none rounded-md px-4 py-3 text-on-surface",
            "placeholder:text-on-surface-variant/60",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all",
            error && "ring-2 ring-error",
            rightAdornment && "pr-12",
            className,
          )}
          {...rest}
        />
        {rightAdornment && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            {rightAdornment}
          </div>
        )}
      </div>
      {error && (
        <p id={errId} role="alert" className="mt-2 text-xs text-error font-semibold">
          {error}
        </p>
      )}
    </div>
  );
});
