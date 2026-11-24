"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useUIStore } from "@/store/useUIStore";
import { useDemoDataStore } from "@/store/useDemoDataStore";
import { useT } from "@/lib/i18n/useT";
import Avatar from "@/components/ui/Avatar";
import { MiniSparkline } from "@/components/charts/ChartCard";
import { EmptyState } from "@/components/ui/StateFeedback";
import { MOCK_STUDENTS } from "@/lib/mock-data";

type RiskTier = "High" | "Moderate" | "Low";

interface MenteeCardData {
  id: string;
  code: string;
  name: string;
  risk: RiskTier;
  riskScore: number;
  attendance: number;
  concern: string;
  trend: "down" | "flat" | "up";
  sparkline: number[];
  lastInteraction: string;
  nextFollowUp: string;
  avatarUrl?: string;
}

interface FollowUpTask {
  id: string;
  studentId: string;
  studentName: string;
  task: string;
  due: string;
  channel: string;
  done: boolean;
}

const TERM_MULTIPLIERS: Record<string, { caseload: number; high: number; mod: number; safe: number; due: number; delta: number }> = {
  "Term 1, 2026": { caseload: 22, high: 7, mod: 8, safe: 7, due: 6, delta: 2 },
  "Term 2, 2026": { caseload: 24, high: 6, mod: 8, safe: 10, due: 5, delta: 0 },
  "Term 3, 2026": { caseload: 26, high: 4, mod: 9, safe: 13, due: 3, delta: -4 },
};

const BASE_MENTEES: MenteeCardData[] = [
  {
    id: "STU1001",
    code: "IT26-4091",
    name: MOCK_STUDENTS[0].name,
    risk: "High",
    riskScore: 89,
    attendance: 64.5,
    concern: "Calculus III drop (-34%) & 3 missed labs",
    trend: "down",
    sparkline: [62, 68, 74, 81, 86, 89],
    lastInteraction: "Nov 18, 2026",
    nextFollowUp: "Nov 25, 2026",
    avatarUrl: MOCK_STUDENTS[0].avatarUrl,
  },
  {
    id: "STU1002",
    code: "IT26-4092",
    name: MOCK_STUDENTS[1].name,
    risk: "High",
    riskScore: 76,
    attendance: 71.0,
    concern: "Operating Systems quiz & missed lab submissions",
    trend: "down",
    sparkline: [58, 63, 66, 72, 74, 76],
    lastInteraction: "Nov 16, 2026",
    nextFollowUp: "Nov 22, 2026",
    avatarUrl: MOCK_STUDENTS[1].avatarUrl,
  },
  {
    id: "STU1003",
    code: "IT26-4105",
    name: MOCK_STUDENTS[2].name,
    risk: "Moderate",
    riskScore: 72,
    attendance: 68.2,
    concern: "Data Structures backlog & sleep-schedule fatigue",
    trend: "flat",
    sparkline: [75, 74, 73, 71, 72, 72],
    lastInteraction: "Nov 15, 2026",
    nextFollowUp: "Nov 26, 2026",
    avatarUrl: MOCK_STUDENTS[2].avatarUrl,
  },
  {
    id: "STU1004",
    code: "IT26-4112",
    name: MOCK_STUDENTS[3].name,
    risk: "Moderate",
    riskScore: 54,
    attendance: 78.4,
    concern: "Algorithms midterm dip & late assignment flags",
    trend: "up",
    sparkline: [66, 63, 60, 58, 56, 54],
    lastInteraction: "Nov 12, 2026",
    nextFollowUp: "Nov 28, 2026",
    avatarUrl: MOCK_STUDENTS[3].avatarUrl,
  },
  {
    id: "STU1005",
    code: "IT26-4088",
    name: MOCK_STUDENTS[4].name,
    risk: "Low",
    riskScore: 28,
    attendance: 85.0,
    concern: "Stable — recovering from morning lecture absences",
    trend: "up",
    sparkline: [44, 39, 36, 33, 30, 28],
    lastInteraction: "Nov 10, 2026",
    nextFollowUp: "Dec 02, 2026",
    avatarUrl: MOCK_STUDENTS[4].avatarUrl,
  },
];

const INTERVENTION_TIMELINE = [
  {
    id: "tl-1",
    date: "Nov 25, 2026",
    title: "Re-assessment Quiz Check-in — Aarav Deshmukh",
    type: "Milestone Due",
    tone: "coral" as const,
  },
  {
    id: "tl-2",
    date: "Nov 22, 2026",
    title: "Lab TA Viva Verification — Priya Rao",
    type: "OS Lab Contract",
    tone: "amber" as const,
  },
  {
    id: "tl-3",
    date: "Nov 18, 2026",
    title: "Peer Tutoring Diagnostic Logged — Aarav Deshmukh",
    type: "Completed",
    tone: "mint" as const,
  },
  {
    id: "tl-4",
    date: "Nov 12, 2026",
    title: "Algorithms Catch-up Plan Started — Ananya Iyer",
    type: "Active",
    tone: "neutral" as const,
  },
];

const INITIAL_FOLLOW_UPS: FollowUpTask[] = [
  {
    id: "fu-1",
    studentId: "STU1001",
    studentName: "Aarav Deshmukh",
    task: "Verify Calculus III diagnostic set completion",
    due: "Due Nov 25, 2026",
    channel: "In-person check-in",
    done: false,
  },
  {
    id: "fu-2",
    studentId: "STU1002",
    studentName: "Priya Rao",
    task: "Confirm OS Lab 4 & 5 TA viva sign-off",
    due: "Due Nov 22, 2026",
    channel: "Faculty sync",
    done: false,
  },
  {
    id: "fu-3",
    studentId: "STU1003",
    studentName: "Rohan Kapoor",
    task: "Review weekly study timetable with counselor",
    due: "Due Nov 26, 2026",
    channel: "Counseling follow-up",
    done: false,
  },
  {
    id: "fu-4",
    studentId: "STU1004",
    studentName: "Ananya Iyer",
    task: "Confirm Algorithms Assignment 3 on-time upload",
    due: "Completed Nov 18, 2026",
    channel: "LMS milestone",
    done: true,
  },
];

const PAST_OUTCOMES = [
  { student: "Vikram Joshi", cohort: "IT Sem 5", intervention: "Morning Attendance Check-in", preRisk: 44, postRisk: 28, verdict: "Improved" as const },
  { student: "Ananya Iyer", cohort: "IT Sem 5", intervention: "Algorithms Peer Study Group", preRisk: 66, postRisk: 54, verdict: "Improved" as const },
  { student: "Rohan Kapoor", cohort: "IT Sem 5", intervention: "Time-Management Coaching", preRisk: 75, postRisk: 72, verdict: "In Progress" as const },
];

export default function MenteeDashboardPage() {
  const [selectedTerm, setSelectedTerm] = useState("Term 2, 2026");
  const [termOpen, setTermOpen] = useState(false);
  const [riskFilter, setRiskFilter] = useState<"All" | RiskTier>("All");
  const { addToast } = useUIStore();
  const { mentorFollowUpDone, toggleMentorFollowUp } = useDemoDataStore();
  const { t } = useT();

  const followUps = useMemo(
    () =>
      INITIAL_FOLLOW_UPS.map((f) => ({
        ...f,
        done: mentorFollowUpDone[f.id] ?? f.done,
      })),
    [mentorFollowUpDone]
  );

  const termStats = TERM_MULTIPLIERS[selectedTerm] ?? TERM_MULTIPLIERS["Term 2, 2026"];

  const filteredMentees = useMemo(() => {
    return BASE_MENTEES.map((m) => ({
      ...m,
      riskScore: Math.max(12, Math.min(96, m.riskScore + termStats.delta)),
    })).filter((m) => riskFilter === "All" || m.risk === riskFilter);
  }, [riskFilter, termStats.delta]);

  const toggleFollowUp = (id: string) => {
    const target = INITIAL_FOLLOW_UPS.find((f) => f.id === id);
    if (!target) return;
    const nextDone = toggleMentorFollowUp(id, target.done);
    addToast({
      title: nextDone ? "Follow-up completed" : "Follow-up reopened",
      message: `${target.studentName}: ${target.task}`,
      type: nextDone ? "success" : "info",
    });
  };

  const pendingFollowUpCount = followUps.filter((f) => !f.done).length;

  return (
    <div className="text-[#181D26] pb-8">
      <div className="space-y-8">
        {/* Editorial Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[12px] font-medium text-[#666D7A] uppercase tracking-wider mb-1">
              <span>Mentorship Workspace</span>
              <span>/</span>
              <span className="text-[#181D26]">Caseload Overview</span>
            </div>
            <h1 className="text-[34px] sm:text-[38px] font-normal tracking-[-0.025em] text-[#181D26] leading-tight">
              {t("Mentee Dashboard")}
            </h1>
            <p className="text-[14px] text-[#666D7A] mt-1">
              Active student caseload, risk sparklines, intervention timeline and scheduled 1-on-1 follow-ups.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <button
                type="button"
                onClick={() => setTermOpen(!termOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#181D26] rounded-[14px] border border-[#E0E2E6] hover:bg-[#F8FAFC] transition-all text-[13px] font-medium shadow-[0_2px_8px_rgba(0,0,0,0.03)] cursor-pointer"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-[#666D7A]">calendar_today</span>
                <span>{selectedTerm}</span>
                <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-[#666D7A]">expand_more</span>
              </button>
              {termOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-[16px] shadow-[0_8px_24px_rgba(0,0,0,0.08)] p-2 z-20 border border-[#E0E2E6]">
                  {Object.keys(TERM_MULTIPLIERS).map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => {
                        setSelectedTerm(term);
                        setTermOpen(false);
                        addToast({ title: `Switched view to ${term}`, type: "info" });
                      }}
                      className={`w-full text-left px-3.5 py-2 rounded-[10px] text-[13px] hover:bg-[#F7F8FA] transition-colors cursor-pointer ${
                        selectedTerm === term ? "font-semibold text-[#181D26] bg-[#F7F8FA]" : "text-[#333840]"
                      }`}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/mentor/interventions"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#181D26] hover:bg-[#333840] text-white rounded-[14px] text-[13px] font-medium shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">terminal</span>
              <span>{t("Open Caseload Workspace")}</span>
            </Link>
          </div>
        </div>

        {/* 5 Modular Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-[22px] p-5 border border-[#E0E2E6] shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-[#666D7A]">{t("Assigned Mentees")}</span>
              <div className="w-8 h-8 rounded-full bg-[#F7F8FA] flex items-center justify-center text-[#181D26]">
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">group</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-[36px] font-semibold tracking-tight text-[#181D26]">{termStats.caseload}</div>
              <span className="text-[12px] font-medium text-[#666D7A] mt-2 block">Cohort {selectedTerm}</span>
            </div>
            <div className="flex gap-1 mt-4">
              {[...Array(6)].map((_, i) => <div key={i} className="h-1.5 flex-1 rounded-full bg-[#181D26]" />)}
              {[...Array(2)].map((_, i) => <div key={i} className="h-1.5 flex-1 rounded-full bg-[#E0E2E6]" />)}
            </div>
          </div>

          <div className="bg-[#FFF8F5] rounded-[22px] p-5 border border-[#FCAB79]/40 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-[#AA2D00]">High Priority</span>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#AA2D00] shadow-sm">
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">warning</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-[36px] font-semibold tracking-tight text-[#AA2D00]">{termStats.high}</div>
              <span className="text-[12px] font-medium text-[#AA2D00] mt-2 block">
                {Math.round((termStats.high / termStats.caseload) * 100)}% of caseload · Immediate check-in
              </span>
            </div>
            <div className="flex gap-1 mt-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${
                    i < Math.max(1, Math.round((termStats.high / termStats.caseload) * 8))
                      ? "bg-[#AA2D00]"
                      : "bg-[#FCAB79]/40"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[22px] p-5 border border-[#E0E2E6] shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-[#666D7A]">Moderate Risk</span>
              <div className="w-8 h-8 rounded-full bg-[#FFF9E5] flex items-center justify-center text-[#D9A441]">
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">error_outline</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-[36px] font-semibold tracking-tight text-[#181D26]">{termStats.mod}</div>
              <span className="text-[12px] font-medium text-[#666D7A] mt-2 block">
                {Math.round((termStats.mod / termStats.caseload) * 100)}% of caseload · Bi-weekly sync
              </span>
            </div>
            <div className="flex gap-1 mt-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${
                    i < Math.max(1, Math.round((termStats.mod / termStats.caseload) * 8))
                      ? "bg-[#D9A441]"
                      : "bg-[#E0E2E6]"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="bg-[#F4FAF7] rounded-[22px] p-5 border border-[#A8D8C4]/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-[#0A2E0E]">On Track</span>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#0A2E0E] shadow-sm">
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">check_circle</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-[36px] font-semibold tracking-tight text-[#0A2E0E]">{termStats.safe}</div>
              <span className="text-[12px] font-medium text-[#0A2E0E] mt-2 block">
                {Math.round((termStats.safe / termStats.caseload) * 100)}% of caseload · Milestones met
              </span>
            </div>
            <div className="flex gap-1 mt-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${
                    i < Math.max(1, Math.round((termStats.safe / termStats.caseload) * 8))
                      ? "bg-[#0A2E0E]"
                      : "bg-[#A8D8C4]/40"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[22px] p-5 border border-[#E0E2E6] shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col justify-between sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-[#666D7A]">Due Follow-ups</span>
              <div className="w-8 h-8 rounded-full bg-[#F7F8FA] flex items-center justify-center text-[#181D26]">
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">event_upcoming</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-[36px] font-semibold tracking-tight text-[#181D26]">{pendingFollowUpCount}</div>
              <span className="text-[12px] font-medium text-[#666D7A] mt-2 block">
                {followUps.length - pendingFollowUpCount} of {followUps.length} completed
              </span>
            </div>
            <div className="flex gap-1 mt-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${
                    i < Math.round((pendingFollowUpCount / Math.max(1, followUps.length)) * 8)
                      ? "bg-[#181D26]"
                      : "bg-[#E0E2E6]"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Mentee Cards with Risk Sparklines + Filter Chips */}
        <div className="bg-white rounded-[22px] p-6 border border-[#E0E2E6] shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-[18px] font-semibold text-[#181D26]">Active Mentee Cards &amp; Risk Sparklines</h2>
              <p className="text-[13px] text-[#666D7A] mt-0.5">
                6-week trailing risk score trajectory across your assigned mentees.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter mentees by risk">
              {(["All", "High", "Moderate", "Low"] as const).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setRiskFilter(tier)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors cursor-pointer ${
                    riskFilter === tier
                      ? "bg-[#181D26] text-white"
                      : "bg-[#F7F8FA] text-[#333840] border border-[#E0E2E6] hover:bg-white"
                  }`}
                >
                  {tier === "All" ? `All (${BASE_MENTEES.length})` : `${tier} Risk`}
                </button>
              ))}
            </div>
          </div>

          {filteredMentees.length === 0 ? (
            <EmptyState
              title="No mentees match this filter"
              message="Reset the risk filter chip to inspect your full assigned caseload."
              action={{ label: "Show All Mentees", onClick: () => setRiskFilter("All") }}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredMentees.map((m) => (
                <div
                  key={m.id}
                  className="min-w-0 rounded-[18px] border border-[#E0E2E6] bg-[#F7F8FA]/60 hover:bg-white p-4 transition-all flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={m.name} src={m.avatarUrl} size={40} className="border border-[#E0E2E6]" />
                      <div className="min-w-0">
                        <Link
                          href={`/mentor/interventions?studentId=${m.id}`}
                          className="text-[14px] font-semibold text-[#181D26] hover:text-[#1B61C9] truncate block"
                        >
                          {m.name}
                        </Link>
                        <span className="font-mono text-[11px] text-[#666D7A]">{m.id} • {m.code}</span>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-medium inline-flex items-center gap-1 ${
                        m.risk === "High"
                          ? "bg-[#FFF8F5] text-[#AA2D00] border border-[#FCAB79]/40"
                          : m.risk === "Moderate"
                          ? "bg-[#FFF9E5] text-[#D9A441] border border-[#F4D35E]/40"
                          : "bg-[#F4FAF7] text-[#0A2E0E] border border-[#A8D8C4]/50"
                      }`}
                    >
                      <span aria-hidden="true" className="material-symbols-outlined text-[13px]">
                        {m.risk === "High" ? "warning" : m.risk === "Moderate" ? "error_outline" : "check_circle"}
                      </span>
                      {m.risk} ({m.riskScore})
                    </span>
                  </div>

                  <p className="text-[12.5px] text-[#333840] leading-snug">{m.concern}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E0E2E6]">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#666D7A] block">6-Wk Risk Sparkline</span>
                      <MiniSparkline
                        values={m.sparkline}
                        color={m.risk === "High" ? "#AA2D00" : m.risk === "Moderate" ? "#D9A441" : "#0A2E0E"}
                        width={108}
                        height={28}
                      />
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-[#666D7A] block">Att: <strong className="text-[#181D26]">{m.attendance}%</strong></span>
                      <Link
                        href={`/mentor/interventions?studentId=${m.id}`}
                        className="mt-1 inline-flex items-center gap-1 text-[12px] font-medium text-[#181D26] hover:text-[#1B61C9]"
                      >
                        <span>Open Workspace</span>
                        <span aria-hidden="true" className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Analytics + Timeline + Due Follow-ups Bento */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Intervention Timeline */}
          <div className="lg:col-span-6 bg-white rounded-[22px] p-6 border border-[#E0E2E6] shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-[17px] font-semibold text-[#181D26]">Intervention Timeline</h3>
                  <p className="text-[13px] text-[#666D7A] mt-0.5">Chronological milestones and escalation events</p>
                </div>
                <span className="px-3 py-1 rounded-full text-[12px] font-medium bg-[#A8D8C4]/30 text-[#0A2E0E]">
                  Live Cadence
                </span>
              </div>
              <ol className="space-y-4">
                {INTERVENTION_TIMELINE.map((ev) => (
                  <li key={ev.id} className="flex items-start gap-3">
                    <span
                      className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${
                        ev.tone === "coral"
                          ? "bg-[#AA2D00]"
                          : ev.tone === "amber"
                          ? "bg-[#D9A441]"
                          : ev.tone === "mint"
                          ? "bg-[#0A2E0E]"
                          : "bg-[#181D26]"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-medium text-[#181D26] truncate">{ev.title}</span>
                        <span className="font-mono text-[11px] text-[#666D7A] shrink-0">{ev.date}</span>
                      </div>
                      <span className="text-[12px] text-[#666D7A]">{ev.type}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <p className="mt-6 pt-4 border-t border-[#E0E2E6] text-[12px] text-[#666D7A] flex items-center gap-2">
              <span aria-hidden="true" className="material-symbols-outlined text-[16px] text-[#1B61C9]">info</span>
              2 students stepped down from High to Moderate risk tier after diagnostic math sessions.
            </p>
          </div>

          {/* Due Follow-ups Checklist */}
          <div className="lg:col-span-6 bg-white rounded-[22px] p-6 border border-[#E0E2E6] shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-[17px] font-semibold text-[#181D26]">Due Follow-ups</h3>
                  <p className="text-[13px] text-[#666D7A] mt-0.5">Action items queued across your caseload</p>
                </div>
                <Link
                  href="/mentor/interventions?tab=follow-ups"
                  className="text-[12px] font-medium text-[#1B61C9] hover:underline"
                >
                  View all in Workspace
                </Link>
              </div>
              <div className="space-y-2.5">
                {followUps.map((f) => (
                  <div
                    key={f.id}
                    className={`p-3.5 rounded-[14px] border flex items-center justify-between gap-3 ${
                      f.done ? "bg-[#F4FAF7] border-[#A8D8C4]/50 opacity-80" : "bg-[#F7F8FA] border-[#E0E2E6]"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className={`text-[13px] font-medium truncate ${f.done ? "line-through text-[#666D7A]" : "text-[#181D26]"}`}>
                        {f.task}
                      </p>
                      <p className="text-[11.5px] text-[#666D7A]">
                        {f.studentName} • {f.due} • {f.channel}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleFollowUp(f.id)}
                      className={`shrink-0 px-3 py-1.5 rounded-[10px] text-[12px] font-medium cursor-pointer transition-colors ${
                        f.done
                          ? "bg-white text-[#0A2E0E] border border-[#A8D8C4]"
                          : "bg-[#181D26] text-white hover:bg-[#333840]"
                      }`}
                    >
                      {f.done ? "Completed" : "Mark Done"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Past Intervention Outcomes Summary */}
        <div className="bg-white rounded-[22px] p-6 border border-[#E0E2E6] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="text-[18px] font-semibold text-[#181D26]">Past Intervention Outcomes Summary</h3>
              <p className="text-[13px] text-[#666D7A] mt-0.5">
                Before/after risk deltas from recently closed and active mentoring cycles.
              </p>
            </div>
            <Link
              href="/mentor/interventions?tab=outcomes"
              className="text-[13px] font-medium text-[#181D26] hover:underline inline-flex items-center gap-1"
            >
              <span>Inspect Peer Comparison Charts</span>
              <span aria-hidden="true" className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-[#E0E2E6] text-[12px] font-medium text-[#666D7A] uppercase tracking-wider">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Intervention Track</th>
                  <th className="py-3 px-4">Pre-Risk</th>
                  <th className="py-3 px-4">Post-Risk</th>
                  <th className="py-3 px-4 text-right">Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E2E6] text-[13px]">
                {PAST_OUTCOMES.map((row) => (
                  <tr key={row.student} className="hover:bg-[#F8FAFC]">
                    <td className="py-3 px-4 font-medium text-[#181D26]">{row.student}</td>
                    <td className="py-3 px-4 text-[#333840]">{row.intervention}</td>
                    <td className="py-3 px-4 font-mono text-[#AA2D00]">{row.preRisk}</td>
                    <td className="py-3 px-4 font-mono text-[#0A2E0E]">{row.postRisk}</td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                          row.verdict === "Improved"
                            ? "bg-[#F4FAF7] text-[#0A2E0E] border border-[#A8D8C4]/60"
                            : "bg-[#FFF9E5] text-[#D9A441] border border-[#F4D35E]/50"
                        }`}
                      >
                        {row.verdict}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
