"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useUIStore } from "@/store/useUIStore";
import { useT } from "@/lib/i18n/useT";
import Avatar from "@/components/ui/Avatar";
import ModalShell from "@/components/ui/ModalShell";
import { ChartCard, RiskDonutChart, TrendLineChart } from "@/components/charts/ChartCard";
import { MOCK_STUDENTS } from "@/lib/mock-data";

type CohortTab = "SECTION_A" | "SECTION_B" | "ALL" | "PRIORITY" | "TRENDS";

interface RosterRow {
  id: string;
  roll: string;
  section: "SECTION_A" | "SECTION_B";
  name: string;
  risk: "High" | "Medium" | "Low";
  urgency: number;
  indicator: string;
  detail: string;
  attendance: number;
  score: number;
  latestAlert: string;
  avatarUrl?: string;
}

const ROSTER: RosterRow[] = [
  {
    id: "STU1001",
    roll: "IT26-4091",
    section: "SECTION_A",
    name: MOCK_STUDENTS[0].name,
    risk: "High",
    urgency: 89,
    indicator: "Attendance < 65% & Calculus drop",
    detail: "Consistent Monday absences",
    attendance: 64.5,
    score: 54,
    latestAlert: "Calculus III score dropped to 38%",
    avatarUrl: MOCK_STUDENTS[0].avatarUrl,
  },
  {
    id: "STU1002",
    roll: "IT26-4092",
    section: "SECTION_B",
    name: MOCK_STUDENTS[1].name,
    risk: "High",
    urgency: 76,
    indicator: "3 missing OS lab assignments",
    detail: "Lab 4 & 5 pending verification",
    attendance: 71.0,
    score: 59,
    latestAlert: "OS Quiz 2 fell below 45%",
    avatarUrl: MOCK_STUDENTS[1].avatarUrl,
  },
  {
    id: "STU1003",
    roll: "IT26-4105",
    section: "SECTION_A",
    name: MOCK_STUDENTS[2].name,
    risk: "Medium",
    urgency: 72,
    indicator: "Data Structures backlog",
    detail: "Low tutorial engagement",
    attendance: 68.2,
    score: 64,
    latestAlert: "Missed 2 DSA tutorial evaluations",
    avatarUrl: MOCK_STUDENTS[2].avatarUrl,
  },
  {
    id: "STU1004",
    roll: "IT26-4112",
    section: "SECTION_B",
    name: MOCK_STUDENTS[3].name,
    risk: "Medium",
    urgency: 54,
    indicator: "Algorithms midterm dip",
    detail: "Late submission flag",
    attendance: 78.4,
    score: 72,
    latestAlert: "Assignment submitted past window",
    avatarUrl: MOCK_STUDENTS[3].avatarUrl,
  },
  {
    id: "STU1005",
    roll: "IT26-4088",
    section: "SECTION_A",
    name: MOCK_STUDENTS[4].name,
    risk: "Low",
    urgency: 28,
    indicator: "Consistent benchmark performance",
    detail: "Steady recovery",
    attendance: 85.0,
    score: 79,
    latestAlert: "On track across core subjects",
    avatarUrl: MOCK_STUDENTS[4].avatarUrl,
  },
];

const TAB_SERIES: Record<CohortTab, { week: string; attendance: number; quizzes: number }[]> = {
  SECTION_A: [
    { week: "Oct 05", attendance: 84, quizzes: 71 },
    { week: "Oct 19", attendance: 86, quizzes: 74 },
    { week: "Nov 02", attendance: 88, quizzes: 76 },
    { week: "Nov 16", attendance: 90, quizzes: 79 },
  ],
  SECTION_B: [
    { week: "Oct 05", attendance: 81, quizzes: 68 },
    { week: "Oct 19", attendance: 83, quizzes: 70 },
    { week: "Nov 02", attendance: 85, quizzes: 73 },
    { week: "Nov 16", attendance: 87, quizzes: 75 },
  ],
  ALL: [
    { week: "Oct 05", attendance: 82.5, quizzes: 69.5 },
    { week: "Oct 19", attendance: 84.5, quizzes: 72 },
    { week: "Nov 02", attendance: 86.5, quizzes: 74.5 },
    { week: "Nov 16", attendance: 88.5, quizzes: 77 },
  ],
  PRIORITY: [
    { week: "Oct 05", attendance: 71, quizzes: 59 },
    { week: "Oct 19", attendance: 69, quizzes: 57 },
    { week: "Nov 02", attendance: 68, quizzes: 56 },
    { week: "Nov 16", attendance: 70, quizzes: 58 },
  ],
  TRENDS: [
    { week: "Oct 05", attendance: 80, quizzes: 72 },
    { week: "Oct 19", attendance: 83, quizzes: 74 },
    { week: "Nov 02", attendance: 87, quizzes: 77 },
    { week: "Nov 16", attendance: 91, quizzes: 80 },
  ],
};

const SECTION_COHORT_DISTRIBUTION: Record<CohortTab, { high: number; mod: number; low: number }> = {
  SECTION_A: { high: 4, mod: 8, low: 26 },
  SECTION_B: { high: 4, mod: 6, low: 28 },
  ALL: { high: 8, mod: 14, low: 54 },
  PRIORITY: { high: 8, mod: 14, low: 0 },
  TRENDS: { high: 8, mod: 14, low: 54 },
};

export default function ClassOverviewPage() {
  const { addToast } = useUIStore();
  const { t } = useT();
  const [activeTab, setActiveTab] = useState<CohortTab>("SECTION_A");
  const [metricView, setMetricView] = useState<"attendance" | "quizzes">("attendance");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [targetBenchmark, setTargetBenchmark] = useState(90);

  const visibleRoster = useMemo(() => {
    const filtered = ROSTER.filter((r) => {
      if (activeTab === "SECTION_A" || activeTab === "SECTION_B") return r.section === activeTab;
      if (activeTab === "PRIORITY") return r.risk !== "Low";
      return true;
    });
    return [...filtered].sort((a, b) => b.urgency - a.urgency);
  }, [activeTab]);

  const dist = SECTION_COHORT_DISTRIBUTION[activeTab];
  const highCount = dist.high;
  const modCount = dist.mod;
  const lowCount = dist.low;
  const enrolledTotal = highCount + modCount + lowCount;
  const series = TAB_SERIES[activeTab];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAECEF] text-[#181D26] text-[12px] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#006400]" />
            Active Academic Term: Fall 2026
          </div>
          <h1 className="text-[34px] sm:text-[40px] font-normal tracking-tight text-[#181D26] leading-[1.18]">
            {t("Managing Class Progress and Student Success")}
          </h1>
          <p className="text-[15px] text-[#41454D] leading-relaxed">
            Live cohort telemetry, risk distribution, early-warning trajectory detection, and urgency-sorted support priorities.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            title="Class Settings"
            aria-label="Open Class Settings"
            onClick={() => setSettingsOpen(true)}
            className="w-10 h-10 rounded-full bg-white border border-[#DDDDDD] flex items-center justify-center text-[#181D26] hover:bg-black/[0.02] cursor-pointer"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[19px]">tune</span>
          </button>
          <Link
            href="/teacher/interventions"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[14px] bg-[#181D26] text-white text-[13.5px] font-medium hover:bg-[#0D1218] transition-all"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">add</span>
            <span>{t("Create Intervention")}</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#EAECEF]">
        {(
          [
            { id: "SECTION_A", label: "Section A - IT 2026" },
            { id: "SECTION_B", label: "Section B - IT 2026" },
            { id: "ALL", label: "All Enrolled (76)" },
            { id: "PRIORITY", label: "Priority Attention" },
            { id: "TRENDS", label: "Attendance Health" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-[12px] text-[13.5px] font-medium transition-all shrink-0 cursor-pointer ${
              activeTab === tab.id ? "bg-[#181D26] text-white shadow-xs" : "text-[#41454D] hover:text-[#181D26]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Top 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        <div className="md:col-span-4 bg-white rounded-[20px] p-6 border border-[#EAECEF] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-medium">{t("Total Enrolled")}</span>
            <Link href="/teacher/students" className="text-[12px] font-medium text-[#1B61C9] hover:underline">
              Open Directory →
            </Link>
          </div>
          <div className="my-5 flex items-baseline gap-2">
            <span className="text-[36px] font-medium font-mono">{enrolledTotal}</span>
            <span className="text-[14px] text-[#666D7A]">active students</span>
          </div>
          <div className="pt-3 border-t border-[#F1F3F5] flex justify-between text-[12.5px] text-[#666D7A]">
            <span>Target Attendance: {targetBenchmark}%</span>
            <span className="text-[#006400] font-medium">Live Filter Active</span>
          </div>
        </div>

        <div className="md:col-span-4 bg-[#F4D35E]/15 rounded-[20px] p-6 border border-[#F4D35E]/30 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-medium">{t("Needs Attention")}</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FCAB79]/25 text-[#AA2D00]">
              {highCount + modCount} Flagged
            </span>
          </div>
          <div className="my-5 flex items-baseline gap-2">
            <span className="text-[36px] font-medium font-mono">{highCount + modCount}</span>
            <span className="ml-auto px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF2F2] text-[#DC2626]">
              {highCount} High Risk
            </span>
          </div>
          <div className="pt-3 border-t border-[#F4D35E]/30 flex justify-between text-[12.5px]">
            <span>Early Intervention Engine</span>
            <Link href="/teacher/alerts" className="font-semibold hover:underline">
              View Alerts →
            </Link>
          </div>
        </div>

        <div className="md:col-span-4 bg-[#181D26] text-white rounded-[20px] p-6 flex flex-col justify-between">
          <div className="space-y-1.5">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#A8D8C4]">Sentinel ML Advisory</span>
            <h3 className="text-[20px] font-medium">Proactive Morning Check-Ins</h3>
            <p className="text-[13px] text-[#A8B2C1]">
              Monday 9 AM absences correlate strongly with midterm drops. Trigger early faculty nudges within 72h.
            </p>
          </div>
          <Link href="/teacher/interventions" className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-[12px] bg-white text-[#181D26] text-[13px] font-semibold self-start">
            <span>Prescribe Support →</span>
          </Link>
        </div>
      </div>

      {/* Recharts Trajectory + Risk Distribution Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <div className="inline-flex bg-[#F1F3F5] p-1 rounded-[12px]">
              <button
                type="button"
                onClick={() => setMetricView("attendance")}
                className={`px-3 py-1 rounded-[9px] text-[12.5px] font-medium cursor-pointer ${metricView === "attendance" ? "bg-white text-[#181D26] shadow-xs" : "text-[#666D7A]"}`}
              >
                Attendance
              </button>
              <button
                type="button"
                onClick={() => setMetricView("quizzes")}
                className={`px-3 py-1 rounded-[9px] text-[12.5px] font-medium cursor-pointer ${metricView === "quizzes" ? "bg-white text-[#181D26] shadow-xs" : "text-[#666D7A]"}`}
              >
                Assessments
              </button>
            </div>
          </div>

          <ChartCard
            title={`Cohort ${metricView === "attendance" ? "Attendance %" : "Assessment Score %"} Trajectory (${activeTab.replace("_", " ")})`}
            subtitle={`Monitored against ${targetBenchmark}% target benchmark`}
            ariaLabel={`Trend chart of cohort ${metricView} over Fall 2026`}
            data={series}
            filename={`class_overview_${metricView}`}
            height={250}
          >
            <TrendLineChart
              data={series}
              xKey="week"
              series={[
                {
                  key: metricView,
                  label: metricView === "attendance" ? "Attendance %" : "Assessment Avg %",
                  color: "#181D26",
                },
              ]}
              height={250}
            />
          </ChartCard>
        </div>

        <div className="lg:col-span-4">
          <ChartCard
            title="Section Risk Distribution"
            subtitle="Share across current filtered roster"
            ariaLabel={`Risk donut showing ${highCount} High, ${modCount} Medium, and ${lowCount} Low risk students`}
            data={[
              { name: "High", value: highCount },
              { name: "Medium", value: modCount },
              { name: "Low", value: lowCount },
            ]}
            filename="class_risk_donut"
            height={292}
          >
            <RiskDonutChart
              data={[
                { name: "High", value: highCount },
                { name: "Medium", value: modCount },
                ...(lowCount > 0 ? [{ name: "Low", value: lowCount }] : []),
              ]}
              height={292}
            />
          </ChartCard>
        </div>
      </div>

      {/* Urgency-sorted Priority Roster */}
      <div className="bg-white rounded-[22px] p-6 border border-[#EAECEF] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#F1F3F5]">
          <div>
            <h2 className="text-[18px] font-medium">Needs Attention Today (Urgency Sorted)</h2>
            <p className="text-[13px] text-[#666D7A]">Sorted highest-to-lowest predicted risk urgency</p>
          </div>
          <Link href="/teacher/students" className="px-4 py-2 rounded-[12px] bg-[#F7F8FA] text-[13px] font-medium">
            View Full Directory →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13.5px] min-w-[700px]">
            <thead>
              <tr className="border-b border-[#EAECEF] text-[12px] font-medium text-[#666D7A] uppercase">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Risk Tier</th>
                <th className="py-3 px-4">Primary Indicator</th>
                <th className="py-3 px-4">Att / Score</th>
                <th className="py-3 px-4">Latest Alert</th>
                <th className="py-3 px-4 text-right">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F3F5]">
              {visibleRoster.map((s) => (
                <tr key={s.id} className="hover:bg-[#F7F8FA]">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={s.name} src={s.avatarUrl} size={36} />
                      <div>
                        <p className="font-medium">{s.name}</p>
                        <p className="font-mono text-[11px] text-[#666D7A]">{s.id} • {s.roll}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        s.risk === "High"
                          ? "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]"
                          : s.risk === "Medium"
                          ? "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]"
                          : "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
                      }`}
                    >
                      {s.risk} ({s.urgency})
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-medium block">{s.indicator}</span>
                    <span className="text-[11px] text-[#666D7A]">{s.detail}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[12px]">
                    {s.attendance}% / {s.score}%
                  </td>
                  <td className="py-3.5 px-4 text-[13px] text-[#41454D]">{s.latestAlert}</td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/teacher/students/${s.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[10px] text-[12.5px] font-medium bg-white border border-[#DDDDDD] hover:bg-[#F7F8FA]"
                    >
                      <span>View 360</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ModalShell open={settingsOpen} title="Class Benchmark Settings" onClose={() => setSettingsOpen(false)}>
        <div className="space-y-4">
          <div className="flex justify-between text-[13px]">
            <label htmlFor="class-target">Target Attendance Benchmark</label>
            <strong className="font-mono">{targetBenchmark}%</strong>
          </div>
          <input
            id="class-target"
            type="range"
            min={75}
            max={95}
            value={targetBenchmark}
            onChange={(e) => setTargetBenchmark(Number(e.target.value))}
            className="w-full accent-[#181D26]"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setSettingsOpen(false);
                addToast({ title: "Class Settings Updated", message: `Attendance benchmark set to ${targetBenchmark}%.`, type: "success" });
              }}
              className="px-4 py-2 rounded-[10px] bg-[#181D26] text-white text-[13px] cursor-pointer"
            >
              Save Benchmark
            </button>
          </div>
        </div>
      </ModalShell>
    </div>
  );
}
