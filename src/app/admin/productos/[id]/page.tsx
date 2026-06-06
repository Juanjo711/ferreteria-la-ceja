import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm, ProductImagesManager } from "@/components/admin/ProductForm";
import { Icon } from "@/components/ui/Icon";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const p = await prisma.product.findUnique({
    where: { id: params.id },
    select: { name: true },
  });
  return { title: p ? `Editar ${p.name}` : "Producto" };
}

export default async function EditarProductoPage({ params }: { params: { id: string } }) {
  const [product, categories, brands] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        sku: true,
        slug: true,
        name: true,
        description: true,
        price: true,
        comparePrice: true,
        stock: true,
        minStock: true,
        isActive: true,
        isFeatured: true,
        categoryId: true,
        brandId: true,
        specs: true,
        images: {
          select: { id: true, url: true, alt: true },
          orderBy: { order: "asc" },
        },
      },
    }),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.brand.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  const specsObj = (product.specs as Record<string, string> | null) ?? {};
  const specs = Object.entries(specsObj).map(([key, value]) => ({ key, value }));

  return (
    <div className="space-y-6 max-w-5xl">
      <Link
        href="/admin/productos"
        className="text-sm text-on-surface-variant hover:text-primary inline-flex items-center gap-1"
      >
        <Icon name="arrow_back" size={16} /> Volver al listado
      </Link>
      <header>
        <h1 className="text-3xl font-extrabold text-on-surface font-headline">{product.name}</h1>
        <p className="text-on-surface-variant text-sm">
          SKU <span className="font-mono">{product.sku}</span> · slug{" "}
          <span className="font-mono">{product.slug}</span>
        </p>
      </header>

      <ProductImagesManager productId={product.id} images={product.images} />

      <ProductForm
        mode="edit"
        productId={product.id}
        categories={categories}
        brands={brands}
        initial={{
          sku: product.sku,
          name: product.name,
          description: product.description,
          price: Number(product.price.toString()),
          comparePrice: product.comparePrice ? Number(product.comparePrice.toString()) : null,
          stock: product.stock,
          minStock: product.minStock,
          categoryId: product.categoryId,
          brandId: product.brandId,
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          specs: specs.length > 0 ? specs : [{ key: "", value: "" }],
        }}
      />
    </div>
  );
}
