/**
 * Ferreteria La Ceja — seed completo (Fase 1)
 *
 *   pnpm db:seed       — siembra si la base está vacía; idempotente.
 *   pnpm db:reset      — borra base + migra + corre este seed (full reset).
 *
 * Crea:
 *   - 2 usuarios (admin@ferreterialaceja.com, cliente@demo.com)
 *   - 7 categorías + 6 marcas
 *   - 50 productos con specs JSON, 8 destacados, 6 con stock < mínimo
 *   - 1–3 imágenes por producto descargadas desde picsum.photos,
 *     procesadas con sharp y guardadas en public/uploads/products/seed/
 */

import path from "node:path";
import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

import { categories } from "./seed/categories";
import { brands } from "./seed/brands";
import { products, expected } from "./seed/products";
import { slugify } from "./seed/slug";
import { downloadImage } from "./seed/downloadImage";
import { processImage } from "../src/lib/images";

const prisma = new PrismaClient();

const UPLOADS_DIR = path.resolve(process.cwd(), "public", "uploads", "products", "seed");
const PUBLIC_URL_BASE = "/uploads/products/seed";
const BCRYPT_ROUNDS = 10;

const log = (...args: unknown[]) => console.log("[seed]", ...args);

// ----------------------- 1. Validaciones rápidas --------------------------

function assertDatasetSanity(): void {
  const totalsByCategory = new Map<string, number>();
  for (const p of products) {
    totalsByCategory.set(p.categorySlug, (totalsByCategory.get(p.categorySlug) ?? 0) + 1);
  }

  const featured = products.filter((p) => p.isFeatured).length;
  const lowStock = products.filter((p) => p.stock < p.minStock).length;

  if (products.length !== expected.total) {
    throw new Error(
      `[seed] dataset roto: se esperaban ${expected.total} productos, hay ${products.length}`,
    );
  }
  if (featured !== expected.featured) {
    throw new Error(
      `[seed] dataset roto: se esperaban ${expected.featured} destacados, hay ${featured}`,
    );
  }
  if (lowStock < expected.belowMinStock) {
    throw new Error(
      `[seed] dataset roto: se esperaban ≥${expected.belowMinStock} productos con stock < mínimo, hay ${lowStock}`,
    );
  }

  const knownCategorySlugs = new Set(categories.map((c) => c.slug));
  const knownBrandSlugs = new Set(brands.map((b) => b.slug));
  for (const p of products) {
    if (!knownCategorySlugs.has(p.categorySlug)) {
      throw new Error(`[seed] producto ${p.sku}: categoría desconocida "${p.categorySlug}"`);
    }
    if (p.brandSlug && !knownBrandSlugs.has(p.brandSlug)) {
      throw new Error(`[seed] producto ${p.sku}: marca desconocida "${p.brandSlug}"`);
    }
  }
}

// ----------------------- 2. Idempotencia ----------------------------------

async function alreadySeeded(): Promise<boolean> {
  const admin = await prisma.user.count({ where: { role: Role.ADMIN } });
  const productCount = await prisma.product.count();
  return admin > 0 && productCount > 0;
}

// ----------------------- 3. Usuarios --------------------------------------

async function seedUsers(): Promise<void> {
  const adminHash = await bcrypt.hash("Admin123*", BCRYPT_ROUNDS);
  const clientHash = await bcrypt.hash("Cliente123*", BCRYPT_ROUNDS);

  await prisma.user.upsert({
    where: { email: "admin@ferreterialaceja.com" },
    update: {},
    create: {
      email: "admin@ferreterialaceja.com",
      passwordHash: adminHash,
      fullName: "Administrador Ferretería La Ceja",
      phone: "+57 604 123 4567",
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: "cliente@demo.com" },
    update: {},
    create: {
      email: "cliente@demo.com",
      passwordHash: clientHash,
      fullName: "Cliente Demo",
      phone: "+57 300 000 0000",
      role: Role.CLIENT,
    },
  });

  log("usuarios: admin + cliente demo listos");
}

// ----------------------- 4. Categorías + marcas ---------------------------

async function seedTaxonomies(): Promise<{
  categoryIdBySlug: Map<string, string>;
  brandIdBySlug: Map<string, string>;
}> {
  const categoryIdBySlug = new Map<string, string>();
  for (const c of categories) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, icon: c.icon, description: c.description },
      create: { slug: c.slug, name: c.name, icon: c.icon, description: c.description },
    });
    categoryIdBySlug.set(c.slug, row.id);
  }

  const brandIdBySlug = new Map<string, string>();
  for (const b of brands) {
    const row = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: { name: b.name },
      create: { slug: b.slug, name: b.name },
    });
    brandIdBySlug.set(b.slug, row.id);
  }

  log(`taxonomías: ${categoryIdBySlug.size} categorías, ${brandIdBySlug.size} marcas`);
  return { categoryIdBySlug, brandIdBySlug };
}

// ----------------------- 5. Productos + imágenes --------------------------

/** Determina cuántas imágenes tendrá el producto (1, 2 o 3) a partir del SKU. */
function imageCountFor(sku: string): number {
  // Hash trivial; lo único que importa es que sea determinista y reparta 1..3.
  let h = 0;
  for (const ch of sku) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return (h % 3) + 1;
}

async function ensureProductImage(
  sku: string,
  imageIndex: number,
): Promise<{ url: string; alt: string }> {
  const filename = `${sku.toLowerCase()}-${imageIndex}.webp`;
  const outputPath = path.join(UPLOADS_DIR, filename);
  const publicUrl = `${PUBLIC_URL_BASE}/${filename}`;

  // Cache: si el .webp ya existe, no re-descargamos.
  const fs = await import("node:fs/promises");
  try {
    await fs.access(outputPath);
  } catch {
    const source = `https://picsum.photos/seed/${sku.toLowerCase()}-${imageIndex}/800/800`;
    const buffer = await downloadImage(source);
    await processImage(buffer, outputPath);
  }

  return { url: publicUrl, alt: `Imagen ${imageIndex} de ${sku}` };
}

async function seedProducts(
  categoryIdBySlug: Map<string, string>,
  brandIdBySlug: Map<string, string>,
): Promise<void> {
  let created = 0;
  let imagesCreated = 0;

  for (const p of products) {
    const categoryId = categoryIdBySlug.get(p.categorySlug);
    if (!categoryId) throw new Error(`Categoría no encontrada: ${p.categorySlug}`);
    const brandId = p.brandSlug ? brandIdBySlug.get(p.brandSlug) : null;

    const slug = `${slugify(p.name)}-${p.sku.toLowerCase()}`;

    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        name: p.name,
        slug,
        description: p.description,
        price: p.price,
        comparePrice: p.comparePrice ?? null,
        stock: p.stock,
        minStock: p.minStock,
        isFeatured: p.isFeatured ?? false,
        isActive: true,
        categoryId,
        brandId,
        specs: p.specs,
      },
      create: {
        sku: p.sku,
        slug,
        name: p.name,
        description: p.description,
        price: p.price,
        comparePrice: p.comparePrice ?? null,
        stock: p.stock,
        minStock: p.minStock,
        isFeatured: p.isFeatured ?? false,
        isActive: true,
        categoryId,
        brandId,
        specs: p.specs,
      },
    });
    created++;

    // Imágenes: re-genera el set completo (idempotente — borra y vuelve a crear filas).
    await prisma.productImage.deleteMany({ where: { productId: product.id } });

    const howMany = imageCountFor(p.sku);
    for (let i = 1; i <= howMany; i++) {
      const { url, alt } = await ensureProductImage(p.sku, i);
      await prisma.productImage.create({
        data: { productId: product.id, url, alt, order: i - 1 },
      });
      imagesCreated++;
    }

    if (created % 10 === 0) log(`progreso: ${created}/${products.length} productos…`);
  }

  log(`productos: ${created} creados/actualizados, ${imagesCreated} imágenes registradas`);
}

// ----------------------- 6. Main ------------------------------------------

async function main(): Promise<void> {
  log("iniciando seed…");
  assertDatasetSanity();

  // Si la base ya está sembrada y no es un reset, salimos sin hacer ruido.
  if (await alreadySeeded()) {
    log("La base ya está sembrada. Para regenerar usa: pnpm db:reset");
    return;
  }

  await seedUsers();
  const { categoryIdBySlug, brandIdBySlug } = await seedTaxonomies();
  await seedProducts(categoryIdBySlug, brandIdBySlug);

  log("seed completado.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("[seed] error:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
