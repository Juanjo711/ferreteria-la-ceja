/**
 * Parser y builder de los search params del catálogo.
 *
 * Los filtros viven 100% en la URL (no en cookies/server state). Esto hace
 * cada listado bookmarkeable y compartible, y cada link de filtro es solo
 * un cambio de query string.
 *
 * URL canónica:
 *   /productos?q=...&brand=stanley,bosch&min=10000&max=500000&sort=price-asc&page=2
 *   /productos/categoria/herramientas-electricas?... (cat se infiere del path)
 */

import type { ProductListFilters } from "@/lib/queries/catalog";

export type CatalogSort = NonNullable<ProductListFilters["sort"]>;

export const SORT_OPTIONS: Array<{ value: CatalogSort; label: string }> = [
  { value: "popular", label: "Más populares" },
  { value: "price-asc", label: "Menor precio" },
  { value: "price-desc", label: "Mayor precio" },
  { value: "recent", label: "Más recientes" },
];

const ALLOWED_SORTS = new Set<CatalogSort>(SORT_OPTIONS.map((o) => o.value));

/** En App Router, searchParams llega como `{ [key]: string | string[] | undefined }`. */
export type RawSearchParams = Record<string, string | string[] | undefined>;

function readString(raw: string | string[] | undefined): string | undefined {
  if (raw === undefined) return undefined;
  return Array.isArray(raw) ? raw[0] : raw;
}

function readNumber(raw: string | string[] | undefined): number | undefined {
  const s = readString(raw);
  if (s === undefined || s === "") return undefined;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

/**
 * Convierte searchParams crudos en un objeto tipado y saneado.
 * categorySlug se pasa por aparte (viene del path en /categoria/[slug]).
 */
export function parseCatalogParams(
  raw: RawSearchParams,
  options: { categorySlug?: string } = {},
): ProductListFilters {
  const q = readString(raw.q)?.trim();

  const brandRaw = readString(raw.brand);
  const brandSlugs = brandRaw
    ? brandRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : undefined;

  const sortRaw = readString(raw.sort) as CatalogSort | undefined;
  const sort = sortRaw && ALLOWED_SORTS.has(sortRaw) ? sortRaw : "popular";

  return {
    q: q && q.length > 0 ? q : undefined,
    categorySlug: options.categorySlug,
    brandSlugs,
    minPrice: readNumber(raw.min),
    maxPrice: readNumber(raw.max),
    sort,
    page: readNumber(raw.page) ?? 1,
    perPage: 12,
  };
}

/**
 * Construye un query string para un cambio puntual de filtros — preservando
 * los demás. Pasar `value = null` o `""` borra el parámetro.
 */
export function buildCatalogQuery(
  current: ProductListFilters,
  changes: Partial<{
    q: string | null;
    brand: string[] | null; // lista entera, no toggle
    min: number | null;
    max: number | null;
    sort: CatalogSort | null;
    page: number | null;
  }>,
): string {
  const params = new URLSearchParams();

  const q = changes.q !== undefined ? changes.q : current.q;
  if (q) params.set("q", q);

  const brands = changes.brand !== undefined ? changes.brand : current.brandSlugs;
  if (brands && brands.length > 0) params.set("brand", brands.join(","));

  const min = changes.min !== undefined ? changes.min : current.minPrice;
  if (min !== undefined && min !== null) params.set("min", String(min));

  const max = changes.max !== undefined ? changes.max : current.maxPrice;
  if (max !== undefined && max !== null) params.set("max", String(max));

  const sort = changes.sort !== undefined ? changes.sort : current.sort;
  if (sort && sort !== "popular") params.set("sort", sort);

  const page = changes.page !== undefined ? changes.page : current.page;
  if (page && page > 1) params.set("page", String(page));

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/**
 * Helper para construir la URL completa de un link de filtro (catálogo
 * general o por categoría) con los cambios indicados.
 */
export function buildCatalogUrl(
  basePath: "/productos" | `/productos/categoria/${string}`,
  current: ProductListFilters,
  changes: Parameters<typeof buildCatalogQuery>[1] = {},
): string {
  return `${basePath}${buildCatalogQuery(current, changes)}`;
}

/** Toggle de una marca: la agrega si no estaba, la quita si estaba. */
export function toggleBrand(brands: string[] | undefined, brandSlug: string): string[] {
  const set = new Set(brands ?? []);
  if (set.has(brandSlug)) set.delete(brandSlug);
  else set.add(brandSlug);
  return [...set];
}
