# Arquitectura — Ferretería La Ceja

## Visión general

El MVP es un **monolito modular** en Next.js 14 con App Router. No hay servicios separados: todo el código (UI pública, panel admin, server actions, API routes y schema) vive en un solo proyecto y comparte el cliente Prisma contra la misma instancia de PostgreSQL.

Se eligió monolito por simplicidad de desarrollo, despliegue y depuración. La modularidad viene del routing por grupos (`(public)`, `(account)`, `admin`) y de la separación estricta entre capas dentro de `src/`.

## Flujo de un request

```
                ┌─────────────────────────────────────────┐
                │              Navegador                  │
                │   (Server Components render server-side, │
                │   Client Components hidratan en cliente) │
                └──────────────┬──────────────────────────┘
                               │ HTTP
                               ▼
                ┌─────────────────────────────────────────┐
                │   src/middleware.ts (withAuth)          │
                │   /admin/** → ADMIN | /cuenta /checkout  │
                │   /pedidos → sesión requerida           │
                └──────────────┬──────────────────────────┘
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
   ┌────────────────┐ ┌────────────────┐ ┌──────────────────┐
   │ Server         │ │  API Route     │ │  Server Action   │
   │ Component      │ │  (route.ts)    │ │  ("use server")  │
   │ (page.tsx)     │ │                │ │                  │
   └───────┬────────┘ └───────┬────────┘ └─────────┬────────┘
           │                  │                    │
           └──────────────────┼────────────────────┘
                              ▼
                ┌─────────────────────────────────────────┐
                │   src/lib/* (capa de servicios)          │
                │   - queries/   (Prisma → vistas planas)  │
                │   - checkout.ts, cart.ts, orders.ts      │
                │   - validations/  (Zod schemas)          │
                │   - auth.ts, pricing.ts, images.ts       │
                └──────────────┬──────────────────────────┘
                               ▼
                ┌─────────────────────────────────────────┐
                │   Prisma Client (singleton)              │
                │   src/lib/prisma.ts                      │
                └──────────────┬──────────────────────────┘
                               ▼
                ┌─────────────────────────────────────────┐
                │   PostgreSQL 16 (Docker)                 │
                │   Schema: 10 modelos + 2 enums           │
                └─────────────────────────────────────────┘
```

## Estructura del repo

```
ferreteria-la-ceja/
├── docker-compose.yml         Postgres + pgAdmin opcional
├── prisma/
│   ├── schema.prisma          Modelo de datos
│   ├── migrations/            Historial de migraciones
│   ├── seed.ts                Orchestrator del seed
│   └── seed/                  Datasets (50 productos, 7 cats, 6 marcas)
├── public/uploads/products/   Imágenes (seed/* + uploads del admin)
├── src/
│   ├── app/
│   │   ├── (public)/          Home, catálogo, login, registro, carrito
│   │   ├── (account)/         /cuenta, /checkout, /pedidos (auth)
│   │   ├── admin/             Panel administrativo (rol ADMIN)
│   │   ├── api/               NextAuth + cart + admin/products/images
│   │   ├── actions/           Server actions (auth, checkout, admin-*)
│   │   ├── layout.tsx         Root layout (fonts, SessionProvider)
│   │   └── globals.css        Tailwind directives + tokens base
│   ├── components/
│   │   ├── ui/                Primitivos (Button, Icon, FormField…)
│   │   ├── shop/              Layout público + ProductCard, etc.
│   │   ├── cart/              AddToCartButton, CartCounter, CartView
│   │   ├── forms/             Login/Register/CheckoutForm
│   │   ├── admin/             KpiCard, SalesChart, ProductForm…
│   │   ├── orders/            OrderStatusBadge, OrderTimeline
│   │   └── providers/         NextAuthSessionProvider + CartHydrator
│   ├── lib/
│   │   ├── prisma.ts          Singleton Prisma Client
│   │   ├── auth.ts            authOptions (NextAuth v4)
│   │   ├── cart.ts            Helpers DB del carrito
│   │   ├── cart-store.ts      Zustand store con persist
│   │   ├── checkout.ts        createOrderForUser (transacción atómica)
│   │   ├── pricing.ts         calculateCartTotals (puro)
│   │   ├── orders.ts          generateOrderNumber + canTransition
│   │   ├── images.ts          processImage (sharp)
│   │   ├── catalog-params.ts  Parser + builder de search params
│   │   ├── queries/           catalog.ts, orders.ts, admin.ts
│   │   └── validations/       auth.ts, checkout.ts, product.ts
│   ├── middleware.ts          withAuth de NextAuth
│   └── types/
│       ├── cart.ts, product.ts, next-auth.d.ts (augmentations)
├── tests/
│   ├── unit/                  Vitest (38 tests)
│   └── e2e/                   Playwright (3 flujos)
├── scripts/                   verify-seed, test-*, demo-reset, demo-populate
└── docs/
    ├── arquitectura.md         (este archivo)
    ├── manual-usuario.md
    ├── manual-despliegue.md
    └── decisions/              ADRs
```

## Responsabilidades por capa

### 1. Páginas (Server Components por defecto)

Hacen la composición de la UI. Llaman a las queries en `src/lib/queries/` para obtener vistas planas y a los componentes en `src/components/`. NUNCA tocan Prisma directamente — eso vive en `lib/`.

### 2. Componentes

- **`ui/`** — primitivos sin lógica de negocio.
- **`shop/`** — chunks de tienda (Navbar, ProductCard, etc.). Pueden leer queries del servidor en server-mode.
- **`cart/`, `forms/`, `admin/`** — componentes cliente con interactividad (Zustand, react-hook-form, useTransition).
- **`providers/`** — wrappers de contexto (SessionProvider, CartHydrator).

### 3. Server Actions (`src/app/actions/`)

Funciones marcadas `"use server"` que ejecutan mutaciones. Patrón:

1. Validan sesión / rol.
2. Validan input con Zod (defensa: nunca confían en el cliente).
3. Delegan en la capa `lib/` (que tiene el "core" testeable).
4. Llaman `revalidatePath` donde corresponda.
5. Devuelven `{ ok: true | false, ... }` para que el form maneje errores.

Para el checkout en particular, la action es un *adapter*: delega en `createOrderForUser(userId, input)` en `lib/checkout.ts` que es testeable directamente sin sesión HTTP.

### 4. `src/lib/`

Núcleo de lógica. Aquí vive:

- **Acceso a datos** (`queries/*.ts`): wrappers de Prisma que devuelven *vistas planas* sin `Decimal` ni `Json` (la conversión a `number` y al tipo correcto ocurre aquí, en el borde del servidor).
- **Lógica de dominio** (`cart.ts`, `checkout.ts`, `orders.ts`, `pricing.ts`): pura cuando es posible. `pricing.ts` y `canTransition` no tocan DB.
- **Helpers de infraestructura** (`prisma.ts`, `auth.ts`, `images.ts`, `password-strength.ts`).
- **Validaciones** (`validations/*.ts`): Zod schemas compartidos cliente/servidor.

### 5. `src/middleware.ts`

`withAuth` de NextAuth. Solo se ejecuta sobre el matcher configurado: `/admin/**`, `/cuenta/**`, `/checkout/**`, `/pedidos/**`. Hace defensa en profundidad junto con los chequeos de los layouts (`(account)/layout.tsx`, `admin/layout.tsx`).

### 6. Prisma & Postgres

Un único `PrismaClient` (singleton con guard HMR). Schema en `prisma/schema.prisma`. Las queries `groupBy` y los `$queryRaw` se usan donde Prisma no expresa fácilmente la operación (por ejemplo, comparar `stock <= minStock` columna-a-columna).

## Decisiones arquitectónicas (ADRs)

- [ADR 0001 — Stack tecnológico del MVP](./decisions/0001-stack-tecnologico.md)
- [ADR 0002 — Sistema de diseño custom sin librería UI](./decisions/0002-sistema-de-diseno.md)
- [ADR 0003 — signIn doble para evitar carrera con cookies](./decisions/0003-signin-double-call.md)

## Patrones recurrentes

### Vistas planas en el borde del servidor

`Decimal` y `Json` de Prisma no serializan bien hacia client components. Convertimos en `src/lib/queries/*.ts`:

```ts
function toCardView(p: RawCard): ProductCardView {
  return {
    ...p,
    price: Number(p.price.toString()),
    comparePrice: p.comparePrice ? Number(p.comparePrice.toString()) : null,
    primaryImage: p.images[0] ?? null,
  };
}
```

### Filtros en URL state

`/productos?q=...&brand=stanley,bosch&min=10000&sort=price-asc&page=2`. Toda la página es bookmarkeable. El parser vive en `src/lib/catalog-params.ts`; cada link de filtro reconstruye la URL preservando los demás parámetros.

### Defensa en profundidad para autorización

1. **Middleware** rechaza rutas protegidas sin sesión / sin rol.
2. **Layout server-side** vuelve a verificar y redirigir (por si el middleware no se ejecuta en un edge case).
3. **Server actions** verifican rol antes de mutar.

### Idempotencia

- `seed.ts` detecta si ya hay datos antes de regenerar (excepto via `db:reset`).
- `scripts/demo-populate.ts` aborta si ya hay >50 pedidos (salvo `--force`), usa un RNG determinístico (misma demo en cada corrida) y sincroniza `OrderSequence` por año para que el checkout real no colisione con los pedidos simulados.
- `addToCart` / `setItemQuantity` cap al stock; nunca exceden.
- `createOrderForUser` usa `updateMany` con `where: { stock: { gte: quantity } }` como guard atómico contra races.

### Snapshot al confirmar pedido

`OrderItem` guarda `productName`, `productSku`, `unitPrice` al momento de la compra. Si el catálogo cambia después, el pedido conserva la verdad.
