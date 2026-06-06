"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { Role } from "@prisma/client";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "../../../prisma/seed/slug";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== Role.ADMIN) return null;
  return session.user;
}

export type Result = { ok: true } | { ok: false; error: string };

// =========================================
// Categorías
// =========================================

const categorySchema = z.object({
  name: z.string().trim().min(2, "Mínimo 2 caracteres").max(80),
  icon: z
    .string()
    .trim()
    .min(2, "Indica un nombre de Material Symbol")
    .max(60)
    .regex(/^[a-z0-9_]+$/, "Solo minúsculas, números y guiones bajos"),
  description: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export async function upsertCategory(
  input: { id?: string; name: string; icon: string; description?: string },
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: "Sin permisos" };
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Inválido" };
  const slug = slugify(parsed.data.name);

  try {
    if (input.id) {
      // En update mantenemos el slug original a menos que sea conflicto
      await prisma.category.update({
        where: { id: input.id },
        data: {
          name: parsed.data.name,
          icon: parsed.data.icon,
          description: parsed.data.description ?? null,
        },
      });
    } else {
      // Conflicto de slug → sufijo numérico
      let finalSlug = slug;
      let i = 2;
      while (await prisma.category.findUnique({ where: { slug: finalSlug } })) {
        finalSlug = `${slug}-${i++}`;
      }
      await prisma.category.create({
        data: {
          slug: finalSlug,
          name: parsed.data.name,
          icon: parsed.data.icon,
          description: parsed.data.description ?? null,
        },
      });
    }
    revalidatePath("/admin/productos/categorias");
    return { ok: true };
  } catch (e) {
    console.error("[admin] upsertCategory:", e);
    return { ok: false, error: "Error guardando categoría" };
  }
}

export async function deleteCategory(id: string): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: "Sin permisos" };
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) {
    return {
      ok: false,
      error: `No se puede eliminar: ${count} ${count === 1 ? "producto está" : "productos están"} en esta categoría.`,
    };
  }
  try {
    await prisma.category.delete({ where: { id } });
    revalidatePath("/admin/productos/categorias");
    return { ok: true };
  } catch (e) {
    console.error("[admin] deleteCategory:", e);
    return { ok: false, error: "Error eliminando categoría" };
  }
}

// =========================================
// Marcas
// =========================================

const brandSchema = z.object({
  name: z.string().trim().min(2, "Mínimo 2 caracteres").max(80),
});

export async function upsertBrand(input: { id?: string; name: string }): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: "Sin permisos" };
  const parsed = brandSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Inválido" };
  const slug = slugify(parsed.data.name);

  try {
    if (input.id) {
      await prisma.brand.update({
        where: { id: input.id },
        data: { name: parsed.data.name },
      });
    } else {
      let finalSlug = slug;
      let i = 2;
      while (await prisma.brand.findUnique({ where: { slug: finalSlug } })) {
        finalSlug = `${slug}-${i++}`;
      }
      await prisma.brand.create({
        data: { slug: finalSlug, name: parsed.data.name },
      });
    }
    revalidatePath("/admin/productos/marcas");
    return { ok: true };
  } catch (e) {
    console.error("[admin] upsertBrand:", e);
    return { ok: false, error: "Error guardando marca" };
  }
}

export async function deleteBrand(id: string): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: "Sin permisos" };
  const count = await prisma.product.count({ where: { brandId: id } });
  if (count > 0) {
    return {
      ok: false,
      error: `No se puede eliminar: ${count} ${count === 1 ? "producto tiene" : "productos tienen"} esta marca.`,
    };
  }
  try {
    await prisma.brand.delete({ where: { id } });
    revalidatePath("/admin/productos/marcas");
    return { ok: true };
  } catch (e) {
    console.error("[admin] deleteBrand:", e);
    return { ok: false, error: "Error eliminando marca" };
  }
}
