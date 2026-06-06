"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

/**
 * Ícono de carrito + badge contador para la Navbar.
 *
 * Lee del store reactivamente. Anti-hydration mismatch: el contador se
 * inicializa a 0 en SSR; tras montar, levantamos el valor real del store
 * (que pudo haber leído localStorage).
 */
export function CartCounter() {
  const count = useCartStore((s) => s.items.reduce((acc, i) => acc + i.quantity, 0));
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const displayCount = mounted ? count : 0;

  return (
    <Link
      href="/carrito"
      aria-label={`Ir al carrito (${displayCount} ${displayCount === 1 ? "producto" : "productos"})`}
      className="relative inline-flex items-center justify-center w-10 h-10 rounded-full text-brand-dark hover:text-primary transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-container"
    >
      <Icon name="shopping_cart" className="text-2xl" />
      <span
        aria-hidden
        className={cn(
          "absolute -top-1 -right-1 text-[10px] font-bold w-4 h-4 rounded-circle flex items-center justify-center transition-colors",
          displayCount > 0
            ? "bg-primary-container text-white"
            : "bg-surface-container-high text-on-surface-variant",
        )}
      >
        {displayCount > 99 ? "99+" : displayCount}
      </span>
    </Link>
  );
}
