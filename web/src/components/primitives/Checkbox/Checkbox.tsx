import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, id, 'data-testid': testId, ...props }, ref) => (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <input
        ref={ref}
        id={id}
        type="checkbox"
        data-testid={testId}
        className={cn(
          'h-4 w-4 rounded border-neutral-300 text-brand-600',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
      {label && <span className="text-sm text-neutral-700">{label}</span>}
    </label>
  ),
)
Checkbox.displayName = 'Checkbox'
