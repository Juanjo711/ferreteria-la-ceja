/**
 * slugify — convierte 'Tornillo hexagonal 1/4" x 1" galvanizado' en
 * "tornillo-hexagonal-1-4-x-1-galvanizado". Solo para uso en el seed;
 * la lógica de slugs en producción puede vivir aparte si la necesitamos.
 */
const COMBINING_DIACRITICS = /[̀-ͯ]/g;
const NON_ALNUM = /[^a-z0-9]+/g;
const EDGE_DASHES = /^-+|-+$/g;

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "")
    .toLowerCase()
    .replace(NON_ALNUM, "-")
    .replace(EDGE_DASHES, "");
}
