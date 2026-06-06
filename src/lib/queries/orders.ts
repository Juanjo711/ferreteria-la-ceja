import type { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Vistas planas (sin Decimal/Json) usadas por las páginas de historial y
 * detalle. La conversión de Decimal a number ocurre en el borde del servidor.
 */

export type OrderListItemView = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  itemsCount: number;
  createdAt: Date;
};

export type OrderDetailView = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentMethod: string;
  shippingAddress: {
    nombre: string;
    telefono: string;
    direccion: string;
    ciudad: string;
    departamento: string;
    notas?: string;
  };
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    productSku: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
    productSlug: string | null;
    productImage: string | null;
  }>;
};

const ORDER_LIST_SELECT = {
  id: true,
  orderNumber: true,
  status: true,
  total: true,
  createdAt: true,
  _count: { select: { items: true } },
} satisfies Prisma.OrderSelect;

const ORDER_DETAIL_SELECT = {
  id: true,
  orderNumber: true,
  status: true,
  subtotal: true,
  shippingCost: true,
  total: true,
  paymentMethod: true,
  shippingAddress: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  items: {
    select: {
      id: true,
      productId: true,
      productName: true,
      productSku: true,
      unitPrice: true,
      quantity: true,
      subtotal: true,
      product: {
        select: {
          slug: true,
          images: {
            select: { url: true },
            orderBy: { order: "asc" as const },
            take: 1,
          },
        },
      },
    },
  },
} satisfies Prisma.OrderSelect;

export async function getUserOrders(
  userId: string,
  filters: { status?: OrderStatus } = {},
): Promise<OrderListItemView[]> {
  const rows = await prisma.order.findMany({
    where: { userId, status: filters.status },
    select: ORDER_LIST_SELECT,
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    orderNumber: r.orderNumber,
    status: r.status,
    total: Number(r.total.toString()),
    itemsCount: r._count.items,
    createdAt: r.createdAt,
  }));
}

/** Vista admin: incluye datos del cliente. */
export type AdminOrderDetailView = OrderDetailView & {
  customer: { id: string; fullName: string; email: string; phone: string | null };
};

type DetailRow = Prisma.OrderGetPayload<{ select: typeof ORDER_DETAIL_SELECT }>;

function mapDetail(row: DetailRow): OrderDetailView {
  return {
    id: row.id,
    orderNumber: row.orderNumber,
    status: row.status,
    subtotal: Number(row.subtotal.toString()),
    shippingCost: Number(row.shippingCost.toString()),
    total: Number(row.total.toString()),
    paymentMethod: row.paymentMethod,
    shippingAddress: row.shippingAddress as OrderDetailView["shippingAddress"],
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    items: row.items.map((i) => ({
      id: i.id,
      productId: i.productId,
      productName: i.productName,
      productSku: i.productSku,
      unitPrice: Number(i.unitPrice.toString()),
      quantity: i.quantity,
      subtotal: Number(i.subtotal.toString()),
      productSlug: i.product?.slug ?? null,
      productImage: i.product?.images[0]?.url ?? null,
    })),
  };
}

export async function getOrderByNumber(
  orderNumber: string,
  userId: string,
): Promise<OrderDetailView | null> {
  const row = await prisma.order.findUnique({
    where: { orderNumber },
    select: ORDER_DETAIL_SELECT,
  });
  if (!row) return null;
  const owned = await prisma.order.findFirst({
    where: { orderNumber, userId },
    select: { id: true },
  });
  if (!owned) return null;
  return mapDetail(row);
}

export async function getAdminOrderByNumber(
  orderNumber: string,
): Promise<AdminOrderDetailView | null> {
  const row = await prisma.order.findUnique({
    where: { orderNumber },
    select: { ...ORDER_DETAIL_SELECT, user: { select: { id: true, fullName: true, email: true, phone: true } } },
  });
  if (!row) return null;
  return { ...mapDetail(row), customer: row.user };
}
