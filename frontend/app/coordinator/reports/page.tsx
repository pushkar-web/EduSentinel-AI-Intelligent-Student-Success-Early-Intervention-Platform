"use client";

import React, { useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { useDemoDataStore, type PersistedCustomReport } from "@/store/useDemoDataStore";
import ModalShell from "@/components/ui/ModalShell";
import { ChartCard, BarComparisonChart } from "@/components/charts/ChartCard";

interface CohortReportRow {
  name: string;
  count: number;
  riskCount: number;
  avgScore: number;
  attendance: number;
  passRate: number;
}

const COHORTS_BY_AY: Record<string, CohortReportRow[]> = {
  "AY 2026–27": [
    { name: "SE IT - A", count: 98, riskCount: 8, avgScore: 78, attendance: 91, passRate: 94.2 },
    { name: "SE IT - B", count: 96, riskCount: 10, avgScore: 76, attendance: 89, passRate: 91.8 },
    { name: "TE IT - A", count: 97, riskCount: 14, avgScore: 74, attendance: 88, passRate: 88.6 },
    { name: "TE IT - B", count: 95, riskCount: 12, avgScore: 75, attendance: 90, passRate: 89.4 },
    { name: "BE IT - A", count: 100, riskCount: 8, avgScore: 81, attendance: 93, passRate: 96.0 },
  ],
  "AY 2025–26": [
    { name: "SE IT - A", count: 94, riskCount: 11, avgScore: 75, attendance: 89, passRate: 91.5 },
    { name: "SE IT - B", count: 92, riskCount: 12, avgScore: 74, attendance: 87, passRate: 89.8 },
    { name: "TE IT - A", count: 95, riskCount: 15, avgScore: 72, attendance: 86, passRate: 86.2 },
    { name: "TE IT - B", count: 91, riskCount: 13, avgScore: 73, attendance: 88, passRate: 87.9 },
    { name: "BE IT - A", count: 98, riskCount: 9, avgScore: 79, attendance: 91, passRate: 94.4 },
  ],
  "AY 2024–25": [
    { name: "SE IT - A", count: 90, riskCount: 12, avgScore: 73, attendance: 87, passRate: 89.7 },
    { name: "SE IT - B", count: 88, riskCount: 14, avgScore: 71, attendance: 85, passRate: 87.5 },
    { name: "TE IT - A", count: 92, riskCount: 16, avgScore: 70, attendance: 85, passRate: 85.0 },
    { name: "TE IT - B", count: 89, riskCount: 13, avgScore: 72, attendance: 87, passRate: 86.8 },
    { name: "BE IT - A", count: 95, riskCount: 10, avgScore: 77, attendance: 90, passRate: 92.6 },
  ],
};

const SUBJECTS_BY_AY: Record<string, { name: string; code: string; pass: string; avg: string; lead: string }[]> = {
  "AY 2026–27": [
    { name: "Data Structures & Algorithms", code: "IT301", pass: "88.4%", avg: "74/100", lead: "Dr. Sarah Khan" },
    { name: "Operating Systems", code: "IT302", pass: "86.1%", avg: "71/100", lead: "Mr. Akshay Patil" },
    { name: "Database Management Systems", code: "IT303", pass: "92.0%", avg: "79/100", lead: "Ms. Priya Sharma" },
    { name: "Computer Networks & Security", code: "IT304", pass: "84.5%", avg: "69/100", lead: "Prof. R. Deshmukh" },
  ],
  "AY 2025–26": [
    { name: "Data Structures & Algorithms", code: "IT301", pass: "85.9%", avg: "71/100", lead: "Dr. Sarah Khan" },
    { name: "Operating Systems", code: "IT302", pass: "83.7%", avg: "68/100", lead: "Mr. Akshay Patil" },
    { name: "Database Management Systems", code: "IT303", pass: "90.1%", avg: "76/100", lead: "Ms. Priya Sharma" },
    { name: "Computer Networks & Security", code: "IT304", pass: "82.4%", avg: "67/100", lead: "Prof. R. Deshmukh" },
  ],
  "AY 2024–25": [
    { name: "Data Structures & Algorithms", code: "IT301", pass: "84.0%", avg: "69/100", lead: "Dr. Sarah Khan" },
    { name: "Operating Systems", code: "IT302", pass: "81.8%", avg: "66/100", lead: "Mr. Akshay Patil" },
    { name: "Database Management Systems", code: "IT303", pass: "88.5%", avg: "74/100", lead: "Ms. Priya Sharma" },
    { name: "Computer Networks & Security", code: "IT304", pass: "80.2%", avg: "65/100", lead: "Prof. R. Deshmukh" },
  ],
};

function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [headers.join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function CoordinatorReportsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "class";
  const initialClass = searchParams.get("class") || "All Classes";
  const { user, isReadOnly, activeRole } = useAuthStore();
  const { addToast } = useUIStore();

  const readOnlyMode = isReadOnly || activeRole === "management";

  const [activeTab, setActiveTab] = useState<"class" | "subject" | "intervention" | "custom">(
    initialTab === "subject"
      ? "subject"
      : initialTab === "intervention" || initialTab === "interventions"
      ? "intervention"
      : initialTab === "custom"
      ? "custom"
      : "class"
  );

  const [selectedAY, setSelectedAY] = useState("AY 2026–27");
  const [selectedClass, setSelectedClass] = useState(initialClass);
  const [selectedReportType, setSelectedReportType] = useState("Performance Overview");

  const { customCoordinatorReports: customReports, addCustomCoordinatorReport } = useDemoDataStore();

  // Modal state
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState("IT Department Comprehensive Review");
  const [targetScope, setTargetScope] = useState("Entire IT Department (All 5 Divisions)");
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredCohorts = useMemo(() => {
    const base = COHORTS_BY_AY[selectedAY] ?? COHORTS_BY_AY["AY 2026–27"];
    if (selectedClass === "All Classes") return base;
    const match = base.filter((c) => c.name === selectedClass);
    return match.length > 0 ? match : base;
  }, [selectedAY, selectedClass]);

  const subjectCards = SUBJECTS_BY_AY[selectedAY] ?? SUBJECTS_BY_AY["AY 2026–27"];

  const chartSeries = useMemo(() => {
    if (selectedReportType === "Risk Assessment Analysis") {
      return [
        { key: "riskCount", label: "Flagged Students", color: "#AA2D00" },
        { key: "passRate", label: "Pass Rate %", color: "#0A2E0E" },
      ];
    }
    if (selectedReportType === "Attendance Correlation") {
      return [
        { key: "attendance", label: "Attendance %", color: "#5E6AD2" },
        { key: "passRate", label: "Pass Rate %", color: "#181D26" },
      ];
    }
    return [
      { key: "avgScore", label: "Avg. Score %", color: "#181D26" },
      { key: "attendance", label: "Attendance %", color: "#5E6AD2" },
    ];
  }, [selectedReportType]);

  const handleApplyFilters = () => {
    addToast({
      title: "Filters Applied",
      message: `Showing ${selectedReportType} for ${selectedClass} (${selectedAY})`,
      type: "info",
    });
  };

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnlyMode) {
      addToast({
        title: "Read-Only Restriction",
        message: "Management leadership accounts cannot create new departmental exports.",
        type: "warning",
      });
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGenerateModalOpen(false);
      addCustomCoordinatorReport({
        name: reportTitle.trim() || "Departmental Snapshot Report",
        cat: selectedReportType.split(" ")[0],
        scope: targetScope,
        date: new Date().toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
        by: user?.name || "Dr. Neha Sharma",
      });
      addToast({
        title: "Report Generated",
        message: `${reportTitle} added to Custom Reports and ready for CSV export.`,
        type: "success",
      });
      setActiveTab("custom");
    }, 500);
  };

  const handleDownloadReportCsv = (report: PersistedCustomReport) => {
    const slug = report.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    downloadCsv(
      `${slug || "departmental-report"}.csv`,
      ["Report Name", "Category", "Academic Year", "Scope", "Class Cohort", "Students", "At-Risk", "Pass %", "Generated By"],
      filteredCohorts.map((c) => [
        report.name,
        report.cat,
        selectedAY,
        report.scope,
        c.name,
        c.count,
        c.riskCount,
        `${c.passRate}%`,
        report.by,
      ])
    );
    addToast({
      title: "CSV Export Ready",
      message: `Downloaded ${slug || "departmental-report"}.csv`,
      type: "success",
    });
  };

  return (
    <div className="flex flex-col w-full gap-y-7 pb-10">
      {readOnlyMode && (
        <div
          role="status"
          className="rounded-[16px] border border-[#F5E0B5] bg-[#FFFDF7] px-4 py-3 flex items-center gap-2.5 text-[13px] text-[#7A5210]"
        >
          <span className="material-symbols-outlined text-[18px]">visibility</span>
          <span>
            <strong>Executive Read-Only Oversight:</strong> You may filter cohorts and download existing CSV analytics; generating new departmental report records is restricted to coordinators and administrators.
          </span>
        </div>
      )}

      {/* 1. Editorial Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 pt-1">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[12px] font-semibold text-[#666D7A] tracking-wide uppercase">
              Curriculum &amp; Departmental Analytics
            </span>
          </div>
          <h1 className="text-[34px] sm:text-[38px] font-normal tracking-[-0.025em] text-[#181D26] leading-tight">
            Coordinator Reports
          </h1>
          <p className="text-[14px] text-[#666D7A] mt-1 max-w-2xl">
            Analyse class cohorts, subject mastery curves, and intervention efficacy reports for {selectedAY}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={readOnlyMode}
            onClick={() => setGenerateModalOpen(true)}
            title={readOnlyMode ? "Disabled in Management Read-Only mode" : "Generate a custom report"}
            className="inline-flex items-center gap-2 h-11 px-5 bg-[#181D26] hover:bg-black text-white rounded-[14px] text-[13px] font-semibold shadow-sm transition-all focus:outline-none cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* 2. Segmented Pill Navigation */}
      <div className="flex items-center">
        <div className="bg-[#F0F2F5] p-1.5 rounded-full inline-flex max-w-full overflow-x-auto shadow-inner">
          {(
            [
              { key: "class", label: "Class Reports" },
              { key: "subject", label: "Subject Reports" },
              { key: "intervention", label: "Intervention Reports" },
              { key: "custom", label: "Custom Reports", count: customReports.length },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2 text-[13px] transition-all rounded-full whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-[#181D26] text-white shadow-sm font-semibold"
                    : "text-[#666D7A] hover:text-[#181D26] font-medium"
                }`}
              >
                <span>{tab.label}</span>
                {"count" in tab && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-[#E0E2E6] text-[#333840]"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Filters Row */}
      <div className="rounded-[22px] bg-white border border-[#E0E2E6] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ay-select" className="text-[12px] text-[#666D7A] font-semibold">
              Academic Year
            </label>
            <div className="relative">
              <select
                id="ay-select"
                value={selectedAY}
                onChange={(e) => setSelectedAY(e.target.value)}
                className="w-full h-11 appearance-none bg-[#F7F8FA] hover:bg-[#F0F2F5] text-[#181D26] text-[13px] font-medium rounded-[14px] border border-[#E0E2E6] px-3.5 pr-10 focus:outline-none focus:ring-2 focus:ring-[#181D26] cursor-pointer transition-colors"
              >
                <option>AY 2026–27</option>
                <option>AY 2025–26</option>
                <option>AY 2024–25</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-3 text-[#666D7A] pointer-events-none text-[18px]">
                expand_more
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="class-select" className="text-[12px] text-[#666D7A] font-semibold">
              Class / Division
            </label>
            <div className="relative">
              <select
                id="class-select"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full h-11 appearance-none bg-[#F7F8FA] hover:bg-[#F0F2F5] text-[#181D26] text-[13px] font-medium rounded-[14px] border border-[#E0E2E6] px-3.5 pr-10 focus:outline-none focus:ring-2 focus:ring-[#181D26] cursor-pointer transition-colors"
              >
                <option>All Classes</option>
                <option>SE IT - A</option>
                <option>SE IT - B</option>
                <option>TE IT - A</option>
                <option>TE IT - B</option>
                <option>BE IT - A</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-3 text-[#666D7A] pointer-events-none text-[18px]">
                expand_more
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="type-select" className="text-[12px] text-[#666D7A] font-semibold">
              Report Type
            </label>
            <div className="relative">
              <select
                id="type-select"
                value={selectedReportType}
                onChange={(e) => setSelectedReportType(e.target.value)}
                className="w-full h-11 appearance-none bg-[#F7F8FA] hover:bg-[#F0F2F5] text-[#181D26] text-[13px] font-medium rounded-[14px] border border-[#E0E2E6] px-3.5 pr-10 focus:outline-none focus:ring-2 focus:ring-[#181D26] cursor-pointer transition-colors"
              >
                <option>Performance Overview</option>
                <option>Risk Assessment Analysis</option>
                <option>Attendance Correlation</option>
                <option>Intervention Efficacy</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-3 text-[#666D7A] pointer-events-none text-[18px]">
                expand_more
              </span>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleApplyFilters}
              className="w-full h-11 inline-flex items-center justify-center gap-2 bg-[#181D26] hover:bg-black text-white rounded-[14px] text-[13px] font-semibold transition-colors focus:outline-none cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span>Apply Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. TAB 1: Class Reports */}
      {activeTab === "class" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-6">
            <ChartCard
              title="Class Cohort Comparison"
              subtitle={`${selectedReportType} · ${selectedAY} (${selectedClass})`}
              ariaLabel={`Bar comparison chart showing ${selectedReportType} across ${selectedClass} for ${selectedAY}`}
              data={filteredCohorts.map((c) => ({
                Cohort: c.name,
                AvgScore: c.avgScore,
                Attendance: c.attendance,
                PassRate: c.passRate,
                Flagged: c.riskCount,
              }))}
              filename="coordinator-class-comparison"
              height={265}
            >
              <BarComparisonChart
                data={filteredCohorts.map((c) => ({
                  name: c.name,
                  avgScore: c.avgScore,
                  attendance: c.attendance,
                  passRate: c.passRate,
                  riskCount: c.riskCount,
                }))}
                xKey="name"
                series={chartSeries}
                height={255}
              />
            </ChartCard>
          </div>

          <div className="lg:col-span-6 rounded-[22px] bg-white border border-[#E0E2E6] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-[18px] font-semibold text-[#181D26]">
                    Cohort Diagnostics Summary
                  </h2>
                  <p className="text-[12px] text-[#666D7A] mt-0.5">
                    Passing benchmarks and identified risk count ({selectedAY})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    downloadCsv(
                      `cohort-diagnostics-${selectedAY.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.csv`,
                      ["Class", "Students", "Flagged At-Risk", "Avg Score %", "Attendance %", "Pass %"],
                      filteredCohorts.map((r) => [r.name, r.count, r.riskCount, r.avgScore, r.attendance, r.passRate])
                    )
                  }
                  className="px-3 py-1.5 rounded-full border border-[#E0E2E6] bg-[#F7F8FA] hover:bg-[#F0F2F5] text-[12px] font-semibold text-[#181D26] cursor-pointer"
                >
                  Export CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="bg-[#F7F8FA] text-[11px] font-semibold text-[#666D7A] uppercase tracking-wider">
                      <th className="py-2.5 px-3 rounded-l-[10px]">Class</th>
                      <th className="py-2.5 px-2.5">Students</th>
                      <th className="py-2.5 px-2.5">At-Risk</th>
                      <th className="py-2.5 px-2.5">Pass %</th>
                      <th className="py-2.5 px-3 rounded-r-[10px] text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F2F5] text-[#181D26]">
                    {filteredCohorts.map((r) => (
                      <tr key={r.name} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-3 px-3 font-semibold text-[#181D26]">{r.name}</td>
                        <td className="py-3 px-2.5 font-mono text-[#666D7A]">{r.count}</td>
                        <td className="py-3 px-2.5">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#FDF2F0] text-[#AA2D00] text-[11px] font-bold">
                            {r.riskCount} flagged
                          </span>
                        </td>
                        <td className="py-3 px-2.5 font-mono font-semibold text-[#0A2E0E]">{r.passRate}%</td>
                        <td className="py-3 px-3 text-right">
                          {readOnlyMode ? (
                            <button
                              type="button"
                              onClick={() => setSelectedClass(r.name)}
                              className="px-3 py-1 rounded-full bg-[#181D26] hover:bg-black text-white text-[12px] font-semibold shadow-xs cursor-pointer"
                            >
                              Focus
                            </button>
                          ) : (
                            <Link
                              href="/teacher/students"
                              className="px-3 py-1 rounded-full bg-[#181D26] hover:bg-black text-white text-[12px] font-semibold shadow-xs inline-block"
                            >
                              Inspect
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 2: Subject Reports */}
      {activeTab === "subject" && (
        <div className="rounded-[22px] bg-white border border-[#E0E2E6] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[18px] font-semibold text-[#181D26]">
                Core Subject Mastery Analysis ({selectedAY})
              </h2>
              <p className="text-[12px] text-[#666D7A] mt-0.5">
                Passing rates and mean marks across departmental foundational courses
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                downloadCsv(
                  `subject-mastery-${selectedAY.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.csv`,
                  ["Code", "Subject", "Pass Rate", "Mean Score", "Lead Faculty"],
                  subjectCards.map((s) => [s.code, s.name, s.pass, s.avg, s.lead])
                )
              }
              className="px-3.5 py-1.5 rounded-full border border-[#E0E2E6] bg-[#F7F8FA] hover:bg-[#F0F2F5] text-[12px] font-semibold text-[#181D26] cursor-pointer"
            >
              Export CSV
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {subjectCards.map((sub) => (
              <div
                key={sub.code}
                className="p-5 bg-[#F7F8FA] rounded-[18px] border border-[#E0E2E6] space-y-3 hover:bg-white hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-[#666D7A] font-bold bg-white px-2 py-0.5 rounded-[6px] border border-[#E0E2E6]">
                    {sub.code}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#F0F2F5] text-[#181D26] text-[11px] font-semibold">
                    Core Theory
                  </span>
                </div>
                <h4 className="text-[14px] font-semibold text-[#181D26] leading-snug">{sub.name}</h4>
                <div className="pt-2 grid grid-cols-2 gap-2 border-t border-[#E0E2E6]">
                  <div>
                    <span className="text-[#666D7A] block text-[11px]">Pass Rate</span>
                    <span className="font-mono font-bold text-[#0A2E0E] text-[14px]">{sub.pass}</span>
                  </div>
                  <div>
                    <span className="text-[#666D7A] block text-[11px]">Mean Score</span>
                    <span className="font-mono font-bold text-[#181D26] text-[14px]">{sub.avg}</span>
                  </div>
                </div>
                <div className="text-[11px] text-[#666D7A] pt-1 truncate">
                  Lead Faculty: <span className="text-[#333840] font-medium">{sub.lead}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. TAB 3: Intervention Reports */}
      {activeTab === "intervention" && (
        <div className="rounded-[22px] bg-white border border-[#E0E2E6] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-5">
          <div>
            <h2 className="text-[18px] font-semibold text-[#181D26]">
              Departmental Intervention Efficacy &amp; Outcomes ({selectedAY})
            </h2>
            <p className="text-[12px] text-[#666D7A] mt-0.5">
              Success metrics by intervention tier across {selectedClass}
            </p>
          </div>
          <div className="space-y-3">
            {[
              {
                tier: "Tier 1: Academic Support Sessions",
                assigned: 34,
                resolved: 28,
                status: "Exceeding Target",
              },
              {
                tier: "Tier 2: Attendance Mentorship & Follow-up",
                assigned: 18,
                resolved: 14,
                status: "On Track",
              },
              {
                tier: "Tier 3: Intensive Remedial Tutoring",
                assigned: 6,
                resolved: 4,
                status: "Under Review",
              },
            ].map((row) => {
              const rate = `${((row.resolved / row.assigned) * 100).toFixed(1)}%`;
              return (
              <div
                key={row.tier}
                className="p-5 bg-[#F7F8FA] rounded-[18px] border border-[#E0E2E6] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[14px] font-semibold text-[#181D26]">{row.tier}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#0A2E0E] text-[10px] font-bold">
                      {row.status}
                    </span>
                  </div>
                  <span className="text-[13px] text-[#666D7A]">
                    {row.resolved} of {row.assigned} students resolved successfully
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-mono text-[24px] font-normal tracking-tight text-[#0A2E0E] block leading-none">
                      {rate}
                    </span>
                    <span className="text-[10px] font-medium text-[#666D7A]">Success Rate</span>
                  </div>
                  <Link
                    href={readOnlyMode ? "/admin/institution-kpis" : "/teacher/interventions"}
                    className="px-4 py-2 rounded-full bg-[#181D26] hover:bg-black text-white text-[12px] font-semibold shadow-xs"
                  >
                    {readOnlyMode ? "View Executive KPIs" : "View Interventions"}
                  </Link>
                </div>
              </div>
            );
            })}
          </div>
        </div>
      )}

      {/* 7. TAB 4: Custom Reports */}
      {activeTab === "custom" && (
        <div className="rounded-[22px] bg-white border border-[#E0E2E6] shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] whitespace-nowrap">
              <thead className="bg-[#F7F8FA] text-[11px] font-semibold text-[#666D7A] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Report Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date Generated</th>
                  <th className="py-3 px-4">Generated By</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F2F5] text-[#181D26]">
                {customReports.map((r, i) => (
                  <tr key={`${r.name}-${i}`} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#181D26] flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#666D7A] text-[20px]">description</span>
                      <span>{r.name}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#F0F2F5] text-[#181D26] text-[11px] font-semibold">
                        {r.cat}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#666D7A]">{r.date}</td>
                    <td className="py-3.5 px-4 font-medium text-[#333840]">{r.by}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#0A2E0E] text-[11px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0A2E0E]" />
                        Ready
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDownloadReportCsv(r)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F7F8FA] hover:bg-[#F0F2F5] border border-[#E0E2E6] text-[#181D26] text-[12px] transition-colors font-semibold shadow-xs cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">download</span>
                        <span>Download CSV</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. Accessible Generate Report Modal */}
      <ModalShell
        open={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        title="Generate Departmental Report"
      >
        <form onSubmit={handleCreateReport} className="space-y-4">
          <p className="text-[12.5px] text-[#666D7A]">
            Compile academic and intervention records for {selectedAY} into a downloadable CSV export.
          </p>
          <div>
            <label
              htmlFor="report-title-input"
              className="text-[11px] uppercase font-semibold text-[#666D7A] tracking-wider block mb-1.5"
            >
              Report Title
            </label>
            <input
              id="report-title-input"
              type="text"
              required
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="w-full h-11 px-3.5 rounded-[14px] bg-[#F7F8FA] text-[#181D26] text-[13px] border border-[#E0E2E6] focus:outline-none focus:ring-2 focus:ring-[#181D26]"
            />
          </div>

          <div>
            <label
              htmlFor="report-scope-select"
              className="text-[11px] uppercase font-semibold text-[#666D7A] tracking-wider block mb-1.5"
            >
              Target Scope
            </label>
            <select
              id="report-scope-select"
              value={targetScope}
              onChange={(e) => setTargetScope(e.target.value)}
              className="w-full h-11 px-3.5 rounded-[14px] bg-[#F7F8FA] text-[#181D26] text-[13px] border border-[#E0E2E6] focus:outline-none focus:ring-2 focus:ring-[#181D26]"
            >
              <option>Entire IT Department (All 5 Divisions)</option>
              <option>TE IT - A &amp; TE IT - B Only</option>
              <option>SE IT - A &amp; SE IT - B Only</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F0F2F5]">
            <button
              type="button"
              onClick={() => setGenerateModalOpen(false)}
              className="px-4 py-2.5 rounded-[12px] text-[#666D7A] hover:text-[#181D26] hover:bg-[#F7F8FA] text-[13px] font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="px-5 py-2.5 rounded-[14px] bg-[#181D26] text-white text-[13px] font-semibold hover:bg-black shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>{isGenerating ? "Generating..." : "Create Report"}</span>
            </button>
          </div>
        </form>
      </ModalShell>
    </div>
  );
}

export default function CoordinatorReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-[#666D7A] text-[14px]">
          Loading coordinator reports...
        </div>
      }
    >
      <CoordinatorReportsContent />
    </Suspense>
  );
}
