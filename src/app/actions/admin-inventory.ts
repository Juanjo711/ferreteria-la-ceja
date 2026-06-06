"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { Role } from "@prisma/client";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const REASONS = ["entrada", "correccion", "merma"] as const;
export type StockAdjustReason = (typeof REASONS)[number];

export const REASON_LABEL: Record<StockAdjustReason, string> = {
  entrada: "Entrada de mercancía",
  correccion: "Corrección",
  merma: "Merma",
};

const schema = z.object({
  productId: z.string().min(1),
  delta: z.number().int(),
  reason: z.enum(REASONS),
  note: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type AdjustStockResult = { ok: true; stock: number } | { ok: false; error: string };

/**
 * Ajusta el stock de un producto en +/- delta. Stock final no puede ser
 * negativo. Para esta fase del MVP el "audit log" vive en console.log;
 * en una versión futura sería una tabla StockMovement.
 */
export async function adjustStock(input: {
  productId: string;
  delta: number;
  reason: StockAdjustReason;
  note?: string;
}): Promise<AdjustStockResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return { ok: false, error: "Sin permisos" };
  }
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Inválido" };
  }
  const { productId, delta, reason, note } = parsed.data;
  if (delta === 0) return { ok: false, error: "El ajuste no puede ser 0" };

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { stock: true, name: true },
  });
  if (!product) return { ok: false, error: "Producto no encontrado" };

  const next = product.stock + delta;
  if (next < 0) {
    return {
      ok: false,
      error: `Stock no puede ser negativo (actual ${product.stock}, ajuste ${delta}).`,
    };
  }

  await prisma.product.update({
    where: { id: productId },
    data: { stock: next },
  });

  console.log(
    `[inventory] ${new Date().toISOString()} | ${session.user.email} | ${product.name} | ${product.stock} -> ${next} (Δ${delta >= 0 ? "+" : ""}${delta}) | motivo=${reason}${note ? ` | nota=${note}` : ""}`,
  );

  revalidatePath("/admin/inventario");
  revalidatePath("/admin");
  return { ok: true, stock: next };
}
