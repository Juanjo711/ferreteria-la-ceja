import { z } from "zod";

/**
 * Validaciones del checkout simulado.
 *
 * Los métodos de pago son los 3 que define el spec del MVP. Para tarjeta
 * y PSE solo registramos textos decorativos (nombre del titular, banco
 * seleccionado); NUNCA almacenamos números de tarjeta, CVV ni similares.
 */

export const PAYMENT_METHODS = ["simulated_card", "simulated_pse", "cash_on_delivery"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const shippingAddressSchema = z.object({
  nombre: z.string().trim().min(3, "Mínimo 3 caracteres").max(120),
  telefono: z
    .string()
    .trim()
    .min(7, "Teléfono inválido")
    .max(40, "Máximo 40 caracteres"),
  direccion: z.string().trim().min(5, "Indica una dirección").max(200),
  ciudad: z.string().trim().min(2, "Indica la ciudad").max(80),
  departamento: z.string().trim().min(2, "Indica el departamento").max(80),
  notas: z
    .string()
    .trim()
    .max(500, "Máximo 500 caracteres")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

export const checkoutSchema = z.object({
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(PAYMENT_METHODS),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;
