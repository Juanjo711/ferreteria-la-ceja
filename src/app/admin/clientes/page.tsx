import Link from "next/link";
import { getAdminCustomers } from "@/lib/queries/admin";
import { formatCOP, formatDateTime } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export const metadata = { title: "Panel — Clientes" };

type SearchParams = { q?: string; page?: string };

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function AdminClientesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const q = searchParams.q?.trim() || undefined;
  const page = Number(searchParams.page) || 1;
  const result = await getAdminCustomers({ q, page });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold text-on-surface font-headline">Clientes</h1>
        <p className="text-on-surface-variant">{result.total} usuarios registrados.</p>
      </header>

      <form action="/admin/clientes" method="get" className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por nombre o correo…"
          className="flex-1 bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/40"
        />
        <button
          type="submit"
          className="bg-primary-container text-white px-5 py-2 rounded-lg font-semibold hover:bg-primary transition-colors"
        >
          Buscar
        </button>
      </form>

      <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        {result.customers.length === 0 ? (
          <p className="text-center text-on-surface-variant py-12">Sin resultados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low text-secondary text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Rol</th>
                  <th className="px-6 py-4">Registrado</th>
                  <th className="px-6 py-4">Pedidos</th>
                  <th className="px-6 py-4">Total gastado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {result.customers.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-circle bg-primary-fixed text-primary flex items-center justify-center text-xs font-bold">
                          {initials(c.fullName) || "?"}
                        </div>
                        <div>
                          <p className="font-bold">{c.fullName}</p>
                          <p className="text-xs text-on-surface-variant">{c.email}</p>
                          {c.phone && (
                            <p className="text-xs text-on-surface-variant/70">{c.phone}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                          c.role === "ADMIN"
                            ? "bg-primary-container/20 text-primary"
                            : "bg-tertiary-fixed text-on-tertiary-fixed-variant",
                        )}
                      >
                        {c.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary">
                      {formatDateTime(c.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm">{c.ordersCount}</td>
                    <td className="px-6 py-4 text-sm font-bold">{formatCOP(c.totalSpent)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/clientes/${c.id}`}
                        className="inline-flex items-center gap-1 text-primary font-semibold hover:underline"
                      >
                        Ver
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

      {result.totalPages > 1 && (
        <nav className="flex justify-center gap-2" aria-label="Paginación">
          {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((p) => {
            const params = new URLSearchParams();
            if (q) params.set("q", q);
            if (p > 1) params.set("page", String(p));
            const href = params.toString() ? `/admin/clientes?${params.toString()}` : "/admin/clientes";
            return (
              <Link
                key={p}
                href={href}
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors",
                  p === result.page
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container hover:bg-surface-container-high",
                )}
              >
                {p}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
