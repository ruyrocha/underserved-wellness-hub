import { cn } from '@/lib/cn'

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical'
  className?:   string
}

export function Separator({ orientation = 'horizontal', className }: SeparatorProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        'bg-neutral-200 shrink-0',
        orientation === 'horizontal' ? 'h-px w-full' : 'w-px self-stretch',
        className,
      )}
    />
  )
}
