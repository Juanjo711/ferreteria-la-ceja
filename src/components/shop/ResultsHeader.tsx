import { SortDropdown } from "./SortDropdown";
import type { ProductListFilters } from "@/lib/queries/catalog";

type Props = {
  title: string;
  subtitle?: string;
  total: number;
  filters: ProductListFilters;
};

export function ResultsHeader({ title, subtitle, total, filters }: Props) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
      <div className="max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-2 font-headline">
          {title}
        </h1>
        {subtitle && <p className="text-secondary text-lg">{subtitle}</p>}
        <p className="text-sm text-on-surface-variant mt-3">
          {total === 0
            ? "Sin resultados"
            : total === 1
              ? "1 producto encontrado"
              : `${total} productos encontrados`}
          {filters.q && (
            <>
              {" "}
              para “<span className="font-semibold text-on-surface">{filters.q}</span>”
            </>
          )}
        </p>
      </div>
      <SortDropdown filters={filters} />
    </div>
  );
}
