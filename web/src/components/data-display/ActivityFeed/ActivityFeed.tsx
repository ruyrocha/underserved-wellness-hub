import { type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { EmptyState } from "../EmptyState/EmptyState";

/* ─────────────────────────────────────────────────────────────────────────────
   ActivityFeed
   Renders a chronological list of activity items with icon, message, and time.
   Falls back to EmptyState when there are no items.
───────────────────────────────────────────────────────────────────────────── */

export interface FeedItem {
  id: string;
  time: string;
  message: ReactNode;
  icon?: ReactNode;
  variant?: "default" | "success" | "warning" | "error";
}

interface ActivityFeedProps {
  items: FeedItem[];
  className?: string;
  "data-testid"?: string;
}

const FEED_VARIANT_STYLES = {
  default: "bg-neutral-100 text-neutral-500",
  success: "bg-green-100 text-green-600",
  warning: "bg-yellow-100 text-yellow-600",
  error: "bg-red-100 text-red-600",
};

export function ActivityFeed({
  items,
  className,
  "data-testid": testId,
}: ActivityFeedProps) {
  if (items.length === 0) return <EmptyState message="No recent activity." />;

  return (
    <ol data-testid={testId} className={cn("space-y-3", className)}>
      {items.map((item) => (
        <li key={item.id} className="flex items-start gap-3">
          <div
            className={cn(
              "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sm",
              FEED_VARIANT_STYLES[item.variant ?? "default"],
            )}
          >
            {item.icon ?? "•"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] text-neutral-700 leading-snug">
              {item.message}
            </p>
            <time className="text-xs text-neutral-400 mt-0.5 block">
              {item.time}
            </time>
          </div>
        </li>
      ))}
    </ol>
  );
}
