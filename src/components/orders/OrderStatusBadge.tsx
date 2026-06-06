import type { OrderStatus } from "@prisma/client";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { ORDER_STATUS_LABEL } from "@/lib/orders";

/**
 * Badge de color para un estado de pedido. Reutilizado en lista y detalle.
 */
export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  const STYLE: Record<OrderStatus, { bg: string; fg: string; icon: string }> = {
    PENDING: { bg: "bg-primary-container/20", fg: "text-primary", icon: "schedule" },
    CONFIRMED: { bg: "bg-tertiary-fixed", fg: "text-on-tertiary-fixed-variant", icon: "check_circle" },
    DISPATCHED: { bg: "bg-secondary-fixed", fg: "text-on-secondary-fixed-variant", icon: "local_shipping" },
    DELIVERED: { bg: "bg-tertiary-container/30", fg: "text-on-tertiary-container", icon: "task_alt" },
    CANCELLED: { bg: "bg-error-container", fg: "text-on-error-container", icon: "cancel" },
  };
  const s = STYLE[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
        s.bg,
        s.fg,
        className,
      )}
    >
      <Icon name={s.icon} size={14} />
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}
