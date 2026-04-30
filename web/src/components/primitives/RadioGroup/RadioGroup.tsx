import { type ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface RadioOption {
  value:    string
  label:    ReactNode
  disabled?: boolean
}

interface RadioGroupProps {
  name:        string
  value:       string
  options:     RadioOption[]
  onChange:    (value: string) => void
  orientation?: 'horizontal' | 'vertical'
  className?:  string
  'data-testid'?: string
}

export function RadioGroup({
  name,
  value,
  options,
  onChange,
  orientation = 'horizontal',
  className,
  'data-testid': testId,
}: RadioGroupProps) {
  return (
    <div
      role="radiogroup"
      data-testid={testId}
      className={cn(
        'flex gap-4',
        orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
        className,
      )}
    >
      {options.map((opt) => (
        <label
          key={opt.value}
          className={cn(
            'inline-flex items-center gap-2 cursor-pointer select-none text-sm text-neutral-700',
            opt.disabled && 'opacity-50 cursor-not-allowed',
          )}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            disabled={opt.disabled}
            onChange={() => onChange(opt.value)}
            className={cn(
              'h-4 w-4 border-neutral-300 text-brand-600',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
            )}
          />
          {opt.label}
        </label>
      ))}
    </div>
  )
}
