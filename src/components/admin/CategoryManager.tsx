"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { upsertCategory, deleteCategory } from "@/app/actions/admin-taxonomy";

type Row = {
  id: string;
  slug: string;
  name: string;
  icon: string;
  description: string | null;
  productCount: number;
};

/**
 * Tabla + form inline para gestionar categorías. El form es para crear o
 * editar (se rellena al click en "editar"). Las acciones llaman a server
 * actions y refrescan la ruta.
 */
export function CategoryManager({ initial }: { initial: Row[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Row | null>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("category");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function startCreate() {
    setEditing(null);
    setName("");
    setIcon("category");
    setDescription("");
    setError(null);
  }
  function startEdit(row: Row) {
    setEditing(row);
    setName(row.name);
    setIcon(row.icon);
    setDescription(row.description ?? "");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await upsertCategory({
        id: editing?.id,
        name,
        icon,
        description: description || undefined,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      startCreate();
      router.refresh();
    });
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar la categoría "${name}"?`)) return;
    startTransition(async () => {
      const res = await deleteCategory(id);
      if (!res.ok) {
        alert(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-1 bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/20 space-y-4 h-fit sticky top-24"
      >
        <h2 className="font-bold font-headline text-lg">
          {editing ? `Editar: ${editing.name}` : "Nueva categoría"}
        </h2>
        <div>
          <label className="block text-sm font-semibold mb-1 text-on-surface-variant">Nombre</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-surface-container-low border-none rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-on-surface-variant">
            Icono (Material Symbol)
          </label>
          <input
            value={icon}
            onChange={(e) => setIcon(e.target.value.toLowerCase())}
            placeholder="handyman"
            pattern="[a-z0-9_]+"
            required
            className="w-full bg-surface-container-low border-none rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
            Preview: <Icon name={icon || "category"} className="text-primary-container" />
          </p>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-on-surface-variant">
            Descripción (opcional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full bg-surface-container-low border-none rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        {error && (
          <p role="alert" className="text-xs text-error font-semibold flex items-center gap-1">
            <Icon name="error" size={14} /> {error}
          </p>
        )}
        <div className="flex gap-2">
          <Button type="submit" variant="primary" size="sm" disabled={isPending} fullWidth>
            {editing ? "Guardar" : "Crear"}
          </Button>
          {editing && (
            <Button type="button" variant="outline" size="sm" onClick={startCreate}>
              Nueva
            </Button>
          )}
        </div>
      </form>

      <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low text-secondary text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Categoría</th>
              <th className="px-6 py-4">Slug</th>
              <th className="px-6 py-4">Productos</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {initial.map((c) => (
              <tr key={c.id} className="hover:bg-surface-container-low transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Icon name={c.icon} className="text-primary-container" />
                    <div>
                      <p className="font-bold">{c.name}</p>
                      {c.description && (
                        <p className="text-xs text-on-surface-variant max-w-xs truncate">
                          {c.description}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-mono text-on-surface-variant">{c.slug}</td>
                <td className="px-6 py-4 text-sm">{c.productCount}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    type="button"
                    onClick={() => startEdit(c)}
                    className="text-primary hover:underline text-sm font-semibold inline-flex items-center gap-1"
                  >
                    <Icon name="edit" size={16} />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id, c.name)}
                    disabled={c.productCount > 0 || isPending}
                    className="text-error hover:underline text-sm font-semibold inline-flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline"
                    title={c.productCount > 0 ? "Tiene productos asociados" : "Eliminar"}
                  >
                    <Icon name="delete" size={16} />
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
