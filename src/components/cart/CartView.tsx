"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/cart-store";
import { calculateCartTotals } from "@/lib/pricing";
import { formatCOP } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";

/**
 * Vista completa del carrito (cliente). Lee items del store, recalcula
 * totales con calculateCartTotals (misma función que usa el servidor en el
 * checkout), y expone controles de cantidad + eliminar + vaciar.
 */
export function CartView() {
  const items = useCartStore((s) => s.items);
  const syncing = useCartStore((s) => s.syncing);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);

  // Hydration safe: SSR renderiza vacío; cliente actualiza al montar.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const visibleItems = mounted ? items : [];

  const totals = calculateCartTotals(visibleItems);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight mb-2 font-headline">
          Carrito de compras
        </h1>
        <div className="h-1 w-24 bg-primary-container mx-auto rounded-full" />
      </div>

      {visibleItems.length === 0 ? <EmptyCart /> : (
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-12">
          {/* Tabla de items */}
          <div className="lg:col-span-7 space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-y-4">
                <thead className="hidden md:table-header-group">
                  <tr className="text-left text-secondary font-semibold uppercase text-xs tracking-wider">
                    <th className="pb-4 px-4">Producto</th>
                    <th className="pb-4 px-4">Precio</th>
                    <th className="pb-4 px-4 text-center">Cantidad</th>
                    <th className="pb-4 px-4 text-right">Subtotal</th>
                    <th className="pb-4 px-4" />
                  </tr>
                </thead>
                <tbody>
                  {visibleItems.map((item) => (
                    <tr key={item.productId} className="bg-surface-container-lowest shadow-sm rounded-xl">
                      <td className="py-6 px-4">
                        <Link
                          href={`/productos/${item.slug}`}
                          className="flex items-center gap-4 group"
                        >
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-surface-container flex-shrink-0 relative">
                            {item.imageUrl ? (
                              <Image
                                src={item.imageUrl}
                                alt={item.name}
                                fill
                                sizes="80px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-on-surface-variant/30">
                                <Icon name="image_not_supported" size={28} />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-headline font-bold text-on-surface group-hover:text-primary transition-colors">
                              {item.name}
                            </p>
                            <p className="text-xs text-secondary font-medium">SKU: {item.sku}</p>
                            {item.brandName && (
                              <p className="text-xs text-on-surface-variant/60">
                                {item.brandName}
                              </p>
                            )}
                          </div>
                        </Link>
                      </td>
                      <td className="py-6 px-4">
                        <span className="font-headline font-bold text-on-surface">
                          {formatCOP(item.price)}
                        </span>
                      </td>
                      <td className="py-6 px-4">
                        <div className="flex items-center justify-center gap-2 bg-surface-container-low rounded-lg p-1 w-32 mx-auto">
                          <button
                            type="button"
                            disabled={syncing || item.quantity <= 1}
                            onClick={() => setQuantity(item.productId, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded bg-surface-container-lowest hover:bg-white text-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="Disminuir"
                          >
                            <Icon name="remove" size={16} />
                          </button>
                          <span className="font-bold text-on-surface min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            disabled={syncing || item.quantity >= item.stock}
                            onClick={() => setQuantity(item.productId, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded bg-surface-container-lowest hover:bg-white text-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="Aumentar"
                          >
                            <Icon name="add" size={16} />
                          </button>
                        </div>
                        {item.quantity >= item.stock && (
                          <p className="text-[10px] text-center text-primary mt-1">
                            Máx: {item.stock}
                          </p>
                        )}
                      </td>
                      <td className="py-6 px-4 text-right">
                        <span className="font-headline font-extrabold text-on-surface">
                          {formatCOP(item.price * item.quantity)}
                        </span>
                      </td>
                      <td className="py-6 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => remove(item.productId)}
                          disabled={syncing}
                          aria-label={`Eliminar ${item.name}`}
                          className="text-error hover:bg-error-container/20 p-2 rounded-full transition-colors disabled:opacity-40"
                        >
                          <Icon name="close" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-4 flex flex-wrap justify-between items-center gap-4">
              <Link
                href="/productos"
                className="text-primary font-bold flex items-center gap-2 hover:-translate-x-1 transition-transform"
              >
                <Icon name="arrow_back" />
                Seguir comprando
              </Link>
              <button
                type="button"
                onClick={() => {
                  if (confirm("¿Vaciar todo el carrito?")) clear();
                }}
                disabled={syncing}
                className="text-secondary font-medium hover:text-error transition-colors disabled:opacity-40"
              >
                Vaciar carrito
              </button>
            </div>
          </div>

          {/* Resumen */}
          <aside className="lg:col-span-3">
            <div className="bg-surface-container-low rounded-2xl p-8 sticky top-24 shadow-sm">
              <h2 className="font-headline font-bold text-xl mb-6 text-on-surface">
                Resumen del pedido
              </h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-secondary">
                  <span>Subtotal ({visibleItems.length} {visibleItems.length === 1 ? "producto" : "productos"})</span>
                  <span className="font-semibold text-on-surface">{formatCOP(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-secondary">
                  <span>Envío</span>
                  <span
                    className={
                      totals.freeShipping
                        ? "font-semibold text-tertiary"
                        : "font-semibold text-on-surface"
                    }
                  >
                    {totals.freeShipping ? "Gratis" : formatCOP(totals.shippingCost)}
                  </span>
                </div>
                {!totals.freeShipping && totals.amountToFreeShipping > 0 && (
                  <p className="text-xs text-on-surface-variant bg-tertiary-fixed text-on-tertiary-fixed-variant px-3 py-2 rounded">
                    Te faltan {formatCOP(totals.amountToFreeShipping)} para envío gratis.
                  </p>
                )}
                <div className="h-px bg-outline-variant/30" />
                <div className="flex justify-between items-end">
                  <span className="text-lg font-bold text-on-surface">TOTAL</span>
                  <span className="text-3xl font-extrabold text-primary-container">
                    {formatCOP(totals.total)}
                  </span>
                </div>
              </div>
              <Link
                href="/checkout"
                className="w-full inline-flex items-center justify-center gap-3 bg-primary-container text-white font-bold py-4 rounded-lg shadow-md hover:bg-primary transition-all"
              >
                PROCEDER AL PAGO
                <Icon name="payments" />
              </Link>
              <p className="text-xs text-secondary text-center mt-4">
                Impuestos incluidos. Checkout simulado para fines académicos.
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* Beneficios */}
      <section className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-outline-variant/20 pt-16">
        <Benefit
          icon="local_shipping"
          title="Envío gratis"
          description="En compras superiores a $200.000 a nivel nacional."
        />
        <Benefit
          icon="verified_user"
          title="Pago seguro"
          description="Transacciones simuladas para fines académicos. No se procesan pagos reales."
        />
        <Benefit
          icon="assignment_return"
          title="Garantía"
          description="Productos garantizados. Comunícate con la ferretería para cambios."
        />
      </section>
    </div>
  );
}

function Benefit({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-surface-container-lowest rounded-2xl shadow-sm">
      <div className="w-14 h-14 bg-primary-fixed rounded-circle flex items-center justify-center text-primary mb-4">
        <Icon name={icon} size={28} />
      </div>
      <h3 className="font-headline font-bold text-on-surface mb-2">{title}</h3>
      <p className="text-sm text-secondary">{description}</p>
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="text-center py-16 px-8 bg-surface-container-low rounded-2xl border border-outline-variant/20 max-w-2xl mx-auto">
      <Icon
        name="shopping_cart"
        size={80}
        className="text-on-surface-variant/30 inline-block mb-4"
      />
      <h2 className="text-2xl font-bold text-on-surface mb-3 font-headline">
        Tu carrito está vacío
      </h2>
      <p className="text-on-surface-variant mb-8">
        Explora el catálogo y agrega productos para empezar tu pedido.
      </p>
      <Link
        href="/productos"
        className="inline-flex items-center gap-2 bg-primary-container text-white px-8 py-3 rounded-lg font-bold hover:bg-primary transition-colors"
      >
        <Icon name="storefront" />
        Ver productos
      </Link>
    </div>
  );
}

