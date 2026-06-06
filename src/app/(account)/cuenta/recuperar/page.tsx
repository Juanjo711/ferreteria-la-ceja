import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { BUSINESS } from "@/lib/business";

export const metadata = { title: "Recuperar contraseña" };

/**
 * Recuperación de contraseña — fuera del alcance del MVP. Se reemplaza por
 * instrucciones de contacto directo con el administrador.
 */
export default function RecuperarPage() {
  return (
    <div className="max-w-xl mx-auto py-20 text-center">
      <Icon name="lock_reset" size={72} className="text-primary-container mb-6 inline-block" />
      <h1 className="text-2xl font-extrabold text-brand-dark mb-3 font-headline">
        Recuperación de contraseña — próximamente
      </h1>
      <p className="text-on-surface-variant mb-6">
        Esta funcionalidad estará disponible en una próxima actualización. Mientras tanto, escríbenos
        para restablecerla manualmente:
      </p>
      <a
        href={`mailto:${BUSINESS.email}`}
        className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
      >
        <Icon name="mail" />
        {BUSINESS.email}
      </a>
      <div className="mt-10">
        <Link href="/login" className="text-secondary hover:text-primary text-sm">
          ← Volver al login
        </Link>
      </div>
    </div>
  );
}
