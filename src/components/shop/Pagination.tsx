import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  /** Constructor de URL: recibe la página deseada y devuelve la URL completa. */
  hrefFor: (page: number) => string;
};

/**
 * Paginación con elipses. Server component puro: cada número es un <Link>.
 *
 * Patrón: < 1 2 3 ... 12 >
 *   - Siempre muestra primera y última.
 *   - Muestra hasta 2 vecinos de currentPage.
 *   - Inserta ellipsis donde hay saltos.
 */
export function Pagination({ currentPage, totalPages, hrefFor }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = buildPageList(currentPage, totalPages);

  return (
    <nav
      aria-label="Paginación"
      className="mt-12 flex items-center justify-center gap-2 flex-wrap"
    >
      <PageButton
        href={currentPage > 1 ? hrefFor(currentPage - 1) : undefined}
        ariaLabel="Página anterior"
      >
        <Icon name="chevron_left" />
      </PageButton>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-2 text-secondary">
            …
          </span>
        ) : (
          <PageButton
            key={p}
            href={p === currentPage ? undefined : hrefFor(p)}
            active={p === currentPage}
            ariaLabel={`Página ${p}`}
          >
            {p}
          </PageButton>
        ),
      )}

      <PageButton
        href={currentPage < totalPages ? hrefFor(currentPage + 1) : undefined}
        ariaLabel="Página siguiente"
      >
        <Icon name="chevron_right" />
      </PageButton>
    </nav>
  );
}

function PageButton({
  href,
  active,
  ariaLabel,
  children,
}: {
  href?: string;
  active?: boolean;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  const cls = cn(
    "w-10 h-10 flex items-center justify-center rounded-lg transition-colors text-sm font-semibold",
    active && "bg-primary text-on-primary",
    !active && href && "bg-surface-container hover:bg-surface-container-high text-on-surface",
    !href && !active && "bg-surface-container/50 text-on-surface-variant/40 cursor-not-allowed",
  );
  if (!href) {
    return (
      <span aria-disabled aria-label={ariaLabel} className={cls}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} aria-label={ariaLabel} aria-current={active ? "page" : undefined} className={cls}>
      {children}
    </Link>
  );
}

function buildPageList(current: number, total: number): Array<number | "…"> {
  const out: Array<number | "…"> = [];
  const window = 1;
  const include = (n: number) => out.push(n);

  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || (p >= current - window && p <= current + window)) {
      if (out.length > 0 && p - (typeof out[out.length - 1] === "number" ? (out[out.length - 1] as number) : 0) > 1) {
        out.push("…");
      }
      include(p);
    }
  }
  return out;
}
