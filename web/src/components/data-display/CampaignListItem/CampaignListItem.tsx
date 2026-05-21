import { type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { StatusBadge, type AnyStatus } from "../StatusBadge/StatusBadge";

/* ─────────────────────────────────────────────────────────────────────────────
   CampaignListItem
   A single row in the "Upcoming campaigns" card on the dashboard.
   Shows status dot, campaign name, schedule detail, status pill, and count.
───────────────────────────────────────────────────────────────────────────── */

export interface CampaignListItemProps {
  /** Campaign display name */
  name: string;
  /** Subtitle — schedule or description */
  detail: string;
  /** Campaign status — maps to StatusBadge */
  status: AnyStatus;
  /** Patient / recipient count string */
  count: string;
  /** Click handler */
  onClick?: () => void;
  className?: string;
  "data-testid"?: string;
}

export function CampaignListItem({
  name,
  detail,
  status,
  count,
  onClick,
  className,
  "data-testid": testId,
}: CampaignListItemProps) {
  return (
    <div
      data-testid={testId}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 py-2.5 border-b border-neutral-100 last:border-b-0",
        onClick &&
          "cursor-pointer hover:bg-neutral-50 transition-colors -mx-1 px-1 rounded",
        className,
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-900 truncate">{name}</p>
        <p className="text-xs text-neutral-500 mt-0.5">{detail}</p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <StatusBadge status={status} />
        <span className="text-xs font-semibold text-neutral-500 tabular-nums">
          {count}
        </span>
      </div>
    </div>
  );
}
