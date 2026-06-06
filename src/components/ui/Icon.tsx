import { cn } from "@/lib/cn";

type IconProps = {
  /** Nombre del símbolo en Material Symbols Outlined, ej. "shopping_cart". */
  name: string;
  /** Si true, usa el eje variable FILL=1 (icono relleno). */
  filled?: boolean;
  className?: string;
  /** Tamaño en píxeles del propio glifo (no del contenedor). Default 24. */
  size?: number;
  /** Atributo aria-label opcional; si no se pasa, el ícono es decorativo (aria-hidden). */
  label?: string;
};

/**
 * <Icon name="..." /> envuelve un Material Symbol con accesibilidad y estilos
 * consistentes. Si necesitas un tamaño puntual, usa size; si necesitas color
 * o margen, usa className.
 */
export function Icon({ name, filled = false, className, size, label }: IconProps) {
  return (
    <span
      className={cn(
        "material-symbols-outlined inline-block align-middle leading-none select-none",
        filled && "material-icon-filled",
        className,
      )}
      style={size ? { fontSize: `${size}px` } : undefined}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {name}
    </span>
  );
}
