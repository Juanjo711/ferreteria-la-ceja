import type { Config } from "tailwindcss";

/**
 * Sistema de diseño — Ferreteria La Ceja
 *
 * Paleta Material Design 3 personalizada (extraída de las maquetas en
 * design-reference/). Se exponen como clases utilitarias: bg-primary,
 * text-on-surface, border-outline-variant, etc.
 *
 * Convención de nombres: kebab-case, no anidación. Ej: bg-primary-container.
 *
 * NOTA: borderRadius.full vale 0.75rem (NO 9999px) por decisión de diseño.
 * Para esquinas circulares usar rounded-circle (alias 9999px).
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // --- Marca (primary) ---
        primary: "#984700",
        "on-primary": "#ffffff",
        "primary-container": "#F27A1A",
        "on-primary-container": "#562500",
        "primary-fixed": "#ffdbc8",
        "primary-fixed-dim": "#ffb68a",
        "on-primary-fixed": "#321300",
        "on-primary-fixed-variant": "#743500",
        "inverse-primary": "#ffb68a",

        // --- Secondary ---
        secondary: "#565E77",
        "on-secondary": "#ffffff",
        "secondary-container": "#d7dffd",
        "on-secondary-container": "#5a627b",
        "secondary-fixed": "#dae2ff",
        "secondary-fixed-dim": "#bec6e3",
        "on-secondary-fixed": "#131b30",
        "on-secondary-fixed-variant": "#3e465e",

        // --- Tertiary (azul) ---
        tertiary: "#006495",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#00a4f1",
        "on-tertiary-container": "#003654",
        "tertiary-fixed": "#cbe6ff",
        "tertiary-fixed-dim": "#8fcdff",
        "on-tertiary-fixed": "#001e30",
        "on-tertiary-fixed-variant": "#004b71",

        // --- Error ---
        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",

        // --- Superficies ---
        background: "#f9f9f9",
        "on-background": "#1a1c1c",
        surface: "#f9f9f9",
        "on-surface": "#1a1c1c",
        "on-surface-variant": "#574236",
        "surface-bright": "#f9f9f9",
        "surface-dim": "#dadada",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f3f3f3",
        "surface-container": "#eeeeee",
        "surface-container-high": "#e8e8e8",
        "surface-container-highest": "#e2e2e2",
        "surface-variant": "#e2e2e2",
        "surface-tint": "#984700",
        "inverse-surface": "#2f3131",
        "inverse-on-surface": "#f1f1f1",

        // --- Otros ---
        outline: "#8b7264",
        "outline-variant": "#dec1b1",

        // --- Color fijo de marca (fuera de MD3, usado en header/footer) ---
        "brand-dark": "#1A2238",
        "brand-dark-deeper": "#0D111C",
      },
      borderRadius: {
        // Sobrescribe defaults Tailwind por decisión de diseño.
        DEFAULT: "0.125rem", // rounded
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem", // rounded-full = 0.75rem (NO 9999px)
        // Alias para esquinas verdaderamente circulares cuando se necesiten.
        circle: "9999px",
      },
      fontFamily: {
        // Las variables CSS vienen de next/font en src/app/layout.tsx.
        headline: ["var(--font-headline)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        label: ["var(--font-body)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
