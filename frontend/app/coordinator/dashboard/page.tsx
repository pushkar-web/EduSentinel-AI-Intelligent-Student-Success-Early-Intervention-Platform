"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { useT } from "@/lib/i18n/useT";
import Avatar from "@/components/ui/Avatar";
import {
  ChartCard,
  RiskDonutChart,
  TrendLineChart,
} from "@/components/charts/ChartCard";

interface CohortRow {
  name: string;
  total: number;
  high: number;
  mod: number;
  low: number;
}

interface FlaggedStudent {
  id: string;
  name: string;
  className: string;
  risk: "High" | "Moderate";
  concern: string;
  date: string;
}

interface DeptTelemetry {
  code: string;
  totalStudents: number;
  totalDelta: string;
  atRiskCount: number;
  atRiskDelta: string;
  goodStanding: number;
  goodDelta: string;
  coveragePct: number;
  coveredCount: number;
  coverageDelta: string;
  activePlans: number;
  plansDelta: string;
  inProgress: number;
  completed: number;
  planned: number;
  overdue: number;
  facultyTotal: number;
  facultyLeading: number;
  facultyFollowups: number;
  avgMentees: string;
  cohorts: CohortRow[];
  trajectory: { month: string; score: number; attendance: number }[];
  flaggedStudents: FlaggedStudent[];
}

const DEPT_TELEMETRY: Record<string, DeptTelemetry> = {
  "Information Technology": {
    code: "IT",
    totalStudents: 486,
    totalDelta: "+2.7%",
    atRiskCount: 58,
    atRiskDelta: "-3.4%",
    goodStanding: 428,
    goodDelta: "+4.1%",
    coveragePct: 72.4,
    coveredCount: 42,
    coverageDelta: "+6.8%",
    activePlans: 18,
    plansDelta: "+5.9%",
    inProgress: 10,
    completed: 5,
    planned: 2,
    overdue: 1,
    facultyTotal: 24,
    facultyLeading: 18,
    facultyFollowups: 12,
    avgMentees: "20.3",
    cohorts: [
      { name: "SE IT - A", total: 98, high: 8, mod: 18, low: 72 },
      { name: "SE IT - B", total: 96, high: 10, mod: 16, low: 70 },
      { name: "TE IT - A", total: 97, high: 14, mod: 20, low: 63 },
      { name: "TE IT - B", total: 95, high: 12, mod: 19, low: 64 },
      { name: "BE IT - A", total: 100, high: 8, mod: 17, low: 75 },
    ],
    trajectory: [
      { month: "Jul", score: 69, attendance: 85 },
      { month: "Aug", score: 71, attendance: 86 },
      { month: "Sep", score: 73, attendance: 87 },
      { month: "Oct", score: 75, attendance: 89 },
      { month: "Nov", score: 77, attendance: 90 },
      { month: "Dec", score: 79, attendance: 91 },
    ],
    flaggedStudents: [
      {
        id: "STU1001",
        name: "Aarav Deshmukh",
        className: "TE IT - A",
        risk: "High",
        concern: "Frequent absences in OS Lab, internal score drop to 38%",
        date: "Oct 28, 2026",
      },
      {
        id: "STU1002",
        name: "Riya Patil",
        className: "SE IT - B",
        risk: "High",
        concern: "3 consecutive assignments overdue in Data Structures",
        date: "Oct 27, 2026",
      },
      {
        id: "STU1003",
        name: "Karan Mehta",
        className: "TE IT - B",
        risk: "Moderate",
        concern: "Mid-term test decline in Computer Networks (54/100)",
        date: "Oct 26, 2026",
      },
    ],
  },
  "Computer Engineering": {
    code: "CE",
    totalStudents: 540,
    totalDelta: "+3.2%",
    atRiskCount: 51,
    atRiskDelta: "-4.1%",
    goodStanding: 489,
    goodDelta: "+4.6%",
    coveragePct: 78.4,
    coveredCount: 40,
    coverageDelta: "+7.2%",
    activePlans: 22,
    plansDelta: "+6.4%",
    inProgress: 12,
    completed: 7,
    planned: 2,
    overdue: 1,
    facultyTotal: 28,
    facultyLeading: 22,
    facultyFollowups: 16,
    avgMentees: "19.3",
    cohorts: [
      { name: "SE CE - A", total: 108, high: 7, mod: 16, low: 85 },
      { name: "SE CE - B", total: 106, high: 9, mod: 15, low: 82 },
      { name: "TE CE - A", total: 110, high: 12, mod: 18, low: 80 },
      { name: "TE CE - B", total: 108, high: 10, mod: 17, low: 81 },
      { name: "BE CE - A", total: 108, high: 6, mod: 14, low: 88 },
    ],
    trajectory: [
      { month: "Jul", score: 72, attendance: 87 },
      { month: "Aug", score: 73, attendance: 88 },
      { month: "Sep", score: 75, attendance: 89 },
      { month: "Oct", score: 77, attendance: 90 },
      { month: "Nov", score: 79, attendance: 92 },
      { month: "Dec", score: 81, attendance: 93 },
    ],
    flaggedStudents: [
      {
        id: "STU2041",
        name: "Sneha Kulkarni",
        className: "TE CE - A",
        risk: "High",
        concern: "Algorithm Lab attendance dropped to 64% over 3 weeks",
        date: "Oct 28, 2026",
      },
      {
        id: "STU2018",
        name: "Omkar Joshi",
        className: "SE CE - B",
        risk: "Moderate",
        concern: "Two quiz retakes missed in Discrete Mathematics",
        date: "Oct 25, 2026",
      },
    ],
  },
  "Mechanical Engineering": {
    code: "ME",
    totalStudents: 412,
    totalDelta: "+1.1%",
    atRiskCount: 49,
    atRiskDelta: "-2.0%",
    goodStanding: 363,
    goodDelta: "+2.4%",
    coveragePct: 69.4,
    coveredCount: 34,
    coverageDelta: "+5.1%",
    activePlans: 15,
    plansDelta: "+3.8%",
    inProgress: 8,
    completed: 4,
    planned: 2,
    overdue: 1,
    facultyTotal: 22,
    facultyLeading: 15,
    facultyFollowups: 11,
    avgMentees: "18.7",
    cohorts: [
      { name: "SE ME - A", total: 84, high: 9, mod: 15, low: 60 },
      { name: "SE ME - B", total: 82, high: 8, mod: 14, low: 60 },
      { name: "TE ME - A", total: 83, high: 11, mod: 16, low: 56 },
      { name: "TE ME - B", total: 81, high: 10, mod: 13, low: 58 },
      { name: "BE ME - A", total: 82, high: 6, mod: 12, low: 64 },
    ],
    trajectory: [
      { month: "Jul", score: 66, attendance: 82 },
      { month: "Aug", score: 68, attendance: 83 },
      { month: "Sep", score: 70, attendance: 84 },
      { month: "Oct", score: 71, attendance: 86 },
      { month: "Nov", score: 73, attendance: 87 },
      { month: "Dec", score: 75, attendance: 88 },
    ],
    flaggedStudents: [
      {
        id: "STU3012",
        name: "Pranav Shinde",
        className: "TE ME - A",
        risk: "High",
        concern: "Thermodynamics internal marks below 40% benchmark",
        date: "Oct 27, 2026",
      },
      {
        id: "STU3044",
        name: "Tanvi Gokhale",
        className: "SE ME - A",
        risk: "Moderate",
        concern: "Workshop journal submissions delayed by 9 days",
        date: "Oct 24, 2026",
      },
    ],
  },
  "EXTC Engineering": {
    code: "EXTC",
    totalStudents: 368,
    totalDelta: "+1.9%",
    atRiskCount: 39,
    atRiskDelta: "-2.8%",
    goodStanding: 329,
    goodDelta: "+3.5%",
    coveragePct: 74.4,
    coveredCount: 29,
    coverageDelta: "+6.0%",
    activePlans: 14,
    plansDelta: "+4.2%",
    inProgress: 7,
    completed: 4,
    planned: 2,
    overdue: 1,
    facultyTotal: 19,
    facultyLeading: 14,
    facultyFollowups: 10,
    avgMentees: "19.4",
    cohorts: [
      { name: "SE EXTC - A", total: 74, high: 6, mod: 12, low: 56 },
      { name: "SE EXTC - B", total: 72, high: 7, mod: 11, low: 54 },
      { name: "TE EXTC - A", total: 75, high: 10, mod: 14, low: 51 },
      { name: "TE EXTC - B", total: 73, high: 8, mod: 12, low: 53 },
      { name: "BE EXTC - A", total: 74, high: 5, mod: 10, low: 59 },
    ],
    trajectory: [
      { month: "Jul", score: 70, attendance: 84 },
      { month: "Aug", score: 71, attendance: 85 },
      { month: "Sep", score: 72, attendance: 86 },
      { month: "Oct", score: 74, attendance: 88 },
      { month: "Nov", score: 76, attendance: 89 },
      { month: "Dec", score: 78, attendance: 90 },
    ],
    flaggedStudents: [
      {
        id: "STU4009",
        name: "Aditya Rao",
        className: "TE EXTC - A",
        risk: "High",
        concern: "Signals & Systems lab absences combined with low quiz score",
        date: "Oct 28, 2026",
      },
      {
        id: "STU4027",
        name: "Meera Nair",
        className: "SE EXTC - B",
        risk: "Moderate",
        concern: "Digital Logic practical submission incomplete",
        date: "Oct 26, 2026",
      },
    ],
  },
};

const SEMESTER_MULTIPLIERS: Record<string, { extraHighPerCohort: number; scoreOffset: number; label: string }> = {
  "AY 2026–27 (Sem III)": { extraHighPerCohort: 0, scoreOffset: 0, label: "Current Term" },
  "AY 2026–27 (Sem II)": { extraHighPerCohort: 1, scoreOffset: -2, label: "Prior Term" },
  "AY 2025–26 (Sem II)": { extraHighPerCohort: 2, scoreOffset: -3, label: "Archived Term" },
};

function pct(part: number, total: number) {
  return total > 0 ? ((part / total) * 100).toFixed(1) : "0.0";
}

export default function DepartmentDashboardPage() {
  const router = useRouter();
  const { isReadOnly, activeRole } = useAuthStore();
  const { addToast } = useUIStore();
  const { t } = useT();

  const readOnlyMode = isReadOnly || activeRole === "management";

  const [selectedSemester, setSelectedSemester] = useState("AY 2026–27 (Sem III)");
  const [semesterDropdownOpen, setSemesterDropdownOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("Information Technology");
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);

  const telemetry = useMemo(() => {
    const base = DEPT_TELEMETRY[selectedDepartment] ?? DEPT_TELEMETRY["Information Technology"];
    const mod = SEMESTER_MULTIPLIERS[selectedSemester] ?? SEMESTER_MULTIPLIERS["AY 2026–27 (Sem III)"];

    // Derive cohort rows and KPI sums identically so table rows, donut counts, and KPI cards match 100%
    const cohorts = base.cohorts.map((row) => {
      const high = Math.max(1, row.high + mod.extraHighPerCohort);
      const low = Math.max(10, row.low - mod.extraHighPerCohort);
      return {
        ...row,
        high,
        low,
        total: high + row.mod + low,
      };
    });

    const totalStudents = cohorts.reduce((sum, r) => sum + r.total, 0);
    const atRiskCount = cohorts.reduce((sum, r) => sum + r.high, 0);
    const goodStanding = cohorts.reduce((sum, r) => sum + r.mod + r.low, 0);
    const activePlans = base.inProgress + base.completed + base.planned + base.overdue;
    const coveredCount = Math.min(atRiskCount, Math.max(10, base.coveredCount + mod.extraHighPerCohort * 2));
    const coveragePct = Number(((coveredCount / atRiskCount) * 100).toFixed(1));

    const trajectory = base.trajectory.map((pt) => ({
      month: pt.month,
      score: Math.max(40, Math.min(99, pt.score + mod.scoreOffset)),
      attendance: Math.max(60, Math.min(99, pt.attendance + Math.round(mod.scoreOffset / 2))),
    }));

    return {
      ...base,
      cohorts,
      totalStudents,
      activePlans,
      termStatus: mod.label,
      atRiskCount,
      goodStanding,
      coveredCount,
      coveragePct,
      trajectory,
    };
  }, [selectedDepartment, selectedSemester]);

  const interventionDonutData = useMemo(
    () => [
      { name: "Stable", value: telemetry.inProgress },
      { name: "Low", value: telemetry.completed },
      { name: "Medium", value: telemetry.planned },
      { name: "Critical", value: telemetry.overdue },
    ],
    [telemetry]
  );

  const interventionLegend = [
    { label: "In Progress", count: telemetry.inProgress, color: "#0A2E0E" },
    { label: "Completed", count: telemetry.completed, color: "#059669" },
    { label: "Planned", count: telemetry.planned, color: "#D9A441" },
    { label: "Overdue", count: telemetry.overdue, color: "#DC2626" },
  ];

  const leadingPct = Math.round((telemetry.facultyLeading / telemetry.facultyTotal) * 100);
  const followupPct = Math.round((telemetry.facultyFollowups / telemetry.facultyTotal) * 100);

  return (
    <div className="flex flex-col w-full gap-y-7 pb-12">
      {readOnlyMode && (
        <div
          role="status"
          className="rounded-[16px] border border-[#F5E0B5] bg-[#FFFDF7] px-4 py-3 flex items-center justify-between gap-3 text-[13px] text-[#7A5210]"
        >
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[18px]">visibility</span>
            <span>
              <strong>Executive Read-Only Oversight:</strong> Viewing department telemetry in non-mutating Management mode. Individual student advisories remain restricted to assigned faculty.
            </span>
          </div>
          <Link
            href="/coordinator/reports"
            className="shrink-0 px-3 py-1 rounded-full bg-white border border-[#E6C78A] text-[12px] font-semibold text-[#7A5210] hover:bg-[#FFF9EB]"
          >
            Reports Hub
          </Link>
        </div>
      )}

      {/* 1. Editorial Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pt-1">
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11.5px] font-semibold text-[#666D7A] tracking-wider uppercase">
              Academic Operations &amp; Intelligence · {telemetry.termStatus}
            </span>
          </div>
          <h1 className="text-[32px] sm:text-[36px] font-normal tracking-[-0.025em] text-[#181D26] leading-tight">
            {t("Department Dashboard")}
          </h1>
          <p className="text-[13.5px] text-[#666D7A] mt-0.5 max-w-xl">
            Overview of {selectedDepartment} academic performance, student risk distribution, faculty load, and intervention coverage.
          </p>
        </div>

        {/* Right Controls / Filters */}
        <div className="flex items-center flex-wrap sm:flex-nowrap justify-start xl:justify-end gap-2.5 shrink-0">
          {/* Department Dropdown */}
          <div className="relative inline-flex items-center">
            <button
              type="button"
              onClick={() => {
                setDeptDropdownOpen(!deptDropdownOpen);
                setSemesterDropdownOpen(false);
              }}
              className="flex items-center gap-2 h-10 px-3.5 bg-white rounded-[12px] border border-[#E0E2E6] shadow-[0_1px_3px_rgba(0,0,0,0.03)] text-[#181D26] hover:bg-[#F8FAFC] transition-all cursor-pointer font-medium text-[13px]"
            >
              <span className="text-[#666D7A]">Dept:</span>
              <span className="font-semibold text-[#181D26]">{selectedDepartment}</span>
              <span className="material-symbols-outlined text-[18px] text-[#666D7A]">expand_more</span>
            </button>
            {deptDropdownOpen && (
              <div className="absolute right-0 top-11 mt-1 w-64 bg-white rounded-[14px] shadow-[0_8px_24px_rgba(0,0,0,0.08)] border border-[#E0E2E6] py-1.5 z-30">
                {Object.keys(DEPT_TELEMETRY).map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => {
                      setSelectedDepartment(dept);
                      setDeptDropdownOpen(false);
                      addToast({
                        title: "Department Switched",
                        message: `Viewing telemetry for ${dept}`,
                        type: "info",
                      });
                    }}
                    className={`w-full text-left px-4 py-2 text-[13px] hover:bg-[#F7F8FA] transition-colors flex items-center justify-between cursor-pointer ${
                      selectedDepartment === dept ? "text-[#181D26] font-semibold bg-[#F0F2F5]" : "text-[#333840]"
                    }`}
                  >
                    <span>{dept}</span>
                    {selectedDepartment === dept && (
                      <span className="material-symbols-outlined text-[16px] text-[#181D26]">check</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Academic Year Dropdown */}
          <div className="relative inline-flex items-center">
            <button
              type="button"
              onClick={() => {
                setSemesterDropdownOpen(!semesterDropdownOpen);
                setDeptDropdownOpen(false);
              }}
              className="flex items-center gap-2 h-10 px-3.5 bg-white rounded-[12px] border border-[#E0E2E6] shadow-[0_1px_3px_rgba(0,0,0,0.03)] text-[#181D26] hover:bg-[#F8FAFC] transition-all cursor-pointer font-medium text-[13px]"
            >
              <span className="material-symbols-outlined text-[#181D26] text-[17px]">calendar_month</span>
              <span className="font-semibold text-[#181D26]">{selectedSemester}</span>
              <span className="material-symbols-outlined text-[18px] text-[#666D7A]">expand_more</span>
            </button>
            {semesterDropdownOpen && (
              <div className="absolute right-0 top-11 mt-1 w-56 bg-white rounded-[14px] shadow-[0_8px_24px_rgba(0,0,0,0.08)] border border-[#E0E2E6] py-1.5 z-30">
                {Object.keys(SEMESTER_MULTIPLIERS).map((sem) => (
                  <button
                    key={sem}
                    type="button"
                    onClick={() => {
                      setSelectedSemester(sem);
                      setSemesterDropdownOpen(false);
                      addToast({
                        title: "Term Updated",
                        message: `Switched department snapshot to ${sem}.`,
                        type: "info",
                      });
                    }}
                    className={`w-full text-left px-4 py-2 text-[13px] hover:bg-[#F7F8FA] transition-colors flex items-center justify-between cursor-pointer ${
                      selectedSemester === sem ? "text-[#181D26] font-semibold bg-[#F0F2F5]" : "text-[#333840]"
                    }`}
                  >
                    <span>{sem}</span>
                    {selectedSemester === sem && (
                      <span className="material-symbols-outlined text-[16px] text-[#181D26]">check</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/coordinator/reports"
            className="h-10 px-4 bg-[#181D26] text-white rounded-[12px] shadow-sm flex items-center gap-2 text-[13px] font-semibold hover:bg-black transition-colors whitespace-nowrap shrink-0"
          >
            <span className="material-symbols-outlined text-[17px]">summarize</span>
            <span>Reports Hub</span>
          </Link>
        </div>
      </div>

      {/* 2. Top KPI Cards Row (5 Balanced Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-[20px] bg-white border border-[#E0E2E6] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#F7F8FA] border border-[#E0E2E6] flex items-center justify-center text-[#181D26]">
              <span className="material-symbols-outlined text-[20px]">group</span>
            </div>
            <span className="whitespace-nowrap px-2.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#0A2E0E] text-[11px] font-bold">
              ↑ {telemetry.totalDelta}
            </span>
          </div>
          <div>
            <div className="font-mono text-[30px] font-medium tracking-tight text-[#181D26] leading-none">
              {telemetry.totalStudents}
            </div>
            <div className="text-[12.5px] font-semibold text-[#181D26] mt-2">Total Students</div>
            <div className="text-[11.5px] text-[#666D7A] mt-0.5">
              Across {telemetry.cohorts.length} {telemetry.code} cohorts
            </div>
          </div>
        </div>

        <div className="rounded-[20px] bg-white border border-[#E0E2E6] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#FDF2F0] border border-[#FADBD8] flex items-center justify-center text-[#AA2D00]">
              <span className="material-symbols-outlined text-[20px]">warning</span>
            </div>
            <span className="whitespace-nowrap px-2.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#0A2E0E] text-[11px] font-bold">
              ↓ {telemetry.atRiskDelta}
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[30px] font-medium tracking-tight text-[#AA2D00] leading-none">
                {telemetry.atRiskCount}
              </span>
              <span className="text-[11px] font-bold text-[#AA2D00] bg-[#FDF2F0] px-2 py-0.5 rounded-full">
                {pct(telemetry.atRiskCount, telemetry.totalStudents)}%
              </span>
            </div>
            <div className="text-[12.5px] font-semibold text-[#181D26] mt-2">Identified At-Risk</div>
            <div className="text-[11.5px] text-[#666D7A] mt-0.5">Priority review requested</div>
          </div>
        </div>

        <div className="rounded-[20px] bg-white border border-[#E0E2E6] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#E8F5E9] border border-[#C8E6C9] flex items-center justify-center text-[#0A2E0E]">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
            </div>
            <span className="whitespace-nowrap px-2.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#0A2E0E] text-[11px] font-bold">
              ↑ {telemetry.goodDelta}
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[30px] font-medium tracking-tight text-[#181D26] leading-none">
                {telemetry.goodStanding}
              </span>
              <span className="text-[11px] font-bold text-[#0A2E0E] bg-[#E8F5E9] px-2 py-0.5 rounded-full">
                {pct(telemetry.goodStanding, telemetry.totalStudents)}%
              </span>
            </div>
            <div className="text-[12.5px] font-semibold text-[#181D26] mt-2">{t("In Good Standing")}</div>
            <div className="text-[11.5px] text-[#666D7A] mt-0.5">Maintaining benchmarks</div>
          </div>
        </div>

        <div className="rounded-[20px] bg-white border border-[#E0E2E6] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#F7F8FA] border border-[#E0E2E6] flex items-center justify-center text-[#181D26]">
              <span className="material-symbols-outlined text-[20px]">analytics</span>
            </div>
            <span className="whitespace-nowrap px-2.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#0A2E0E] text-[11px] font-bold">
              ↑ {telemetry.coverageDelta}
            </span>
          </div>
          <div>
            <div className="font-mono text-[30px] font-medium tracking-tight text-[#181D26] leading-none">
              {telemetry.coveragePct}%
            </div>
            <div className="text-[12.5px] font-semibold text-[#181D26] mt-2">{t("Intervention Coverage")}</div>
            <div className="text-[11.5px] text-[#666D7A] mt-0.5">
              {telemetry.coveredCount} of {telemetry.atRiskCount} at-risk active
            </div>
          </div>
        </div>

        <div className="rounded-[20px] bg-white border border-[#E0E2E6] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#F7F8FA] border border-[#E0E2E6] flex items-center justify-center text-[#181D26]">
              <span className="material-symbols-outlined text-[20px]">school</span>
            </div>
            <span className="whitespace-nowrap px-2.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#0A2E0E] text-[11px] font-bold">
              ↑ {telemetry.plansDelta}
            </span>
          </div>
          <div>
            <div className="font-mono text-[30px] font-medium tracking-tight text-[#181D26] leading-none">
              {telemetry.activePlans}
            </div>
            <div className="text-[12.5px] font-semibold text-[#181D26] mt-2">{t("Active Action Plans")}</div>
            <div className="text-[11.5px] text-[#666D7A] mt-0.5">
              {telemetry.inProgress} in progress · {telemetry.completed} completed
            </div>
          </div>
        </div>
      </div>

      {/* 3. Operational Diagnostics: Table (7 cols) + Interactive Donut Breakdown (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 rounded-[22px] bg-white border border-[#E0E2E6] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[17px] font-semibold text-[#181D26]">
                  Risk Distribution by Class / Division
                </h2>
                <p className="text-[12px] text-[#666D7A] mt-0.5">
                  Cohort telemetry across {selectedDepartment} divisions
                </p>
              </div>
              <Link
                href="/coordinator/reports?tab=class"
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#181D26] hover:underline"
              >
                <span>Full Diagnostics</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="text-[#666D7A] text-[11px] font-semibold uppercase tracking-wider bg-[#F7F8FA]">
                    <th className="py-2.5 px-3.5 rounded-l-[10px]">Class / Division</th>
                    <th className="py-2.5 px-3 text-center">Total</th>
                    <th className="py-2.5 px-3 text-center text-[#AA2D00]">High Risk</th>
                    <th className="py-2.5 px-3 text-center text-[#9A6F18]">Moderate</th>
                    <th className="py-2.5 px-3.5 rounded-r-[10px] text-center text-[#0A2E0E]">Low / Safe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F2F5]">
                  {telemetry.cohorts.map((row) => (
                    <tr
                      key={row.name}
                      onClick={() => router.push(`/coordinator/reports?tab=class&class=${encodeURIComponent(row.name)}`)}
                      className="hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-3.5 font-semibold text-[#181D26] group-hover:text-[#5E6AD2]">
                        {row.name}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-[#666D7A] font-medium">{row.total}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 whitespace-nowrap px-2.5 py-0.5 rounded-full bg-[#FDF2F0] text-[#AA2D00] text-[11px] font-bold">
                          {row.high} ({pct(row.high, row.total)}%)
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 whitespace-nowrap px-2.5 py-0.5 rounded-full bg-[#FFF9EB] text-[#9A6F18] text-[11px] font-bold">
                          {row.mod} ({pct(row.mod, row.total)}%)
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <span className="inline-flex items-center gap-1 whitespace-nowrap px-2.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#0A2E0E] text-[11px] font-bold">
                          {row.low} ({pct(row.low, row.total)}%)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Intervention Status Donut */}
        <div className="lg:col-span-5">
          <ChartCard
            title="Intervention Status & Execution"
            subtitle={`Execution across ${telemetry.activePlans} active action plans`}
            ariaLabel={`Intervention breakdown for ${selectedDepartment}: ${telemetry.inProgress} in progress, ${telemetry.completed} completed, ${telemetry.planned} planned, ${telemetry.overdue} overdue`}
            data={interventionLegend.map((item) => ({
              Status: item.label,
              Count: item.count,
              Share: `${pct(item.count, telemetry.activePlans)}%`,
            }))}
            filename={`${telemetry.code.toLowerCase()}-intervention-status`}
            height={230}
          >
            <div className="flex flex-col sm:flex-row items-center gap-4 h-full">
              <div className="w-40 h-44 shrink-0">
                <RiskDonutChart data={interventionDonutData} height={176} />
              </div>
              <div className="flex flex-col gap-2.5 w-full min-w-0">
                {interventionLegend.map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-[12.5px]">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-[#333840] font-medium">{item.label}</span>
                    </div>
                    <span className="font-mono font-semibold text-[#181D26]">
                      {pct(item.count, telemetry.activePlans)}%{" "}
                      <span className="font-normal text-[#666D7A]">({item.count})</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* 4. Second Row: Academic Trajectory (7 cols) + Faculty Workload (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          <ChartCard
            title="Academic Trajectory & Attendance"
            subtitle={`Monthly correlation between assessment scores and attendance (${selectedDepartment})`}
            ariaLabel={`Monthly trajectory of average score and attendance for ${selectedDepartment} in ${selectedSemester}`}
            data={telemetry.trajectory}
            filename={`${telemetry.code.toLowerCase()}-academic-trajectory`}
            height={235}
          >
            <TrendLineChart
              data={telemetry.trajectory}
              xKey="month"
              series={[
                { key: "attendance", label: "Attendance %", color: "#5E6AD2" },
                { key: "score", label: "Avg. Score %", color: "#181D26" },
              ]}
              height={225}
            />
          </ChartCard>
        </div>

        {/* Right: Faculty Workload */}
        <div className="lg:col-span-5 rounded-[22px] bg-white border border-[#E0E2E6] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-[17px] font-semibold text-[#181D26]">Faculty Workload &amp; Mentorship</h2>
                <p className="text-[12px] text-[#666D7A] mt-0.5">Coverage of {telemetry.code} advising load</p>
              </div>
              <Link
                href="/coordinator/reports?tab=intervention"
                aria-label="Open intervention & faculty reports"
                className="w-8 h-8 rounded-[10px] bg-[#F7F8FA] hover:bg-[#F0F2F5] border border-[#E0E2E6] flex items-center justify-center text-[#666D7A] hover:text-[#181D26] transition-colors"
              >
                <span className="material-symbols-outlined text-[17px]">chevron_right</span>
              </Link>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F5]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[12px] bg-[#F7F8FA] border border-[#E0E2E6] flex items-center justify-center text-[#181D26]">
                    <span className="material-symbols-outlined text-[20px]">badge</span>
                  </div>
                  <div>
                    <span className="text-[13.5px] text-[#181D26] font-semibold block">Total Department Faculty</span>
                    <span className="text-[11.5px] text-[#666D7A]">Active mentors &amp; instructors</span>
                  </div>
                </div>
                <span className="font-mono text-[28px] font-normal tracking-tight text-[#181D26]">
                  {telemetry.facultyTotal}
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between text-[12px] mb-1.5 whitespace-nowrap">
                  <span className="text-[#666D7A] font-medium">Faculty Leading Interventions</span>
                  <span className="font-mono text-[#181D26] font-semibold">
                    {telemetry.facultyLeading} / {telemetry.facultyTotal} ·{" "}
                    <span className="text-[#0A2E0E] font-bold">{leadingPct}%</span>
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#F0F2F5] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#181D26] rounded-full transition-all duration-500"
                    style={{ width: `${leadingPct}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[12px] mb-1.5 whitespace-nowrap">
                  <span className="text-[#666D7A] font-medium">Faculty with Active Follow-ups</span>
                  <span className="font-mono text-[#181D26] font-semibold">
                    {telemetry.facultyFollowups} / {telemetry.facultyTotal} ·{" "}
                    <span className="text-[#5E6AD2] font-bold">{followupPct}%</span>
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#F0F2F5] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#5E6AD2] rounded-full transition-all duration-500"
                    style={{ width: `${followupPct}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#F0F2F5]">
                <div>
                  <span className="text-[13px] text-[#181D26] font-semibold block">Average Mentees per Faculty</span>
                  <span className="text-[11px] text-[#666D7A]">Target maximum: 25.0</span>
                </div>
                <span className="font-mono inline-flex items-center px-3 py-1 rounded-[10px] bg-[#F7F8FA] border border-[#E0E2E6] text-[14px] font-bold text-[#181D26]">
                  {telemetry.avgMentees}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom Section: Priority Attention Roster */}
      <div className="w-full rounded-[22px] bg-white border border-[#E0E2E6] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[17px] font-semibold text-[#181D26]">
              {t("Immediate Attention Required")}
            </h2>
            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-[#FDF2F0] text-[#AA2D00] text-[11px] font-bold">
              {telemetry.flaggedStudents.length} Flagged
            </span>
          </div>
          <Link
            href={readOnlyMode ? "/coordinator/reports?tab=class" : "/teacher/students"}
            className="text-[12.5px] text-[#181D26] font-semibold hover:underline inline-flex items-center gap-1"
          >
            <span>{readOnlyMode ? "View Cohort Reports" : `View All ${telemetry.atRiskCount} Flagged`}</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px]">
            <thead>
              <tr className="text-[#666D7A] text-[10.5px] font-semibold uppercase tracking-wider bg-[#F7F8FA]">
                <th className="py-2.5 px-3 rounded-l-[10px]">Student</th>
                <th className="py-2.5 px-2.5">Class</th>
                <th className="py-2.5 px-2.5">Risk Level</th>
                <th className="py-2.5 px-3">Key Concern</th>
                <th className="py-2.5 px-2.5">Last Update</th>
                <th className="py-2.5 px-3 rounded-r-[10px] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F2F5]">
              {telemetry.flaggedStudents.map((stu) => (
                <tr
                  key={stu.id}
                  onClick={() => {
                    if (readOnlyMode) {
                      router.push(`/coordinator/reports?tab=class&class=${encodeURIComponent(stu.className)}`);
                    } else {
                      router.push(`/teacher/students/${stu.id}`);
                    }
                  }}
                  className="hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={stu.name} size={30} />
                      <div>
                        <span className="font-semibold text-[#181D26] whitespace-nowrap block group-hover:text-[#5E6AD2] transition-colors">
                          {readOnlyMode ? `Cohort Case · ${stu.id}` : stu.name}
                        </span>
                        <span className="font-mono text-[10.5px] text-[#666D7A]">{stu.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2.5 text-[#666D7A] whitespace-nowrap font-medium">
                    {stu.className}
                  </td>
                  <td className="py-3 px-2.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        stu.risk === "High"
                          ? "bg-[#FDF2F0] text-[#AA2D00]"
                          : "bg-[#FFF9EB] text-[#9A6F18]"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[13px]">
                        {stu.risk === "High" ? "warning" : "info"}
                      </span>
                      {stu.risk} Risk
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#333840]" title={stu.concern}>
                    <p className="max-w-[200px] 2xl:max-w-[340px] truncate">{stu.concern}</p>
                  </td>
                  <td className="py-3 px-2.5 text-[#666D7A] whitespace-nowrap font-medium text-[11.5px]">
                    {stu.date}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <Link
                      href={
                        readOnlyMode
                          ? `/coordinator/reports?tab=class&class=${encodeURIComponent(stu.className)}`
                          : `/teacher/students/${stu.id}`
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-[#181D26] text-white text-[11.5px] font-semibold hover:bg-black transition-all shadow-xs"
                    >
                      {readOnlyMode ? "Inspect Cohort" : "View 360"}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
