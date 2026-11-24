"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useUIStore } from "@/store/useUIStore";
import Avatar from "@/components/ui/Avatar";
import ModalShell from "@/components/ui/ModalShell";
import { ChartCard, BarComparisonChart } from "@/components/charts/ChartCard";
import { MOCK_STUDENTS } from "@/lib/mock-data";

type RiskTier = "High" | "Moderate" | "Low";
type PeerVerdict = "Improved" | "No clear change" | "Worsened";

interface PlanStep {
  id: string;
  title: string;
  detail: string;
  status: "Completed" | "In Progress" | "Scheduled";
  due: string;
}

interface FollowUpItem {
  id: string;
  title: string;
  due: string;
  channel: string;
  completed: boolean;
}

interface MenteeWorkspaceProfile {
  id: string;
  name: string;
  grade: string;
  risk: RiskTier;
  avatarUrl?: string;
  attendance: number;
  attendanceDelta: number;
  avgScore: number;
  scoreDelta: number;
  missedAssignments: number;
  engagementIndex: number;
  progressPct: number;
  currentPhaseLabel: string;
  verdict: PeerVerdict;
  retentionProb: number;
  peerDeltaLabel: string;
  baselineAttendance: number;
  baselineHomework: number;
  steps: PlanStep[];
  notes: { date: string; text: string }[];
  followUps: FollowUpItem[];
  outcomeSeries: { metric: string; before: number; after: number; matchedPeer: number }[];
}

const INITIAL_PROFILES: Record<string, MenteeWorkspaceProfile> = {
  STU1001: {
    id: "STU1001",
    name: MOCK_STUDENTS[0].name,
    grade: "IT Sem 5 • IT26-4091",
    risk: "High",
    avatarUrl: MOCK_STUDENTS[0].avatarUrl,
    attendance: 64.5,
    attendanceDelta: -18,
    avgScore: 54,
    scoreDelta: 16,
    missedAssignments: 4,
    engagementIndex: 52,
    progressPct: 50,
    currentPhaseLabel: "Phase 2 of 3: Calculus III Peer Tutoring with Dr. Sarah Khan",
    verdict: "Improved",
    retentionProb: 89.4,
    peerDeltaLabel: "+16% score gain vs. +9% matched-peer baseline",
    baselineAttendance: 75,
    baselineHomework: 80,
    steps: [
      { id: "p1", title: "Phase 1: Calculus Diagnostic Assessment", detail: "Pinpointed partial-derivative & integration gaps.", status: "Completed", due: "Nov 05" },
      { id: "p2", title: "Phase 2: Twice-Weekly Peer Tutoring", detail: "Paired with senior tutor + weekly quiz sets.", status: "In Progress", due: "Nov 25" },
      { id: "p3", title: "Phase 3: Final Readiness & Guardian Check", detail: "Verify attendance > 75% before Term 2 exams.", status: "Scheduled", due: "Dec 10" },
    ],
    notes: [
      { date: "Nov 18, 2026", text: "Attended both tutoring labs; partial-derivatives fluency recovering." },
      { date: "Nov 10, 2026", text: "Agreed to Monday morning attendance accountability check-in." },
    ],
    followUps: [
      { id: "f1", title: "Weekly Check-in: Calculus Practice Verification", due: "Nov 25, 2026", channel: "In-Person", completed: false },
      { id: "f2", title: "Guardian Check-in: Morning Attendance Review", due: "Nov 29, 2026", channel: "Phone Call", completed: false },
    ],
    outcomeSeries: [
      { metric: "Score %", before: 38, after: 54, matchedPeer: 47 },
      { metric: "Attendance %", before: 58, after: 64.5, matchedPeer: 61 },
      { metric: "Engagement %", before: 40, after: 52, matchedPeer: 46 },
    ],
  },
  STU1002: {
    id: "STU1002",
    name: MOCK_STUDENTS[1].name,
    grade: "IT Sem 5 • IT26-4092",
    risk: "High",
    avatarUrl: MOCK_STUDENTS[1].avatarUrl,
    attendance: 71.0,
    attendanceDelta: -9,
    avgScore: 59,
    scoreDelta: 3,
    missedAssignments: 2,
    engagementIndex: 61,
    progressPct: 50,
    currentPhaseLabel: "Phase 2 of 2: OS Lab Makeup Contract",
    verdict: "No clear change",
    retentionProb: 84.2,
    peerDeltaLabel: "+3% score gain vs. +4% matched-peer baseline",
    baselineAttendance: 78,
    baselineHomework: 85,
    steps: [
      { id: "p1", title: "Phase 1: Attendance Contract Signed", detail: "Agreed on zero unexcused OS lab absences.", status: "Completed", due: "Nov 02" },
      { id: "p2", title: "Phase 2: OS Lab 4 & 5 Submissions", detail: "Submitted Lab 4; preparing Lab 5 TA viva.", status: "In Progress", due: "Nov 22" },
    ],
    notes: [
      { date: "Nov 16, 2026", text: "OS Lab 4 code approved by TA; scheduling Lab 5 walkthrough." },
    ],
    followUps: [
      { id: "f3", title: "Verify OS Lab 5 TA Viva Score", due: "Nov 22, 2026", channel: "LMS Check", completed: false },
    ],
    outcomeSeries: [
      { metric: "Score %", before: 56, after: 59, matchedPeer: 60 },
      { metric: "Attendance %", before: 70, after: 71, matchedPeer: 72 },
      { metric: "Engagement %", before: 58, after: 61, matchedPeer: 61 },
    ],
  },
  STU1003: {
    id: "STU1003",
    name: MOCK_STUDENTS[2].name,
    grade: "IT Sem 5 • IT26-4105",
    risk: "Moderate",
    avatarUrl: MOCK_STUDENTS[2].avatarUrl,
    attendance: 68.2,
    attendanceDelta: -5,
    avgScore: 64,
    scoreDelta: -4,
    missedAssignments: 3,
    engagementIndex: 57,
    progressPct: 50,
    currentPhaseLabel: "Phase 1 of 2: Counseling & Timetable Restructuring",
    verdict: "Worsened",
    retentionProb: 79.5,
    peerDeltaLabel: "-2.8% attendance vs. +3% matched-peer baseline (review needed)",
    baselineAttendance: 80,
    baselineHomework: 82,
    steps: [
      { id: "p1", title: "Phase 1: Wellbeing Intake Consult", detail: "Identified late-night sleep pattern affecting 9 AM tutorials.", status: "Completed", due: "Nov 08" },
      { id: "p2", title: "Phase 2: DSA Backlog Recovery Sprint", detail: "Tree & DP problem sets with peer study group.", status: "Scheduled", due: "Nov 26" },
    ],
    notes: [
      { date: "Nov 15, 2026", text: "Referred to campus counselor for sleep-routine coaching." },
    ],
    followUps: [
      { id: "f4", title: "Collect Signed Study Timetable", due: "Nov 26, 2026", channel: "Counselor Sync", completed: false },
    ],
    outcomeSeries: [
      { metric: "Score %", before: 68, after: 64, matchedPeer: 69 },
      { metric: "Attendance %", before: 71, after: 68.2, matchedPeer: 74 },
      { metric: "Engagement %", before: 60, after: 57, matchedPeer: 65 },
    ],
  },
  STU1004: {
    id: "STU1004",
    name: MOCK_STUDENTS[3].name,
    grade: "IT Sem 5 • IT26-4112",
    risk: "Moderate",
    avatarUrl: MOCK_STUDENTS[3].avatarUrl,
    attendance: 78.4,
    attendanceDelta: 3,
    avgScore: 72,
    scoreDelta: 6,
    missedAssignments: 1,
    engagementIndex: 74,
    progressPct: 100,
    currentPhaseLabel: "Phase 2 of 2: Algorithms Mastery Wrap-up",
    verdict: "Improved",
    retentionProb: 93.8,
    peerDeltaLabel: "+6% score gain vs. +3% matched-peer baseline",
    baselineAttendance: 85,
    baselineHomework: 90,
    steps: [
      { id: "p1", title: "Phase 1: Deadline Pacing Checklist", detail: "Automated 48-hr LMS reminders configured.", status: "Completed", due: "Nov 04" },
      { id: "p2", title: "Phase 2: Dynamic Programming Workshop", detail: "Completed all practice problems with 84% avg.", status: "Completed", due: "Nov 16" },
    ],
    notes: [
      { date: "Nov 12, 2026", text: "No late submissions in last 2 weeks; risk dropping steadily." },
    ],
    followUps: [
      { id: "f5", title: "Pre-final Algorithms Office Hour", due: "Nov 28, 2026", channel: "Video Call", completed: false },
    ],
    outcomeSeries: [
      { metric: "Score %", before: 66, after: 72, matchedPeer: 69 },
      { metric: "Attendance %", before: 75, after: 78.4, matchedPeer: 76 },
      { metric: "Engagement %", before: 64, after: 74, matchedPeer: 68 },
    ],
  },
  STU1005: {
    id: "STU1005",
    name: MOCK_STUDENTS[4].name,
    grade: "IT Sem 5 • IT26-4088",
    risk: "Low",
    avatarUrl: MOCK_STUDENTS[4].avatarUrl,
    attendance: 85.0,
    attendanceDelta: 6,
    avgScore: 79,
    scoreDelta: 5,
    missedAssignments: 0,
    engagementIndex: 84,
    progressPct: 100,
    currentPhaseLabel: "Graduated from Active Support — Routine Monitoring",
    verdict: "Improved",
    retentionProb: 97.6,
    peerDeltaLabel: "+6% attendance vs. +1% matched-peer baseline",
    baselineAttendance: 88,
    baselineHomework: 92,
    steps: [
      { id: "p1", title: "Morning Attendance Stabilization", detail: "Maintained >= 85% across 4 consecutive weeks.", status: "Completed", due: "Nov 10" },
    ],
    notes: [
      { date: "Nov 10, 2026", text: "Cleared all milestones; moved to light monthly check-ins." },
    ],
    followUps: [
      { id: "f6", title: "Monthly Check-in Confirmation", due: "Dec 02, 2026", channel: "In-Person", completed: true },
    ],
    outcomeSeries: [
      { metric: "Score %", before: 74, after: 79, matchedPeer: 76 },
      { metric: "Attendance %", before: 79, after: 85, matchedPeer: 80 },
      { metric: "Engagement %", before: 76, after: 84, matchedPeer: 78 },
    ],
  },
};

const WORKSPACE_TABS = [
  { key: "tab-overview", label: "Overview", icon: "dashboard" },
  { key: "tab-intervention-plan", label: "Intervention Plan", icon: "assignment" },
  { key: "tab-session-logs", label: "Session Logs", icon: "event_note" },
  { key: "tab-follow-ups", label: "Follow-ups", icon: "notifications_active" },
  { key: "tab-outcomes", label: "Outcomes", icon: "insights" },
  { key: "tab-what-if", label: "What-if Hints", icon: "psychology" },
] as const;

function InterventionWorkspaceInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useUIStore();

  const sIdParam = searchParams.get("studentId");
  const tabParam = searchParams.get("tab");

  const [profiles, setProfiles] = useState<Record<string, MenteeWorkspaceProfile>>(INITIAL_PROFILES);
  const [selectedStudentId, setSelectedStudentId] = useState(() =>
    sIdParam && INITIAL_PROFILES[sIdParam] ? sIdParam : "STU1001"
  );
  const [activeTab, setActiveTab] = useState(() =>
    tabParam ? (tabParam.startsWith("tab-") ? tabParam : `tab-${tabParam}`) : "tab-overview"
  );

  const [menteeSearch, setMenteeSearch] = useState("");
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [newPlanFocus, setNewPlanFocus] = useState("Calculus Problem Solving Tutoring");
  const [newPlanNotes, setNewPlanNotes] = useState("Twice-weekly 25-minute check-ins on foundational problem sets.");

  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageBody, setMessageBody] = useState("");

  const [rescheduleTarget, setRescheduleTarget] = useState<FollowUpItem | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("2026-12-01");

  const [quickNote, setQuickNote] = useState("");
  const [simAttendance, setSimAttendance] = useState(85);
  const [simHomework, setSimHomework] = useState(90);

  const menteeList = Object.values(profiles);
  const selectedMentee = profiles[selectedStudentId] ?? profiles.STU1001;

  const handleSelectMentee = (id: string) => {
    setSelectedStudentId(id);
    const prof = profiles[id];
    if (prof) {
      setSimAttendance(prof.baselineAttendance);
      setSimHomework(prof.baselineHomework);
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("studentId", id);
    router.replace(`/mentor/interventions?${params.toString()}`);
  };

  const handleSelectTab = (tabKey: string) => {
    setActiveTab(tabKey);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabKey.replace("tab-", ""));
    router.replace(`/mentor/interventions?${params.toString()}`);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNote.trim()) return;
    setProfiles((prev) => ({
      ...prev,
      [selectedMentee.id]: {
        ...prev[selectedMentee.id],
        notes: [{ date: "Just now", text: quickNote.trim() }, ...prev[selectedMentee.id].notes],
      },
    }));
    setQuickNote("");
    addToast({ title: "Session note logged", message: `Added note to ${selectedMentee.name}'s timeline.`, type: "success" });
  };

  const handleLaunchPlan = (e: React.FormEvent) => {
    e.preventDefault();
    const newStep: PlanStep = {
      id: `p-${Date.now()}`,
      title: newPlanFocus,
      detail: newPlanNotes.trim() || "Targeted mentor intervention milestone.",
      status: "In Progress",
      due: "Dec 08",
    };
    setProfiles((prev) => ({
      ...prev,
      [selectedMentee.id]: {
        ...prev[selectedMentee.id],
        steps: [newStep, ...prev[selectedMentee.id].steps],
        currentPhaseLabel: `Active: ${newPlanFocus}`,
      },
    }));
    setIsPlanModalOpen(false);
    addToast({ title: "Intervention Launched", message: `Added "${newPlanFocus}" for ${selectedMentee.name}.`, type: "success" });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageBody.trim()) return;
    setProfiles((prev) => ({
      ...prev,
      [selectedMentee.id]: {
        ...prev[selectedMentee.id],
        notes: [{ date: "Message Sent • Just now", text: `Direct message to ${selectedMentee.name}: "${messageBody.trim()}"` }, ...prev[selectedMentee.id].notes],
      },
    }));
    setMessageBody("");
    setIsMessageModalOpen(false);
    addToast({ title: "Message Dispatched", message: `Sent direct check-in message to ${selectedMentee.name}.`, type: "success" });
  };

  const toggleFollowUp = (fuId: string) => {
    setProfiles((prev) => ({
      ...prev,
      [selectedMentee.id]: {
        ...prev[selectedMentee.id],
        followUps: prev[selectedMentee.id].followUps.map((f) =>
          f.id === fuId ? { ...f, completed: !f.completed } : f
        ),
      },
    }));
    addToast({ title: "Follow-up status updated", type: "success" });
  };

  const handleSaveReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleTarget) return;
    setProfiles((prev) => ({
      ...prev,
      [selectedMentee.id]: {
        ...prev[selectedMentee.id],
        followUps: prev[selectedMentee.id].followUps.map((f) =>
          f.id === rescheduleTarget.id ? { ...f, due: rescheduleDate } : f
        ),
      },
    }));
    addToast({
      title: "Follow-up Rescheduled",
      message: `${rescheduleTarget.title} moved to ${rescheduleDate}.`,
      type: "success",
    });
    setRescheduleTarget(null);
  };

  const handleExportSessionSummary = () => {
    const lines = [
      `EduSentinel AI — Mentorship Session Summary`,
      `Student: ${selectedMentee.name} (${selectedMentee.id})`,
      `Cohort: ${selectedMentee.grade} | Risk: ${selectedMentee.risk}`,
      `Attendance: ${selectedMentee.attendance}% | Avg Score: ${selectedMentee.avgScore}%`,
      ``,
      `Active Roadmap:`,
      ...selectedMentee.steps.map((s) => `- [${s.status}] ${s.title} (${s.due}): ${s.detail}`),
      ``,
      `Session Notes:`,
      ...selectedMentee.notes.map((n) => `- ${n.date}: ${n.text}`),
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedMentee.id}_mentorship_summary.txt`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({ title: "Summary Exported", message: `Downloaded ${selectedMentee.id}_mentorship_summary.txt`, type: "success" });
  };

  const filteredMentees = menteeList.filter(
    (m) =>
      m.name.toLowerCase().includes(menteeSearch.toLowerCase()) ||
      m.id.toLowerCase().includes(menteeSearch.toLowerCase())
  );

  const predictedScore = Math.min(95, Math.round(selectedMentee.avgScore * 0.4 + simAttendance * 0.35 + simHomework * 0.25));

  return (
    <div className="text-[#181D26] pb-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[12px] font-medium text-[#666D7A] uppercase tracking-wider mb-1">
              <Link href="/mentor/dashboard" className="hover:text-[#181D26] transition-colors">
                Mentee Dashboard
              </Link>
              <span>/</span>
              <span className="text-[#181D26]">Intervention Workspace</span>
            </div>
            <h1 className="text-[34px] sm:text-[38px] font-normal tracking-[-0.025em] text-[#181D26] leading-tight">
              Intervention Workspace
            </h1>
            <p className="text-[14px] text-[#666D7A] mt-1">
              Plan, track and evaluate targeted support interventions for your caseload.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMessageModalOpen(true)}
              className="px-4 py-2.5 bg-white border border-[#E0E2E6] hover:bg-[#F8FAFC] text-[#181D26] rounded-[14px] text-[13px] font-medium shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-all flex items-center gap-2 cursor-pointer"
              type="button"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-[#666D7A]">chat_bubble_outline</span>
              <span>Send Message</span>
            </button>
            <button
              onClick={() => setIsPlanModalOpen(true)}
              className="px-5 py-2.5 bg-[#181D26] hover:bg-[#333840] text-white rounded-[14px] text-[13px] font-medium shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all flex items-center gap-2 cursor-pointer"
              type="button"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">add</span>
              <span>New Intervention</span>
            </button>
          </div>
        </div>

        {/* Workspace Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Mentee Directory */}
          <div className="lg:col-span-3 bg-white rounded-[22px] border border-[#E0E2E6] shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="p-4 border-b border-[#E0E2E6] bg-[#F7F8FA]/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-[#181D26]">Mentee Directory</span>
                <span className="px-2 py-0.5 rounded-full bg-[#E0E2E6] text-[11px] font-medium text-[#333840]">
                  {menteeList.length} Students
                </span>
              </div>
              <div className="relative w-full">
                <span aria-hidden="true" className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#666D7A] text-[18px]">
                  search
                </span>
                <input
                  aria-label="Filter mentees"
                  value={menteeSearch}
                  onChange={(e) => setMenteeSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white text-[#181D26] text-[13px] rounded-[10px] border border-[#E0E2E6] placeholder:text-[#666D7A] focus:outline-none focus:border-[#181D26] transition-all"
                  placeholder="Search mentee..."
                  type="text"
                />
              </div>
            </div>

            <div className="divide-y divide-[#E0E2E6] overflow-y-auto max-h-[640px]">
              {filteredMentees.map((m) => {
                const isSelected = selectedStudentId === m.id;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => handleSelectMentee(m.id)}
                    className={`w-full text-left p-3.5 px-4 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-[#F7F8FA] border-l-4 border-[#181D26]"
                        : "hover:bg-[#F8FAFC] border-l-4 border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={m.name} src={m.avatarUrl} size={36} className="border border-[#E0E2E6]" />
                      <div className="flex flex-col min-w-0">
                        <span className={`text-[13px] truncate ${isSelected ? "font-semibold text-[#181D26]" : "text-[#333840]"}`}>
                          {m.name}
                        </span>
                        <span className="font-mono text-[11px] text-[#666D7A]">{m.id}</span>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        m.risk === "High"
                          ? "bg-[#FFF8F5] text-[#AA2D00] border border-[#FCAB79]/40"
                          : m.risk === "Moderate"
                          ? "bg-[#FFF9E5] text-[#D9A441] border border-[#F4D35E]/40"
                          : "bg-[#F4FAF7] text-[#0A2E0E] border border-[#A8D8C4]/40"
                      }`}
                    >
                      {m.risk}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Active Mentee Workspace */}
          <div className="lg:col-span-9 space-y-6">
            <div className="bg-white rounded-[22px] border border-[#E0E2E6] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar name={selectedMentee.name} src={selectedMentee.avatarUrl} size={56} className="border border-[#E0E2E6]" />
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-[22px] font-semibold text-[#181D26]">{selectedMentee.name}</h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[12px] font-medium flex items-center gap-1.5 ${
                        selectedMentee.risk === "High"
                          ? "bg-[#FFF8F5] text-[#AA2D00] border border-[#FCAB79]/40"
                          : selectedMentee.risk === "Moderate"
                          ? "bg-[#FFF9E5] text-[#D9A441] border border-[#F4D35E]/40"
                          : "bg-[#F4FAF7] text-[#0A2E0E] border border-[#A8D8C4]/50"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          selectedMentee.risk === "High"
                            ? "bg-[#AA2D00]"
                            : selectedMentee.risk === "Moderate"
                            ? "bg-[#D9A441]"
                            : "bg-[#0A2E0E]"
                        }`}
                      />
                      {selectedMentee.risk} Risk Caseload
                    </span>
                  </div>
                  <p className="text-[13px] text-[#666D7A] mt-1 font-mono">
                    {selectedMentee.id} • {selectedMentee.grade}
                  </p>
                </div>
              </div>

              <Link
                href={`/teacher/students/${selectedMentee.id}`}
                className="px-4 py-2 rounded-[12px] border border-[#E0E2E6] bg-white hover:bg-[#F8FAFC] text-[#181D26] text-[13px] font-medium transition-colors inline-flex items-center gap-1.5 self-start sm:self-center"
              >
                <span>Full 360 Dossier</span>
                <span aria-hidden="true" className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>

            {/* Tabs */}
            <div className="bg-[#F7F8FA] p-1.5 rounded-[16px] border border-[#E0E2E6] flex items-center gap-1 overflow-x-auto">
              {WORKSPACE_TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => handleSelectTab(tab.key)}
                    className={`px-3.5 py-2 rounded-[12px] text-[13px] whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? "bg-[#181D26] text-white shadow-sm font-medium"
                        : "text-[#666D7A] hover:text-[#181D26] hover:bg-white/60 font-normal"
                    }`}
                    type="button"
                  >
                    <span aria-hidden="true" className="material-symbols-outlined text-[17px]">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === "tab-overview" && (
              <div className="space-y-6 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-[22px] border border-[#E0E2E6] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                    <span className="text-[12px] font-medium text-[#666D7A]">Attendance Rate</span>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-[32px] font-semibold text-[#181D26]">{selectedMentee.attendance}%</span>
                      <span className={`text-[12px] font-medium ${selectedMentee.attendanceDelta < 0 ? "text-[#AA2D00]" : "text-[#0A2E0E]"}`}>
                        {selectedMentee.attendanceDelta > 0 ? `+${selectedMentee.attendanceDelta}%` : `${selectedMentee.attendanceDelta}%`}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-[22px] border border-[#E0E2E6] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                    <span className="text-[12px] font-medium text-[#666D7A]">Average Score</span>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-[32px] font-semibold text-[#181D26]">{selectedMentee.avgScore}%</span>
                      <span className={`text-[12px] font-medium ${selectedMentee.scoreDelta < 0 ? "text-[#AA2D00]" : "text-[#0A2E0E]"}`}>
                        {selectedMentee.scoreDelta > 0 ? `+${selectedMentee.scoreDelta}%` : `${selectedMentee.scoreDelta}%`}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#FFF8F5] p-5 rounded-[22px] border border-[#FCAB79]/40 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                    <span className="text-[12px] font-medium text-[#AA2D00]">Missed Submissions</span>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-[32px] font-semibold text-[#AA2D00]">{selectedMentee.missedAssignments}</span>
                      <span className="text-[12px] font-medium text-[#AA2D00]">Active flags</span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-[22px] border border-[#E0E2E6] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                    <span className="text-[12px] font-medium text-[#666D7A]">Engagement Index</span>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-[32px] font-semibold text-[#181D26]">{selectedMentee.engagementIndex}%</span>
                      <span className="text-[12px] text-[#666D7A]">LMS velocity</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[22px] border border-[#E0E2E6] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[17px] font-semibold text-[#181D26]">
                      Active Intervention Progress for {selectedMentee.name}
                    </h3>
                    <span className="text-[13px] font-semibold text-[#181D26]">{selectedMentee.progressPct}% Completed</span>
                  </div>
                  <div className="w-full bg-[#F7F8FA] h-3 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-[#181D26] rounded-full transition-all" style={{ width: `${selectedMentee.progressPct}%` }} />
                  </div>
                  <p className="text-[13px] text-[#666D7A]">{selectedMentee.currentPhaseLabel}</p>
                </div>
              </div>
            )}

            {/* TAB 2: INTERVENTION PLAN */}
            {activeTab === "tab-intervention-plan" && (
              <div className="bg-white rounded-[22px] border border-[#E0E2E6] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-[17px] font-semibold text-[#181D26]">Intervention Roadmap — {selectedMentee.name}</h3>
                    <p className="text-[13px] text-[#666D7A] mt-0.5">Structured milestones and assigned faculty/mentor checks</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPlanModalOpen(true)}
                    className="px-3.5 py-2 rounded-[10px] bg-[#181D26] text-white text-[12px] font-medium hover:bg-[#333840] cursor-pointer"
                  >
                    + Add Plan Step
                  </button>
                </div>

                {selectedMentee.steps.map((step) => (
                  <div
                    key={step.id}
                    className={`p-4 rounded-[16px] border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      step.status === "Completed"
                        ? "border-[#A8D8C4] bg-[#F4FAF7]"
                        : step.status === "In Progress"
                        ? "border-[#181D26] bg-[#F7F8FA]"
                        : "border-[#E0E2E6] bg-white"
                    }`}
                  >
                    <div>
                      <h4 className="text-[14px] font-semibold text-[#181D26]">{step.title}</h4>
                      <p className="text-[13px] text-[#666D7A] mt-0.5">{step.detail}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[12px] font-medium shrink-0 self-start md:self-center ${
                        step.status === "Completed"
                          ? "bg-white text-[#0A2E0E] border border-[#A8D8C4]/50"
                          : step.status === "In Progress"
                          ? "bg-[#181D26] text-white"
                          : "bg-[#F7F8FA] text-[#666D7A] border border-[#E0E2E6]"
                      }`}
                    >
                      {step.status} ({step.due})
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: SESSION LOGS */}
            {activeTab === "tab-session-logs" && (
              <div className="bg-white rounded-[22px] border border-[#E0E2E6] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-[17px] font-semibold text-[#181D26]">Mentorship Session Logs — {selectedMentee.name}</h3>
                    <p className="text-[13px] text-[#666D7A] mt-0.5">Direct 1-on-1 coaching observation records</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportSessionSummary}
                    className="px-3.5 py-2 rounded-[12px] border border-[#E0E2E6] text-[#181D26] text-[13px] font-medium hover:bg-[#F8FAFC] cursor-pointer shadow-sm"
                  >
                    Export Summary
                  </button>
                </div>

                <form onSubmit={handleAddNote} className="mb-6 flex gap-2">
                  <input
                    value={quickNote}
                    onChange={(e) => setQuickNote(e.target.value)}
                    placeholder={`Add quick session note for ${selectedMentee.name}...`}
                    className="flex-1 px-4 py-2.5 rounded-[14px] bg-[#F7F8FA] border border-[#E0E2E6] text-[13px] text-[#181D26] outline-none focus:border-[#181D26]"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-[14px] bg-[#181D26] text-white text-[13px] font-medium hover:bg-[#333840] cursor-pointer shrink-0"
                  >
                    Log Note
                  </button>
                </form>

                <div className="divide-y divide-[#E0E2E6]">
                  {selectedMentee.notes.map((note, idx) => (
                    <div key={idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-[13px] text-[#181D26] font-medium">{note.text}</span>
                      <span className="text-[12px] font-mono text-[#666D7A] shrink-0">{note.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: FOLLOW-UPS */}
            {activeTab === "tab-follow-ups" && (
              <div className="bg-white rounded-[22px] border border-[#E0E2E6] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
                <h3 className="text-[17px] font-semibold text-[#181D26]">
                  Pending &amp; Scheduled Follow-ups — {selectedMentee.name}
                </h3>
                <div className="space-y-3">
                  {selectedMentee.followUps.map((fu) => (
                    <div
                      key={fu.id}
                      className={`p-4 rounded-[16px] border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        fu.completed ? "bg-[#F4FAF7] border-[#A8D8C4]/60" : "bg-[#F7F8FA] border-[#E0E2E6]"
                      }`}
                    >
                      <div>
                        <h4 className={`text-[14px] font-semibold ${fu.completed ? "line-through text-[#666D7A]" : "text-[#181D26]"}`}>
                          {fu.title}
                        </h4>
                        <p className="text-[12px] text-[#666D7A]">Due {fu.due} • {fu.channel}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setRescheduleTarget(fu);
                            setRescheduleDate("2026-12-02");
                          }}
                          className="px-3.5 py-2 rounded-[10px] border border-[#E0E2E6] bg-white text-[#181D26] text-[12px] font-medium hover:bg-[#F8FAFC] cursor-pointer"
                        >
                          Reschedule
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleFollowUp(fu.id)}
                          className={`px-3.5 py-2 rounded-[10px] text-[12px] font-medium cursor-pointer ${
                            fu.completed ? "bg-white text-[#0A2E0E] border border-[#A8D8C4]" : "bg-[#181D26] text-white hover:bg-[#333840]"
                          }`}
                        >
                          {fu.completed ? "Completed ✓" : "Mark Complete"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: OUTCOMES */}
            {activeTab === "tab-outcomes" && (
              <div className="space-y-5">
                <div className="bg-white rounded-[22px] border border-[#E0E2E6] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-[#666D7A]">
                      Matched-Peer Outcome Verdict
                    </span>
                    <h3 className="text-[20px] font-semibold text-[#181D26] mt-0.5">
                      {selectedMentee.name} — {selectedMentee.verdict}
                    </h3>
                    <p className="text-[13px] text-[#666D7A] mt-0.5">{selectedMentee.peerDeltaLabel}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold ${
                        selectedMentee.verdict === "Improved"
                          ? "bg-[#F4FAF7] text-[#0A2E0E] border border-[#A8D8C4]"
                          : selectedMentee.verdict === "No clear change"
                          ? "bg-[#FFF9E5] text-[#D9A441] border border-[#F4D35E]"
                          : "bg-[#FFF8F5] text-[#AA2D00] border border-[#FCAB79]"
                      }`}
                    >
                      {selectedMentee.verdict}
                    </span>
                    <div className="text-right">
                      <span className="text-[11px] text-[#666D7A] block">Retention Prob.</span>
                      <span className="text-[18px] font-semibold text-[#181D26]">{selectedMentee.retentionProb}%</span>
                    </div>
                  </div>
                </div>

                <ChartCard
                  title="Before vs. After & Matched-Peer Comparison"
                  subtitle={`Evaluating ${selectedMentee.name}'s current progress against pre-intervention baseline and matched control peers`}
                  ariaLabel={`Bar comparison chart of Before, After, and Matched Peer score, attendance, and engagement for ${selectedMentee.name}`}
                  data={selectedMentee.outcomeSeries}
                  filename={`${selectedMentee.id}_outcomes`}
                  height={260}
                >
                  <BarComparisonChart
                    data={selectedMentee.outcomeSeries}
                    xKey="metric"
                    series={[
                      { key: "before", label: "Before Intervention", color: "#9297A0" },
                      { key: "after", label: "Current Post-Intervention", color: "#181D26" },
                      { key: "matchedPeer", label: "Matched Peer Baseline", color: "#D9A441" },
                    ]}
                    height={260}
                  />
                </ChartCard>
              </div>
            )}

            {/* TAB 6: WHAT-IF HINTS */}
            {activeTab === "tab-what-if" && (
              <div className="bg-white rounded-[22px] border border-[#E0E2E6] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-6">
                <div>
                  <h3 className="text-[17px] font-semibold text-[#181D26]">
                    Interactive AI &quot;What-If&quot; Simulation — {selectedMentee.name}
                  </h3>
                  <p className="text-[13px] text-[#666D7A] mt-0.5">
                    Adjust attendance and assignment completion targets to preview predicted grade impact.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 rounded-[18px] border border-[#E0E2E6] bg-[#F7F8FA] space-y-3">
                    <div className="flex justify-between items-center">
                      <label htmlFor="sim-att" className="text-[13px] font-medium text-[#181D26]">Target Attendance Rate</label>
                      <span className="text-[18px] font-semibold font-mono text-[#181D26]">{simAttendance}%</span>
                    </div>
                    <input
                      id="sim-att"
                      type="range"
                      min="50"
                      max="100"
                      value={simAttendance}
                      onChange={(e) => setSimAttendance(Number(e.target.value))}
                      className="w-full accent-[#181D26] cursor-pointer"
                    />
                  </div>

                  <div className="p-5 rounded-[18px] border border-[#E0E2E6] bg-[#F7F8FA] space-y-3">
                    <div className="flex justify-between items-center">
                      <label htmlFor="sim-hw" className="text-[13px] font-medium text-[#181D26]">Homework Completion</label>
                      <span className="text-[18px] font-semibold font-mono text-[#181D26]">{simHomework}%</span>
                    </div>
                    <input
                      id="sim-hw"
                      type="range"
                      min="50"
                      max="100"
                      value={simHomework}
                      onChange={(e) => setSimHomework(Number(e.target.value))}
                      className="w-full accent-[#181D26] cursor-pointer"
                    />
                  </div>
                </div>

                <div className="p-6 rounded-[20px] bg-[#F4FAF7] border border-[#A8D8C4]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#0A2E0E] font-semibold">Simulated Prediction Outcome</span>
                    <div className="text-[28px] font-semibold text-[#181D26] mt-1">{predictedScore}% Projected Grade</div>
                    <p className="text-[13px] text-[#333840]">
                      Current {selectedMentee.avgScore}% → Projected {predictedScore}% ({predictedScore >= 75 ? "Low Risk" : "Moderate Risk"})
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addToast({ title: "Target Saved", message: `Saved What-If target (${predictedScore}%) for ${selectedMentee.name}.`, type: "success" })}
                    className="px-5 py-2.5 bg-[#181D26] text-white rounded-[14px] text-[13px] font-medium cursor-pointer hover:bg-[#333840]"
                  >
                    Apply as Intervention Target
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: New Intervention */}
      <ModalShell open={isPlanModalOpen} title={`New Intervention — ${selectedMentee.name}`} onClose={() => setIsPlanModalOpen(false)}>
        <form onSubmit={handleLaunchPlan} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[#181D26] mb-1">Support Focus Area</label>
            <select
              value={newPlanFocus}
              onChange={(e) => setNewPlanFocus(e.target.value)}
              className="w-full h-11 px-3.5 rounded-[12px] bg-white border border-[#E0E2E6] text-[13px] text-[#181D26]"
            >
              <option>Calculus Problem Solving Tutoring</option>
              <option>Assignment Mentoring &amp; Accountability</option>
              <option>Exam Anxiety &amp; Pacing Coaching</option>
              <option>Attendance Consistency Check-ins</option>
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#181D26] mb-1">Intervention Notes</label>
            <textarea
              rows={3}
              value={newPlanNotes}
              onChange={(e) => setNewPlanNotes(e.target.value)}
              className="w-full p-3 rounded-[12px] bg-white border border-[#E0E2E6] text-[13px] text-[#181D26]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsPlanModalOpen(false)} className="px-4 py-2 text-[13px] text-[#666D7A] cursor-pointer">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 rounded-[12px] bg-[#181D26] text-white text-[13px] font-medium cursor-pointer">
              Launch Plan
            </button>
          </div>
        </form>
      </ModalShell>

      {/* Modal: Send Message */}
      <ModalShell open={isMessageModalOpen} title={`Send Message to ${selectedMentee.name}`} onClose={() => setIsMessageModalOpen(false)}>
        <form onSubmit={handleSendMessage} className="space-y-4">
          <textarea
            rows={4}
            required
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            placeholder={`Write an encouraging check-in note to ${selectedMentee.name}...`}
            className="w-full p-3 rounded-[12px] bg-white border border-[#E0E2E6] text-[13px] text-[#181D26]"
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsMessageModalOpen(false)} className="px-4 py-2 text-[13px] text-[#666D7A] cursor-pointer">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 rounded-[12px] bg-[#181D26] text-white text-[13px] font-medium cursor-pointer">
              Send Message
            </button>
          </div>
        </form>
      </ModalShell>

      {/* Modal: Reschedule Follow-up */}
      <ModalShell
        open={Boolean(rescheduleTarget)}
        title="Reschedule Follow-up"
        onClose={() => setRescheduleTarget(null)}
      >
        <form onSubmit={handleSaveReschedule} className="space-y-4">
          <p className="text-[13px] text-[#333840]">{rescheduleTarget?.title}</p>
          <div>
            <label htmlFor="reschedule-date" className="block text-[13px] font-medium text-[#181D26] mb-1">
              New Due Date
            </label>
            <input
              id="reschedule-date"
              type="date"
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              className="w-full h-11 px-3.5 rounded-[12px] border border-[#E0E2E6] text-[13px]"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setRescheduleTarget(null)} className="px-4 py-2 text-[13px] text-[#666D7A] cursor-pointer">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 rounded-[12px] bg-[#181D26] text-white text-[13px] font-medium cursor-pointer">
              Save Date
            </button>
          </div>
        </form>
      </ModalShell>
    </div>
  );
}

export default function InterventionWorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px] text-[14px] text-[#666D7A]">
          Loading Intervention Workspace...
        </div>
      }
    >
      <InterventionWorkspaceInner />
    </Suspense>
  );
}
