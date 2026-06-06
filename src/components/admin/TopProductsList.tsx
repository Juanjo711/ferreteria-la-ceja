import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import type { TopProductRow } from "@/lib/queries/admin";

export function TopProductsList({ products }: { products: TopProductRow[] }) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm">
      <h2 className="text-lg font-bold text-on-surface mb-6 font-headline">Top 5 productos</h2>
      {products.length === 0 ? (
        <p className="text-sm text-on-surface-variant text-center py-8">
          Aún no hay datos suficientes para calcular el ranking.
        </p>
      ) : (
        <div className="space-y-4">
          {products.map((p, idx) => (
            <div key={p.productId} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface-container relative overflow-hidden shrink-0 flex items-center justify-center">
                {p.primaryImage ? (
                  <Image
                    src={p.primaryImage}
                    alt={p.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  <Icon name="inventory_2" size={20} className="text-on-surface-variant/40" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-on-surface truncate">{p.name}</p>
                <p className="text-xs text-on-surface-variant truncate">
                  {p.categoryName}
                  {p.brandName && ` · ${p.brandName}`}
                </p>
              </div>
              <span className="text-sm font-black text-primary">{p.unitsSold}</span>
              {idx === 0 && (
                <Icon name="emoji_events" filled size={16} className="text-yellow-500" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
