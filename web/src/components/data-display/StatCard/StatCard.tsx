import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────────────────────────────────
   StatCard
   Displays a single metric with optional trend indicator and icon.
   Used in the dashboard stats row and campaign detail pages.
───────────────────────────────────────────────────────────────────────────── */

export interface StatCardTrend {
  direction: "up" | "down" | "neutral";
  label: string;
}

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: StatCardTrend;
  icon?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

const TREND_STYLES = {
  up: { text: "text-green-600", arrow: "▲" },
  down: { text: "text-red-600", arrow: "▼" },
  neutral: { text: "text-neutral-500", arrow: "–" },
};

export function StatCard({
  label,
  value,
  trend,
  icon,
  className,
  "data-testid": testId,
}: StatCardProps) {
  const t = trend ? TREND_STYLES[trend.direction] : null;
  return (
    <div
      data-testid={testId}
      className={cn(
        "rounded-lg border border-neutral-200 bg-white px-5 py-4",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-500">{label}</span>
        {icon && <span className="text-neutral-400">{icon}</span>}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-neutral-900">{value}</span>
        {t && trend && (
          <span className={cn("text-xs font-medium", t.text)}>
            {t.arrow} {trend.label}
          </span>
        )}
      </div>
    </div>
  );
}
