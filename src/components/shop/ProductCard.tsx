import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/StarRating";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { formatCOP } from "@/lib/format";
import type { ProductCardView } from "@/types/product";

/**
 * Tarjeta usada en home (destacados) y en /productos (grid).
 *
 * - Si comparePrice > price, muestra badge rojo -NN%.
 * - Si stock === 0, badge "Agotado" y CTA deshabilitado.
 * - Las reseñas son 0 hasta la Fase futura (RF-03 fuera de alcance).
 * - "Agregar al carrito" delega en AddToCartButton (cliente + Zustand).
 */
export function ProductCard({ product }: { product: ProductCardView }) {
  const discountPct =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : null;
  const outOfStock = product.stock <= 0;

  return (
    <article className="bg-white rounded-xl overflow-hidden group hover:shadow-2xl transition-all duration-300 flex flex-col border border-outline-variant/20">
      <Link href={`/productos/${product.slug}`} className="block">
        <div className="relative aspect-square bg-surface-container-low overflow-hidden">
          {product.primaryImage ? (
            <Image
              src={product.primaryImage.url}
              alt={product.primaryImage.alt ?? product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-on-surface-variant/30">
              <Icon name="image_not_supported" size={48} />
            </div>
          )}
          {discountPct !== null && (
            <Badge variant="discount" className="absolute top-4 left-4">
              -{discountPct}%
            </Badge>
          )}
          {outOfStock && (
            <Badge variant="neutral" className="absolute top-4 right-4">
              Agotado
            </Badge>
          )}
        </div>
      </Link>
      <div className="p-6 flex flex-col flex-grow">
        {product.brandName && (
          <span className="text-on-surface-variant/50 text-xs font-bold uppercase mb-1">
            {product.brandName}
          </span>
        )}
        <Link href={`/productos/${product.slug}`} className="block group/title">
          <h3 className="text-brand-dark font-bold text-lg mb-2 leading-tight font-headline group-hover/title:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <StarRating value={0} count={0} className="mb-4" />
        <div className="mt-auto">
          {product.comparePrice && product.comparePrice > product.price && (
            <p className="text-on-surface-variant/50 line-through text-sm">
              {formatCOP(product.comparePrice)}
            </p>
          )}
          <p className="text-primary-container font-extrabold text-2xl mb-4">
            {formatCOP(product.price)}
          </p>
          <AddToCartButton product={product} variant="compact" />
        </div>
      </div>
    </article>
  );
}
