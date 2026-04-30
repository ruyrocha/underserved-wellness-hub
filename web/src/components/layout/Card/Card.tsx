import { type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional header rendered above the body with a bottom border */
  header?: ReactNode
  /** Optional footer rendered below the body with a top border */
  footer?: ReactNode
  /** Remove default padding from the body slot */
  noPadding?: boolean
}

export function Card({ header, footer, noPadding, className, children, 'data-testid': testId, ...props }: CardProps & { 'data-testid'?: string }) {
  return (
    <div
      data-testid={testId}
      className={cn('rounded-lg border border-neutral-200 bg-white shadow-xs', className)}
      {...props}
    >
      {header && (
        <div className="px-5 py-4 border-b border-neutral-200 text-sm font-medium text-neutral-700">
          {header}
        </div>
      )}
      <div className={cn(noPadding ? '' : 'px-5 py-4')}>{children}</div>
      {footer && (
        <div className="px-5 py-3 border-t border-neutral-200 text-sm text-neutral-500">
          {footer}
        </div>
      )}
    </div>
  )
}
