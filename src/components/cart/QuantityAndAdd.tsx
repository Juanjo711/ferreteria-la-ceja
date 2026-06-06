"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { AddToCartButton } from "./AddToCartButton";
import type { ProductDetailView } from "@/types/product";

/**
 * Bloque "selector de cantidad + botón agregar" usado en la página de detalle.
 * El selector controla cuántas unidades se añaden de una vez (capado al stock).
 */
export function QuantityAndAdd({ product }: { product: ProductDetailView }) {
  const [qty, setQty] = useState(1);
  const outOfStock = product.stock <= 0;

  const adapted = {
    id: product.id,
    sku: product.sku,
    slug: product.slug,
    name: product.name,
    price: product.price,
    comparePrice: product.comparePrice,
    stock: product.stock,
    brandName: product.brand?.name ?? null,
    primaryImage: product.images[0] ?? null,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center border border-outline-variant/40 rounded-lg bg-surface-container-low overflow-hidden">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={outOfStock || qty <= 1}
            className="px-4 py-2 hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Disminuir cantidad"
          >
            <Icon name="remove" size={18} />
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={Math.max(1, product.stock)}
            value={qty}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isFinite(n)) setQty(Math.min(Math.max(1, n), Math.max(1, product.stock)));
            }}
            aria-label="Cantidad"
            disabled={outOfStock}
            className="w-12 text-center bg-transparent border-none font-bold text-on-surface focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            disabled={outOfStock || qty >= product.stock}
            className="px-4 py-2 hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Aumentar cantidad"
          >
            <Icon name="add" size={18} />
          </button>
        </div>
        <StockBadge stock={product.stock} />
      </div>

      <AddToCartButton product={adapted} quantity={qty} variant="wide" />
    </div>
  );
}

function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) {
    return (
      <span className="text-sm font-medium px-3 py-1 bg-error/10 text-error rounded">
        Agotado
      </span>
    );
  }
  if (stock < 5) {
    return (
      <span className="text-sm font-medium px-3 py-1 bg-primary-container/10 text-primary rounded">
        ¡Últimas {stock} unidades!
      </span>
    );
  }
  return (
    <span className="text-sm font-medium px-3 py-1 bg-tertiary-container/20 text-on-tertiary-container rounded">
      Stock disponible: {stock} unidades
    </span>
  );
}
