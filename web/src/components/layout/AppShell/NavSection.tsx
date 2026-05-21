import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────────────────────────────────
   NavSection
   A small uppercase label that groups NavItems inside the Sidebar.
   Example: "Main", "Insights"
───────────────────────────────────────────────────────────────────────────── */

interface NavSectionProps {
  children: string;
  className?: string;
}

export function NavSection({ children, className }: NavSectionProps) {
  return (
    <div
      className={cn(
        "px-2.5 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   NavDivider
   A thin horizontal separator between nav groups.
───────────────────────────────────────────────────────────────────────────── */

interface NavDividerProps {
  className?: string;
}

export function NavDivider({ className }: NavDividerProps) {
  return (
    <div
      role="separator"
      className={cn("mx-2 my-2 h-px bg-neutral-100", className)}
    />
  );
}
