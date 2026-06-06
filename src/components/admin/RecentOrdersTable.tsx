import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { formatCOP, formatDateTime } from "@/lib/format";
import type { RecentOrderRow } from "@/lib/queries/admin";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

export function RecentOrdersTable({ orders }: { orders: RecentOrderRow[] }) {
  return (
    <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 flex justify-between items-center border-b border-outline-variant/10">
        <div>
          <h2 className="text-lg font-bold text-on-surface font-headline">Últimos pedidos</h2>
          <p className="text-xs text-on-surface-variant">Los 5 más recientes</p>
        </div>
        <Link
          href="/admin/pedidos"
          className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
        >
          Ver todos
          <Icon name="arrow_forward" size={16} />
        </Link>
      </div>
      <div className="overflow-x-auto">
        {orders.length === 0 ? (
          <p className="text-center text-on-surface-variant py-12">
            Todavía no hay pedidos. Cuando un cliente compre, aparecerá aquí.
          </p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low text-secondary text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Pedido</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-on-surface">{o.orderNumber}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-circle bg-primary-fixed text-primary flex items-center justify-center text-[10px] font-bold">
                        {initials(o.customerName) || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{o.customerName}</p>
                        <p className="text-xs text-on-surface-variant/70">{o.customerEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-secondary">{formatDateTime(o.createdAt)}</td>
                  <td className="px-6 py-4 text-sm font-bold">{formatCOP(o.total)}</td>
                  <td className="px-6 py-4">
                    <OrderStatusBadge status={o.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/pedidos/${o.orderNumber}`}
                      className="text-secondary hover:text-primary transition-colors inline-block"
                      aria-label={`Ver pedido ${o.orderNumber}`}
                    >
                      <Icon name="visibility" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
