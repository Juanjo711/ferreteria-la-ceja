import { z } from "zod";

/**
 * Reglas de contraseña:
 *   - mínimo 8 caracteres
 *   - al menos 1 mayúscula
 *   - al menos 1 número
 *
 * Es lo que pide el spec del MVP. La fortaleza del indicador (4 niveles)
 * vive aparte en password-strength.ts y es independiente de esta validación
 * estricta: lo que aquí pasa lo aceptamos como "Media" o mejor.
 */
export const passwordSchema = z
  .string()
  .min(8, "Debe tener al menos 8 caracteres")
  .regex(/[A-Z]/, "Debe incluir al menos una mayúscula")
  .regex(/[0-9]/, "Debe incluir al menos un número");

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Correo no válido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, "Mínimo 3 caracteres")
      .max(120, "Máximo 120 caracteres"),
    phone: z
      .string()
      .trim()
      .max(40, "Máximo 40 caracteres")
      .optional()
      .or(z.literal("").transform(() => undefined)),
    email: z.string().trim().toLowerCase().email("Correo no válido"),
    password: passwordSchema,
    confirmPassword: z.string(),
    terms: z.literal(true, {
      // Zod v4: pasar mensaje en el error path
      message: "Debes aceptar los términos para continuar",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });
export type RegisterInput = z.infer<typeof registerSchema>;
