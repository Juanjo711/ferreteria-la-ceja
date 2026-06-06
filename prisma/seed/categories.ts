/**
 * Taxonomía oficial de Ferreteria La Ceja — 7 categorías.
 * El icono es un nombre de Material Symbols Outlined.
 * Modificar requiere reconsiderar la asignación de productos.
 */
export type CategorySeed = {
  slug: string;
  name: string;
  icon: string;
  description: string;
};

export const categories: readonly CategorySeed[] = [
  {
    slug: "tornilleria",
    name: "Tornillería",
    icon: "hardware",
    description: "Tornillos, tuercas, arandelas y anclajes para todo tipo de fijación.",
  },
  {
    slug: "herramientas-manuales",
    name: "Herramientas Manuales",
    icon: "handyman",
    description: "Martillos, destornilladores, llaves y todo lo que se mueve a pulso.",
  },
  {
    slug: "herramientas-electricas",
    name: "Herramientas Eléctricas",
    icon: "electric_bolt",
    description: "Taladros, esmeriles, sierras y equipos profesionales con motor.",
  },
  {
    slug: "construccion",
    name: "Materiales de Construcción",
    icon: "foundation",
    description: "Cemento, arena, bloques, varillas y materiales de obra gris.",
  },
  {
    slug: "plomeria",
    name: "Plomería",
    icon: "plumbing",
    description: "Tubería, accesorios PVC, llaves de paso y todo el sistema hidráulico.",
  },
  {
    slug: "electricos",
    name: "Eléctricos",
    icon: "lightbulb",
    description: "Cableado, tomacorrientes, breakers, bombillos y tableros.",
  },
  {
    slug: "pinturas",
    name: "Pinturas",
    icon: "format_paint",
    description: "Pinturas, esmaltes, solventes y herramientas de aplicación.",
  },
] as const;
