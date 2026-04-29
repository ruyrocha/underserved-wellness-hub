# ARCHITECTURE.md

> Related: [CLAUDE.md](./CLAUDE.md) · [AGENTS.md](./AGENTS.md) ·
> [ABSTRACTIONS.md](./ABSTRACTIONS.md) · [WIREFRAMES.md](./WIREFRAMES.md)

## System Overview

A multi-tenant patient engagement platform for safety-net healthcare
organizations. Organizations configure messaging programs; the platform
schedules and delivers SMS/voice outreach to patients, tracks responses, and
surfaces analytics.

---

## High-Level Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser / Mobile                         │
│                    React SPA (Vite + TypeScript)                │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS / JSON
┌───────────────────────────▼─────────────────────────────────────┐
│                   Rails API  (Cloud Run)                        │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ Controllers │  │   Services   │  │   Pundit Policies      │ │
│  │  (thin)     │  │  (business   │  │   (authz per record)   │ │
│  └──────┬──────┘  │   logic)     │  └────────────────────────┘ │
│         │         └──────┬───────┘                             │
│         └────────────────┤                                     │
│                          │                                     │
│         ┌────────────────▼───────────┐                        │
│         │       ActiveRecord         │                        │
│         └────────────────┬───────────┘                        │
└──────────────────────────┼──────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
┌─────────▼──────┐ ┌───────▼──────┐ ┌──────▼───────────────┐
│  PostgreSQL 15 │ │    Redis     │ │   Google Pub/Sub      │
│  (Cloud SQL)   │ │  (Sidekiq    │ │   (event bus for      │
│                │ │   queue)     │ │    integrations)      │
└────────────────┘ └──────┬───────┘ └──────────────────────┘
                          │
               ┌──────────▼──────────┐
               │    Sidekiq Workers  │
               │    (Cloud Run)      │
               └──────────┬──────────┘
                          │
               ┌──────────▼──────────┐
               │       Twilio        │
               │  SMS / Voice API    │
               └─────────────────────┘
                          │ Webhooks
               ┌──────────▼──────────┐
               │  Rails Webhook      │
               │  Controller         │
               │  /webhooks/twilio   │
               └─────────────────────┘
```

---

## Domain Model

```
Organization
  ├── has_many :users
  ├── has_many :patients
  ├── has_many :programs
  └── has_many :campaigns

User
  ├── belongs_to :organization
  └── has_one :role (enum: admin, care_coordinator, viewer)

Patient
  ├── belongs_to :organization
  ├── has_many :consents
  ├── has_many :messages
  └── has_many :program_enrollments

Consent
  ├── belongs_to :patient
  ├── channel: enum (sms, voice)
  ├── status: enum (opted_in, opted_out)
  └── recorded_at, opt_out_keyword

Program
  ├── belongs_to :organization
  ├── has_many :campaigns
  └── clinical_type: enum (appointment_reminder, chronic_care, sdoh_screening…)

Campaign
  ├── belongs_to :program
  ├── has_many :messages
  ├── status: enum (draft, scheduled, running, paused, completed)
  └── scheduled_at, timezone

Message
  ├── belongs_to :campaign
  ├── belongs_to :patient
  ├── channel: enum (sms, voice)
  ├── status: enum (pending, queued, sent, delivered, failed, opted_out)
  ├── twilio_sid
  ├── body (encrypted at rest)
  └── sent_at, delivered_at, failed_at

ConsentLog
  ├── belongs_to :patient
  ├── action: enum (opt_in, opt_out)
  ├── keyword
  └── message_id (inbound trigger)
```

---

## Request Lifecycle

### Outbound Message (happy path)

```
1. Care coordinator schedules Campaign (POST /api/v1/campaigns)
2. Rails creates Campaign record (status: draft → scheduled)
3. CampaignSchedulerJob enqueued for campaign.scheduled_at
4. Job runs → queries patients with valid consents
5. For each patient: MessageDeliverJob.perform_later(message_id)
6. MessageDeliverJob:
   a. Reload message; skip if patient opted out
   b. Enforce TCPA quiet hours (reschedule if needed)
   c. Call Twilio::SendSms service
   d. Update message.status = :queued, twilio_sid = ...
7. Twilio delivers; fires webhook to /webhooks/twilio/status
8. WebhooksController updates message.status = :delivered/:failed
```

### Inbound Opt-Out

```
1. Patient replies "STOP"
2. Twilio webhook → POST /webhooks/twilio/inbound
3. InboundMessageProcessor service:
   a. Parse keyword
   b. Create ConsentLog(action: :opt_out)
   c. Update Consent(status: :opted_out)
   d. Cancel pending MessageDeliverJobs for this patient
   e. Reply with TCPA-compliant confirmation text
```

---

## Multi-Tenancy

- Every model that belongs to an organization has an `organization_id` column
- `ApplicationController` sets `Current.organization` from JWT claims
- `ApplicationRecord` includes a
  `default_scope { where(organization: Current.organization) }` — every query is
  automatically scoped
- Pundit policies enforce record-level authorization on top of the scope

---

## Security Boundaries

| Concern                 | Mechanism                                                  |
| ----------------------- | ---------------------------------------------------------- |
| Authentication          | Devise + JWT (short-lived access token + refresh token)    |
| Authorization           | Pundit policies, one per model                             |
| Multi-tenancy isolation | DB-level `organization_id` default scope                   |
| PHI at rest             | `attr_encrypted` on `Message#body`, `Patient#phone_number` |
| PHI in transit          | TLS everywhere; Twilio TLS webhooks                        |
| Sidekiq args            | Never pass PHI — pass record IDs only                      |
| Audit log               | `PaperTrail` on Patient, Consent, Message                  |

---

## Background Job Architecture

```
Queues (priority order):
  critical   — opt-out processing, inbound webhook handling
  default    — individual message delivery
  scheduling — campaign batch scheduling
  low        — analytics aggregation, exports

Retry policy:
  MessageDeliverJob: retry 3x with exponential backoff, then dead queue + alert
  CampaignSchedulerJob: retry 5x; idempotent (checks status before acting)
```

---

## API Design Principles

- Versioned: all routes under `/api/v1/`
- JSON:API-compatible envelope: `{ data: ..., meta: ..., errors: ... }`
- Pagination: `page[number]` + `page[size]` via Kaminari
- Filtering: `filter[status]=scheduled` on collection endpoints
- Includes: `?include=messages,patients` via sparse fieldsets
- All timestamps in ISO 8601 UTC; client converts to local timezone

---

## Frontend Architecture

```
web/src/
├── components/          # Design system atoms (Button, Badge, Input, Table…)
├── features/
│   ├── auth/            # Login, token refresh
│   ├── campaigns/       # Campaign CRUD + launch flow
│   ├── patients/        # Patient list + profile
│   ├── messages/        # Message history + status
│   ├── programs/        # Program builder
│   └── analytics/       # Dashboard + charts
├── hooks/               # useOrganization, useCurrentUser
├── lib/
│   ├── api.ts           # Axios instance + interceptors
│   ├── queryClient.ts   # React Query global config
│   └── schema.ts        # Shared Zod schemas
├── pages/               # Route-level components (lazy-loaded)
└── store/               # Zustand: UI state, sidebar, toasts
```

**Data fetching pattern:**

```tsx
// Every server resource gets a feature hook
const { data: campaigns, isLoading } = useCampaigns({ status: "scheduled" });
// Hook wraps useQuery + calls lib/api.ts
// Component never calls fetch/axios directly
```

---

## Infrastructure (GCP)

| Service                | Purpose                                     |
| ---------------------- | ------------------------------------------- |
| Cloud Run (api)        | Rails API — autoscales to 0                 |
| Cloud Run (worker)     | Sidekiq — always-on min 1 instance          |
| Cloud SQL (PostgreSQL) | Primary DB with read replica                |
| Cloud Memorystore      | Redis for Sidekiq                           |
| Cloud Pub/Sub          | Async integration events (EHR webhooks)     |
| Cloud Storage          | Patient import CSVs, exports                |
| Secret Manager         | All secrets (Twilio, JWT, DB creds)         |
| Cloud Armor            | WAF + DDoS protection in front of Cloud Run |
