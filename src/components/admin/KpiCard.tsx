import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

type Props = {
  label: string;
  value: string;
  icon: string;
  /** Tono de la tarjeta. Cada uno tiene su par bg-borde-fg. */
  tone: "primary" | "warning" | "tertiary" | "error";
  hint?: string;
  hintTone?: "positive" | "danger" | "neutral";
};

const TONES: Record<Props["tone"], { border: string; bg: string; fg: string }> = {
  primary: { border: "border-primary-container", bg: "bg-primary-fixed", fg: "text-primary" },
  warning: { border: "border-yellow-500", bg: "bg-yellow-100", fg: "text-yellow-700" },
  tertiary: { border: "border-tertiary", bg: "bg-tertiary-fixed", fg: "text-tertiary" },
  error: { border: "border-error", bg: "bg-error-container", fg: "text-error" },
};

const HINTS: Record<NonNullable<Props["hintTone"]>, string> = {
  positive: "text-tertiary",
  danger: "text-error",
  neutral: "text-on-surface-variant",
};

export function KpiCard({ label, value, icon, tone, hint, hintTone = "neutral" }: Props) {
  const t = TONES[tone];
  return (
    <div
      className={cn(
        "bg-surface-container-lowest p-6 rounded-xl shadow-sm border-l-4",
        t.border,
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-2 rounded-lg", t.bg, t.fg)}>
          <Icon name={icon} filled />
        </div>
        {hint && <span className={cn("text-xs font-bold", HINTS[hintTone])}>{hint}</span>}
      </div>
      <p className="text-sm font-medium text-secondary mb-1">{label}</p>
      <h3 className="text-2xl font-extrabold text-on-surface font-headline">{value}</h3>
    </div>
  );
}
