"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useUIStore } from "@/store/useUIStore";
import Avatar from "@/components/ui/Avatar";
import ModalShell from "@/components/ui/ModalShell";
import { EmptyState } from "@/components/ui/StateFeedback";
import { MOCK_STUDENTS } from "@/lib/mock-data";

interface AlertItem {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  category: "academic" | "attendance" | "engagement" | "submissions";
  alertType: string;
  priority: "High" | "Medium" | "Low";
  details: string;
  aiDiagnosis: string;
  shapDrivers: { factor: string; impact: string }[];
  coveragePct: number;
  subject: string;
  date: string;
  status: "New" | "Acknowledged" | "Snoozed" | "Resolved";
  avatarUrl?: string;
}

const INITIAL_ALERTS: AlertItem[] = [
  {
    id: "ALT-2026-081",
    studentId: "STU1001",
    studentName: MOCK_STUDENTS[0].name,
    studentCode: "IT26-4091",
    category: "attendance",
    alertType: "Critical Attendance Dip",
    priority: "High",
    details: "Attendance dropped to 64.5% (-18% over 14 instructional days)",
    aiDiagnosis: "Consecutive Monday absences correlate with upcoming Calculus III midterm. Early mentoring reduces fail probability by 28%.",
    shapDrivers: [
      { factor: "Trailing 14d Attendance Drop", impact: "+38%" },
      { factor: "Calculus III Test 2 (38%)", impact: "+31%" },
    ],
    coveragePct: 96,
    subject: "Calculus III",
    date: "Nov 12, 2026",
    status: "New",
    avatarUrl: MOCK_STUDENTS[0].avatarUrl,
  },
  {
    id: "ALT-2026-082",
    studentId: "STU1002",
    studentName: MOCK_STUDENTS[1].name,
    studentCode: "IT26-4092",
    category: "submissions",
    alertType: "Missing OS Lab Submissions",
    priority: "High",
    details: "3 lab assignments pending in Operating Systems over 10 days",
    aiDiagnosis: "Uncompleted OS Lab 4 & 5 submissions plus Quiz 2 (42%) signal acute backlog.",
    shapDrivers: [
      { factor: "Missing Lab Count (3)", impact: "+34%" },
      { factor: "OS Quiz 2 Dip", impact: "+24%" },
    ],
    coveragePct: 92,
    subject: "Operating Systems",
    date: "Nov 11, 2026",
    status: "New",
    avatarUrl: MOCK_STUDENTS[1].avatarUrl,
  },
  {
    id: "ALT-2026-083",
    studentId: "STU1003",
    studentName: MOCK_STUDENTS[2].name,
    studentCode: "IT26-4105",
    category: "academic",
    alertType: "Data Structures Score Decline",
    priority: "Medium",
    details: "Test average dipped 14% below prior semester baseline",
    aiDiagnosis: "Tree traversal & dynamic programming quizzes scored below class median.",
    shapDrivers: [
      { factor: "Formative Quiz Delta (-14%)", impact: "+26%" },
      { factor: "Tutorial Absences", impact: "+18%" },
    ],
    coveragePct: 88,
    subject: "Data Structures",
    date: "Nov 10, 2026",
    status: "New",
    avatarUrl: MOCK_STUDENTS[2].avatarUrl,
  },
  {
    id: "ALT-2026-084",
    studentId: "STU1004",
    studentName: MOCK_STUDENTS[3].name,
    studentCode: "IT26-4112",
    category: "engagement",
    alertType: "Low LMS Engagement",
    priority: "Medium",
    details: "Zero LMS module activity recorded across 6 days",
    aiDiagnosis: "Late submission flag paired with reduced module completion rate.",
    shapDrivers: [
      { factor: "LMS Inactivity Window", impact: "+22%" },
      { factor: "Late Submission Flag", impact: "+14%" },
    ],
    coveragePct: 78,
    subject: "Algorithms",
    date: "Nov 09, 2026",
    status: "Acknowledged",
    avatarUrl: MOCK_STUDENTS[3].avatarUrl,
  },
];

export default function AlertCentrePage() {
  const { addToast } = useUIStore();
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [activeCategory, setActiveCategory] = useState<"all" | "academic" | "attendance" | "engagement" | "submissions">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, "useful" | "false_alert">>({});

  const [cooldownHours, setCooldownHours] = useState(72);
  const [dailyCap, setDailyCap] = useState(8);
  const [digestMode, setDigestMode] = useState(true);

  const filteredAlerts = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return alerts.filter((a) => {
      const matchSearch =
        a.studentName.toLowerCase().includes(q) ||
        a.details.toLowerCase().includes(q) ||
        a.subject.toLowerCase().includes(q) ||
        a.alertType.toLowerCase().includes(q);
      if (!matchSearch) return false;
      if (activeCategory === "all") return true;
      return a.category === activeCategory;
    });
  }, [alerts, searchQuery, activeCategory]);

  const handleUpdateStatus = (status: "Acknowledged" | "Snoozed" | "Resolved") => {
    if (!selectedAlert) return;
    setAlerts((prev) => prev.map((item) => (item.id === selectedAlert.id ? { ...item, status } : item)));
    addToast({ title: `Alert ${status}`, message: `${selectedAlert.studentName}: marked ${status}.`, type: "success" });
    setSelectedAlert(null);
  };

  const submitAlertFeedback = (id: string, vote: "useful" | "false_alert") => {
    setFeedbackMap((prev) => ({ ...prev, [id]: vote }));
    addToast({
      title: vote === "useful" ? "Marked Useful Signal" : "Flagged False Alert",
      message: "Feedback recorded for model calibration.",
      type: vote === "useful" ? "success" : "warning",
    });
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAECEF] text-[#181D26] text-[12px] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#AA2D00]" />
            Active Warning Telemetry
          </div>
          <h1 className="text-[34px] sm:text-[40px] font-normal tracking-tight text-[#181D26]">
            Alert Centre &amp; Early Diagnostics
          </h1>
          <p className="text-[15px] text-[#41454D]">
            Early-warning signals with alert-fatigue guardrails, SHAP explanations, and usefulness feedback.
          </p>
        </div>

        <Link
          href="/teacher/interventions"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[14px] bg-[#181D26] text-white text-[13.5px] font-medium hover:bg-[#0D1218] self-start lg:self-auto"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[18px]">add</span>
          <span>Open Intervention Planner</span>
        </Link>
      </div>

      {/* Alert-Fatigue Controls */}
      <div className="bg-white rounded-[20px] p-5 border border-[#EAECEF] grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div>
          <span className="text-[12px] font-semibold uppercase tracking-wider text-[#666D7A] block">Alert-Fatigue Guardrails</span>
          <p className="text-[13px] font-medium text-[#181D26]">Teacher notification preferences</p>
        </div>
        <div>
          <label htmlFor="al-cooldown" className="text-[12px] text-[#666D7A] block mb-1">Cooldown / Student (hrs)</label>
          <select
            id="al-cooldown"
            value={cooldownHours}
            onChange={(e) => {
              setCooldownHours(Number(e.target.value));
              addToast({ title: "Cooldown updated", message: `Suppressing duplicate triggers for ${e.target.value}h.`, type: "info" });
            }}
            className="w-full h-9 px-3 rounded-[10px] border border-[#DDDDDD] text-[13px]"
          >
            <option value={24}>24 hours</option>
            <option value={72}>72 hours (Recommended)</option>
            <option value={168}>7 days</option>
          </select>
        </div>
        <div>
          <label htmlFor="al-cap" className="text-[12px] text-[#666D7A] block mb-1">Daily Alert Cap</label>
          <select
            id="al-cap"
            value={dailyCap}
            onChange={(e) => {
              setDailyCap(Number(e.target.value));
              addToast({ title: "Daily Cap updated", message: `Max ${e.target.value} alerts/day.`, type: "info" });
            }}
            className="w-full h-9 px-3 rounded-[10px] border border-[#DDDDDD] text-[13px]"
          >
            <option value={5}>5 alerts / day</option>
            <option value={8}>8 alerts / day</option>
            <option value={15}>15 alerts / day</option>
          </select>
        </div>
        <label className="flex items-center justify-between p-2.5 rounded-[12px] bg-[#F7F8FA] border border-[#EAECEF] cursor-pointer text-[13px]">
          <span className="font-medium">Daily Digest Batching</span>
          <input
            type="checkbox"
            checked={digestMode}
            onChange={(e) => {
              setDigestMode(e.target.checked);
              addToast({ title: e.target.checked ? "Daily digest enabled" : "Instant alerts enabled", type: "info" });
            }}
            className="w-4 h-4 accent-[#181D26]"
          />
        </label>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-[20px] p-4 border border-[#EAECEF] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(
            [
              ["all", "All Signals"],
              ["attendance", "Attendance Dips"],
              ["submissions", "Coursework"],
              ["academic", "Score Drops"],
              ["engagement", "LMS Engagement"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveCategory(id)}
              className={`px-3.5 py-2 rounded-[10px] text-[13px] font-medium shrink-0 cursor-pointer ${
                activeCategory === id ? "bg-[#181D26] text-white" : "text-[#41454D] hover:bg-[#F7F8FA]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <input
          type="search"
          aria-label="Search alerts"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search student, subject, alert..."
          className="h-10 px-3.5 rounded-[12px] bg-[#F7F8FA] border border-[#DDDDDD] text-[13px] w-full md:w-72"
        />
      </div>

      {/* Feed */}
      {filteredAlerts.length === 0 ? (
        <EmptyState
          title="No matching alerts"
          message="Adjust your category tab or search query to view active warnings."
          action={{
            label: "Show All Alerts",
            onClick: () => {
              setActiveCategory("all");
              setSearchQuery("");
            },
          }}
        />
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((a) => (
            <div
              key={a.id}
              onClick={() => setSelectedAlert(a)}
              className="p-5 rounded-[20px] bg-white border border-[#EAECEF] hover:border-[#181D26] cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4 min-w-0">
                <Avatar name={a.studentName} src={a.avatarUrl} size={44} />
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-[15px] font-medium">{a.studentName}</span>
                    <span className="font-mono text-[12px] text-[#666D7A]">({a.studentCode})</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        a.priority === "High"
                          ? "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]"
                          : "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]"
                      }`}
                    >
                      {a.priority} Priority
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] bg-[#F7F8FA] border border-[#EAECEF] text-[#666D7A]">
                      {a.status}
                    </span>
                  </div>
                  <p className="text-[13.5px] font-medium">
                    {a.alertType} — <span className="font-normal text-[#41454D]">{a.details}</span>
                  </p>
                  <p className="text-[12px] text-[#666D7A]">
                    Subject: {a.subject} • Coverage {a.coveragePct}% • {a.date}
                  </p>
                </div>
              </div>
              <span className="text-[12.5px] font-medium text-[#181D26] shrink-0">Investigate →</span>
            </div>
          ))}
        </div>
      )}

      {/* Diagnostics Drawer via ModalShell */}
      <ModalShell
        open={Boolean(selectedAlert)}
        title={selectedAlert ? `${selectedAlert.alertType} — ${selectedAlert.studentName}` : "Diagnostic Details"}
        onClose={() => setSelectedAlert(null)}
        widthClass="max-w-xl"
      >
        {selectedAlert && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-[14px] bg-[#F4FAF7] border border-[#A8D8C4] flex items-center justify-between text-[12.5px]">
              <span className="font-semibold text-[#0A2E0E]">
                Telemetry Coverage Guardrail: {selectedAlert.coveragePct}% Verified
              </span>
              <Link href={`/teacher/students/${selectedAlert.studentId}`} className="font-semibold text-[#1B61C9] hover:underline">
                Open Student 360 →
              </Link>
            </div>

            <div className="p-4 rounded-[14px] bg-[#FEF2F2] border border-[#FECACA] text-[13px] text-[#181D26]">
              {selectedAlert.aiDiagnosis}
            </div>

            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#666D7A]">Top SHAP Factors</span>
              {selectedAlert.shapDrivers.map((d) => (
                <div key={d.factor} className="p-2.5 rounded-[10px] bg-[#F7F8FA] border border-[#EAECEF] flex justify-between text-[13px]">
                  <span>{d.factor}</span>
                  <strong className="font-mono text-[#DC2626]">{d.impact}</strong>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#EAECEF]">
              <span className="text-[12px] text-[#666D7A]">Was this signal helpful?</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => submitAlertFeedback(selectedAlert.id, "useful")}
                  className={`px-3 py-1 rounded-[8px] border text-[12px] cursor-pointer ${
                    feedbackMap[selectedAlert.id] === "useful" ? "bg-[#0A2E0E] text-white" : "bg-white"
                  }`}
                >
                  Useful
                </button>
                <button
                  type="button"
                  onClick={() => submitAlertFeedback(selectedAlert.id, "false_alert")}
                  className={`px-3 py-1 rounded-[8px] border text-[12px] cursor-pointer ${
                    feedbackMap[selectedAlert.id] === "false_alert" ? "bg-[#AA2D00] text-white" : "bg-white"
                  }`}
                >
                  False Alert
                </button>
              </div>
            </div>

            <div className="flex flex-wrap justify-between gap-2 pt-3 border-t border-[#EAECEF]">
              <div className="flex gap-2">
                <button type="button" onClick={() => handleUpdateStatus("Acknowledged")} className="px-3.5 py-2 rounded-[10px] border text-[12.5px] cursor-pointer">
                  Acknowledge
                </button>
                <button type="button" onClick={() => handleUpdateStatus("Snoozed")} className="px-3.5 py-2 rounded-[10px] border text-[12.5px] cursor-pointer">
                  Snooze 48h
                </button>
              </div>
              <Link
                href={`/teacher/interventions?studentId=${selectedAlert.studentId}&alertId=${selectedAlert.id}`}
                className="px-4 py-2 rounded-[10px] bg-[#181D26] text-white text-[12.5px] font-medium"
              >
                Prescribe Intervention
              </Link>
            </div>
          </div>
        )}
      </ModalShell>
    </div>
  );
}
