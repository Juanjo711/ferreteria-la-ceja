import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { Role } from "@prisma/client";

/**
 * Middleware de autorización.
 *
 * Reglas:
 *   - /admin/**            → solo ADMIN; CLIENT autenticado se redirige a /
 *                            (sin sesión: redirige a /login con callbackUrl)
 *   - /cuenta/**           → requiere sesión
 *   - /checkout/**         → requiere sesión
 *   - /pedidos/**          → requiere sesión
 *
 * El `authorized` callback decide si la petición pasa. `withAuth` envuelve
 * la respuesta y se encarga del redirect a /login con callbackUrl cuando
 * el token está ausente y la ruta lo requiere.
 *
 * NOTA: las páginas también validan internamente (defense in depth) — esto
 * es solo para evitar carga innecesaria y mostrar la pantalla correcta.
 */
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;

    // CLIENT no puede entrar a /admin → mandar a home.
    if (pathname.startsWith("/admin") && role !== Role.ADMIN) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => Boolean(token),
    },
    pages: { signIn: "/login" },
  },
);

export const config = {
  // Solo corre middleware sobre estas rutas; el resto (home, /productos, etc.)
  // queda libre. Excluimos /api/auth/* implícitamente al no listarlos.
  matcher: ["/admin/:path*", "/cuenta/:path*", "/checkout/:path*", "/pedidos/:path*"],
};
