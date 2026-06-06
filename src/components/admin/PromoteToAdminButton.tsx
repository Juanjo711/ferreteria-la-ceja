"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { promoteToAdmin } from "@/app/actions/admin-customers";

/**
 * Botón para promover un CLIENT a ADMIN. Doble confirmación (alert
 * nativo + verificación del email del usuario que escribe).
 */
export function PromoteToAdminButton({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleClick() {
    setError(null);
    const ok = confirm(
      `¿Promover a este usuario a ADMINISTRADOR?\n\n${email}\n\nUn admin tiene acceso al panel y puede editar productos, pedidos y otros clientes.`,
    );
    if (!ok) return;
    const typed = prompt(
      `Para confirmar, escribe el correo del usuario:\n${email}`,
    );
    if (typed?.trim().toLowerCase() !== email.toLowerCase()) {
      setError("El correo no coincide. Operación cancelada.");
      return;
    }
    startTransition(async () => {
      const res = await promoteToAdmin(userId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="inline-flex items-center gap-2 bg-error/10 text-error hover:bg-error hover:text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
      >
        <Icon name="admin_panel_settings" size={18} />
        {isPending ? "Promoviendo…" : "Promover a ADMIN"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-error font-semibold">
          {error}
        </p>
      )}
    </>
  );
}
