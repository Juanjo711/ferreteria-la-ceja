# ADR 0003 — Doble `signIn` para evitar carrera con cookies

**Estado:** Aceptado
**Fecha:** 2026-05-25
**Fase:** 8 (Pruebas)

## Contexto

Durante la implementación de los flujos E2E con Playwright nos encontramos con un fallo intermitente / reproducible en:

1. **Registro + auto-login** (en `RegisterForm`): el usuario se creaba en DB, `signIn` retornaba 200 OK, pero el middleware en la navegación inmediata a `/cuenta` rechazaba la sesión y redirigía a `/login`.
2. **Login normal** (en `LoginForm`): el mismo síntoma — `signIn(redirect: false)` resolvía con `{ ok: true, error: null }` pero `router.replace` a `/cuenta` era interceptado por el middleware.

Investigando con logs en el callback `authorize` de NextAuth detectamos que **en la primera invocación a `signIn` por sesión de navegador, el callback `authorize` nunca corría** (response 200 en ~15ms, sin tocar Prisma ni bcrypt). NextAuth respondía con un `redirect-to-signin` indicando "credenciales inválidas".

La hipótesis: la cookie `next-auth.csrf-token` se establece en la respuesta a `GET /api/auth/csrf`, pero **el browser de Playwright no termina de commitearla al cookie store antes de que `signIn` haga el siguiente `POST` al callback** con el `csrfToken` en el body. Como no hay cookie matching, NextAuth descarta el request antes de llegar a `authorize`.

Al hacer una **segunda** llamada a `signIn` poco después, la cookie ya estaba commiteada y el callback ejecutaba normal.

## Decisión

En `LoginForm` y `RegisterForm` invocamos `signIn` **dos veces**:

```tsx
// 1) probe: warm-up del cookie CSRF + verifica credenciales sin navegar
const probe = await signIn("credentials", { ...values, redirect: false });
if (!probe || probe.error) {
  setFormError("Credenciales inválidas.");
  return;
}

// 2) real: signIn con redirect server-side. NextAuth setea la cookie de
// sesión y devuelve un 302 a callbackUrl; al seguirlo el browser ya
// incluye la cookie, el middleware la ve, deja pasar.
await signIn("credentials", { ...values, callbackUrl });
```

- La **primera llamada** sirve doble propósito: (a) reservar el cookie CSRF para el segundo POST, y (b) mostrar el error de credenciales inline si son inválidas (sin abandonar la página).
- La **segunda llamada** usa `redirect: true` implícito. NextAuth ejecuta `authorize`, setea `next-auth.session-token` y emite un `Location: /cuenta` al browser. La navegación resultante incluye la cookie en la request, el middleware autoriza, y aterrizamos en la página protegida.

## Alternativas consideradas

1. **`window.location.assign(callbackUrl)` después de un único `signIn`** — no funcionó: el browser sigue sin tener la cookie a tiempo. Probado y descartado.
2. **`await new Promise(r => setTimeout(r, 200))` entre `signIn` y nav** — funciona pero introduce un sleep arbitrario. Frágil y feo.
3. **Migrar a NextAuth v5 (Auth.js)** — soporta Server Actions y posiblemente evita este race. Descartado por ADR 0001 (v5 sigue en beta, no es alcance del MVP).
4. **Refrescar manualmente el csrfToken con `getCsrfToken()` antes del segundo `signIn`** — el SDK ya lo hace internamente; el problema es el commit del cookie, no el token.

## Consecuencias

- ✅ Login y registro funcionan tanto en Playwright como en uso real.
- ✅ El usuario ve errores de credenciales inline (gracias al primer probe).
- ⚠️ Cada login exitoso hace **dos POSTs** a `/api/auth/callback/credentials` en lugar de uno. Aceptable para el MVP — la operación es rápida (~20ms cada una) y los logins ocurren con baja frecuencia.
- ⚠️ El segundo `signIn` también ejecuta `authorize` (re-verifica credenciales). Idempotente y seguro, pero duplica el bcrypt.compare. Si esto fuera bottleneck, se podría caché el resultado del probe — innecesario hoy.

## Notas operacionales

Si en el futuro al migrar a NextAuth v5 / Auth.js este problema desaparece, simplificar a un solo `signIn`. Mientras tanto, mantener los comentarios en el código para que un próximo lector no "limpie" el código pensando que el doble call es un error.
