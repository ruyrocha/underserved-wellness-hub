# ABSTRACTIONS.md

> Related: [CLAUDE.md](./CLAUDE.md) · [AGENTS.md](./AGENTS.md) ·
> [ARCHITECTURE.md](./ARCHITECTURE.md) · [WIREFRAMES.md](./WIREFRAMES.md)

> The canonical patterns for this codebase. When in doubt, look here first. Do
> not invent new patterns — extend these.

---

## 1. Service Objects

Every piece of business logic lives in a service under `app/services/`.

### Shape

```ruby
# app/services/messages/schedule.rb
module Messages
  class Schedule
    Result = Struct.new(:success?, :payload, :errors, keyword_init: true)

    def initialize(campaign:, twilio_adapter: Twilio::Adapter.new)
      @campaign       = campaign
      @twilio_adapter = twilio_adapter
    end

    def call
      return failure("Campaign already running") if campaign.running?

      ActiveRecord::Base.transaction do
        messages = build_messages
        campaign.update!(status: :scheduled)
        enqueue_jobs(messages)
      end

      Result.new(success?: true, payload: campaign, errors: [])
    rescue => e
      Result.new(success?: false, payload: nil, errors: [e.message])
    end

    private

    attr_reader :campaign, :twilio_adapter

    def build_messages
      campaign.consented_patients.map do |patient|
        Message.create!(campaign: campaign, patient: patient, status: :pending)
      end
    end

    def enqueue_jobs(messages)
      messages.each { |m| MessageDeliverJob.perform_at(campaign.scheduled_at, m.id) }
    end

    def failure(msg)
      Result.new(success?: false, payload: nil, errors: [msg])
    end
  end
end
```

### Usage in controller

```ruby
result = Messages::Schedule.new(campaign: @campaign).call
if result.success?
  render json: CampaignSerializer.new(result.payload), status: :ok
else
  render json: { errors: result.errors }, status: :unprocessable_entity
end
```

---

## 2. Sidekiq Jobs

All async work goes through Sidekiq. Jobs are thin wrappers that delegate to
services.

```ruby
# app/jobs/message_deliver_job.rb
class MessageDeliverJob
  include Sidekiq::Job

  sidekiq_options queue: :default, retry: 3, dead: true

  def perform(message_id)
    message = Message.find(message_id)

    # Guard: patient may have opted out since enqueue time
    return if message.patient.opted_out?(:sms)

    result = Messages::Deliver.new(message: message).call

    unless result.success?
      logger.error("[MessageDeliverJob] Failed #{message_id}: #{result.errors}")
      raise result.errors.first  # triggers Sidekiq retry
    end
  end
end
```

**Rules:**

- Pass only primitive IDs as job args
- Reload the record inside `perform` (stale data from enqueue time is dangerous)
- Re-raise on failure so Sidekiq retries with backoff

---

## 3. API Controllers

Controllers are thin: authorize → parse → call service → serialize → render.

```ruby
# app/controllers/api/v1/campaigns_controller.rb
module Api
  module V1
    class CampaignsController < ApplicationController
      before_action :authenticate!
      before_action :set_campaign, only: %i[show update launch destroy]

      def index
        campaigns = policy_scope(Campaign).page(params[:page]).per(params[:per_page] || 25)
        render json: CampaignSerializer.new(campaigns, meta: pagination_meta(campaigns))
      end

      def create
        @campaign = current_organization.campaigns.build(campaign_params)
        authorize @campaign

        if @campaign.save
          render json: CampaignSerializer.new(@campaign), status: :created
        else
          render json: { errors: @campaign.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def launch
        authorize @campaign, :launch?
        result = Messages::Schedule.new(campaign: @campaign).call

        if result.success?
          render json: CampaignSerializer.new(result.payload)
        else
          render json: { errors: result.errors }, status: :unprocessable_entity
        end
      end

      private

      def set_campaign
        @campaign = Campaign.find(params[:id])  # org scope applied automatically
      end

      def campaign_params
        params.require(:campaign).permit(:name, :scheduled_at, :timezone, :program_id)
      end
    end
  end
end
```

---

## 4. Pundit Policies

One policy per model. Keep authorization logic out of controllers and models.

```ruby
# app/policies/campaign_policy.rb
class CampaignPolicy < ApplicationPolicy
  # record is guaranteed to belong to current org via default_scope

  def index?   = true
  def show?    = true
  def create?  = user.admin? || user.care_coordinator?
  def update?  = create? && record.draft?
  def destroy? = user.admin? && record.draft?
  def launch?  = create? && record.scheduled?

  class Scope < ApplicationPolicy::Scope
    def resolve = scope.all  # org scope already applied at model level
  end
end
```

---

## 5. Serializers (Blueprinter)

Use Blueprinter for consistent JSON output.

```ruby
# app/serializers/campaign_serializer.rb
class CampaignSerializer < Blueprinter::Base
  identifier :id

  fields :name, :status, :scheduled_at, :timezone, :created_at, :updated_at

  field :messages_count do |campaign|
    campaign.messages.size
  end

  association :program, blueprint: ProgramSerializer
end
```

---

## 6. React Feature Module

Every feature is a self-contained folder with a hook, components, and a page.

```
src/features/campaigns/
├── index.ts                  # re-exports
├── useCampaigns.ts           # list hook (React Query)
├── useCampaign.ts            # single record hook
├── useLaunchCampaign.ts      # mutation hook
├── CampaignList.tsx
├── CampaignCard.tsx
├── CampaignForm.tsx
├── CampaignDetailPage.tsx
└── campaigns.test.tsx
```

### Hook pattern

```typescript
// src/features/campaigns/useCampaigns.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Campaign } from "@/lib/schema";

interface Params {
  status?: Campaign["status"];
  page?: number;
}

export function useCampaigns(params: Params = {}) {
  return useQuery({
    queryKey: ["campaigns", params],
    queryFn: () =>
      api.get<{ data: Campaign[]; meta: { total: number } }>(
        "/api/v1/campaigns",
        { params },
      ),
    select: (res) => res.data,
  });
}
```

### Mutation hook pattern

```typescript
// src/features/campaigns/useLaunchCampaign.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useLaunchCampaign() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (campaignId: string) =>
      api.post(`/api/v1/campaigns/${campaignId}/launch`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}
```

---

## 6b. Component Library

> The design system lives in `src/components/`. All components are
> stack-agnostic, composable primitives. They carry **no business logic** and
> **no data fetching** — those belong in feature modules. When the company's
> internal library matures, swap implementations here without touching feature
> code.

### Source layout

```
src/components/
├── primitives/        # Lowest-level, single-purpose atoms
│   ├── Button/
│   ├── Badge/
│   ├── Input/
│   ├── Textarea/
│   ├── Select/
│   ├── Checkbox/
│   ├── RadioGroup/
│   ├── Label/
│   ├── Separator/
│   └── Spinner/
├── layout/            # Structural containers
│   ├── AppShell/
│   ├── Sidebar/
│   ├── TopBar/
│   ├── PageHeader/
│   ├── Card/
│   ├── Stack/         # Vertical spacing utility
│   ├── Grid/          # Responsive column grid
│   └── SlideOver/     # Right-anchored drawer
├── data-display/      # Read-only presentational
│   ├── DataTable/
│   ├── StatCard/
│   ├── StatusBadge/
│   ├── ConsentBadge/
│   ├── ActivityFeed/
│   ├── EmptyState/
│   └── SkeletonBlock/
├── feedback/          # User feedback
│   ├── Toast/
│   ├── Alert/
│   ├── ConfirmDialog/
│   └── ProgressBar/
├── forms/             # Controlled form building blocks
│   ├── FormField/     # Label + Input + ErrorMessage wrapper
│   ├── DatePicker/
│   ├── TimePicker/
│   ├── TimezoneSelect/
│   ├── MessageBodyEditor/   # Textarea + variable chip insert + char counter
│   └── RecipientPicker/
└── charts/            # Thin wrappers — swap charting lib freely
    ├── LineChart/
    ├── BarChart/
    └── SparkBar/
```

### Component contract rules

Every component in `src/components/` must follow these constraints:

1. **Props-only API.** No internal data fetching, no hooks that call the API.
   Accept data as props; emit events via callbacks.
2. **Slot / children composition.** Prefer `children` or named render props over
   deeply nested prop drilling.
3. **Variant over branching.** Encode visual variants as a `variant` prop with a
   string union — not a proliferation of boolean flags.
4. **Forwarded refs.** All input-like primitives use `React.forwardRef` so they
   work with `react-hook-form`'s `register`.
5. **Accessible by default.** Every interactive component has correct ARIA
   roles, `aria-label` fallbacks, and keyboard navigation.
6. **`data-testid` on root.** Every component accepts and forwards a
   `data-testid` prop for test targeting.

### Primitive: Button

```typescript
// src/components/primitives/Button/Button.tsx
import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const variantStyles: Record<Variant, string> = {
  primary:     'bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500',
  secondary:   'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50',
  ghost:       'text-neutral-600 hover:bg-neutral-100',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
}

const sizeStyles: Record<Size, string> = {
  sm: 'h-8  px-3 text-sm gap-1.5',
  md: 'h-9  px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-base gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, leftIcon, rightIcon,
     className, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium',
        'transition-colors focus-visible:outline-none focus-visible:ring-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  )
)
Button.displayName = 'Button'
```

### Primitive: StatusBadge

Domain-aware badge — the only component that knows about business status enums.

```typescript
// src/components/data-display/StatusBadge/StatusBadge.tsx
import { cn } from '@/lib/cn'

type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'failed'
type ConsentStatus  = 'opted_in' | 'opted_out' | 'unknown'
type MessageStatus  = 'pending' | 'queued' | 'sent' | 'delivered' | 'failed' | 'opted_out'

type Status = CampaignStatus | ConsentStatus | MessageStatus

const config: Record<Status, { label: string; className: string; dot: string }> = {
  // Campaign
  draft:       { label: 'Draft',      className: 'bg-neutral-100 text-neutral-600', dot: 'bg-neutral-400' },
  scheduled:   { label: 'Scheduled',  className: 'bg-blue-50 text-blue-700',        dot: 'bg-blue-500' },
  running:     { label: 'Running',    className: 'bg-green-50 text-green-700',       dot: 'bg-green-500 animate-pulse' },
  paused:      { label: 'Paused',     className: 'bg-yellow-50 text-yellow-700',     dot: 'bg-yellow-500' },
  completed:   { label: 'Completed',  className: 'bg-neutral-50 text-neutral-500',   dot: 'bg-neutral-400' },
  failed:      { label: 'Failed',     className: 'bg-red-50 text-red-700',           dot: 'bg-red-500' },
  // Consent
  opted_in:    { label: 'Opted In',   className: 'bg-green-50 text-green-700',       dot: 'bg-green-500' },
  opted_out:   { label: 'Opted Out',  className: 'bg-red-50 text-red-700',           dot: 'bg-red-500' },
  unknown:     { label: 'Unknown',    className: 'bg-neutral-100 text-neutral-500',   dot: 'bg-neutral-400' },
  // Message
  pending:     { label: 'Pending',    className: 'bg-neutral-100 text-neutral-600',  dot: 'bg-neutral-400' },
  queued:      { label: 'Queued',     className: 'bg-blue-50 text-blue-700',         dot: 'bg-blue-400' },
  sent:        { label: 'Sent',       className: 'bg-blue-50 text-blue-700',         dot: 'bg-blue-500' },
  delivered:   { label: 'Delivered',  className: 'bg-green-50 text-green-700',       dot: 'bg-green-500' },
  // 'failed' + 'opted_out' already covered above
}

interface StatusBadgeProps {
  status: Status
  showDot?: boolean
  className?: string
}

export function StatusBadge({ status, showDot = true, className }: StatusBadgeProps) {
  const { label, className: base, dot } = config[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', base, className)}>
      {showDot && <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />}
      {label}
    </span>
  )
}
```

### Layout: SlideOver

Used for the New Campaign form and any record-creation flow.

```typescript
// src/components/layout/SlideOver/SlideOver.tsx
import { Fragment, ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface SlideOverProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  width?: 'sm' | 'md' | 'lg'   // 400 | 540 | 720px
}

const widthClass = { sm: 'max-w-sm', md: 'max-w-xl', lg: 'max-w-2xl' }

export function SlideOver({ open, onClose, title, description, children, footer, width = 'md' }: SlideOverProps) {
  return (
    // Backdrop + panel — implement transition with CSS or your animation lib
    <div role="dialog" aria-modal aria-label={title} hidden={!open}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      {/* Panel */}
      <div className={cn('fixed inset-y-0 right-0 flex flex-col bg-white shadow-xl', widthClass[width])}>
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-neutral-200">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
            {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
          </div>
          <button onClick={onClose} aria-label="Close" className="ml-4 text-neutral-400 hover:text-neutral-600">✕</button>
        </div>
        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
        {/* Sticky footer */}
        {footer && (
          <div className="border-t border-neutral-200 px-6 py-4 flex justify-end gap-3">{footer}</div>
        )}
      </div>
    </div>
  )
}
```

### Data Display: DataTable

Generic, column-defined table with built-in skeleton loading, empty state, and
pagination slot.

```typescript
// src/components/data-display/DataTable/DataTable.tsx
import { ReactNode } from 'react'
import { SkeletonBlock } from '../SkeletonBlock'
import { EmptyState } from '../EmptyState'

export interface Column<T> {
  key: string
  header: string
  width?: string                           // e.g. 'w-48'
  cell: (row: T, index: number) => ReactNode
  align?: 'left' | 'center' | 'right'
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  isLoading?: boolean
  emptyMessage?: string
  onRowClick?: (row: T) => void
  footer?: ReactNode                       // pagination slot
}

export function DataTable<T>({
  columns, rows, rowKey, isLoading, emptyMessage = 'No results found.',
  onRowClick, footer,
}: DataTableProps<T>) {
  if (isLoading) return <SkeletonBlock rows={8} />

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-neutral-200">
      <table className="w-full text-sm text-neutral-700">
        <thead className="bg-neutral-50 border-b border-neutral-200">
          <tr>
            {columns.map(col => (
              <th key={col.key}
                  className={`px-4 py-3 font-medium text-neutral-500 uppercase tracking-wide text-xs text-${col.align ?? 'left'} ${col.width ?? ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {rows.length === 0
            ? <tr><td colSpan={columns.length}><EmptyState message={emptyMessage} /></td></tr>
            : rows.map((row, i) => (
                <tr key={rowKey(row)}
                    onClick={() => onRowClick?.(row)}
                    className={onRowClick ? 'cursor-pointer hover:bg-neutral-50 transition-colors' : ''}>
                  {columns.map(col => (
                    <td key={col.key} className={`px-4 py-3 text-${col.align ?? 'left'}`}>
                      {col.cell(row, i)}
                    </td>
                  ))}
                </tr>
              ))
          }
        </tbody>
      </table>
      {footer && <div className="px-4 py-3 border-t border-neutral-200">{footer}</div>}
    </div>
  )
}
```

### Data Display: StatCard

```typescript
// src/components/data-display/StatCard/StatCard.tsx
import { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface StatCardProps {
  label: string
  value: string | number
  trend?: { direction: 'up' | 'down' | 'neutral'; label: string }
  icon?: ReactNode
  className?: string
}

export function StatCard({ label, value, trend, icon, className }: StatCardProps) {
  const trendColor = { up: 'text-green-600', down: 'text-red-600', neutral: 'text-neutral-500' }
  const trendArrow = { up: '▲', down: '▼', neutral: '–' }

  return (
    <div className={cn('rounded-lg border border-neutral-200 bg-white px-5 py-4', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-500">{label}</span>
        {icon && <span className="text-neutral-400">{icon}</span>}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-neutral-900">{value}</span>
        {trend && (
          <span className={cn('text-xs font-medium', trendColor[trend.direction])}>
            {trendArrow[trend.direction]} {trend.label}
          </span>
        )}
      </div>
    </div>
  )
}
```

### Forms: FormField wrapper

Pairs any input with a label and inline error, compatible with
`react-hook-form`.

```typescript
// src/components/forms/FormField/FormField.tsx
import { ReactNode, HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  required?: boolean
  children: ReactNode
}

export function FormField({ label, htmlFor, error, hint, required, children, className, ...props }: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)} {...props}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-neutral-700">
        {label}
        {required && <span className="ml-0.5 text-red-500" aria-hidden>*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-neutral-400">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}
```

### Feedback: Toast

Global toast system via Zustand — call `toast.success()` from anywhere.

```typescript
// src/store/toastStore.ts
import { create } from "zustand";

type ToastVariant = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
}

interface ToastStore {
  toasts: Toast[];
  push: (t: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (t) =>
    set((s) => ({ toasts: [...s.toasts, { ...t, id: crypto.randomUUID() }] })),
  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

// Convenience helpers used in feature code
export const toast = {
  success: (title: string, description?: string) =>
    useToastStore.getState().push({ variant: "success", title, description }),
  error: (title: string, description?: string) =>
    useToastStore.getState().push({ variant: "error", title, description }),
};
```

### Design Tokens (CSS custom properties)

Until the company's design system publishes its token file, define tokens here.
Swap values when the real system lands — component code does not change.

```css
/* src/styles/tokens.css */
:root {
  /* Brand */
  --color-brand-50: #f0faf4;
  --color-brand-600: #1a7a4a; /* primary action */
  --color-brand-700: #145e38;

  /* Neutral */
  --color-neutral-50: #f9fafb;
  --color-neutral-100: #f3f4f6;
  --color-neutral-200: #e5e7eb;
  --color-neutral-500: #6b7280;
  --color-neutral-700: #374151;
  --color-neutral-900: #111827;

  /* Semantic */
  --color-success: #16a34a;
  --color-warning: #d97706;
  --color-error: #dc2626;
  --color-info: #2563eb;

  /* Spacing scale */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-full: 9999px;

  /* Shadow */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}
```

### Migration path to company design system

When the internal library ships:

1. Replace `src/components/primitives/` implementations one file at a time — the
   component APIs (props, variants, callbacks) stay identical.
2. Replace `src/styles/tokens.css` with the library's token file — all
   components auto-update via CSS variables.
3. Do **not** import internal library components directly in feature modules —
   always go through `src/components/`. This keeps the swap surface to one
   folder.

---

## 7. Zod Schemas

Shared validation schemas live in `src/lib/schema.ts`. Use them for form
validation AND typing API responses.

```typescript
// src/lib/schema.ts
import { z } from "zod";

export const CampaignSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  status: z.enum(["draft", "scheduled", "running", "paused", "completed"]),
  scheduled_at: z.string().datetime(),
  timezone: z.string(),
  messages_count: z.number().int().nonnegative(),
  created_at: z.string().datetime(),
});

export type Campaign = z.infer<typeof CampaignSchema>;

export const CampaignFormSchema = CampaignSchema.pick({
  name: true,
  scheduled_at: true,
  timezone: true,
});
export type CampaignFormValues = z.infer<typeof CampaignFormSchema>;
```

---

## 8. Encrypted PHI Columns

Patient phone numbers and message bodies are encrypted at rest using
`attr_encrypted`.

```ruby
# app/models/patient.rb
class Patient < ApplicationRecord
  attr_encrypted :phone_number,
    key: -> { Rails.application.credentials.attr_encrypted_key },
    algorithm: 'aes-256-gcm'

  # Never log the decrypted value
  def to_s
    "#<Patient id=#{id}>"
  end
end
```

---

## 9. Consent Guard (always use this before sending)

Never call Twilio directly. Always go through this check:

```ruby
# app/services/concerns/consent_guard.rb
module ConsentGuard
  def assert_consent!(patient:, channel:)
    unless patient.consented?(channel)
      raise ConsentError, "Patient #{patient.id} has not consented to #{channel} messages"
    end
  end
end

# Usage in any service that sends messages
class Messages::Deliver
  include ConsentGuard

  def call
    assert_consent!(patient: message.patient, channel: message.channel)
    # ... proceed with delivery
  end
end
```

---

## 10. Pagination Meta Helper

```ruby
# app/controllers/concerns/paginatable.rb
module Paginatable
  def pagination_meta(collection)
    {
      current_page: collection.current_page,
      total_pages:  collection.total_pages,
      total_count:  collection.total_count,
      per_page:     collection.limit_value,
    }
  end
end
```

---

## Anti-Patterns (do not use)

| ❌ Don't                             | ✅ Do instead                             |
| ------------------------------------ | ----------------------------------------- |
| Business logic in controllers        | Service object                            |
| Business logic in models             | Service object                            |
| `Patient.all` without org scope      | Default scope handles it; trust the model |
| Passing AR objects to Sidekiq        | Pass `record.id`, reload in job           |
| `render json: record.to_json`        | Use a serializer                          |
| Fetching in React components         | Custom hook wrapping `useQuery`           |
| `any` in TypeScript                  | Zod schema + inferred types               |
| Direct Twilio SDK call in controller | Twilio::Adapter injected into service     |
