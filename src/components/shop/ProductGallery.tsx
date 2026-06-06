"use client";

import Image from "next/image";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

type Image = { url: string; alt: string | null };

/**
 * Galería con imagen principal y thumbnails clickeables. Componente
 * cliente porque mantiene el índice activo en estado local.
 */
export function ProductGallery({ images, productName }: { images: Image[]; productName: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="bg-surface-container-low rounded-xl aspect-square flex items-center justify-center text-on-surface-variant/40">
        <Icon name="image_not_supported" size={64} />
      </div>
    );
  }

  const current = images[active] ?? images[0]!;

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-surface-container-lowest rounded-xl overflow-hidden aspect-square flex items-center justify-center p-4 relative">
        <Image
          src={current.url}
          alt={current.alt ?? productName}
          fill
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-contain p-6"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, idx) => (
            <button
              key={img.url}
              type="button"
              aria-label={`Ver imagen ${idx + 1}`}
              aria-current={idx === active}
              onClick={() => setActive(idx)}
              className={cn(
                "relative aspect-square rounded-lg overflow-hidden p-2 bg-white border-2 transition-colors",
                idx === active
                  ? "border-primary-container"
                  : "border-transparent hover:border-outline-variant",
              )}
            >
              <Image
                src={img.url}
                alt={img.alt ?? `Imagen ${idx + 1} de ${productName}`}
                fill
                sizes="120px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
