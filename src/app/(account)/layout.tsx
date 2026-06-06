import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PreHeader } from "@/components/shop/PreHeader";
import { Navbar } from "@/components/shop/Navbar";
import { Footer } from "@/components/shop/Footer";

/**
 * Layout para rutas autenticadas del cliente (/cuenta, /checkout, /pedidos).
 *
 * El middleware ya bloquea estos paths para usuarios no autenticados, pero
 * mantenemos el chequeo aquí como red de seguridad (defense in depth) y para
 * que getServerSession esté disponible en hijos sin tener que reesconderlo.
 */
export default async function AccountLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login?callbackUrl=/cuenta");
  }

  return (
    <>
      <PreHeader />
      <Navbar />
      <main className="max-w-screen-2xl mx-auto px-6 py-8">{children}</main>
      <Footer />
    </>
  );
}
