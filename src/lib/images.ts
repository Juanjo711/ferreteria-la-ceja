import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/**
 * Procesa una imagen para el catálogo: redimensiona a un máximo de 1200×1200
 * manteniendo proporción, convierte a WebP calidad 80 y la guarda en disco.
 *
 * Usado por:
 *   - prisma/seed.ts (placeholders descargados de picsum.photos)
 *   - src/app/api/admin/products/[id]/images/route.ts (Fase 7: uploads reales)
 *
 * @param input  Buffer o ruta de un archivo de imagen de entrada (jpg/png/webp).
 * @param outputAbsolutePath  Ruta absoluta donde guardar el `.webp` resultante.
 * @returns Metadatos: tamaño en bytes y dimensiones finales.
 */
export async function processImage(
  input: Buffer | string,
  outputAbsolutePath: string,
): Promise<{ bytes: number; width: number; height: number }> {
  await fs.mkdir(path.dirname(outputAbsolutePath), { recursive: true });

  const pipeline = sharp(input)
    .rotate() // honra orientación EXIF antes de redimensionar
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY });

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
  await fs.writeFile(outputAbsolutePath, data);

  return { bytes: data.length, width: info.width, height: info.height };
}

/** MIME types aceptados por el endpoint de upload del admin (Fase 7). */
export const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const satisfies readonly string[];

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_IMAGES_PER_PRODUCT = 8;
export const MAX_DIMENSION = 1200;
export const WEBP_QUALITY = 80;
