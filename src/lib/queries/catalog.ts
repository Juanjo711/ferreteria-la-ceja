import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ProductCardView, ProductDetailView } from "@/types/product";

// =======================================================================
// Vistas y conversores
// =======================================================================

const PRODUCT_CARD_SELECT = {
  id: true,
  sku: true,
  slug: true,
  name: true,
  price: true,
  comparePrice: true,
  stock: true,
  brand: { select: { name: true } },
  images: {
    select: { url: true, alt: true },
    orderBy: { order: "asc" as const },
    take: 1,
  },
} satisfies Prisma.ProductSelect;

type RawCard = Prisma.ProductGetPayload<{ select: typeof PRODUCT_CARD_SELECT }>;

function toCardView(p: RawCard): ProductCardView {
  return {
    id: p.id,
    sku: p.sku,
    slug: p.slug,
    name: p.name,
    price: Number(p.price.toString()),
    comparePrice: p.comparePrice ? Number(p.comparePrice.toString()) : null,
    stock: p.stock,
    brandName: p.brand?.name ?? null,
    primaryImage: p.images[0] ?? null,
  };
}

// =======================================================================
// Catálogo "ligero" usado por la home y los layouts
// =======================================================================

export async function getFeaturedProducts(limit = 8): Promise<ProductCardView[]> {
  const rows = await prisma.product.findMany({
    where: { isFeatured: true, isActive: true },
    select: PRODUCT_CARD_SELECT,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(toCardView);
}

export async function getCategoriesForNav() {
  return prisma.category.findMany({
    select: { id: true, slug: true, name: true, icon: true },
    orderBy: { name: "asc" },
  });
}

export async function getBrandsForStrip() {
  return prisma.brand.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    select: { id: true, slug: true, name: true, icon: true, description: true },
  });
}

// =======================================================================
// Listado paginado con filtros + ordenamiento
// =======================================================================

export type ProductListFilters = {
  q?: string;
  categorySlug?: string;
  brandSlugs?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: "popular" | "price-asc" | "price-desc" | "recent";
  page?: number;
  perPage?: number;
};

export type ProductListResult = {
  products: ProductCardView[];
  total: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
};

function buildWhere(filters: ProductListFilters): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { isActive: true };

  if (filters.q && filters.q.trim().length > 0) {
    const q = filters.q.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
    ];
  }

  if (filters.categorySlug) {
    where.category = { slug: filters.categorySlug };
  }

  if (filters.brandSlugs && filters.brandSlugs.length > 0) {
    where.brand = { slug: { in: filters.brandSlugs } };
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
    if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
  }

  return where;
}

function buildOrderBy(
  sort: ProductListFilters["sort"],
): Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "price-asc":
      return { price: "asc" };
    case "price-desc":
      return { price: "desc" };
    case "recent":
      return { createdAt: "desc" };
    case "popular":
    default:
      // Popularidad proxy: orderItems desc → recientes para desempate.
      return [{ orderItems: { _count: "desc" } }, { createdAt: "desc" }];
  }
}

export async function getProductList(filters: ProductListFilters): Promise<ProductListResult> {
  const perPage = filters.perPage ?? 12;
  const page = Math.max(1, filters.page ?? 1);
  const where = buildWhere(filters);
  const orderBy = buildOrderBy(filters.sort);

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: PRODUCT_CARD_SELECT,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  return {
    products: rows.map(toCardView),
    total,
    totalPages,
    currentPage: Math.min(page, totalPages),
    perPage,
  };
}

// =======================================================================
// Facetas (categorías y marcas con contadores) para el sidebar de filtros
// =======================================================================

export type Facet = { slug: string; name: string; count: number };

export type CatalogFacets = {
  categories: Facet[];
  brands: Facet[];
};

/**
 * Conteos por categoría / marca aplicando los filtros actuales SALVO el
 * filtro de la propia faceta (así un usuario puede ver cuántos productos
 * habría si cambia de marca, manteniendo el resto del filtro).
 */
export async function getFilterFacets(
  filters: Omit<ProductListFilters, "page" | "perPage" | "sort">,
): Promise<CatalogFacets> {
  // Categorías: ignoramos categorySlug del filtro al contar.
  const whereForCategories = buildWhere({ ...filters, categorySlug: undefined });
  // Marcas: ignoramos brandSlugs.
  const whereForBrands = buildWhere({ ...filters, brandSlugs: undefined });

  const [allCategories, catCounts, allBrands, brandCounts] = await Promise.all([
    prisma.category.findMany({
      select: { slug: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.product.groupBy({
      by: ["categoryId"],
      where: whereForCategories,
      _count: { categoryId: true },
    }),
    prisma.brand.findMany({
      select: { slug: true, name: true, id: true },
      orderBy: { name: "asc" },
    }),
    prisma.product.groupBy({
      by: ["brandId"],
      where: whereForBrands,
      _count: { brandId: true },
    }),
  ]);

  // Mapeo categoryId → slug para enlazar conteos.
  const catRows = await prisma.category.findMany({ select: { id: true, slug: true } });
  const catIdToSlug = new Map(catRows.map((c) => [c.id, c.slug]));
  const catSlugToCount = new Map<string, number>();
  for (const c of catCounts) {
    const slug = catIdToSlug.get(c.categoryId);
    if (slug) catSlugToCount.set(slug, c._count.categoryId);
  }

  const brandIdToSlug = new Map(allBrands.map((b) => [b.id, b.slug]));
  const brandSlugToCount = new Map<string, number>();
  for (const b of brandCounts) {
    if (b.brandId) {
      const slug = brandIdToSlug.get(b.brandId);
      if (slug) brandSlugToCount.set(slug, b._count.brandId);
    }
  }

  return {
    categories: allCategories.map((c) => ({
      slug: c.slug,
      name: c.name,
      count: catSlugToCount.get(c.slug) ?? 0,
    })),
    brands: allBrands.map((b) => ({
      slug: b.slug,
      name: b.name,
      count: brandSlugToCount.get(b.slug) ?? 0,
    })),
  };
}

// =======================================================================
// Detalle + relacionados
// =======================================================================

export async function getProductBySlug(slug: string): Promise<ProductDetailView | null> {
  const p = await prisma.product.findUnique({
    where: { slug },
    select: {
      id: true,
      sku: true,
      slug: true,
      name: true,
      description: true,
      price: true,
      comparePrice: true,
      stock: true,
      isFeatured: true,
      specs: true,
      category: { select: { id: true, slug: true, name: true } },
      brand: { select: { name: true } },
      images: {
        select: { url: true, alt: true },
        orderBy: { order: "asc" },
      },
    },
  });
  if (!p) return null;

  return {
    id: p.id,
    sku: p.sku,
    slug: p.slug,
    name: p.name,
    description: p.description,
    price: Number(p.price.toString()),
    comparePrice: p.comparePrice ? Number(p.comparePrice.toString()) : null,
    stock: p.stock,
    isFeatured: p.isFeatured,
    specs: (p.specs as Record<string, string> | null) ?? null,
    category: p.category,
    brand: p.brand,
    images: p.images,
  };
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string,
  limit = 4,
): Promise<ProductCardView[]> {
  const rows = await prisma.product.findMany({
    where: {
      isActive: true,
      categoryId,
      NOT: { id: productId },
    },
    select: PRODUCT_CARD_SELECT,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(toCardView);
}
