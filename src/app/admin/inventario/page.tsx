import Link from "next/link";
import Image from "next/image";
import { getInventoryRows } from "@/lib/queries/admin";
import { StockAdjustModal } from "@/components/admin/StockAdjustModal";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export const metadata = { title: "Panel — Inventario" };

type SearchParams = { q?: string; low?: string; page?: string };

export default async function AdminInventarioPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const onlyLow = searchParams.low === "1";
  const q = searchParams.q?.trim() || undefined;
  const page = Number(searchParams.page) || 1;
  const result = await getInventoryRows({ onlyLow, q, page });

  function hrefFor(changes: Partial<SearchParams>) {
    const next = { q: searchParams.q, low: searchParams.low, page: undefined, ...changes };
    const params = new URLSearchParams();
    if (next.q) params.set("q", next.q);
    if (next.low) params.set("low", next.low);
    if (next.page && Number(next.page) > 1) params.set("page", String(next.page));
    const qs = params.toString();
    return qs ? `/admin/inventario?${qs}` : "/admin/inventario";
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold text-on-surface font-headline">Inventario</h1>
        <p className="text-on-surface-variant">
          {result.total} {result.total === 1 ? "producto" : "productos"} en el filtro actual.
        </p>
      </header>

      <form action="/admin/inventario" method="get" className="flex flex-wrap gap-2 items-center">
        {onlyLow && <input type="hidden" name="low" value="1" />}
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por nombre o SKU…"
          className="flex-1 min-w-[280px] bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/40"
        />
        <button
          type="submit"
          className="bg-primary-container text-white px-5 py-2 rounded-lg font-semibold hover:bg-primary transition-colors"
        >
          Buscar
        </button>
        <Link
          href={hrefFor({ low: onlyLow ? undefined : "1" })}
          className={cn(
            "px-4 py-2 rounded-lg font-semibold text-sm transition-colors",
            onlyLow
              ? "bg-error text-white hover:bg-error/90"
              : "bg-surface-container-low text-on-surface hover:bg-surface-container",
          )}
        >
          <Icon name="warning" size={16} className="inline mr-1" />
          {onlyLow ? "Mostrando solo bajo" : "Solo stock bajo"}
        </Link>
      </form>

      <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {result.items.length === 0 ? (
            <p className="text-center text-on-surface-variant py-12">Sin resultados.</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low text-secondary text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Producto</th>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4 text-right">Stock</th>
                  <th className="px-6 py-4 text-right">Mínimo</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {result.items.map((p) => {
                  const out = p.stock <= 0;
                  const low = !out && p.stock <= p.minStock;
                  return (
                    <tr key={p.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-surface-container relative overflow-hidden shrink-0 flex items-center justify-center">
                            {p.imageUrl ? (
                              <Image src={p.imageUrl} alt={p.name} fill sizes="40px" className="object-cover" />
                            ) : (
                              <Icon name="inventory_2" size={18} className="text-on-surface-variant/40" />
                            )}
                          </div>
                          <p className="font-bold text-on-surface max-w-xs truncate">{p.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm">{p.sku}</td>
                      <td className="px-6 py-4 text-sm text-secondary">{p.categoryName}</td>
                      <td className="px-6 py-4 text-right font-bold">{p.stock}</td>
                      <td className="px-6 py-4 text-right text-on-surface-variant">{p.minStock}</td>
                      <td className="px-6 py-4">
                        {out ? (
                          <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-error-container text-on-error-container">
                            Agotado
                          </span>
                        ) : low ? (
                          <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-primary-container/20 text-primary">
                            Stock bajo
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-tertiary-fixed text-on-tertiary-fixed-variant">
                            OK
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <StockAdjustModal
                          productId={p.id}
                          productName={p.name}
                          currentStock={p.stock}
                          triggerLabel="Ajustar stock"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {result.totalPages > 1 && (
        <nav className="flex justify-center gap-2" aria-label="Paginación">
          {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={hrefFor({ page: String(p) })}
              className={cn(
                "w-10 h-10 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors",
                p === result.page
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
