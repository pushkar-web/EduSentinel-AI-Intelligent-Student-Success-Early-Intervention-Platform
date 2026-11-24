"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import ModalShell from "@/components/ui/ModalShell";
import { EmptyState } from "@/components/ui/StateFeedback";

interface ImportRecord {
  id: string;
  filename: string;
  recordsCount: number;
  type: string;
  uploadedBy: string;
  date: string;
  status: "Completed" | "Processing" | "Failed";
}

interface DuplicatePair {
  id: string;
  primaryId: string;
  primaryName: string;
  duplicateId: string;
  duplicateEmail: string;
  confidence: number;
  reason: string;
}

interface RejectedIssue {
  id: string;
  batch: string;
  rowNum: number;
  column: string;
  rawValue: string;
  reason: string;
}

const INITIAL_IMPORTS: ImportRecord[] = [
  { id: "IMP-2026-012", filename: "term2_attendance_final_v2.csv", recordsCount: 1420, type: "Attendance Ingestion", uploadedBy: "Prof. R. Deshmukh", date: "Nov 16, 2026 • 10:14 AM", status: "Completed" },
  { id: "IMP-2026-011", filename: "math_midterm_scores_ay26.xlsx", recordsCount: 486, type: "Grade Assessment", uploadedBy: "Dr. Sarah Khan", date: "Nov 14, 2026 • 04:30 PM", status: "Completed" },
  { id: "IMP-2026-010", filename: "lms_weekly_engagement_wk12.json", recordsCount: 2840, type: "LMS Telemetry", uploadedBy: "Automated ETL", date: "Nov 12, 2026 • 02:00 AM", status: "Completed" },
];

const INITIAL_DUPLICATES: DuplicatePair[] = [
  { id: "DUP-01", primaryId: "STU1001", primaryName: "Aarav Deshmukh (IT26-4091)", duplicateId: "TMP-9041", duplicateEmail: "aarav.deshmukh2@student.edusentinel.edu", confidence: 98, reason: "Exact phone + DOB match" },
  { id: "DUP-02", primaryId: "STU1002", primaryName: "Priya Rao (IT26-4092)", duplicateId: "EXT-1120", duplicateEmail: "p.rao.transfer@student.edusentinel.edu", confidence: 95, reason: "Matching National Registry ID" },
  { id: "DUP-03", primaryId: "STU1004", primaryName: "Ananya Iyer (IT26-4112)", duplicateId: "OLD-3302", duplicateEmail: "ananya.i@legacy.edusentinel.edu", confidence: 86, reason: "Name + Guardian phone fuzzy match" },
];

const REJECTED_ISSUES: RejectedIssue[] = [
  { id: "ISS-101", batch: "IMP-2026-012", rowNum: 214, column: "course_attendance_pct", rawValue: "108.5", reason: "Exceeds 0–100% bounds" },
  { id: "ISS-102", batch: "IMP-2026-012", rowNum: 499, column: "student_internal_id", rawValue: "(empty)", reason: "Required primary key missing" },
  { id: "ISS-103", batch: "IMP-2026-011", rowNum: 78, column: "quiz_weighted_avg", rawValue: "N/A", reason: "Non-numeric score value" },
];

const SOURCE_QUALITY = [
  { source: "SIS Attendance Feed", classBand: "IT Sem 5 / Sem 3", completeness: "99.4%", validity: "99.8%", rejected: 2 },
  { source: "Exam Assessment Workbook", classBand: "Comp & IT Year 3", completeness: "98.6%", validity: "99.2%", rejected: 1 },
  { source: "Moodle LMS Clickstream", classBand: "Institution-wide", completeness: "98.2%", validity: "100%", rejected: 0 },
];

const CANONICAL_FIELDS = [
  { key: "STU_ID", label: "Student Identifier (Required)", type: "String" },
  { key: "ATT_RATE", label: "Attendance Rate % (Required)", type: "Float" },
  { key: "CGPA_SCORE", label: "Assessment / CGPA Score", type: "Float" },
  { key: "LAST_LOGIN", label: "LMS Last Active Timestamp", type: "DateTime" },
];

const DATA_TABS = [
  { key: "data-imports", label: "Data Imports", icon: "cloud_sync" },
  { key: "data-quality", label: "Data Quality", icon: "verified" },
  { key: "field-mapping", label: "Onboarding Mapping Wizard", icon: "schema" },
  { key: "duplicate-review", label: "Duplicate Review", icon: "content_copy" },
] as const;

export default function DataManagementPage() {
  const { user, activeRole } = useAuthStore();
  const { addToast } = useUIStore();
  const isReadOnly = user?.role === "management" || activeRole === "management";

  const [activeTab, setActiveTab] = useState<"data-imports" | "data-quality" | "field-mapping" | "duplicate-review">("data-imports");
  const [importRecords, setImportRecords] = useState<ImportRecord[]>(INITIAL_IMPORTS);
  const [duplicates, setDuplicates] = useState<DuplicatePair[]>(INITIAL_DUPLICATES);

  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("student_assessment_records_batch_04.csv");
  const [datasetType, setDatasetType] = useState("Academic Assessment Scores");
  const [detectedColumns, setDetectedColumns] = useState<string[]>([
    "student_internal_id",
    "course_attendance_pct",
    "quiz_weighted_avg",
    "lms_last_active_ts",
    "guardian_email",
  ]);
  const [columnMap, setColumnMap] = useState<Record<string, string>>({
    STU_ID: "student_internal_id",
    ATT_RATE: "course_attendance_pct",
    CGPA_SCORE: "quiz_weighted_avg",
    LAST_LOGIN: "lms_last_active_ts",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setSelectedFileName(file.name);
    if (file.name.toLowerCase().endsWith(".csv")) {
      const reader = new FileReader();
      reader.onload = () => {
        const firstLine = String(reader.result ?? "").split(/\r?\n/)[0] ?? "";
        const cols = firstLine.split(",").map((c) => c.trim()).filter(Boolean);
        if (cols.length > 0) setDetectedColumns(cols);
      };
      reader.readAsText(file.slice(0, 4096));
    }
  };

  const handleDownloadTemplate = () => {
    const csv = "Student_ID,Full_Name,Subject_Code,Assessment_Type,Score_Obtained,Max_Score,Exam_Date\nSTU1001,Aarav Deshmukh,MATH-101,Midterm,78,100,2026-11-15\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "edusentinel_etl_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
    addToast({ title: "Downloaded Schema Template", type: "success" });
  };

  const handleExportRejectedCsv = () => {
    const csv = [
      "Issue_ID,Batch,Row,Column,Raw_Value,Reason",
      ...REJECTED_ISSUES.map((r) => `${r.id},${r.batch},${r.rowNum},${r.column},"${r.rawValue}","${r.reason}"`),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data_quality_issues.csv";
    a.click();
    URL.revokeObjectURL(url);
    addToast({ title: "Exported rejected rows (data_quality_issues.csv)", type: "info" });
  };

  const handleStartUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) {
      addToast({ title: "Restricted", message: "Read-only management persona cannot upload datasets.", type: "warning" });
      return;
    }
    setUploading(true);
    setUploadProgress(25);
    setTimeout(() => setUploadProgress(75), 350);
    setTimeout(() => {
      setUploadProgress(100);
      setUploading(false);
      setModalOpen(false);
      const newRec: ImportRecord = {
        id: `IMP-2026-0${importRecords.length + 13}`,
        filename: selectedFileName,
        recordsCount: selectedFile ? Math.max(12, Math.round(selectedFile.size / 48)) : 1248,
        type: datasetType,
        uploadedBy: user?.name || "Prof. R. Deshmukh",
        date: "Just now",
        status: "Completed",
      };
      setImportRecords([newRec, ...importRecords]);
      addToast({ title: "ETL Ingestion Complete", message: `Processed ${newRec.recordsCount} records from ${selectedFileName}.`, type: "success" });
    }, 850);
  };

  const handleSaveMapping = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) {
      addToast({ title: "Restricted", message: "Mapping edits are disabled in Read-Only mode.", type: "warning" });
      return;
    }
    addToast({ title: "Schema Mapping Saved", message: `Mapped ${detectedColumns.length} source columns to EduSentinel canonical store.`, type: "success" });
  };

  const resolveDuplicate = (id: string, action: "merge" | "dismiss") => {
    if (isReadOnly) {
      addToast({ title: "Restricted", message: "Duplicate resolution disabled for Management.", type: "warning" });
      return;
    }
    const target = duplicates.find((d) => d.id === id);
    setDuplicates((prev) => prev.filter((d) => d.id !== id));
    addToast({
      title: action === "merge" ? "Profiles Merged" : "Pair Dismissed",
      message: target ? `${target.primaryName} (${target.duplicateId})` : undefined,
      type: action === "merge" ? "success" : "info",
    });
  };

  const autoMergeHighConfidence = () => {
    if (isReadOnly) return;
    const before = duplicates.length;
    const remaining = duplicates.filter((d) => d.confidence < 95);
    setDuplicates(remaining);
    addToast({
      title: "Auto-Merge Completed",
      message: `Merged ${before - remaining.length} verified duplicate pair(s) >= 95% confidence.`,
      type: "success",
    });
  };

  return (
    <div className="text-[#181D26] pb-8">
      <div className="space-y-8">
        {isReadOnly && (
          <div className="bg-[#FFF9E5] border border-[#F4D35E]/50 rounded-[20px] p-4 flex items-center justify-between text-[#D9A441]">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">lock</span>
              <span className="text-[13px] font-semibold text-[#181D26]">
                Read-Only Mode Active (Executive Management / Dean Persona)
              </span>
            </div>
            <span className="text-[12px] text-[#666D7A]">ETL uploads, mappings &amp; merges are locked</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[12px] font-medium text-[#666D7A] uppercase tracking-wider mb-1">
              <span>Admin Portal</span>
              <span>/</span>
              <span className="text-[#181D26]">Data Pipelines</span>
            </div>
            <h1 className="text-[34px] sm:text-[38px] font-normal tracking-[-0.025em] text-[#181D26] leading-tight">
              Data Management
            </h1>
            <p className="text-[14px] text-[#666D7A] mt-1">
              Import CSV/XLSX rosters, run column mapping wizards, inspect rejected rows, and resolve duplicates.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-[14px] bg-white text-[#181D26] border border-[#E0E2E6] hover:bg-[#F8FAFC] text-[13px] font-medium cursor-pointer"
              type="button"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-[#666D7A]">download</span>
              <span>Schema Template</span>
            </button>
            <button
              onClick={() => !isReadOnly && setModalOpen(true)}
              disabled={isReadOnly}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-[14px] text-[13px] font-medium ${
                isReadOnly
                  ? "bg-[#F7F8FA] text-[#666D7A] cursor-not-allowed border border-[#E0E2E6]"
                  : "bg-[#181D26] hover:bg-[#333840] text-white cursor-pointer"
              }`}
              type="button"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">add</span>
              <span>Import Dataset</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[#F7F8FA] p-1.5 rounded-[16px] border border-[#E0E2E6] inline-flex flex-wrap items-center gap-1">
          {DATA_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-[12px] text-[13px] font-medium transition-all flex items-center gap-2 cursor-pointer ${
                  isActive ? "bg-[#181D26] text-white shadow-sm" : "text-[#666D7A] hover:text-[#181D26] hover:bg-white/60"
                }`}
                type="button"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[17px]">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.key === "duplicate-review" && duplicates.length > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[11px] ${isActive ? "bg-[#333840] text-white" : "bg-[#FCAB79] text-[#AA2D00]"}`}>
                    {duplicates.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: DATA IMPORTS */}
        {activeTab === "data-imports" && (
          <div className="bg-white rounded-[22px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#E0E2E6] overflow-hidden">
            <div className="p-5 px-6 border-b border-[#E0E2E6] flex items-center justify-between">
              <div>
                <h2 className="text-[17px] font-semibold text-[#181D26]">Recent Ingestion Batches</h2>
                <p className="text-[13px] text-[#666D7A] mt-0.5">Automated and manual ETL pipeline history</p>
              </div>
              <span className="text-[12px] text-[#666D7A]">{importRecords.length} batches</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#E0E2E6] text-[12px] font-medium text-[#666D7A] uppercase tracking-wider">
                    <th className="py-3 px-5">Batch ID</th>
                    <th className="py-3 px-5">Source File</th>
                    <th className="py-3 px-5">Records</th>
                    <th className="py-3 px-5">Domain</th>
                    <th className="py-3 px-5">Uploaded By</th>
                    <th className="py-3 px-5">Timestamp</th>
                    <th className="py-3 px-5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0E2E6] text-[13px]">
                  {importRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-3.5 px-5 font-mono text-[#181D26] font-semibold">{r.id}</td>
                      <td className="py-3.5 px-5 font-medium text-[#181D26]">{r.filename}</td>
                      <td className="py-3.5 px-5 font-semibold font-mono">{r.recordsCount.toLocaleString()}</td>
                      <td className="py-3.5 px-5 text-[#333840]">{r.type}</td>
                      <td className="py-3.5 px-5 text-[#666D7A]">{r.uploadedBy}</td>
                      <td className="py-3.5 px-5 text-[#666D7A] whitespace-nowrap">{r.date}</td>
                      <td className="py-3.5 px-5 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#F4FAF7] text-[#0A2E0E] border border-[#A8D8C4]/50">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: DATA QUALITY */}
        {activeTab === "data-quality" && (
          <div className="space-y-6">
            <div className="bg-white rounded-[22px] p-6 border border-[#E0E2E6] space-y-4">
              <h2 className="text-[18px] font-semibold text-[#181D26]">Per-Source &amp; Per-Class Quality Scores</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px] min-w-[600px]">
                  <thead>
                    <tr className="border-b border-[#E0E2E6] text-[12px] font-medium text-[#666D7A] uppercase">
                      <th className="py-2.5 px-4">Source</th>
                      <th className="py-2.5 px-4">Class / Scope</th>
                      <th className="py-2.5 px-4">Completeness</th>
                      <th className="py-2.5 px-4">Range Validity</th>
                      <th className="py-2.5 px-4 text-right">Rejected Rows</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0E2E6]">
                    {SOURCE_QUALITY.map((sq) => (
                      <tr key={sq.source}>
                        <td className="py-3 px-4 font-medium">{sq.source}</td>
                        <td className="py-3 px-4 text-[#666D7A]">{sq.classBand}</td>
                        <td className="py-3 px-4 font-mono text-[#0A2E0E] font-semibold">{sq.completeness}</td>
                        <td className="py-3 px-4 font-mono text-[#0A2E0E] font-semibold">{sq.validity}</td>
                        <td className="py-3 px-4 text-right font-mono">{sq.rejected}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-[22px] p-6 border border-[#E0E2E6] space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-[18px] font-semibold text-[#181D26]">Rejected Rows (`data_quality_issues`)</h2>
                  <p className="text-[13px] text-[#666D7A]">Quarantined records failing schema or range validation</p>
                </div>
                <button
                  type="button"
                  onClick={handleExportRejectedCsv}
                  className="px-3.5 py-2 rounded-[10px] border border-[#E0E2E6] text-[12px] font-medium hover:bg-[#F7F8FA] cursor-pointer"
                >
                  Export Issues CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px] min-w-[600px]">
                  <thead>
                    <tr className="border-b border-[#E0E2E6] text-[12px] font-medium text-[#666D7A] uppercase">
                      <th className="py-2.5 px-4">Issue ID</th>
                      <th className="py-2.5 px-4">Batch</th>
                      <th className="py-2.5 px-4">Row</th>
                      <th className="py-2.5 px-4">Column</th>
                      <th className="py-2.5 px-4">Raw Value</th>
                      <th className="py-2.5 px-4">Validation Error</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0E2E6]">
                    {REJECTED_ISSUES.map((iss) => (
                      <tr key={iss.id}>
                        <td className="py-3 px-4 font-mono font-semibold">{iss.id}</td>
                        <td className="py-3 px-4 font-mono text-[#666D7A]">{iss.batch}</td>
                        <td className="py-3 px-4 font-mono">#{iss.rowNum}</td>
                        <td className="py-3 px-4 font-mono text-[#1B61C9]">{iss.column}</td>
                        <td className="py-3 px-4 font-mono text-[#AA2D00]">{iss.rawValue}</td>
                        <td className="py-3 px-4 text-[#333840]">{iss.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ONBOARDING COLUMN MAPPING WIZARD */}
        {activeTab === "field-mapping" && (
          <form onSubmit={handleSaveMapping} className="bg-white rounded-[22px] p-6 border border-[#E0E2E6] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-[18px] font-semibold text-[#181D26]">Onboarding Column Mapping Wizard</h2>
                <p className="text-[13px] text-[#666D7A]">
                  Source file: <span className="font-mono text-[#181D26]">{selectedFileName}</span> ({detectedColumns.length} detected headers)
                </p>
              </div>
              <button
                type="submit"
                disabled={isReadOnly}
                className="px-4 py-2 rounded-[12px] bg-[#181D26] text-white text-[13px] font-medium hover:bg-[#333840] disabled:opacity-50 cursor-pointer self-start"
              >
                Save Mapping Preset
              </button>
            </div>
            <div className="divide-y divide-[#E0E2E6]">
              {CANONICAL_FIELDS.map((cf) => (
                <div key={cf.key} className="py-3.5 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                  <div>
                    <span className="font-mono text-[13px] font-semibold text-[#1B61C9] block">{cf.key}</span>
                    <span className="text-[12px] text-[#666D7A]">{cf.label} ({cf.type})</span>
                  </div>
                  <select
                    disabled={isReadOnly}
                    aria-label={`Map ${cf.key}`}
                    value={columnMap[cf.key] ?? detectedColumns[0]}
                    onChange={(e) => setColumnMap((prev) => ({ ...prev, [cf.key]: e.target.value }))}
                    className="h-10 px-3 rounded-[10px] border border-[#E0E2E6] bg-white text-[13px] font-mono"
                  >
                    {detectedColumns.map((col) => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                  <span className="text-[12px] text-[#0A2E0E] font-medium md:text-right">Valid mapping ✓</span>
                </div>
              ))}
            </div>
          </form>
        )}

        {/* TAB 4: DUPLICATE REVIEW */}
        {activeTab === "duplicate-review" && (
          <div className="bg-white rounded-[22px] p-6 border border-[#E0E2E6] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-[18px] font-semibold text-[#181D26]">Duplicate Record Resolution</h2>
                <p className="text-[13px] text-[#666D7A]">Review individual candidate matches and merge or dismiss pairs</p>
              </div>
              {duplicates.length > 0 && (
                <button
                  type="button"
                  onClick={autoMergeHighConfidence}
                  disabled={isReadOnly}
                  className="px-4 py-2 rounded-[12px] bg-[#181D26] text-white text-[13px] font-medium disabled:opacity-50 cursor-pointer self-start"
                >
                  Auto-Merge &gt;= 95%
                </button>
              )}
            </div>

            {duplicates.length === 0 ? (
              <EmptyState title="Zero open duplicates" message="All candidate duplicate pairs have been reviewed and resolved." />
            ) : (
              <div className="space-y-3">
                {duplicates.map((pair) => (
                  <div key={pair.id} className="p-4 rounded-[16px] border border-[#E0E2E6] bg-[#F7F8FA] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[12px] font-semibold text-[#181D26]">{pair.primaryId}</span>
                        <span className="text-[14px] font-semibold">{pair.primaryName}</span>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#FFF9E5] text-[#D9A441] border border-[#F4D35E]">
                          {pair.confidence}% match
                        </span>
                      </div>
                      <p className="text-[12.5px] text-[#666D7A] mt-1">
                        Candidate <span className="font-mono">{pair.duplicateId}</span> ({pair.duplicateEmail}) • {pair.reason}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => resolveDuplicate(pair.id, "dismiss")}
                        className="px-3.5 py-2 rounded-[10px] border border-[#E0E2E6] bg-white text-[12px] font-medium disabled:opacity-50 cursor-pointer"
                      >
                        Dismiss
                      </button>
                      <button
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => resolveDuplicate(pair.id, "merge")}
                        className="px-3.5 py-2 rounded-[10px] bg-[#181D26] text-white text-[12px] font-medium disabled:opacity-50 cursor-pointer"
                      >
                        Merge Pair
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <ModalShell open={modalOpen} title="Import Dataset into Feature Store" onClose={() => !uploading && setModalOpen(false)}>
        <form onSubmit={handleStartUpload} className="space-y-4">
          <div>
            <label htmlFor="dataset-domain" className="block text-[13px] font-medium text-[#181D26] mb-1">Dataset Domain</label>
            <select
              id="dataset-domain"
              value={datasetType}
              onChange={(e) => setDatasetType(e.target.value)}
              className="w-full h-11 px-3.5 rounded-[12px] bg-white border border-[#E0E2E6] text-[13px]"
            >
              <option>Academic Assessment Scores</option>
              <option>Attendance Log Records</option>
              <option>LMS Telemetry Activity</option>
              <option>Student Cohort Directory</option>
            </select>
          </div>
          <div>
            <label htmlFor="dataset-file" className="block text-[13px] font-medium text-[#181D26] mb-1">
              Select CSV, XLSX, or JSON File
            </label>
            <input
              id="dataset-file"
              type="file"
              accept=".csv,.xlsx,.xls,.json"
              onChange={handleFileChange}
              className="w-full text-[13px] file:mr-3 file:py-2 file:px-4 file:rounded-[10px] file:border-0 file:bg-[#181D26] file:text-white file:text-[12px] cursor-pointer"
            />
            <p className="mt-1.5 text-[12px] text-[#666D7A] font-mono">Selected: {selectedFileName}</p>
          </div>
          {uploading && (
            <div className="space-y-1">
              <div className="flex justify-between text-[12px]"><span>Ingesting...</span><span>{uploadProgress}%</span></div>
              <div className="w-full h-2 rounded-full bg-[#F7F8FA] overflow-hidden">
                <div className="h-full bg-[#181D26] transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" disabled={uploading} onClick={() => setModalOpen(false)} className="px-4 py-2 text-[13px] text-[#666D7A] cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={uploading} className="px-5 py-2.5 rounded-[12px] bg-[#181D26] text-white text-[13px] font-medium cursor-pointer disabled:opacity-50">
              {uploading ? "Processing..." : "Start Ingestion"}
            </button>
          </div>
        </form>
      </ModalShell>
    </div>
  );
}
