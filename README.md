# Wellness Hub

> Patient engagement platform for safety-net healthcare organizations serving
> underserved communities.

**Repo:** `underserved-wellness-hub`

---

## What this is

Wellness Hub enables safety-net clinics, FQHCs, and community health centers to
send scheduled SMS and voice outreach to patients — appointment reminders,
chronic care follow-ups, SDOH screenings — while enforcing TCPA consent rules
and protecting PHI.

---

## Documentation

| Document                                 | Read when you want to…                                                                       |
| ---------------------------------------- | -------------------------------------------------------------------------------------------- |
| **[CLAUDE.md](./CLAUDE.md)**             | Understand the AI agent contract: stack, naming conventions, compliance guardrails           |
| **[AGENTS.md](./AGENTS.md)**             | See how AI agent roles divide work and chain together                                        |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | Understand the system: domain model, request lifecycle, infra                                |
| **[ABSTRACTIONS.md](./ABSTRACTIONS.md)** | Use the canonical code patterns: services, jobs, controllers, React hooks, component library |
| **[WIREFRAMES.md](./WIREFRAMES.md)**     | Screen inventory, open design questions, prototype → component map                           |

---

## Prototypes

Hi-fi interactive prototypes live in `prototypes/`. Open any file directly in a
browser — no build step, no server, no install.

| Screen                                | File                                                       |
| ------------------------------------- | ---------------------------------------------------------- |
| Dashboard                             | [`prototypes/dashboard.html`](./prototypes/dashboard.html) |
| Campaign List + Detail + New Campaign | [`prototypes/campaigns.html`](./prototypes/campaigns.html) |
| Patient List + Detail                 | [`prototypes/patients.html`](./prototypes/patients.html)   |
| Analytics                             | [`prototypes/analytics.html`](./prototypes/analytics.html) |

These are the **stakeholder-facing artifacts** — show these, not WIREFRAMES.md.
When a screen changes, update the prototype HTML first. Open design questions
that surface during review belong in
[WIREFRAMES.md](./WIREFRAMES.md#open-design-questions).

---

## Stack

| Layer           | Technology                     |
| --------------- | ------------------------------ |
| Backend         | Ruby on Rails 7 (API mode)     |
| Frontend        | React 18 + TypeScript + Vite   |
| Styling         | Tailwind CSS v3                |
| Database        | PostgreSQL 15                  |
| Background jobs | Sidekiq + Redis                |
| SMS / Voice     | Twilio                         |
| Cloud           | Google Cloud Platform          |
| Auth            | Devise + JWT                   |
| Tests (BE)      | RSpec + FactoryBot             |
| Tests (FE)      | Vitest + React Testing Library |
| CI              | GitHub Actions                 |

---

## Repo layout

```
underserved-wellness-hub/
├── prototypes/             # Hi-fi HTML prototypes (open in browser)
├── api/                        # Rails API
│   ├── app/
│   │   ├── controllers/api/v1/
│   │   ├── models/
│   │   ├── services/           # POROs — one verb, one job
│   │   ├── jobs/               # Sidekiq workers
│   │   ├── serializers/        # Blueprinter
│   │   └── policies/           # Pundit
│   ├── db/
│   │   ├── migrate/
│   │   └── seeds/
│   ├── spec/
│   └── config/
└── web/                        # React SPA
    └── src/
        ├── components/         # Design system — see below
        ├── features/           # Feature-sliced modules
        ├── hooks/
        ├── lib/                # API client, cn(), Zod schemas
        ├── pages/
        ├── store/              # Zustand stores
        └── styles/
            └── tokens.css      # Design tokens
```

---

## Component library

All UI is built from composable primitives in `web/src/components/`. Import
everything from the barrel:

```typescript
import {
  Button,
  Card,
  DataTable,
  StatusBadge,
  FormField,
  toast,
} from "@/components";
```

### Layers

| Folder          | What lives here                                                                         |
| --------------- | --------------------------------------------------------------------------------------- |
| `primitives/`   | Button, Input, Textarea, Select, Checkbox, RadioGroup, Spinner, Separator               |
| `layout/`       | AppShell, Sidebar, TopBar, PageHeader, Card, Stack, Grid, SlideOver                     |
| `data-display/` | DataTable, StatCard, StatusBadge, ConsentBadge, ActivityFeed, EmptyState, SkeletonBlock |
| `feedback/`     | Alert, Toast + ToastContainer, ConfirmDialog, ProgressBar                               |
| `forms/`        | FormField, MessageBodyEditor, TimezoneSelect                                            |
| `charts/`       | LineChart, BarChart, SparkBar _(wrappers — swap charting lib freely)_                   |

### Design principles

- **Props-only.** No component fetches data or calls the API. Data flows in via
  props; events flow out via callbacks.
- **Variant not flags.** One `variant` prop with a string union — not
  `isPrimary isDestructive isLoading`.
- **Forwarded refs.** All input-like primitives use `React.forwardRef` for
  `react-hook-form` compatibility.
- **Accessible by default.** Correct ARIA roles, keyboard navigation, and
  `aria-label` on every interactive element.
- **Swap-ready.** Components reference only CSS custom properties from
  `tokens.css`. When the company design system ships, replace token values and
  component implementations — feature code is untouched.

See [ABSTRACTIONS.md](./ABSTRACTIONS.md) for full component code and usage
examples.

---

## Getting started

### Prerequisites

- Ruby 3.3+
- Node 20+
- PostgreSQL 15
- Redis 7
- [Twilio account](https://www.twilio.com) (for local SMS testing, use a trial
  account)

### 1 — Clone

```bash
git clone https://github.com/your-org/underserved-wellness-hub.git
cd underserved-wellness-hub
```

### 2 — Backend

```bash
cd api
cp .env.example .env          # fill in DATABASE_URL, REDIS_URL, TWILIO_*, JWT_SECRET
bundle install
rails db:create db:migrate db:seed
bundle exec sidekiq &         # background jobs
rails s -p 3000
```

### 3 — Frontend

```bash
cd web
cp .env.example .env          # VITE_API_BASE_URL=http://localhost:3000
npm install
npm run dev                   # http://localhost:5173
```

---

## Running tests

```bash
# Backend
cd api
bundle exec rspec --format documentation

# Frontend
cd web
npm run typecheck
npm run lint
npm run test
```

---

## Environment variables

### `api/.env`

| Variable             | Description                           |
| -------------------- | ------------------------------------- |
| `DATABASE_URL`       | PostgreSQL connection string          |
| `REDIS_URL`          | Redis connection string (Sidekiq)     |
| `TWILIO_ACCOUNT_SID` | Twilio account SID                    |
| `TWILIO_AUTH_TOKEN`  | Twilio auth token                     |
| `TWILIO_FROM_NUMBER` | Outbound SMS/voice number             |
| `JWT_SECRET`         | Secret for signing JWT access tokens  |
| `GCP_PROJECT_ID`     | GCP project (Pub/Sub, Secret Manager) |

### `web/.env`

| Variable            | Description        |
| ------------------- | ------------------ |
| `VITE_API_BASE_URL` | Rails API base URL |

---

## Key domain concepts

| Concept          | Description                                                      |
| ---------------- | ---------------------------------------------------------------- |
| **Organization** | A safety-net clinic, FQHC, or CHC — the top-level tenant         |
| **Patient**      | A low-income individual receiving care outreach                  |
| **Program**      | A clinical workflow type (diabetes reminders, SDOH screening, …) |
| **Campaign**     | A scheduled batch of messages for a program                      |
| **Message**      | A single SMS or voice delivery to one patient                    |
| **Consent**      | TCPA opt-in/opt-out record — required before any message is sent |

---

## Compliance guardrails

These rules are enforced in code and must never be bypassed:

- **Consent first.** Always check `patient.consented?` before enqueueing a
  delivery job. The `ConsentGuard` concern in `app/services/concerns/` handles
  this.
- **Opt-out keywords.** `STOP`, `UNSUBSCRIBE`, `CANCEL`, `END`, `QUIT` — any of
  these must immediately halt messaging and record a `ConsentLog` opt-out entry.
- **TCPA quiet hours.** No SMS delivery between 21:00–08:00 in the patient's
  local timezone.
- **No PHI in logs.** Never log patient name, DOB, phone number, or diagnosis.
  Pass record IDs only to Sidekiq jobs.
- **Encrypted at rest.** `Patient#phone_number` and `Message#body` use
  `attr_encrypted` (AES-256-GCM).

---

## Contributing

1. Read [CLAUDE.md](./CLAUDE.md) for agent instructions and code conventions.
2. Read [AGENTS.md](./AGENTS.md) to understand how to scope a task to the right
   agent role.
3. Follow the vertical-slice workflow: migration → service → job → controller →
   React feature → tests — all in one PR.
4. CI must pass (`rspec`, `rubocop`, `typecheck`, `lint`, `vitest`) before
   merge.

---

## License

Private — all rights reserved. Not open source.
