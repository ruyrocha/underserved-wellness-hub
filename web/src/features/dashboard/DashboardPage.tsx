"use client";

import {
  AppShell,
  TopBar,
  Sidebar,
  NavItem,
  NavSection,
  NavDivider,
  PageHeader,
  Grid,
  StatCard,
  Card,
  Button,
  ActivityFeed,
  type FeedItem,
} from "@/components";
import {
  LineChart,
  type LineChartDataPoint,
} from "@/components/charts/LineChart/LineChart";
import {
  DeliveryBarChart,
  type BarChartDataItem,
} from "@/components/charts/BarChart/BarChart";
import { CampaignListItem } from "@/components/data-display/CampaignListItem/CampaignListItem";

/* ─────────────────────────────────────────────────────────────────────────────
   DashboardPage
   Faithful extraction of prototypes/dashboard.html into React components.
   All data is hardcoded here — replace with React Query hooks in production.
───────────────────────────────────────────────────────────────────────────── */

// ── Static Data (would come from API hooks in production) ──────────────────

const STATS = [
  {
    label: "Patients reached",
    value: "12,430",
    trend: { direction: "up" as const, label: "+8% vs last month" },
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 12.5v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        <circle cx="8" cy="4" r="2.5" />
      </svg>
    ),
  },
  {
    label: "Messages today",
    value: "847",
    trend: { direction: "up" as const, label: "+5% vs yesterday" },
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 4h12v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4z" />
        <path d="M2 4l6 4 6-4" />
      </svg>
    ),
  },
  {
    label: "Delivery rate",
    value: "94.2%",
    trend: { direction: "up" as const, label: "+0.4pp this week" },
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="8" cy="8" r="6" />
        <path d="M5.5 8l2 2 3.5-3.5" />
      </svg>
    ),
  },
  {
    label: "Active campaigns",
    value: "23",
    trend: { direction: "neutral" as const, label: "3 launching this week" },
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 2l8 4-8 4V2z" />
      </svg>
    ),
  },
];

const DELIVERY_TREND_DATA: LineChartDataPoint[] = [
  88, 91, 89, 93, 90, 94, 92, 95, 93, 96, 94, 97, 95, 93, 96, 98, 94, 97, 95,
  98, 96, 99, 97, 95, 98, 96, 97, 94, 96, 94,
].map((v, i) => ({
  value: v,
  label: new Date(2026, 3, 21 + i).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  }),
}));

const PROGRAM_DELIVERY: BarChartDataItem[] = [
  { label: "Diabetes", value: 97.2 },
  { label: "SDOH", value: 95.8 },
  { label: "Preventive", value: 96.4 },
  { label: "Appt. Remind", value: 93.1 },
  { label: "Chronic Care", value: 91.7 },
];

const CAMPAIGNS = [
  {
    name: "A1C Recall — Spring",
    detail: "Tomorrow · 9:00 AM ET",
    status: "running" as const,
    count: "234 pts",
  },
  {
    name: "SDOH Screening Q2",
    detail: "Wed · 2:00 PM ET",
    status: "scheduled" as const,
    count: "89 pts",
  },
  {
    name: "Flu Shot Reminder",
    detail: "Fri · 10:00 AM ET",
    status: "scheduled" as const,
    count: "412 pts",
  },
];

const ACTIVITY_ITEMS: FeedItem[] = [
  {
    id: "1",
    time: "09:14 AM",
    message: (
      <>
        <strong>A1C Recall</strong> launched — 234 messages queued
      </>
    ),
    variant: "success",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="8" cy="8" r="6" />
        <path d="M5.5 8l2 2 3.5-3.5" />
      </svg>
    ),
  },
  {
    id: "2",
    time: "08:52 AM",
    message: (
      <>
        Patient #8821 opted out via <strong>STOP</strong> keyword
      </>
    ),
    variant: "error",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="8" cy="8" r="6" />
        <path d="M6 6l4 4M10 6l-4 4" />
      </svg>
    ),
  },
  {
    id: "3",
    time: "08:31 AM",
    message: (
      <>
        Campaign <strong>Flu Shot Q2</strong> completed — 98.1% delivered
      </>
    ),
    variant: "success",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="8" cy="8" r="6" />
        <path d="M5.5 8l2 2 3.5-3.5" />
      </svg>
    ),
  },
  {
    id: "4",
    time: "07:55 AM",
    message: (
      <>
        Patient import completed — <strong>47 new records</strong>
      </>
    ),
    variant: "default",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 2h12v12H2z" />
        <path d="M5 8h6M8 5v6" />
      </svg>
    ),
  },
  {
    id: "5",
    time: "07:20 AM",
    message: (
      <>
        3 messages failed in <strong>SDOH Screening</strong>
      </>
    ),
    variant: "warning",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="8" cy="8" r="6" />
        <path d="M8 5v3M8 10.5v.5" />
      </svg>
    ),
  },
];

// ── Logo component ────────────────────────────────────────────────────────

function LogoMark() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600">
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M7 2v5l3 3" />
          <circle cx="7" cy="7" r="5" />
        </svg>
      </div>
      <div>
        <div className="text-sm font-semibold tracking-tight text-neutral-900">
          Wellness Hub
        </div>
        <div className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">
          Patient Engagement
        </div>
      </div>
    </div>
  );
}

// ── Page Component ────────────────────────────────────────────────────────

export function DashboardPage() {
  return (
    <AppShell
      topBar={
        <TopBar
          logo={<LogoMark />}
          actions={
            <div className="flex items-center gap-3">
              {/* Org switcher */}
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs hover:bg-neutral-100 transition-colors"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 14v-1a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v1" />
                  <path d="M8 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
                </svg>
                Sunset Clinic
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <path d="M2 4l4 4 4-4" />
                </svg>
              </button>

              {/* Notification bell */}
              <button
                type="button"
                className="relative text-neutral-500 hover:text-neutral-700 transition-colors"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-red-500 border border-white" />
              </button>

              {/* Avatar */}
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-[11px] font-semibold text-green-800 cursor-pointer hover:bg-green-200 transition-colors">
                AC
              </div>
            </div>
          }
        />
      }
      sidebar={
        <Sidebar>
          <NavSection>Main</NavSection>
          <NavItem icon={<DashboardIcon />} label="Dashboard" active />
          <NavItem icon={<CampaignIcon />} label="Campaigns" badge={3} />
          <NavItem icon={<PatientsIcon />} label="Patients" />
          <NavItem icon={<ProgramsIcon />} label="Programs" />
          <NavDivider />
          <NavSection>Insights</NavSection>
          <NavItem icon={<AnalyticsIcon />} label="Analytics" />
          <NavItem icon={<ReportsIcon />} label="Reports" />
          <NavDivider />
          <NavItem icon={<SettingsIcon />} label="Settings" />
          <NavItem icon={<HelpIcon />} label="Help" />
        </Sidebar>
      }
    >
      {/* Page header */}
      <PageHeader
        title="Good morning, Ana 👋"
        subtitle="Sunset Clinic · Wednesday, May 20, 2026"
        actions={
          <Button
            leftIcon={
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <path d="M7 1v12M1 7h12" />
              </svg>
            }
          >
            New Campaign
          </Button>
        }
      />

      {/* Stat cards row */}
      <Grid cols={4} gap="3" className="mt-5">
        {STATS.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            trend={stat.trend}
            icon={stat.icon}
          />
        ))}
      </Grid>

      {/* Charts row */}
      <Grid cols={{ base: 1, lg: 2 }} gap="3" className="mt-3">
        {/* Delivery trend */}
        <Card
          header={
            <div className="flex items-center justify-between w-full">
              <span className="text-sm font-semibold text-neutral-900">
                Delivery trend
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">Last 30 days</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600 cursor-pointer hover:bg-neutral-200 transition-colors">
                  Monthly
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  >
                    <path d="M2 4l4 4 4-4" />
                  </svg>
                </span>
              </div>
            </div>
          }
        >
          <LineChart
            data={DELIVERY_TREND_DATA}
            startLabel="Apr 21"
            endLabel="May 20"
          />
        </Card>

        {/* By program */}
        <Card
          header={
            <div className="flex items-center justify-between w-full">
              <span className="text-sm font-semibold text-neutral-900">
                By program
              </span>
              <span className="text-xs text-neutral-400">Delivery rate</span>
            </div>
          }
        >
          <DeliveryBarChart data={PROGRAM_DELIVERY} />
        </Card>
      </Grid>

      {/* Bottom row */}
      <Grid cols={{ base: 1, lg: 2 }} gap="3" className="mt-3">
        {/* Upcoming campaigns */}
        <Card
          header={
            <div className="flex items-center justify-between w-full">
              <span className="text-sm font-semibold text-neutral-900">
                Upcoming campaigns
              </span>
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                3 active
              </span>
            </div>
          }
          footer={
            <a
              href="#"
              className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
            >
              View all campaigns
              <svg
                width="13"
                height="13"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </a>
          }
        >
          {CAMPAIGNS.map((c) => (
            <CampaignListItem
              key={c.name}
              name={c.name}
              detail={c.detail}
              status={c.status}
              count={c.count}
            />
          ))}
        </Card>

        {/* Recent activity */}
        <Card
          header={
            <span className="text-sm font-semibold text-neutral-900">
              Recent activity
            </span>
          }
          footer={
            <a
              href="#"
              className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
            >
              View all activity
              <svg
                width="13"
                height="13"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </a>
          }
        >
          <ActivityFeed items={ACTIVITY_ITEMS} />
        </Card>
      </Grid>
    </AppShell>
  );
}

// ── Sidebar Icons (inline SVGs matching Tabler icon style) ────────────────

function DashboardIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function CampaignIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 11l7-7 7 7" />
      <path d="M10 4v16" />
      <path d="M18 14l-3 3 3 3" />
    </svg>
  );
}

function PatientsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="7" r="4" />
      <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      <path d="M16 11h6M19 8v6" />
    </svg>
  );
}

function ProgramsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 12h-4l-2 5H10l-2-5H4" />
      <path d="M4 12l2-7h12l2 7" />
      <path d="M12 3v2" />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 20h16" />
      <path d="M6 16V12" />
      <path d="M10 16V8" />
      <path d="M14 16V4" />
      <path d="M18 16v-4" />
    </svg>
  );
}

function ReportsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}
