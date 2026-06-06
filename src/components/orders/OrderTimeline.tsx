import type { OrderStatus } from "@prisma/client";
import { Icon } from "@/components/ui/Icon";
import { ORDER_HAPPY_PATH, ORDER_STATUS_LABEL } from "@/lib/orders";
import { cn } from "@/lib/cn";

const STEP_ICONS: Record<OrderStatus, string> = {
  PENDING: "schedule",
  CONFIRMED: "verified",
  DISPATCHED: "local_shipping",
  DELIVERED: "task_alt",
  CANCELLED: "cancel",
};

/**
 * Timeline visual horizontal del estado actual del pedido. Si el estado es
 * CANCELLED, mostramos una franja única roja en lugar de los 4 pasos.
 */
export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-error-container text-on-error-container font-semibold">
        <Icon name="cancel" />
        Pedido cancelado
      </div>
    );
  }

  const currentIndex = ORDER_HAPPY_PATH.indexOf(status);

  return (
    <ol className="flex items-start justify-between gap-2 w-full" aria-label="Estado del pedido">
      {ORDER_HAPPY_PATH.map((step, i) => {
        const done = i <= currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <li key={step} className="flex-1 flex flex-col items-center text-center">
            <div className="flex items-center w-full">
              <span
                aria-hidden
                className={cn(
                  "h-1 flex-1",
                  i === 0 ? "invisible" : i <= currentIndex ? "bg-primary" : "bg-surface-container-high",
                )}
              />
              <span
                className={cn(
                  "shrink-0 w-10 h-10 rounded-circle flex items-center justify-center transition-colors",
                  done
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-high text-on-surface-variant",
                  isCurrent && "ring-4 ring-primary-container/30",
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                <Icon name={STEP_ICONS[step]} size={20} />
              </span>
              <span
                aria-hidden
                className={cn(
                  "h-1 flex-1",
                  i === ORDER_HAPPY_PATH.length - 1
                    ? "invisible"
                    : i < currentIndex
                      ? "bg-primary"
                      : "bg-surface-container-high",
                )}
              />
            </div>
            <span
              className={cn(
                "mt-2 text-xs font-semibold",
                done ? "text-on-surface" : "text-on-surface-variant/60",
              )}
            >
              {ORDER_STATUS_LABEL[step]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
