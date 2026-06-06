import { Icon } from "@/components/ui/Icon";

/**
 * Sección de "Beneficios de tener cuenta" — mostrada bajo los formularios
 * de login/registro. Las 3 tarjetas son las de la maqueta, adaptadas a los
 * beneficios reales del MVP.
 */
export function AuthBenefits() {
  return (
    <section className="mt-16 bg-surface-container-low rounded-2xl p-8 md:p-12 overflow-hidden relative">
      <div aria-hidden className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
        <svg className="w-full h-full fill-primary" viewBox="0 0 100 100">
          <path d="M50 0 L100 25 L100 75 L50 100 L0 75 L0 25 Z" />
        </svg>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Benefit
          icon="local_shipping"
          title="Pedidos y envíos"
          description="Sigue el estado de cada compra desde nuestro taller hasta tu obra."
        />
        <Benefit
          icon="history"
          title="Historial de compras"
          description="Vuelve a pedir suministros con un click basándote en proyectos anteriores."
        />
        <Benefit
          icon="bolt"
          title="Checkout más rápido"
          description="Guarda tus datos de contacto y pago para terminar la compra en segundos."
        />
      </div>
    </section>
  );
}

function Benefit({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center group">
      <div className="w-16 h-16 bg-surface-container-lowest rounded-circle flex items-center justify-center shadow-sm mb-6 group-hover:bg-primary-container transition-colors duration-300">
        <Icon name={icon} className="text-primary group-hover:text-white text-3xl" />
      </div>
      <h3 className="text-lg font-bold mb-2 font-headline">{title}</h3>
      <p className="text-secondary text-sm leading-relaxed max-w-[240px]">{description}</p>
    </div>
  );
}
