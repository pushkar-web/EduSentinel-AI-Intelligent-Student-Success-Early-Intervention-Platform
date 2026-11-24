"use client";

import React, { useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useUIStore } from "@/store/useUIStore";
import Avatar from "@/components/ui/Avatar";
import ModalShell from "@/components/ui/ModalShell";
import { EmptyState } from "@/components/ui/StateFeedback";
import { MOCK_STUDENTS } from "@/lib/mock-data";

interface StudentItem {
  id: string;
  code: string;
  name: string;
  subject: string;
  risk: "High" | "Medium" | "Low";
  attendance: number;
  academicAvg: number;
  concern: string;
  lastActive: string;
  avatarUrl?: string;
}

const INITIAL_STUDENTS: StudentItem[] = [
  { id: "STU1001", code: "IT26-4091", name: MOCK_STUDENTS[0].name, subject: "Mathematics", risk: "High", attendance: 64.5, academicAvg: 54, concern: "Attendance drop & Calculus III mark < 40%", lastActive: "Today, 09:15 AM", avatarUrl: MOCK_STUDENTS[0].avatarUrl },
  { id: "STU1002", code: "IT26-4092", name: MOCK_STUDENTS[1].name, subject: "Operating Systems", risk: "High", attendance: 71.0, academicAvg: 59, concern: "Missing OS lab assignments", lastActive: "Yesterday", avatarUrl: MOCK_STUDENTS[1].avatarUrl },
  { id: "STU1003", code: "IT26-4105", name: MOCK_STUDENTS[2].name, subject: "Data Structures", risk: "Medium", attendance: 68.2, academicAvg: 64, concern: "Score decline in DSA module", lastActive: "2 days ago", avatarUrl: MOCK_STUDENTS[2].avatarUrl },
  { id: "STU1004", code: "IT26-4112", name: MOCK_STUDENTS[3].name, subject: "Algorithms", risk: "Medium", attendance: 78.4, academicAvg: 72, concern: "Late submission flag on midterm prep", lastActive: "Today, 11:20 AM", avatarUrl: MOCK_STUDENTS[3].avatarUrl },
  { id: "STU1005", code: "IT26-4088", name: MOCK_STUDENTS[4].name, subject: "Computer Networks", risk: "Low", attendance: 85.0, academicAvg: 79, concern: "Consistent recovery across lectures", lastActive: "Yesterday", avatarUrl: MOCK_STUDENTS[4].avatarUrl },
  { id: "STU1006", code: "IT26-4075", name: MOCK_STUDENTS[5].name, subject: "Software Studio", risk: "Low", attendance: 94.2, academicAvg: 89, concern: "On track — top 5% cohort performer", lastActive: "Today, 2:40 PM", avatarUrl: MOCK_STUDENTS[5].avatarUrl },
];

type TabKey = "all" | "high" | "med" | "low";

function StudentDirectoryInner() {
  const searchParams = useSearchParams();
  const { addToast } = useUIStore();
  const initialTab = (searchParams.get("tab") || "all").toLowerCase();

  const [students, setStudents] = useState<StudentItem[]>(INITIAL_STUDENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>(
    initialTab === "high" || initialTab === "med" || initialTab === "low" ? initialTab : "all"
  );
  const [subjectFilter, setSubjectFilter] = useState("ALL");
  const [attFilter, setAttFilter] = useState<"ALL" | "UNDER_65" | "65_79" | "OVER_80">("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSubject, setNewSubject] = useState("Mathematics");
  const [newRisk, setNewRisk] = useState<"High" | "Medium" | "Low">("Medium");

  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.concern.toLowerCase().includes(q);
      if (!matchesSearch) return false;
      if (activeTab === "high" && s.risk !== "High") return false;
      if (activeTab === "med" && s.risk !== "Medium") return false;
      if (activeTab === "low" && s.risk !== "Low") return false;
      if (subjectFilter !== "ALL" && s.subject !== subjectFilter) return false;
      if (attFilter === "UNDER_65" && s.attendance >= 65) return false;
      if (attFilter === "65_79" && (s.attendance < 65 || s.attendance >= 80)) return false;
      if (attFilter === "OVER_80" && s.attendance < 80) return false;
      return true;
    });
  }, [students, searchQuery, activeTab, subjectFilter, attFilter]);

  const handleExportCSV = () => {
    const source = selectedIds.length > 0 ? filteredStudents.filter((s) => selectedIds.includes(s.id)) : filteredStudents;
    const csv = [
      "ID,Roll,Name,Subject,Risk,Attendance%,Academic%,Concern",
      ...source.map((s) => `${s.id},${s.code},"${s.name}","${s.subject}",${s.risk},${s.attendance},${s.academicAvg},"${s.concern}"`),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = selectedIds.length > 0 ? "edusentinel_selected_students.csv" : "edusentinel_students.csv";
    a.click();
    URL.revokeObjectURL(url);
    addToast({ title: `Exported ${source.length} student row(s) to CSV`, type: "success" });
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const nextIdx = students.length + 1;
    const newStudent: StudentItem = {
      id: `STU100${nextIdx}`,
      code: `IT26-41${10 + nextIdx}`,
      name: newName.trim(),
      subject: newSubject,
      risk: newRisk,
      attendance: newRisk === "High" ? 64 : 84,
      academicAvg: newRisk === "High" ? 56 : 79,
      concern: "New enrollment baseline tracking",
      lastActive: "Just now",
    };
    setStudents([newStudent, ...students]);
    setNewName("");
    setShowAddModal(false);
    addToast({ title: "Student Added", message: `${newStudent.name} (${newStudent.id}) added.`, type: "success" });
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-[34px] sm:text-[38px] font-normal tracking-tight text-[#181D26]">
            Student Directory
          </h1>
          <p className="text-[14px] text-[#666D7A] mt-1">
            Filter cohort risk bands, subjects, and attendance thresholds with batch CSV export.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-[14px] bg-white border border-[#DDDDDD] text-[13px] font-medium hover:bg-[#F7F8FA] cursor-pointer"
          >
            Export {selectedIds.length > 0 ? `Selected (${selectedIds.length})` : "CSV"}
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-[14px] bg-[#181D26] text-white text-[13px] font-medium cursor-pointer"
          >
            + Add Student
          </button>
        </div>
      </div>

      {/* Tabs + Filters */}
      <div className="bg-white rounded-[20px] p-4 border border-[#EAECEF] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(
              [
                ["all", "All Students"],
                ["high", "High Risk"],
                ["med", "Medium Risk"],
                ["low", "Low Risk"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`px-3.5 py-2 rounded-[10px] text-[13px] font-medium cursor-pointer ${
                  activeTab === id ? "bg-[#181D26] text-white" : "text-[#41454D] hover:bg-[#F7F8FA]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              aria-label="Search students"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, ID, concern..."
              className="h-10 px-3.5 rounded-[10px] border border-[#DDDDDD] text-[13px] w-52"
            />
            <select
              aria-label="Filter by subject"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="h-10 px-3 rounded-[10px] border border-[#DDDDDD] text-[13px]"
            >
              <option value="ALL">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Operating Systems">Operating Systems</option>
              <option value="Data Structures">Data Structures</option>
              <option value="Algorithms">Algorithms</option>
              <option value="Computer Networks">Computer Networks</option>
              <option value="Software Studio">Software Studio</option>
            </select>
            <select
              aria-label="Filter by attendance band"
              value={attFilter}
              onChange={(e) => setAttFilter(e.target.value as typeof attFilter)}
              className="h-10 px-3 rounded-[10px] border border-[#DDDDDD] text-[13px]"
            >
              <option value="ALL">Any Attendance</option>
              <option value="UNDER_65">&lt; 65% Critical</option>
              <option value="65_79">65% – 79% Watch</option>
              <option value="OVER_80">&gt;= 80% Healthy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-[22px] border border-[#EAECEF] overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No students match your filters"
              message="Reset search, subject, or attendance band criteria."
              action={{
                label: "Reset Filters",
                onClick: () => {
                  setSearchQuery("");
                  setActiveTab("all");
                  setSubjectFilter("ALL");
                  setAttFilter("ALL");
                },
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] min-w-[760px]">
              <thead>
                <tr className="border-b border-[#EAECEF] text-[12px] font-medium text-[#666D7A] uppercase">
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      aria-label="Select all students"
                      checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0}
                      onChange={(e) => setSelectedIds(e.target.checked ? filteredStudents.map((s) => s.id) : [])}
                      className="w-4 h-4 accent-[#181D26]"
                    />
                  </th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Subject Focus</th>
                  <th className="py-3 px-4">Risk Tier</th>
                  <th className="py-3 px-4">Attendance</th>
                  <th className="py-3 px-4">Academic Avg</th>
                  <th className="py-3 px-4">Key Concern</th>
                  <th className="py-3 px-5 text-right">Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F3F5]">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-[#F7F8FA]">
                    <td className="py-3.5 px-4">
                      <input
                        type="checkbox"
                        aria-label={`Select ${s.name}`}
                        checked={selectedIds.includes(s.id)}
                        onChange={() =>
                          setSelectedIds((prev) => (prev.includes(s.id) ? prev.filter((x) => x !== s.id) : [...prev, s.id]))
                        }
                        className="w-4 h-4 accent-[#181D26]"
                      />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={s.name} src={s.avatarUrl} size={36} />
                        <div>
                          <Link href={`/teacher/students/${s.id}`} className="font-medium hover:underline block">
                            {s.name}
                          </Link>
                          <span className="font-mono text-[11px] text-[#666D7A]">{s.id} • {s.code}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">{s.subject}</td>
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
                        {s.risk} Risk
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold">{s.attendance}%</td>
                    <td className="py-3.5 px-4 font-mono">{s.academicAvg}%</td>
                    <td className="py-3.5 px-4 text-[#41454D]">{s.concern}</td>
                    <td className="py-3.5 px-5 text-right">
                      <Link
                        href={`/teacher/students/${s.id}`}
                        className="px-3 py-1.5 rounded-[10px] border border-[#DDDDDD] bg-white text-[12px] font-medium hover:bg-[#F7F8FA]"
                      >
                        Open 360 →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ModalShell open={showAddModal} title="Add Student to Roster" onClose={() => setShowAddModal(false)}>
        <form onSubmit={handleAddStudent} className="space-y-4">
          <input required value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Student full name" className="w-full h-10 px-3 rounded-[10px] border border-[#DDDDDD] text-[13px]" />
          <div className="grid grid-cols-2 gap-3">
            <select value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className="h-10 px-3 rounded-[10px] border border-[#DDDDDD] text-[13px]">
              <option>Mathematics</option>
              <option>Operating Systems</option>
              <option>Data Structures</option>
              <option>Algorithms</option>
            </select>
            <select value={newRisk} onChange={(e) => setNewRisk(e.target.value as "High" | "Medium" | "Low")} className="h-10 px-3 rounded-[10px] border border-[#DDDDDD] text-[13px]">
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-[13px] text-[#666D7A] cursor-pointer">Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-[10px] bg-[#181D26] text-white text-[13px] cursor-pointer">Add Student</button>
          </div>
        </form>
      </ModalShell>
    </div>
  );
}

export default function StudentListPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[14px] text-[#666D7A]">Loading student directory...</div>}>
      <StudentDirectoryInner />
    </Suspense>
  );
}
