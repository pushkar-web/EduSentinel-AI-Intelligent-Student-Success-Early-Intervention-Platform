"use client";

import React, { useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import ModalShell from "@/components/ui/ModalShell";
import { ChartCard, BarComparisonChart } from "@/components/charts/ChartCard";

interface DeptRow {
  dept: string;
  short: string;
  students: number;
  avgScore: number;
  attendance: number;
  atRisk: number;
  interventions: number;
  status: "Exceeding" | "On Track" | "Under Review";
}

const BASE_DEPTS: DeptRow[] = [
  { dept: "Information Technology", short: "IT", students: 1120, avgScore: 78, attendance: 92, atRisk: 64, interventions: 82, status: "Exceeding" },
  { dept: "Computer Engineering", short: "Comp", students: 1240, avgScore: 76, attendance: 91, atRisk: 88, interventions: 94, status: "On Track" },
  { dept: "Mechanical Engineering", short: "Mech", students: 940, avgScore: 72, attendance: 88, atRisk: 112, interventions: 68, status: "Under Review" },
  { dept: "EXTC Engineering", short: "EXTC", students: 860, avgScore: 75, attendance: 90, atRisk: 76, interventions: 48, status: "On Track" },
  { dept: "Civil Engineering", short: "Civil", students: 732, avgScore: 74, attendance: 89, atRisk: 72, interventions: 36, status: "On Track" },
];

const AY_OFFSET: Record<string, { scoreDelta: number; attDelta: number; riskFactor: number }> = {
  "AY 2026–27": { scoreDelta: 0, attDelta: 0, riskFactor: 1 },
  "AY 2025–26": { scoreDelta: -3, attDelta: -2, riskFactor: 1.15 },
  "AY 2024–25": { scoreDelta: -5, attDelta: -4, riskFactor: 1.28 },
};

const BATCH_FACTOR: Record<string, number> = {
  All: 1,
  "Third Year (TE)": 0.28,
  "Final Year (BE)": 0.24,
  "Second Year (SE)": 0.26,
  "Freshman (FE)": 0.22,
};

function ReportsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "overview";
  const initialDept = searchParams.get("dept") || "All Departments";

  const { user, activeRole } = useAuthStore();
  const { addToast } = useUIStore();
  const isReadOnly = user?.role === "management" || activeRole === "management";

  const [activeTab, setActiveTab] = useState<"overview" | "interventions" | "model">(
    initialTab === "interventions" ? "interventions" : initialTab === "model" ? "model" : "overview"
  );

  const [selectedAY, setSelectedAY] = useState("AY 2026–27");
  const [selectedDept, setSelectedDept] = useState(
    BASE_DEPTS.find((d) => d.dept.includes(initialDept) || d.short === initialDept)?.dept ?? "All Departments"
  );
  const [selectedBatch, setSelectedBatch] = useState("All");

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [reportFormat, setReportFormat] = useState<"pdf" | "csv" | "json">("csv");
  const [scheduleFreq, setScheduleFreq] = useState("Weekly Monday Comprehensive Summary");

  const filteredDepts = useMemo(() => {
    const ay = AY_OFFSET[selectedAY] ?? AY_OFFSET["AY 2026–27"];
    const bFactor = BATCH_FACTOR[selectedBatch] ?? 1;
    return BASE_DEPTS.filter((d) => selectedDept === "All Departments" || d.dept === selectedDept).map((d) => ({
      ...d,
      students: Math.round(d.students * bFactor),
      avgScore: Math.max(55, d.avgScore + ay.scoreDelta),
      attendance: Math.max(70, d.attendance + ay.attDelta),
      atRisk: Math.round(d.atRisk * bFactor * ay.riskFactor),
      interventions: Math.round(d.interventions * bFactor),
    }));
  }, [selectedAY, selectedDept, selectedBatch]);

  const chartSeries = useMemo(
    () => filteredDepts.map((d) => ({ dept: d.short, avgScore: d.avgScore, attendance: d.attendance })),
    [filteredDepts]
  );

  const handleDownloadReport = (e: React.FormEvent) => {
    e.preventDefault();
    let content = "";
    let mime = "text/plain;charset=utf-8";
    let ext = reportFormat;

    if (reportFormat === "csv") {
      mime = "text/csv;charset=utf-8";
      content = [
        "Department,AcademicYear,Batch,Students,AvgScore,Attendance,AtRisk,Interventions,Status",
        ...filteredDepts.map(
          (d) => `"${d.dept}","${selectedAY}","${selectedBatch}",${d.students},${d.avgScore}%,${d.attendance}%,${d.atRisk},${d.interventions},${d.status}`
        ),
      ].join("\n");
    } else if (reportFormat === "json") {
      mime = "application/json;charset=utf-8";
      content = JSON.stringify({ academicYear: selectedAY, department: selectedDept, batch: selectedBatch, rows: filteredDepts }, null, 2);
    } else {
      mime = "text/html;charset=utf-8";
      ext = "pdf";
      content = `<html><body style="font-family:sans-serif;padding:32px"><h1>EduSentinel Institutional Report — ${selectedAY}</h1><p>Scope: ${selectedDept} (${selectedBatch})</p><table border="1" cellpadding="6">${filteredDepts
        .map((d) => `<tr><td>${d.dept}</td><td>${d.students}</td><td>${d.avgScore}%</td><td>${d.attendance}%</td><td>${d.atRisk} at-risk</td></tr>`)
        .join("")}</table></body></html>`;
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = reportFormat === "pdf" ? "edusentinel_report_printable.html" : `edusentinel_report.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    setReportModalOpen(false);
    addToast({ title: "Report Exported", message: `Generated ${reportFormat.toUpperCase()} for ${selectedDept}.`, type: "success" });
  };

  return (
    <div className="text-[#181D26] pb-8">
      <div className="space-y-8">
        {isReadOnly && (
          <div className="bg-[#FFF9E5] border border-[#F4D35E]/50 rounded-[20px] p-4 flex items-center justify-between text-[#D9A441]">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">visibility</span>
              <span className="text-[13px] font-semibold text-[#181D26]">
                Executive Management Mode (Read-Only)
              </span>
            </div>
            <span className="text-[12px] text-[#666D7A]">Report scheduling is restricted; exports permitted</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[12px] font-medium text-[#666D7A] uppercase tracking-wider mb-1">
              <span>Admin Portal</span>
              <span>/</span>
              <span className="text-[#181D26]">Institutional Intelligence</span>
            </div>
            <h1 className="text-[34px] sm:text-[38px] font-normal tracking-[-0.025em] text-[#181D26] leading-tight">
              Institutional Reports
            </h1>
            <p className="text-[14px] text-[#666D7A] mt-1">
              Slice longitudinal telemetry by academic year, department, and cohort batch with CSV/JSON/printable export.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              type="button"
              disabled={isReadOnly}
              onClick={() =>
                isReadOnly
                  ? addToast({ title: "Restricted", message: "Digest scheduling disabled in Read-Only mode.", type: "warning" })
                  : setScheduleModalOpen(true)
              }
              className={`px-4 py-2.5 rounded-[14px] border text-[13px] font-medium flex items-center gap-2 ${
                isReadOnly
                  ? "bg-[#F7F8FA] border-[#E0E2E6] text-[#9297A0] cursor-not-allowed"
                  : "bg-white border-[#E0E2E6] text-[#181D26] hover:bg-[#F8FAFC] cursor-pointer"
              }`}
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
                {isReadOnly ? "lock" : "schedule_send"}
              </span>
              <span>Schedule Digest</span>
            </button>
            <button
              type="button"
              onClick={() => setReportModalOpen(true)}
              className="px-5 py-2.5 rounded-[14px] bg-[#181D26] hover:bg-[#333840] text-white text-[13px] font-medium flex items-center gap-2 cursor-pointer"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">add_chart</span>
              <span>Generate Report</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[#F7F8FA] p-1.5 rounded-[16px] border border-[#E0E2E6] inline-flex flex-wrap items-center gap-1">
          {[
            { id: "overview" as const, label: "Institution Overview", icon: "domain" },
            { id: "interventions" as const, label: "Intervention Reports", icon: "assignment" },
            { id: "model" as const, label: "Model & Fairness Reports", icon: "neurology" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-[12px] text-[13px] font-medium flex items-center gap-2 cursor-pointer ${
                activeTab === t.id ? "bg-[#181D26] text-white shadow-sm" : "text-[#666D7A] hover:text-[#181D26]"
              }`}
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[17px]">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-[22px] p-5 border border-[#E0E2E6] grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="report-ay" className="text-[11px] uppercase tracking-wider font-semibold text-[#666D7A] block mb-1.5">Academic Year</label>
            <select id="report-ay" value={selectedAY} onChange={(e) => setSelectedAY(e.target.value)} className="w-full h-11 px-3.5 rounded-[12px] border border-[#E0E2E6] text-[13px]">
              {Object.keys(AY_OFFSET).map((ay) => <option key={ay}>{ay}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="report-dept" className="text-[11px] uppercase tracking-wider font-semibold text-[#666D7A] block mb-1.5">Department</label>
            <select id="report-dept" value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="w-full h-11 px-3.5 rounded-[12px] border border-[#E0E2E6] text-[13px]">
              <option>All Departments</option>
              {BASE_DEPTS.map((d) => <option key={d.dept}>{d.dept}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="report-batch" className="text-[11px] uppercase tracking-wider font-semibold text-[#666D7A] block mb-1.5">Class / Batch</label>
            <select id="report-batch" value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} className="w-full h-11 px-3.5 rounded-[12px] border border-[#E0E2E6] text-[13px]">
              {Object.keys(BATCH_FACTOR).map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
        </div>

        {/* TAB 1 */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <ChartCard
              title={`Academic Overview (${selectedAY} • ${selectedDept})`}
              subtitle={`Mean score and attendance telemetry for ${selectedBatch}`}
              ariaLabel="Bar comparison of average score and attendance per department"
              data={chartSeries}
              filename="institutional_academic_overview"
              height={260}
            >
              <BarComparisonChart
                data={chartSeries}
                xKey="dept"
                series={[
                  { key: "avgScore", label: "Avg. Score %", color: "#181D26" },
                  { key: "attendance", label: "Attendance %", color: "#254FAD" },
                ]}
                height={260}
              />
            </ChartCard>

            <div className="bg-white rounded-[22px] border border-[#E0E2E6] overflow-hidden">
              <div className="p-5 px-6 border-b border-[#E0E2E6]">
                <h2 className="text-[17px] font-semibold">Departmental Performance Breakdown</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap text-[13px]">
                  <thead>
                    <tr className="border-b border-[#E0E2E6] text-[12px] font-medium text-[#666D7A] uppercase">
                      <th className="py-3 px-6">Department</th>
                      <th className="py-3 px-4">Students</th>
                      <th className="py-3 px-4">Avg Score</th>
                      <th className="py-3 px-4">Attendance</th>
                      <th className="py-3 px-4">At-Risk</th>
                      <th className="py-3 px-4">Interventions</th>
                      <th className="py-3 px-6 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0E2E6]">
                    {filteredDepts.map((d) => (
                      <tr key={d.dept} className="hover:bg-[#F8FAFC]">
                        <td className="py-3.5 px-6 font-semibold">{d.dept}</td>
                        <td className="py-3.5 px-4 font-mono">{d.students.toLocaleString()}</td>
                        <td className="py-3.5 px-4 font-mono font-semibold">{d.avgScore}%</td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-[#1B61C9]">{d.attendance}%</td>
                        <td className="py-3.5 px-4 font-mono text-[#AA2D00] font-semibold">{d.atRisk}</td>
                        <td className="py-3.5 px-4 font-mono">{d.interventions} active</td>
                        <td className="py-3.5 px-6 text-right">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                              d.status === "Under Review"
                                ? "bg-[#FFF9E5] text-[#D9A441] border border-[#F4D35E]"
                                : "bg-[#F4FAF7] text-[#0A2E0E] border border-[#A8D8C4]"
                            }`}
                          >
                            {d.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2 */}
        {activeTab === "interventions" && (
          <div className="bg-white rounded-[22px] p-6 border border-[#E0E2E6] space-y-4">
            <h2 className="text-[17px] font-semibold">Intervention Strategy Efficacy ({selectedAY})</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { tier: "Tier 1: Peer Tutoring & Mentorship", cases: Math.round(142 * (BATCH_FACTOR[selectedBatch] ?? 1)), success: "84%" },
                { tier: "Tier 2: Intensive Academic Recovery", cases: Math.round(98 * (BATCH_FACTOR[selectedBatch] ?? 1)), success: "72%" },
                { tier: "Tier 3: Attendance Contract & Outreach", cases: Math.round(88 * (BATCH_FACTOR[selectedBatch] ?? 1)), success: "68%" },
              ].map((item) => (
                <div key={item.tier} className="p-4 rounded-[16px] bg-[#F7F8FA] border border-[#E0E2E6]">
                  <span className="font-semibold text-[14px] block">{item.tier}</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-[24px] font-mono font-semibold text-[#0A2E0E]">{item.success}</span>
                    <span className="text-[12px] text-[#666D7A]">{item.cases} cases</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3 */}
        {activeTab === "model" && (
          <div className="bg-white rounded-[22px] p-6 border border-[#E0E2E6] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-semibold">Model &amp; Fairness Certification ({selectedAY})</h2>
              <Link href="/admin/model-monitor" className="text-[13px] font-semibold text-[#1B61C9] hover:underline">
                Open Model Monitor →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-[16px] bg-[#F4FAF7] border border-[#A8D8C4]">
                <span className="text-[12px] text-[#0A2E0E]">Disparate Impact Parity</span>
                <div className="text-[28px] font-mono font-semibold text-[#0A2E0E] mt-1">0.98</div>
              </div>
              <div className="p-4 rounded-[16px] bg-[#F7F8FA] border border-[#E0E2E6]">
                <span className="text-[12px] text-[#666D7A]">ECE Calibration Error</span>
                <div className="text-[28px] font-mono font-semibold mt-1">0.034</div>
              </div>
              <div className="p-4 rounded-[16px] bg-[#FFF8F5] border border-[#FCAB79]/40">
                <span className="text-[12px] text-[#AA2D00]">False Alarm Rate</span>
                <div className="text-[28px] font-mono font-semibold text-[#AA2D00] mt-1">6.8%</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ModalShell open={reportModalOpen} title="Generate Institutional Report" onClose={() => setReportModalOpen(false)}>
        <form onSubmit={handleDownloadReport} className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {(["csv", "json", "pdf"] as const).map((fmt) => (
              <label key={fmt} className={`p-3 rounded-[12px] border text-center cursor-pointer ${reportFormat === fmt ? "border-[#181D26] bg-[#F7F8FA] font-semibold" : "border-[#E0E2E6]"}`}>
                <input type="radio" name="fmt" checked={reportFormat === fmt} onChange={() => setReportFormat(fmt)} className="sr-only" />
                {fmt.toUpperCase()}
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setReportModalOpen(false)} className="px-4 py-2 text-[13px] text-[#666D7A] cursor-pointer">Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-[12px] bg-[#181D26] text-white text-[13px] font-medium cursor-pointer">Download</button>
          </div>
        </form>
      </ModalShell>

      <ModalShell open={scheduleModalOpen} title="Schedule Automated Digest" onClose={() => setScheduleModalOpen(false)}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setScheduleModalOpen(false);
            addToast({ title: "Digest Scheduled", message: `${scheduleFreq} configured.`, type: "success" });
          }}
          className="space-y-4"
        >
          <select value={scheduleFreq} onChange={(e) => setScheduleFreq(e.target.value)} className="w-full h-10 px-3 rounded-[10px] border border-[#E0E2E6] text-[13px]">
            <option>Daily Morning Telemetry</option>
            <option>Weekly Monday Comprehensive Summary</option>
            <option>Monthly Board Report</option>
          </select>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setScheduleModalOpen(false)} className="px-4 py-2 text-[13px] text-[#666D7A] cursor-pointer">Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-[12px] bg-[#181D26] text-white text-[13px] font-medium cursor-pointer">Save Schedule</button>
          </div>
        </form>
      </ModalShell>
    </div>
  );
}

export default function InstitutionalReportsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[14px] text-[#666D7A]">Loading institutional reports...</div>}>
      <ReportsContent />
    </Suspense>
  );
}
