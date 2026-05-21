# WIREFRAMES.md

> Related: [CLAUDE.md](./CLAUDE.md) · [AGENTS.md](./AGENTS.md) ·
> [ARCHITECTURE.md](./ARCHITECTURE.md) · [ABSTRACTIONS.md](./ABSTRACTIONS.md)

The visual source of truth for Wellness Hub is the **hi-fi prototype** in
[`prototypes/`](./prototypes/). That folder is what gets shown to stakeholders,
PMs, and Design. This document exists for three things only: screen inventory,
open design questions that need resolution before implementation, and the
component map that bridges prototype → React code.

Do not maintain ASCII wireframes here. If a screen changes, update the prototype
HTML and the open questions below.

---

## Prototypes

Open any file directly in a browser — no build step, no server needed.

| Screen                                     | File                                                     | Status     |
| ------------------------------------------ | -------------------------------------------------------- | ---------- |
| Dashboard                                  | [prototypes/dashboard.html](./prototypes/dashboard.html) | ✓ Done     |
| Campaign List + Detail + New Campaign form | [prototypes/campaigns.html](./prototypes/campaigns.html) | ✓ Done     |
| Patient List + Detail                      | [prototypes/patients.html](./prototypes/patients.html)   | ⏳ Pending |
| Analytics                                  | [prototypes/analytics.html](./prototypes/analytics.html) | ⏳ Pending |

---

## Open design questions

These must be resolved before the corresponding screen goes to implementation.
Each one maps to a real debate that will surface if left unanswered.

### Dashboard

- [ ] **Date range for stat cards** — are the trend indicators vs. last month,
      last 7 days, or the current program period? Where does the user configure
      this?
- [ ] **"Active campaigns" definition** — does this count `running` only, or
      `running + scheduled`?
- [ ] **Activity feed cutoff** — how many hours of history? Is there a "View
      all" destination or does it expand inline?

### Campaigns

- [ ] **List vs. detail layout** — currently a split-panel (list left, detail
      right). On smaller viewports this collapses. Should detail be a full-page
      route instead (`/campaigns/:id`)?
- [ ] **Pause vs. cancel** — are these the same action or different? Paused
      campaigns can resume; cancelled ones cannot. The prototype shows Pause. Do
      we need Cancel too?
- [ ] **Draft scheduling** — can a draft be saved without a scheduled date, or
      is date required to save?
- [ ] **Recipient count** — "234 patients will receive this message" is computed
      at form-open time. Does it recompute live as filters change, or only on
      submit?
- [ ] **Multi-segment SMS** — prototype warns at 160-char boundaries. Should it
      block submission beyond a max segment count, or just warn?

### Patients

- [ ] **Import CSV column mapping** — which columns are required? What happens
      to rows with missing phone numbers or no consent record?
- [ ] **Patient edit scope** — can care coordinators edit patient records, or is
      that admin-only?
- [ ] **MRN display** — is MRN always present? What is shown if it's absent?
- [ ] **Message history pagination** — how many rows before pagination kicks in?

### Analytics

- [ ] **Date range picker** — preset ranges only (7d, 30d, 90d) or free-range
      calendar?
- [ ] **"Response rate" metric** — what counts as a response? Any inbound SMS?
      Only specific keywords?
- [ ] **Export format** — CSV only, or PDF report too?
- [ ] **Per-program drill-down** — clicking a bar in the delivery chart: does it
      navigate to a filtered campaign list, or open an inline breakdown?

---

## Component map

How each prototype screen translates to React components. Use this when moving a
screen from prototype to implementation.

| Screen            | Key components                                                                                                   |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| Layout shell      | `AppShell` · `TopBar` · `Sidebar` · `NavItem` · `ToastContainer`                                                 |
| Dashboard         | `PageHeader` · `Grid` · `StatCard` · `Card` · `LineChart` · `BarChart` · `ActivityFeed`                          |
| Campaign list     | `PageHeader` · `DataTable` · `StatusBadge` · `Input` · `Select`                                                  |
| Campaign detail   | `Card` · `StatCard` · `ProgressBar` · `StatusBadge` · `DataTable` · `ConfirmDialog`                              |
| New campaign form | `SlideOver` · `FormField` · `Input` · `Select` · `RadioGroup` · `MessageBodyEditor` · `TimezoneSelect` · `Alert` |
| Patient list      | `PageHeader` · `DataTable` · `ConsentBadge` · `Input` · `Select` · `SlideOver` · `ProgressBar`                   |
| Patient detail    | `PageHeader` · `Grid` · `Card` · `ConsentBadge` · `ActivityFeed` · `DataTable`                                   |
| Analytics         | `PageHeader` · `Grid` · `StatCard` · `Card` · `LineChart` · `BarChart` · `Select`                                |

Component implementations live in `web/src/components/`. See
[ABSTRACTIONS.md](./ABSTRACTIONS.md) for code and usage patterns.

---

## Component states reference

Every component must handle all states. Implement `loading` / `empty` / `error`
at the page level via React Query flags — not scattered inside child components.

| Component      | States                                                                           |
| -------------- | -------------------------------------------------------------------------------- |
| `StatusBadge`  | `draft` `scheduled` `running` `paused` `completed` `failed`                      |
| `ConsentBadge` | `opted_in` `opted_out` `unknown`                                                 |
| `Button`       | `default` `hover` `focus` `loading` `disabled` `destructive`                     |
| `DataTable`    | `loading` (SkeletonBlock) · `empty` (EmptyState + optional action) · `populated` |
| `StatCard`     | `loading` (shimmer) · `populated`                                                |
| `SlideOver`    | `closed` · `open` · `submitting` (footer buttons disabled + Spinner)             |
| Page           | `loading` · `error` (Alert + retry) · `empty` · `populated`                      |
