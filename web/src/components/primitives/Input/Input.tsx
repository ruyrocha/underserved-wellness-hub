import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ hasError, className, 'data-testid': testId, ...props }, ref) => (
    <input
      ref={ref}
      data-testid={testId}
      className={cn(
        'flex h-9 w-full rounded-md border bg-white px-3 py-2 text-sm text-neutral-900',
        'placeholder:text-neutral-400',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:border-brand-500',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-50',
        hasError
          ? 'border-red-400 focus-visible:ring-red-400'
          : 'border-neutral-300',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'
