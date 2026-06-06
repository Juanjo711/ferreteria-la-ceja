/**
 * Vistas planas (sin Decimal) que viajan de Server Components a la UI.
 * Convertimos Decimal a number con .toNumber() en el borde del servidor.
 */

export type ProductCardView = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  brandName: string | null;
  primaryImage: { url: string; alt: string | null } | null;
};

export type ProductDetailView = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  isFeatured: boolean;
  specs: Record<string, string> | null;
  category: { id: string; slug: string; name: string };
  brand: { name: string } | null;
  images: Array<{ url: string; alt: string | null }>;
};
