import Link from "next/link";
import Image from "next/image";
import { getAdminProducts } from "@/lib/queries/admin";
import { formatCOP } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export const metadata = { title: "Panel — Productos" };

type SearchParams = { q?: string; page?: string };

export default async function AdminProductosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const q = searchParams.q?.trim() || undefined;
  const page = Number(searchParams.page) || 1;
  const result = await getAdminProducts({ q, page });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-on-surface font-headline">Productos</h1>
          <p className="text-on-surface-variant">{result.total} productos en el catálogo</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/productos/categorias"
            className="inline-flex items-center gap-2 bg-surface-container-low text-on-surface px-4 py-2 rounded-lg font-semibold hover:bg-surface-container transition-colors"
          >
            <Icon name="category" size={18} />
            Categorías
          </Link>
          <Link
            href="/admin/productos/marcas"
            className="inline-flex items-center gap-2 bg-surface-container-low text-on-surface px-4 py-2 rounded-lg font-semibold hover:bg-surface-container transition-colors"
          >
            <Icon name="branding_watermark" size={18} />
            Marcas
          </Link>
          <Link
            href="/admin/productos/nuevo"
            className="inline-flex items-center gap-2 bg-primary-container text-white px-5 py-2 rounded-lg font-bold hover:bg-primary transition-colors"
          >
            <Icon name="add" />
            Nuevo producto
          </Link>
        </div>
      </header>

      <form action="/admin/productos" method="get" className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por SKU o nombre…"
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
        <div className="overflow-x-auto">
          {result.products.length === 0 ? (
            <p className="text-center text-on-surface-variant py-12">Sin resultados.</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low text-secondary text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Producto</th>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4">Precio</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {result.products.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-surface-container rounded-lg overflow-hidden relative shrink-0">
                          {p.imageUrl ? (
                            <Image src={p.imageUrl} alt={p.name} fill sizes="48px" className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Icon name="inventory_2" size={20} className="text-on-surface-variant/40" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-on-surface truncate max-w-xs">{p.name}</p>
                          <p className="text-xs text-on-surface-variant">
                            {p.brandName ?? "Sin marca"} · {p.imagesCount} {p.imagesCount === 1 ? "imagen" : "imágenes"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono">{p.sku}</td>
                    <td className="px-6 py-4 text-sm text-secondary">{p.categoryName}</td>
                    <td className="px-6 py-4 text-sm font-bold">{formatCOP(p.price)}</td>
                    <td className="px-6 py-4 text-sm">{p.stock}</td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                          p.isActive
                            ? "bg-tertiary-fixed text-on-tertiary-fixed-variant"
                            : "bg-surface-container-high text-on-surface-variant",
                        )}
                      >
                        {p.isActive ? "Activo" : "Inactivo"}
                      </span>
                      {p.isFeatured && (
                        <span className="ml-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-primary-container/20 text-primary">
                          Destacado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/productos/${p.id}`}
                        className="inline-flex items-center gap-1 text-primary font-semibold hover:underline"
                      >
                        Editar
                        <Icon name="edit" size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {result.totalPages > 1 && (
        <nav className="flex justify-center gap-2" aria-label="Paginación">
          {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((p) => {
            const params = new URLSearchParams();
            if (q) params.set("q", q);
            if (p > 1) params.set("page", String(p));
            const href = params.toString() ? `/admin/productos?${params.toString()}` : "/admin/productos";
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
