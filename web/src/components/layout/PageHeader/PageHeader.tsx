import { type ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface PageHeaderProps {
  title:       ReactNode
  subtitle?:   ReactNode
  /** Breadcrumb or back-link rendered above the title */
  breadcrumb?: ReactNode
  /** Buttons / controls rendered on the right */
  actions?:    ReactNode
  className?:  string
}

export function PageHeader({ title, subtitle, breadcrumb, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-1 pb-5 border-b border-neutral-200', className)}>
      {breadcrumb && (
        <div className="text-sm text-neutral-500 mb-1">{breadcrumb}</div>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 leading-tight">{title}</h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-neutral-500">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>
    </div>
  )
}
