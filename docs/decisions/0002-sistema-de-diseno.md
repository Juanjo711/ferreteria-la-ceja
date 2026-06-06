# ADR 0002 — Sistema de diseño custom (sin librería UI)

**Estado:** Aceptado
**Fecha:** 2026-05-23
**Fase:** 0 (Bootstrap)

## Contexto

Las 6 vistas HTML de `design-reference/` fueron diseñadas y validadas con el cliente (dueño de la ferretería). Definen una identidad visual concreta: paleta Material Design 3 personalizada con primario naranja `#984700` y CTA `#F27A1A`, header/footer en `brand-dark` `#1A2238`, tipografías `Plus Jakarta Sans` (headlines) + `Manrope` (body), iconos `Material Symbols Outlined` con eje variable.

## Decisión

### No usamos librerías de componentes UI prefabricados.

Explícitamente descartamos:
- **shadcn/ui** — sus componentes traen una opinión visual (neutral grays, radius `0.5rem` por default, etc.) que no encaja con MD3 sin un esfuerzo grande de override. El "copia-pega" hace que cada override quede dispersado en N componentes.
- **Material UI (MUI)** — implementaría Material Design 3 *teórico*, no la versión personalizada de las maquetas. La API es opinada y agregaría 200 KB+ de runtime.
- **Chakra, Mantine, Radix completos** — mismo argumento: sistema visual propio que pelea con el de las maquetas.

### Construimos un sistema propio con Tailwind.

- Toda la paleta MD3 vive como tokens semánticos en `tailwind.config.ts → theme.extend.colors`, accesible como utilidades (`bg-primary`, `text-on-surface-variant`, etc.).
- `borderRadius` se sobrescribe: `DEFAULT: 0.125rem`, `lg: 0.25rem`, `xl: 0.5rem`, `full: 0.75rem`. Para esquinas verdaderamente circulares hay alias `rounded-circle` (9999px).
- Tipografías vía `next/font/google` exponiendo variables CSS (`--font-headline`, `--font-body`) y registradas como `fontFamily.headline`/`body` en Tailwind.
- Material Symbols vía stylesheet de Google Fonts + componente `<Icon>` (Fase 2) que abstrae `<span class="material-symbols-outlined">`. No usamos `react-icons` ni `lucide` para no introducir un segundo sistema iconográfico.
- Primitivos propios (`Button`, `Input`, `Modal`, `Badge`, `Pagination`...) se construirán en Fase 2 directamente con clases Tailwind y los tokens.

### Para a11y de componentes complejos (modales, dropdowns) usaremos `@radix-ui/react-*` puntuales si los necesitamos.

Solo headless, sin estilos — Radix Primitives da el comportamiento (focus trap, ARIA) y nosotros aplicamos las clases. Pero NO importamos su set completo; solo el primitivo concreto cuando aparezca la necesidad. (Decisión a revisar cuando lleguemos a la Fase 2.)

## Consecuencias

- ✅ Fidelidad total al diseño aprobado por el cliente.
- ✅ Bundle mínimo (no cargamos componentes que no usamos).
- ✅ Toda la apariencia se controla desde dos archivos: `tailwind.config.ts` y `globals.css`.
- ⚠️ Cada primitivo (Button, Input, Modal…) toca implementarlo a mano. Es trabajo extra en la Fase 2 pero queda 100% bajo nuestro control y es perfectamente defendible ante el tribunal académico como "se construyó un sistema de diseño desde tokens".
- ⚠️ No tenemos a11y "gratis" como con Radix; toca cuidarlo manualmente: `aria-label`, `aria-expanded`, focus management.
