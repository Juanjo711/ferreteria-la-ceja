import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getOrderByNumber } from "@/lib/queries/orders";
import { formatCOP, formatDateTime } from "@/lib/format";
import { PAYMENT_METHOD_LABEL } from "@/lib/orders";
import { Breadcrumb } from "@/components/shop/Breadcrumb";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { Icon } from "@/components/ui/Icon";

export async function generateMetadata({ params }: { params: { orderNumber: string } }) {
  return { title: `Pedido ${params.orderNumber}` };
}

export default async function OrderDetailPage({
  params,
}: {
  params: { orderNumber: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) notFound();

  const order = await getOrderByNumber(params.orderNumber, session.user.id);
  if (!order) notFound();

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Inicio", href: "/" },
          { label: "Mi cuenta", href: "/cuenta" },
          { label: "Mis pedidos", href: "/cuenta/pedidos" },
          { label: order.orderNumber },
        ]}
        className="mb-6"
      />

      <div className="max-w-4xl">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-wider font-bold text-on-surface-variant mb-1">
              Pedido
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-brand-dark font-headline">
              {order.orderNumber}
            </h1>
            <p className="text-on-surface-variant mt-1">
              Creado el {formatDateTime(order.createdAt)}
            </p>
          </div>
          <OrderStatusBadge status={order.status} className="text-sm" />
        </div>

        {/* Timeline */}
        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6 md:p-8 mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-6">
            Estado del pedido
          </h2>
          <OrderTimeline status={order.status} />
        </div>

        {/* Dirección + pago */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6">
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
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-4 flex items-center gap-2">
              <Icon name="credit_card" size={16} className="text-primary-container" />
              Método de pago
            </h2>
            <p className="font-semibold">
              {PAYMENT_METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod}
            </p>
            <p className="text-xs text-on-surface-variant/70 mt-2">
              Última actualización: {formatDateTime(order.updatedAt)}
            </p>
          </div>
        </div>

        {/* Items + totales */}
        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6 md:p-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-4">
            Productos ({order.items.length})
          </h2>
          <ul className="divide-y divide-outline-variant/20">
            {order.items.map((it) => (
              <li key={it.id} className="py-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-container-low relative shrink-0">
                  {it.productImage && (
                    <Image
                      src={it.productImage}
                      alt={it.productName}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {it.productSlug ? (
                    <Link
                      href={`/productos/${it.productSlug}`}
                      className="font-semibold hover:text-primary transition-colors"
                    >
                      {it.productName}
                    </Link>
                  ) : (
                    <p className="font-semibold">{it.productName}</p>
                  )}
                  <p className="text-xs text-on-surface-variant">
                    SKU {it.productSku} · {it.quantity} × {formatCOP(it.unitPrice)}
                  </p>
                </div>
                <p className="font-bold whitespace-nowrap">{formatCOP(it.subtotal)}</p>
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
        </div>

        <div className="mt-8">
          <Link
            href="/cuenta/pedidos"
            className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
          >
            <Icon name="arrow_back" />
            Volver a mis pedidos
          </Link>
        </div>
      </div>
    </>
  );
}
