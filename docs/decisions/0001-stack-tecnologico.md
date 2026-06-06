# ADR 0001 — Stack tecnológico del MVP

**Estado:** Aceptado
**Fecha:** 2026-05-23
**Fase:** 0 (Bootstrap)

## Contexto

Necesitamos definir el stack para un MVP de e-commerce monolítico que se evalúa por **funcionalidad real en local** (no por despliegue), con entrega en junio 2026 y un único desarrollador en Windows nativo (sin WSL).

## Decisión

### Framework: Next.js 14.2.x (App Router)
- **Por qué 14 y no 15/16:** la rama 14 LTS está maduramente probada con NextAuth v4 y Prisma 5; 15/16 trae cambios en cache/`fetch` defaults y rompe varios patrones de App Router de la documentación oficial actual. Para un proyecto académico con tiempo finito, evitar rework por betas.
- **Versión pinneada:** `14.2.35` (último patch de seguridad de la línea 14.2).

### Autenticación: NextAuth v4
- **Por qué v4 y no v5 (Auth.js):** v5 sigue en beta, la API de `auth()` y la integración con Server Actions cambió varias veces durante 2025. v4 tiene documentación masiva y CRA mínimo. Sacrificamos features futuras a cambio de cero sorpresas.
- **Provider único:** Credentials (email + bcryptjs). OAuth queda como trabajo futuro (los botones se renderizan deshabilitados con tooltip "Próximamente" para fidelidad visual a las maquetas).

### ORM: Prisma 5.22
- **Por qué 5 y no 7:** la spec del proyecto pide 5.x. Prisma 6/7 cambia el motor a Rust + el cliente generado vive ahora en `node_modules/.prisma`; aunque mejor, requiere refactorizar imports y no aporta nada al MVP.

### Tailwind CSS 3.x
- **Por qué 3 y no 4:** Tailwind 4 abandona `tailwind.config.ts` en favor de configuración CSS-first. Toda la paleta MD3 personalizada del proyecto está estructurada como objeto JS y se aplica `extend.colors`. Migrar a v4 obligaría a reescribir tokens como variables CSS y perder type-checking de la config.

### Gestor de paquetes: pnpm
- Más rápido y eficiente en disco que npm.
- En Windows nativo evita los problemas de paths largos que sufre el `node_modules` plano de npm en algunos casos.
- Requiere aprobación explícita de build scripts (`onlyBuiltDependencies` en `package.json`), lo cual incluye `prisma`, `@prisma/client`, `@prisma/engines`, `sharp`, `esbuild`.

### Base de datos: PostgreSQL 16 en Docker
- Postgres es estándar de industria y se acopla nativamente con Prisma.
- Docker evita instalar Postgres como servicio Windows y aísla la base por proyecto.
- pgAdmin queda detrás del profile `tools` de compose, no arranca por defecto.

### Estado del carrito: Zustand
- Carrito necesita reactividad instantánea en el cliente; Context + reducers de React es verboso.
- Más ligero que Redux Toolkit y sin boilerplate.

### Imágenes server-side: sharp
- Convierte uploads del admin a WebP 1200×1200, calidad 80.
- Trae binarios prebuilt para Windows x64 — no requiere build nativo.

### Tests: Vitest + Playwright
- Vitest se integra fácil con la config de Vite (vía `@vitejs/plugin-react`).
- Playwright para E2E es estándar moderno y soporta Windows nativo.

## Consecuencias

- ✅ Stack estable, sin betas, documentación masiva.
- ✅ Todo funciona en Windows nativo sin WSL.
- ✅ Cero costo de runtime (todo se ejecuta localmente).
- ⚠️ Algunas dependencias (Next 14, eslint 8) recibirán cada vez menos parches después de 2026; aceptable para alcance académico.
- ⚠️ Migrar a Next 15+ y Auth.js v5 será trabajo futuro (no en el alcance del MVP).
