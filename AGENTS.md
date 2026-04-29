# AGENTS.md

> Related: [CLAUDE.md](./CLAUDE.md) · [ARCHITECTURE.md](./ARCHITECTURE.md) ·
> [ABSTRACTIONS.md](./ABSTRACTIONS.md) · [WIREFRAMES.md](./WIREFRAMES.md)

> How AI agents (Claude Code, Cursor, Copilot, etc.) should behave in this repo.

---

## Agent Roles

Define which agent handles which concern. Use these as system-prompt personas
when spawning sub-agents or task-specific sessions.

### 1. `migration-agent`

**Scope**: Schema changes only.  
**Input**: Feature description or data model sketch.  
**Output**: `db/migrate/TIMESTAMP_*.rb` + any model association/validation
changes.  
**Rules**:

- Always add indexes on foreign keys
- Never use `change_column` on a column with existing data without a safe
  migration strategy
- Add `null: false` + database-level constraints whenever the column is required
- Output a rollback-safe `down` method

### 2. `api-agent`

**Scope**: Rails controllers, serializers, routes, policies.  
**Input**: Feature spec + existing models.  
**Output**: RESTful endpoint(s) under `api/v1/`, Pundit policy, serializer,
RSpec request spec.  
**Rules**:

- Always return paginated collections (`Kaminari`)
- Use `render json:` with explicit status codes
- Never expose raw `id` without authorization check
- Wrap mutations in `ActiveRecord::Base.transaction`

### 3. `service-agent`

**Scope**: Business logic POROs in `app/services/`.  
**Input**: What the feature _does_ (verb + noun).  
**Output**: Service class + unit spec.  
**Rules**:

- Services return a result object:
  `OpenStruct.new(success?: true, payload: ..., errors: [])`
- No Rails-specific dependencies (no `render`, no `params`)
- One public method: `call`
- Side-effects (Twilio, Pub/Sub) go behind injected adapters so they can be
  stubbed in tests

### 4. `job-agent`

**Scope**: Sidekiq workers in `app/jobs/`.  
**Input**: What needs to run async + retry strategy.  
**Output**: Job class + spec (using `sidekiq_fake` or
`perform_enqueued_jobs`).  
**Rules**:

- Always set `sidekiq_options queue:, retry:, dead:`
- Job args must be primitives only (no AR objects — pass IDs)
- Log job start/finish at INFO; errors at ERROR
- Handle idempotency: running the job twice must not double-send a message

### 5. `frontend-agent`

**Scope**: React feature modules under `web/src/features/`.  
**Input**: API contract (endpoint + response shape) + user story.  
**Output**: Feature folder with `index.tsx`, `use<Feature>.ts`, and component
files.  
**Rules**:

- Use React Query (`@tanstack/react-query`) for server state
- Use Zustand only for UI/session state (not server data)
- All forms use `react-hook-form` + `zod` schemas
- Never fetch directly in a component — always through a custom hook
- Every component exports a `<ComponentName.stories.tsx>` for Storybook

### 6. `test-agent`

**Scope**: Any missing test coverage.  
**Input**: File path + coverage report.  
**Output**: Specs/tests only — no production code changes.  
**Rules**:

- RSpec: prefer `let` over instance variables, use `subject` for the SUT
- Factory associations: use `association` helper, not `create` inside `let`
- Vitest: colocate `*.test.tsx` next to the component
- Mock Twilio and GCP calls at the adapter layer, never with
  `allow_any_instance_of`

---

## Agent Workflow: Shipping a Feature End-to-End

```
User Story
    │
    ▼
migration-agent ──► schema + model
    │
    ▼
service-agent ──► business logic (pure Ruby)
    │
    ▼
job-agent ──► async wrapper (if needed)
    │
    ▼
api-agent ──► HTTP endpoint + policy + serializer
    │
    ▼
frontend-agent ──► React hook + components + page
    │
    ▼
test-agent ──► fill coverage gaps
    │
    ▼
PR ready
```

---

## Agent Ground Rules (all agents)

1. **Read before writing.** Run `cat` or `find` to understand existing patterns
   before generating new files. Match the style of what's already there.
2. **No orphan files.** Every new file must be wired into its parent (route,
   index export, spec helper) in the same diff.
3. **Compliance checkpoint.** Before any message-sending code, assert consent
   check presence. If it's missing, add it and note it explicitly.
4. **Explain the diff.** End every agent response with a brief "What changed and
   why" summary (3–5 bullets).
5. **Stop and ask** when a decision has irreversible data consequences
   (destructive migration, schema rename, deletion of records).

---

## Spawning Sub-Agents with Claude Code

```bash
# Run a scoped agent on a specific task
claude --system-prompt "You are the migration-agent. Rules: $(cat AGENTS.md)" \
  "Add scheduled_at column to messages table, index on [patient_id, scheduled_at]"

# Chain agents via pipe
claude migration-agent "Add consent_logs table" | claude api-agent "Expose POST /api/v1/consent_logs"
```

---

## What Agents Must NOT Do

- Modify `db/schema.rb` directly — it is auto-generated
- Add gems without updating both `Gemfile` and `Gemfile.lock` (run
  `bundle install`)
- Remove or weaken existing Pundit policies
- Bypass the service layer by putting business logic in controllers
- Commit secrets, API keys, or PHI to the repo
