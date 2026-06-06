import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { BUSINESS } from "@/lib/business";

/**
 * Footer dark de 4 columnas. Las redes sociales y los métodos de pago son
 * decorativos (links #) — el alcance del MVP no incluye integración real.
 */
export function Footer() {
  return (
    <footer className="bg-brand-dark text-slate-400 pt-20 pb-10 px-8 mt-20">
      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        {/* Columna empresa */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Icon name="build" filled className="text-primary-container" size={36} />
            <span className="text-2xl font-black text-white tracking-tight font-headline">
              {BUSINESS.name}
            </span>
          </div>
          <p className="text-sm leading-relaxed">
            Somos el aliado estratégico de tus construcciones en La Ceja y todo el Oriente Antioqueño.
            Más de 10 años proveyendo calidad industrial.
          </p>
          <div className="flex gap-4">
            <SocialIcon label="Facebook">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </SocialIcon>
            <SocialIcon label="Instagram">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </SocialIcon>
          </div>
        </div>

        {/* Enlaces */}
        <div>
          <h4 className="text-white font-bold mb-6 text-lg uppercase tracking-wider">
            Enlaces Útiles
          </h4>
          <ul className="space-y-4 text-sm">
            <li>
              <Link className="hover:text-primary-container transition-colors" href="#">
                Preguntas Frecuentes
              </Link>
            </li>
            <li>
              <Link className="hover:text-primary-container transition-colors" href="#">
                Políticas de Devolución
              </Link>
            </li>
            <li>
              <Link className="hover:text-primary-container transition-colors" href="#">
                Guía de Compra
              </Link>
            </li>
            <li>
              <Link className="hover:text-primary-container transition-colors" href="#">
                Trabaja con Nosotros
              </Link>
            </li>
            <li>
              <Link className="hover:text-primary-container transition-colors" href="#">
                Términos y Condiciones
              </Link>
            </li>
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <h4 className="text-white font-bold mb-6 text-lg uppercase tracking-wider">Contacto</h4>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <Icon name="location_on" className="text-primary-container mt-0.5" />
              <span>{BUSINESS.address}</span>
            </li>
            <li className="flex items-center gap-3">
              <Icon name="call" className="text-primary-container" />
              <span>{BUSINESS.phone}</span>
            </li>
            <li className="flex items-center gap-3">
              <Icon name="mail" className="text-primary-container" />
              <span>{BUSINESS.email}</span>
            </li>
            <li className="flex items-center gap-3">
              <Icon name="schedule" className="text-primary-container" />
              <span>{BUSINESS.hours}</span>
            </li>
          </ul>
        </div>

        {/* CTA catálogo */}
        <div>
          <h4 className="text-white font-bold mb-6 text-lg uppercase tracking-wider">
            Catálogo
          </h4>
          <p className="text-sm mb-6">
            Explora todo nuestro catálogo de herramientas y materiales.
          </p>
          <Link
            href="/productos"
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded border border-white/10 transition-all w-full justify-center"
          >
            <Icon name="storefront" />
            Ver Catálogo
          </Link>
        </div>
      </div>

      <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium">
        <p>
          © {new Date().getFullYear()} {BUSINESS.name} — {BUSINESS.tagline}. Todos los derechos
          reservados.
        </p>
        <div className="flex gap-6 opacity-60">
          <PaymentText>VISA</PaymentText>
          <PaymentText>Mastercard</PaymentText>
          <PaymentText>PSE</PaymentText>
          <PaymentText>Contraentrega</PaymentText>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <a
      href="#"
      aria-label={label}
      className="w-10 h-10 rounded-circle bg-white/5 flex items-center justify-center hover:bg-primary-container transition-colors"
    >
      <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24" aria-hidden>
        {children}
      </svg>
    </a>
  );
}

function PaymentText({ children }: { children: React.ReactNode }) {
  return <span className="text-white/70 text-[10px] font-bold uppercase tracking-wider">{children}</span>;
}
