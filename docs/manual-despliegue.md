# Manual de despliegue (hipotético)

Este documento describe **cómo llevaría el MVP a producción**. No es parte del alcance entregable del proyecto académico —el MVP se evalúa funcionando en local con `docker-compose` + `pnpm dev`— pero documentar el camino es valioso para el informe y para una eventual continuación.

## Resumen de la propuesta

| Componente | Solución sugerida | Costo aproximado mensual |
| --- | --- | --- |
| Hosting Next.js | Vercel (plan Hobby gratis para MVP) | $0 |
| PostgreSQL gestionado | Neon o Supabase (plan free) | $0 |
| Storage de imágenes | Cloudinary o UploadThing | $0 hasta ~10 GB |
| Dominio | Cualquier registrar (Namecheap, GoDaddy) | ~$15 / año |
| Email transaccional (futuro) | Resend | $0 hasta 3k correos/mes |

**Estimado total**: $0–5 USD/mes en el rango free de cada servicio, escalando con tráfico real.

## 1. Preparación del repo

### 1.1 Variables de entorno producción

`.env.production` (no se commitea — se configura en el dashboard del hosting):

```bash
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
NEXTAUTH_SECRET="<base64 de 32 bytes nuevo, diferente al de dev>"
NEXTAUTH_URL="https://ferreterialaceja.com"

# Si usamos Cloudinary para imágenes
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### 1.2 Cambios mínimos al código

El MVP actual guarda imágenes en `public/uploads/products/`. En Vercel esto **no funciona en producción** porque el sistema de archivos es efímero (cada deploy reinicia). Hay dos opciones:

**Opción A — Cloudinary (recomendada):**
1. `pnpm add cloudinary`.
2. Modificar `src/lib/images.ts` para que `processImage` suba a Cloudinary en lugar de escribir disco.
3. `ProductImage.url` ahora apunta a la URL de Cloudinary (`https://res.cloudinary.com/.../image.webp`).
4. Agregar el dominio a `next.config.mjs → images.remotePatterns`.

**Opción B — UploadThing / S3:**
- Similar pero con un SDK distinto.
- Mejor si quieres mantener control total del bucket.

### 1.3 `next.config.mjs` para producción

```js
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" }, // si usamos Cloudinary
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["sharp", "@prisma/client", "bcryptjs"],
  },
};
```

## 2. Crear base de datos gestionada (Neon)

1. Cuenta en [neon.tech](https://neon.tech). Crear nuevo proyecto en región Mumbai/SP1 (los más cercanos a Colombia).
2. Copiar la connection string (incluye `?sslmode=require`).
3. (Opcional) crear branch separado para staging.
4. En el repo:
   ```bash
   DATABASE_URL="postgresql://...@neon..." pnpm exec prisma migrate deploy
   ```
   Esto aplica todas las migraciones contra la base de Neon. **`migrate deploy`** (no `migrate dev`) es la opción correcta para producción —no genera nuevas migraciones, solo aplica las existentes.

5. Correr el seed contra producción **una sola vez** (sembrando admin + catálogo inicial):
   ```bash
   DATABASE_URL="postgresql://...@neon..." pnpm db:seed
   ```
   > Cambia las contraseñas de admin/cliente demo ANTES de promocionar el sitio.

## 3. Deploy a Vercel

1. Conectar el repo GitHub a Vercel.
2. Framework preset: **Next.js** (autodetectado).
3. Build command: `pnpm build` (default).
4. Output directory: `.next` (default).
5. **Environment Variables** (panel Settings → Environment Variables):
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (la URL final del dominio, ej. `https://www.ferreterialaceja.com`)
   - Las de Cloudinary si aplican.
6. Aplicar a **Production**, **Preview** y **Development** según corresponda.
7. Deploy. Vercel toma ~2 minutos en build + cold start.

## 4. Dominio personalizado

1. Comprar `ferreterialaceja.com` (o similar) en Namecheap.
2. En el panel de Vercel → Domains → agregar.
3. Vercel da los registros DNS a configurar en el registrador (CNAME o A record).
4. Esperar propagación (~1 hora). Vercel emite el certificado SSL automáticamente vía Let's Encrypt.
5. Actualizar `NEXTAUTH_URL` en env vars de Vercel para que coincida.

## 5. Checklist de hardening pre-launch

Antes de exponerlo a clientes reales:

- [ ] **Cambiar contraseñas demo** (admin/cliente del seed) o eliminar esos usuarios.
- [ ] **Rotar `NEXTAUTH_SECRET`** del valor de dev al de producción.
- [ ] **Activar `secure cookies`** — Next + NextAuth lo hacen automáticamente si `NEXTAUTH_URL` empieza con `https://`.
- [ ] **Configurar CORS estricto** — no es relevante porque el API es same-origin, pero verificar headers en `next.config.mjs`.
- [ ] **Rate limiting** en endpoints de auth y carrito — agregar `@upstash/ratelimit` o similar. Sin esto, alguien puede hacer brute-force de contraseñas.
- [ ] **Logs estructurados** — agregar `pino` y un sink (Vercel Logs, Logtail, Axiom).
- [ ] **Backups automáticos de la DB** — Neon los hace cada 24h en el plan free; Pro permite point-in-time recovery.
- [ ] **Política de contraseñas** — el regex actual (`min 8, 1 mayúscula, 1 número`) es mínimo. Considerar exigir un símbolo.
- [ ] **Captcha en /registro y /login** — hCaptcha o Turnstile (Cloudflare) en plan free para prevenir bots.
- [ ] **Cabeceras de seguridad** — agregar `next-safe` o configurar `headers()` en `next.config.mjs` para CSP, HSTS, X-Frame-Options, Referrer-Policy.
- [ ] **Monitoreo** — Vercel Analytics (gratis) + Sentry para errores en runtime.
- [ ] **Términos y Política de Privacidad** — los links `#` en el footer deben apuntar a páginas reales (asesoría legal recomendada para datos personales en Colombia bajo Ley 1581).

## 6. Migrar las imágenes existentes del seed

Si vas a hacer launch con el catálogo del MVP, las imágenes del seed (`public/uploads/products/seed/*.webp`) no son productos reales. Reemplázalas:

1. Tomar fotos reales de los productos (o pedirlas al proveedor).
2. Desde el panel `/admin/productos/[id]`, eliminar las imágenes seed y subir las reales.
3. Verificar en la tienda pública que cada producto se ve bien.

## 7. Operación diaria

Una vez en producción:

- **Cada mañana**: revisar `/admin` para ver pedidos pendientes.
- **Confirmar pedidos**: cada pedido pendiente requiere acción manual (contacto al cliente para coordinar entrega/pago).
- **Marcar como Enviado/Entregado**: para que el cliente vea progreso en su `/cuenta/pedidos/[N]`.
- **Inventario**: ajustar al recibir mercancía o al detectar mermas (ver `manual-usuario.md` §6).
- **Backups de DB**: si Neon free no lo cubre, considerar el plan Pro ($19/mes).

## 8. Costo total estimado a 1 año

| Concepto | Costo |
| --- | --- |
| Vercel Hobby | $0 |
| Neon free → Pro (cuando crezca) | $0–228 |
| Cloudinary free | $0 |
| Dominio | $15 |
| Email transaccional (Resend free) | $0 |
| **Total año 1** | **$15–243 USD** |

A medida que crezca el tráfico tendrás que pasarte a Vercel Pro ($20/mes) y Neon Pro. Pero hasta los primeros cientos de clientes activos al mes, el setup arriba aguanta cómodo.

## 9. Qué NO se contempla en este MVP (deuda técnica para producción)

- **Pasarela de pago real**: integrar MercadoPago Colombia (PSE + tarjetas + Nequi).
- **Notificaciones por email/SMS**: confirmación de pedido al cliente, alerta de stock bajo al admin.
- **Búsqueda full-text optimizada**: con catálogo creciendo, `ILIKE` se queda corto. Migrar a `pg_trgm` o Meilisearch.
- **Reportes**: PDFs de pedidos, exportación CSV, balance mensual.
- **Sucursales / multi-bodega**: el modelo asume una sola bodega.
- **Sistema de cupones / promociones**: el campo `comparePrice` solo permite el precio "antes" estático.
- **Reseñas verificadas**: los tabs en el detalle muestran "Reseñas — próximamente".
- **OAuth (Google/Facebook)**: los botones están deshabilitados con tooltip "Próximamente".
- **App móvil**: el sitio es responsive pero no hay app nativa.
