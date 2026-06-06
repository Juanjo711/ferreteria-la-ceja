import type { Prisma, OrderStatus } from "@prisma/client";

/**
 * Genera el siguiente orderNumber atómicamente dentro de una transacción
 * Prisma. Formato: FLC-YYYY-NNNNNN.
 *
 * Usa la tabla OrderSequence (year @id, lastNumber) con upsert + increment.
 * El increment es atómico a nivel de Postgres y la transacción asegura que
 * dos pedidos concurrentes nunca compartan número.
 */
export async function generateOrderNumber(
  tx: Prisma.TransactionClient,
  year: number,
): Promise<string> {
  const seq = await tx.orderSequence.upsert({
    where: { year },
    create: { year, lastNumber: 1 },
    update: { lastNumber: { increment: 1 } },
  });
  return `FLC-${year}-${String(seq.lastNumber).padStart(6, "0")}`;
}

/**
 * Transiciones válidas del estado de un pedido. Se usa en el admin (Fase 7)
 * y la validamos también en el server action cuando llegue.
 */
const STATE_FLOW: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["DISPATCHED", "CANCELLED"],
  DISPATCHED: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return STATE_FLOW[from].includes(to);
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  DISPATCHED: "En camino",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

/** Orden cronológico de los estados "felices" para pintar el timeline. */
export const ORDER_HAPPY_PATH: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "DISPATCHED",
  "DELIVERED",
];

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  simulated_card: "Tarjeta crédito/débito (simulado)",
  simulated_pse: "PSE (simulado)",
  cash_on_delivery: "Contraentrega",
};
