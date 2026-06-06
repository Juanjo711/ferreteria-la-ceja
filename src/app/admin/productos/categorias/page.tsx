import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { Icon } from "@/components/ui/Icon";

export const metadata = { title: "Panel — Categorías" };

export default async function AdminCategoriasPage() {
  const rows = await prisma.category.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      icon: true,
      description: true,
      _count: { select: { products: true } },
    },
    orderBy: { name: "asc" },
  });
  const initial = rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    icon: r.icon,
    description: r.description,
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
        <h1 className="text-3xl font-extrabold text-on-surface font-headline">Categorías</h1>
        <p className="text-on-surface-variant">{initial.length} categorías registradas.</p>
      </header>
      <CategoryManager initial={initial} />
    </div>
  );
}
