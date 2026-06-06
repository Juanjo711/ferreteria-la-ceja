import { z } from "zod";

/**
 * Validación del formulario admin de productos.
 *
 * - specs llega del cliente como un array de pares {key, value}; lo
 *   transformamos a Record<string,string> sólo en el server al guardar.
 */

export const productSpecPairSchema = z.object({
  key: z.string().trim().min(1, "Vacío").max(80),
  value: z.string().trim().min(1, "Vacío").max(200),
});

export const productFormSchema = z.object({
  sku: z
    .string()
    .trim()
    .min(2, "Mínimo 2 caracteres")
    .max(40)
    .regex(/^[A-Za-z0-9-]+$/, "Solo letras, números y guiones"),
  name: z.string().trim().min(3, "Mínimo 3 caracteres").max(200),
  description: z.string().trim().min(10, "Mínimo 10 caracteres").max(5000),
  price: z.number().int().min(100, "Precio mínimo $100").max(100_000_000),
  comparePrice: z
    .number()
    .int()
    .min(100)
    .max(100_000_000)
    .nullable()
    .or(z.literal(0).transform(() => null))
    .or(z.nan().transform(() => null)),
  stock: z.number().int().min(0).max(99999),
  minStock: z.number().int().min(0).max(99999),
  categoryId: z.string().min(1, "Selecciona una categoría"),
  brandId: z
    .string()
    .nullable()
    .or(z.literal("").transform(() => null)),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  specs: z.array(productSpecPairSchema).max(20),
});
export type ProductFormInput = z.infer<typeof productFormSchema>;
