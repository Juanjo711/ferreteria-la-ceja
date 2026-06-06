import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { OrderStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { getUserOrders } from "@/lib/queries/orders";
import { formatCOP, formatDateTime } from "@/lib/format";
import { ORDER_STATUS_LABEL } from "@/lib/orders";
import { Breadcrumb } from "@/components/shop/Breadcrumb";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export const metadata = { title: "Mis pedidos" };

type SearchParams = { status?: string };

function parseStatus(raw?: string): OrderStatus | undefined {
  if (!raw) return undefined;
  const upper = raw.toUpperCase();
  return upper in OrderStatus ? (upper as OrderStatus) : undefined;
}

export default async function MisPedidosPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const status = parseStatus(searchParams.status);
  const orders = await getUserOrders(session.user.id, { status });

  const filterTabs: Array<{ key: OrderStatus | "ALL"; label: string }> = [
    { key: "ALL", label: "Todos" },
    { key: OrderStatus.PENDING, label: ORDER_STATUS_LABEL.PENDING },
    { key: OrderStatus.CONFIRMED, label: ORDER_STATUS_LABEL.CONFIRMED },
    { key: OrderStatus.DISPATCHED, label: ORDER_STATUS_LABEL.DISPATCHED },
    { key: OrderStatus.DELIVERED, label: ORDER_STATUS_LABEL.DELIVERED },
    { key: OrderStatus.CANCELLED, label: ORDER_STATUS_LABEL.CANCELLED },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Inicio", href: "/" },
          { label: "Mi cuenta", href: "/cuenta" },
          { label: "Mis pedidos" },
        ]}
        className="mb-6"
      />

      <div className="max-w-5xl">
        <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-2 font-headline">
          Mis pedidos
        </h1>
        <p className="text-on-surface-variant mb-8">
          Aquí encontrarás el historial completo de tus compras.
        </p>

        <nav
          aria-label="Filtrar por estado"
          className="flex flex-wrap gap-2 mb-8 border-b border-outline-variant/20 pb-4"
        >
          {filterTabs.map((tab) => {
            const isActive =
              tab.key === "ALL" ? !status : status === tab.key;
            const href = tab.key === "ALL" ? "/cuenta/pedidos" : `/cuenta/pedidos?status=${tab.key.toLowerCase()}`;
            return (
              <Link
                key={tab.key}
                href={href}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-primary-container text-white"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container",
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {orders.length === 0 ? (
          <EmptyState filtered={Boolean(status)} />
        ) : (
          <ul className="space-y-4">
            {orders.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/cuenta/pedidos/${o.orderNumber}`}
                  className="block bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-6 hover:border-primary-container transition-colors group"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-on-surface-variant font-bold">
                        Pedido
                      </p>
                      <p className="text-xl font-extrabold text-brand-dark font-headline group-hover:text-primary transition-colors">
                        {o.orderNumber}
                      </p>
                      <p className="text-xs text-on-surface-variant/70 mt-1">
                        {formatDateTime(o.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-on-surface-variant">
                          {o.itemsCount} {o.itemsCount === 1 ? "producto" : "productos"}
                        </p>
                        <p className="text-lg font-extrabold text-primary-container">
                          {formatCOP(o.total)}
                        </p>
                      </div>
                      <OrderStatusBadge status={o.status} />
                      <Icon
                        name="chevron_right"
                        className="text-on-surface-variant/50 group-hover:text-primary transition-colors"
                      />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="text-center py-16 px-8 bg-surface-container-low rounded-2xl border border-outline-variant/20">
      <Icon
        name="receipt_long"
        size={64}
        className="text-on-surface-variant/40 inline-block mb-4"
      />
      <h2 className="text-xl font-bold text-on-surface mb-2 font-headline">
        {filtered ? "No hay pedidos con ese filtro" : "Aún no tienes pedidos"}
      </h2>
      <p className="text-on-surface-variant mb-6">
        {filtered
          ? "Prueba con otro estado o muestra todos."
          : "Cuando hagas tu primera compra aparecerá aquí."}
      </p>
      <Link
        href="/productos"
        className="inline-flex items-center gap-2 bg-primary-container text-white px-6 py-3 rounded-lg font-bold hover:bg-primary transition-colors"
      >
        <Icon name="storefront" />
        Ver productos
      </Link>
    </div>
  );
}
