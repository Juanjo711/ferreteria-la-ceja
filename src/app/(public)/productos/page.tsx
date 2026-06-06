import { CatalogView } from "@/components/shop/CatalogView";
import { getProductList, getFilterFacets } from "@/lib/queries/catalog";
import { parseCatalogParams, type RawSearchParams } from "@/lib/catalog-params";

export const metadata = {
  title: "Productos",
  description: "Explora todo el catálogo de Ferretería La Ceja: herramientas, materiales y más.",
};

/**
 * /productos — listado general con filtros por categoría, marca, precio y
 * ordenamiento. Server Component que lee los filtros desde la URL.
 */
export default async function ProductosPage({
  searchParams,
}: {
  searchParams: RawSearchParams;
}) {
  const filters = parseCatalogParams(searchParams);
  const [result, facets] = await Promise.all([
    getProductList(filters),
    getFilterFacets(filters),
  ]);

  return (
    <CatalogView
      basePath="/productos"
      breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Productos" }]}
      title={filters.q ? `Resultados de búsqueda` : "Todos los productos"}
      subtitle={
        filters.q
          ? undefined
          : "Herramientas, materiales y todo lo que necesitas para tu obra."
      }
      filters={filters}
      facets={facets}
      result={result}
    />
  );
}
