"use client";

import React, { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useAuthStore, MOCK_USERS } from "@/store/useAuthStore";
import { UserRole } from "@/lib/auth-types";

export default function DevRouteHubPage() {
  // In production builds, this route is completely disabled and unresolvable
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const { user, activeRole, switchRole, isAuthenticated, logout } = useAuthStore();
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSwitchPersona = (role: UserRole) => {
    switchRole(role);
    setFeedback(`Active persona switched to ${MOCK_USERS[role].name} (${MOCK_USERS[role].role.toUpperCase()})`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const personas = [
    {
      title: "Teacher Portal",
      role: "Faculty & Course Instructors",
      description: "Class analytics, student risk tracking, early warning alerts, intervention planner, and subject breakdown.",
      icon: "school",
      routes: [
        { name: "Class Overview", path: "/teacher/class-overview" },
        { name: "Student Directory", path: "/teacher/students" },
        { name: "Student 360 Profile (STU1001)", path: "/teacher/students/STU1001" },
        { name: "Alert Centre (12)", path: "/teacher/alerts" },
        { name: "Intervention Planner", path: "/teacher/interventions" },
        { name: "Subject Analytics", path: "/teacher/subject-analytics" },
      ],
    },
    {
      title: "Student Portal",
      role: "Learners & Advisees",
      description: "Personal academic progress, goal milestones, support plans, and privacy data control.",
      icon: "person",
      routes: [
        { name: "My Progress", path: "/student/progress" },
        { name: "My Support Plan", path: "/student/support-plan" },
        { name: "Privacy & Consent", path: "/student/privacy" },
      ],
    },
    {
      title: "Mentor Workspace",
      role: "Academic Mentors & Counselors",
      description: "Assigned mentee caseloads, 1-on-1 intervention tracking, and progress journals with What-if simulators.",
      icon: "support_agent",
      routes: [
        { name: "Mentee Dashboard", path: "/mentor/dashboard" },
        { name: "Intervention Workspace", path: "/mentor/interventions" },
      ],
    },
    {
      title: "Coordinator Portal",
      role: "Department Chairs & Program Heads",
      description: "Cross-section performance, departmental risk heatmaps, faculty workload, and course intervention tracking.",
      icon: "hub",
      routes: [
        { name: "Department Dashboard", path: "/coordinator/dashboard" },
        { name: "Coordinator Reports", path: "/coordinator/reports" },
      ],
    },
    {
      title: "Admin & Executive",
      role: "System Administrators & Leadership",
      description: "Institutional KPIs, SIS/LMS data ingestion, risk thresholds, ML model telemetry, users, and audit logs.",
      icon: "admin_panel_settings",
      routes: [
        { name: "Institution KPIs", path: "/admin/institution-kpis" },
        { name: "Data Management", path: "/admin/data-management" },
        { name: "Configuration", path: "/admin/configuration" },
        { name: "Model Monitor", path: "/admin/model-monitor" },
        { name: "Users & Roles", path: "/admin/users" },
        { name: "Audit Log", path: "/admin/audit-log" },
        { name: "Institutional Reports", path: "/admin/reports" },
      ],
    },
    {
      title: "Authentication & Compliance",
      role: "Onboarding & Access Control",
      description: "SSO authentication, credential reset workflow, and FERPA/GDPR compliance notice.",
      icon: "lock",
      routes: [
        { name: "Login (New Mascot Redesign)", path: "/login" },
        { name: "Forgot Password", path: "/forgot-password" },
        { name: "Consent Notice", path: "/consent" },
        { name: "403 Unauthorized View", path: "/unauthorized" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#181D26]">
      {/* Dev Environment Notice Bar */}
      <div className="bg-[#181D26] text-white px-4 py-2.5 text-[12px] font-medium flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold uppercase tracking-wider text-amber-300">
            Dev Route Hub &amp; Testing Console
          </span>
          <span className="text-white/60 hidden sm:inline">•</span>
          <span className="text-white/80 hidden sm:inline">
            Unlisted internal route. Automatically disabled (404) in production builds.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/70 text-[11px]">
            Session: {isAuthenticated ? `${user.name} (${activeRole})` : "Logged Out"}
          </span>
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="text-[11px] underline text-red-300 hover:text-red-200 cursor-pointer"
            >
              Sign Out
            </button>
          ) : (
            <Link href="/login" className="text-[11px] underline text-amber-300 hover:text-white">
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Top Banner */}
      <div className="bg-white border-b border-[#E0E2E6] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-[14px] bg-[#181D26] text-white flex items-center justify-center p-2.5 shadow-sm">
              <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.75" />
                <path d="M12 2V22M2 12H22" stroke="currentColor" strokeWidth="1.75" />
                <path d="M4.93 4.93L19.07 19.07M4.93 19.07L19.07 4.93" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#181D26]">
                  EduSentinel AI — Developer Route Hub
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#0A2E0E] text-[10px] font-bold">
                  Dev Only
                </span>
              </div>
              <p className="text-[13px] text-[#666D7A] mt-0.5">
                Directory of all 23 migrated interfaces &amp; rapid persona-testing controls.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2.5 text-[13px] font-semibold text-white bg-[#181D26] hover:bg-black rounded-[14px] shadow-sm transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              <span>Open Login Page</span>
            </Link>
            <Link
              href="/"
              className="px-5 py-2.5 text-[13px] font-semibold text-[#181D26] bg-white hover:bg-[#F7F8FA] border border-[#E0E2E6] rounded-[14px] transition-colors"
            >
              Test App Entry (/)
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Developer Persona Switcher Section */}
        <div className="mb-8 p-6 bg-white rounded-[22px] border border-[#E0E2E6] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#F0F2F5]">
            <div>
              <h2 className="text-[16px] font-semibold text-[#181D26]">
                Supported Development Personas
              </h2>
              <p className="text-[12.5px] text-[#666D7A]">
                Click any persona below to immediately simulate that authenticated session and inspect role-gated interfaces:
              </p>
            </div>
            {feedback && (
              <span className="px-3 py-1 rounded-full bg-[#ECFDF5] text-[#059669] text-[12px] font-semibold border border-[#A7F3D0] animate-in fade-in duration-150">
                {feedback}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {(
              [
                { role: "teacher", label: "Priya Sharma", title: "Teacher / Faculty", path: "/teacher/class-overview" },
                { role: "student", label: "Aarav Deshmukh", title: "Student / Learner", path: "/student/progress" },
                { role: "mentor", label: "Dr. Sarah Khan", title: "Mentor / Advisor", path: "/mentor/dashboard" },
                { role: "coordinator", label: "Dr. Neha Sharma", title: "Coordinator", path: "/coordinator/dashboard" },
                { role: "admin", label: "Prof. R. Deshmukh", title: "Administrator", path: "/admin/institution-kpis" },
                { role: "management", label: "Dr. Rajesh Gupta", title: "Exec (Read-Only)", path: "/admin/institution-kpis" },
              ] as const
            ).map((p) => {
              const isActive = isAuthenticated && activeRole === p.role;
              return (
                <button
                  key={p.role}
                  type="button"
                  onClick={() => handleSwitchPersona(p.role)}
                  className={`p-3 rounded-[14px] border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? "bg-[#181D26] text-white border-[#181D26] shadow-sm"
                      : "bg-[#F7F8FA] hover:bg-white text-[#181D26] border-[#E0E2E6]"
                  }`}
                >
                  <div>
                    <span className={`text-[10px] uppercase font-bold tracking-wider block ${
                      isActive ? "text-amber-300" : "text-[#666D7A]"
                    }`}>
                      {p.role}
                    </span>
                    <span className="text-[13px] font-semibold block leading-tight mt-1 truncate">
                      {p.label}
                    </span>
                    <span className={`text-[11px] block mt-0.5 truncate ${
                      isActive ? "text-white/70" : "text-[#666D7A]"
                    }`}>
                      {p.title}
                    </span>
                  </div>
                  <div className="mt-2.5 pt-1.5 border-t border-black/10 flex items-center justify-between text-[11px]">
                    <span className={isActive ? "text-white font-medium" : "text-[#1B61C9]"}>
                      {isActive ? "Active Now" : "Switch"}
                    </span>
                    {isActive && <span className="material-symbols-outlined text-[14px]">check</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 23 Interfaces Grid */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[12px] font-semibold text-[#666D7A] uppercase tracking-wider">
              23 Migrated Stitch Interfaces
            </span>
          </div>
          <h2 className="text-[26px] sm:text-[30px] font-normal tracking-[-0.025em] text-[#181D26]">
            Application Route Directory
          </h2>
          <p className="text-[13.5px] text-[#666D7A] mt-1">
            All prototype screens are accessible below. Protected routes enforce permissions for the active persona.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {personas.map((p) => (
            <div
              key={p.title}
              className="bg-white rounded-[22px] border border-[#E0E2E6] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-[14px] bg-[#F7F8FA] border border-[#E0E2E6] text-[#181D26] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px]">
                      {p.icon}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F0F2F5] text-[#333840]">
                    {p.routes.length} screens
                  </span>
                </div>
                <h3 className="text-[18px] font-semibold text-[#181D26]">{p.title}</h3>
                <p className="text-[11px] font-semibold text-[#666D7A] uppercase tracking-wider mt-0.5">
                  {p.role}
                </p>
                <p className="text-[13px] text-[#666D7A] mt-2.5 leading-relaxed">
                  {p.description}
                </p>

                <div className="mt-5 pt-4 border-t border-[#F0F2F5] space-y-1">
                  {p.routes.map((r) => (
                    <Link
                      key={r.path}
                      href={r.path}
                      className="group flex items-center justify-between px-3 py-2 rounded-[10px] text-[13px] font-medium text-[#333840] hover:text-[#181D26] hover:bg-[#F7F8FA] transition-colors"
                    >
                      <span className="truncate">{r.name}</span>
                      <span className="material-symbols-outlined text-[16px] text-[#A0A6B1] group-hover:text-[#181D26] group-hover:translate-x-0.5 transition-all">
                        arrow_forward
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
