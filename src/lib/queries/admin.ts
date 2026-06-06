import type { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Queries específicas del panel admin. Agrupadas aquí para que un único
 * archivo concentre las preguntas que el dashboard responde.
 */

// ===================== KPIs =====================

const startOfMonth = (now = new Date()) =>
  new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);

export type AdminKpis = {
  ventasDelMes: number;
  pedidosPendientes: number;
  clientesNuevosDelMes: number;
  alertasInventario: number;
};

export async function getAdminKpis(): Promise<AdminKpis> {
  const since = startOfMonth();

  const [salesAgg, pending, newClients, lowStock] = await Promise.all([
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: { not: "CANCELLED" },
        createdAt: { gte: since },
      },
    }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.user.count({
      where: { role: "CLIENT", createdAt: { gte: since } },
    }),
    prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS count
      FROM "Product"
      WHERE "isActive" = true AND stock <= "minStock"
    `,
  ]);

  return {
    ventasDelMes: salesAgg._sum.total ? Number(salesAgg._sum.total.toString()) : 0,
    pedidosPendientes: pending,
    clientesNuevosDelMes: newClients,
    alertasInventario: Number(lowStock[0]?.count ?? 0),
  };
}

// ===================== Gráfico 7 días =====================

export type DailySales = {
  /** Fecha en formato YYYY-MM-DD para el eje X. */
  date: string;
  /** Etiqueta corta tipo "LUN", "MAR"… */
  label: string;
  total: number;
};

/**
 * Devuelve los últimos 7 días con el total de ventas (no canceladas) por día.
 * Si un día no tiene ventas, devuelve total = 0 para preservar el eje.
 */
export async function getLast7DaysSales(): Promise<DailySales[]> {
  const today = startOfDay(new Date());
  const days: DailySales[] = [];
  const ranges: Array<{ start: Date; end: Date; date: string; label: string }> = [];

  const labels = ["DOM", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB"];
  for (let i = 6; i >= 0; i--) {
    const start = new Date(today);
    start.setDate(today.getDate() - i);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);
    const yyyy = start.getFullYear();
    const mm = String(start.getMonth() + 1).padStart(2, "0");
    const dd = String(start.getDate()).padStart(2, "0");
    ranges.push({
      start,
      end,
      date: `${yyyy}-${mm}-${dd}`,
      label: labels[start.getDay()] ?? "",
    });
  }

  // Una sola query para todo el rango, luego agrupamos en JS.
  const rows = await prisma.order.findMany({
    where: {
      status: { not: "CANCELLED" },
      createdAt: {
        gte: ranges[0]!.start,
        lt: ranges[ranges.length - 1]!.end,
      },
    },
    select: { total: true, createdAt: true },
  });

  for (const r of ranges) {
    const total = rows
      .filter((row) => row.createdAt >= r.start && row.createdAt < r.end)
      .reduce((acc, row) => acc + Number(row.total.toString()), 0);
    days.push({ date: r.date, label: r.label, total });
  }
  return days;
}

// ===================== Tablas auxiliares =====================

export type RecentOrderRow = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: OrderStatus;
  createdAt: Date;
};

export async function getRecentOrders(limit = 5): Promise<RecentOrderRow[]> {
  const rows = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      orderNumber: true,
      total: true,
      status: true,
      createdAt: true,
      user: { select: { fullName: true, email: true } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    orderNumber: r.orderNumber,
    customerName: r.user.fullName,
    customerEmail: r.user.email,
    total: Number(r.total.toString()),
    status: r.status,
    createdAt: r.createdAt,
  }));
}

export type TopProductRow = {
  productId: string;
  name: string;
  categoryName: string;
  brandName: string | null;
  unitsSold: number;
  primaryImage: string | null;
};

/**
 * Top productos por unidades vendidas (suma de OrderItem.quantity sobre
 * pedidos NO cancelados).
 */
export async function getTopProducts(limit = 5): Promise<TopProductRow[]> {
  const grouped = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: { order: { status: { not: "CANCELLED" } } },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });
  if (grouped.length === 0) return [];

  const productIds = grouped.map((g) => g.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      name: true,
      category: { select: { name: true } },
      brand: { select: { name: true } },
      images: {
        select: { url: true },
        orderBy: { order: "asc" as const },
        take: 1,
      },
    },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  return grouped.flatMap((g) => {
    const p = byId.get(g.productId);
    if (!p) return [];
    return [
      {
        productId: g.productId,
        name: p.name,
        categoryName: p.category.name,
        brandName: p.brand?.name ?? null,
        unitsSold: g._sum.quantity ?? 0,
        primaryImage: p.images[0]?.url ?? null,
      },
    ];
  });
}

// ===================== Pedidos admin =====================

export type AdminOrderListItem = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: OrderStatus;
  createdAt: Date;
  itemsCount: number;
};

export type AdminOrderFilters = {
  status?: OrderStatus;
  q?: string;
  page?: number;
  perPage?: number;
};

export async function getAdminOrders(filters: AdminOrderFilters = {}) {
  const perPage = filters.perPage ?? 20;
  const page = Math.max(1, filters.page ?? 1);
  const where: Prisma.OrderWhereInput = {};
  if (filters.status) where.status = filters.status;
  if (filters.q && filters.q.trim()) {
    const q = filters.q.trim();
    where.OR = [
      { orderNumber: { contains: q, mode: "insensitive" } },
      { user: { email: { contains: q, mode: "insensitive" } } },
      { user: { fullName: { contains: q, mode: "insensitive" } } },
    ];
  }

  const [rows, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        orderNumber: true,
        total: true,
        status: true,
        createdAt: true,
        user: { select: { fullName: true, email: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  const orders: AdminOrderListItem[] = rows.map((r) => ({
    id: r.id,
    orderNumber: r.orderNumber,
    customerName: r.user.fullName,
    customerEmail: r.user.email,
    total: Number(r.total.toString()),
    status: r.status,
    createdAt: r.createdAt,
    itemsCount: r._count.items,
  }));

  return {
    orders,
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

// ===================== Clientes admin =====================

export type AdminCustomerRow = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: "CLIENT" | "ADMIN";
  createdAt: Date;
  ordersCount: number;
  totalSpent: number;
};

export async function getAdminCustomers(filters: { q?: string; page?: number } = {}) {
  const perPage = 20;
  const page = Math.max(1, filters.page ?? 1);
  const where: Prisma.UserWhereInput = {};
  if (filters.q && filters.q.trim()) {
    const q = filters.q.trim();
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { fullName: { contains: q, mode: "insensitive" } },
    ];
  }

  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        createdAt: true,
        _count: { select: { orders: true } },
        orders: {
          where: { status: { not: "CANCELLED" } },
          select: { total: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const customers: AdminCustomerRow[] = rows.map((r) => ({
    id: r.id,
    email: r.email,
    fullName: r.fullName,
    phone: r.phone,
    role: r.role,
    createdAt: r.createdAt,
    ordersCount: r._count.orders,
    totalSpent: r.orders.reduce((acc, o) => acc + Number(o.total.toString()), 0),
  }));

  return { customers, total, page, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

// ===================== Inventario =====================

export type InventoryRow = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  categoryName: string;
  brandName: string | null;
  stock: number;
  minStock: number;
  isActive: boolean;
  imageUrl: string | null;
};

export async function getInventoryRows(filters: {
  onlyLow?: boolean;
  q?: string;
  page?: number;
} = {}) {
  const perPage = 30;
  const page = Math.max(1, filters.page ?? 1);
  const where: Prisma.ProductWhereInput = {};
  if (filters.q && filters.q.trim()) {
    const q = filters.q.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
    ];
  }
  // Solo stock bajo lo manejamos como query SQL cruda porque Prisma no
  // soporta comparar columnas entre sí en where directamente para versión 5.
  const allRows = await prisma.product.findMany({
    where,
    orderBy: { name: "asc" },
    select: {
      id: true,
      sku: true,
      slug: true,
      name: true,
      stock: true,
      minStock: true,
      isActive: true,
      category: { select: { name: true } },
      brand: { select: { name: true } },
      images: { select: { url: true }, orderBy: { order: "asc" as const }, take: 1 },
    },
  });
  const filtered = filters.onlyLow ? allRows.filter((p) => p.stock <= p.minStock) : allRows;
  const total = filtered.length;
  const sliced = filtered.slice((page - 1) * perPage, page * perPage);

  const items: InventoryRow[] = sliced.map((r) => ({
    id: r.id,
    sku: r.sku,
    slug: r.slug,
    name: r.name,
    categoryName: r.category.name,
    brandName: r.brand?.name ?? null,
    stock: r.stock,
    minStock: r.minStock,
    isActive: r.isActive,
    imageUrl: r.images[0]?.url ?? null,
  }));

  return { items, total, page, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

// ===================== Productos admin (listado) =====================

export type AdminProductListItem = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  categoryName: string;
  brandName: string | null;
  price: number;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  imageUrl: string | null;
  imagesCount: number;
};

export async function getAdminProducts(filters: { q?: string; page?: number } = {}) {
  const perPage = 20;
  const page = Math.max(1, filters.page ?? 1);
  const where: Prisma.ProductWhereInput = {};
  if (filters.q && filters.q.trim()) {
    const q = filters.q.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
    ];
  }
  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        sku: true,
        slug: true,
        name: true,
        price: true,
        stock: true,
        isActive: true,
        isFeatured: true,
        category: { select: { name: true } },
        brand: { select: { name: true } },
        images: { select: { url: true }, orderBy: { order: "asc" as const }, take: 1 },
        _count: { select: { images: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);
  const products: AdminProductListItem[] = rows.map((r) => ({
    id: r.id,
    sku: r.sku,
    slug: r.slug,
    name: r.name,
    categoryName: r.category.name,
    brandName: r.brand?.name ?? null,
    price: Number(r.price.toString()),
    stock: r.stock,
    isActive: r.isActive,
    isFeatured: r.isFeatured,
    imageUrl: r.images[0]?.url ?? null,
    imagesCount: r._count.images,
  }));
  return { products, total, page, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}
