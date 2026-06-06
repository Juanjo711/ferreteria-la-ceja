"use client";

import { useState, useTransition } from "react";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { ProductCardView } from "@/types/product";

type Props = {
  product: ProductCardView;
  quantity?: number;
  /** Variantes visuales: 'compact' para ProductCard, 'wide' para detalle. */
  variant?: "compact" | "wide";
};

/**
 * Botón "Agregar al carrito".
 *
 * Usa el store de Zustand directamente. En modo anon escribe a localStorage;
 * en modo auth sincroniza con la DB vía cart-store internamente.
 *
 * Tras éxito muestra un estado breve "Agregado ✓" durante 1.5s antes de
 * volver al label normal — feedback útil cuando el grid de productos no
 * navega a otra pantalla.
 */
export function AddToCartButton({ product, quantity = 1, variant = "compact" }: Props) {
  const add = useCartStore((s) => s.add);
  const syncing = useCartStore((s) => s.syncing);
  const [justAdded, setJustAdded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const outOfStock = product.stock <= 0;
  const disabled = outOfStock || syncing || isPending;

  const handleClick = () => {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await add(
        {
          productId: product.id,
          slug: product.slug,
          sku: product.sku,
          name: product.name,
          price: product.price,
          stock: product.stock,
          brandName: product.brandName,
          imageUrl: product.primaryImage?.url ?? null,
        },
        quantity,
      );
      if (!result.ok) {
        setErrorMessage(result.error ?? "No pudimos agregar el producto.");
        return;
      }
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    });
  };

  return (
    <div className="w-full">
      <Button
        type="button"
        variant={variant === "compact" ? "secondary" : "primary"}
        size={variant === "compact" ? "md" : "lg"}
        fullWidth
        disabled={disabled}
        onClick={handleClick}
        aria-label={`Agregar ${product.name} al carrito`}
      >
        {outOfStock ? (
          <>
            <Icon name="block" size={20} />
            Sin stock
          </>
        ) : justAdded ? (
          <>
            <Icon name="check_circle" size={20} filled />
            ¡Agregado!
          </>
        ) : (
          <>
            <Icon name={variant === "compact" ? "add_shopping_cart" : "shopping_bag"} size={20} />
            {variant === "compact" ? "Agregar al carrito" : "AGREGAR AL CARRITO"}
          </>
        )}
      </Button>
      {errorMessage && (
        <p role="alert" className="mt-2 text-xs text-error font-semibold">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
