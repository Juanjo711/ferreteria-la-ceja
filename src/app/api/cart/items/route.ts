import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { addToCart } from "@/lib/cart";

const bodySchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
});

/**
 * POST /api/cart/items
 * { productId, quantity } → suma quantity al item (lo crea si no existía).
 *
 * También sirve como endpoint de "merge" en el login: el cliente postea cada
 * item del localStorage con su cantidad y el servidor los suma.
 */
export async function POST(request: Request) {
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
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const items = await addToCart(
      session.user.id,
      parsed.data.productId,
      parsed.data.quantity,
    );
    return NextResponse.json({ items });
  } catch (e) {
    console.error("[api/cart/items] POST error:", e);
    const msg = e instanceof Error ? e.message : "Error agregando al carrito";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
