import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type ColCount = 1 | 2 | 3 | 4 | 6 | 12

interface ResponsiveCols {
  base?: ColCount
  sm?:   ColCount
  md?:   ColCount
  lg?:   ColCount
  xl?:   ColCount
}

interface GridProps extends HTMLAttributes<HTMLDivElement> {
  cols?:    ColCount | ResponsiveCols
  gap?:     '2' | '4' | '6' | '8'
}

function colClass(n: ColCount, prefix = '') {
  const map: Record<ColCount, string> = {
    1: `${prefix}grid-cols-1`,  2: `${prefix}grid-cols-2`,
    3: `${prefix}grid-cols-3`,  4: `${prefix}grid-cols-4`,
    6: `${prefix}grid-cols-6`,  12: `${prefix}grid-cols-12`,
  }
  return map[n]
}

export function Grid({ cols = 1, gap = '4', className, children, ...props }: GridProps) {
  const colClasses =
    typeof cols === 'number'
      ? colClass(cols)
      : [
          cols.base && colClass(cols.base),
          cols.sm   && colClass(cols.sm,  'sm:'),
          cols.md   && colClass(cols.md,  'md:'),
          cols.lg   && colClass(cols.lg,  'lg:'),
          cols.xl   && colClass(cols.xl,  'xl:'),
        ]
          .filter(Boolean)
          .join(' ')

  return (
    <div
      className={cn('grid', colClasses, `gap-${gap}`, className)}
      {...props}
    >
      {children}
    </div>
  )
}
