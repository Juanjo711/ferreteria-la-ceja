/**
 * Cálculo de totales del carrito.
 *
 * Función pura, compartida cliente/servidor. La regla del MVP:
 *   - subtotal = suma de price × quantity
 *   - envío   = 0 si subtotal ≥ FREE_SHIPPING_THRESHOLD, si no FIXED_SHIPPING
 *               (excepto carrito vacío → 0)
 *   - total   = subtotal + envío
 *
 * En el checkout (Fase 6) el servidor recomputa con esta MISMA función
 * usando los productos actuales en DB — nunca confía en lo que viene del
 * cliente, sólo en sus IDs y cantidades.
 */

export const FREE_SHIPPING_THRESHOLD = 200_000;
export const FIXED_SHIPPING = 15_000;

export type PricedItem = {
  price: number;
  quantity: number;
};

export type CartTotals = {
  subtotal: number;
  shippingCost: number;
  total: number;
  freeShipping: boolean;
  /** Pesos que faltan para alcanzar envío gratis (0 si ya lo alcanza). */
  amountToFreeShipping: number;
};

export function calculateCartTotals(items: readonly PricedItem[]): CartTotals {
  const subtotal = items.reduce((acc, it) => acc + it.price * it.quantity, 0);

  if (subtotal === 0) {
    return {
      subtotal: 0,
      shippingCost: 0,
      total: 0,
      freeShipping: false,
      amountToFreeShipping: FREE_SHIPPING_THRESHOLD,
    };
  }

  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = freeShipping ? 0 : FIXED_SHIPPING;

  return {
    subtotal,
    shippingCost,
    total: subtotal + shippingCost,
    freeShipping,
    amountToFreeShipping: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
  };
}
