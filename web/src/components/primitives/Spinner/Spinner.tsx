import { cn } from '@/lib/cn'

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg'

interface SpinnerProps {
  size?:      SpinnerSize
  className?: string
  label?:     string   // screen-reader label, defaults to "Loading"
}

const sizeStyles: Record<SpinnerSize, string> = {
  xs: 'h-3 w-3 border',
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[3px]',
}

export function Spinner({ size = 'md', className, label = 'Loading' }: SpinnerProps) {
  return (
    <span role="status" aria-label={label} className={cn('inline-block', className)}>
      <span
        className={cn(
          'block animate-spin rounded-full border-current border-b-transparent',
          sizeStyles[size],
        )}
      />
      <span className="sr-only">{label}</span>
    </span>
  )
}
