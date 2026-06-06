/**
 * Marcas internacionales que la ferretería distribuye.
 * No todas las categorías tienen marca; tornillería y construcción a
 * granel suelen ir sin marca específica (brandSlug = null en products.ts).
 */
export type BrandSeed = {
  slug: string;
  name: string;
};

export const brands: readonly BrandSeed[] = [
  { slug: "dewalt", name: "DeWalt" },
  { slug: "stanley", name: "Stanley" },
  { slug: "bosch", name: "Bosch" },
  { slug: "makita", name: "Makita" },
  { slug: "milwaukee", name: "Milwaukee" },
  { slug: "black-and-decker", name: "Black & Decker" },
] as const;
