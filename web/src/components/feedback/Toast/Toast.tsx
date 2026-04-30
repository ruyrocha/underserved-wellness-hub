import { create } from 'zustand'
import { cn } from '@/lib/cn'

/* ─────────────────────────────────────────────────────────────────────────────
   Store
───────────────────────────────────────────────────────────────────────────── */

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id:           string
  variant:      ToastVariant
  title:        string
  description?: string
  durationMs?:  number   // defaults to 4000; 0 = persistent
}

interface ToastStore {
  toasts: ToastItem[]
  push:    (t: Omit<ToastItem, 'id'>) => string
  dismiss: (id: string) => void
  clear:   () => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (t) => {
    const id = crypto.randomUUID()
    set((s) => ({ toasts: [...s.toasts, { durationMs: 4000, ...t, id }] }))
    return id
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clear:   ()   => set({ toasts: [] }),
}))

/* Convenience helpers — call these from feature code */
export const toast = {
  success: (title: string, description?: string) =>
    useToastStore.getState().push({ variant: 'success', title, description }),
  error: (title: string, description?: string) =>
    useToastStore.getState().push({ variant: 'error', title, description }),
  warning: (title: string, description?: string) =>
    useToastStore.getState().push({ variant: 'warning', title, description }),
  info: (title: string, description?: string) =>
    useToastStore.getState().push({ variant: 'info', title, description }),
}

/* ─────────────────────────────────────────────────────────────────────────────
   ToastContainer  — mount once in AppShell
───────────────────────────────────────────────────────────────────────────── */

import { useEffect } from 'react'

const TOAST_STYLES: Record<ToastVariant, string> = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error:   'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info:    'bg-white border-neutral-200 text-neutral-800',
}

const TOAST_ICONS: Record<ToastVariant, string> = {
  success: '✓', error: '✕', warning: '⚠', info: 'ℹ',
}

function ToastMessage({ item }: { item: ToastItem }) {
  const dismiss = useToastStore((s) => s.dismiss)

  useEffect(() => {
    if (!item.durationMs) return
    const t = setTimeout(() => dismiss(item.id), item.durationMs)
    return () => clearTimeout(t)
  }, [item.id, item.durationMs, dismiss])

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-start gap-3 rounded-lg border px-4 py-3 shadow-md text-sm w-80',
        TOAST_STYLES[item.variant],
      )}
    >
      <span className="mt-0.5 shrink-0 font-bold" aria-hidden>{TOAST_ICONS[item.variant]}</span>
      <div className="flex-1 min-w-0">
        <p className="font-medium">{item.title}</p>
        {item.description && <p className="mt-0.5 opacity-80">{item.description}</p>}
      </div>
      <button
        onClick={() => dismiss(item.id)}
        aria-label="Dismiss"
        className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
      >
        ✕
      </button>
    </div>
  )
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  if (toasts.length === 0) return null

  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-[var(--z-toast)] flex flex-col gap-2"
    >
      {toasts.map((t) => <ToastMessage key={t.id} item={t} />)}
    </div>
  )
}
