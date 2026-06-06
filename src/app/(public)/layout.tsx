import type { ReactNode } from "react";
import { PreHeader } from "@/components/shop/PreHeader";
import { Navbar } from "@/components/shop/Navbar";
import { Footer } from "@/components/shop/Footer";

/**
 * Layout para todas las rutas públicas del e-commerce (home, catálogo,
 * detalle, carrito, login). Conforma el "frame" visual de la tienda.
 *
 * Rutas autenticadas del cliente (/cuenta, /pedidos, /checkout) viven en
 * el grupo (account) — Fase 4/6 — con la misma cabecera pero distinto
 * comportamiento de auth.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PreHeader />
      <Navbar />
      <main className="max-w-screen-2xl mx-auto px-6 py-8">{children}</main>
      <Footer />
    </>
  );
}
