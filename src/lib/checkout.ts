import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { calculateCartTotals } from "@/lib/pricing";
import { generateOrderNumber } from "@/lib/orders";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations/checkout";

export type CreateOrderResult =
  | { ok: true; orderNumber: string }
  | {
      ok: false;
      formError?: string;
      fieldErrors?: Record<string, string>;
      stockIssues?: Array<{
        productId: string;
        name: string;
        available: number;
        requested: number;
      }>;
    };

/**
 * Núcleo de la creación de pedidos.
 *
 * Toma userId explícito y NO accede a la sesión — eso lo hace la server
 * action que envuelve esta función. Así podemos testearla directamente.
 *
 * Pasos:
 *   1. Valida input con Zod.
 *   2. Lee carrito desde DB.
 *   3. Verifica stock y disponibilidad por producto.
 *   4. Recomputa pricing con calculateCartTotals.
 *   5. Transacción atómica: orderNumber → Order + OrderItems → decrement
 *      stock con guard → vacía carrito.
 */
export async function createOrderForUser(
  userId: string,
  input: CheckoutInput,
): Promise<CreateOrderResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".");
      if (!(path in fieldErrors)) fieldErrors[path] = issue.message;
    }
    return { ok: false, fieldErrors };
  }
  const { shippingAddress, paymentMethod } = parsed.data;

  const cart = await prisma.cart.findUnique({
    where: { userId },
    select: {
      items: {
        select: {
          quantity: true,
          productId: true,
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              price: true,
              stock: true,
              isActive: true,
            },
          },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    return { ok: false, formError: "Tu carrito está vacío." };
  }

  const stockIssues: NonNullable<Extract<CreateOrderResult, { ok: false }>["stockIssues"]> = [];
  const pricedItems = cart.items.map((it) => {
    if (!it.product.isActive) {
      stockIssues.push({
        productId: it.productId,
        name: it.product.name,
        available: 0,
        requested: it.quantity,
      });
    } else if (it.product.stock < it.quantity) {
      stockIssues.push({
        productId: it.productId,
        name: it.product.name,
        available: it.product.stock,
        requested: it.quantity,
      });
    }
    return {
      productId: it.productId,
      productName: it.product.name,
      productSku: it.product.sku,
      unitPrice: Number(it.product.price.toString()),
      quantity: it.quantity,
    };
  });

  if (stockIssues.length > 0) {
    return {
      ok: false,
      formError:
        "Algunos productos cambiaron de stock o disponibilidad. Ajusta tu carrito antes de continuar.",
      stockIssues,
    };
  }

  const totals = calculateCartTotals(
    pricedItems.map((i) => ({ price: i.unitPrice, quantity: i.quantity })),
  );

  try {
    const year = new Date().getFullYear();
    const order = await prisma.$transaction(async (tx) => {
      const orderNumber = await generateOrderNumber(tx, year);

      const created = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: "PENDING",
          subtotal: new Prisma.Decimal(totals.subtotal),
          shippingCost: new Prisma.Decimal(totals.shippingCost),
          total: new Prisma.Decimal(totals.total),
          shippingAddress: shippingAddress as unknown as Prisma.InputJsonValue,
          paymentMethod,
          items: {
            create: pricedItems.map((i) => ({
              productId: i.productId,
              productName: i.productName,
              productSku: i.productSku,
              unitPrice: new Prisma.Decimal(i.unitPrice),
              quantity: i.quantity,
              subtotal: new Prisma.Decimal(i.unitPrice * i.quantity),
            })),
          },
        },
        select: { orderNumber: true },
      });

      for (const item of pricedItems) {
        const result = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (result.count === 0) {
          throw new Error(`STOCK_RACE:${item.productId}`);
        }
      }

      await tx.cartItem.deleteMany({ where: { cart: { userId } } });
      return created;
    });

    return { ok: true, orderNumber: order.orderNumber };
  } catch (error) {
    console.error("[checkout] createOrderForUser error:", error);
    if (error instanceof Error && error.message.startsWith("STOCK_RACE:")) {
      return {
        ok: false,
        formError:
          "El stock cambió mientras procesábamos tu pedido. Vuelve al carrito y revisa las cantidades.",
      };
    }
    return {
      ok: false,
      formError: "No pudimos procesar tu pedido. Inténtalo de nuevo en unos minutos.",
    };
  }
}
