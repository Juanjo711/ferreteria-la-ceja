import Link from "next/link";
import { OrderStatus } from "@prisma/client";
import { getAdminOrders } from "@/lib/queries/admin";
import { formatCOP, formatDateTime } from "@/lib/format";
import { ORDER_STATUS_LABEL } from "@/lib/orders";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export const metadata = { title: "Panel — Pedidos" };

type SearchParams = { status?: string; q?: string; page?: string };

function parseStatus(raw?: string): OrderStatus | undefined {
  if (!raw) return undefined;
  const upper = raw.toUpperCase();
  return upper in OrderStatus ? (upper as OrderStatus) : undefined;
}

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const status = parseStatus(searchParams.status);
  const q = searchParams.q?.trim() || undefined;
  const page = Number(searchParams.page) || 1;
  const result = await getAdminOrders({ status, q, page });
  const { orders, total, totalPages } = result;
  const currentPage = result.page;

  const tabs: Array<{ key: OrderStatus | "ALL"; label: string }> = [
    { key: "ALL", label: "Todos" },
    { key: OrderStatus.PENDING, label: ORDER_STATUS_LABEL.PENDING },
    { key: OrderStatus.CONFIRMED, label: ORDER_STATUS_LABEL.CONFIRMED },
    { key: OrderStatus.DISPATCHED, label: ORDER_STATUS_LABEL.DISPATCHED },
    { key: OrderStatus.DELIVERED, label: ORDER_STATUS_LABEL.DELIVERED },
    { key: OrderStatus.CANCELLED, label: ORDER_STATUS_LABEL.CANCELLED },
  ];

  function buildHref(changes: Partial<SearchParams>): string {
    const params = new URLSearchParams();
    const next = { status: searchParams.status, q: searchParams.q, page: undefined, ...changes };
    if (next.status) params.set("status", next.status);
    if (next.q) params.set("q", next.q);
    if (next.page && Number(next.page) > 1) params.set("page", String(next.page));
    const qs = params.toString();
    return qs ? `/admin/pedidos?${qs}` : "/admin/pedidos";
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold text-on-surface font-headline">Pedidos</h1>
        <p className="text-on-surface-variant">
          {total === 1 ? "1 pedido" : `${total} pedidos`} en el filtro actual.
        </p>
      </header>

      <form action="/admin/pedidos" method="get" className="flex flex-wrap gap-2">
        {status && <input type="hidden" name="status" value={status} />}
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por número de pedido, cliente o correo…"
          className="flex-1 min-w-[280px] bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/40"
        />
        <button
          type="submit"
          className="bg-primary-container text-white px-5 py-2 rounded-lg font-semibold hover:bg-primary transition-colors"
        >
          Buscar
        </button>
      </form>

      <nav aria-label="Filtrar por estado" className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = t.key === "ALL" ? !status : status === t.key;
          const href =
            t.key === "ALL" ? buildHref({ status: undefined }) : buildHref({ status: t.key });
          return (
            <Link
              key={t.key}
              href={href}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-semibold transition-colors",
                active
                  ? "bg-primary-container text-white"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container",
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        {orders.length === 0 ? (
          <div className="text-center py-16 px-6">
            <Icon name="receipt_long" size={48} className="text-on-surface-variant/40 inline-block mb-3" />
            <p className="text-on-surface-variant">No hay pedidos con esos filtros.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low text-secondary text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Pedido</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-on-surface">
                      {o.orderNumber}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium">{o.customerName}</p>
                      <p className="text-xs text-on-surface-variant/70">{o.customerEmail}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary">
                      {formatDateTime(o.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary">{o.itemsCount}</td>
                    <td className="px-6 py-4 text-sm font-bold">{formatCOP(o.total)}</td>
                    <td className="px-6 py-4">
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/pedidos/${o.orderNumber}`}
                        className="inline-flex items-center gap-1 text-primary font-semibold hover:underline"
                      >
                        Gestionar
                        <Icon name="arrow_forward" size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {totalPages > 1 && (
        <nav className="flex justify-center gap-2" aria-label="Paginación">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildHref({ page: String(p) })}
              className={cn(
                "w-10 h-10 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors",
                p === currentPage
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container hover:bg-surface-container-high",
              )}
            >
              {p}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
