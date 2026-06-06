import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { Icon } from "@/components/ui/Icon";
import { UserMenu } from "@/components/shop/UserMenu";
import { BUSINESS } from "@/lib/business";

/**
 * Layout del panel /admin — sidebar + top bar fija. Por ahora solo
 * contiene el shell; en la Fase 7 se conectan las secciones reales
 * (productos, inventario, pedidos, clientes).
 *
 * Aunque el middleware ya bloquea /admin/** a no-ADMIN, hacemos el
 * chequeo aquí también (defense in depth).
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }
  if (session.user.role !== Role.ADMIN) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-brand-dark text-white h-16 flex items-center justify-between px-6 sticky top-0 z-50">
        <Link href="/admin" className="flex items-center gap-2">
          <Icon name="build" filled className="text-primary-container" />
          <span className="font-bold tracking-tight">{BUSINESS.name}</span>
          <span className="ml-2 text-xs uppercase tracking-widest text-slate-400">Admin</span>
        </Link>
        <div className="text-sm">
          <UserMenu fullName={session.user.name ?? "Admin"} isAdmin />
        </div>
      </header>
      <div className="flex">
        <aside className="hidden md:flex flex-col w-64 min-h-[calc(100vh-4rem)] bg-brand-dark-deeper text-slate-300 px-4 py-8 gap-1">
          <SideLink href="/admin" icon="dashboard">
            Dashboard
          </SideLink>
          <SideLink href="/admin/productos" icon="inventory_2">
            Productos
          </SideLink>
          <SideLink href="/admin/inventario" icon="warehouse">
            Inventario
          </SideLink>
          <SideLink href="/admin/pedidos" icon="receipt_long">
            Pedidos
          </SideLink>
          <SideLink href="/admin/clientes" icon="group">
            Clientes
          </SideLink>
          <div className="mt-auto pt-6 border-t border-white/10 text-xs text-slate-500">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-2">
              <Icon name="storefront" size={16} />
              Volver a la tienda
            </Link>
          </div>
        </aside>
        <main className="flex-1 px-6 py-8 max-w-screen-xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}

function SideLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors text-sm font-medium"
    >
      <Icon name={icon} size={20} />
      {children}
    </Link>
  );
}
