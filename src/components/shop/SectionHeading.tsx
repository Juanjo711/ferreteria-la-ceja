import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

/**
 * Encabezado de sección con título grande + barra de marca debajo y un
 * link opcional alineado a la derecha.
 */
export function SectionHeading({
  title,
  href,
  cta = "Ver todos",
}: {
  title: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="flex flex-wrap justify-between items-end gap-4 mb-10">
      <div>
        <h2 className="text-3xl font-extrabold text-brand-dark mb-2 uppercase tracking-tight font-headline">
          {title}
        </h2>
        <div className="h-1.5 w-24 bg-primary-container rounded-full" />
      </div>
      {href && (
        <Link
          href={href}
          className="text-primary font-bold flex items-center gap-1 hover:underline"
        >
          {cta}
          <Icon name="arrow_forward" size={16} />
        </Link>
      )}
    </div>
  );
}
