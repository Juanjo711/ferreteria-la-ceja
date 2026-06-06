import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CheckoutForm } from "@/components/forms/CheckoutForm";
import { Breadcrumb } from "@/components/shop/Breadcrumb";

export const metadata = { title: "Checkout" };

/**
 * /checkout — requiere sesión (lo enforce el middleware) + carrito no vacío.
 *
 * Pasamos al form los defaults del usuario (nombre + teléfono guardados al
 * registrarse) para acelerar el llenado. La verificación de carrito vacío
 * se hace en cliente también porque el carrito vive principalmente en el
 * store; aquí solo lo intentamos prefetchar.
 */
export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login?callbackUrl=/checkout");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { fullName: true, phone: true },
  });
  if (!user) redirect("/login");

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Inicio", href: "/" },
          { label: "Carrito", href: "/carrito" },
          { label: "Checkout" },
        ]}
        className="mb-6"
      />
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight font-headline">
          Finalizar pedido
        </h1>
        <p className="text-on-surface-variant mt-2">
          Completa tu dirección y método de pago para confirmar.
        </p>
      </div>
      <CheckoutForm defaults={{ fullName: user.fullName, phone: user.phone }} />
    </>
  );
}
