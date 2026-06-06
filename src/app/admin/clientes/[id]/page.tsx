import Link from "next/link";
import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatCOP, formatDateTime } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { PromoteToAdminButton } from "@/components/admin/PromoteToAdminButton";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const u = await prisma.user.findUnique({ where: { id: params.id }, select: { fullName: true } });
  return { title: u ? `${u.fullName} — Cliente` : "Cliente" };
}

export default async function AdminClienteDetailPage({ params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      role: true,
      createdAt: true,
      orders: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });
  if (!user) notFound();

  const totalSpent = user.orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((acc, o) => acc + Number(o.total.toString()), 0);

  return (
    <div className="space-y-6 max-w-5xl">
      <Link
        href="/admin/clientes"
        className="text-sm text-on-surface-variant hover:text-primary inline-flex items-center gap-1"
      >
        <Icon name="arrow_back" size={16} /> Volver a clientes
      </Link>

      <header className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/20">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-on-surface font-headline">
              {user.fullName}
            </h1>
            <p className="text-on-surface-variant text-sm mt-1">{user.email}</p>
            {user.phone && (
              <p className="text-on-surface-variant text-sm">{user.phone}</p>
            )}
            <p className="text-on-surface-variant/70 text-xs mt-2">
              Cliente desde {formatDateTime(user.createdAt)}
            </p>
          </div>
          <div className="space-y-2 text-right">
            <span
              className={
                user.role === Role.ADMIN
                  ? "inline-block px-3 py-1 rounded-full text-xs font-bold bg-primary-container/20 text-primary"
                  : "inline-block px-3 py-1 rounded-full text-xs font-bold bg-tertiary-fixed text-on-tertiary-fixed-variant"
              }
            >
              {user.role}
            </span>
            <p className="text-xs text-on-surface-variant">Total gastado</p>
            <p className="text-2xl font-extrabold text-primary-container">{formatCOP(totalSpent)}</p>
          </div>
        </div>
        {user.role === Role.CLIENT && (
          <div className="mt-6 pt-6 border-t border-outline-variant/20">
            <p className="text-sm text-on-surface-variant mb-3">
              Promover este usuario le daría acceso completo al panel administrativo.
            </p>
            <PromoteToAdminButton userId={user.id} email={user.email} />
          </div>
        )}
      </header>

      <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden">
        <div className="p-6 border-b border-outline-variant/10">
          <h2 className="text-lg font-bold font-headline">Pedidos del cliente</h2>
          <p className="text-sm text-on-surface-variant">
            {user.orders.length === 0
              ? "Aún no ha realizado pedidos."
              : `${user.orders.length} ${user.orders.length === 1 ? "pedido" : "pedidos"} en total.`}
          </p>
        </div>
        {user.orders.length > 0 && (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low text-secondary text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Pedido</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {user.orders.map((o) => (
                <tr key={o.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4 text-sm font-bold">{o.orderNumber}</td>
                  <td className="px-6 py-4 text-sm text-secondary">{formatDateTime(o.createdAt)}</td>
                  <td className="px-6 py-4 text-sm font-bold">
                    {formatCOP(Number(o.total.toString()))}
                  </td>
                  <td className="px-6 py-4">
                    <OrderStatusBadge status={o.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/pedidos/${o.orderNumber}`}
                      className="text-primary font-semibold hover:underline text-sm"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
