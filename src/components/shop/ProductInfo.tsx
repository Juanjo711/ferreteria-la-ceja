import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/StarRating";
import { QuantityAndAdd } from "@/components/cart/QuantityAndAdd";
import { formatCOP } from "@/lib/format";
import type { ProductDetailView } from "@/types/product";

/**
 * Columna derecha del detalle: marca, título, rating, precio, descripción
 * corta, controles de cantidad y CTA "Agregar al carrito".
 *
 * El selector de cantidad y el botón son interactivos (cliente, Zustand).
 */
export function ProductInfo({ product }: { product: ProductDetailView }) {
  const discountPct =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2 mb-4">
          {product.isFeatured && <Badge variant="info">Destacado</Badge>}
          {discountPct !== null && <Badge variant="discount">-{discountPct}%</Badge>}
          {product.brand && (
            <span className="text-xs font-bold text-secondary uppercase tracking-widest">
              {product.brand.name}
            </span>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight leading-tight font-headline">
          {product.name}
        </h1>
        <div className="flex items-center gap-4 mt-4">
          <StarRating value={0} />
          <span className="text-secondary text-sm">Sin reseñas todavía</span>
        </div>
        <p className="text-xs text-on-surface-variant/60 mt-2">SKU: {product.sku}</p>
      </div>

      <div className="flex flex-col gap-1">
        {product.comparePrice && product.comparePrice > product.price && (
          <span className="text-on-surface-variant/60 line-through text-base">
            {formatCOP(product.comparePrice)}
          </span>
        )}
        <span className="text-primary-container text-4xl font-black">{formatCOP(product.price)}</span>
        <span className="text-secondary text-sm">
          IVA incluido. Envío gratis a La Ceja en compras mayores a {formatCOP(200000)}.
        </span>
      </div>

      <p className="text-on-surface-variant leading-relaxed">{product.description}</p>

      <QuantityAndAdd product={product} />

      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-outline-variant/30">
        <div className="flex items-center gap-3 text-sm font-semibold">
          <Icon name="verified" className="text-primary" />
          <span>Producto garantizado</span>
        </div>
        <div className="flex items-center gap-3 text-sm font-semibold">
          <Icon name="local_shipping" className="text-primary" />
          <span>Entrega 1–3 días hábiles</span>
        </div>
      </div>
    </div>
  );
}
