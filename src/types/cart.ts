import type { CartTotals } from "@/lib/pricing";

/**
 * Item del carrito tal como vive en el store (y se persiste en localStorage).
 *
 * Llevamos un snapshot de cada producto (nombre, precio, sku, slug, imagen,
 * stock al momento de añadir) para que el carrito sea renderizable sin un
 * round-trip a la base: la página /carrito se pinta instantáneamente y el
 * stock se re-valida al checkout.
 */
export type CartItemView = {
  productId: string;
  slug: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  brandName: string | null;
  imageUrl: string | null;
  quantity: number;
};

export type CartView = {
  items: CartItemView[];
  totals: CartTotals;
};
