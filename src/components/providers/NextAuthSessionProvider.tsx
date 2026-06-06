"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { CartHydrator } from "./CartHydrator";

/**
 * Wrapper cliente para el SessionProvider de NextAuth + CartHydrator.
 * Lo separamos en su propio archivo para mantener el root layout como
 * Server Component.
 *
 * Habilita useSession() en cualquier client component y mantiene el
 * carrito sincronizado con la sesión activa.
 */
export function NextAuthSessionProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <CartHydrator />
      {children}
    </SessionProvider>
  );
}
