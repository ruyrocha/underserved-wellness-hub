import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Spinner } from '../Spinner/Spinner'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'
export type ButtonSize    = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  ButtonVariant
  size?:     ButtonSize
  loading?:  boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500 border border-transparent',
  secondary:
    'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 focus-visible:ring-neutral-400',
  ghost:
    'bg-transparent text-neutral-600 border border-transparent hover:bg-neutral-100 focus-visible:ring-neutral-400',
  destructive:
    'bg-red-600 text-white border border-transparent hover:bg-red-700 focus-visible:ring-red-500',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8  px-3  text-sm  gap-1.5 rounded',
  md: 'h-9  px-4  text-sm  gap-2   rounded-md',
  lg: 'h-11 px-5  text-base gap-2  rounded-md',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size    = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      className,
      disabled,
      children,
      'data-testid': testId,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      data-testid={testId}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center font-medium',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {loading ? <Spinner size="sm" className="shrink-0" /> : leftIcon && <span className="shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  ),
)
Button.displayName = 'Button'
