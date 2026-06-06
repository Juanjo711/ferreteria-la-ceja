"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { Role, OrderStatus, Prisma } from "@prisma/client";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canTransition } from "@/lib/orders";

const updateSchema = z.object({
  orderNumber: z.string().min(1),
  nextStatus: z.nativeEnum(OrderStatus),
  note: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type UpdateOrderStatusResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Cambia el estado de un pedido. Solo ADMIN.
 *
 * Reglas (de src/lib/orders.ts canTransition):
 *   PENDING    -> CONFIRMED | CANCELLED
 *   CONFIRMED  -> DISPATCHED | CANCELLED
 *   DISPATCHED -> DELIVERED | CANCELLED
 *   DELIVERED  -> (terminal)
 *   CANCELLED  -> (terminal, repone stock al pasar)
 *
 * Si se cancela una orden NO-cancelada, restituimos el stock de cada item
 * dentro de la misma transacción.
 */
export async function updateOrderStatus(input: {
  orderNumber: string;
  nextStatus: OrderStatus;
  note?: string;
}): Promise<UpdateOrderStatusResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return { ok: false, error: "No tienes permisos para esta acción." };
  }

  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const { orderNumber, nextStatus, note } = parsed.data;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    select: {
      id: true,
      status: true,
      notes: true,
      items: { select: { productId: true, quantity: true } },
    },
  });
  if (!order) return { ok: false, error: "Pedido no encontrado." };

  if (order.status === nextStatus) {
    return { ok: false, error: `El pedido ya está en estado ${nextStatus}.` };
  }
  if (!canTransition(order.status, nextStatus)) {
    return {
      ok: false,
      error: `No se puede pasar de ${order.status} a ${nextStatus}.`,
    };
  }

  // Audit trail simple: prepend "[timestamp ESTADO] note" a notes.
  const stamp = new Date().toISOString();
  const auditLine = `[${stamp}] ${order.status} → ${nextStatus}${note ? ` — ${note}` : ""}`;
  const newNotes = order.notes ? `${order.notes}\n${auditLine}` : auditLine;

  try {
    await prisma.$transaction(async (tx) => {
      // Si cancelamos, restituimos stock
      if (nextStatus === OrderStatus.CANCELLED && order.status !== OrderStatus.CANCELLED) {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
      await tx.order.update({
        where: { id: order.id },
        data: { status: nextStatus, notes: newNotes },
      });
    });
  } catch (e) {
    console.error("[admin] updateOrderStatus error:", e);
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      return { ok: false, error: `DB: ${e.code}` };
    }
    return { ok: false, error: "No pudimos actualizar el estado." };
  }

  revalidatePath(`/admin/pedidos/${orderNumber}`);
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
  return { ok: true };
}
