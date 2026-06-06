"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

type Props = {
  fullName: string;
  isAdmin: boolean;
};

/**
 * Menú compacto que muestra el nombre del usuario y un botón de cerrar
 * sesión. Lo usa el PreHeader cuando hay sesión activa. Es cliente porque
 * llama a signOut() de next-auth/react.
 */
export function UserMenu({ fullName, isAdmin }: Props) {
  const firstName = fullName.split(/\s+/)[0] ?? fullName;
  return (
    <div className="flex items-center gap-3">
      <Link
        href={isAdmin ? "/admin" : "/cuenta"}
        className="flex items-center gap-1 hover:text-white transition-colors"
      >
        <Icon name="person" size={16} filled />
        Hola, {firstName}
      </Link>
      <span aria-hidden className="text-slate-500">
        |
      </span>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="flex items-center gap-1 hover:text-white transition-colors"
      >
        <Icon name="logout" size={16} />
        Cerrar sesión
      </button>
    </div>
  );
}
