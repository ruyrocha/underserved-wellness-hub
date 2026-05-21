import { cn } from "@/lib/cn";
import { StatusBadge, type AnyStatus } from "../StatusBadge/StatusBadge";

/* ─────────────────────────────────────────────────────────────────────────────
   DeliveryLog
   A list of delivery-status rows showing recipient name, masked phone,
   delivery status badge, and timestamp. Used in campaign detail panels.
───────────────────────────────────────────────────────────────────────────── */

export interface DeliveryLogItem {
  /** Recipient identifier — e.g. "Jane D. (#4421)" */
  name: string;
  /** Masked phone — e.g. "•••-•••-1234" */
  phone: string;
  /** Message delivery status */
  status: "delivered" | "failed" | "opted_out" | "pending" | "queued" | "sent";
  /** Timestamp string — e.g. "09:02 AM" */
  time: string;
}

interface DeliveryLogProps {
  items: DeliveryLogItem[];
  className?: string;
  "data-testid"?: string;
}

export function DeliveryLog({
  items,
  className,
  "data-testid": testId,
}: DeliveryLogProps) {
  if (items.length === 0) return null;

  return (
    <div data-testid={testId} className={cn("flex flex-col", className)}>
      {items.map((item, i) => (
        <div
          key={`${item.name}-${i}`}
          className="flex items-center gap-2 border-b border-neutral-100 py-2 last:border-b-0 text-sm"
        >
          <span className="flex-1 min-w-0 truncate font-medium text-neutral-900">
            {item.name}
          </span>
          <span className="shrink-0 w-[90px] text-[11.5px] text-neutral-400">
            {item.phone}
          </span>
          <StatusBadge status={item.status as AnyStatus} />
          <span className="shrink-0 w-[52px] text-right text-[11.5px] text-neutral-400">
            {item.time}
          </span>
        </div>
      ))}
    </div>
  );
}
