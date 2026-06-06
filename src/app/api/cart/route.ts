import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getCartItems, clearCart } from "@/lib/cart";

/**
 * GET /api/cart  → items canónicos del usuario (auth requerido).
 * DELETE /api/cart → vacía el carrito (auth).
 *
 * El carrito de invitados vive 100% en localStorage, así que los endpoints
 * sólo responden a sesiones autenticadas. Sin sesión → 401.
 */

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const items = await getCartItems(session.user.id);
  return NextResponse.json({ items });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const items = await clearCart(session.user.id);
  return NextResponse.json({ items });
}
