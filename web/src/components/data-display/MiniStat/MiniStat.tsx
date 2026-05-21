import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────────────────────────────────
   MiniStat
   Compact stat tile used in detail panels (campaign detail, patient detail).
   Shows a large numeric value and a small label below it, inside a rounded
   background tile. Lighter-weight than StatCard — no border, no icon, no trend.
───────────────────────────────────────────────────────────────────────────── */

interface MiniStatProps {
  /** The primary value — large, bold */
  value: string | number;
  /** Short label beneath the value */
  label: string;
  /** Optional color override for the value text */
  valueColor?: string;
  className?: string;
  "data-testid"?: string;
}

export function MiniStat({
  value,
  label,
  valueColor,
  className,
  "data-testid": testId,
}: MiniStatProps) {
  return (
    <div
      data-testid={testId}
      className={cn("rounded-lg bg-neutral-50 px-3 py-2.5", className)}
    >
      <div
        className={cn(
          "text-xl font-semibold tracking-tight leading-none",
          valueColor ?? "text-neutral-900",
        )}
      >
        {value}
      </div>
      <div className="mt-0.5 text-[11px] text-neutral-500">{label}</div>
    </div>
  );
}
