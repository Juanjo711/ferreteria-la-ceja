"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type PromoteResult = { ok: true } | { ok: false; error: string };

/**
 * Convierte un usuario CLIENT a ADMIN. Requiere sesión ADMIN. No permite
 * "degradar" admins desde aquí (es otro flujo más sensible).
 */
export async function promoteToAdmin(userId: string): Promise<PromoteResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return { ok: false, error: "Sin permisos" };
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, email: true },
  });
  if (!user) return { ok: false, error: "Usuario no encontrado" };
  if (user.role === Role.ADMIN) return { ok: false, error: "Ya es administrador" };

  await prisma.user.update({ where: { id: userId }, data: { role: Role.ADMIN } });
  console.log(
    `[admin] ${new Date().toISOString()} | ${session.user.email} promovió a ADMIN a ${user.email}`,
  );
  revalidatePath("/admin/clientes");
  revalidatePath(`/admin/clientes/${userId}`);
  return { ok: true };
}
