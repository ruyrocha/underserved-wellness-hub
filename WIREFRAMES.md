# WIREFRAMES.md

> Related: [CLAUDE.md](./CLAUDE.md) · [AGENTS.md](./AGENTS.md) ·
> [ARCHITECTURE.md](./ARCHITECTURE.md) · [ABSTRACTIONS.md](./ABSTRACTIONS.md)

> Text wireframes for every core screen. Each wireframe defines layout,
> component hierarchy, and interaction states — not visual design.
>
> Every element is annotated with its **component token** from
> `src/components/`. When the company's internal design system ships, only the
> component implementations change — the tokens and wireframe contracts stay
> stable.

---

## Component Token Legend

```
[Btn:primary]      primitives/Button  variant="primary"
[Btn:secondary]    primitives/Button  variant="secondary"
[Btn:ghost]        primitives/Button  variant="ghost"
[Btn:destructive]  primitives/Button  variant="destructive"
[Badge:status]     data-display/StatusBadge
[Badge:consent]    data-display/ConsentBadge
[Card]             layout/Card
[StatCard]         data-display/StatCard
[Table]            data-display/DataTable
[Field]            forms/FormField
[SlideOver]        layout/SlideOver
[Toast]            feedback/Toast
[Spinner]          primitives/Spinner
[Skeleton]         data-display/SkeletonBlock
[Empty]            data-display/EmptyState
[Alert]            feedback/Alert
[Confirm]          feedback/ConfirmDialog
[Progress]         feedback/ProgressBar
[LineChart]        charts/LineChart
[BarChart]         charts/BarChart
[Spark]            charts/SparkBar
[Feed]             data-display/ActivityFeed
[Stack]            layout/Stack
[Grid]             layout/Grid
[PageHeader]       layout/PageHeader
```

---

## Layout Shell (all authenticated pages)

```
+----------------------------------------------------------------------+
| TOPBAR                                                               |
| [= Logo]  Wellness Hub              [Org: Sunset Clinic v]  [* Ana]  |
+----------------------------------------------------------------------+
| SIDEBAR (collapsible, 240px)     |  MAIN CONTENT AREA               |
|                                  |                                   |
|  # Dashboard                     |  <page renders here>              |
|  @ Campaigns          <- active  |                                   |
|  % Patients                      |                                   |
|  ! Programs                      |                                   |
|  ~ Analytics                     |                                   |
|  ----------------                |                                   |
|  + Settings                      |                                   |
|  ? Help                          |                                   |
+----------------------------------+-----------------------------------+
```

**Component tree:**

```
AppShell                               layout/AppShell
  TopBar                               layout/TopBar
    OrgSwitcher                        primitives/Select (variant="ghost")
    UserMenu                           primitives/Button (variant="ghost") + popover
  Sidebar (collapsed={bool})           layout/Sidebar
    NavItem x N                        Sidebar internal atom
    Separator                          primitives/Separator
  main                                 page slot — children render here
```

**State:** `useUIStore.sidebarOpen` (Zustand) drives `collapsed` prop on
Sidebar.

---

## 1. Dashboard

```
+-------------------------------------------------------------+
| Good morning, Ana                         [+ New Campaign]  |  PageHeader + Btn:primary
| Sunset Clinic . April 2026                                  |
+-------------+-------------+-------------+-------------------+
| STAT CARD   | STAT CARD   | STAT CARD   | STAT CARD         |  Grid (cols=4) > StatCard x4
|             |             |             |                   |
| 12,430      | 847         | 94.2%       | 23                |
| Patients    | Msgs Today  | Delivery    | Active Campaigns  |
| reached     |             | Rate        |                   |
+-------------+-------------+-------------+-------------------+
| DELIVERY TREND (line chart, last 30 days)                   |  Card > LineChart
|                                                             |
|  _/\  /\/\__/\  /\/\                                       |
|  Apr 1                               Apr 28                 |
+----------------------------+--------------------------------+
| UPCOMING CAMPAIGNS         | RECENT ACTIVITY               |  Grid (cols=2)
|                            |                               |
| * Diabetes Reminder        | 09:14  Campaign "A1C Recall"  |  Card > Stack      Card > Feed
|   Tomorrow 9:00 AM         |        launched - 234 sent    |
|   234 patients             |                               |
|                            | 08:52  Patient #8821          |
| * SDOH Screening           |        opted out via STOP     |
|   Wed 2:00 PM              |                               |
|   89 patients              | 08:31  Campaign "Flu Shot"    |
|                            |        completed - 98.1%      |
| [View all ->]              | [View all ->]                 |  Btn:ghost (size=sm)
+----------------------------+--------------------------------+
```

**Loading state:** StatCard and Card regions replaced with `Skeleton` until
React Query resolves.

**StatCard props example:**

```
label="Patients reached"  value="12,430"  trend={ direction:"up",     label:"+8% MoM" }
label="Messages Today"    value="847"     trend={ direction:"up",     label:"+5% MoM" }
label="Delivery Rate"     value="94.2%"   trend={ direction:"up",     label:"+0.4pp"  }
label="Active Campaigns"  value="23"      trend={ direction:"neutral", label:""        }
```

---

## 2. Campaign List

```
+-------------------------------------------------------------+
| Campaigns                               [+ New Campaign]    |  PageHeader + Btn:primary
+-------------------------------------------------------------+
| [All v]  [Status: All v]  [Program: All v]   [Search...]   |  Select x3 + Input(type=search)
+--------------------------------------------------------------+
| NAME                   PROGRAM      STATUS     SCHEDULED     |
+--------------------------------------------------------------+  Table
| A1C Recall - April     Diabetes     * Running  Apr 28, 9AM  |  col: text | text | Badge:status | text
| Flu Shot Reminder      Preventive   . Done     Apr 22       |
| SDOH Check-in Q2       SDOH         o Draft    -            |
| Appointment Confirm    Care Mgmt    ~ Sched.   May 1, 2PM   |
+--------------------------------------------------------------+
|                              < 1 2 3 ... 8 >  Showing 1-25  |  Pagination (Table footer slot)
+-------------------------------------------------------------+
```

**Status symbol key (ASCII stand-ins for colored badge dots):**

```
* Running    ~ Scheduled    o Draft    . Completed    x Failed
```

**Interactions:**

- Row `onRowClick` -> navigate to Campaign Detail
- `[+ New Campaign]` -> open `SlideOver` (Campaign Form)
- Status badge click -> set `status` filter on `useCampaigns()`
- Zero results -> `Empty` with action button:
  `Btn:primary "Create your first campaign"`

---

## 3. Campaign Detail

```
+-------------------------------------------------------------+
| <- Campaigns   A1C Recall - April        [Edit]  [More v]  |  PageHeader
|                * Running . Diabetes . Apr 28, 9:00 AM PST  |  Btn:secondary + Btn:ghost (dropdown)
+--------------------+----------------------------------------+
| STATS              | ACTIONS                                |  Grid (cols=2)
|                    |                                        |
| 234  Total         |  [|| Pause Campaign]                   |  Card > Stack      Card > Stack
| 219  Delivered     |  [[] Duplicate]                        |  StatCard x5       Btn:secondary x2
|   8  Failed        |  [x  Delete]   (disabled if !draft)   |                    Btn:destructive
|   7  Pending       |                                        |
|   2  Opted out     |                                        |
+--------------------+----------------------------------------+
| MESSAGE PREVIEW                                             |  Card
| +-----------------------------------------------------------+|
| | "Hi {{first_name}}, this is Sunset Clinic. Your A1C     ||  Textarea (disabled/readonly)
| |  test is due. Call (415) 555-0100 or reply STOP."       ||
| +-----------------------------------------------------------+|
+-------------------------------------------------------------+
| DELIVERY LOG                          [Search status v]     |  Card > Table
+--------------------------------------------------------------+  col: text | masked-text | Badge:status | text
| PATIENT          PHONE         STATUS      TIME             |
| Jane D. (#4421)  ...-...-1234  . Delivered 09:02 AM        |
| Marcus T. (#891) ...-...-5678  x Failed    09:02 AM        |
| Rosa M. (#2201)  ...-...-9012  . Delivered 09:03 AM        |
+-------------------------------------------------------------+
```

**Pause and Delete flows open `ConfirmDialog` before calling mutation.** Phone
numbers masked — shows last 4 digits only.

---

## 4. New / Edit Campaign — SlideOver Form

```
                         +--------------------------------+
                         | New Campaign              [x] |  SlideOver (width="md")
                         +--------------------------------+
                         | Campaign Name *                |  Field > Input
                         | +----------------------------+ |
                         | | A1C Recall - April         | |
                         | +----------------------------+ |
                         |                               |
                         | Program *                     |  Field > Select
                         | +----------------------------+ |
                         | | Diabetes Care            v | |
                         | +----------------------------+ |
                         |                               |
                         | Channel *                     |  Field > RadioGroup
                         | (*) SMS   ( ) Voice           |
                         |                               |
                         | Message Body *   [142/160 SMS]|  Field > MessageBodyEditor
                         | +----------------------------+ |  (Textarea + char counter + variable chips)
                         | | Hi {{first_name}},        | |
                         | | ...                       | |
                         | +----------------------------+ |
                         | Insert: {{first_name}}         |  chip Btn:ghost x N -> appends to body
                         |         {{clinic_name}}        |
                         |         {{phone}}              |
                         |                               |
                         | Schedule                      |
                         | +---------------+ +--------+  |  Field > DatePicker + TimePicker
                         | | May 1, 2026   | | 09:00  |  |
                         | +---------------+ +--------+  |
                         | Timezone: [America/Los_Ang v]  |  Field > TimezoneSelect
                         |                               |
                         | [!] Quiet hours warning        |  Alert (variant="warning") -- conditional
                         |     TCPA: outside 8AM-9PM      |
                         |                               |
                         | Recipients                    |  Field > RecipientPicker
                         | +----------------------------+ |
                         | | All enrolled patients    v | |
                         | +----------------------------+ |
                         | 234 patients will receive this |  hint text below Field
                         |                               |
                         | [!] No consented patients      |  Alert (variant="error") -- conditional
                         +--------------------------------+
                         | [Save Draft]   [Schedule ->]  |  SlideOver footer slot
                         +--------------------------------+  Btn:secondary + Btn:primary
```

**Submit flow:**

1. `[Schedule ->]` calls `useLaunchCampaign()` mutation
2. Button enters `loading` state (disabled + Spinner inline)
3. Success -> `toast.success("Campaign scheduled")` -> close SlideOver ->
   invalidate campaigns query
4. Error -> `toast.error(message)` -> keep SlideOver open; errors appear in
   FormField `error` prop

**Validation triggers (Zod + react-hook-form, real-time):**

- Name required
- Body 1-1600 chars; `Alert:warning` at each 160-char SMS segment boundary
- Schedule must be future; `Alert:warning` if within TCPA quiet hours
  (21:00-08:00 patient timezone)
- Recipients must resolve >= 1 consented patient; `Alert:error` if zero

---

## 5. Patient List

```
+-------------------------------------------------------------+
| Patients                                   [^ Import CSV]   |  PageHeader + Btn:secondary
+-------------------------------------------------------------+
| [Search name, MRN...]  [Consent: All v]  [Program: All v]  |  Input(search) + Select x2
+--------------------------------------------------------------+  Table
| NAME            MRN       CONSENT   PROGRAMS        MSGS   |  col: text | text | Badge:consent | text | num
+--------------------------------------------------------------+
| Jane Doe        MRN-4421  + SMS     Diabetes, Care   14   |
| Marcus Torres   MRN-0891  x Opted   -                 3   |
| Rosa Martinez   MRN-2201  + SMS     SDOH              7   |
+--------------------------------------------------------------+
|                              < 1 2 ... 47 >  1,163 patients |  Pagination (Table footer slot)
+-------------------------------------------------------------+
```

**Import CSV flow:** `[^ Import CSV]` -> `SlideOver` with file dropzone + column
mapping step + `Progress` bar during upload.

---

## 6. Patient Detail

```
+-------------------------------------------------------------+
| <- Patients   Jane Doe . MRN-4421          [Edit Patient]  |  PageHeader + Btn:secondary
+--------------+----------------------------------------------+
| PROFILE      | CONSENT STATUS                               |  Grid (cols=2)
|              |                                              |
| DOB: XX/XX   | SMS:   + Opted In  (Apr 3, 2025)            |  Card > Stack      Card > Stack
| Lang: EN     | Voice: x No record                          |                    Badge:consent x2
| MRN: 4421    |                                              |
|              | Consent Log:                                 |  Feed (consent events, newest first)
| Programs:    |  Apr 3   Opted in via web form               |
|  . Diabetes  |  Feb 14  STOP received - opted out          |
|  . Care Mgmt |  Jan 22  Opted in via IVR                   |
+--------------+----------------------------------------------+
| MESSAGE HISTORY                                             |  Card > Table
+--------------------------------------------------------------+  col: date | text(link) | Badge:status | channel
| DATE          CAMPAIGN              STATUS      CHANNEL     |
| Apr 28 9:02   A1C Recall - April    . Delivered  SMS       |
| Apr 10 2:00   Appointment Confirm   . Delivered  SMS       |
| Mar 22 9:00   Flu Shot Reminder     x Failed     SMS       |
+-------------------------------------------------------------+
```

**Privacy rules (enforced via helper components, not ad-hoc string
formatting):**

```
PatientDOB   renders MM/DD only (year hidden from all roles)
MaskedPhone  renders ...-...-XXXX (last 4 only; no role can see full number in UI)
MessageBody  column hidden by default; visible only to admin role via useCurrentUser().role
```

---

## 7. Analytics Dashboard

```
+-------------------------------------------------------------+
| Analytics              [Last 30 days v]  [Export CSV]       |  PageHeader
|                                                             |  Select (date range) + Btn:secondary
+--------------+--------------+--------------+----------------+
| MESSAGES     | DELIVERY     | OPT-OUT      | RESPONSE       |  Grid (cols=4) > StatCard x4
| SENT         | RATE         | RATE         | RATE           |
|              |              |              |                |
| 8,432        | 96.1%        | 0.8%         | 14.3%          |
| ^ +12% MoM   | ^ +1.2pp     | v -0.2pp     | ^ +2.1pp       |
+--------------+--------------+--------------+----------------+
| DELIVERY RATE BY PROGRAM                                    |  Card > BarChart
|                                                             |
| Diabetes     ||||||||||||||||..  97.2%                      |
| SDOH         |||||||||||||||...  95.8%                      |
| Preventive   ||||||||||||||||..  96.4%                      |
| Appointments ||||||||||||||....  93.1%                      |
+--------------------------------------------------------------+
| OPT-OUT TREND  (line chart, daily)                          |  Card > LineChart
|  1.2% \                                                     |
|        \/  /\                                               |
|  0.8%    \/  \____________________________________          |
|        Apr 1                              Apr 28            |
+-------------------------------------------------------------+
```

---

## Component States Reference

Every component must handle all states listed. Implement `loading` / `empty` /
`error` at the **page level** via React Query flags — not scattered inside child
components.

| Component             | States                                                           |
| --------------------- | ---------------------------------------------------------------- |
| `StatusBadge`         | `draft` `scheduled` `running` `paused` `completed` `failed`      |
| `ConsentBadge`        | `opted_in` `opted_out` `unknown`                                 |
| Message status column | `pending` `queued` `sent` `delivered` `failed` `opted_out`       |
| `Button`              | `default` `hover` `focus` `loading` `disabled` `destructive`     |
| `FormField` + inputs  | `default` `focused` `error` `disabled`                           |
| `DataTable`           | `loading` (Skeleton rows) `empty` (EmptyState) `populated`       |
| `StatCard`            | `loading` (shimmer placeholder) `populated`                      |
| `SlideOver`           | `closed` `open` `submitting` (footer buttons disabled + Spinner) |
| Page-level            | `loading` `error` (Alert:error + retry Btn) `empty` `populated`  |

---

## Responsive Breakpoints

| Breakpoint   | Layout changes                                                                                             |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| `< 768px`    | Sidebar hidden; hamburger opens full-sheet overlay; Grid cols collapse to 1; Table hides secondary columns |
| `768-1024px` | Sidebar icon-only (48px); Grid cols = 2; SlideOver full-width                                              |
| `> 1024px`   | Full sidebar (240px); Grid cols = 4; SlideOver 540px                                                       |

Tailwind mapping: `sm:` (640) . `md:` (768) . `lg:` (1024) . `xl:` (1280). Grid
and Stack components accept responsive `cols` props:
`cols={{ base:1, md:2, lg:4 }}`.

---

## Component Composition Map

Which design system components appear on each screen — useful for scoping
implementation sprints.

```
Screen            Primitives        Layout           Data Display       Forms              Feedback
-----------------------------------------------------------------------------------------------------------
Layout Shell      Button            AppShell         -                  -                  Toast
                  Separator         Sidebar
                                    TopBar

Dashboard         Button            PageHeader       StatCard x4        -                  -
                                    Card x3          LineChart
                                    Grid             ActivityFeed
                                    Stack

Campaign List     Button            PageHeader       DataTable          Input(search)       -
                  Select            Card             StatusBadge        Select x2

Campaign Detail   Button            PageHeader       DataTable          -                  ConfirmDialog
                                    Card x3          StatusBadge                            Toast
                                    Grid

New Campaign      Button            SlideOver        -                  Field x6            Alert (x2)
                  Spinner                                               MessageBodyEditor   Toast
                                                                        DatePicker
                                                                        TimePicker
                                                                        TimezoneSelect
                                                                        RecipientPicker

Patient List      Button            PageHeader       DataTable          Input(search)       -
                                    Card             ConsentBadge       Select x2

Patient Detail    Button            PageHeader       DataTable          -                  -
                                    Card x3          ConsentBadge
                                    Grid             ActivityFeed

Analytics         Button            PageHeader       StatCard x4        Select              -
                  Select            Card x3          LineChart
                                    Grid             BarChart
```
