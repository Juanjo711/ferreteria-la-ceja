import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

/**
 * Breadcrumb genérico: items con href son links; el último (sin href)
 * se renderiza como texto enfatizado.
 */
export function Breadcrumb({
  items,
  className,
}: {
  items: readonly BreadcrumbItem[];
  className?: string;
}) {
  return (
    <nav
      aria-label="Migas de pan"
      className={cn("flex items-center gap-2 text-sm text-secondary", className)}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 && <Icon name="chevron_right" size={14} className="text-on-surface-variant/40" />}
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-primary transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-on-surface font-semibold">{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
