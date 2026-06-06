import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full bg-surface-container-low border border-transparent rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/60",
        "focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container/40",
        "transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
      {...rest}
    />
  );
});
