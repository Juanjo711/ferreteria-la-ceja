import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Icon } from "@/components/ui/Icon";
import { Breadcrumb } from "@/components/shop/Breadcrumb";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Mi cuenta" };

/**
 * Página de perfil del cliente. Lee la sesión, refresca datos desde DB
 * (la sesión solo trae id+role; el resto puede haber cambiado).
 */
export default async function CuentaPage() {
  // El layout (account) ya garantiza sesión, pero TS necesita el chequeo.
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      fullName: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });
  if (!user) return null;

  const isAdmin = user.role === Role.ADMIN;

  return (
    <>
      <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Mi cuenta" }]} className="mb-6" />

      <div className="max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-1 font-headline">
          Hola, {user.fullName.split(/\s+/)[0]}
        </h1>
        <p className="text-on-surface-variant mb-8">
          Bienvenido de vuelta a Ferretería La Ceja.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <ProfileCard
            icon="person"
            title="Datos personales"
            primary={user.fullName}
            secondary={user.email}
            tertiary={user.phone ?? "Sin teléfono registrado"}
          />
          <ProfileCard
            icon="badge"
            title="Tipo de cuenta"
            primary={isAdmin ? "Administrador" : "Cliente"}
            secondary={`Creada el ${formatDateTime(user.createdAt)}`}
            tertiary={
              isAdmin
                ? "Acceso completo al panel /admin"
                : "Cuenta estándar de compras"
            }
          />
          <ProfileCard
            icon="receipt_long"
            title="Mis pedidos"
            primary="0 pedidos"
            secondary="Tu historial aparecerá aquí cuando hagas tu primera compra."
            tertiary={null}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/productos"
            className="flex items-center gap-3 px-6 py-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl hover:border-primary-container transition-colors"
          >
            <Icon name="storefront" className="text-primary-container" />
            <span className="font-bold text-on-surface">Seguir comprando</span>
            <Icon name="arrow_forward" size={18} className="text-on-surface-variant ml-auto" />
          </Link>
          <Link
            href="/cuenta/pedidos"
            className="flex items-center gap-3 px-6 py-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl hover:border-primary-container transition-colors"
          >
            <Icon name="receipt_long" className="text-primary-container" />
            <span className="font-bold text-on-surface">Ver mis pedidos</span>
            <Icon name="arrow_forward" size={18} className="text-on-surface-variant ml-auto" />
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="md:col-span-2 flex items-center gap-3 px-6 py-4 bg-brand-dark text-white rounded-xl hover:bg-brand-dark-deeper transition-colors"
            >
              <Icon name="admin_panel_settings" />
              <span className="font-bold">Ir al panel de administración</span>
              <Icon name="arrow_forward" size={18} className="ml-auto" />
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

function ProfileCard({
  icon,
  title,
  primary,
  secondary,
  tertiary,
}: {
  icon: string;
  title: string;
  primary: string;
  secondary: string;
  tertiary: string | null;
}) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-6">
      <div className="flex items-center gap-2 text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-3">
        <Icon name={icon} size={18} className="text-primary-container" />
        {title}
      </div>
      <p className="text-on-surface font-bold mb-1">{primary}</p>
      <p className="text-sm text-on-surface-variant">{secondary}</p>
      {tertiary && <p className="text-xs text-on-surface-variant/70 mt-2">{tertiary}</p>}
    </div>
  );
}
