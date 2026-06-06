import path from "node:path";
import fs from "node:fs/promises";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "node:crypto";
import {
  processImage,
  ACCEPTED_IMAGE_MIME_TYPES,
  MAX_IMAGE_BYTES,
  MAX_IMAGES_PER_PRODUCT,
} from "@/lib/images";

const UPLOAD_DIR = path.resolve(process.cwd(), "public", "uploads", "products");
const PUBLIC_BASE = "/uploads/products";

/**
 * POST /api/admin/products/[id]/images
 *
 * Sube imágenes para un producto. Multipart/form-data con field "files"
 * (uno o varios). Cada archivo se valida (MIME + tamaño), procesa con
 * sharp a WebP 1200x1200 calidad 80, y se guarda en
 * public/uploads/products/<cuid>.webp.
 *
 * Limites:
 *   - MIME: image/jpeg, image/png, image/webp
 *   - Tamaño: <= 5 MB por archivo
 *   - Máx 8 imágenes por producto
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      _count: { select: { images: true } },
      images: { select: { id: true, order: true }, orderBy: { order: "desc" }, take: 1 },
    },
  });
  if (!product) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });

  const formData = await request.formData();
  const files = formData.getAll("files").filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "Sin archivos" }, { status: 400 });
  }

  const slotsLeft = MAX_IMAGES_PER_PRODUCT - product._count.images;
  if (files.length > slotsLeft) {
    return NextResponse.json(
      { error: `Máximo ${MAX_IMAGES_PER_PRODUCT} imágenes por producto. Quedan ${slotsLeft}.` },
      { status: 400 },
    );
  }

  const created: Array<{ id: string; url: string }> = [];
  let nextOrder = (product.images[0]?.order ?? -1) + 1;

  for (const file of files) {
    if (!ACCEPTED_IMAGE_MIME_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_MIME_TYPES)[number])) {
      return NextResponse.json(
        { error: `Tipo no soportado: ${file.type}` },
        { status: 400 },
      );
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: `Archivo demasiado grande: ${file.name} (máx 5 MB)` },
        { status: 400 },
      );
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const filename = `${randomUUID()}.webp`;
    const outPath = path.join(UPLOAD_DIR, filename);
    try {
      await processImage(buf, outPath);
    } catch (e) {
      console.error("[admin] processImage error:", e);
      return NextResponse.json(
        { error: `No pudimos procesar ${file.name}` },
        { status: 500 },
      );
    }

    const img = await prisma.productImage.create({
      data: {
        productId: product.id,
        url: `${PUBLIC_BASE}/${filename}`,
        alt: file.name,
        order: nextOrder++,
      },
      select: { id: true, url: true },
    });
    created.push({ id: img.id, url: img.url });
  }

  return NextResponse.json({ images: created });
}

/**
 * DELETE /api/admin/products/[id]/images?imageId=xxx
 * Elimina una imagen específica (y su archivo en disco si está bajo /uploads/products).
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const url = new URL(request.url);
  const imageId = url.searchParams.get("imageId");
  if (!imageId) return NextResponse.json({ error: "imageId requerido" }, { status: 400 });

  const img = await prisma.productImage.findUnique({
    where: { id: imageId },
    select: { id: true, url: true, productId: true },
  });
  if (!img || img.productId !== params.id) {
    return NextResponse.json({ error: "Imagen no encontrada" }, { status: 404 });
  }

  await prisma.productImage.delete({ where: { id: imageId } });

  // Intentar borrar el archivo. Solo si está bajo /uploads/products/ (no
  // borrar seed/ por accidente — esos son del seed compartido).
  try {
    if (img.url.startsWith("/uploads/products/") && !img.url.startsWith("/uploads/products/seed/")) {
      const filename = path.basename(img.url);
      const filePath = path.join(UPLOAD_DIR, filename);
      await fs.unlink(filePath);
    }
  } catch (e) {
    // Si el archivo no existía (ya borrado), no es error fatal.
    console.warn("[admin] no se pudo borrar archivo:", e);
  }

  return NextResponse.json({ ok: true });
}
