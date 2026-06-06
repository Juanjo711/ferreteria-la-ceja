import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

type Category = {
  id: string;
  slug: string;
  name: string;
  icon: string;
};

/**
 * Sidebar con la lista oficial de categorías. Las filas son links a
 * /productos/categoria/[slug] (esa ruta vive en la Fase 3).
 */
export function CategorySidebar({ categories }: { categories: readonly Category[] }) {
  return (
    <aside className="lg:w-1/4 bg-white rounded-xl shadow-sm overflow-hidden border border-outline-variant/30">
      <div className="bg-surface-container-low p-4 border-b border-outline-variant/20">
        <h3 className="font-bold text-brand-dark flex items-center gap-2 font-headline uppercase tracking-wider text-sm">
          <Icon name="menu" />
          Categorías
        </h3>
      </div>
      <ul className="flex flex-col">
        {categories.map((cat, index) => (
          <li key={cat.id} className="group">
            <Link
              href={`/productos/categoria/${cat.slug}`}
              className={
                "flex items-center justify-between px-5 py-4 hover:bg-surface-container-low transition-colors " +
                (index < categories.length - 1 ? "border-b border-outline-variant/10" : "")
              }
            >
              <span className="flex items-center gap-3 text-sm font-medium text-secondary">
                <Icon
                  name={cat.icon}
                  className="text-on-surface-variant/50 group-hover:text-primary-container transition-colors"
                />
                {cat.name}
              </span>
              <Icon name="chevron_right" size={18} className="text-on-surface-variant/40" />
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
