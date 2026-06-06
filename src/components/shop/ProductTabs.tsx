"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

type TabKey = "descripcion" | "especificaciones" | "resenas";

type Props = {
  description: string;
  specs: Record<string, string> | null;
};

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "descripcion", label: "Descripción" },
  { key: "especificaciones", label: "Info adicional" },
  { key: "resenas", label: "Reseñas" },
];

export function ProductTabs({ description, specs }: Props) {
  const [active, setActive] = useState<TabKey>("descripcion");

  return (
    <section className="mb-20">
      <div className="flex flex-wrap border-b border-surface-container-highest mb-8" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={active === t.key}
            type="button"
            onClick={() => setActive(t.key)}
            className={cn(
              "px-6 md:px-8 py-4 border-b-2 transition-colors font-semibold",
              active === t.key
                ? "border-primary text-on-surface font-bold"
                : "border-transparent text-secondary hover:text-on-surface",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {active === "descripcion" && (
          <p className="text-on-surface-variant leading-relaxed whitespace-pre-line max-w-3xl">
            {description}
          </p>
        )}

        {active === "especificaciones" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2 space-y-6">
              <h3 className="text-2xl font-bold font-headline">Especificaciones técnicas</h3>
              {specs && Object.keys(specs).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 max-w-2xl">
                  {Object.entries(specs).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between gap-4 border-b border-surface-container-low py-2"
                    >
                      <span className="text-secondary font-medium">{key}</span>
                      <span className="font-bold text-right">{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-on-surface-variant">
                  Este producto aún no tiene especificaciones técnicas registradas.
                </p>
              )}
            </div>
            <aside className="bg-surface-container-low p-8 rounded-xl h-fit">
              <h4 className="font-bold mb-4 font-headline">¿Necesitas asesoría?</h4>
              <p className="text-sm text-secondary mb-6">
                Nuestros expertos están disponibles para ayudarte a elegir la mejor herramienta.
              </p>
              <a
                href="tel:+576041234567"
                className="flex items-center gap-3 text-primary font-bold hover:gap-4 transition-all"
              >
                <Icon name="support_agent" />
                Llamar a un experto
              </a>
            </aside>
          </div>
        )}

        {active === "resenas" && (
          <div className="text-center py-12 max-w-xl mx-auto">
            <Icon name="rate_review" size={48} className="text-primary-container/60 inline-block mb-4" />
            <h3 className="text-xl font-bold text-on-surface mb-2 font-headline">
              Reseñas — próximamente
            </h3>
            <p className="text-on-surface-variant">
              El sistema de reseñas verificadas estará disponible en una próxima actualización.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
