"use client";

import { useState, useMemo } from "react";
import {
  AppShell,
  TopBar,
  Sidebar,
  NavItem,
  NavSection,
  NavDivider,
  PageHeader,
  Card,
  Button,
  Input,
  Select,
  Grid,
  Stack,
  DataTable,
  type Column,
  StatusBadge,
  type AnyStatus,
  SlideOver,
  FormField,
  RadioGroup,
  MessageBodyEditor,
  TimezoneSelect,
  type TemplateVariable,
  ProgressBar,
  EmptyState,
} from "@/components";
import { MiniStat } from "@/components/data-display/MiniStat/MiniStat";
import { MessagePreview } from "@/components/data-display/MessagePreview/MessagePreview";
import {
  DeliveryLog,
  type DeliveryLogItem,
} from "@/components/data-display/DeliveryLog/DeliveryLog";

/* ─────────────────────────────────────────────────────────────────────────────
   CampaignListPage
   Faithful extraction of prototypes/campaigns.html into React components.
   All data is hardcoded — replace with React Query hooks in production.
───────────────────────────────────────────────────────────────────────────── */

// ── Types ─────────────────────────────────────────────────────────────────

interface Campaign {
  id: number;
  name: string;
  program: string;
  status: AnyStatus;
  scheduled: string;
  patients: number;
  delivered: number;
  failed: number;
  pending: number;
  optedOut: number;
  deliveryPct: number;
  msg: string;
}

// ── Static Data ───────────────────────────────────────────────────────────

const CAMPAIGNS: Campaign[] = [
  {
    id: 1,
    name: "A1C Recall — Spring",
    program: "Diabetes",
    status: "running",
    scheduled: "Apr 28, 9:00 AM",
    patients: 234,
    delivered: 219,
    failed: 8,
    pending: 7,
    optedOut: 2,
    deliveryPct: 94,
    msg: "Hi {{first_name}}, this is Sunset Clinic. Your A1C test is due. Call us at (415) 555-0100 or reply STOP to unsubscribe.",
  },
  {
    id: 2,
    name: "SDOH Screening Q2",
    program: "SDOH",
    status: "scheduled",
    scheduled: "May 22, 2:00 PM",
    patients: 89,
    delivered: 0,
    failed: 0,
    pending: 89,
    optedOut: 0,
    deliveryPct: 0,
    msg: "Hi {{first_name}}, Sunset Clinic is reaching out about your health and wellness. We have resources that may help. Reply STOP to opt out.",
  },
  {
    id: 3,
    name: "Flu Shot Reminder",
    program: "Preventive",
    status: "completed",
    scheduled: "Apr 22, 10:00 AM",
    patients: 412,
    delivered: 404,
    failed: 5,
    pending: 0,
    optedOut: 3,
    deliveryPct: 98,
    msg: "Hi {{first_name}}, flu season is here! Sunset Clinic is offering free flu shots. Call (415) 555-0100 to schedule. Reply STOP to unsubscribe.",
  },
  {
    id: 4,
    name: "Appointment Confirm",
    program: "Care Mgmt",
    status: "running",
    scheduled: "May 20, 9:00 AM",
    patients: 67,
    delivered: 51,
    failed: 2,
    pending: 14,
    optedOut: 0,
    deliveryPct: 76,
    msg: "Hi {{first_name}}, this is a reminder about your upcoming appointment at Sunset Clinic. Reply CONFIRM to confirm or STOP to opt out.",
  },
  {
    id: 5,
    name: "Diabetes Check-in",
    program: "Diabetes",
    status: "paused",
    scheduled: "May 15, 11:00 AM",
    patients: 156,
    delivered: 98,
    failed: 4,
    pending: 54,
    optedOut: 0,
    deliveryPct: 63,
    msg: "Hi {{first_name}}, your care team at Sunset Clinic is checking in. How are your blood sugar levels? Reply STOP to unsubscribe.",
  },
  {
    id: 6,
    name: "New Patient Welcome",
    program: "Care Mgmt",
    status: "draft",
    scheduled: "—",
    patients: 0,
    delivered: 0,
    failed: 0,
    pending: 0,
    optedOut: 0,
    deliveryPct: 0,
    msg: "Welcome to Sunset Clinic, {{first_name}}! We are glad to have you. Reply STOP to opt out.",
  },
  {
    id: 7,
    name: "Mammogram Outreach",
    program: "Preventive",
    status: "scheduled",
    scheduled: "Jun 1, 9:00 AM",
    patients: 203,
    delivered: 0,
    failed: 0,
    pending: 203,
    optedOut: 0,
    deliveryPct: 0,
    msg: "Hi {{first_name}}, Sunset Clinic recommends scheduling your annual mammogram. Call us at (415) 555-0100. Reply STOP to opt out.",
  },
  {
    id: 8,
    name: "BP Monitoring Q1",
    program: "Diabetes",
    status: "completed",
    scheduled: "Mar 10, 8:00 AM",
    patients: 88,
    delivered: 82,
    failed: 3,
    pending: 0,
    optedOut: 3,
    deliveryPct: 93,
    msg: "Hi {{first_name}}, please remember to log your blood pressure readings this week. Reply STOP to unsubscribe.",
  },
];

const DELIVERY_LOG: DeliveryLogItem[] = [
  {
    name: "Jane D. (#4421)",
    phone: "•••-•••-1234",
    status: "delivered",
    time: "09:02 AM",
  },
  {
    name: "Marcus T. (#891)",
    phone: "•••-•••-5678",
    status: "failed",
    time: "09:02 AM",
  },
  {
    name: "Rosa M. (#2201)",
    phone: "•••-•••-9012",
    status: "delivered",
    time: "09:03 AM",
  },
  {
    name: "David K. (#3341)",
    phone: "•••-•••-3456",
    status: "delivered",
    time: "09:04 AM",
  },
  {
    name: "Priya S. (#5512)",
    phone: "•••-•••-7890",
    status: "opted_out",
    time: "09:05 AM",
  },
];

const TEMPLATE_VARIABLES: TemplateVariable[] = [
  { key: "first_name", label: "First name" },
  { key: "clinic_name", label: "Clinic name" },
  { key: "phone", label: "Phone" },
];

// ── Logo ──────────────────────────────────────────────────────────────────

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

// ── Sidebar Icons ─────────────────────────────────────────────────────────

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

// ── TopBar Actions ────────────────────────────────────────────────────────

function TopBarActions() {
  return (
    <div className="flex items-center gap-3">
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
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-[11px] font-semibold text-green-800 cursor-pointer hover:bg-green-200 transition-colors">
        AC
      </div>
    </div>
  );
}

// ── Campaign Detail Panel ─────────────────────────────────────────────────

function CampaignDetailPanel({ campaign }: { campaign: Campaign | null }) {
  if (!campaign) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-neutral-400">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M8 13V9m8 4V9M6 18h12M8 5h8" />
        </svg>
        <span className="text-sm">Click a campaign to view details</span>
      </div>
    );
  }

  const c = campaign;
  const hasLog = c.status !== "draft" && c.status !== "scheduled";

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {/* Status + meta */}
      <div className="flex items-center gap-2 mb-3">
        <StatusBadge status={c.status} />
        <span className="text-xs text-neutral-400">
          {c.program} · {c.scheduled}
        </span>
      </div>

      {/* Mini stats */}
      <Grid cols={2} gap="2" className="mb-1">
        <MiniStat value={c.patients} label="Total patients" />
        <MiniStat
          value={c.delivered}
          label="Delivered"
          valueColor="text-brand-600"
        />
        <MiniStat value={c.failed} label="Failed" valueColor="text-red-600" />
        <MiniStat
          value={c.pending}
          label="Pending"
          valueColor="text-blue-600"
        />
      </Grid>

      {/* Progress bar */}
      {c.patients > 0 && (
        <div className="mt-2 mb-4">
          <ProgressBar
            value={c.deliveryPct}
            label="Delivery progress"
            showValue
          />
        </div>
      )}

      {/* Message preview */}
      <div className="mb-4">
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
          Message preview
        </div>
        <MessagePreview>{c.msg}</MessagePreview>
      </div>

      {/* Delivery log */}
      {hasLog && (
        <div>
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Delivery log
          </div>
          <DeliveryLog items={DELIVERY_LOG} />
        </div>
      )}
    </div>
  );
}

// ── Detail Action Buttons ─────────────────────────────────────────────────

function DetailActions({ campaign }: { campaign: Campaign | null }) {
  if (!campaign) return null;
  const c = campaign;

  if (c.status === "running" || c.status === "scheduled") {
    return (
      <div className="flex gap-1.5">
        <Button
          variant="secondary"
          size="sm"
          leftIcon={
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
              <path d="M11.5 2.5l2 2-2 2" />
              <path d="M2.5 8h11" />
              <path d="M4 11.5l-2 2 2 2" />
              <path d="M13.5 8h-11" />
            </svg>
          }
        >
          Edit
        </Button>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={
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
              <rect x="3" y="3" width="10" height="10" rx="1" />
              <path d="M6 6h4" />
            </svg>
          }
        >
          Pause
        </Button>
      </div>
    );
  }
  if (c.status === "paused") {
    return (
      <div className="flex gap-1.5">
        <Button
          variant="secondary"
          size="sm"
          leftIcon={
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
              <path d="M4 2l10 6-10 6V2z" />
            </svg>
          }
        >
          Resume
        </Button>
        <Button
          variant="destructive"
          size="sm"
          leftIcon={
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
              <path d="M2 4h12" />
              <path d="M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
              <path d="M6 7v4M10 7v4" />
              <path d="M3 4l1 9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-9" />
            </svg>
          }
        >
          Delete
        </Button>
      </div>
    );
  }
  if (c.status === "draft") {
    return (
      <div className="flex gap-1.5">
        <Button
          variant="primary"
          size="sm"
          leftIcon={
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
              <path d="M2 12l3-3 2 2 4-4 3 3" />
              <path d="M12 6h2v2" />
            </svg>
          }
        >
          Schedule
        </Button>
        <Button
          variant="destructive"
          size="sm"
          leftIcon={
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
              <path d="M2 4h12" />
              <path d="M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
              <path d="M6 7v4M10 7v4" />
              <path d="M3 4l1 9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-9" />
            </svg>
          }
        >
          Delete
        </Button>
      </div>
    );
  }
  // completed / failed
  return (
    <Button
      variant="secondary"
      size="sm"
      leftIcon={
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
          <rect x="3" y="3" width="10" height="10" rx="1" />
          <path d="M6 6h4M6 8h3" />
        </svg>
      }
    >
      Duplicate
    </Button>
  );
}

// ── New Campaign Form ─────────────────────────────────────────────────────

function NewCampaignForm({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [msgBody, setMsgBody] = useState(
    "Hi {{first_name}}, this is Sunset Clinic. Your A1C test is due. Call us at (415) 555-0100 or reply STOP to unsubscribe.",
  );

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title="New campaign"
      description="Schedule an outreach campaign for your patients"
      width="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Save as draft
          </Button>
          <Button
            leftIcon={
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
                <rect x="2" y="2" width="12" height="12" rx="1" />
                <path d="M5 2v12M11 2v12M2 8h12" />
              </svg>
            }
            onClick={onClose}
          >
            Schedule campaign
          </Button>
        </>
      }
    >
      <Stack gap="5">
        {/* Campaign name */}
        <FormField label="Campaign name" htmlFor="campaign-name" required>
          <Input
            id="campaign-name"
            placeholder="e.g. A1C Recall — Spring 2026"
          />
        </FormField>

        {/* Program */}
        <FormField label="Program" htmlFor="campaign-program" required>
          <Select id="campaign-program" defaultValue="">
            <option value="" disabled>
              Select a program…
            </option>
            <option>Diabetes Care</option>
            <option>SDOH Screening</option>
            <option>Preventive Care</option>
            <option>Care Management</option>
          </Select>
        </FormField>

        {/* Channel */}
        <FormField label="Channel" htmlFor="campaign-channel" required>
          <RadioGroup
            name="channel"
            value="sms"
            onChange={() => {}}
            options={[
              { value: "sms", label: "SMS" },
              { value: "voice", label: "Voice" },
            ]}
          />
        </FormField>

        {/* Message body */}
        <FormField label="Message body" htmlFor="campaign-message" required>
          <MessageBodyEditor
            id="campaign-message"
            value={msgBody}
            onChange={(e) => setMsgBody(e.target.value)}
            variables={TEMPLATE_VARIABLES}
          />
        </FormField>

        {/* Schedule */}
        <FormField label="Schedule" htmlFor="campaign-date" required>
          <Grid cols={2} gap="2">
            <Input id="campaign-date" type="date" defaultValue="2026-05-28" />
            <Input type="time" defaultValue="09:00" />
          </Grid>
          <div className="mt-1.5">
            <TimezoneSelect
              id="campaign-timezone"
              defaultValue="America/Los_Angeles"
            />
          </div>
        </FormField>

        {/* Recipients */}
        <FormField label="Recipients" htmlFor="campaign-recipients" required>
          <Select id="campaign-recipients" defaultValue="all">
            <option value="all">All enrolled patients</option>
            <option value="a1c">Patients due for A1C (last 6 mo)</option>
            <option value="custom">Custom segment…</option>
          </Select>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500">
            <svg
              width="13"
              height="13"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-brand-600"
            >
              <circle cx="8" cy="7" r="3" />
              <path d="M2 14v-1a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1" />
            </svg>
            <strong className="text-neutral-700">234 patients</strong> will
            receive this message
          </div>
        </FormField>
      </Stack>
    </SlideOver>
  );
}

// ── Page Component ────────────────────────────────────────────────────────

export function CampaignListPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchVal, setSearchVal] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [slideOverOpen, setSlideOverOpen] = useState(false);

  const filtered = useMemo(() => {
    return CAMPAIGNS.filter((c) => {
      const matchesSearch = c.name
        .toLowerCase()
        .includes(searchVal.toLowerCase());
      const matchesStatus = !statusFilter || c.status === statusFilter;
      const matchesProgram = !programFilter || c.program === programFilter;
      return matchesSearch && matchesStatus && matchesProgram;
    });
  }, [searchVal, statusFilter, programFilter]);

  const selectedCampaign = CAMPAIGNS.find((c) => c.id === selectedId) ?? null;

  // DataTable columns
  const columns: Column<Campaign>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Name",
        width: "w-[38%]",
        cell: (c) => <span className="font-medium">{c.name}</span>,
      },
      {
        key: "program",
        header: "Program",
        width: "w-[22%]",
        cell: (c) => <span className="text-neutral-500">{c.program}</span>,
      },
      {
        key: "status",
        header: "Status",
        width: "w-[20%]",
        cell: (c) => <StatusBadge status={c.status} />,
      },
      {
        key: "scheduled",
        header: "Scheduled",
        width: "w-[20%]",
        cell: (c) => (
          <span className="text-xs text-neutral-500">{c.scheduled}</span>
        ),
      },
    ],
    [],
  );

  return (
    <AppShell
      topBar={<TopBar logo={<LogoMark />} actions={<TopBarActions />} />}
      sidebar={
        <Sidebar>
          <NavSection>Main</NavSection>
          <NavItem icon={<DashboardIcon />} label="Dashboard" />
          <NavItem icon={<CampaignIcon />} label="Campaigns" active badge={3} />
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
        title="Campaigns"
        subtitle="Manage and monitor outreach campaigns"
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
            onClick={() => setSlideOverOpen(true)}
          >
            New campaign
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="mt-4 flex items-center gap-2">
        <div className="relative flex-1 max-w-[260px]">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <Input
            type="search"
            placeholder="Search campaigns…"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="running">Running</option>
          <option value="scheduled">Scheduled</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
          <option value="draft">Draft</option>
        </Select>
        <Select
          value={programFilter}
          onChange={(e) => setProgramFilter(e.target.value)}
        >
          <option value="">All programs</option>
          <option value="Diabetes">Diabetes</option>
          <option value="SDOH">SDOH</option>
          <option value="Preventive">Preventive</option>
          <option value="Care Mgmt">Care Mgmt</option>
        </Select>
      </div>

      {/* Split panel: list + detail */}
      <div className="mt-4 grid grid-cols-2 gap-4 flex-1 min-h-0">
        {/* Campaign list */}
        <Card noPadding>
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 shrink-0">
            <span className="text-sm font-semibold text-neutral-900">
              All campaigns
            </span>
            <span className="text-xs text-neutral-400">
              {filtered.length} campaign{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="overflow-y-auto flex-1">
            <DataTable<Campaign>
              columns={columns}
              rows={filtered}
              rowKey={(c) => String(c.id)}
              onRowClick={(c) => setSelectedId(c.id)}
              emptyMessage="No campaigns match your filters."
            />
          </div>
        </Card>

        {/* Campaign detail */}
        <Card noPadding>
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 shrink-0">
            <span className="text-sm font-semibold text-neutral-900">
              {selectedCampaign?.name ?? "Select a campaign"}
            </span>
            <DetailActions campaign={selectedCampaign} />
          </div>
          <CampaignDetailPanel campaign={selectedCampaign} />
        </Card>
      </div>

      {/* New campaign SlideOver */}
      <NewCampaignForm
        open={slideOverOpen}
        onClose={() => setSlideOverOpen(false)}
      />
    </AppShell>
  );
}
