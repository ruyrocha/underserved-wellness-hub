import { type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  /** Text shown in the <label> */
  label:      string
  /** Must match the id of the child input */
  htmlFor:    string
  /** Inline error message — shown instead of hint when present */
  error?:     string
  /** Subtle helper text shown below the input when there's no error */
  hint?:      string
  required?:  boolean
  children:   ReactNode
  'data-testid'?: string
}

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
  'data-testid': testId,
  ...props
}: FormFieldProps) {
  return (
    <div
      data-testid={testId}
      className={cn('flex flex-col gap-1.5', className)}
      {...props}
    >
      <label htmlFor={htmlFor} className="text-sm font-medium text-neutral-700">
        {label}
        {required && (
          <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>
        )}
      </label>

      {children}

      {!error && hint && (
        <p className="text-xs text-neutral-400">{hint}</p>
      )}

      {error && (
        <p role="alert" id={`${htmlFor}-error`} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
