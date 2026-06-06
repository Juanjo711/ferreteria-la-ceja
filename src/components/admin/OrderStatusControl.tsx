"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@prisma/client";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { updateOrderStatus } from "@/app/actions/admin-orders";
import { ORDER_STATUS_LABEL, canTransition } from "@/lib/orders";

const ALL_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "DISPATCHED",
  "DELIVERED",
  "CANCELLED",
];

type Props = {
  orderNumber: string;
  currentStatus: OrderStatus;
};

/**
 * Selector de cambio de estado para el admin. Confirma antes de aplicar.
 * Solo muestra estados a los que se puede transitar desde el actual.
 */
export function OrderStatusControl({ orderNumber, currentStatus }: Props) {
  const router = useRouter();
  const [nextStatus, setNextStatus] = useState<OrderStatus | "">("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const allowed = ALL_STATUSES.filter(
    (s) => s !== currentStatus && canTransition(currentStatus, s),
  );

  if (allowed.length === 0) {
    return (
      <div className="bg-surface-container-low rounded-xl p-6 text-center text-on-surface-variant">
        <Icon name="lock" className="text-on-surface-variant/50 mb-2 inline-block" />
        <p>
          Este pedido está en estado <strong>{ORDER_STATUS_LABEL[currentStatus]}</strong> — es
          un estado terminal y ya no se puede cambiar.
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nextStatus) return;
    setError(null);
    setSuccess(null);

    if (
      nextStatus === "CANCELLED" &&
      !confirm("¿Estás seguro de cancelar este pedido? Se restaurará el stock.")
    ) {
      return;
    }

    startTransition(async () => {
      const res = await updateOrderStatus({
        orderNumber,
        nextStatus,
        note: note.trim() || undefined,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSuccess(`Pedido actualizado a ${ORDER_STATUS_LABEL[nextStatus]}.`);
      setNote("");
      setNextStatus("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-on-surface-variant mb-2">
          Cambiar estado a:
        </label>
        <select
          value={nextStatus}
          onChange={(e) => setNextStatus(e.target.value as OrderStatus | "")}
          className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          required
        >
          <option value="">— Selecciona —</option>
          {allowed.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-on-surface-variant mb-2">
          Comentario (opcional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="Motivo, notas internas, número de guía…"
          className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-error font-semibold flex items-center gap-2">
          <Icon name="error" size={16} />
          {error}
        </p>
      )}
      {success && (
        <p
          role="status"
          className="text-sm text-tertiary font-semibold flex items-center gap-2"
        >
          <Icon name="check_circle" size={16} filled />
          {success}
        </p>
      )}

      <Button type="submit" variant="primary" size="md" fullWidth disabled={!nextStatus || isPending}>
        {isPending ? "Aplicando…" : "Aplicar cambio"}
      </Button>
    </form>
  );
}
