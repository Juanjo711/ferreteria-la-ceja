import Link from "next/link";
import { Breadcrumb, type BreadcrumbItem } from "./Breadcrumb";
import { ProductFilters } from "./ProductFilters";
import { ProductCard } from "./ProductCard";
import { Pagination } from "./Pagination";
import { ResultsHeader } from "./ResultsHeader";
import { Icon } from "@/components/ui/Icon";
import type { ProductListFilters, ProductListResult, CatalogFacets } from "@/lib/queries/catalog";
import { buildCatalogUrl } from "@/lib/catalog-params";

type CatalogViewProps = {
  basePath: "/productos" | `/productos/categoria/${string}`;
  breadcrumb: BreadcrumbItem[];
  title: string;
  subtitle?: string;
  filters: ProductListFilters;
  facets: CatalogFacets;
  result: ProductListResult;
};

/**
 * Vista compartida por /productos y /productos/categoria/[slug] — la única
 * diferencia entre ambas es el basePath y el breadcrumb / título.
 */
export function CatalogView({
  basePath,
  breadcrumb,
  title,
  subtitle,
  filters,
  facets,
  result,
}: CatalogViewProps) {
  return (
    <>
      <Breadcrumb items={breadcrumb} className="mb-6" />

      <ResultsHeader title={title} subtitle={subtitle} total={result.total} filters={filters} />

      <div className="flex flex-col lg:flex-row gap-10">
        <ProductFilters filters={filters} facets={facets} basePath={basePath} />

        <div className="flex-1">
          {result.products.length === 0 ? (
            <EmptyState basePath={basePath} />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
                {result.products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <Pagination
                currentPage={result.currentPage}
                totalPages={result.totalPages}
                hrefFor={(page) => buildCatalogUrl(basePath, filters, { page })}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}

function EmptyState({ basePath }: { basePath: string }) {
  return (
    <div className="text-center py-20 px-4 bg-surface-container-low rounded-2xl border border-outline-variant/20">
      <Icon
        name="search_off"
        size={64}
        className="text-on-surface-variant/40 inline-block mb-4"
      />
      <h3 className="text-xl font-bold text-on-surface mb-2 font-headline">
        No encontramos productos con esos filtros
      </h3>
      <p className="text-on-surface-variant mb-6">
        Prueba a ampliar el rango de precio o limpiar los filtros activos.
      </p>
      <Link
        href={basePath}
        className="inline-flex items-center gap-2 bg-primary-container text-white px-6 py-3 rounded-lg font-bold hover:bg-primary transition-colors"
      >
        <Icon name="filter_alt_off" />
        Ver todos los productos
      </Link>
    </div>
  );
}
