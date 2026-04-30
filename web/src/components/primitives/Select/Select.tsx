import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ hasError, className, children, 'data-testid': testId, ...props }, ref) => (
    <div className="relative w-full">
      <select
        ref={ref}
        data-testid={testId}
        className={cn(
          'flex h-9 w-full appearance-none rounded-md border bg-white pl-3 pr-8 py-2',
          'text-sm text-neutral-900',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:border-brand-500',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-50',
          hasError
            ? 'border-red-400 focus-visible:ring-red-400'
            : 'border-neutral-300',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {/* chevron */}
      <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-neutral-400">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  ),
)
Select.displayName = 'Select'
