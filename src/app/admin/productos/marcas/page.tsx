import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BrandManager } from "@/components/admin/BrandManager";
import { Icon } from "@/components/ui/Icon";

export const metadata = { title: "Panel — Marcas" };

export default async function AdminMarcasPage() {
  const rows = await prisma.brand.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      _count: { select: { products: true } },
    },
    orderBy: { name: "asc" },
  });
  const initial = rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    productCount: r._count.products,
  }));

  return (
    <div className="space-y-6">
      <Link
        href="/admin/productos"
        className="text-sm text-on-surface-variant hover:text-primary inline-flex items-center gap-1"
      >
        <Icon name="arrow_back" size={16} /> Volver a productos
      </Link>
      <header>
        <h1 className="text-3xl font-extrabold text-on-surface font-headline">Marcas</h1>
        <p className="text-on-surface-variant">{initial.length} marcas registradas.</p>
      </header>
      <BrandManager initial={initial} />
    </div>
  );
}
