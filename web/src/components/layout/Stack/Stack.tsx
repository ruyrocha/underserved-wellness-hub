import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type GapSize = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12'

interface StackProps extends HTMLAttributes<HTMLDivElement> {
  gap?:       GapSize
  direction?: 'vertical' | 'horizontal'
  align?:     'start' | 'center' | 'end' | 'stretch'
  justify?:   'start' | 'center' | 'end' | 'between' | 'around'
}

const gapStyles: Record<GapSize, string> = {
  '0': 'gap-0', '1': 'gap-1', '2': 'gap-2',  '3': 'gap-3',
  '4': 'gap-4', '5': 'gap-5', '6': 'gap-6',  '8': 'gap-8',
  '10': 'gap-10', '12': 'gap-12',
}

export function Stack({
  gap       = '4',
  direction = 'vertical',
  align,
  justify,
  className,
  children,
  ...props
}: StackProps) {
  return (
    <div
      className={cn(
        'flex',
        direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
        gapStyles[gap],
        align   && `items-${align}`,
        justify && `justify-${justify}`,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
