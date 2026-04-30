import { cn } from '@/lib/cn'

/* ─────────────────────────────────────────────────────────────────────────────
   StatusBadge
   The only component in the library that encodes domain status enums.
   All status → visual mappings live here — nowhere else.
───────────────────────────────────────────────────────────────────────────── */

export type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'failed'
export type MessageStatus  = 'pending' | 'queued' | 'sent' | 'delivered' | 'failed' | 'opted_out'
export type AnyStatus      = CampaignStatus | MessageStatus

interface StatusConfig {
  label:     string
  pill:      string   // bg + text
  dot:       string   // dot color
  animate?:  boolean
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  // Campaign
  draft:      { label: 'Draft',      pill: 'bg-neutral-100 text-neutral-600', dot: 'bg-neutral-400' },
  scheduled:  { label: 'Scheduled',  pill: 'bg-blue-50 text-blue-700',        dot: 'bg-blue-500'    },
  running:    { label: 'Running',    pill: 'bg-green-50 text-green-700',       dot: 'bg-green-500',  animate: true },
  paused:     { label: 'Paused',     pill: 'bg-yellow-50 text-yellow-700',     dot: 'bg-yellow-500'  },
  completed:  { label: 'Completed',  pill: 'bg-neutral-50 text-neutral-500',   dot: 'bg-neutral-400' },
  // Message
  pending:    { label: 'Pending',    pill: 'bg-neutral-100 text-neutral-600',  dot: 'bg-neutral-400' },
  queued:     { label: 'Queued',     pill: 'bg-blue-50 text-blue-600',         dot: 'bg-blue-400'    },
  sent:       { label: 'Sent',       pill: 'bg-blue-50 text-blue-700',         dot: 'bg-blue-500'    },
  delivered:  { label: 'Delivered',  pill: 'bg-green-50 text-green-700',       dot: 'bg-green-500'   },
  failed:     { label: 'Failed',     pill: 'bg-red-50 text-red-700',           dot: 'bg-red-500'     },
  opted_out:  { label: 'Opted Out',  pill: 'bg-red-50 text-red-700',           dot: 'bg-red-400'     },
}

interface StatusBadgeProps {
  status:      AnyStatus
  showDot?:    boolean
  className?:  string
  'data-testid'?: string
}

export function StatusBadge({ status, showDot = true, className, 'data-testid': testId }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status, pill: 'bg-neutral-100 text-neutral-600', dot: 'bg-neutral-400',
  }

  return (
    <span
      data-testid={testId}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        cfg.pill,
        className,
      )}
    >
      {showDot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full shrink-0', cfg.dot, cfg.animate && 'animate-pulse')}
          aria-hidden
        />
      )}
      {cfg.label}
    </span>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   ConsentBadge
───────────────────────────────────────────────────────────────────────────── */

export type ConsentStatus = 'opted_in' | 'opted_out' | 'unknown'

const CONSENT_CONFIG: Record<ConsentStatus, StatusConfig> = {
  opted_in:  { label: 'Opted In',  pill: 'bg-green-50 text-green-700',     dot: 'bg-green-500' },
  opted_out: { label: 'Opted Out', pill: 'bg-red-50 text-red-700',         dot: 'bg-red-500'   },
  unknown:   { label: 'Unknown',   pill: 'bg-neutral-100 text-neutral-500', dot: 'bg-neutral-400' },
}

interface ConsentBadgeProps {
  status:     ConsentStatus
  showDot?:   boolean
  className?: string
  'data-testid'?: string
}

export function ConsentBadge({ status, showDot = true, className, 'data-testid': testId }: ConsentBadgeProps) {
  const cfg = CONSENT_CONFIG[status]
  return (
    <span
      data-testid={testId}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        cfg.pill,
        className,
      )}
    >
      {showDot && <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', cfg.dot)} aria-hidden />}
      {cfg.label}
    </span>
  )
}
