import { notFound } from "next/navigation";
import { CatalogView } from "@/components/shop/CatalogView";
import {
  getCategoryBySlug,
  getProductList,
  getFilterFacets,
} from "@/lib/queries/catalog";
import { parseCatalogParams, type RawSearchParams } from "@/lib/catalog-params";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Params }) {
  const cat = await getCategoryBySlug(params.slug);
  if (!cat) return { title: "Categoría no encontrada" };
  return {
    title: cat.name,
    description: cat.description ?? `Productos de la categoría ${cat.name}.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: RawSearchParams;
}) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) notFound();

  const filters = parseCatalogParams(searchParams, { categorySlug: category.slug });
  const [result, facets] = await Promise.all([
    getProductList(filters),
    getFilterFacets(filters),
  ]);

  const basePath = `/productos/categoria/${category.slug}` as const;

  return (
    <CatalogView
      basePath={basePath}
      breadcrumb={[
        { label: "Inicio", href: "/" },
        { label: "Productos", href: "/productos" },
        { label: category.name },
      ]}
      title={category.name}
      subtitle={category.description ?? undefined}
      filters={filters}
      facets={facets}
      result={result}
    />
  );
}
