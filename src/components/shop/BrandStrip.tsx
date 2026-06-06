/**
 * Tira de marcas en escala de grises. Como no tenemos los logos
 * vectoriales licenciados de DeWalt/Stanley/Bosch/etc., renderizamos los
 * nombres con tipografía pesada como sustituto. El bloque conserva su
 * peso visual en la home y el upgrade futuro es trivial: cambiar el
 * <span> por un <img src="/uploads/brands/{slug}.svg" />.
 */

type Brand = {
  id: string;
  name: string;
};

export function BrandStrip({ brands }: { brands: readonly Brand[] }) {
  if (brands.length === 0) return null;
  return (
    <section aria-label="Marcas que distribuimos" className="mb-20">
      <div className="flex flex-wrap justify-around items-center gap-8 px-8 py-10 bg-white rounded-2xl border border-outline-variant/30">
        {brands.map((brand) => (
          <span
            key={brand.id}
            className="text-2xl md:text-3xl font-black text-on-surface-variant/40 tracking-tight font-headline grayscale hover:grayscale-0 hover:text-on-surface-variant transition-all"
          >
            {brand.name}
          </span>
        ))}
      </div>
    </section>
  );
}
