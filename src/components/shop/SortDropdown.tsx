"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import type { ProductListFilters } from "@/lib/queries/catalog";
import { buildCatalogQuery, SORT_OPTIONS, type CatalogSort } from "@/lib/catalog-params";
import { cn } from "@/lib/cn";

/**
 * Dropdown de ordenamiento. Cliente mínimo: al cambiar, construye la URL
 * nueva conservando los demás filtros y navega con router.push.
 *
 * Uso server-side: pasar los filtros parseados — el componente solo lee
 * sort actual y usa el pathname de Next para reconstruir la URL.
 */
export function SortDropdown({ filters }: { filters: ProductListFilters }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  return (
    <div
      className={cn(
        "flex items-center gap-3 bg-surface-container-low p-2 rounded-xl",
        isPending && "opacity-60",
      )}
    >
      <span className="text-sm font-medium px-2 text-on-surface-variant">Ordenar por:</span>
      <select
        aria-label="Ordenar resultados"
        defaultValue={filters.sort ?? "popular"}
        onChange={(e) => {
          const value = e.target.value as CatalogSort;
          const qs = buildCatalogQuery(filters, { sort: value, page: null });
          startTransition(() => {
            router.push(`${pathname}${qs}`);
          });
        }}
        className="bg-transparent border-none text-sm font-bold text-on-surface focus:outline-none cursor-pointer"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
