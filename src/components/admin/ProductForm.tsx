"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productFormSchema, type ProductFormInput } from "@/lib/validations/product";
import { createProduct, updateProduct } from "@/app/actions/admin-products";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

type SelectOption = { id: string; name: string };

type Props = {
  mode: "create" | "edit";
  productId?: string;
  categories: SelectOption[];
  brands: SelectOption[];
  initial?: Partial<ProductFormInput> & { images?: Array<{ id: string; url: string }> };
};

/**
 * Form único para crear y editar productos.
 *
 * - specs es un campo dinámico (array de pares) gestionado con useFieldArray.
 * - El upload de imágenes solo está disponible en modo "edit" (necesitamos
 *   el id del producto en disco para asociar). El admin crea, guarda, y
 *   luego sube imágenes en la pantalla de edición.
 */
export function ProductForm({ mode, productId, categories, brands, initial }: Props) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormInput>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      sku: initial?.sku ?? "",
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      price: initial?.price ?? 0,
      comparePrice: initial?.comparePrice ?? null,
      stock: initial?.stock ?? 0,
      minStock: initial?.minStock ?? 5,
      categoryId: initial?.categoryId ?? "",
      brandId: initial?.brandId ?? null,
      isActive: initial?.isActive ?? true,
      isFeatured: initial?.isFeatured ?? false,
      specs: initial?.specs?.length ? initial.specs : [{ key: "", value: "" }],
    },
    mode: "onTouched",
  });

  const specs = useFieldArray({ control, name: "specs" });

  async function onSubmit(values: ProductFormInput) {
    setFormError(null);
    const res =
      mode === "create"
        ? await createProduct(values)
        : await updateProduct(productId!, values);
    if (!res.ok) {
      if (res.fieldErrors) {
        for (const [k, msg] of Object.entries(res.fieldErrors)) {
          if (msg) setError(k as keyof ProductFormInput, { message: msg });
        }
      }
      setFormError(res.error);
      return;
    }
    startTransition(() => {
      if (mode === "create") {
        router.replace(`/admin/productos/${res.id}`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {formError && (
        <div
          role="alert"
          className="px-4 py-3 rounded-lg bg-error-container text-on-error-container text-sm font-semibold flex items-center gap-2"
        >
          <Icon name="error" size={18} />
          {formError}
        </div>
      )}

      {/* Datos básicos */}
      <section className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/20 space-y-4">
        <h2 className="font-bold font-headline text-lg">Datos básicos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="SKU"
            placeholder="HMA-001"
            error={errors.sku?.message}
            {...register("sku")}
          />
          <FormField
            label="Nombre"
            error={errors.name?.message}
            {...register("name")}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2 text-on-surface-variant">
            Descripción
          </label>
          <textarea
            rows={4}
            {...register("description")}
            className="w-full bg-surface-container-low border-none rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.description && (
            <p role="alert" className="mt-1 text-xs text-error font-semibold">
              {errors.description.message}
            </p>
          )}
        </div>
      </section>

      {/* Categoría + marca + flags */}
      <section className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/20 space-y-4">
        <h2 className="font-bold font-headline text-lg">Clasificación</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-on-surface-variant">
              Categoría
            </label>
            <select
              {...register("categoryId")}
              className="w-full bg-surface-container-low border-none rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">— Selecciona —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p role="alert" className="mt-1 text-xs text-error font-semibold">
                {errors.categoryId.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-on-surface-variant">
              Marca (opcional)
            </label>
            <select
              {...register("brandId")}
              className="w-full bg-surface-container-low border-none rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">— Sin marca —</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register("isActive")} className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Activo (visible en tienda)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register("isFeatured")} className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Destacado (aparece en home)</span>
          </label>
        </div>
      </section>

      {/* Precio + stock */}
      <section className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/20 space-y-4">
        <h2 className="font-bold font-headline text-lg">Precio e inventario</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FormField
            label="Precio (COP)"
            type="number"
            step={100}
            min={0}
            error={errors.price?.message}
            {...register("price", { valueAsNumber: true })}
          />
          <FormField
            label="Precio antes (opcional)"
            type="number"
            step={100}
            min={0}
            error={errors.comparePrice?.message}
            {...register("comparePrice", {
              setValueAs: (v) => {
                if (v === "" || v === null || v === undefined) return null;
                const n = Number(v);
                return Number.isFinite(n) && n > 0 ? n : null;
              },
            })}
          />
          <FormField
            label="Stock"
            type="number"
            min={0}
            error={errors.stock?.message}
            {...register("stock", { valueAsNumber: true })}
          />
          <FormField
            label="Stock mínimo"
            type="number"
            min={0}
            error={errors.minStock?.message}
            {...register("minStock", { valueAsNumber: true })}
          />
        </div>
      </section>

      {/* Specs dinámicas */}
      <section className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/20 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-bold font-headline text-lg">Especificaciones técnicas</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => specs.append({ key: "", value: "" })}
          >
            <Icon name="add" size={16} /> Agregar
          </Button>
        </div>
        <div className="space-y-3">
          {specs.fields.map((field, idx) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-2 items-start">
              <FormField
                label={idx === 0 ? "Atributo" : ""}
                placeholder="Potencia"
                error={errors.specs?.[idx]?.key?.message}
                {...register(`specs.${idx}.key`)}
              />
              <FormField
                label={idx === 0 ? "Valor" : ""}
                placeholder="750 W"
                error={errors.specs?.[idx]?.value?.message}
                {...register(`specs.${idx}.value`)}
              />
              <button
                type="button"
                onClick={() => specs.remove(idx)}
                aria-label={`Eliminar especificación ${idx + 1}`}
                className="text-error hover:bg-error-container/20 p-2 rounded-full transition-colors mt-7"
              >
                <Icon name="close" />
              </button>
            </div>
          ))}
          {specs.fields.length === 0 && (
            <p className="text-sm text-on-surface-variant">
              Sin especificaciones. Click en &ldquo;Agregar&rdquo; para añadir un par clave/valor.
            </p>
          )}
        </div>
      </section>

      <div className="flex flex-wrap gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting || isPending}>
          <Icon name="save" />
          {mode === "create" ? "Crear producto" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}

/** Manager de imágenes — separado del form principal porque opera vía API. */
export function ProductImagesManager({
  productId,
  images,
}: {
  productId: string;
  images: Array<{ id: string; url: string; alt: string | null }>;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setBusy(true);
    const fd = new FormData();
    for (const f of Array.from(files)) fd.append("files", f);
    try {
      const res = await fetch(`/api/admin/products/${productId}/images`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? `Error ${res.status}`);
        return;
      }
      router.refresh();
    } catch (e) {
      console.error(e);
      setError("Error de red al subir imágenes.");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function handleDelete(imageId: string) {
    if (!confirm("¿Eliminar esta imagen?")) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}/images?imageId=${imageId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setError(`Error ${res.status}`);
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/20 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-bold font-headline text-lg">
          Imágenes ({images.length})
        </h2>
        <label className="inline-flex items-center gap-2 bg-primary-container text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary cursor-pointer transition-colors">
          <Icon name="upload" size={18} />
          {busy ? "Subiendo…" : "Subir imágenes"}
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleUpload}
            disabled={busy}
          />
        </label>
      </div>
      {error && (
        <p role="alert" className="text-sm text-error font-semibold flex items-center gap-2">
          <Icon name="error" size={16} />
          {error}
        </p>
      )}
      {images.length === 0 ? (
        <p className="text-sm text-on-surface-variant text-center py-6">
          Sin imágenes. Sube hasta 8 archivos JPG, PNG o WebP de máx 5 MB cada uno.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative aspect-square rounded-lg overflow-hidden bg-surface-container-low border border-outline-variant/20 group"
            >
              <Image
                src={img.url}
                alt={img.alt ?? ""}
                fill
                sizes="200px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => handleDelete(img.id)}
                disabled={busy}
                aria-label="Eliminar imagen"
                className="absolute top-2 right-2 bg-error text-white rounded-circle w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
              >
                <Icon name="close" size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
