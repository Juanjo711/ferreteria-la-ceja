import { Icon } from "./Icon";
import { cn } from "@/lib/cn";

type StarRatingProps = {
  /** Valor 0-5; se permite 0.5 para media estrella. */
  value: number;
  /** Total de reseñas; se muestra entre paréntesis (ej. "(42)"). */
  count?: number;
  size?: number;
  className?: string;
};

/**
 * Muestra 5 estrellas y un conteo opcional. En el MVP las reseñas son
 * "Próximamente" (RF-03 fuera de alcance), así que todos los productos
 * llevan value=0 y count=0. El componente está listo para cuando se
 * implemente el sistema real de reseñas.
 */
export function StarRating({ value, count, size = 16, className }: StarRatingProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[1, 2, 3, 4, 5].map((index) => {
        const filled = value >= index;
        const half = !filled && value >= index - 0.5;
        return (
          <Icon
            key={index}
            name={half ? "star_half" : "star"}
            filled
            size={size}
            className={filled || half ? "text-yellow-400" : "text-surface-container-high"}
          />
        );
      })}
      {count !== undefined && (
        <span className="ml-1 text-xs text-on-surface-variant/70">({count})</span>
      )}
    </div>
  );
}
