import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { CartCounter } from "@/components/cart/CartCounter";
import { BUSINESS } from "@/lib/business";
import { SearchForm } from "./SearchForm";

/**
 * Navbar principal: logo + búsqueda + acciones (favoritos / carrito).
 *
 * Sticky en top con sombra suave. Favoritos queda como "Próximamente"
 * (fuera del alcance del MVP). El contador del carrito lee del store
 * Zustand vía CartCounter.
 */
export function Navbar() {
  return (
    <nav className="bg-white sticky top-0 z-50 shadow-sm px-6 h-20 flex items-center justify-between gap-8">
      <Link href="/" className="flex items-center gap-2 shrink-0 group">
        <Icon
          name="build"
          filled
          className="text-primary-container group-hover:text-primary transition-colors"
          size={32}
        />
        <span className="text-xl font-extrabold text-brand-dark tracking-tight font-headline">
          {BUSINESS.name}
        </span>
      </Link>

      <SearchForm className="flex-grow max-w-2xl" />

      <div className="flex items-center gap-2">
        <IconButton
          iconName="favorite"
          label="Favoritos (próximamente)"
          title="Próximamente"
          disabled
          className="disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <CartCounter />
      </div>
    </nav>
  );
}
