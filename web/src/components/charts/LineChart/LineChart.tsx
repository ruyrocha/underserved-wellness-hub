"use client";

import { useCallback, useRef, useState, type SVGProps } from "react";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────────────────────────────────
   LineChart
   SVG area-line chart with interactive hover tooltips.
   Accepts numeric data points and renders a smooth bezier curve
   with a translucent fill area beneath the line.
───────────────────────────────────────────────────────────────────────────── */

export interface LineChartDataPoint {
  /** Numeric value plotted on the Y axis */
  value: number;
  /** Label shown in the tooltip on hover */
  label: string;
}

interface LineChartProps {
  /** Data points to plot */
  data: LineChartDataPoint[];
  /** SVG viewBox width */
  width?: number;
  /** SVG viewBox height */
  height?: number;
  /** Padding inside the SVG (top right bottom left) */
  padding?: { t: number; r: number; b: number; l: number };
  /** Line stroke color (Tailwind class-friendly hex) */
  strokeColor?: string;
  /** Area fill color */
  fillColor?: string;
  /** Number of horizontal grid lines */
  gridLines?: number;
  /** Show the X-axis date labels at start and end */
  showAxisLabels?: boolean;
  /** Label for the first data point */
  startLabel?: string;
  /** Label for the last data point */
  endLabel?: string;
  className?: string;
  "data-testid"?: string;
}

export function LineChart({
  data,
  width = 420,
  height = 140,
  padding = { t: 12, r: 4, b: 8, l: 4 },
  strokeColor = "#1a7a4a",
  fillColor = "#d9f2e4",
  gridLines = 4,
  showAxisLabels = true,
  startLabel,
  endLabel,
  className,
  "data-testid": testId,
}: LineChartProps) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const iW = width - padding.l - padding.r;
  const iH = height - padding.t - padding.b;

  const values = data.map((d) => d.value);
  const min = Math.min(...values) - 4;
  const max = Math.max(...values) + 2;

  const x = useCallback(
    (i: number) => padding.l + i * (iW / (data.length - 1)),
    [padding.l, iW, data.length],
  );
  const y = useCallback(
    (v: number) => padding.t + iH - ((v - min) / (max - min)) * iH,
    [padding.t, iH, min, max],
  );

  // Build smooth bezier path
  const buildPath = (closed: boolean) => {
    let d = `M${x(0)},${y(data[0].value)}`;
    for (let i = 1; i < data.length; i++) {
      const cx = (x(i - 1) + x(i)) / 2;
      d += ` C${cx},${y(data[i - 1].value)} ${cx},${y(data[i].value)} ${x(i)},${y(data[i].value)}`;
    }
    if (closed) {
      d += ` L${x(data.length - 1)},${height} L${x(0)},${height} Z`;
    }
    return d;
  };

  const handleMouseEnter = (index: number) => {
    const pt = data[index];
    const svgEl = svgRef.current;
    if (!svgEl) return;

    // Calculate pixel position relative to the container
    const rect = svgEl.getBoundingClientRect();
    const scaleX = rect.width / width;

    setTooltip({
      x: x(index) * scaleX + 8,
      y: 10,
      text: `${pt.label} · ${pt.value}%`,
    });
  };

  const handleMouseLeave = () => setTooltip(null);

  return (
    <div className={cn("relative", className)} data-testid={testId}>
      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute z-10 rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-xs whitespace-nowrap pointer-events-none shadow-sm"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>
      )}

      <svg
        ref={svgRef}
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ display: "block" }}
      >
        {/* Grid lines */}
        {Array.from({ length: gridLines + 1 }).map((_, i) => (
          <line
            key={i}
            x1={padding.l}
            x2={width - padding.r}
            y1={padding.t + (iH * i) / gridLines}
            y2={padding.t + (iH * i) / gridLines}
            stroke="#e5e7eb"
            strokeWidth={0.5}
          />
        ))}

        {/* Area fill */}
        <path d={buildPath(true)} fill={fillColor} opacity={0.6} />

        {/* Line */}
        <path
          d={buildPath(false)}
          fill="none"
          stroke={strokeColor}
          strokeWidth={1.5}
        />

        {/* Interactive hover dots */}
        {data.map((pt, i) => (
          <circle
            key={i}
            cx={x(i)}
            cy={y(pt.value)}
            r={3.5}
            fill={strokeColor}
            opacity={tooltip && tooltip.text.includes(pt.label) ? 1 : 0}
            style={{ cursor: "pointer", transition: "opacity 0.1s" }}
            onMouseEnter={() => handleMouseEnter(i)}
            onMouseLeave={handleMouseLeave}
          />
        ))}
      </svg>

      {/* Axis labels */}
      {showAxisLabels && (
        <div className="flex justify-between mt-1">
          <span className="text-[10.5px] text-neutral-400">
            {startLabel ?? data[0]?.label}
          </span>
          <span className="text-[10.5px] text-neutral-400">
            {endLabel ?? data[data.length - 1]?.label}
          </span>
        </div>
      )}
    </div>
  );
}
