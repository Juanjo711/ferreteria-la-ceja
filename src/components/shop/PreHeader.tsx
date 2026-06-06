import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { Icon } from "@/components/ui/Icon";
import { BUSINESS } from "@/lib/business";
import { UserMenu } from "./UserMenu";

/**
 * Barra superior con teléfono y enlaces secundarios. Si hay sesión activa,
 * muestra el UserMenu (cliente) con saludo + cerrar sesión; si no, link a
 * /login.
 */
export async function PreHeader() {
  const session = await getServerSession(authOptions);

  return (
    <header className="bg-brand-dark text-slate-300 py-2 px-6 flex justify-between items-center text-xs font-medium">
      <div className="flex items-center gap-6">
        <span className="flex items-center gap-2">
          <Icon name="call" size={14} />
          {BUSINESS.phone}
        </span>
        <nav aria-label="Enlaces secundarios" className="hidden md:flex gap-4">
          <Link className="hover:text-white transition-colors" href="#">
            Envíos
          </Link>
          <Link className="hover:text-white transition-colors" href="#">
            Métodos de Pago
          </Link>
          <Link className="hover:text-white transition-colors" href="#">
            Seguimiento
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        {session?.user ? (
          <UserMenu
            fullName={session.user.name ?? session.user.email ?? "Cliente"}
            isAdmin={session.user.role === Role.ADMIN}
          />
        ) : (
          <>
            <Link className="hover:text-white transition-colors" href="/registro">
              Crear cuenta
            </Link>
            <span aria-hidden className="text-slate-500">
              |
            </span>
            <Link
              className="flex items-center gap-1 hover:text-white transition-colors"
              href="/login"
            >
              <Icon name="person" size={16} />
              Iniciar sesión
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
