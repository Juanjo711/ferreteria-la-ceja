"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { upsertBrand, deleteBrand } from "@/app/actions/admin-taxonomy";

type Row = { id: string; slug: string; name: string; productCount: number };

export function BrandManager({ initial }: { initial: Row[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Row | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function startCreate() {
    setEditing(null);
    setName("");
    setError(null);
  }
  function startEdit(row: Row) {
    setEditing(row);
    setName(row.name);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await upsertBrand({ id: editing?.id, name });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      startCreate();
      router.refresh();
    });
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar la marca "${name}"?`)) return;
    startTransition(async () => {
      const res = await deleteBrand(id);
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
          {editing ? `Editar: ${editing.name}` : "Nueva marca"}
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
              <th className="px-6 py-4">Marca</th>
              <th className="px-6 py-4">Slug</th>
              <th className="px-6 py-4">Productos</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {initial.map((b) => (
              <tr key={b.id} className="hover:bg-surface-container-low transition-colors">
                <td className="px-6 py-4 font-bold">{b.name}</td>
                <td className="px-6 py-4 text-sm font-mono text-on-surface-variant">{b.slug}</td>
                <td className="px-6 py-4 text-sm">{b.productCount}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    type="button"
                    onClick={() => startEdit(b)}
                    className="text-primary hover:underline text-sm font-semibold inline-flex items-center gap-1"
                  >
                    <Icon name="edit" size={16} />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(b.id, b.name)}
                    disabled={b.productCount > 0 || isPending}
                    className="text-error hover:underline text-sm font-semibold inline-flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline"
                    title={b.productCount > 0 ? "Tiene productos asociados" : "Eliminar"}
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
