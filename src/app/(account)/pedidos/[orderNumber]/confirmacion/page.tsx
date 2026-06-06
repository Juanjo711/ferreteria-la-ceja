import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getOrderByNumber } from "@/lib/queries/orders";
import { formatCOP, formatDateTime } from "@/lib/format";
import { PAYMENT_METHOD_LABEL } from "@/lib/orders";
import { Icon } from "@/components/ui/Icon";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

export const metadata = { title: "Pedido confirmado" };

type Params = { orderNumber: string };

export default async function ConfirmacionPage({ params }: { params: Params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) notFound();

  const order = await getOrderByNumber(params.orderNumber, session.user.id);
  if (!order) notFound();

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="text-center mb-12">
        <div className="w-20 h-20 rounded-circle bg-tertiary-container/20 text-tertiary mx-auto mb-4 flex items-center justify-center">
          <Icon name="check_circle" size={48} filled />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-2 font-headline">
          ¡Pedido confirmado!
        </h1>
        <p className="text-on-surface-variant">
          Recibimos tu pedido. Te contactaremos para coordinar la entrega o el pago contraentrega.
        </p>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6 md:p-8 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6 pb-6 border-b border-outline-variant/20">
          <div>
            <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold mb-1">
              Número de pedido
            </p>
            <p className="text-2xl font-extrabold text-brand-dark font-headline">{order.orderNumber}</p>
            <p className="text-xs text-on-surface-variant/70 mt-1">
              Creado el {formatDateTime(order.createdAt)}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
              Dirección de envío
            </p>
            <p className="font-semibold">{order.shippingAddress.nombre}</p>
            <p className="text-on-surface-variant">{order.shippingAddress.telefono}</p>
            <p className="text-on-surface-variant">{order.shippingAddress.direccion}</p>
            <p className="text-on-surface-variant">
              {order.shippingAddress.ciudad}, {order.shippingAddress.departamento}
            </p>
            {order.shippingAddress.notas && (
              <p className="text-on-surface-variant italic mt-1">
                Notas: {order.shippingAddress.notas}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
              Método de pago
            </p>
            <p className="font-semibold">
              {PAYMENT_METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod}
            </p>
            <p className="text-xs text-on-surface-variant/70 mt-2">
              {order.paymentMethod === "cash_on_delivery"
                ? "Te contactaremos para coordinar el cobro al momento de la entrega."
                : "Pago simulado. La ferretería confirmará tu pedido por teléfono o correo."}
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {order.items.map((it) => (
            <div key={it.id} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-container-low relative shrink-0">
                {it.productImage && (
                  <Image
                    src={it.productImage}
                    alt={it.productName}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{it.productName}</p>
                <p className="text-xs text-on-surface-variant">
                  SKU {it.productSku} · {it.quantity} × {formatCOP(it.unitPrice)}
                </p>
              </div>
              <p className="font-bold text-sm whitespace-nowrap">{formatCOP(it.subtotal)}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-outline-variant/20 pt-4 space-y-1 text-sm">
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

      <div className="bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-xl p-5 mb-8 text-sm flex items-start gap-3">
        <Icon name="info" filled className="text-tertiary mt-0.5" />
        <p>
          Este es un MVP académico: <strong>no se procesa ningún pago real</strong>. Tu pedido queda en
          estado <em>Pendiente</em> esperando confirmación manual por el equipo de la ferretería.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          href={`/cuenta/pedidos/${order.orderNumber}`}
          className="inline-flex items-center gap-2 bg-primary-container text-white px-6 py-3 rounded-lg font-bold hover:bg-primary transition-colors"
        >
          <Icon name="receipt_long" />
          Ver mis pedidos
        </Link>
        <Link
          href="/productos"
          className="inline-flex items-center gap-2 border-2 border-primary-container text-primary-container px-6 py-3 rounded-lg font-bold hover:bg-primary-container hover:text-white transition-colors"
        >
          <Icon name="storefront" />
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
