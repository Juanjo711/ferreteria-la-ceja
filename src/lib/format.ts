/**
 * Formato es-CO para precios y fechas — uso en toda la UI.
 *
 * COP no maneja decimales prácticos: $1.250.000 (sin centavos).
 * Fechas: dd/MM/yyyy HH:mm (24h).
 */

const COP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

/** Acepta number, string o Prisma.Decimal (que ya implementa toString). */
export function formatCOP(value: number | string | { toString(): string }): string {
  const n = typeof value === "number" ? value : Number(value.toString());
  if (!Number.isFinite(n)) return "—";
  return COP.format(n);
}

const DATE_TIME = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatDateTime(value: Date | string): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return DATE_TIME.format(d);
}
