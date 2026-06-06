"use server";

import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

/** Resultado de la acción de registro. */
export type RegisterResult =
  | { ok: true }
  | {
      ok: false;
      // Errores por campo para mostrar inline.
      fieldErrors?: Partial<Record<keyof RegisterInput, string>>;
      // Error global (ej. "El correo ya está registrado").
      formError?: string;
    };

const BCRYPT_ROUNDS = 10;

/**
 * Crea un usuario con rol CLIENT. No inicia sesión: eso lo hace el cliente
 * llamando a signIn() después de éxito. Razón: signIn devuelve un Response
 * que solo manipula bien el client (cookies, redirección).
 */
export async function registerAction(input: RegisterInput): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof RegisterInput, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !(key in fieldErrors)) {
        (fieldErrors as Record<string, string>)[key] = issue.message;
      }
    }
    return { ok: false, fieldErrors };
  }

  const { email, password, fullName, phone } = parsed.data;

  // Verifica unicidad. La unique constraint también nos protege a nivel DB,
  // pero comprobar antes nos permite devolver un mensaje claro al usuario.
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      ok: false,
      fieldErrors: { email: "Ya existe una cuenta con este correo" },
    };
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  try {
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        phone: phone ?? null,
        role: Role.CLIENT,
      },
    });
  } catch (error) {
    console.error("[auth] registerAction error:", error);
    return {
      ok: false,
      formError: "No pudimos crear tu cuenta. Inténtalo de nuevo en unos minutos.",
    };
  }

  return { ok: true };
}
