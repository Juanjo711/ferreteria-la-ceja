import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/shop/Breadcrumb";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ProductInfo } from "@/components/shop/ProductInfo";
import { ProductTabs } from "@/components/shop/ProductTabs";
import { ProductCard } from "@/components/shop/ProductCard";
import { SectionHeading } from "@/components/shop/SectionHeading";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries/catalog";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Params }) {
  const p = await getProductBySlug(params.slug);
  if (!p) return { title: "Producto no encontrado" };
  return { title: p.name, description: p.description.slice(0, 160) };
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.id, product.category.id, 4);

  return (
    <>
      <Breadcrumb
        className="mb-6"
        items={[
          { label: "Inicio", href: "/" },
          { label: "Productos", href: "/productos" },
          { label: product.category.name, href: `/productos/categoria/${product.category.slug}` },
          { label: product.name },
        ]}
      />

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
        <div className="lg:col-span-7">
          <ProductGallery images={product.images} productName={product.name} />
        </div>
        <div className="lg:col-span-5">
          <ProductInfo product={product} />
        </div>
      </section>

      <ProductTabs description={product.description} specs={product.specs} />

      {related.length > 0 && (
        <section>
          <SectionHeading
            title="Productos relacionados"
            href={`/productos/categoria/${product.category.slug}`}
            cta="Ver categoría"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
