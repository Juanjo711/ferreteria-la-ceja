import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { buttonClasses } from "@/components/ui/Button";

/**
 * Hero a la derecha del sidebar de categorías. En lugar de una foto stock
 * de un taller (la maqueta usa una imagen externa de Google), construimos
 * el banner con un gradiente de marca y un ícono gigante de fondo. Es
 * 100% local, no dependemos de assets externos y conserva el peso visual.
 */
export function HeroBanner() {
  return (
    <div className="lg:w-3/4 relative rounded-2xl overflow-hidden min-h-[420px] lg:min-h-[500px] flex items-center bg-brand-dark">
      {/* Capa decorativa con el ícono de la marca */}
      <div
        aria-hidden
        className="absolute inset-0 flex items-center justify-end pr-6 lg:pr-20 pointer-events-none opacity-15"
      >
        <Icon name="construction" filled className="text-primary-container" size={520} />
      </div>
      {/* Gradiente: oscuro a la izquierda, transparente a la derecha */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/70 to-brand-dark/0"
      />
      <div className="relative z-10 px-8 lg:px-12 max-w-2xl">
        <span className="bg-primary-container text-white px-3 py-1 text-xs font-bold tracking-widest uppercase rounded mb-4 inline-block">
          Calidad Industrial
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight font-headline">
          HERRAMIENTAS PROFESIONALES
        </h1>
        <p className="text-slate-200 text-lg mb-8 max-w-lg">
          Equípate con lo mejor para tus proyectos de construcción y carpintería. Descuentos
          exclusivos para maestros de obra.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/productos" className={buttonClasses({ variant: "primary", size: "lg" })}>
            COMPRAR AHORA
            <Icon name="arrow_forward" />
          </Link>
          <Link
            href="/productos"
            className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/30 px-8 py-4 font-bold rounded-lg transition-all inline-flex items-center"
          >
            CATÁLOGO
          </Link>
        </div>
      </div>
    </div>
  );
}
