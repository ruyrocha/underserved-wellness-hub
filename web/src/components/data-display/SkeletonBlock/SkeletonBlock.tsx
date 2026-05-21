import { cn } from "@/lib/cn";

interface SkeletonBlockProps {
  rows?: number;
  className?: string;
  "data-testid"?: string;
}

export function SkeletonBlock({
  rows = 4,
  className,
  "data-testid": testId,
}: SkeletonBlockProps) {
  return (
    <div
      data-testid={testId}
      aria-busy
      aria-label="Loading"
      className={cn("w-full space-y-2 p-4", className)}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-9 rounded-md bg-neutral-200 animate-pulse",
            i % 3 === 1 && "w-3/4",
            i % 3 === 2 && "w-5/6",
          )}
        />
      ))}
    </div>
  );
}
