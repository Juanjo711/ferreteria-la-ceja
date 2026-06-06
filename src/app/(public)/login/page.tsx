import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { LoginForm } from "@/components/forms/LoginForm";
import { AuthBenefits } from "@/components/shop/AuthBenefits";

export const metadata = { title: "Iniciar sesión" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string };
}) {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect(searchParams.callbackUrl || "/cuenta");
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-4 font-headline">
          Mi Cuenta
        </h1>
        <div className="h-1 w-20 bg-primary-container mx-auto" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
        <section className="lg:col-span-3 bg-surface-container-lowest p-8 md:p-12 rounded-xl shadow-sm border border-outline-variant/10">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2 font-headline">Bienvenido de nuevo</h2>
            <p className="text-secondary text-sm">
              Ingresa a tu cuenta para gestionar tus pedidos.
            </p>
          </div>
          <LoginForm />
        </section>

        <aside className="lg:col-span-2 p-4 md:p-8">
          <h2 className="text-2xl font-bold mb-3 font-headline">¿Primera vez por aquí?</h2>
          <p className="text-secondary mb-6">
            Crea una cuenta gratis y disfruta de pedidos rastreables, historial de compras y
            checkout más rápido.
          </p>
          <Link
            href="/registro"
            className="inline-flex items-center gap-2 border-2 border-primary-container text-primary-container font-bold px-8 py-3 rounded-lg hover:bg-primary-container hover:text-white transition-all"
          >
            CREAR CUENTA NUEVA
          </Link>
        </aside>
      </div>

      <AuthBenefits />
    </div>
  );
}
