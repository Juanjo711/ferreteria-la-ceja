import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAdminOrderByNumber } from "@/lib/queries/orders";
import { formatCOP, formatDateTime } from "@/lib/format";
import { PAYMENT_METHOD_LABEL } from "@/lib/orders";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { OrderStatusControl } from "@/components/admin/OrderStatusControl";
import { Icon } from "@/components/ui/Icon";

export async function generateMetadata({ params }: { params: { orderNumber: string } }) {
  return { title: `Pedido ${params.orderNumber} — Admin` };
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { orderNumber: string };
}) {
  const order = await getAdminOrderByNumber(params.orderNumber);
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/pedidos"
          className="text-sm text-on-surface-variant hover:text-primary inline-flex items-center gap-1"
        >
          <Icon name="arrow_back" size={16} />
          Volver al listado
        </Link>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider font-bold text-on-surface-variant mb-1">
            Pedido
          </p>
          <h1 className="text-3xl font-extrabold text-brand-dark font-headline">
            {order.orderNumber}
          </h1>
          <p className="text-on-surface-variant mt-1">
            Creado el {formatDateTime(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} className="text-sm" />
      </header>

      <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6 md:p-8">
        <h2 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-6">
          Estado
        </h2>
        <OrderTimeline status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Cliente */}
          <section className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-4 flex items-center gap-2">
              <Icon name="person" size={16} className="text-primary-container" />
              Cliente
            </h2>
            <p className="font-bold text-on-surface">{order.customer.fullName}</p>
            <p className="text-sm text-on-surface-variant">{order.customer.email}</p>
            {order.customer.phone && (
              <p className="text-sm text-on-surface-variant">{order.customer.phone}</p>
            )}
          </section>

          {/* Dirección + pago */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-4 flex items-center gap-2">
                <Icon name="location_on" size={16} className="text-primary-container" />
                Dirección de envío
              </h2>
              <p className="font-semibold">{order.shippingAddress.nombre}</p>
              <p className="text-on-surface-variant">{order.shippingAddress.telefono}</p>
              <p className="text-on-surface-variant">{order.shippingAddress.direccion}</p>
              <p className="text-on-surface-variant">
                {order.shippingAddress.ciudad}, {order.shippingAddress.departamento}
              </p>
              {order.shippingAddress.notas && (
                <p className="text-on-surface-variant italic mt-2 text-sm">
                  Notas: {order.shippingAddress.notas}
                </p>
              )}
            </section>
            <section className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-4 flex items-center gap-2">
                <Icon name="credit_card" size={16} className="text-primary-container" />
                Método de pago
              </h2>
              <p className="font-semibold">
                {PAYMENT_METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod}
              </p>
            </section>
          </div>

          {/* Items */}
          <section className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-4">
              Productos ({order.items.length})
            </h2>
            <ul className="divide-y divide-outline-variant/20">
              {order.items.map((it) => (
                <li key={it.id} className="py-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-surface-container-low relative shrink-0">
                    {it.productImage && (
                      <Image
                        src={it.productImage}
                        alt={it.productName}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{it.productName}</p>
                    <p className="text-xs text-on-surface-variant">
                      SKU {it.productSku} · {it.quantity} × {formatCOP(it.unitPrice)}
                    </p>
                  </div>
                  <p className="font-bold text-sm whitespace-nowrap">{formatCOP(it.subtotal)}</p>
                </li>
              ))}
            </ul>
            <div className="border-t border-outline-variant/20 mt-4 pt-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Subtotal</span>
                <span className="font-semibold">{formatCOP(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Envío</span>
                <span className="font-semibold">
                  {order.shippingCost === 0 ? "Gratis" : formatCOP(order.shippingCost)}
                </span>
              </div>
              <div className="flex justify-between items-end pt-2">
                <span className="text-lg font-bold">TOTAL</span>
                <span className="text-2xl font-extrabold text-primary-container">
                  {formatCOP(order.total)}
                </span>
              </div>
            </div>
          </section>

          {/* Notas / audit trail */}
          {order.notes && (
            <section className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-3 flex items-center gap-2">
                <Icon name="history" size={16} className="text-primary-container" />
                Historial / notas internas
              </h2>
              <pre className="text-xs text-on-surface-variant whitespace-pre-wrap font-mono">
                {order.notes}
              </pre>
            </section>
          )}
        </div>

        {/* Sidebar acción */}
        <aside className="lg:col-span-1">
          <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6 sticky top-24">
            <h2 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-4">
              Gestionar pedido
            </h2>
            <OrderStatusControl
              orderNumber={order.orderNumber}
              currentStatus={order.status}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
