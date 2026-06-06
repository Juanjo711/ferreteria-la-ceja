"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import {
  adjustStock,
  REASON_LABEL,
  type StockAdjustReason,
} from "@/app/actions/admin-inventory";

type Props = {
  productId: string;
  productName: string;
  currentStock: number;
  /** Render-prop opcional para personalizar el trigger. Si se omite usamos un botón estándar. */
  triggerLabel?: string;
};

const REASONS: StockAdjustReason[] = ["entrada", "correccion", "merma"];

export function StockAdjustModal({ productId, productName, currentStock, triggerLabel = "Ajustar" }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [delta, setDelta] = useState(0);
  const [reason, setReason] = useState<StockAdjustReason>("entrada");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function close() {
    setOpen(false);
    setDelta(0);
    setReason("entrada");
    setNote("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await adjustStock({ productId, delta, reason, note: note || undefined });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      close();
      router.refresh();
    });
  }

  const nextStock = currentStock + delta;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-primary font-semibold hover:underline text-sm"
      >
        <Icon name="tune" size={16} />
        {triggerLabel}
      </button>
      {open && (
        <div
          role="dialog"
          aria-labelledby="adjust-stock-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={close}
        >
          <div
            className="bg-surface-container-lowest rounded-2xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 id="adjust-stock-title" className="text-xl font-bold font-headline">
                  Ajustar stock
                </h2>
                <p className="text-sm text-on-surface-variant mt-1">{productName}</p>
              </div>
              <button
                type="button"
                onClick={close}
                className="text-on-surface-variant hover:text-on-surface"
                aria-label="Cerrar"
              >
                <Icon name="close" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between text-sm bg-surface-container-low rounded-lg p-3">
                <span className="text-on-surface-variant">Stock actual</span>
                <span className="font-bold text-on-surface">{currentStock}</span>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-on-surface-variant">
                  Ajuste (use +/- para entrada/salida)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDelta((d) => d - 1)}
                    className="w-10 h-10 rounded-lg bg-surface-container-low hover:bg-surface-container flex items-center justify-center"
                  >
                    <Icon name="remove" />
                  </button>
                  <input
                    type="number"
                    value={delta}
                    onChange={(e) => setDelta(Number(e.target.value) || 0)}
                    className="flex-1 text-center bg-surface-container-low border-none rounded-lg px-3 py-2 font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setDelta((d) => d + 1)}
                    className="w-10 h-10 rounded-lg bg-surface-container-low hover:bg-surface-container flex items-center justify-center"
                  >
                    <Icon name="add" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm bg-tertiary-fixed rounded-lg p-3 text-on-tertiary-fixed-variant">
                <span className="font-semibold">Stock resultante</span>
                <span className={nextStock < 0 ? "text-error font-bold" : "font-bold"}>
                  {nextStock}
                </span>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-on-surface-variant">
                  Motivo
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as StockAdjustReason)}
                  className="w-full bg-surface-container-low border-none rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {REASONS.map((r) => (
                    <option key={r} value={r}>
                      {REASON_LABEL[r]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-on-surface-variant">
                  Nota (opcional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  maxLength={200}
                  className="w-full bg-surface-container-low border-none rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {error && (
                <p role="alert" className="text-sm text-error font-semibold flex items-center gap-1">
                  <Icon name="error" size={14} /> {error}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={close} fullWidth>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isPending || delta === 0 || nextStock < 0}
                  fullWidth
                >
                  {isPending ? "Aplicando…" : "Aplicar ajuste"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
