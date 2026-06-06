import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

/**
 * Form GET hacia /productos con el parámetro q. Server-side: Next maneja la
 * navegación al submit sin JavaScript adicional.
 */
export function SearchForm({ className }: { className?: string }) {
  return (
    <form action="/productos" method="get" className={cn("relative", className)} role="search">
      <input
        type="search"
        name="q"
        autoComplete="off"
        placeholder="Buscar productos, herramientas, materiales..."
        aria-label="Buscar en el catálogo"
        className={cn(
          "w-full bg-surface-container-low border-none rounded-lg px-5 py-3 pr-12 text-sm",
          "text-on-surface placeholder:text-on-surface-variant/60",
          "focus:outline-none focus:ring-2 focus:ring-primary-container/30 transition-all",
        )}
      />
      <button
        type="submit"
        aria-label="Buscar"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-dark hover:text-primary transition-colors"
      >
        <Icon name="search" />
      </button>
    </form>
  );
}
