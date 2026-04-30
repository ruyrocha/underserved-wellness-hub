import { useEffect, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type SlideOverWidth = 'sm' | 'md' | 'lg'

interface SlideOverProps {
  open:         boolean
  onClose:      () => void
  title:        string
  description?: string
  width?:       SlideOverWidth
  children:     ReactNode
  /** Rendered in a sticky footer bar — typically Save / Cancel buttons */
  footer?:      ReactNode
  'data-testid'?: string
}

const widthStyles: Record<SlideOverWidth, string> = {
  sm: 'max-w-sm',
  md: 'max-w-xl',
  lg: 'max-w-2xl',
}

export function SlideOver({
  open,
  onClose,
  title,
  description,
  width = 'md',
  children,
  footer,
  'data-testid': testId,
}: SlideOverProps) {
  // Trap focus & prevent body scroll while open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] flex" data-testid={testId}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 transition-opacity"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal
        aria-label={title}
        className={cn(
          'relative ml-auto flex h-full w-full flex-col bg-white shadow-xl',
          widthStyles[width],
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-neutral-200 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-neutral-500">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-4 p-1 rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>

        {/* Sticky footer */}
        {footer && (
          <div className="shrink-0 border-t border-neutral-200 px-6 py-4 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
