"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { Prisma, Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productFormSchema, type ProductFormInput } from "@/lib/validations/product";
import { slugify } from "../../../prisma/seed/slug";

export type AdminProductResult =
  | { ok: true; id: string }
  | { ok: false; error: string; fieldErrors?: Partial<Record<keyof ProductFormInput, string>> };

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return null;
  }
  return session.user;
}

function specsToJson(specs: ProductFormInput["specs"]): Prisma.InputJsonValue {
  const obj: Record<string, string> = {};
  for (const s of specs) obj[s.key] = s.value;
  return obj as unknown as Prisma.InputJsonValue;
}

function buildSlug(name: string, sku: string): string {
  return `${slugify(name)}-${sku.toLowerCase()}`;
}

export async function createProduct(input: ProductFormInput): Promise<AdminProductResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Sin permisos" };
  const parsed = productFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Datos inválidos", fieldErrors: collect(parsed.error.issues) };
  }
  const data = parsed.data;

  // Unicidad de SKU
  const exists = await prisma.product.findUnique({ where: { sku: data.sku } });
  if (exists) {
    return { ok: false, error: "SKU duplicado", fieldErrors: { sku: "Ya existe un producto con este SKU" } };
  }

  try {
    const product = await prisma.product.create({
      data: {
        sku: data.sku.toUpperCase(),
        slug: buildSlug(data.name, data.sku),
        name: data.name,
        description: data.description,
        price: new Prisma.Decimal(data.price),
        comparePrice: data.comparePrice ? new Prisma.Decimal(data.comparePrice) : null,
        stock: data.stock,
        minStock: data.minStock,
        categoryId: data.categoryId,
        brandId: data.brandId,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        specs: specsToJson(data.specs),
      },
      select: { id: true },
    });
    revalidatePath("/admin/productos");
    revalidatePath("/admin");
    return { ok: true, id: product.id };
  } catch (e) {
    console.error("[admin] createProduct error:", e);
    return { ok: false, error: "No pudimos crear el producto." };
  }
}

export async function updateProduct(
  id: string,
  input: ProductFormInput,
): Promise<AdminProductResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Sin permisos" };
  const parsed = productFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Datos inválidos", fieldErrors: collect(parsed.error.issues) };
  }
  const data = parsed.data;

  // Si el SKU cambió, verifica unicidad
  const existing = await prisma.product.findUnique({ where: { id }, select: { sku: true } });
  if (!existing) return { ok: false, error: "Producto no encontrado" };
  if (existing.sku !== data.sku.toUpperCase()) {
    const dup = await prisma.product.findUnique({ where: { sku: data.sku.toUpperCase() } });
    if (dup) {
      return {
        ok: false,
        error: "SKU duplicado",
        fieldErrors: { sku: "Ya existe un producto con este SKU" },
      };
    }
  }

  try {
    await prisma.product.update({
      where: { id },
      data: {
        sku: data.sku.toUpperCase(),
        slug: buildSlug(data.name, data.sku),
        name: data.name,
        description: data.description,
        price: new Prisma.Decimal(data.price),
        comparePrice: data.comparePrice ? new Prisma.Decimal(data.comparePrice) : null,
        stock: data.stock,
        minStock: data.minStock,
        categoryId: data.categoryId,
        brandId: data.brandId,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        specs: specsToJson(data.specs),
      },
    });
    revalidatePath("/admin/productos");
    revalidatePath(`/admin/productos/${id}`);
    revalidatePath("/admin");
    return { ok: true, id };
  } catch (e) {
    console.error("[admin] updateProduct error:", e);
    return { ok: false, error: "No pudimos actualizar el producto." };
  }
}

/**
 * Borrado lógico: ponemos isActive=false. Conservamos historial de
 * pedidos y referencias. El admin puede reactivar más tarde.
 */
export async function toggleProductActive(id: string): Promise<AdminProductResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Sin permisos" };
  const product = await prisma.product.findUnique({ where: { id }, select: { isActive: true } });
  if (!product) return { ok: false, error: "Producto no encontrado" };
  await prisma.product.update({
    where: { id },
    data: { isActive: !product.isActive },
  });
  revalidatePath("/admin/productos");
  return { ok: true, id };
}

function collect(
  issues: readonly { path: readonly PropertyKey[]; message: string }[],
): Partial<Record<keyof ProductFormInput, string>> {
  const fe: Partial<Record<keyof ProductFormInput, string>> = {};
  for (const i of issues) {
    const key = i.path[0];
    if (typeof key === "string" && !(key in fe)) {
      (fe as Record<string, string>)[key] = i.message;
    }
  }
  return fe;
}
