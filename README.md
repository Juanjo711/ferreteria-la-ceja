# Ferretería La Ceja — MVP de E-commerce

Plataforma e-commerce monolítica modular para **Ferretería La Ceja** (La Ceja del Tambo, Antioquia). Práctica profesional de Ingeniería de Software — Corporación Universitaria Iberoamericana, entrega junio 2026.

El MVP corre 100% en local: catálogo navegable, carrito persistente, checkout simulado, panel administrativo con CRUDs, KPIs y gestión de pedidos. 38 tests unitarios + 3 flujos E2E con Playwright en verde.

## Stack

| Capa | Tecnología | Versión |
| --- | --- | --- |
| Frontend / Backend | Next.js (App Router) + React | 14.2.35 / 18 |
| Lenguaje | TypeScript (estricto) | 5.x |
| Estilos | Tailwind CSS + paleta MD3 custom | 3.4 |
| ORM | Prisma | 5.22 |
| Base de datos | PostgreSQL en Docker | 16 |
| Autenticación | NextAuth.js (Credentials, JWT) | v4 |
| Validación | Zod | 4.x |
| Forms | react-hook-form + zodResolver | últimas |
| Estado cliente | Zustand (carrito) | 5.x |
| Procesado de imágenes | sharp (WebP 1200×1200 q80) | 0.34 |
| Gráficos | Recharts | 3.x |
| Tests | Vitest + Playwright | últimas |
| Gestor de paquetes | pnpm | 10.x |

Decisiones técnicas con su justificación en [`docs/decisions/`](./docs/decisions/).

## Prerrequisitos

- **Node.js ≥ 20** (probado con 22 LTS).
- **pnpm ≥ 10** — `corepack enable` lo activa, o `npm i -g pnpm`.
- **Docker Desktop** corriendo (para Postgres).
- **Git ≥ 2.40**.

## Arranque rápido

```powershell
# 1. Clonar
git clone <repo> ferreteria-la-ceja
cd ferreteria-la-ceja

# 2. Copiar variables de entorno
copy .env.example .env
# (Genera tu propio NEXTAUTH_SECRET con:)
#   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 3. Levantar Postgres
docker compose up -d
# Opcional, si quieres pgAdmin en http://localhost:5050
# docker compose --profile tools up -d

# 4. Instalar dependencias (Prisma y sharp corren postinstalls)
pnpm install

# 5. Migrar y sembrar la base
pnpm db:reset

# 6. Arrancar dev server
pnpm dev
# -> http://localhost:3000
```

> **Tip para la demo / presentación:** sobre una base ya sembrada, `pnpm demo:populate` genera **~6 meses de actividad simulada** — 35 clientes del Oriente antioqueño, ~290 pedidos (dic-2025 → hoy) con estados realistas y carritos abandonados. Con eso el dashboard muestra KPIs, gráfica de 7 días y Top 5 con datos vivos. Para empezar de cero: `pnpm db:reset` y luego `pnpm demo:populate`. (`pnpm demo:reset` es la versión mínima: reset + 4 pedidos.)

## Credenciales demo (creadas por el seed)

| Rol | Email | Contraseña |
| --- | --- | --- |
| Administrador | `admin@ferreterialaceja.com` | `Admin123*` |
| Cliente | `cliente@demo.com` | `Cliente123*` |

Los ~35 clientes que crea `pnpm demo:populate` (p. ej. `sofia.castano@gmail.com`) también usan `Cliente123*`, así puedes entrar como cualquiera de ellos durante la presentación.

## Scripts disponibles

| Script | Qué hace |
| --- | --- |
| `pnpm dev` | Dev server Next.js en `:3000` |
| `pnpm build` | Build de producción |
| `pnpm start` | Sirve el build |
| `pnpm lint` | ESLint (Next + Prettier) |
| `pnpm format` / `pnpm format:check` | Prettier |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm db:push` | Sincroniza schema sin migración formal |
| `pnpm db:migrate` | Migración formal de desarrollo |
| `pnpm db:studio` | Prisma Studio en `:5555` |
| `pnpm db:seed` | Pobla la base (idempotente) |
| `pnpm db:reset` | **Borra la DB** y vuelve a aplicar migraciones + seed |
| `pnpm demo:reset` | `db:reset` + 4 pedidos de ejemplo (demo mínima) |
| `pnpm demo:populate` | Puebla ~6 meses de actividad simulada sobre la base sembrada (`--force` para repoblar) |
| `pnpm test` | Vitest unitarios + integración |
| `pnpm test:watch` | Vitest en watch mode |
| `pnpm test:ui` | Vitest UI |
| `pnpm test:e2e` | Playwright (auto-arranca dev) |
| `pnpm test:e2e:ui` | Playwright UI |

## Mapa de rutas

**Públicas:**
- `/` — Home con destacados, hero, marcas.
- `/productos` — Listado con filtros (categoría, marca, precio, ordenamiento) y búsqueda.
- `/productos/categoria/[slug]` — Listado filtrado por categoría.
- `/productos/[slug]` — Detalle con galería, info, tabs, productos relacionados.
- `/carrito` — Carrito (persistente en localStorage para invitados, en DB para autenticados).
- `/login`, `/registro` — Autenticación.

**Cliente autenticado (`/cuenta/**`, `/checkout`, `/pedidos/**`):**
- `/cuenta` — Perfil del cliente.
- `/cuenta/pedidos` — Historial con filtros por estado.
- `/cuenta/pedidos/[orderNumber]` — Detalle con timeline.
- `/checkout` — Checkout simulado en 3 pasos.
- `/pedidos/[orderNumber]/confirmacion` — Confirmación tras pedido.

**Admin (`/admin/**`, solo rol `ADMIN`):**
- `/admin` — Dashboard con 4 KPIs + gráfico 7 días + Top 5 productos + últimos pedidos.
- `/admin/pedidos` y `/admin/pedidos/[orderNumber]` — Gestión y cambio de estado.
- `/admin/productos` + `[id]` + `/nuevo` — CRUD con upload de imágenes.
- `/admin/productos/categorias` y `/admin/productos/marcas` — CRUDs taxonomía.
- `/admin/inventario` — Tabla con ajustes de stock por motivo.
- `/admin/clientes` y `/admin/clientes/[id]` — Listado + detalle + promover a ADMIN.

**API:**
- `/api/auth/[...nextauth]` — NextAuth.
- `/api/cart`, `/api/cart/items`, `/api/cart/items/[productId]` — Carrito (auth).
- `/api/admin/products/[id]/images` — Upload de imágenes con sharp (admin).

## Documentación adicional

- [`docs/arquitectura.md`](./docs/arquitectura.md) — Diagrama de capas, flujo de un request.
- [`docs/manual-usuario.md`](./docs/manual-usuario.md) — Manual para el dueño de la ferretería.
- [`docs/manual-despliegue.md`](./docs/manual-despliegue.md) — Guía hipotética de despliegue a Vercel + Postgres.
- [`docs/decisions/`](./docs/decisions/) — ADRs.

## Troubleshooting en Windows

| Problema | Solución |
| --- | --- |
| `pnpm.ps1 cannot be loaded` (ExecutionPolicy) | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` en PowerShell admin. |
| Puerto 5432 ocupado | Otro Postgres local. Cambia el mapping en `docker-compose.yml` a `"5433:5432"` y la `DATABASE_URL` en `.env`. |
| Puerto 3000 ocupado tras `pnpm dev` | Suele ser un node huérfano. `netstat -ano \| findstr :3000` → `Stop-Process -Id <PID> -Force`. |
| `prisma generate` falla por DLL bloqueada | Otro node con Prisma client en memoria. Kill node + `pnpm install` para regenerar. |
| `sharp` pide rebuild | `pnpm rebuild sharp`. El paquete trae prebuilts para Windows x64. |
| CRLF en commits | `.gitattributes` normaliza a LF; si hay archivos viejos: `git add --renormalize .`. |
| E2E test 1 falla intermitente | Verifica que `docker compose up -d` esté corriendo. El test depende de Postgres. |

## Información del negocio

- **Nombre:** Ferretería La Ceja — *El Atelier Industrial*
- **Ubicación:** Calle 19 # 20-30, La Ceja, Antioquia, Colombia
- **Teléfono:** (+57) 604 123 4567
- **Email:** ventas@ferreterialaceja.com
- **Horario:** Lun – Vie: 7:00 AM – 6:00 PM

## Licencia

Uso académico — Práctica profesional, Corporación Universitaria Iberoamericana, 2026.
