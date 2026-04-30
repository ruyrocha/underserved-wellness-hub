import { type ReactNode } from 'react'
import { cn } from '@/lib/cn'

/* ─────────────────────────────────────────────────────────────────────────────
   AppShell
   Composes TopBar + Sidebar + main content area.
   Sidebar collapsed state is managed externally (Zustand useUIStore).
───────────────────────────────────────────────────────────────────────────── */

interface AppShellProps {
  topBar:     ReactNode
  sidebar:    ReactNode
  children:   ReactNode
  className?: string
}

export function AppShell({ topBar, sidebar, children, className }: AppShellProps) {
  return (
    <div className={cn('flex h-screen flex-col overflow-hidden bg-neutral-50', className)}>
      {/* Fixed top bar */}
      <div className="shrink-0 z-[var(--z-sticky)]">{topBar}</div>

      {/* Below topbar: sidebar + main */}
      <div className="flex flex-1 overflow-hidden">
        <div className="shrink-0">{sidebar}</div>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   TopBar
───────────────────────────────────────────────────────────────────────────── */

interface TopBarProps {
  logo:       ReactNode
  /** Org switcher / middle-slot */
  center?:    ReactNode
  /** Right-side user menu, notifications, etc. */
  actions?:   ReactNode
  className?: string
}

export function TopBar({ logo, center, actions, className }: TopBarProps) {
  return (
    <header
      className={cn(
        'flex h-14 items-center justify-between gap-4 border-b border-neutral-200 bg-white px-4',
        className,
      )}
    >
      <div className="flex items-center gap-3 shrink-0">{logo}</div>
      {center && <div className="flex-1">{center}</div>}
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </header>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Sidebar
───────────────────────────────────────────────────────────────────────────── */

interface SidebarProps {
  collapsed?: boolean
  children:   ReactNode
  className?: string
}

export function Sidebar({ collapsed = false, children, className }: SidebarProps) {
  return (
    <aside
      aria-label="Main navigation"
      className={cn(
        'flex flex-col h-full border-r border-neutral-200 bg-white transition-all duration-200 overflow-hidden',
        collapsed ? 'w-12' : 'w-60',
        className,
      )}
    >
      <nav className="flex flex-col gap-0.5 p-2 flex-1">{children}</nav>
    </aside>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   NavItem  (used inside Sidebar)
───────────────────────────────────────────────────────────────────────────── */

interface NavItemProps {
  icon:       ReactNode
  label:      string
  active?:    boolean
  collapsed?: boolean
  onClick?:   () => void
  href?:      string
}

export function NavItem({ icon, label, active, collapsed, onClick, href }: NavItemProps) {
  const Tag = href ? 'a' : 'button'
  return (
    <Tag
      href={href}
      onClick={onClick}
      aria-label={collapsed ? label : undefined}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-brand-50 text-brand-700'
          : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
        collapsed && 'justify-center',
      )}
    >
      <span className="shrink-0 text-[18px]">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </Tag>
  )
}
