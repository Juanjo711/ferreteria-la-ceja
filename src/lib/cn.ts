import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn — combina clases condicionales (clsx) y resuelve conflictos de Tailwind
 * (twMerge), de modo que props como className siempre sobrescriben defaults.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
