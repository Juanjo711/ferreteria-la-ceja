import { prisma } from "@/lib/prisma";
import type { CartItemView } from "@/types/cart";

/**
 * Helpers para operar el carrito de un usuario autenticado en DB.
 * Los endpoints REST (src/app/api/cart/*) delegan en estos para reutilizar
 * la lógica de upsert + validación de stock + serialización a CartItemView.
 */

const CART_ITEM_SELECT = {
  productId: true,
  quantity: true,
  product: {
    select: {
      slug: true,
      sku: true,
      name: true,
      price: true,
      stock: true,
      isActive: true,
      brand: { select: { name: true } },
      images: {
        select: { url: true },
        orderBy: { order: "asc" as const },
        take: 1,
      },
    },
  },
} as const;

type RawCartItem = {
  productId: string;
  quantity: number;
  product: {
    slug: string;
    sku: string;
    name: string;
    price: { toString(): string };
    stock: number;
    isActive: boolean;
    brand: { name: string } | null;
    images: Array<{ url: string }>;
  };
};

function toView(rows: RawCartItem[]): CartItemView[] {
  return rows
    .filter((r) => r.product.isActive)
    .map((r) => ({
      productId: r.productId,
      slug: r.product.slug,
      sku: r.product.sku,
      name: r.product.name,
      price: Number(r.product.price.toString()),
      stock: r.product.stock,
      brandName: r.product.brand?.name ?? null,
      imageUrl: r.product.images[0]?.url ?? null,
      quantity: r.quantity,
    }));
}

/** Obtiene (o crea perezosamente) el carrito del usuario y devuelve sus items. */
export async function getCartItems(userId: string): Promise<CartItemView[]> {
  const cart = await prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
    select: { id: true },
  });
  const items = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    select: CART_ITEM_SELECT,
    orderBy: { addedAt: "asc" },
  });
  return toView(items);
}

/** Suma `quantity` al producto en el carrito; lo crea si no existía. */
export async function addToCart(
  userId: string,
  productId: string,
  quantity: number,
): Promise<CartItemView[]> {
  if (quantity < 1) throw new Error("quantity debe ser >= 1");

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, isActive: true, stock: true },
  });
  if (!product || !product.isActive) throw new Error("Producto no disponible");

  const cart = await prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
    select: { id: true },
  });

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
    select: { quantity: true },
  });
  const nextQty = Math.min(product.stock, (existing?.quantity ?? 0) + quantity);

  if (existing) {
    await prisma.cartItem.update({
      where: { cartId_productId: { cartId: cart.id, productId } },
      data: { quantity: nextQty },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity: nextQty },
    });
  }

  return getCartItems(userId);
}

/** Establece la cantidad exacta para un producto (capada al stock). */
export async function setItemQuantity(
  userId: string,
  productId: string,
  quantity: number,
): Promise<CartItemView[]> {
  if (quantity < 1) return removeItem(userId, productId);

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { stock: true, isActive: true },
  });
  if (!product || !product.isActive) throw new Error("Producto no disponible");

  const cart = await prisma.cart.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!cart) return [];

  const finalQty = Math.min(product.stock, Math.max(1, quantity));

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    create: { cartId: cart.id, productId, quantity: finalQty },
    update: { quantity: finalQty },
  });
  return getCartItems(userId);
}

export async function removeItem(userId: string, productId: string): Promise<CartItemView[]> {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!cart) return [];
  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id, productId },
  });
  return getCartItems(userId);
}

export async function clearCart(userId: string): Promise<CartItemView[]> {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!cart) return [];
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  return [];
}
