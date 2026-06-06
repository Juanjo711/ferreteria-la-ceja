import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Icon } from "./Icon";
import { cn } from "@/lib/cn";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  iconName: string;
  filled?: boolean;
  /** Etiqueta accesible obligatoria — los botones-solo-icono la necesitan. */
  label: string;
  /** Contador opcional superpuesto (ej. cantidad de items en carrito). */
  count?: number;
  iconClassName?: string;
};

/**
 * Botón cuadrado solo-ícono con badge contador opcional. Usado en la navbar
 * para favoritos y carrito.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { iconName, filled, label, count, className, iconClassName, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      className={cn(
        "relative inline-flex items-center justify-center w-10 h-10 rounded-full",
        "text-brand-dark hover:text-primary transition-colors group",
        "outline-none focus-visible:ring-2 focus-visible:ring-primary-container",
        className,
      )}
      {...rest}
    >
      <Icon name={iconName} filled={filled} className={cn("text-2xl", iconClassName)} />
      {count !== undefined && count > 0 && (
        <span
          aria-hidden
          className="absolute -top-1 -right-1 bg-primary-container text-white text-[10px] font-bold w-4 h-4 rounded-circle flex items-center justify-center"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
});
