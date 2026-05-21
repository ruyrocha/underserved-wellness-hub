import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────────────────────────────────
   DeliveryBarChart
   Horizontal bar chart for delivery-rate-by-program.
   Each row shows: label | track | fill bar | percentage.
   Purely presentational — no business logic.
───────────────────────────────────────────────────────────────────────────── */

export interface BarChartDataItem {
  /** Row label (e.g. program name) */
  label: string;
  /** Value between 0–100 rendered as fill width */
  value: number;
}

interface DeliveryBarChartProps {
  data: BarChartDataItem[];
  /** Fill color class — defaults to brand green */
  fillColor?: string;
  /** Track background class */
  trackColor?: string;
  /** Width of the label column in px */
  labelWidth?: number;
  /** Width of the percentage column in px */
  pctWidth?: number;
  className?: string;
  "data-testid"?: string;
}

export function DeliveryBarChart({
  data,
  fillColor = "bg-brand-600",
  trackColor = "bg-neutral-100",
  labelWidth = 80,
  pctWidth = 34,
  className,
  "data-testid": testId,
}: DeliveryBarChartProps) {
  return (
    <div data-testid={testId} className={cn("flex flex-col gap-1", className)}>
      {data.map((item) => (
        <div key={item.label} className="flex items-center gap-2 py-0.5">
          {/* Label */}
          <span
            className="text-xs text-neutral-600 shrink-0 truncate"
            style={{ width: labelWidth }}
          >
            {item.label}
          </span>

          {/* Track */}
          <div
            className={cn(
              "flex-1 h-1.5 rounded-full overflow-hidden",
              trackColor,
            )}
          >
            <div
              className={cn("h-full rounded-full", fillColor)}
              style={{ width: `${item.value}%` }}
            />
          </div>

          {/* Percentage */}
          <span
            className="text-xs text-neutral-600 text-right shrink-0 tabular-nums"
            style={{ width: pctWidth }}
          >
            {item.value}%
          </span>
        </div>
      ))}
    </div>
  );
}
