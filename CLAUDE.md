# CLAUDE.md

## Project Identity

This is **Wellness Hub** (`underserved-wellness-hub`) — a patient engagement
platform for safety-net healthcare organizations serving underserved
communities. Your job is to help ship **end-to-end features** — from database
migrations through API endpoints to React UI — in a single, coherent pass.

### Related docs

| Document                             | Purpose                                         |
| ------------------------------------ | ----------------------------------------------- |
| [AGENTS.md](./AGENTS.md)             | Agent roles, scoped workflows, and ground rules |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System diagram, domain model, request lifecycle |
| [ABSTRACTIONS.md](./ABSTRACTIONS.md) | Canonical code patterns and component library   |
| [WIREFRAMES.md](./WIREFRAMES.md)     | Screen layouts with component annotations       |

---

## Stack

| Layer           | Technology                                            |
| --------------- | ----------------------------------------------------- |
| Backend         | Ruby on Rails 7.x (API mode)                          |
| Frontend        | React 18 + TypeScript + Vite                          |
| Styling         | Tailwind CSS v3                                       |
| Database        | PostgreSQL 15                                         |
| Background Jobs | Sidekiq + Redis                                       |
| SMS/Voice       | Twilio                                                |
| Cloud           | Google Cloud Platform (Cloud Run, Cloud SQL, Pub/Sub) |
| Auth            | Devise + JWT (or devise-jwt gem)                      |
| Testing (BE)    | RSpec + FactoryBot                                    |
| Testing (FE)    | Vitest + React Testing Library                        |
| CI              | GitHub Actions                                        |

---

## Project Layout

```
/
├── api/                  # Rails API app
│   ├── app/
│   │   ├── controllers/api/v1/
│   │   ├── models/
│   │   ├── services/         # POROs: one verb, one job
│   │   ├── jobs/             # Sidekiq workers
│   │   ├── serializers/      # ActiveModel::Serializer or blueprinter
│   │   └── policies/         # Pundit
│   ├── db/
│   │   ├── migrate/
│   │   └── seeds/
│   ├── spec/
│   └── config/
└── web/                  # React + Vite SPA
    ├── src/
    │   ├── components/   # Shared UI atoms/molecules
    │   ├── features/     # Feature-sliced modules
    │   ├── hooks/
    │   ├── lib/          # API client, utilities
    │   ├── pages/
    │   └── store/        # Zustand or React Query cache
    └── tests/
```

---

## How to Work

### Always ship a complete vertical slice

When adding a feature, produce **all layers** in one pass:

1. Migration (`rails g migration`)
2. Model with validations + associations
3. Service object (business logic)
4. Sidekiq job (if async)
5. Controller + serializer
6. Route
7. React feature module (hook + component + page)
8. Tests for each layer

### Never leave stubs

Do not write `# TODO`, `raise NotImplementedError`, or empty `it "..."` blocks
unless you explicitly flag them as next-step work items at the end of your
response.

### Formatting rules

- Ruby: 2-space indent, frozen string literals, no trailing whitespace
- TypeScript: strict mode, no `any`, prefer `interface` over `type` for shapes
- SQL: always add indexes for foreign keys and query-hot columns
- Tailwind: use `cn()` utility (clsx + tailwind-merge) for conditional classes

### Naming conventions

| Thing           | Convention                             |
| --------------- | -------------------------------------- |
| Rails service   | `Verb::Noun` e.g. `Messages::Schedule` |
| Sidekiq job     | `NounVerbJob` e.g. `MessageDeliverJob` |
| React component | `PascalCase.tsx`                       |
| React hook      | `useCamelCase.ts`                      |
| API route       | `/api/v1/resource`                     |
| Feature folder  | `src/features/snake_case/`             |

---

## Environment Variables

```bash
# api/.env
DATABASE_URL=
REDIS_URL=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
JWT_SECRET=
GCP_PROJECT_ID=

# web/.env
VITE_API_BASE_URL=http://localhost:3000
```

---

## Running Locally

```bash
# Backend
cd api && bundle install
rails db:create db:migrate db:seed
bundle exec sidekiq &
rails s -p 3000

# Frontend
cd web && npm install
npm run dev     # http://localhost:5173
```

---

## Code Quality Gates (CI must pass)

```bash
# Backend
bundle exec rspec --format progress
bundle exec rubocop --parallel

# Frontend
npm run typecheck
npm run lint
npm run test
```

---

## Key Domain Concepts

- **Organization** — a safety-net healthcare org (clinic, FQHC, CHC)
- **Patient** — a low-income individual receiving care
- **Campaign** — a scheduled or triggered batch of messages
- **Message** — a single SMS or voice outreach to a patient
- **Consent** — TCPA opt-in/opt-out record; never message without it
- **Program** — a clinical workflow (e.g., diabetes reminders, appointment
  follow-ups)

---

## Compliance Guardrails (never skip these)

- Always check `patient.consented?` before enqueuing a delivery job
- Opt-out keywords (`STOP`, `UNSUBSCRIBE`, `CANCEL`, `END`, `QUIT`) must
  immediately halt messaging and record the opt-out
- Never log PHI (patient name, DOB, diagnosis) to stdout or Sidekiq job args —
  use record IDs only
- TCPA quiet hours: do not schedule SMS delivery between 21:00–08:00 in the
  patient's local timezone
