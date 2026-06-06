import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { setItemQuantity, removeItem } from "@/lib/cart";

const patchSchema = z.object({
  quantity: z.number().int().min(0).max(99),
});

type RouteContext = { params: { productId: string } };

/**
 * PATCH /api/cart/items/[productId]   { quantity }
 *   - quantity = 0 elimina el item
 *   - se capa al stock disponible
 *
 * DELETE /api/cart/items/[productId]  → elimina el item
 *
 * Ambos requieren sesión.
 */

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const items = await setItemQuantity(
      session.user.id,
      params.productId,
      parsed.data.quantity,
    );
    return NextResponse.json({ items });
  } catch (e) {
    console.error("[api/cart/items/:id] PATCH error:", e);
    const msg = e instanceof Error ? e.message : "Error actualizando";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await removeItem(session.user.id, params.productId);
    return NextResponse.json({ items });
  } catch (e) {
    console.error("[api/cart/items/:id] DELETE error:", e);
    const msg = e instanceof Error ? e.message : "Error eliminando";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
