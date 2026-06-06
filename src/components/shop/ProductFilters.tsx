import Link from "next/link";
import type { ProductListFilters, CatalogFacets } from "@/lib/queries/catalog";
import { buildCatalogUrl, toggleBrand } from "@/lib/catalog-params";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type Props = {
  filters: ProductListFilters;
  facets: CatalogFacets;
  /** Path base: /productos o /productos/categoria/[slug]. Si es la última,
   *  no mostramos la lista de categorías como filtro porque ya está fijada. */
  basePath: "/productos" | `/productos/categoria/${string}`;
};

/**
 * Sidebar de filtros 100% server-side: cada cambio es un link con la URL
 * actualizada. La sección de precio es un mini-form GET porque min/max
 * son inputs libres.
 */
export function ProductFilters({ filters, facets, basePath }: Props) {
  const isCategoryPage = basePath !== "/productos";

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-10">
      {/* CATEGORÍAS — solo en el listado general */}
      {!isCategoryPage && (
        <section>
          <h3 className="text-xs font-black uppercase tracking-widest text-secondary mb-4">
            Categorías
          </h3>
          <ul className="space-y-2">
            <li>
              <Link
                href={buildCatalogUrl("/productos", filters, { page: null })}
                className={cn(
                  "flex items-center justify-between text-sm py-1 transition-colors",
                  !filters.categorySlug
                    ? "font-bold text-primary"
                    : "text-on-surface-variant hover:text-primary",
                )}
              >
                <span>Todas</span>
              </Link>
            </li>
            {facets.categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={buildCatalogUrl(`/productos/categoria/${c.slug}`, filters, { page: null })}
                  className={cn(
                    "flex items-center justify-between text-sm py-1 transition-colors",
                    filters.categorySlug === c.slug
                      ? "font-bold text-primary"
                      : "text-on-surface-variant hover:text-primary",
                  )}
                >
                  <span>{c.name}</span>
                  <span
                    className={cn(
                      "px-2 rounded-full text-[10px] font-semibold",
                      filters.categorySlug === c.slug
                        ? "bg-primary-container/20 text-primary"
                        : "bg-surface-container text-secondary",
                    )}
                  >
                    {String(c.count).padStart(2, "0")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* RANGO DE PRECIO */}
      <section>
        <h3 className="text-xs font-black uppercase tracking-widest text-secondary mb-4">
          Rango de Precio
        </h3>
        <form action={basePath} method="get" className="space-y-3">
          <PreservedHiddenInputs filters={filters} exclude={["min", "max", "page"]} />
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs font-medium text-on-surface-variant">
              Mín
              <input
                type="number"
                inputMode="numeric"
                name="min"
                min={0}
                step={1000}
                defaultValue={filters.minPrice ?? ""}
                placeholder="0"
                className="mt-1 w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-2 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/30"
              />
            </label>
            <label className="text-xs font-medium text-on-surface-variant">
              Máx
              <input
                type="number"
                inputMode="numeric"
                name="max"
                min={0}
                step={1000}
                defaultValue={filters.maxPrice ?? ""}
                placeholder="—"
                className="mt-1 w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-2 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/30"
              />
            </label>
          </div>
          <Button type="submit" size="sm" fullWidth variant="outline">
            Aplicar
          </Button>
        </form>
      </section>

      {/* MARCAS */}
      <section>
        <h3 className="text-xs font-black uppercase tracking-widest text-secondary mb-4">Marcas</h3>
        <ul className="space-y-2">
          {facets.brands.map((b) => {
            const isChecked = (filters.brandSlugs ?? []).includes(b.slug);
            const nextBrands = toggleBrand(filters.brandSlugs, b.slug);
            return (
              <li key={b.slug}>
                <Link
                  href={buildCatalogUrl(basePath, filters, {
                    brand: nextBrands.length > 0 ? nextBrands : null,
                    page: null,
                  })}
                  className="flex items-center gap-3 text-sm py-1 group cursor-pointer"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0",
                      isChecked
                        ? "bg-primary border-primary"
                        : "border-outline-variant bg-white group-hover:border-primary",
                    )}
                  >
                    {isChecked && <Icon name="check" size={12} className="text-white" />}
                  </span>
                  <span
                    className={cn(
                      "flex-1",
                      isChecked
                        ? "text-on-surface font-semibold"
                        : "text-on-surface-variant group-hover:text-on-surface",
                    )}
                  >
                    {b.name}
                  </span>
                  <span className="text-[10px] text-secondary">{b.count}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Limpiar */}
      {(filters.q ||
        filters.brandSlugs?.length ||
        filters.minPrice !== undefined ||
        filters.maxPrice !== undefined) && (
        <Link
          href={basePath}
          className="inline-flex items-center gap-2 text-sm text-error font-semibold hover:underline"
        >
          <Icon name="filter_alt_off" size={16} />
          Limpiar filtros
        </Link>
      )}
    </aside>
  );
}

/**
 * Inputs hidden para preservar el resto de filtros en forms anidados.
 * No incluimos categorySlug porque ese va en el path, no en query.
 */
function PreservedHiddenInputs({
  filters,
  exclude,
}: {
  filters: ProductListFilters;
  exclude: ("q" | "brand" | "min" | "max" | "sort" | "page")[];
}) {
  const skip = new Set(exclude);
  return (
    <>
      {!skip.has("q") && filters.q && <input type="hidden" name="q" value={filters.q} />}
      {!skip.has("brand") && filters.brandSlugs && filters.brandSlugs.length > 0 && (
        <input type="hidden" name="brand" value={filters.brandSlugs.join(",")} />
      )}
      {!skip.has("min") && filters.minPrice !== undefined && (
        <input type="hidden" name="min" value={filters.minPrice} />
      )}
      {!skip.has("max") && filters.maxPrice !== undefined && (
        <input type="hidden" name="max" value={filters.maxPrice} />
      )}
      {!skip.has("sort") && filters.sort && filters.sort !== "popular" && (
        <input type="hidden" name="sort" value={filters.sort} />
      )}
    </>
  );
}
