import {
  getFeaturedProducts,
  getCategoriesForNav,
  getBrandsForStrip,
} from "@/lib/queries/catalog";
import { CategorySidebar } from "@/components/shop/CategorySidebar";
import { HeroBanner } from "@/components/shop/HeroBanner";
import { BrandStrip } from "@/components/shop/BrandStrip";
import { ProductCard } from "@/components/shop/ProductCard";
import { NewsletterCta } from "@/components/shop/NewsletterCta";
import { SectionHeading } from "@/components/shop/SectionHeading";

/**
 * Home (/) — Server Component. Lee 8 destacados, 7 categorías y las marcas
 * directamente de Prisma. Sin caché explícita: en dev se re-renderiza por
 * petición; en producción Next aplicará ISR por defecto a los Server
 * Components que no usan funciones dinámicas (cookies/headers/etc.).
 */
export default async function HomePage() {
  const [featured, categories, brands] = await Promise.all([
    getFeaturedProducts(8),
    getCategoriesForNav(),
    getBrandsForStrip(),
  ]);

  return (
    <>
      <section className="flex flex-col lg:flex-row gap-6 mb-16">
        <CategorySidebar categories={categories} />
        <HeroBanner />
      </section>

      <BrandStrip brands={brands} />

      <section className="mb-20" aria-labelledby="home-featured">
        <SectionHeading
          title="Productos Destacados"
          href="/productos"
          cta="Ver todos los productos"
        />
        {featured.length === 0 ? (
          <p className="text-on-surface-variant">
            Aún no hay productos destacados. (¿La base no está sembrada?)
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <NewsletterCta />
    </>
  );
}
