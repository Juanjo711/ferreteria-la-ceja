import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "dark";
type Size = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  /** Ocupa todo el ancho del padre. */
  fullWidth?: boolean;
  /** Render-as-child no se implementa: si lo necesitas para <a>, usa <a> con las mismas clases via buttonClasses. */
  children: ReactNode;
};

const base =
  "inline-flex items-center justify-center gap-2 font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-container";

const variantClasses: Record<Variant, string> = {
  // CTA naranja — el botón principal en hero, "Agregar al carrito" puede usar dark
  primary: "bg-primary-container hover:bg-primary text-white shadow-lg",
  // Azul oscuro de marca — botón "Agregar al carrito" en ProductCard
  secondary: "bg-secondary hover:bg-brand-dark text-white",
  // Borde fino — "CATÁLOGO 2024" del hero (sobre fondo oscuro lleva mod adicional)
  outline:
    "bg-transparent border border-outline-variant text-on-surface hover:bg-surface-container-low",
  // Sin fondo — link-like
  ghost: "bg-transparent text-on-surface hover:bg-surface-container-low",
  // Dark sólido — footer / sección naranja
  dark: "bg-brand-dark hover:bg-brand-dark-deeper text-white",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-6 text-sm",
  lg: "h-14 px-8 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", fullWidth = false, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        base,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
});

/**
 * Clases del botón exportadas — útil para componer un <a> con la misma
 * apariencia (Next no quiere botones envueltos en Link, prefiere <a> con
 * los estilos del botón).
 */
export function buttonClasses(opts: { variant?: Variant; size?: Size; fullWidth?: boolean } = {}) {
  const { variant = "primary", size = "md", fullWidth = false } = opts;
  return cn(base, variantClasses[variant], sizeClasses[size], fullWidth && "w-full");
}
