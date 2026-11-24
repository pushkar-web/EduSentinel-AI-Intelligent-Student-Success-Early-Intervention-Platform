"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { UserRole } from "@/lib/auth-types";
import { useAlerts, useInterventions, useModelRegistry, useStudents } from "@/lib/hooks/useApi";
import Avatar from "@/components/ui/Avatar";
import { translateUI } from "@/lib/i18n/messages";

interface NavSubItem {
  label: string;
  href: string;
  badge?: string | number;
  badgeType?: "coral" | "mint" | "neutral";
}

interface NavGroup {
  id: string;
  label: string;
  icon: string;
  href?: string;
  badge?: string | number;
  badgeType?: "coral" | "mint" | "neutral";
  children?: NavSubItem[];
}

const PERSONA_LIST: {
  role: UserRole;
  name: string;
  roleTitle: string;
  department?: string;
  path: string;
  avatarUrl: string;
}[] = [
  {
    role: "teacher",
    name: "Priya Sharma",
    roleTitle: "Teacher • Faculty",
    department: "Information Technology",
    path: "/teacher/class-overview",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAW2oFdvPyPj0JI4DLPgUUFOK5iwmyCwaUdzcCQsQ2lczIcrCaZIGXUR4PpgdLDsVozl4La-jzPcLC0rlLoDWUcSub6XgwV1Oamw6tUWuWm3xv0rFJ_JXcEsJ1Ctm_xvGDXY3_HxUwCeZnxHjGU37_z6relwdja-soF9BFtoDkWmDZ9BHaVH9OfVKCxTTq_oMj1wDM9uwpV1fzqtwxURArIbBl_PbDZ7noZDJSeyAE",
  },
  {
    role: "student",
    name: "Aarav Deshmukh",
    roleTitle: "Student • Undergrad",
    department: "B.Tech IT - Sem 5",
    path: "/student/progress",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD-AxWl-ImJLhaI-LORmoT7_Y1pn9iclruRfYtCaAX__Msm_PsBrXn9RcLONhMCndH7Z2kZdxPoSRN9vbNBivO9J4ZhW9e7vjcO2oyTIu29RFqJ2zXd-s-JQKcuAAApHB8rh9hAa7LvAzO3FjtCaaBY14efJbkqVCR9VBBioo_WoHJHTHrDT2fGp0aUG1M_yP6uwDpdo5HNxUK_IIZ_-hDOZXHpdxmGsELsiXIkENVhFLCmVlG0bo4l",
  },
  {
    role: "mentor",
    name: "Dr. Sarah Khan",
    roleTitle: "Mentor • Lead Advisor",
    department: "Academic Success Center",
    path: "/mentor/dashboard",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAqWWd6G6LVOkyy43TvHAlAStXtpy8DRPQrqPl2pDzG6yiYi9UfUJJ9cHg63rUbl43oBBWdNRHwzA5mgYd7lql_5xdI5sxLMOXYWfGWXD3OWWHvD6-ez8rycOWdo5qwA9MCArmKn134VuGGfAekzPIcaEXM7cU4Gcx7NvKU3DLdA_tSU3esfAK85rFwuNhhxDPDHGX-lEdRxEpwZjcaayE9K_6n2D45Tjn4KUC9VyJVpG4zBwBIykTT",
  },
  {
    role: "coordinator",
    name: "Dr. Neha Sharma",
    roleTitle: "Coordinator • IT Dept",
    department: "Dept of IT",
    path: "/coordinator/dashboard",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBvvZ7ChKvm6XgSGJ3bpM1r_D36dmLk_iu-u_5v2s-c9UARneX4kZeOngAGYH1d8g4-0Wn84Dj_k-ZAGtt-OIwSD0EgjUqHvXObrl3NMeRladTKSINKOO_ixHmE42cnEv9TA12Os_MlmBe6QMbWulhoOH3T5YYdbC8TTCNTonus9WVZB1sIr1j6qmfDIo1NSAQfUGDb-5tY-k68VNFM7YjPP-TxKEJsNm8NyHS1djE",
  },
  {
    role: "admin",
    name: "Prof. R. Deshmukh",
    roleTitle: "Admin • Governance",
    department: "Institutional IT & Governance",
    path: "/admin/institution-kpis",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC9SvD7aab0rsSDduhHXYu_p7r3JoDBa9yOo_L8ozn9YkGekAP4xx_nFArgO3efDqIpIgb7edqVjemAaTJiz8P5DUkSe435yzvAUI6STwsDCMF1w29ldiqjZ9B-Ap_zSPZ3nDXDxyAwulESfnVoUFjd8gRN4QWhyHLwoghXkXJjOFT0O8AyVlRfMC8xNOMZ_oWGhP3TE97gBs-0wQjZ2LZS8lddlpXYnTqeg1bjSc",
  },
  {
    role: "management",
    name: "Dr. Rajesh Gupta",
    roleTitle: "Executive • Leadership",
    department: "Executive Oversight (Read-Only)",
    path: "/admin/institution-kpis",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCF0XF22JsujjWfh99SZDmKQ1bHRxThCaugYe2d-FvTXI1jEuQ5TNmab7NtMXAgMLtTJNB7AAQEg_qNVs1DGrU8rxi64vL5tAOZQgLxHIwQWP09zdyPHca4wxAhH7aRUoO1OQRRBtli3IwLKINBHCH6rZ41PeL8Hn4OYDBTK3_nZXsu3bCngiUTBl-bz0jwvO26_ieibSB2HyfXBuSCCcGdRbLK4nWCGE0la2G93rk",
  },
];

const ROLE_NAV_GROUPS: Record<UserRole, NavGroup[]> = {
  teacher: [
    {
      id: "t-dashboard",
      label: "Dashboard",
      icon: "grid_view",
      href: "/teacher/class-overview",
    },
    {
      id: "t-students",
      label: "Students",
      icon: "group",
      children: [
        { label: "Class Overview", href: "/teacher/class-overview" },
        { label: "Student List", href: "/teacher/students" },
        { label: "Student 360", href: "/teacher/students/STU1001" },
      ],
    },
    {
      id: "t-interventions",
      label: "Support & Care",
      icon: "crisis_alert",
      children: [
        { label: "Alert Centre", href: "/teacher/alerts", badgeType: "coral" },
        { label: "Intervention Planner", href: "/teacher/interventions", badgeType: "mint" },
        { label: "Subject Analytics", href: "/teacher/subject-analytics" },
      ],
    },
  ],
  student: [
    {
      id: "s-dashboard",
      label: "Dashboard",
      icon: "grid_view",
      href: "/student/progress",
    },
    {
      id: "s-journey",
      label: "My Journey",
      icon: "bar_chart",
      children: [
        { label: "My Progress", href: "/student/progress" },
        { label: "My Support Plan", href: "/student/support-plan", badgeType: "mint" },
        { label: "Privacy and Consent", href: "/student/privacy" },
      ],
    },
  ],
  mentor: [
    {
      id: "m-dashboard",
      label: "Dashboard",
      icon: "grid_view",
      href: "/mentor/dashboard",
    },
    {
      id: "m-caseload",
      label: "Caseload",
      icon: "group",
      children: [
        { label: "Mentee Dashboard", href: "/mentor/dashboard", badgeType: "coral" },
        { label: "Intervention Workspace", href: "/mentor/interventions" },
      ],
    },
  ],
  admin: [
    {
      id: "a-dashboard",
      label: "Dashboard",
      icon: "grid_view",
      href: "/admin/institution-kpis",
    },
    {
      id: "a-governance",
      label: "Institutional Ops",
      icon: "account_balance",
      children: [
        { label: "Institution KPIs", href: "/admin/institution-kpis" },
        { label: "Data Management", href: "/admin/data-management" },
        { label: "Configuration", href: "/admin/configuration" },
      ],
    },
    {
      id: "a-intelligence",
      label: "Governance & ML",
      icon: "neurology",
      children: [
        { label: "Model Monitor", href: "/admin/model-monitor", badgeType: "mint" },
        { label: "Users & Roles", href: "/admin/users" },
        { label: "Audit Log", href: "/admin/audit-log" },
        { label: "Reports", href: "/admin/reports" },
      ],
    },
  ],
  management: [
    {
      id: "mg-dashboard",
      label: "Dashboard",
      icon: "grid_view",
      href: "/admin/institution-kpis",
    },
    {
      id: "mg-oversight",
      label: "Executive View",
      icon: "insights",
      children: [
        { label: "Institution KPIs", href: "/admin/institution-kpis" },
        { label: "Institutional Reports", href: "/admin/reports" },
        { label: "Audit Log", href: "/admin/audit-log" },
      ],
    },
  ],
  coordinator: [
    {
      id: "c-dashboard",
      label: "Dashboard",
      icon: "grid_view",
      href: "/coordinator/dashboard",
    },
    {
      id: "c-department",
      label: "Department",
      icon: "domain",
      children: [
        { label: "Department Dashboard", href: "/coordinator/dashboard" },
        { label: "Coordinator Reports", href: "/coordinator/reports" },
      ],
    },
  ],
};

function AppSidebarInner({ role }: { role: UserRole }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, activeRole, switchRole, logout } = useAuthStore();
  const { mobileSidebarOpen, setMobileSidebarOpen, locale } = useUIStore();
  const [isPersonaOpen, setIsPersonaOpen] = useState(false);
  const personaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (personaRef.current && !personaRef.current.contains(e.target as Node)) {
        setIsPersonaOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsPersonaOpen(false);
    };

    if (isPersonaOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPersonaOpen]);

  const groups = ROLE_NAV_GROUPS[role] || ROLE_NAV_GROUPS.teacher;

  // Live badge counts derived from the shared data layer (no hardcoded numbers).
  const { data: alerts } = useAlerts();
  const { data: interventions } = useInterventions();
  const { data: models } = useModelRegistry();
  const { data: students } = useStudents();
  const liveBadges: Record<string, string | number | undefined> = {
    "/teacher/alerts": alerts ? alerts.filter((a) => a.status === "OPEN").length : undefined,
    "/teacher/interventions": interventions
      ? interventions.filter((i) => i.status !== "COMPLETED" && i.status !== "CANCELLED").length
      : undefined,
    "/student/support-plan": interventions
      ? interventions
          .filter((i) => i.studentId === user.id)
          .reduce((n, i) => n + i.milestones.filter((m) => !m.completed).length, 0)
      : undefined,
    "/mentor/dashboard": students
      ? students.filter((st) => st.riskLevel === "Critical" || st.riskLevel === "High").length
      : undefined,
    "/admin/model-monitor": models?.find((m) => m.status === "PRODUCTION")?.version.split("-")[0].replace(/\.\d+$/, ""),
  };
  const resolveBadge = (href: string | undefined, fallback?: string | number) => {
    if (href && href in liveBadges) {
      const value = liveBadges[href];
      return value === 0 ? undefined : value;
    }
    return fallback;
  };

  // Manage expanded state for each group. By default, expand groups containing the active route
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    groups.forEach((g) => {
      initial[g.id] = true; // Keep groups open for clear discoverability like Reference 1
    });
    return initial;
  });

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const renderBadge = (badge?: string | number, type?: "coral" | "mint" | "neutral") => {
    if (badge === undefined) return null;
    let colorClasses = "bg-[#FCAB79]/25 text-[#AA2D00]"; // default coral
    if (type === "mint") {
      colorClasses = "bg-[#A8D8C4]/40 text-[#0A2E0E]";
    } else if (type === "neutral") {
      colorClasses = "bg-surface-strong text-body";
    }

    return (
      <span
        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold tabular-nums shrink-0 ${colorClasses}`}
      >
        {badge}
      </span>
    );
  };

  const content = (
    <div className="flex flex-col h-full justify-between bg-[#F7F8FA] text-[#181D26]">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand / Logo - Reference 1 Style */}
        <div className="h-20 px-6 flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-3 group">
            {/* Geometric Quadrant Brand Symbol */}
            <div className="w-10 h-10 rounded-full bg-[#181D26] text-white flex items-center justify-center shrink-0 shadow-xs relative overflow-hidden group-hover:scale-105 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
                <path d="M12 2V22M2 12H22" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.8" />
                <path d="M5 5L19 19M19 5L5 19" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
              </svg>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[15px] font-semibold text-[#181D26] tracking-tight leading-tight">
                EduSentinel AI
              </span>
              <span className="text-[11px] text-[#666D7A] tracking-tight">
                {translateUI("Student Intelligence", locale)}
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close sidebar"
            className="md:hidden p-1.5 text-[#666D7A] hover:text-[#181D26] rounded-lg cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Navigation list */}
        <nav aria-label="Primary navigation" className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {groups.map((group) => {
            const hasChildren = group.children && group.children.length > 0;
            const isGroupExpanded = expandedGroups[group.id] ?? true;

            if (!hasChildren) {
              const isDirectActive = pathname === group.href;
              return (
                <div key={group.id} className="pt-1">
                  <Link
                    href={group.href || "#"}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-[14px] text-[14px] transition-all ${
                      isDirectActive
                        ? "bg-white text-[#181D26] font-medium shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                        : "text-[#41454D] hover:text-[#181D26] hover:bg-black/[0.02]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`material-symbols-outlined text-[19px] shrink-0 ${
                          isDirectActive ? "text-[#181D26]" : "text-[#666D7A]"
                        }`}
                      >
                        {group.icon}
                      </span>
                      <span className="truncate">{translateUI(group.label, locale)}</span>
                    </div>
                    {renderBadge(resolveBadge(group.href, group.badge), group.badgeType)}
                  </Link>
                </div>
              );
            }

            return (
              <div key={group.id} className="pt-2">
                {/* Expandable Group Header */}
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between px-3.5 py-2 rounded-[12px] text-[14px] font-medium text-[#181D26] hover:bg-black/[0.02] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="material-symbols-outlined text-[19px] text-[#666D7A] shrink-0">
                      {group.icon}
                    </span>
                    <span className="truncate">{translateUI(group.label, locale)}</span>
                  </div>
                  <span
                    className={`material-symbols-outlined text-[16px] text-[#666D7A] transition-transform duration-200 ${
                      isGroupExpanded ? "rotate-180" : ""
                    }`}
                  >
                    expand_more
                  </span>
                </button>

                {/* Nested Menu Items with Subtle Tree Connector Line */}
                {isGroupExpanded && (
                  <div className="relative ml-6 pl-3 mt-1 space-y-1 border-l border-[#DDDDDD]/80">
                    {group.children?.map((subItem) => {
                      const isSubActive =
                        pathname === subItem.href ||
                        (subItem.href !== "/" &&
                          pathname.startsWith(subItem.href) &&
                          subItem.href.split("/").length > 2);

                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          onClick={() => setMobileSidebarOpen(false)}
                          className={`flex items-center justify-between px-3 py-2 rounded-[14px] text-[13.5px] transition-all ${
                            isSubActive
                              ? "bg-white text-[#181D26] font-medium shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                              : "text-[#666D7A] hover:text-[#181D26] hover:bg-black/[0.02]"
                          }`}
                        >
                          <span className="truncate">{translateUI(subItem.label, locale)}</span>
                          {renderBadge(resolveBadge(subItem.href, subItem.badge), subItem.badgeType)}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Quick Role Switcher & User Profile - Clean Editorial Style */}
      <div className="p-4 border-t border-[#EAECEF] bg-[#F7F8FA]">
        <div className="mb-3 px-1">
          <label className="text-[10px] uppercase font-semibold text-[#666D7A] tracking-wider block mb-1.5">
            {translateUI("Switch Persona", locale)}
          </label>
          <div ref={personaRef} className="relative">
            {/* Custom Dropdown Trigger Button */}
            <button
              type="button"
              onClick={() => setIsPersonaOpen((prev) => !prev)}
              aria-expanded={isPersonaOpen}
              className={`w-full h-10 px-3 flex items-center justify-between text-[12px] font-medium bg-white text-[#181D26] border rounded-[12px] cursor-pointer transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)] group ${
                isPersonaOpen
                  ? "border-[#181D26] ring-2 ring-[#181D26]/10"
                  : "border-[#E0E2E6] hover:border-[#CBD0D7] hover:bg-[#FAFAFA]"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="truncate font-semibold text-[#181D26]">
                  {user.name}
                </span>
                <span className="text-[10px] text-[#666D7A] font-normal uppercase tracking-wider shrink-0 bg-[#F0F2F5] px-1.5 py-0.5 rounded-md">
                  {user.role}
                </span>
              </div>
              <span
                className={`material-symbols-outlined text-[16px] text-[#666D7A] shrink-0 transition-transform duration-200 ${
                  isPersonaOpen ? "rotate-180 text-[#181D26]" : "group-hover:text-[#181D26]"
                }`}
              >
                unfold_more
              </span>
            </button>

            {/* Custom Floating Popover (Drops Upwards to avoid bottom clipping) */}
            {isPersonaOpen && (
              <div className="absolute bottom-[calc(100%+8px)] left-0 right-0 z-50 bg-white rounded-[18px] shadow-[0_16px_40px_rgba(0,0,0,0.14),0_2px_8px_rgba(0,0,0,0.04)] border border-[#E2E5E9] p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1.5 flex items-center justify-between border-b border-[#F0F2F5] mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#8A909D]">
                    {translateUI("Switch Active Persona", locale)}
                  </span>
                  <span className="text-[10px] font-medium text-[#1B61C9] bg-[#E8F1FC] px-1.5 py-0.5 rounded-full">
                    {translateUI("6 Roles", locale)}
                  </span>
                </div>

                <div className="space-y-1 max-h-[300px] overflow-y-auto">
                  {PERSONA_LIST.map((p) => {
                    const isSelected = activeRole === p.role;
                    return (
                      <button
                        key={p.role}
                        type="button"
                        onClick={() => {
                          switchRole(p.role);
                          setIsPersonaOpen(false);
                          router.push(p.path);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-[12px] text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#181D26] text-white shadow-xs"
                            : "text-[#181D26] hover:bg-[#F7F8FA]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar name={p.name} src={p.avatarUrl} size={28} />
                          <div className="flex flex-col min-w-0">
                            <span
                              className={`text-[12px] truncate leading-tight ${
                                isSelected ? "font-semibold text-white" : "font-medium text-[#181D26]"
                              }`}
                            >
                              {p.name}
                            </span>
                            <span
                              className={`text-[10px] truncate ${
                                isSelected ? "text-white/70" : "text-[#666D7A]"
                              }`}
                            >
                              {p.roleTitle}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="material-symbols-outlined text-[15px] text-white shrink-0 ml-1.5">
                            check
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between p-2 rounded-[14px] bg-white border border-[#EAECEF] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar name={user.name} src={user.avatarUrl} size={32} />
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-medium text-[#181D26] truncate">
                {user.name}
              </span>
              <span className="text-[11px] text-[#666D7A] truncate capitalize">
                {user.role}
              </span>
            </div>
          </div>
          <Link
            href="/login"
            onClick={logout}
            title="Log out"
            className="p-1.5 text-[#666D7A] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[264px] bg-[#F7F8FA] z-50 flex-col border-r border-[#EAECEF]">
        {content}
      </aside>

      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity"
        />
      )}

      <aside
        className={`md:hidden fixed left-0 top-0 bottom-0 w-[280px] bg-[#F7F8FA] z-50 flex-col shadow-xl transition-transform duration-200 border-r border-[#EAECEF] ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {content}
      </aside>
    </>
  );
}

export default function AppSidebar({ role }: { role: UserRole }) {
  return (
    <Suspense
      fallback={
        <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[264px] bg-[#F7F8FA] z-50 border-r border-[#EAECEF]" />
      }
    >
      <AppSidebarInner role={role} />
    </Suspense>
  );
}
