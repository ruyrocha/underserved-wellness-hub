import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────────────────────────────────
   MessagePreview
   Read-only display of an SMS / message body with a left-brand-border accent.
   Used in campaign detail panels to show the message that was (or will be) sent.
   Does NOT contain editing capabilities — for that, use MessageBodyEditor.
───────────────────────────────────────────────────────────────────────────── */

interface MessagePreviewProps {
  /** The message body text */
  children: string;
  /** Override the left-border accent color class */
  accentClass?: string;
  className?: string;
  "data-testid"?: string;
}

export function MessagePreview({
  children,
  accentClass = "border-l-brand-600",
  className,
  "data-testid": testId,
}: MessagePreviewProps) {
  return (
    <div
      data-testid={testId}
      className={cn(
        "rounded-r-md bg-neutral-50 px-3 py-2.5 text-sm text-neutral-600 leading-relaxed",
        "border-l-[2.5px]",
        accentClass,
        className,
      )}
    >
      {children}
    </div>
  );
}
