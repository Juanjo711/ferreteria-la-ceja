import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

type BadgeProps = {
  variant?: "discount" | "new" | "neutral" | "warning" | "info";
  className?: string;
  children: ReactNode;
};

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  discount: "bg-error text-white",
  new: "bg-tertiary-container text-white",
  neutral: "bg-surface-container-high text-on-surface-variant",
  warning: "bg-primary-container text-white",
  info: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
};

export function Badge({ variant = "neutral", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
