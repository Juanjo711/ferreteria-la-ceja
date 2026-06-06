"use client";

import { passwordStrength } from "@/lib/password-strength";
import { cn } from "@/lib/cn";

/**
 * 4 barras + texto, derivado del valor actual del campo password.
 * Se calcula cliente-side en cada render — es O(longitud) y la longitud
 * es trivial.
 */
export function PasswordStrengthMeter({ password }: { password: string }) {
  const { level, label } = passwordStrength(password);

  return (
    <div className="mt-3" aria-live="polite">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className={cn(
              "h-1.5 w-1/4 rounded-full transition-colors",
              bar <= level
                ? level <= 1
                  ? "bg-error"
                  : level === 2
                    ? "bg-primary-container"
                    : level === 3
                      ? "bg-primary"
                      : "bg-tertiary"
                : "bg-surface-container-highest",
            )}
          />
        ))}
      </div>
      <p className="text-[10px] mt-1 text-secondary uppercase tracking-wider font-bold">
        Fortaleza: {label}
      </p>
    </div>
  );
}
