# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

MVP de e-commerce para Ferretería La Ceja (Antioquia, Colombia) — práctica profesional universitaria, entrega junio 2026. Corre 100% en local. Código, UI, commits y documentación están **en español**.

**Versiones pinneadas — no actualizar sin discutirlo**: Next.js 14.2.35 (App Router), Prisma 5.22, NextAuth v4 (no v5), Tailwind 3.4, Zod 4, React 18. Gestor de paquetes: **pnpm** (nunca npm/yarn).

## Comandos

```powershell
docker compose up -d        # Postgres 16 (requisito para todo lo demás)
pnpm dev                    # dev server en :3000
pnpm build                  # build de producción
pnpm typecheck              # tsc --noEmit
pnpm lint                   # ESLint
pnpm format                 # Prettier (src/ y prisma/)

# Base de datos
pnpm db:migrate             # prisma migrate dev
pnpm db:seed                # seed idempotente (7 categorías, 6 marcas, 50 productos, 2 usuarios)
pnpm db:reset               # BORRA la DB + migraciones + seed
pnpm db:studio              # Prisma Studio en :5555
pnpm demo:reset             # db:reset + 4 pedidos de ejemplo
pnpm demo:populate          # ~6 meses de actividad simulada (35 clientes, ~290 pedidos, carritos); --force para repoblar

# Tests
pnpm test                                       # Vitest (tests/unit/**)
pnpm test tests/unit/pricing.test.ts            # un solo archivo
pnpm test:e2e                                   # Playwright (auto-arranca pnpm dev; requiere Postgres + seed)
pnpm test:e2e tests/e2e/01-cliente-compra.spec.ts
```

Credenciales del seed: `admin@ferreterialaceja.com / Admin123*` y `cliente@demo.com / Cliente123*`. Los clientes de `demo:populate` también usan `Cliente123*`.

## Arquitectura

Monolito modular Next.js App Router. La regla central es la **separación por capas** — las páginas nunca tocan Prisma directamente:

```
page.tsx / API route / server action
  → src/lib/queries/*.ts  (lecturas: Prisma → "vistas planas")
  → src/lib/*.ts          (dominio: checkout, cart, orders, pricing)
    → src/lib/prisma.ts   (singleton) → PostgreSQL (Docker)
```

- **`src/app/`** usa route groups: `(public)` (home, catálogo, auth, carrito), `(account)` (/cuenta, /checkout, /pedidos), `admin/` (rol ADMIN). Server actions en `src/app/actions/`.
- **`src/lib/queries/`** (catalog.ts, orders.ts, admin.ts): toda lectura convierte `Decimal`→`number` y aplana `Json` ANTES de cruzar a client components ("vistas planas en el borde del servidor"). Mantener ese patrón en queries nuevas.
- **Lógica de dominio testeable sin HTTP**: `lib/checkout.ts` (`createOrderForUser` — transacción atómica con guard de stock `updateMany where stock gte`), `lib/orders.ts` (`generateOrderNumber` vía tabla `OrderSequence` por año, formato `FLC-YYYY-NNNNNN`; máquina de estados `canTransition`), `lib/pricing.ts` (`calculateCartTotals`, pura: envío gratis ≥ $200.000 COP, si no $15.000).
- **Server actions** siguen el patrón: validar sesión/rol → validar input con Zod (`lib/validations/`) → delegar en `lib/` → `revalidatePath` → devolver `{ ok, ... }`.
- **Autorización en 3 capas**: `src/middleware.ts` (withAuth de NextAuth) + verificación en layouts (`(account)/layout.tsx`, `admin/layout.tsx`) + verificación de rol en cada server action.
- **Carrito dual**: invitados en localStorage (Zustand con persist, `lib/cart-store.ts`); autenticados en DB (`Cart`/`CartItem` vía `/api/cart`); merge al hacer login.

### Modelo de datos (prisma/schema.prisma)

10 modelos, 2 enums (`Role`, `OrderStatus`: PENDING→CONFIRMED→DISPATCHED→DELIVERED, CANCELLED). Puntos no obvios:
- `OrderItem` guarda **snapshots** (`productName`, `productSku`, `unitPrice`) — los pedidos conservan la verdad aunque el catálogo cambie.
- `OrderSequence (year PK, lastNumber)` es el contador atómico de orderNumbers; cualquier script que cree pedidos debe dejarla sincronizada.
- Montos en `Decimal(12,2)` (pesos COP). Alertas de inventario = `stock <= minStock` (comparación columna-a-columna, requiere `$queryRaw`).
- Passwords con bcryptjs, 10 rounds.

### Seed y datos demo

- `prisma/seed.ts` + `prisma/seed/` (datasets). Idempotente (sale si ya hay admin + productos). Imágenes: descarga picsum → sharp → WebP en `public/uploads/products/seed/`.
- `scripts/demo-populate.ts`: genera historia de 6 meses con RNG determinístico; aborta si hay >50 pedidos salvo `--force`. Backdatea `createdAt` pasándolo en el `create`; `updatedAt` se corrige después con `$executeRaw` (Prisma pisa `@updatedAt` en updates normales).

### El dashboard admin depende de fechas

`src/lib/queries/admin.ts` agrupa la gráfica de ventas por **día local** (últimos 7 días) y los KPIs cortan por inicio de mes local — al crear datos de prueba, usar fechas con constructor local y horas diurnas para evitar corrimientos por UTC.

## Entorno Windows

- Shell: PowerShell. Repo con `.gitattributes` normalizando a LF.
- **Puerto 3000 huérfano** tras matar `pnpm dev`: el proceso node hijo sobrevive. Liberar con `Get-NetTCPConnection -LocalPort 3000 -State Listen | % { Stop-Process -Id $_.OwningProcess -Force }` antes de relanzar.
- Si `prisma generate` falla por DLL bloqueada: matar procesos node y reintentar.

## Documentación

- `docs/arquitectura.md` — capas, flujo de request, patrones recurrentes.
- `docs/decisions/` — ADRs; las decisiones técnicas relevantes se documentan ahí (stack pinneado en ADR 0001).
- Branch principal de trabajo: `develop`; PRs hacia `main`.
