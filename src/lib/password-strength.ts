/**
 * Calcula la "fortaleza" visual de una contraseña sobre 4 niveles.
 *
 * Es independiente de la validación de Zod (passwordSchema): aquí solo
 * conducimos un indicador UI (las 4 barras de la maqueta de registro).
 * Una contraseña que no cumple aún el mínimo del schema todavía puede
 * mostrarse como "Débil"; al cumplir mínimo + mayúscula + número, "Media";
 * con más diversidad, "Fuerte" / "Muy fuerte".
 */
export type StrengthLevel = 0 | 1 | 2 | 3 | 4;

export type StrengthInfo = {
  level: StrengthLevel; // 0..4 (0 = vacío)
  label: string;
};

const LABELS: Record<StrengthLevel, string> = {
  0: "—",
  1: "Débil",
  2: "Media",
  3: "Fuerte",
  4: "Muy fuerte",
};

export function passwordStrength(password: string): StrengthInfo {
  if (!password) return { level: 0, label: LABELS[0] };

  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  // Aplastar a 4 niveles
  const level = (Math.min(4, Math.max(1, score)) as StrengthLevel);
  return { level, label: LABELS[level] };
}
