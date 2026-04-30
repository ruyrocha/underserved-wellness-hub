import { type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { SkeletonBlock } from '../SkeletonBlock/SkeletonBlock'
import { EmptyState } from '../EmptyState/EmptyState'

export interface Column<T> {
  key:      string
  header:   string
  /** Tailwind width class e.g. "w-40" — applied to both th and td */
  width?:   string
  align?:   'left' | 'center' | 'right'
  cell:     (row: T, index: number) => ReactNode
}

interface DataTableProps<T> {
  columns:        Column<T>[]
  rows:           T[]
  rowKey:         (row: T) => string
  isLoading?:     boolean
  emptyMessage?:  string
  emptyAction?:   ReactNode
  onRowClick?:    (row: T) => void
  /** Pagination controls — rendered in a footer bar */
  footer?:        ReactNode
  className?:     string
  'data-testid'?: string
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading,
  emptyMessage = 'No results found.',
  emptyAction,
  onRowClick,
  footer,
  className,
  'data-testid': testId,
}: DataTableProps<T>) {
  if (isLoading) {
    return <SkeletonBlock rows={8} data-testid={testId ? `${testId}-skeleton` : undefined} />
  }

  return (
    <div
      data-testid={testId}
      className={cn('w-full overflow-x-auto rounded-lg border border-neutral-200', className)}
    >
      <table className="w-full text-sm text-neutral-700">
        <thead className="bg-neutral-50 border-b border-neutral-200">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-4 py-3 font-medium text-neutral-500 uppercase tracking-wide text-xs',
                  col.align ? `text-${col.align}` : 'text-left',
                  col.width,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-neutral-100">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState message={emptyMessage} action={emptyAction} />
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={rowKey(row)}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-neutral-50',
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 py-3',
                      col.align ? `text-${col.align}` : 'text-left',
                      col.width,
                    )}
                  >
                    {col.cell(row, i)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {footer && (
        <div className="px-4 py-3 border-t border-neutral-200 flex items-center justify-between text-sm text-neutral-500">
          {footer}
        </div>
      )}
    </div>
  )
}
