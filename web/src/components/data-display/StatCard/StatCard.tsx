import { type ReactNode } from 'react'
import { cn } from '@/lib/cn'

/* ─────────────────────────────────────────────────────────────────────────────
   StatCard
───────────────────────────────────────────────────────────────────────────── */

export interface StatCardTrend {
  direction: 'up' | 'down' | 'neutral'
  label:     string
}

interface StatCardProps {
  label:      string
  value:      string | number
  trend?:     StatCardTrend
  icon?:      ReactNode
  className?: string
  'data-testid'?: string
}

const TREND_STYLES = {
  up:      { text: 'text-green-600', arrow: '▲' },
  down:    { text: 'text-red-600',   arrow: '▼' },
  neutral: { text: 'text-neutral-500', arrow: '–' },
}

export function StatCard({ label, value, trend, icon, className, 'data-testid': testId }: StatCardProps) {
  const t = trend ? TREND_STYLES[trend.direction] : null
  return (
    <div
      data-testid={testId}
      className={cn('rounded-lg border border-neutral-200 bg-white px-5 py-4', className)}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-500">{label}</span>
        {icon && <span className="text-neutral-400">{icon}</span>}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-neutral-900">{value}</span>
        {t && trend && (
          <span className={cn('text-xs font-medium', t.text)}>
            {t.arrow} {trend.label}
          </span>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   EmptyState
───────────────────────────────────────────────────────────────────────────── */

interface EmptyStateProps {
  message:    string
  /** Optional description below the message */
  description?: string
  /** Optional CTA button */
  action?:    ReactNode
  className?: string
  'data-testid'?: string
}

export function EmptyState({ message, description, action, className, 'data-testid': testId }: EmptyStateProps) {
  return (
    <div
      data-testid={testId}
      className={cn('flex flex-col items-center justify-center gap-3 py-12 text-center', className)}
    >
      <div className="text-4xl text-neutral-300" aria-hidden>○</div>
      <p className="text-sm font-medium text-neutral-500">{message}</p>
      {description && <p className="text-xs text-neutral-400 max-w-xs">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   SkeletonBlock  — generic shimmer placeholder
───────────────────────────────────────────────────────────────────────────── */

interface SkeletonBlockProps {
  rows?:      number
  className?: string
  'data-testid'?: string
}

export function SkeletonBlock({ rows = 4, className, 'data-testid': testId }: SkeletonBlockProps) {
  return (
    <div
      data-testid={testId}
      aria-busy
      aria-label="Loading"
      className={cn('w-full space-y-2 p-4', className)}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-9 rounded-md bg-neutral-200 animate-pulse',
            i % 3 === 1 && 'w-3/4',
            i % 3 === 2 && 'w-5/6',
          )}
        />
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   ActivityFeed
───────────────────────────────────────────────────────────────────────────── */

export interface FeedItem {
  id:        string
  time:      string
  message:   ReactNode
  icon?:     ReactNode
  variant?:  'default' | 'success' | 'warning' | 'error'
}

interface ActivityFeedProps {
  items:      FeedItem[]
  className?: string
  'data-testid'?: string
}

const FEED_VARIANT_STYLES = {
  default: 'bg-neutral-100 text-neutral-500',
  success: 'bg-green-100 text-green-600',
  warning: 'bg-yellow-100 text-yellow-600',
  error:   'bg-red-100 text-red-600',
}

export function ActivityFeed({ items, className, 'data-testid': testId }: ActivityFeedProps) {
  if (items.length === 0) return <EmptyState message="No recent activity." />

  return (
    <ol data-testid={testId} className={cn('space-y-3', className)}>
      {items.map((item) => (
        <li key={item.id} className="flex items-start gap-3">
          <div
            className={cn(
              'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs',
              FEED_VARIANT_STYLES[item.variant ?? 'default'],
            )}
          >
            {item.icon ?? '•'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-neutral-700 leading-snug">{item.message}</p>
            <time className="text-xs text-neutral-400">{item.time}</time>
          </div>
        </li>
      ))}
    </ol>
  )
}
