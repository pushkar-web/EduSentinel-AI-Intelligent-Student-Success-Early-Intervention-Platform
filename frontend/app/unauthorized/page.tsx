"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore, MOCK_USERS } from "@/store/useAuthStore";
import { UserRole } from "@/lib/auth-types";
import Avatar from "@/components/ui/Avatar";

interface UnauthorizedAccessProps {
  currentRole?: UserRole;
  requiredRole?: string;
}

export default function UnauthorizedPage({
  currentRole,
  requiredRole,
}: UnauthorizedAccessProps) {
  const router = useRouter();
  const { user, activeRole, switchRole } = useAuthStore();
  const effectiveRole = currentRole || activeRole;
  const [switchModalOpen, setSwitchModalOpen] = useState(false);

  const roleHomeMap: Record<UserRole, string> = {
    teacher: "/teacher/class-overview",
    student: "/student/progress",
    mentor: "/mentor/dashboard",
    coordinator: "/coordinator/dashboard",
    admin: "/admin/institution-kpis",
    management: "/admin/institution-kpis",
  };

  const homePath = roleHomeMap[effectiveRole] || "/login";

  const handleSelectRole = (role: UserRole, targetPath: string) => {
    switchRole(role);
    setSwitchModalOpen(false);
    router.push(targetPath);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-lg bg-white rounded-[24px] border border-[#E0E2E6] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-8 relative overflow-hidden">
        {/* Soft Decorative Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#AA2D00]" />

        <div className="w-16 h-16 rounded-[18px] bg-[#FDF2F0] border border-[#FADBD8] text-[#AA2D00] flex items-center justify-center mx-auto mb-5 shadow-xs">
          <span className="material-symbols-outlined text-[32px]">
            gpp_bad
          </span>
        </div>

        <span className="px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#FDF2F0] text-[#AA2D00] border border-[#FADBD8] mb-3 inline-block">
          403 — Access Restricted
        </span>

        <h1 className="text-[26px] font-normal tracking-[-0.02em] text-[#181D26] mb-2 leading-tight">
          Unauthorized Scope
        </h1>

        <p className="text-[13px] text-[#666D7A] mb-6 leading-relaxed max-w-md mx-auto">
          Your current signed-in role (
          <span className="font-semibold text-[#181D26] capitalize">
            {effectiveRole}
          </span>
          ) does not have access permissions for this section
          {requiredRole ? ` (requires ${requiredRole})` : ""}. In compliance
          with institutional FERPA and data-governance policies, this area is
          restricted.
        </p>

        {/* Current Identity Card */}
        <div className="p-4 rounded-[16px] bg-[#F7F8FA] border border-[#E0E2E6] text-left mb-6">
          <div className="flex items-center gap-3">
            <Avatar name={user.name} src={user.avatarUrl} size={40} />
            <div className="min-w-0">
              <p className="font-semibold text-[#181D26] text-[13px] truncate">
                {user.name}
              </p>
              <p className="text-[11px] text-[#666D7A] truncate">
                Role: <span className="capitalize font-semibold text-[#181D26]">{effectiveRole}</span> • {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={homePath}
            className="w-full sm:w-auto px-5 py-2.5 rounded-[14px] bg-[#181D26] text-white font-semibold text-[13px] hover:bg-black transition-colors shadow-xs flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">
              home
            </span>
            <span>Return to My Dashboard</span>
          </Link>

          <button
            type="button"
            onClick={() => setSwitchModalOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-[14px] bg-white hover:bg-[#F7F8FA] border border-[#E0E2E6] text-[#181D26] font-semibold text-[13px] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">
              switch_account
            </span>
            <span>Switch Identity</span>
          </button>
        </div>

        {/* Quick Role Switcher Buttons */}
        <div className="mt-8 pt-6 border-t border-[#F0F2F5]">
          <p className="text-[10px] uppercase font-bold text-[#666D7A] tracking-wider mb-2.5">
            Development Quick Role Switcher
          </p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {(
              [
                { role: "teacher", label: "Teacher", path: "/teacher/class-overview" },
                { role: "student", label: "Student", path: "/student/progress" },
                { role: "mentor", label: "Mentor", path: "/mentor/dashboard" },
                { role: "coordinator", label: "Coordinator", path: "/coordinator/dashboard" },
                { role: "admin", label: "Admin", path: "/admin/institution-kpis" },
                { role: "management", label: "Management", path: "/admin/institution-kpis" },
              ] as { role: UserRole; label: string; path: string }[]
            ).map((item) => (
              <button
                key={item.role}
                type="button"
                onClick={() => handleSelectRole(item.role, item.path)}
                className={`px-3 py-1 text-[11px] rounded-full transition-colors cursor-pointer ${
                  effectiveRole === item.role
                    ? "bg-[#181D26] text-white font-bold shadow-xs"
                    : "bg-[#F0F2F5] hover:bg-[#E0E2E6] text-[#333840] font-medium"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Switch Identity Interactive Modal */}
      {switchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-[#E0E2E6] text-left animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F5]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-[12px] bg-[#181D26] text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">switch_account</span>
                </div>
                <div>
                  <h3 className="text-[17px] font-semibold text-[#181D26]">Switch Active Persona</h3>
                  <p className="text-[12px] text-[#666D7A]">Select identity to resume platform workflow</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSwitchModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#666D7A] hover:bg-[#F0F2F5] hover:text-[#181D26]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-2 mt-4">
              {(
                [
                  { role: "mentor", user: MOCK_USERS.mentor, path: "/mentor/dashboard" },
                  { role: "teacher", user: MOCK_USERS.teacher, path: "/teacher/class-overview" },
                  { role: "student", user: MOCK_USERS.student, path: "/student/progress" },
                  { role: "coordinator", user: MOCK_USERS.coordinator, path: "/coordinator/dashboard" },
                  { role: "admin", user: MOCK_USERS.admin, path: "/admin/institution-kpis" },
                  { role: "management", user: MOCK_USERS.management, path: "/admin/institution-kpis" },
                ] as const
              ).map(({ role, user: u, path }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleSelectRole(role, path)}
                  className={`w-full p-3 rounded-[14px] flex items-center justify-between transition-all cursor-pointer border ${
                    effectiveRole === role
                      ? "bg-[#F7F8FA] border-[#181D26] shadow-xs"
                      : "bg-white border-[#E0E2E6] hover:bg-[#F8FAFC]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={u.name} src={u.avatarUrl} size={36} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-semibold text-[#181D26] truncate">{u.name}</span>
                        <span className="text-[11px] font-semibold text-[#666D7A] uppercase">({role})</span>
                      </div>
                      <span className="text-[11px] text-[#666D7A] block truncate">{u.email}</span>
                    </div>
                  </div>
                  {effectiveRole === role ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#181D26] text-white text-[10px] font-bold">
                      Active
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px] text-[#666D7A]">
                      arrow_forward
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="pt-4 mt-3 border-t border-[#F0F2F5] flex items-center justify-between text-[12px]">
              <Link
                href="/login?switch=1"
                onClick={() => setSwitchModalOpen(false)}
                className="text-[#666D7A] hover:text-[#181D26] underline font-medium"
              >
                Go to Full Login Page
              </Link>
              <button
                type="button"
                onClick={() => setSwitchModalOpen(false)}
                className="px-4 py-1.5 rounded-[10px] bg-[#F0F2F5] hover:bg-[#E0E2E6] text-[#181D26] font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
