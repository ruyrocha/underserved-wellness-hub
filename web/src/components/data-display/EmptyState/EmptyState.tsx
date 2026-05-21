import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
  message: string;
  /** Optional description below the message */
  description?: string;
  /** Optional CTA button */
  action?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function EmptyState({
  message,
  description,
  action,
  className,
  "data-testid": testId,
}: EmptyStateProps) {
  return (
    <div
      data-testid={testId}
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-12 text-center",
        className,
      )}
    >
      <div className="text-4xl text-neutral-300" aria-hidden>
        ○
      </div>
      <p className="text-sm font-medium text-neutral-500">{message}</p>
      {description && (
        <p className="text-xs text-neutral-400 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
