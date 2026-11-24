"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useStudentDetail } from "@/lib/hooks/useApi";
import { useUIStore } from "@/store/useUIStore";
import { useDemoDataStore } from "@/store/useDemoDataStore";
import Avatar from "@/components/ui/Avatar";
import { ChartCard, BarComparisonChart, TrendLineChart } from "@/components/charts/ChartCard";

const TABS = [
  "Overview",
  "Academic Performance",
  "Attendance",
  "Risk Factors",
  "Interventions",
  "Notes & Observations",
] as const;

type DossierTab = (typeof TABS)[number];

export default function Student360ClientView({
  studentId = "STU1001",
}: {
  studentId?: string;
}) {
  const { data: studentProfile } = useStudentDetail(studentId);
  const { addToast } = useUIStore();
  const { student360Notes, addStudent360Note } = useDemoDataStore();

  const [activeTab, setActiveTab] = useState<DossierTab>("Overview");
  const [explanationFeedback, setExplanationFeedback] = useState<"useful" | "not_useful" | "wrong" | null>(null);
  const [teacherNote, setTeacherNote] = useState("");
  const defaultNotes = [
    {
      id: "note-1",
      author: "Priya Sharma (Mathematics)",
      date: "Nov 18, 2026 • 2:15 PM",
      text: "Discussed Calculus III problem sets with Aarav. Expressed difficulty with partial derivatives; referred to peer tutoring.",
    },
    {
      id: "note-2",
      author: "Dr. Sarah Khan (Academic Mentor)",
      date: "Nov 10, 2026 • 11:30 AM",
      text: "Intake meeting completed. Guardian contacted regarding Monday morning transit delays. Agreed on Tier 2 roadmap.",
    },
  ];
  const noteList = [...(student360Notes[studentId] ?? []), ...defaultNotes];

  const name = studentProfile?.name || "Aarav Deshmukh";
  const roll = studentProfile?.studentId || "IT26-4091";
  const grade = `${studentProfile?.department || "Information Technology"} • ${studentProfile?.batch || "Sem 5"}`;
  const riskLabel =
    !studentProfile
      ? "Loading Tier"
      : studentProfile.riskLevel === "Critical"
      ? "Critical Risk"
      : studentProfile.riskLevel === "High"
      ? "High Risk"
      : studentProfile.riskLevel === "Medium"
      ? "Moderate Risk"
      : "Low Risk";

  const coveragePct = studentProfile?.riskLevel === "Medium" ? 84 : 94;
  const academicTrend = (studentProfile?.academicHistory ?? []).map((h) => ({
    semester: h.semester.replace("Semester ", "Sem "),
    gpaPct: Math.round(h.gpa * 10),
    attendance: h.attendance,
  }));
  const attendanceSeries = (studentProfile?.attendanceHistory ?? []).map((a) => ({
    month: a.month,
    rate: a.rate,
    missedClasses: a.missedClasses,
  }));

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherNote.trim()) return;
    addStudent360Note(studentId, {
      id: `note-${Date.now()}`,
      author: "Priya Sharma (Faculty)",
      date: "Just now",
      text: teacherNote.trim(),
    });
    setTeacherNote("");
    addToast({ title: "Observation Saved", message: `Logged observation note for ${name}.`, type: "success" });
  };

  const handleFeedback = (verdict: "useful" | "not_useful" | "wrong") => {
    setExplanationFeedback(verdict);
    const label = verdict === "useful" ? "Useful" : verdict === "not_useful" ? "Not Useful" : "Flagged Wrong";
    addToast({
      title: "AI Explanation Feedback Logged",
      message: `Marked SHAP attribution for ${name} as "${label}".`,
      type: verdict === "wrong" ? "warning" : "success",
    });
  };

  const handleExportDossier = () => {
    const html = [
      `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Student 360 Dossier - ${name}</title></head>`,
      `<body style="font-family:system-ui,sans-serif;padding:36px;max-width:760px;margin:auto;color:#181D26">`,
      `<h1>EduSentinel AI — Student 360 Dossier</h1>`,
      `<p><strong>Name:</strong> ${name} (${studentId} / ${roll})</p>`,
      `<p><strong>Program:</strong> ${grade} | <strong>Risk Tier:</strong> ${riskLabel} (${studentProfile?.riskScore ?? 89}/100)</p>`,
      `<p><strong>Attendance:</strong> ${studentProfile?.attendanceRate ?? 64.5}% | <strong>CGPA:</strong> ${studentProfile?.currentCgpa ?? 5.82}</p>`,
      `<h2>Top Risk Drivers (SHAP)</h2><ul>`,
      ...(studentProfile?.shapValues ?? []).map((s) => `<li><strong>${s.feature}</strong> (+${Math.round(s.impact * 100)}%): ${s.description}</li>`),
      `</ul><h2>Subjects</h2><ul>`,
      ...(studentProfile?.subjectBreakdown ?? []).map((sub) => `<li>${sub.code} ${sub.name}: ${sub.internalScore}% (Att ${sub.attendance}%) — ${sub.gradeForecast}</li>`),
      `</ul></body></html>`,
    ].join("");
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${studentId}_360_dossier.html`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({ title: "Dossier Exported", message: `Saved printable dossier ${studentId}_360_dossier.html.`, type: "success" });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Meta */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#EAECEF]">
        <div className="flex items-center gap-3">
          <Link
            href="/teacher/students"
            className="w-9 h-9 rounded-full bg-white border border-[#DDDDDD] flex items-center justify-center text-[#181D26] hover:bg-[#F7F8FA]"
            title="Back to Student List"
            aria-label="Back to Student Directory"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-[20px] font-medium text-[#181D26] tracking-tight">Student 360 Dossier</h1>
            <p className="text-[13px] text-[#666D7A]">
              Comprehensive academic telemetry, plain-language SHAP explainability, and longitudinal intervention tracking.
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-[12px] font-medium bg-[#ECFDF5] text-[#0A2E0E] border border-[#A7F3D0] inline-flex items-center gap-1.5 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-[#006400] animate-pulse" />
          Sentinel AI v2.4.1 Active
        </span>
      </div>

      {/* Hero Banner */}
      <div className="rounded-[22px] bg-white p-6 sm:p-8 border border-[#EAECEF] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 min-w-0">
          <Avatar
            name={name}
            src={studentProfile?.avatarUrl}
            size={80}
            className="rounded-[20px] border border-[#DDDDDD]"
          />
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-[26px] font-normal text-[#181D26] tracking-tight">{name}</h2>
              <span className="px-2.5 py-0.5 rounded-[8px] bg-[#F7F8FA] text-[#181D26] text-[12px] font-mono font-medium border border-[#DDDDDD]">
                {studentId}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] inline-flex items-center gap-1.5">
                <span aria-hidden="true" className="material-symbols-outlined text-[14px]">warning</span>
                {riskLabel}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[#41454D]">
              <span>{grade}</span>
              <span className="text-[#DDDDDD]">•</span>
              <span className="font-mono">{roll}</span>
              <span className="text-[#DDDDDD]">•</span>
              <span>Mentor: {studentProfile?.mentor || "Dr. Sarah Khan"}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[12px] text-[#666D7A] pt-1">
              <span>Confidence: <strong className="font-mono text-[#181D26]">{Math.round((studentProfile?.mlConfidence ?? 0.92) * 100)}%</strong></span>
              <span>•</span>
              <span>Data Coverage: <strong className="font-mono text-[#0A2E0E]">{coveragePct}%</strong></span>
              <span>•</span>
              <span>Last active: {studentProfile?.lastActive || "Today"}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href={`/teacher/interventions?studentId=${studentId}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[14px] bg-[#181D26] text-white text-[13.5px] font-medium hover:bg-[#0D1218] transition-all"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">add</span>
            <span>Prescribe Intervention</span>
          </Link>
          <button
            type="button"
            onClick={handleExportDossier}
            className="px-4 py-2.5 rounded-[14px] bg-white border border-[#DDDDDD] text-[#181D26] text-[13.5px] font-medium hover:bg-[#F7F8FA] cursor-pointer"
          >
            Export Dossier PDF
          </button>
        </div>
      </div>

      {/* 6 Tabs (compact fit across 1036px+ laptops with clean wrapping) */}
      <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-[#EAECEF]" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-[10px] text-[13px] font-medium transition-all shrink-0 cursor-pointer ${
              activeTab === tab ? "bg-[#181D26] text-white shadow-xs" : "text-[#41454D] hover:text-[#181D26] hover:bg-black/[0.02]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "Overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white rounded-[20px] p-6 border border-[#EAECEF]">
              <span className="text-[13px] font-medium text-[#666D7A]">Overall Attendance</span>
              <div className="my-3 flex items-baseline justify-between">
                <span className="text-[34px] font-medium font-mono text-[#181D26]">{studentProfile?.attendanceRate ?? 64.5}%</span>
                <span className="text-[12px] font-semibold text-[#DC2626]">Target &gt;= 75%</span>
              </div>
              <div className="w-full bg-[#EAECEF] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#DC2626] h-full rounded-full" style={{ width: `${studentProfile?.attendanceRate ?? 64.5}%` }} />
              </div>
            </div>

            <div className="bg-white rounded-[20px] p-6 border border-[#EAECEF]">
              <span className="text-[13px] font-medium text-[#666D7A]">Current CGPA</span>
              <div className="my-3 flex items-baseline justify-between">
                <span className="text-[34px] font-medium font-mono text-[#181D26]">{studentProfile?.currentCgpa ?? 5.82}</span>
                <span className="text-[12px] text-[#666D7A]">Scale 10.0</span>
              </div>
              <div className="w-full bg-[#EAECEF] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#D97706] h-full rounded-full" style={{ width: `${Math.min(100, (studentProfile?.currentCgpa ?? 5.82) * 10)}%` }} />
              </div>
            </div>

            <div className="bg-white rounded-[20px] p-6 border border-[#EAECEF]">
              <span className="text-[13px] font-medium text-[#666D7A]">Risk Index Score</span>
              <div className="my-3 flex items-baseline justify-between">
                <span className="text-[34px] font-medium font-mono text-[#AA2D00]">{studentProfile?.riskScore ?? 89}</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF2F2] text-[#DC2626]">{riskLabel}</span>
              </div>
              <div className="w-full bg-[#EAECEF] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#AA2D00] h-full rounded-full" style={{ width: `${studentProfile?.riskScore ?? 89}%` }} />
              </div>
            </div>

            <div className="bg-white rounded-[20px] p-6 border border-[#EAECEF]">
              <span className="text-[13px] font-medium text-[#666D7A]">Open Alerts</span>
              <div className="my-3 flex items-baseline justify-between">
                <span className="text-[34px] font-medium font-mono text-[#181D26]">{studentProfile?.recentAlerts.length ?? 2}</span>
                <button type="button" onClick={() => setActiveTab("Risk Factors")} className="text-[12px] font-semibold text-[#1B61C9] hover:underline cursor-pointer">
                  Inspect SHAP →
                </button>
              </div>
              <p className="text-[12px] text-[#666D7A]">{studentProfile?.interventions.length ?? 1} active plan(s)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-white rounded-[22px] p-6 border border-[#EAECEF] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[17px] font-medium">Top AI Drivers (SHAP)</h3>
                <button type="button" onClick={() => setActiveTab("Risk Factors")} className="text-[12px] font-semibold text-[#1B61C9] hover:underline cursor-pointer">
                  Feedback &amp; Guardrail →
                </button>
              </div>
              <div className="space-y-3">
                {(studentProfile?.shapValues ?? []).map((item) => (
                  <div key={item.feature} className="p-3.5 rounded-[14px] bg-[#F7F8FA] border border-[#EAECEF]">
                    <div className="flex justify-between text-[13px] font-semibold">
                      <span>{item.feature}</span>
                      <span className="font-mono text-[#DC2626]">+{Math.round(item.impact * 100)}% risk</span>
                    </div>
                    <p className="text-[12px] text-[#666D7A] mt-0.5">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 bg-white rounded-[22px] p-6 border border-[#EAECEF] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[17px] font-medium">Subject Performance Snapshot</h3>
                <button type="button" onClick={() => setActiveTab("Academic Performance")} className="text-[12px] font-semibold text-[#1B61C9] hover:underline cursor-pointer">
                  Full Academic Tab →
                </button>
              </div>
              <div className="space-y-3">
                {(studentProfile?.subjectBreakdown ?? []).slice(0, 4).map((sub) => (
                  <div key={sub.code} className="p-3 rounded-[14px] bg-[#F7F8FA] border border-[#EAECEF] space-y-1.5">
                    <div className="flex justify-between text-[13px]">
                      <span className="font-medium">{sub.code} — {sub.name}</span>
                      <span className={`font-mono font-semibold ${sub.internalScore < 60 ? "text-[#DC2626]" : "text-[#181D26]"}`}>
                        {sub.internalScore}% ({sub.gradeForecast})
                      </span>
                    </div>
                    <div className="w-full bg-[#EAECEF] h-2 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${sub.internalScore < 60 ? "bg-[#DC2626]" : "bg-[#181D26]"}`} style={{ width: `${sub.internalScore}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACADEMIC PERFORMANCE */}
      {activeTab === "Academic Performance" && (
        <div className="space-y-6">
          <ChartCard
            title="Longitudinal GPA & Attendance Curve"
            subtitle="Semester progression across credits and assessment marks"
            ariaLabel={`Line chart of GPA index and attendance across semesters for ${name}`}
            data={academicTrend}
            filename={`${studentId}_academic_trend`}
            height={260}
          >
            <TrendLineChart
              data={academicTrend}
              xKey="semester"
              series={[
                { key: "gpaPct", label: "GPA (×10)", color: "#AA2D00" },
                { key: "attendance", label: "Attendance %", color: "#181D26" },
              ]}
              height={260}
            />
          </ChartCard>

          <div className="bg-white rounded-[22px] p-6 border border-[#EAECEF] overflow-x-auto">
            <h3 className="text-[17px] font-medium mb-4">Course-by-Course Breakdown</h3>
            <table className="w-full text-left text-[13px] min-w-[650px]">
              <thead>
                <tr className="border-b border-[#EAECEF] text-[12px] font-medium text-[#666D7A] uppercase">
                  <th className="py-2.5 px-4">Course</th>
                  <th className="py-2.5 px-4">Credits</th>
                  <th className="py-2.5 px-4">Internal Score</th>
                  <th className="py-2.5 px-4">Attendance</th>
                  <th className="py-2.5 px-4">Forecast</th>
                  <th className="py-2.5 px-4 text-right">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAECEF]">
                {(studentProfile?.subjectBreakdown ?? []).map((sub) => (
                  <tr key={sub.code}>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] text-[#666D7A] block">{sub.code}</span>
                      <span className="font-medium">{sub.name}</span>
                    </td>
                    <td className="py-3 px-4 font-mono">{sub.credits}</td>
                    <td className="py-3 px-4 font-mono font-semibold">{sub.internalScore}%</td>
                    <td className="py-3 px-4 font-mono">{sub.attendance}%</td>
                    <td className="py-3 px-4">{sub.gradeForecast}</td>
                    <td className="py-3 px-4 text-right font-semibold">{sub.risk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ATTENDANCE */}
      {activeTab === "Attendance" && (
        <div className="space-y-6">
          <ChartCard
            title="Monthly Attendance & Missed Sessions"
            subtitle="Tracking cumulative attendance rate alongside missed classes per month"
            ariaLabel={`Monthly attendance and missed classes chart for ${name}`}
            data={attendanceSeries}
            filename={`${studentId}_attendance`}
            height={260}
          >
            <BarComparisonChart
              data={attendanceSeries}
              xKey="month"
              series={[
                { key: "rate", label: "Attendance %", color: "#181D26" },
                { key: "missedClasses", label: "Missed Classes", color: "#AA2D00" },
              ]}
              height={260}
            />
          </ChartCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-[20px] bg-[#FFF8F5] border border-[#FCAB79]/40">
              <h3 className="text-[15px] font-semibold text-[#AA2D00]">Monday Morning Pattern Detected</h3>
              <p className="text-[13px] text-[#333840] mt-1">
                Most unexcused absences occur in 9:00 AM Calculus &amp; Lab blocks. Coordinating mentor check-in prior to next exam cycle.
              </p>
            </div>
            <div className="p-5 rounded-[20px] bg-white border border-[#EAECEF]">
              <h3 className="text-[15px] font-semibold">Cumulative Standing</h3>
              <p className="text-[13px] text-[#666D7A] mt-1">
                Current attendance is <strong className="font-mono text-[#181D26]">{studentProfile?.attendanceRate ?? 64.5}%</strong> (University debarment warning floor: 65%).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RISK FACTORS (SHAP + What-If Hint + Guardrail + Useful/Not Useful/Wrong Feedback) */}
      {activeTab === "Risk Factors" && (
        <div className="space-y-6">
          <div className="p-4 rounded-[18px] bg-[#F4FAF7] border border-[#A8D8C4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="material-symbols-outlined text-[#0A2E0E]">verified_user</span>
              <div>
                <h3 className="text-[14px] font-semibold text-[#0A2E0E]">Data Coverage Guardrail: {coveragePct}% Verified</h3>
                <p className="text-[12.5px] text-[#333840]">
                  All 4 telemetry streams (SIS Attendance, Midterms, LMS Clicks, Assignments) are populated; prediction reliability is high.
                </p>
              </div>
            </div>
            <span className="font-mono text-[12px] font-semibold text-[#0A2E0E] shrink-0">ECE Guardrail Passed</span>
          </div>

          <div className="bg-white rounded-[22px] p-6 border border-[#EAECEF] space-y-4">
            <h3 className="text-[17px] font-semibold">Plain-Language SHAP Explanations</h3>
            <div className="space-y-3">
              {(studentProfile?.shapValues ?? []).map((sv) => (
                <div key={sv.feature} className="p-4 rounded-[16px] bg-[#F7F8FA] border border-[#EAECEF] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-semibold">{sv.feature}</span>
                    <span className="font-mono text-[13px] font-semibold text-[#AA2D00]">+{Math.round(sv.impact * 100)}% risk weight</span>
                  </div>
                  <p className="text-[13px] text-[#41454D]">{sv.description}</p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-[16px] bg-[#FFFBEB] border border-[#FDE68A]">
              <h4 className="text-[14px] font-semibold text-[#92400E]">Counterfactual What-If Hint</h4>
              <p className="text-[13px] text-[#78350F] mt-0.5">
                Raising attendance above <strong>75%</strong> over the next 3 weeks and clearing the 2 overdue Calculus sets shifts {name} out of the Critical risk band (-28 risk pts).
              </p>
            </div>

            <div className="pt-3 border-t border-[#EAECEF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-[13px] text-[#41454D] font-medium">
                Is this AI explanation accurate and actionable in class context?
              </span>
              <div className="flex items-center gap-2">
                {[
                  { id: "useful" as const, label: "Useful" },
                  { id: "not_useful" as const, label: "Not useful" },
                  { id: "wrong" as const, label: "Wrong / False signal" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleFeedback(opt.id)}
                    className={`px-3.5 py-1.5 rounded-[10px] text-[12px] font-medium border cursor-pointer ${
                      explanationFeedback === opt.id
                        ? "bg-[#181D26] text-white border-[#181D26]"
                        : "bg-white text-[#181D26] border-[#DDDDDD] hover:bg-[#F7F8FA]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: INTERVENTIONS */}
      {activeTab === "Interventions" && (
        <div className="bg-white rounded-[22px] p-6 border border-[#EAECEF] space-y-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-[17px] font-semibold">Intervention Timeline — {name}</h3>
              <p className="text-[13px] text-[#666D7A]">Prescribed support plans and milestone progress</p>
            </div>
            <Link
              href={`/teacher/interventions?studentId=${studentId}`}
              className="px-4 py-2 rounded-[12px] bg-[#181D26] text-white text-[12.5px] font-medium"
            >
              + Open Intervention Planner
            </Link>
          </div>
          {(studentProfile?.interventions ?? []).map((inv) => (
            <div key={inv.id} className="p-5 rounded-[18px] bg-[#F7F8FA] border border-[#EAECEF] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-mono text-[11px] text-[#666D7A] block">{inv.id} • Assigned to {inv.assignedTo}</span>
                  <h4 className="text-[15px] font-semibold">{inv.title}</h4>
                </div>
                <span className="px-3 py-1 rounded-full text-[12px] font-semibold bg-[#ECFDF5] text-[#0A2E0E] border border-[#A7F3D0]">
                  {inv.status} ({inv.progressPercentage}%)
                </span>
              </div>
              <ul className="space-y-1.5 text-[13px]">
                {inv.milestones.map((m) => (
                  <li key={m.title} className="flex items-center justify-between">
                    <span className={m.completed ? "line-through text-[#666D7A]" : "text-[#181D26]"}>
                      {m.completed ? "✓" : "○"} {m.title}
                    </span>
                    <span className="font-mono text-[11px] text-[#666D7A]">{m.dueDate}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* TAB 6: NOTES & OBSERVATIONS */}
      {(activeTab === "Notes & Observations" || activeTab === "Overview") && (
        <div className="bg-white rounded-[22px] p-6 border border-[#EAECEF] space-y-5">
          <div className="pb-3 border-b border-[#F1F3F5]">
            <h3 className="text-[17px] font-medium text-[#181D26]">Faculty Notes &amp; Observations</h3>
            <p className="text-[13px] text-[#666D7A]">Shared observations among assigned teachers and mentors</p>
          </div>
          <form onSubmit={handleAddNote} className="space-y-3">
            <textarea
              rows={3}
              value={teacherNote}
              onChange={(e) => setTeacherNote(e.target.value)}
              placeholder="Record a pedagogical observation, meeting summary, or follow-up note..."
              className="w-full p-3.5 rounded-[14px] bg-[#F7F8FA] border border-[#DDDDDD] text-[13.5px]"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!teacherNote.trim()}
                className="px-5 py-2.5 rounded-[12px] bg-[#181D26] text-white text-[13px] font-medium disabled:opacity-50 cursor-pointer"
              >
                Save Observation
              </button>
            </div>
          </form>
          <div className="space-y-3">
            {noteList.map((n) => (
              <div key={n.id} className="p-4 rounded-[16px] bg-[#F7F8FA] border border-[#EAECEF]">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="font-semibold text-[#181D26]">{n.author}</span>
                  <span className="font-mono text-[#666D7A]">{n.date}</span>
                </div>
                <p className="text-[13px] text-[#333840] pt-1">{n.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
