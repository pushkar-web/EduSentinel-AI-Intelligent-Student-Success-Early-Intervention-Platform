"use client";

import React, { useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useUIStore } from "@/store/useUIStore";
import Avatar from "@/components/ui/Avatar";
import ModalShell from "@/components/ui/ModalShell";
import { EmptyState } from "@/components/ui/StateFeedback";
import { MOCK_STUDENTS } from "@/lib/mock-data";

interface InterventionItem {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  risk: "High" | "Medium" | "Low";
  type: string;
  startDate: string;
  followUpDate: string;
  status: "In Progress" | "Scheduled" | "Completed";
  progress: number;
  avatarUrl?: string;
  notes?: string;
}

const INITIAL_INTERVENTIONS: InterventionItem[] = [
  { id: "INT-101", studentId: "STU1001", studentName: MOCK_STUDENTS[0].name, studentCode: "IT26-4091", risk: "High", type: "Remedial Calculus Tutoring", startDate: "Nov 10, 2026", followUpDate: "2026-11-25", status: "In Progress", progress: 45, avatarUrl: MOCK_STUDENTS[0].avatarUrl, notes: "Focusing on Calculus III & Linear Algebra unit tests." },
  { id: "INT-102", studentId: "STU1002", studentName: MOCK_STUDENTS[1].name, studentCode: "IT26-4092", risk: "High", type: "OS Lab Catch-up Contract", startDate: "Nov 08, 2026", followUpDate: "2026-11-22", status: "In Progress", progress: 65, avatarUrl: MOCK_STUDENTS[1].avatarUrl, notes: "Submitting missing OS Lab 4 & 5 code evaluations." },
  { id: "INT-103", studentId: "STU1003", studentName: MOCK_STUDENTS[2].name, studentCode: "IT26-4105", risk: "Medium", type: "DSA Practice & Study Plan", startDate: "Nov 05, 2026", followUpDate: "2026-11-26", status: "Scheduled", progress: 25, avatarUrl: MOCK_STUDENTS[2].avatarUrl, notes: "Assigned peer study buddy for tree & DP problem sets." },
  { id: "INT-104", studentId: "STU1004", studentName: MOCK_STUDENTS[3].name, studentCode: "IT26-4112", risk: "Medium", type: "LMS Deadline Accountability", startDate: "Nov 02, 2026", followUpDate: "2026-11-28", status: "In Progress", progress: 75, avatarUrl: MOCK_STUDENTS[3].avatarUrl, notes: "Automated 48h LMS check-ins with faculty advisor." },
  { id: "INT-105", studentId: "STU1005", studentName: MOCK_STUDENTS[4].name, studentCode: "IT26-4088", risk: "Low", type: "Morning Attendance Check-in", startDate: "Oct 20, 2026", followUpDate: "2026-11-15", status: "Completed", progress: 100, avatarUrl: MOCK_STUDENTS[4].avatarUrl, notes: "Maintained >= 85% attendance over 4 consecutive weeks." },
];

const SUGGESTED_INTERVENTIONS = [
  { rank: "#1", studentId: "STU1001", studentName: "Aarav Deshmukh", action: "Calculus Peer Lab Pairing", reason: "38% Midterm 2 drop + Monday absence pattern (89 risk score)" },
  { rank: "#2", studentId: "STU1002", studentName: "Priya Rao", action: "OS Lab Makeup Window", reason: "3 unsubmitted labs driving 76% probability of C- grade" },
  { rank: "#3", studentId: "STU1003", studentName: "Rohan Kapoor", action: "Counselor Timetable Reset", reason: "Consecutive 9 AM lecture misses flagged across 2 weeks" },
];

function InterventionPlannerInner() {
  const searchParams = useSearchParams();
  const { addToast } = useUIStore();

  const studentParam = searchParams.get("studentId");
  const alertParam = searchParams.get("alertId");
  const batchParam = searchParams.get("batch");

  const [interventions, setInterventions] = useState<InterventionItem[]>(INITIAL_INTERVENTIONS);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"cards" | "calendar">("cards");
  const [drawerOpen, setDrawerOpen] = useState(() => Boolean(studentParam || alertParam || batchParam));
  const [detailTarget, setDetailTarget] = useState<InterventionItem | null>(null);

  const [targetStudentId, setTargetStudentId] = useState(() => studentParam || "STU1001");
  const [interventionType, setInterventionType] = useState(() =>
    batchParam ? "Group Study Support" : "Academic Support (Tutoring)"
  );
  const [followUpDate, setFollowUpDate] = useState("2026-11-28");
  const [notes, setNotes] = useState("Schedule twice-weekly 20-min remedial check-ins focused on problem solving.");

  const filteredInterventions = useMemo(() => {
    if (activeTab === "ALL") return interventions;
    return interventions.filter((i) => i.status === activeTab);
  }, [interventions, activeTab]);

  const calendarGroups = useMemo(() => {
    const groups: Record<string, InterventionItem[]> = {};
    filteredInterventions.forEach((item) => {
      if (!groups[item.followUpDate]) groups[item.followUpDate] = [];
      groups[item.followUpDate].push(item);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredInterventions]);

  const handleSaveIntervention = (e: React.FormEvent) => {
    e.preventDefault();
    const stu = MOCK_STUDENTS.find((s) => s.id === targetStudentId) ?? MOCK_STUDENTS[0];
    const newItem: InterventionItem = {
      id: `INT-${Date.now().toString().slice(-3)}`,
      studentId: stu.id,
      studentName: stu.name,
      studentCode: stu.studentId,
      risk: stu.riskLevel === "Critical" || stu.riskLevel === "High" ? "High" : stu.riskLevel === "Medium" ? "Medium" : "Low",
      type: interventionType,
      startDate: "Today",
      followUpDate: followUpDate || "2026-12-01",
      status: "Scheduled",
      progress: 0,
      avatarUrl: stu.avatarUrl,
      notes,
    };
    setInterventions([newItem, ...interventions]);
    setDrawerOpen(false);
    addToast({ title: "Intervention Prescribed", message: `Created "${interventionType}" for ${stu.name}.`, type: "success" });
  };

  const handleUpdateDetail = (status: InterventionItem["status"], progress: number) => {
    if (!detailTarget) return;
    setInterventions((prev) =>
      prev.map((item) => (item.id === detailTarget.id ? { ...item, status, progress } : item))
    );
    addToast({ title: "Intervention Updated", message: `${detailTarget.studentName}: ${status} (${progress}%).`, type: "success" });
    setDetailTarget(null);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAECEF] text-[#181D26] text-[12px] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#006400]" />
            Active Pedagogical Case Management
          </div>
          <h1 className="text-[34px] sm:text-[40px] font-normal tracking-tight text-[#181D26]">
            Intervention Planner &amp; Support Workflows
          </h1>
          <p className="text-[15px] text-[#41454D]">
            Review ranked AI suggestions, prescribe targeted support, update milestones in-role, and track calendar follow-ups.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="inline-flex bg-[#F1F3F5] p-1 rounded-[12px]">
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`px-3 py-1.5 rounded-[9px] text-[12.5px] font-medium cursor-pointer ${viewMode === "cards" ? "bg-white shadow-xs" : "text-[#666D7A]"}`}
            >
              Plan Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-1.5 rounded-[9px] text-[12.5px] font-medium cursor-pointer ${viewMode === "calendar" ? "bg-white shadow-xs" : "text-[#666D7A]"}`}
            >
              Follow-up Calendar
            </button>
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[14px] bg-[#181D26] text-white text-[13.5px] font-medium hover:bg-[#0D1218] cursor-pointer"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">add</span>
            <span>Create Intervention</span>
          </button>
        </div>
      </div>

      {/* Ranked Suggested Interventions Strip */}
      <div className="bg-white rounded-[22px] p-6 border border-[#EAECEF] space-y-4">
        <div>
          <h2 className="text-[17px] font-semibold">Ranked AI Intervention Suggestions</h2>
          <p className="text-[13px] text-[#666D7A]">Prioritized by urgency and expected academic recovery impact</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SUGGESTED_INTERVENTIONS.map((sug) => (
            <div key={sug.studentId} className="p-4 rounded-[16px] bg-[#F7F8FA] border border-[#EAECEF] flex flex-col justify-between gap-3">
              <div>
                <span className="px-2 py-0.5 rounded-full bg-[#FFF8F5] text-[#AA2D00] border border-[#FCAB79]/40 text-[11px] font-semibold">
                  {sug.rank} Priority • {sug.studentName}
                </span>
                <h3 className="text-[14px] font-semibold mt-2">{sug.action}</h3>
                <p className="text-[12px] text-[#666D7A] mt-0.5">{sug.reason}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTargetStudentId(sug.studentId);
                  setInterventionType(sug.action);
                  setDrawerOpen(true);
                }}
                className="self-start px-3 py-1.5 rounded-[10px] bg-[#181D26] text-white text-[12px] font-medium cursor-pointer"
              >
                Prescribe Plan →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#EAECEF]">
        {[
          { key: "ALL", label: "All Interventions", count: interventions.length },
          { key: "In Progress", label: "In Progress", count: interventions.filter((i) => i.status === "In Progress").length },
          { key: "Scheduled", label: "Scheduled", count: interventions.filter((i) => i.status === "Scheduled").length },
          { key: "Completed", label: "Completed", count: interventions.filter((i) => i.status === "Completed").length },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-[12px] text-[13.5px] font-medium shrink-0 cursor-pointer flex items-center gap-2 ${
              activeTab === tab.key ? "bg-[#181D26] text-white" : "text-[#41454D] hover:bg-[#F7F8FA]"
            }`}
          >
            <span>{tab.label}</span>
            <span className="text-[11px] opacity-80">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Content: Plan Cards OR Follow-up Calendar */}
      {filteredInterventions.length === 0 ? (
        <EmptyState title="No interventions in this status" message="Create a new support plan or switch filter tabs." />
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredInterventions.map((item) => (
            <div key={item.id} className="bg-white rounded-[22px] p-6 border border-[#EAECEF] flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={item.studentName} src={item.avatarUrl} size={40} />
                    <div className="min-w-0">
                      <Link href={`/teacher/students/${item.studentId}`} className="font-medium hover:underline truncate block">
                        {item.studentName}
                      </Link>
                      <p className="text-[11.5px] text-[#666D7A] font-mono">{item.studentCode} • {item.type}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F7F8FA] border border-[#EAECEF] shrink-0">
                    {item.status}
                  </span>
                </div>
                {item.notes && <p className="text-[13px] text-[#41454D] line-clamp-2">{item.notes}</p>}
                <div className="space-y-1">
                  <div className="flex justify-between text-[12px] text-[#666D7A]">
                    <span>Cycle Progress</span>
                    <span className="font-mono font-semibold text-[#181D26]">{item.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#EAECEF] rounded-full overflow-hidden">
                    <div className="h-full bg-[#181D26] rounded-full" style={{ width: `${item.progress}%` }} />
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-[#F1F3F5] flex items-center justify-between text-[12px]">
                <span className="font-mono text-[#666D7A]">Due {item.followUpDate}</span>
                {/* In-role detail drawer button instead of 403 /mentor/interventions link */}
                <button
                  type="button"
                  onClick={() => setDetailTarget(item)}
                  className="font-semibold text-[#1B61C9] hover:underline cursor-pointer"
                >
                  Inspect / Update →
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[22px] p-6 border border-[#EAECEF] space-y-4">
          <h2 className="text-[18px] font-semibold">Follow-up Calendar Schedule</h2>
          <div className="space-y-4">
            {calendarGroups.map(([date, rows]) => (
              <div key={date} className="p-4 rounded-[16px] bg-[#F7F8FA] border border-[#EAECEF] space-y-2.5">
                <span className="font-mono text-[12px] font-semibold text-[#181D26] block">{date}</span>
                {rows.map((r) => (
                  <div key={r.id} className="p-3 rounded-[12px] bg-white border border-[#EAECEF] flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[13.5px] font-semibold block">{r.studentName} — {r.type}</span>
                      <span className="text-[12px] text-[#666D7A]">{r.status} • {r.progress}% complete</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDetailTarget(r)}
                      className="px-3 py-1 rounded-[8px] border border-[#DDDDDD] text-[12px] font-medium cursor-pointer"
                    >
                      Update
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Intervention Modal */}
      <ModalShell open={drawerOpen} title="Prescribe Pedagogical Support" onClose={() => setDrawerOpen(false)}>
        <form onSubmit={handleSaveIntervention} className="space-y-4">
          <div>
            <label htmlFor="target-stu" className="block text-[13px] font-medium mb-1">Target Student</label>
            <select
              id="target-stu"
              value={targetStudentId}
              onChange={(e) => setTargetStudentId(e.target.value)}
              className="w-full h-10 px-3 rounded-[10px] border border-[#DDDDDD] text-[13px]"
            >
              {MOCK_STUDENTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.id}) — {s.riskLevel} Risk
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="int-type" className="block text-[13px] font-medium mb-1">Intervention Type</label>
            <input
              id="int-type"
              value={interventionType}
              onChange={(e) => setInterventionType(e.target.value)}
              className="w-full h-10 px-3 rounded-[10px] border border-[#DDDDDD] text-[13px]"
            />
          </div>
          <div>
            <label htmlFor="fu-date" className="block text-[13px] font-medium mb-1">Checkpoint Date</label>
            <input
              id="fu-date"
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full h-10 px-3 rounded-[10px] border border-[#DDDDDD] text-[13px]"
            />
          </div>
          <div>
            <label htmlFor="int-notes" className="block text-[13px] font-medium mb-1">Action Plan Goals</label>
            <textarea
              id="int-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-[10px] border border-[#DDDDDD] text-[13px]"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setDrawerOpen(false)} className="px-4 py-2 text-[13px] text-[#666D7A] cursor-pointer">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 rounded-[10px] bg-[#181D26] text-white text-[13px] font-medium cursor-pointer">
              Dispatch Plan
            </button>
          </div>
        </form>
      </ModalShell>

      {/* In-role Detail & Progress Update Modal */}
      <ModalShell
        open={Boolean(detailTarget)}
        title={detailTarget ? `${detailTarget.studentName} — ${detailTarget.type}` : "Intervention Details"}
        onClose={() => setDetailTarget(null)}
      >
        {detailTarget && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-[12px] bg-[#F7F8FA] border border-[#EAECEF] text-[13px] space-y-1">
              <p><strong>ID:</strong> <span className="font-mono">{detailTarget.id}</span></p>
              <p><strong>Follow-up:</strong> <span className="font-mono">{detailTarget.followUpDate}</span></p>
              <p><strong>Notes:</strong> {detailTarget.notes}</p>
            </div>
            <div className="flex flex-wrap justify-between gap-2">
              <Link href={`/teacher/students/${detailTarget.studentId}`} className="text-[13px] font-semibold text-[#1B61C9] hover:underline self-center">
                View Student 360 →
              </Link>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateDetail("In Progress", Math.min(90, detailTarget.progress + 25))}
                  className="px-3.5 py-2 rounded-[10px] border text-[12.5px] font-medium cursor-pointer"
                >
                  Log +25% Progress
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateDetail("Completed", 100)}
                  className="px-4 py-2 rounded-[10px] bg-[#0A2E0E] text-white text-[12.5px] font-medium cursor-pointer"
                >
                  Mark Completed
                </button>
              </div>
            </div>
          </div>
        )}
      </ModalShell>
    </div>
  );
}

export default function InterventionPlannerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#666D7A] text-[14px]">Loading intervention planner...</div>}>
      <InterventionPlannerInner />
    </Suspense>
  );
}
