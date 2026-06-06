import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

/**
 * Sección naranja CTA antes del footer. El form es decorativo en el MVP
 * (no hay sistema de newsletter); por eso el botón previene submit.
 */
export function NewsletterCta() {
  return (
    <section
      aria-label="Club de beneficios"
      className="relative bg-primary-container rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-8 mb-20 overflow-hidden"
    >
      <div className="absolute right-0 top-0 opacity-10 rotate-12 pointer-events-none">
        <Icon name="build" filled className="text-white" size={240} />
      </div>
      <div className="relative z-10">
        <h2 className="text-3xl font-black text-on-primary-fixed mb-2 font-headline">
          ¿ERES MAESTRO DE OBRA?
        </h2>
        <p className="text-on-primary-fixed/80 font-medium text-lg">
          Únete a nuestro club de beneficios y recibe descuentos exclusivos.
        </p>
      </div>
      <form
        className="flex flex-col sm:flex-row w-full md:w-auto gap-4 relative z-10"
        // noValidate + onSubmit en el client-form de Fase 4. Por ahora es decorativo.
        action="#"
      >
        <input
          type="email"
          required
          placeholder="Tu correo electrónico"
          aria-label="Tu correo electrónico"
          className="bg-white/90 border-none rounded-lg px-6 py-4 sm:min-w-[300px] focus:outline-none focus:ring-2 focus:ring-brand-dark/30"
        />
        <Button variant="dark" size="lg" title="Próximamente">
          REGISTRARME
        </Button>
      </form>
    </section>
  );
}
