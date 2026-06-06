import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { Icon } from "@/components/ui/Icon";

export const metadata = { title: "Panel — Nuevo producto" };

export default async function NuevoProductoPage() {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.brand.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6 max-w-4xl">
      <Link
        href="/admin/productos"
        className="text-sm text-on-surface-variant hover:text-primary inline-flex items-center gap-1"
      >
        <Icon name="arrow_back" size={16} /> Volver
      </Link>
      <h1 className="text-3xl font-extrabold text-on-surface font-headline">Nuevo producto</h1>
      <p className="text-on-surface-variant">
        Crea el producto primero. Las imágenes se suben en la siguiente pantalla.
      </p>
      <ProductForm mode="create" categories={categories} brands={brands} />
    </div>
  );
}
