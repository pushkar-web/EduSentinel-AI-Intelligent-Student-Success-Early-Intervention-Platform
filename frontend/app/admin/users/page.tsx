"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { useDemoDataStore } from "@/store/useDemoDataStore";
import Avatar from "@/components/ui/Avatar";
import ModalShell from "@/components/ui/ModalShell";
import { EmptyState } from "@/components/ui/StateFeedback";
import { MOCK_STUDENTS } from "@/lib/mock-data";

type DirectoryRole = "Admin" | "Teacher" | "Mentor" | "Student" | "Coordinator" | "Management";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: DirectoryRole;
  department: string;
  status: "Active" | "Inactive" | "Pending";
  lastLogin: string;
  avatar?: string;
}

interface StudentConsentRecord {
  studentId: string;
  name: string;
  department: string;
  status: "Granted" | "Pending" | "Withdrawn";
  analyticsOptIn: boolean;
  mentorAlertsOptIn: boolean;
  lmsTelemetryOptIn: boolean;
  updatedAt: string;
}

const INITIAL_USERS: UserRecord[] = [
  { id: "USR-001", name: "Dr. Sarah Khan", email: "s.khan@mentor.edusentinel.edu", role: "Mentor", department: "IT", status: "Active", lastLogin: "Nov 22, 2026, 09:24 AM" },
  { id: "USR-002", name: "Ms. Priya Sharma", email: "p.sharma@edusentinel.edu", role: "Teacher", department: "IT", status: "Active", lastLogin: "Nov 22, 2026, 08:40 AM" },
  { id: "USR-003", name: "Prof. R. Deshmukh", email: "r.deshmukh@admin.edusentinel.edu", role: "Admin", department: "Institution", status: "Active", lastLogin: "Nov 22, 2026, 11:02 AM" },
  { id: "USR-004", name: "Dr. Neha Sharma", email: "n.sharma@edusentinel.edu", role: "Coordinator", department: "IT", status: "Active", lastLogin: "Nov 21, 2026, 05:18 PM" },
  { id: "USR-005", name: "Dr. Rajesh Gupta", email: "dean.gupta@edusentinel.edu", role: "Management", department: "Institution", status: "Active", lastLogin: "Nov 20, 2026, 02:11 PM" },
  { id: "USR-006", name: "Aarav Deshmukh", email: "aarav.d@student.edusentinel.edu", role: "Student", department: "IT", status: "Active", lastLogin: "Nov 22, 2026, 09:15 AM", avatar: MOCK_STUDENTS[0].avatarUrl },
  { id: "USR-007", name: "Priya Rao", email: "priya.rao@student.edusentinel.edu", role: "Student", department: "IT", status: "Active", lastLogin: "Nov 21, 2026, 07:30 PM", avatar: MOCK_STUDENTS[1].avatarUrl },
  { id: "USR-008", name: "Mr. Akshay Patil", email: "akshay.patil@edusentinel.edu", role: "Teacher", department: "Comp", status: "Active", lastLogin: "Nov 19, 2026, 04:11 PM" },
  { id: "USR-009", name: "Dr. Meera Kulkarni", email: "m.kulkarni@mentor.edusentinel.edu", role: "Mentor", department: "Mech", status: "Active", lastLogin: "Nov 18, 2026, 01:45 PM" },
  { id: "USR-010", name: "Rohan Kapoor", email: "rohan.k@student.edusentinel.edu", role: "Student", department: "IT", status: "Pending", lastLogin: "Never", avatar: MOCK_STUDENTS[2].avatarUrl },
  { id: "USR-011", name: "Prof. Sanjay Nair", email: "s.nair@edusentinel.edu", role: "Coordinator", department: "Comp", status: "Inactive", lastLogin: "Oct 12, 2026, 03:20 PM" },
];

const INITIAL_CONSENTS: StudentConsentRecord[] = MOCK_STUDENTS.map((s, idx) => ({
  studentId: s.id,
  name: s.name,
  department: s.department,
  status: idx === 0 ? "Pending" : idx === 2 ? "Withdrawn" : "Granted",
  analyticsOptIn: idx !== 2,
  mentorAlertsOptIn: idx !== 2 && idx !== 0,
  lmsTelemetryOptIn: idx !== 2,
  updatedAt: idx === 0 ? "Awaiting confirmation" : "Nov 14, 2026",
}));

const PAGE_SIZE = 6;

export default function UsersRoleManagementPage() {
  const { user, activeRole } = useAuthStore();
  const { addToast } = useUIStore();
  const { addedUsers, addAdminUser } = useDemoDataStore();
  const isReadOnly = user?.role === "management" || activeRole === "management";

  const [activeTab, setActiveTab] = useState<"users" | "matrix" | "consents">("users");
  const [localUsers, setUsers] = useState<UserRecord[]>(INITIAL_USERS);
  const users = useMemo(() => {
    const existingIds = new Set(localUsers.map((u) => u.id));
    const persistedOnly = addedUsers.filter((u) => !existingIds.has(u.id));
    return [...persistedOnly, ...localUsers];
  }, [addedUsers, localUsers]);
  const [consents, setConsents] = useState<StudentConsentRecord[]>(INITIAL_CONSENTS);
  const [consentSearch, setConsentSearch] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<DirectoryRole>("Teacher");
  const [newDept, setNewDept] = useState("IT");

  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q);
      const matchesRole = !roleFilter || u.role === roleFilter;
      const matchesStatus = !statusFilter || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedUsers = filteredUsers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const filteredConsents = useMemo(() => {
    const q = consentSearch.toLowerCase();
    return consents.filter(
      (c) => c.name.toLowerCase().includes(q) || c.studentId.toLowerCase().includes(q)
    );
  }, [consents, consentSearch]);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    const newUser: UserRecord = {
      id: `USR-0${users.length + 1}`,
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      department: newDept,
      status: "Active",
      lastLogin: "Never",
    };
    addAdminUser(newUser);
    setUsers((prev) => [newUser, ...prev]);
    setAddUserModalOpen(false);
    setNewName("");
    setNewEmail("");
    setPage(1);
    addToast({ title: "User Created", message: `${newUser.name} provisioned as ${newUser.role}.`, type: "success" });
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || isReadOnly) return;
    setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? editingUser : u)));
    addToast({ title: "User Updated", message: `Saved role & status for ${editingUser.name}.`, type: "success" });
    setEditingUser(null);
  };

  const toggleUserStatus = (row: UserRecord) => {
    if (isReadOnly) {
      addToast({ title: "Restricted", message: "Account status changes locked in Read-Only mode.", type: "warning" });
      return;
    }
    const nextStatus = row.status === "Active" ? "Inactive" : "Active";
    setUsers((prev) => prev.map((u) => (u.id === row.id ? { ...u, status: nextStatus } : u)));
    addToast({ title: `${row.name} marked ${nextStatus}`, type: "info" });
  };

  const updateConsent = (
    studentId: string,
    patch: Partial<Pick<StudentConsentRecord, "analyticsOptIn" | "mentorAlertsOptIn" | "lmsTelemetryOptIn" | "status">>
  ) => {
    if (isReadOnly) {
      addToast({ title: "Restricted", message: "Consent edits disabled in Management Read-Only mode.", type: "warning" });
      return;
    }
    setConsents((prev) =>
      prev.map((c) => {
        if (c.studentId !== studentId) return c;
        const next = { ...c, ...patch, updatedAt: "Just now" };
        if (!next.analyticsOptIn && !next.mentorAlertsOptIn && !next.lmsTelemetryOptIn) {
          next.status = "Withdrawn";
        } else if (!patch.status) {
          next.status = "Granted";
        }
        return next;
      })
    );
    addToast({ title: "Consent Record Saved", message: `PUT /admin/consents/${studentId} applied.`, type: "success" });
  };

  const handleExportCSV = () => {
    const csv = [
      "ID,Name,Email,Role,Department,Status,Last Login",
      ...filteredUsers.map((u) => `"${u.id}","${u.name}","${u.email}","${u.role}","${u.department}","${u.status}","${u.lastLogin}"`),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "edusentinel_users_directory.csv";
    a.click();
    URL.revokeObjectURL(url);
    addToast({ title: "Directory Exported (CSV)", type: "info" });
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
            <span className="text-[12px] text-[#666D7A]">Account &amp; consent edits are locked</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[12px] font-medium text-[#666D7A] uppercase tracking-wider mb-1">
              <span>Admin Portal</span>
              <span>/</span>
              <span className="text-[#181D26]">Identity &amp; Governance</span>
            </div>
            <h1 className="text-[34px] sm:text-[38px] font-normal tracking-[-0.025em] text-[#181D26] leading-tight">
              Users, Roles &amp; Consent Records
            </h1>
            <p className="text-[14px] text-[#666D7A] mt-1">
              Manage institutional RBAC identities, paginate user accounts, and govern student consent preferences.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setAddUserModalOpen(true)}
            disabled={isReadOnly}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[14px] bg-[#181D26] text-white text-[13px] font-medium disabled:opacity-50 cursor-pointer self-start md:self-auto"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">add</span>
            <span>Add User Account</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E0E2E6] pb-4">
          <div className="bg-[#F7F8FA] p-1.5 rounded-[16px] border border-[#E0E2E6] inline-flex flex-wrap items-center gap-1">
            {[
              { id: "users" as const, label: `Users Directory (${users.length})`, icon: "group" },
              { id: "consents" as const, label: `Consent Records (${consents.length})`, icon: "verified_user" },
              { id: "matrix" as const, label: "Roles & RBAC Matrix", icon: "security" },
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

          <Link href="/admin/audit-log" className="text-[13px] font-medium text-[#181D26] hover:underline flex items-center gap-1">
            <span>View Security Audit Log</span>
            <span aria-hidden="true" className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        {/* TAB 1: USERS DIRECTORY */}
        {activeTab === "users" && (
          <div className="bg-white rounded-[22px] border border-[#E0E2E6] overflow-hidden">
            <div className="p-4 px-6 border-b border-[#E0E2E6] flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#F7F8FA]/50">
              <div className="relative flex-1 max-w-md">
                <span aria-hidden="true" className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#666D7A]">search</span>
                <input
                  type="text"
                  aria-label="Search users"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by name, email or department..."
                  className="w-full h-10 pl-10 pr-4 text-[13px] rounded-[12px] bg-white border border-[#E0E2E6]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  aria-label="Filter by role"
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPage(1);
                  }}
                  className="h-10 px-3.5 rounded-[12px] bg-white border border-[#E0E2E6] text-[13px]"
                >
                  <option value="">All Roles</option>
                  <option value="Admin">Admin</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Mentor">Mentor</option>
                  <option value="Coordinator">Coordinator</option>
                  <option value="Management">Management</option>
                  <option value="Student">Student</option>
                </select>

                <select
                  aria-label="Filter by status"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="h-10 px-3.5 rounded-[12px] bg-white border border-[#E0E2E6] text-[13px]"
                >
                  <option value="">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                </select>

                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="h-10 inline-flex items-center gap-2 px-4 rounded-[12px] bg-white border border-[#E0E2E6] text-[13px] font-medium cursor-pointer"
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-[18px]">file_download</span>
                  <span>Export</span>
                </button>
              </div>
            </div>

            {pagedUsers.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="No matching user accounts"
                  message="Reset filters to view all institutional accounts."
                  action={{
                    label: "Clear Filters",
                    onClick: () => {
                      setSearchQuery("");
                      setRoleFilter("");
                      setStatusFilter("");
                      setPage(1);
                    },
                  }}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap min-w-[760px] text-[13px]">
                  <thead>
                    <tr className="border-b border-[#E0E2E6] text-[12px] font-medium text-[#666D7A] uppercase">
                      <th className="py-3 px-5">User</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Last Login</th>
                      <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0E2E6]">
                    {pagedUsers.map((row) => (
                      <tr key={row.id} className="hover:bg-[#F8FAFC]">
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-3">
                            <Avatar name={row.name} src={row.avatar} size={34} className="border border-[#E0E2E6]" />
                            <div>
                              <span className="font-semibold block">{row.name}</span>
                              <span className="font-mono text-[11px] text-[#666D7A]">{row.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#666D7A]">{row.email}</td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F7F8FA] border border-[#E0E2E6]">
                            {row.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">{row.department}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                              row.status === "Active"
                                ? "bg-[#F4FAF7] text-[#0A2E0E] border border-[#A8D8C4]"
                                : row.status === "Pending"
                                ? "bg-[#FFF9E5] text-[#D9A441] border border-[#F4D35E]"
                                : "bg-[#F7F8FA] text-[#666D7A] border border-[#E0E2E6]"
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#666D7A] text-[12px]">{row.lastLogin}</td>
                        <td className="py-3 px-5 text-right space-x-2">
                          <button
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => setEditingUser(row)}
                            aria-label={`Edit ${row.name}`}
                            className="px-2.5 py-1 rounded-[8px] border border-[#E0E2E6] text-[12px] disabled:opacity-40 cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => toggleUserStatus(row)}
                            className="px-2.5 py-1 rounded-[8px] border border-[#E0E2E6] text-[12px] disabled:opacity-40 cursor-pointer"
                          >
                            {row.status === "Active" ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Working Pagination Footer */}
            <div className="p-4 px-6 border-t border-[#E0E2E6] flex items-center justify-between text-[13px] text-[#666D7A]">
              <span>
                Page <strong className="text-[#181D26]">{safePage}</strong> of{" "}
                <strong className="text-[#181D26]">{totalPages}</strong> ({filteredUsers.length} matching users)
              </span>
              <div className="inline-flex items-center gap-1">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                  className="px-3 py-1 rounded-[8px] border border-[#E0E2E6] disabled:opacity-40 cursor-pointer"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => setPage(pNum)}
                      className={`w-8 h-8 rounded-[8px] font-medium cursor-pointer ${
                        safePage === pNum ? "bg-[#181D26] text-white" : "hover:bg-[#F7F8FA]"
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Next page"
                  className="px-3 py-1 rounded-[8px] border border-[#E0E2E6] disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CONSENT RECORDS */}
        {activeTab === "consents" && (
          <div className="bg-white rounded-[22px] p-6 border border-[#E0E2E6] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-[18px] font-semibold">Student Data Consent Records</h2>
                <p className="text-[13px] text-[#666D7A]">Inspect and update institutional consent preferences per student (`GET/PUT /admin/consents`)</p>
              </div>
              <input
                type="search"
                aria-label="Search student consent records"
                value={consentSearch}
                onChange={(e) => setConsentSearch(e.target.value)}
                placeholder="Filter by student or ID..."
                className="h-10 px-3.5 rounded-[12px] border border-[#E0E2E6] text-[13px] w-full sm:w-64"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px] min-w-[720px]">
                <thead>
                  <tr className="border-b border-[#E0E2E6] text-[12px] font-medium text-[#666D7A] uppercase">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">AI Risk Analytics</th>
                    <th className="py-3 px-4 text-center">Mentor Alerts</th>
                    <th className="py-3 px-4 text-center">LMS Telemetry</th>
                    <th className="py-3 px-4 text-right">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0E2E6]">
                  {filteredConsents.map((rec) => (
                    <tr key={rec.studentId} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 px-4">
                        <span className="font-semibold block">{rec.name}</span>
                        <span className="font-mono text-[11px] text-[#666D7A]">{rec.studentId} • {rec.department}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                            rec.status === "Granted"
                              ? "bg-[#F4FAF7] text-[#0A2E0E] border border-[#A8D8C4]"
                              : rec.status === "Pending"
                              ? "bg-[#FFF9E5] text-[#D9A441] border border-[#F4D35E]"
                              : "bg-[#FFF8F5] text-[#AA2D00] border border-[#FCAB79]"
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          aria-label={`${rec.name} AI analytics consent`}
                          disabled={isReadOnly}
                          checked={rec.analyticsOptIn}
                          onChange={(e) => updateConsent(rec.studentId, { analyticsOptIn: e.target.checked })}
                          className="w-4 h-4 accent-[#181D26] cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          aria-label={`${rec.name} mentor alerts consent`}
                          disabled={isReadOnly}
                          checked={rec.mentorAlertsOptIn}
                          onChange={(e) => updateConsent(rec.studentId, { mentorAlertsOptIn: e.target.checked })}
                          className="w-4 h-4 accent-[#181D26] cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          aria-label={`${rec.name} LMS telemetry consent`}
                          disabled={isReadOnly}
                          checked={rec.lmsTelemetryOptIn}
                          onChange={(e) => updateConsent(rec.studentId, { lmsTelemetryOptIn: e.target.checked })}
                          className="w-4 h-4 accent-[#181D26] cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[12px] text-[#666D7A]">{rec.updatedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: RBAC MATRIX */}
        {activeTab === "matrix" && (
          <div className="bg-white rounded-[22px] p-6 border border-[#E0E2E6] overflow-x-auto">
            <h2 className="text-[18px] font-semibold mb-4">Role-Based Access Control (RBAC) Matrix</h2>
            <table className="w-full text-left text-[13px] min-w-[700px]">
              <thead>
                <tr className="border-b border-[#E0E2E6] text-[12px] font-medium text-[#666D7A] uppercase">
                  <th className="py-3 px-4">Permission</th>
                  <th className="py-3 px-3 text-center">Student</th>
                  <th className="py-3 px-3 text-center">Teacher</th>
                  <th className="py-3 px-3 text-center">Mentor</th>
                  <th className="py-3 px-3 text-center">Coordinator</th>
                  <th className="py-3 px-3 text-center">Admin</th>
                  <th className="py-3 px-3 text-center">Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E2E6]">
                {[
                  { perm: "View AI Early Warnings & Student 360", s: false, t: true, m: true, c: true, a: true, mg: "Read-Only Reports" },
                  { perm: "Create Interventions & Log Sessions", s: false, t: true, m: true, c: false, a: true, mg: false },
                  { perm: "Department Heatmaps & Analytics", s: false, t: false, m: false, c: true, a: true, mg: "Read-Only" },
                  { perm: "ETL Imports, Thresholds & Model Deploy", s: false, t: false, m: false, c: false, a: true, mg: false },
                  { perm: "Student Consent Records & User Provisioning", s: "Self Only", t: false, m: false, c: false, a: true, mg: false },
                ].map((r) => (
                  <tr key={r.perm}>
                    <td className="py-3 px-4 font-semibold">{r.perm}</td>
                    {[r.s, r.t, r.m, r.c, r.a, r.mg].map((val, i) => (
                      <td key={i} className="py-3 px-3 text-center">
                        {val === true ? "✓" : val === false ? "—" : <span className="text-[11px] font-medium text-[#181D26]">{val}</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <ModalShell open={addUserModalOpen} title="Add New User Account" onClose={() => setAddUserModalOpen(false)}>
        <form onSubmit={handleCreateUser} className="space-y-4">
          <input required value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Full Name" className="w-full h-10 px-3 rounded-[10px] border border-[#E0E2E6] text-[13px]" />
          <input required type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Institutional Email" className="w-full h-10 px-3 rounded-[10px] border border-[#E0E2E6] text-[13px]" />
          <div className="grid grid-cols-2 gap-3">
            <select value={newRole} onChange={(e) => setNewRole(e.target.value as DirectoryRole)} className="h-10 px-3 rounded-[10px] border border-[#E0E2E6] text-[13px]">
              <option value="Teacher">Teacher</option>
              <option value="Mentor">Mentor</option>
              <option value="Coordinator">Coordinator</option>
              <option value="Admin">Admin</option>
              <option value="Management">Management</option>
              <option value="Student">Student</option>
            </select>
            <select value={newDept} onChange={(e) => setNewDept(e.target.value)} className="h-10 px-3 rounded-[10px] border border-[#E0E2E6] text-[13px]">
              <option value="IT">IT</option>
              <option value="Comp">Comp</option>
              <option value="Mech">Mech</option>
              <option value="Institution">Institution</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setAddUserModalOpen(false)} className="px-4 py-2 text-[13px] text-[#666D7A] cursor-pointer">Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-[12px] bg-[#181D26] text-white text-[13px] font-medium cursor-pointer">Save Account</button>
          </div>
        </form>
      </ModalShell>

      {/* Edit User Modal */}
      <ModalShell open={Boolean(editingUser)} title={`Edit User — ${editingUser?.name ?? ""}`} onClose={() => setEditingUser(null)}>
        {editingUser && (
          <form onSubmit={handleSaveEditUser} className="space-y-4">
            <input
              required
              value={editingUser.name}
              onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
              className="w-full h-10 px-3 rounded-[10px] border border-[#E0E2E6] text-[13px]"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={editingUser.role}
                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as DirectoryRole })}
                className="h-10 px-3 rounded-[10px] border border-[#E0E2E6] text-[13px]"
              >
                <option value="Teacher">Teacher</option>
                <option value="Mentor">Mentor</option>
                <option value="Coordinator">Coordinator</option>
                <option value="Admin">Admin</option>
                <option value="Management">Management</option>
                <option value="Student">Student</option>
              </select>
              <select
                value={editingUser.status}
                onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as UserRecord["status"] })}
                className="h-10 px-3 rounded-[10px] border border-[#E0E2E6] text-[13px]"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 text-[13px] text-[#666D7A] cursor-pointer">Cancel</button>
              <button type="submit" className="px-5 py-2 rounded-[12px] bg-[#181D26] text-white text-[13px] font-medium cursor-pointer">Save Changes</button>
            </div>
          </form>
        )}
      </ModalShell>
    </div>
  );
}
