"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createOrderForUser, type CreateOrderResult } from "@/lib/checkout";
import type { CheckoutInput } from "@/lib/validations/checkout";

export type { CreateOrderResult };

/**
 * Server action: valida sesión y delega al núcleo `createOrderForUser`
 * (que vive en src/lib/checkout.ts y es testeable directamente).
 */
export async function createOrder(input: CheckoutInput): Promise<CreateOrderResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { ok: false, formError: "Debes iniciar sesión para confirmar el pedido." };
  }
  return createOrderForUser(session.user.id, input);
}
