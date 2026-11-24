"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { useT } from "@/lib/i18n/useT";
import ModalShell from "@/components/ui/ModalShell";
import {
  BarComparisonChart,
  ChartCard,
  RiskDonutChart,
  TrendLineChart,
} from "@/components/charts/ChartCard";

interface TermSeed {
  atRisk: number;
  modRisk: number;
  lowRisk: number;
  avgTurnaround: string;
  precision: number;
  recall: number;
  prAuc: number;
  falseAlertRate: number;
  postImprovementGain: string;
  weeklyActiveTeachersCount: number;
  facultyTotal: number;
  dataQualityScore: number;
  openDuplicates: number;
  priorTrend: { month: string; Low: number; Moderate: number; High: number }[];
  endMonthLabel: string;
  successByType: { type: string; resolved: number; cases: number }[];
  heatmap: { dept: string; y1: number; y2: number; y3: number; y4: number }[];
}

interface TermDataset {
  totalStudents: number;
  atRisk: number;
  atRiskPct: number;
  goodStanding: number;
  goodPct: number;
  modRisk: number;
  lowRisk: number;
  interventionSuccess: number;
  activeInterventions: number;
  resolvedCases: number;
  avgTurnaround: string;
  precision: number;
  recall: number;
  prAuc: number;
  falseAlertRate: number;
  postImprovementGain: string;
  weeklyActiveTeachersPct: number;
  weeklyActiveTeachersCount: string;
  dataQualityScore: number;
  openDuplicates: number;
  trend: { month: string; Low: number; Moderate: number; High: number }[];
  successByType: { type: string; resolvedPct: number; resolved: number; cases: number }[];
  heatmap: { dept: string; y1: number; y2: number; y3: number; y4: number }[];
}

function buildTermDataset(seed: TermSeed): TermDataset {
  const totalStudents = seed.lowRisk + seed.modRisk + seed.atRisk;
  const goodStanding = seed.lowRisk + seed.modRisk;
  const atRiskPct = Number(((seed.atRisk / totalStudents) * 100).toFixed(1));
  const modPct = Number(((seed.modRisk / totalStudents) * 100).toFixed(1));
  const lowPct = Number((100 - atRiskPct - modPct).toFixed(1));
  const goodPct = Number((100 - atRiskPct).toFixed(1));

  const successByType = seed.successByType.map((item) => ({
    ...item,
    resolvedPct: Number(((item.resolved / item.cases) * 100).toFixed(1)),
  }));
  const activeInterventions = successByType.reduce((acc, row) => acc + row.cases, 0);
  const resolvedCases = successByType.reduce((acc, row) => acc + row.resolved, 0);
  const interventionSuccess = Number(((resolvedCases / activeInterventions) * 100).toFixed(1));
  const weeklyActiveTeachersPct = Math.round((seed.weeklyActiveTeachersCount / seed.facultyTotal) * 100);

  return {
    totalStudents,
    atRisk: seed.atRisk,
    atRiskPct,
    goodStanding,
    goodPct,
    modRisk: seed.modRisk,
    lowRisk: seed.lowRisk,
    interventionSuccess,
    activeInterventions,
    resolvedCases,
    avgTurnaround: seed.avgTurnaround,
    precision: seed.precision,
    recall: seed.recall,
    prAuc: seed.prAuc,
    falseAlertRate: seed.falseAlertRate,
    postImprovementGain: seed.postImprovementGain,
    weeklyActiveTeachersPct,
    weeklyActiveTeachersCount: `${seed.weeklyActiveTeachersCount} / ${seed.facultyTotal} faculty`,
    dataQualityScore: seed.dataQualityScore,
    openDuplicates: seed.openDuplicates,
    trend: [...seed.priorTrend, { month: seed.endMonthLabel, Low: lowPct, Moderate: modPct, High: atRiskPct }],
    successByType,
    heatmap: seed.heatmap,
  };
}

const TERM_SEEDS: Record<string, TermSeed> = {
  "AY 2026–27 (Sem II)": {
    atRisk: 412,
    modRisk: 976,
    lowRisk: 3504,
    avgTurnaround: "11.4 Days",
    // Exact match with Production model v2.4.1 confusion matrix (TP 363, FP 36, FN 49, TN 4444)
    precision: 0.91,
    recall: 0.881,
    prAuc: 0.874,
    falseAlertRate: 9.0,
    postImprovementGain: "+14.6 pts",
    weeklyActiveTeachersCount: 64,
    facultyTotal: 72,
    dataQualityScore: 98.8,
    openDuplicates: 3,
    priorTrend: [
      { month: "Jun", Low: 68.0, Moderate: 22.0, High: 10.0 },
      { month: "Jul", Low: 69.0, Moderate: 21.0, High: 10.0 },
      { month: "Aug", Low: 70.0, Moderate: 21.0, High: 9.0 },
      { month: "Sep", Low: 71.0, Moderate: 20.0, High: 9.0 },
      { month: "Oct", Low: 71.5, Moderate: 20.0, High: 8.5 },
    ],
    endMonthLabel: "Nov",
    successByType: [
      { type: "Peer Tutoring", resolved: 119, cases: 142 },
      { type: "Attendance Contract", resolved: 66, cases: 86 },
      { type: "Faculty Coaching", resolved: 44, cases: 62 },
      { type: "Counseling", resolved: 23, cases: 38 },
    ],
    heatmap: [
      { dept: "IT", y1: 6.2, y2: 7.4, y3: 5.7, y4: 3.1 },
      { dept: "Comp", y1: 6.8, y2: 7.9, y3: 7.1, y4: 4.0 },
      { dept: "Mech", y1: 11.4, y2: 13.2, y3: 11.9, y4: 8.2 },
      { dept: "EXTC", y1: 8.5, y2: 9.8, y3: 8.8, y4: 5.4 },
      { dept: "Civil", y1: 9.2, y2: 10.6, y3: 9.8, y4: 6.1 },
    ],
  },
  "AY 2026–27 (Sem I)": {
    atRisk: 451,
    modRisk: 1012,
    lowRisk: 3277,
    avgTurnaround: "12.9 Days",
    precision: 0.886,
    recall: 0.85,
    prAuc: 0.842,
    falseAlertRate: 11.4,
    postImprovementGain: "+11.2 pts",
    weeklyActiveTeachersCount: 59,
    facultyTotal: 72,
    dataQualityScore: 97.6,
    openDuplicates: 5,
    priorTrend: [
      { month: "Jan", Low: 65.0, Moderate: 24.0, High: 11.0 },
      { month: "Feb", Low: 66.0, Moderate: 23.0, High: 11.0 },
      { month: "Mar", Low: 67.0, Moderate: 23.0, High: 10.0 },
      { month: "Apr", Low: 68.0, Moderate: 22.0, High: 10.0 },
      { month: "May", Low: 69.0, Moderate: 21.0, High: 10.0 },
    ],
    endMonthLabel: "Jun",
    successByType: [
      { type: "Peer Tutoring", resolved: 101, cases: 128 },
      { type: "Attendance Contract", resolved: 58, cases: 80 },
      { type: "Faculty Coaching", resolved: 39, cases: 58 },
      { type: "Counseling", resolved: 20, cases: 40 },
    ],
    heatmap: [
      { dept: "IT", y1: 7.4, y2: 8.1, y3: 6.8, y4: 3.9 },
      { dept: "Comp", y1: 7.9, y2: 8.8, y3: 7.6, y4: 4.5 },
      { dept: "Mech", y1: 12.6, y2: 14.0, y3: 12.4, y4: 9.1 },
      { dept: "EXTC", y1: 9.2, y2: 10.4, y3: 9.5, y4: 6.2 },
      { dept: "Civil", y1: 10.1, y2: 11.4, y3: 10.3, y4: 7.0 },
    ],
  },
  "AY 2025–26 (Full Year)": {
    atRisk: 498,
    modRisk: 1040,
    lowRisk: 2982,
    avgTurnaround: "14.2 Days",
    precision: 0.86,
    recall: 0.83,
    prAuc: 0.821,
    falseAlertRate: 14.0,
    postImprovementGain: "+9.4 pts",
    weeklyActiveTeachersCount: 54,
    facultyTotal: 72,
    dataQualityScore: 95.4,
    openDuplicates: 9,
    priorTrend: [
      { month: "Aug", Low: 62.0, Moderate: 25.0, High: 13.0 },
      { month: "Oct", Low: 63.0, Moderate: 25.0, High: 12.0 },
      { month: "Dec", Low: 64.0, Moderate: 24.0, High: 12.0 },
      { month: "Feb", Low: 65.0, Moderate: 23.0, High: 12.0 },
      { month: "Apr", Low: 65.5, Moderate: 23.2, High: 11.3 },
    ],
    endMonthLabel: "May",
    successByType: [
      { type: "Peer Tutoring", resolved: 81, cases: 110 },
      { type: "Attendance Contract", resolved: 50, cases: 74 },
      { type: "Faculty Coaching", resolved: 35, cases: 56 },
      { type: "Counseling", resolved: 20, cases: 40 },
    ],
    heatmap: [
      { dept: "IT", y1: 8.8, y2: 9.4, y3: 7.9, y4: 4.8 },
      { dept: "Comp", y1: 9.1, y2: 9.9, y3: 8.6, y4: 5.2 },
      { dept: "Mech", y1: 14.2, y2: 15.1, y3: 13.8, y4: 9.9 },
      { dept: "EXTC", y1: 10.6, y2: 11.8, y3: 10.4, y4: 7.1 },
      { dept: "Civil", y1: 11.4, y2: 12.6, y3: 11.2, y4: 7.8 },
    ],
  },
};

const TERM_DATA: Record<string, TermDataset> = Object.fromEntries(
  Object.entries(TERM_SEEDS).map(([k, v]) => [k, buildTermDataset(v)])
);

function heatTone(pct: number) {
  if (pct >= 11) return "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]";
  if (pct >= 8) return "bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]";
  return "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]";
}

export default function InstitutionKPIsPage() {
  const router = useRouter();
  const { user, activeRole } = useAuthStore();
  const { addToast } = useUIStore();
  const { t } = useT();
  const isReadOnly = user?.role === "management" || activeRole === "management";

  const [termDropdownOpen, setTermDropdownOpen] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<string>("AY 2026–27 (Sem II)");
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportFormat, setReportFormat] = useState<"pdf" | "csv">("pdf");
  const [generatingReport, setGeneratingReport] = useState(false);

  const data = TERM_DATA[selectedTerm] ?? TERM_DATA["AY 2026–27 (Sem II)"];

  // Safe drilldown routes for Management (never send Management to /coordinator or /teacher 403 routes)
  const deptHref = (dept: string) =>
    isReadOnly ? `/admin/reports?dept=${encodeURIComponent(dept)}` : "/coordinator/dashboard";
  const interventionHref = isReadOnly ? "/admin/reports?tab=interventions" : "/teacher/interventions";
  const alertsHref = isReadOnly ? "/admin/audit-log" : "/teacher/alerts";
  const modelHref = isReadOnly ? "/admin/reports?tab=model" : "/admin/model-monitor";
  const dataQualityHref = isReadOnly ? "/admin/reports?tab=overview" : "/admin/data-management";

  const donutData = [
    { name: "Low", value: data.lowRisk },
    { name: "Medium", value: data.modRisk },
    { name: "High", value: data.atRisk },
  ];

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingReport(true);
    setTimeout(() => {
      setGeneratingReport(false);
      setReportModalOpen(false);
      if (reportFormat === "csv") {
        const csv = [
          "Metric,Value,Term",
          `Total Students,${data.totalStudents},"${selectedTerm}"`,
          `At-Risk Students,${data.atRisk} (${data.atRiskPct}%),"${selectedTerm}"`,
          `Intervention Success,${data.interventionSuccess}%,"${selectedTerm}"`,
          `Model Precision / Recall,${data.precision} / ${data.recall},"${selectedTerm}"`,
          `False-Alert Rate,${data.falseAlertRate}%,"${selectedTerm}"`,
          `Weekly Active Teachers,${data.weeklyActiveTeachersPct}%,"${selectedTerm}"`,
        ].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "edusentinel_executive_kpis.csv";
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const html = `<html><head><title>EduSentinel Executive Summary - ${selectedTerm}</title></head><body style="font-family:sans-serif;padding:32px"><h1>EduSentinel AI — Executive KPI Summary (${selectedTerm})</h1><p>Total Students: ${data.totalStudents} | At-Risk: ${data.atRisk} (${data.atRiskPct}%)</p><p>Intervention Success: ${data.interventionSuccess}% | Post-Intervention Improvement: ${data.postImprovementGain}</p><p>Model Precision: ${data.precision}, Recall: ${data.recall}, PR-AUC: ${data.prAuc}, False-Alert Rate: ${data.falseAlertRate}%</p></body></html>`;
        const blob = new Blob([html], { type: "text/html;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "edusentinel_executive_summary.html";
        a.click();
        URL.revokeObjectURL(url);
      }
      addToast({
        title: "Report Generated Successfully",
        message: `Institutional KPIs Executive Summary (${reportFormat.toUpperCase()}) downloaded.`,
        type: "success",
      });
    }, 450);
  };

  return (
    <div className="text-[#181D26] pb-8">
      <div className="space-y-8">
        {isReadOnly && (
          <div className="bg-white border border-[#E0E2E6] rounded-[20px] p-4 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F7F8FA] flex items-center justify-center text-[#181D26]">
                <span aria-hidden="true" className="material-symbols-outlined text-[20px]">visibility</span>
              </div>
              <div>
                <h4 className="text-[14px] font-semibold text-[#181D26]">
                  Executive Management Mode (Read-Only)
                </h4>
                <p className="text-[12px] text-[#666D7A]">
                  Read-only oversight over institutional KPIs, risk heatmaps, model calibration, and compliance reports.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#181D26] text-white text-[11px] font-medium tracking-wide shrink-0">
              Audit Clearance
            </span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[12px] font-medium text-[#666D7A] uppercase tracking-wider mb-1">
              <span>Executive Governance</span>
              <span>/</span>
              <span className="text-[#181D26]">Institutional Telemetry</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-[34px] sm:text-[38px] font-normal tracking-[-0.025em] text-[#181D26] leading-tight">
                {t("Institution KPIs")}
              </h1>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-medium bg-[#A8D8C4]/40 text-[#0A2E0E] border border-[#A8D8C4]/60 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0A2E0E] animate-pulse" />
                Live AI Telemetry
              </span>
            </div>
            <p className="text-[14px] text-[#666D7A] mt-1 max-w-xl">
              Overall academic health, retention risk heatmap, model precision/recall, adoption, and intervention impact.
            </p>
          </div>

          <div className="flex items-center flex-wrap sm:flex-nowrap justify-start xl:justify-end gap-2.5 shrink-0">
            <div className="relative">
              <button
                type="button"
                onClick={() => setTermDropdownOpen(!termDropdownOpen)}
                className="inline-flex items-center gap-2 bg-white border border-[#E0E2E6] shadow-[0_2px_8px_rgba(0,0,0,0.03)] px-3.5 py-2.5 rounded-[14px] text-[#181D26] hover:bg-[#F8FAFC] transition-colors text-[13px] font-medium whitespace-nowrap cursor-pointer"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-[#666D7A]">calendar_today</span>
                <span>{selectedTerm}</span>
                <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-[#666D7A]">expand_more</span>
              </button>
              {termDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-[16px] shadow-[0_8px_24px_rgba(0,0,0,0.08)] border border-[#E0E2E6] py-1.5 z-20">
                  {Object.keys(TERM_DATA).map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => {
                        setSelectedTerm(term);
                        setTermDropdownOpen(false);
                        addToast({ title: "Academic Period Changed", message: `Telemetry view updated to ${term}`, type: "info" });
                      }}
                      className={`w-full text-left px-4 py-2 text-[13px] hover:bg-[#F7F8FA] transition-colors flex items-center justify-between cursor-pointer ${
                        selectedTerm === term ? "text-[#181D26] font-semibold bg-[#F7F8FA]" : "text-[#333840]"
                      }`}
                    >
                      <span>{term}</span>
                      {selectedTerm === term && (
                        <span aria-hidden="true" className="material-symbols-outlined text-[16px] text-[#181D26]">check</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {!isReadOnly && (
              <Link
                href="/admin/configuration"
                className="w-10 h-10 shrink-0 rounded-[14px] bg-white border border-[#E0E2E6] shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex items-center justify-center text-[#666D7A] hover:text-[#181D26] hover:bg-[#F8FAFC] transition-all"
                title="System Configuration"
                aria-label="Open System Configuration"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[20px]">tune</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => setReportModalOpen(true)}
              className="inline-flex items-center gap-2 bg-[#181D26] hover:bg-[#333840] text-white px-4 py-2.5 rounded-[14px] text-[13px] font-medium shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">download_for_offline</span>
              <span>{t("Generate Executive Report")}</span>
            </button>
          </div>
        </div>

        {/* Top 5 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-[22px] p-5 border border-[#E0E2E6] shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <span className="text-[13px] font-medium text-[#666D7A]">{t("Total Students")}</span>
            <div className="mt-3 text-[36px] font-semibold tracking-tight text-[#181D26]">
              {data.totalStudents.toLocaleString()}
            </div>
            <span className="text-[12px] font-medium text-[#0A2E0E] mt-2">{selectedTerm}</span>
          </div>

          <div className="bg-[#FFF8F5] rounded-[22px] p-5 border border-[#FCAB79]/40 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-[#AA2D00]">{t("At-Risk Students")}</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FCAB79]/40 text-[#AA2D00]">
                {data.atRiskPct}%
              </span>
            </div>
            <div className="mt-3 text-[36px] font-semibold tracking-tight text-[#AA2D00]">{data.atRisk}</div>
            <span className="text-[12px] font-medium text-[#AA2D00] mt-2">Flagged for early support</span>
          </div>

          <div className="bg-[#F4FAF7] rounded-[22px] p-5 border border-[#A8D8C4]/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-[#0A2E0E]">{t("In Good Standing")}</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#A8D8C4]/40 text-[#0A2E0E]">
                {data.goodPct}%
              </span>
            </div>
            <div className="mt-3 text-[36px] font-semibold tracking-tight text-[#0A2E0E]">
              {data.goodStanding.toLocaleString()}
            </div>
            <span className="text-[12px] font-medium text-[#0A2E0E] mt-2">Stable progress band</span>
          </div>

          <div className="bg-white rounded-[22px] p-5 border border-[#E0E2E6] shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <span className="text-[13px] font-medium text-[#666D7A]">Intervention Success</span>
            <div className="mt-3 text-[36px] font-semibold tracking-tight text-[#181D26]">{data.interventionSuccess}%</div>
            <span className="text-[12px] font-medium text-[#0A2E0E] mt-2">
              {data.resolvedCases} / {data.activeInterventions} resolved ({data.avgTurnaround})
            </span>
          </div>

          <div className="bg-white rounded-[22px] p-5 border border-[#E0E2E6] shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col justify-between sm:col-span-2 lg:col-span-1">
            <span className="text-[13px] font-medium text-[#666D7A]">Weekly Active Teachers</span>
            <div className="mt-3 text-[36px] font-semibold tracking-tight text-[#181D26]">
              {data.weeklyActiveTeachersPct}%
            </div>
            <span className="text-[12px] font-medium text-[#666D7A] mt-2">{data.weeklyActiveTeachersCount} adoption</span>
          </div>
        </div>

        {/* Core Analytical Grid: Recharts Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-4">
            <ChartCard
              title="Risk Distribution"
              subtitle={`Cohort share for ${selectedTerm}`}
              ariaLabel={`Risk distribution donut showing ${data.lowRisk} Low, ${data.modRisk} Medium, and ${data.atRisk} High risk students`}
              data={donutData}
              filename="institution_risk_distribution"
              height={216}
              className="h-full"
              footer={
                <div className="grid grid-cols-3 gap-2 text-center text-[12px]">
                  <div className="rounded-[12px] bg-[#FFF8F5] border border-[#FCAB79]/40 p-2">
                    <span className="text-[#AA2D00] font-semibold block">{data.atRisk}</span>
                    <span className="text-[#666D7A]">High</span>
                  </div>
                  <div className="rounded-[12px] bg-[#FFF9E5] border border-[#F4D35E]/40 p-2">
                    <span className="text-[#D9A441] font-semibold block">{data.modRisk.toLocaleString()}</span>
                    <span className="text-[#666D7A]">Moderate</span>
                  </div>
                  <div className="rounded-[12px] bg-[#F4FAF7] border border-[#A8D8C4]/50 p-2">
                    <span className="text-[#0A2E0E] font-semibold block">{data.lowRisk.toLocaleString()}</span>
                    <span className="text-[#666D7A]">Low</span>
                  </div>
                </div>
              }
            >
              <RiskDonutChart data={donutData} height={216} />
            </ChartCard>
          </div>

          <div className="lg:col-span-4">
            <ChartCard
              title="Risk Trend (6-Month Shift)"
              subtitle="Percentage across Low, Moderate & High bands"
              ariaLabel="6-month trend line chart of Low, Moderate, and High risk percentages"
              data={data.trend}
              filename="institution_risk_trend"
              height={292}
              className="h-full"
            >
              <TrendLineChart
                data={data.trend}
                xKey="month"
                series={[
                  { key: "Low", color: "#0A2E0E" },
                  { key: "Moderate", color: "#D9A441" },
                  { key: "High", color: "#AA2D00" },
                ]}
                height={292}
              />
            </ChartCard>
          </div>

          <div className="lg:col-span-4">
            <ChartCard
              title="Intervention Success Rate by Type"
              subtitle="Resolution % across core playbooks"
              ariaLabel="Bar chart of intervention success rates by playbook type"
              data={data.successByType}
              filename="intervention_success_by_type"
              height={292}
              className="h-full"
            >
              <BarComparisonChart
                data={data.successByType}
                xKey="type"
                series={[{ key: "resolvedPct", label: "Resolution %", color: "#181D26" }]}
                height={292}
              />
            </ChartCard>
          </div>
        </div>

        {/* Institution Risk Heatmap (Department × Year) */}
        <div className="bg-white rounded-[22px] p-6 border border-[#E0E2E6] shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-[18px] font-semibold text-[#181D26]">
                Institution Risk Heatmap (Department × Year of Study)
              </h2>
              <p className="text-[13px] text-[#666D7A] mt-0.5">
                At-risk concentration (%) across every undergraduate division. Click a department to drill down safely.
              </p>
            </div>
            <Link
              href={deptHref("Information Technology")}
              className="text-[13px] font-medium text-[#181D26] hover:underline inline-flex items-center gap-1"
            >
              <span>{isReadOnly ? "Open Departmental Reports" : "Open Coordinator View"}</span>
              <span aria-hidden="true" className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-2 min-w-[600px] text-[13px]">
              <thead>
                <tr className="text-[11px] font-semibold uppercase tracking-wider text-[#666D7A]">
                  <th className="py-2 px-3">Department</th>
                  <th className="py-2 px-3 text-center">Year 1 (FE)</th>
                  <th className="py-2 px-3 text-center">Year 2 (SE)</th>
                  <th className="py-2 px-3 text-center">Year 3 (TE)</th>
                  <th className="py-2 px-3 text-center">Year 4 (BE)</th>
                  <th className="py-2 px-3 text-right">Drilldown</th>
                </tr>
              </thead>
              <tbody>
                {data.heatmap.map((row) => (
                  <tr key={row.dept}>
                    <td className="py-2 px-3 font-semibold text-[#181D26]">{row.dept} Engineering</td>
                    {[row.y1, row.y2, row.y3, row.y4].map((val, idx) => (
                      <td key={idx} className="text-center">
                        <span className={`inline-block w-full py-2 rounded-[10px] border font-mono text-[12px] font-semibold ${heatTone(val)}`}>
                          {val.toFixed(1)}%
                        </span>
                      </td>
                    ))}
                    <td className="text-right px-3">
                      <button
                        type="button"
                        onClick={() => router.push(deptHref(row.dept))}
                        className="text-[12px] font-medium text-[#1B61C9] hover:underline cursor-pointer"
                      >
                        Inspect →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Executive Governance Strip: Model Precision/Recall, Post-Intervention Gain, Data Quality & Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Link
            href={modelHref}
            className="bg-white rounded-[20px] p-5 border border-[#E0E2E6] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-[#181D26] transition-all"
          >
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#666D7A]">
              Model Precision / Recall &amp; False-Alert
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-[22px] font-semibold font-mono text-[#181D26]">
                {data.precision.toFixed(3)} / {data.recall.toFixed(3)}
              </span>
              <span className="text-[12px] font-medium text-[#AA2D00]">FAR {data.falseAlertRate.toFixed(1)}%</span>
            </div>
            <p className="text-[12px] text-[#666D7A] mt-1">PR-AUC {data.prAuc.toFixed(3)} • LightGBM v2.4.1</p>
          </Link>

          <Link
            href={interventionHref}
            className="bg-[#F4FAF7] rounded-[20px] p-5 border border-[#A8D8C4]/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-[#0A2E0E] transition-all"
          >
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#0A2E0E]">
              Post-Intervention Improvement
            </span>
            <div className="mt-2 text-[24px] font-semibold font-mono text-[#0A2E0E]">
              {data.postImprovementGain}
            </div>
            <p className="text-[12px] text-[#0A2E0E]/80 mt-1">
              Mean attendance &amp; exam lift after 6-week plans
            </p>
          </Link>

          <Link
            href={dataQualityHref}
            className="bg-white rounded-[20px] p-5 border border-[#E0E2E6] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-[#181D26] transition-all"
          >
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#666D7A]">
              Data Quality Summary
            </span>
            <div className="mt-2 text-[24px] font-semibold font-mono text-[#181D26]">
              {data.dataQualityScore}% Complete
            </div>
            <p className="text-[12px] text-[#666D7A] mt-1">
              {data.openDuplicates} open duplicate pairs • Sync &lt; 15 min
            </p>
          </Link>

          <Link
            href={alertsHref}
            className="bg-[#FFF8F5] rounded-[20px] p-5 border border-[#FCAB79]/40 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-[#AA2D00] transition-all"
          >
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#AA2D00]">
              {isReadOnly ? "Compliance & Audit Trail" : "Early Warning Triggers"}
            </span>
            <div className="mt-2 text-[24px] font-semibold text-[#AA2D00]">
              {isReadOnly ? "14,820 Events" : "14 Urgent Flags"}
            </div>
            <p className="text-[12px] text-[#AA2D00]/80 mt-1">
              {isReadOnly ? "Inspect immutable governance log →" : "Students flagged < 70% attendance →"}
            </p>
          </Link>
        </div>
      </div>

      <ModalShell open={reportModalOpen} title="Export Institutional KPIs" onClose={() => setReportModalOpen(false)}>
        <form onSubmit={handleGenerateReport} className="space-y-4">
          <p className="text-[13px] text-[#666D7A]">Export period: <strong>{selectedTerm}</strong></p>
          <div className="grid grid-cols-2 gap-3">
            <label className={`flex items-center gap-3 p-3.5 rounded-[14px] border cursor-pointer ${reportFormat === "pdf" ? "border-[#181D26] bg-[#F7F8FA]" : "border-[#E0E2E6]"}`}>
              <input type="radio" name="format" checked={reportFormat === "pdf"} onChange={() => setReportFormat("pdf")} className="accent-[#181D26]" />
              <div>
                <span className="text-[13px] font-semibold block">Printable Summary</span>
                <span className="text-[11px] text-[#666D7A]">HTML / PDF-ready</span>
              </div>
            </label>
            <label className={`flex items-center gap-3 p-3.5 rounded-[14px] border cursor-pointer ${reportFormat === "csv" ? "border-[#181D26] bg-[#F7F8FA]" : "border-[#E0E2E6]"}`}>
              <input type="radio" name="format" checked={reportFormat === "csv"} onChange={() => setReportFormat("csv")} className="accent-[#181D26]" />
              <div>
                <span className="text-[13px] font-semibold block">CSV Data</span>
                <span className="text-[11px] text-[#666D7A]">Raw telemetry rows</span>
              </div>
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setReportModalOpen(false)} className="px-4 py-2 text-[13px] text-[#666D7A] cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={generatingReport} className="px-5 py-2.5 rounded-[12px] bg-[#181D26] text-white text-[13px] font-medium cursor-pointer disabled:opacity-50">
              {generatingReport ? "Generating..." : `Download ${reportFormat.toUpperCase()}`}
            </button>
          </div>
        </form>
      </ModalShell>
    </div>
  );
}
