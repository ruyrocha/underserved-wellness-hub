import { type ReactNode } from 'react'
import { cn } from '@/lib/cn'

/* ─────────────────────────────────────────────────────────────────────────────
   Alert
───────────────────────────────────────────────────────────────────────────── */

export type AlertVariant = 'info' | 'success' | 'warning' | 'error'

interface AlertProps {
  variant?:   AlertVariant
  title?:     string
  children:   ReactNode
  onDismiss?: () => void
  className?: string
  'data-testid'?: string
}

const ALERT_STYLES: Record<AlertVariant, { wrap: string; icon: string; iconEl: string }> = {
  info:    { wrap: 'bg-blue-50 border-blue-200 text-blue-800',     icon: 'text-blue-500',   iconEl: 'ℹ' },
  success: { wrap: 'bg-green-50 border-green-200 text-green-800',  icon: 'text-green-500',  iconEl: '✓' },
  warning: { wrap: 'bg-yellow-50 border-yellow-200 text-yellow-800', icon: 'text-yellow-500', iconEl: '⚠' },
  error:   { wrap: 'bg-red-50 border-red-200 text-red-800',        icon: 'text-red-500',    iconEl: '✕' },
}

export function Alert({ variant = 'info', title, children, onDismiss, className, 'data-testid': testId }: AlertProps) {
  const s = ALERT_STYLES[variant]
  return (
    <div
      role="alert"
      data-testid={testId}
      className={cn('flex gap-3 rounded-md border px-4 py-3 text-sm', s.wrap, className)}
    >
      <span className={cn('mt-0.5 shrink-0 font-bold', s.icon)} aria-hidden>{s.iconEl}</span>
      <div className="flex-1 min-w-0">
        {title && <p className="font-medium mb-0.5">{title}</p>}
        <div>{children}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        >
          ✕
        </button>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   ProgressBar
───────────────────────────────────────────────────────────────────────────── */

interface ProgressBarProps {
  value:       number   // 0–100
  label?:      string
  showValue?:  boolean
  variant?:    'default' | 'success' | 'warning' | 'error'
  className?:  string
  'data-testid'?: string
}

const PROGRESS_TRACK: Record<string, string> = {
  default: 'bg-brand-600',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error:   'bg-red-500',
}

export function ProgressBar({
  value, label, showValue, variant = 'default', className, 'data-testid': testId,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div data-testid={testId} className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between text-xs text-neutral-500 mb-1">
          {label && <span>{label}</span>}
          {showValue && <span>{clamped}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 w-full overflow-hidden rounded-full bg-neutral-200"
      >
        <div
          className={cn('h-full rounded-full transition-all duration-300', PROGRESS_TRACK[variant])}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   ConfirmDialog
───────────────────────────────────────────────────────────────────────────── */

interface ConfirmDialogProps {
  open:         boolean
  title:        string
  description:  string
  confirmLabel?: string
  cancelLabel?:  string
  variant?:      'default' | 'destructive'
  onConfirm:    () => void
  onCancel:     () => void
  isLoading?:   boolean
  'data-testid'?: string
}

export function ConfirmDialog({
  open, title, description,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm, onCancel,
  isLoading,
  'data-testid': testId,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} aria-hidden />

      {/* Panel */}
      <div
        role="alertdialog"
        aria-modal
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
        data-testid={testId}
        className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <h2 id="confirm-title" className="text-base font-semibold text-neutral-900">{title}</h2>
        <p id="confirm-desc" className="mt-2 text-sm text-neutral-600">{description}</p>

        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50',
              variant === 'destructive'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-brand-600 hover:bg-brand-700',
            )}
          >
            {isLoading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
