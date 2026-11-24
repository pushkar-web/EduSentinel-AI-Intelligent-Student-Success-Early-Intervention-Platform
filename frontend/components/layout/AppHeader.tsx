"use client";

import React, { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { useNotifications, useStudents } from "@/lib/hooks/useApi";
import Avatar from "@/components/ui/Avatar";
import { LOCALE_OPTIONS, translateUI, formatLocalizedDate } from "@/lib/i18n/messages";

interface AppHeaderProps {
  breadcrumbTitle?: string;
  category?: string;
}

function getBreadcrumbData(pathname: string, studentName?: string, activeRole?: string) {
  if (pathname.includes("/teacher/students/")) {
    const studentId = pathname.split("/").pop() || "STU1001";
    const categoryHref =
      activeRole === "mentor"
        ? "/mentor/dashboard"
        : activeRole === "coordinator"
        ? "/coordinator/dashboard"
        : "/teacher/class-overview";
    return {
      category: "Teacher",
      categoryHref,
      parentHref: activeRole === "mentor" ? "/mentor/dashboard" : "/teacher/students",
      parentLabel: activeRole === "mentor" ? "Mentee Dashboard" : "Students",
      current: `Student 360 (${studentName ?? studentId})`,
    };
  }
  if (pathname.startsWith("/teacher/class-overview")) {
    return { category: "Teacher", categoryHref: "/teacher/class-overview", current: "Class Overview" };
  }
  if (pathname.startsWith("/teacher/students")) {
    return { category: "Teacher", categoryHref: "/teacher/class-overview", current: "Student Directory" };
  }
  if (pathname.startsWith("/teacher/alerts")) {
    return { category: "Teacher", categoryHref: "/teacher/class-overview", current: "Alert Centre" };
  }
  if (pathname.startsWith("/teacher/interventions")) {
    return { category: "Teacher", categoryHref: "/teacher/class-overview", current: "Intervention Planner" };
  }
  if (pathname.startsWith("/teacher/subject-analytics")) {
    return { category: "Teacher", categoryHref: "/teacher/class-overview", current: "Subject Analytics" };
  }
  if (pathname.startsWith("/student/progress")) {
    return { category: "Student", categoryHref: "/student/progress", current: "My Progress" };
  }
  if (pathname.startsWith("/student/support-plan")) {
    return { category: "Student", categoryHref: "/student/progress", current: "My Support Plan" };
  }
  if (pathname.startsWith("/student/privacy")) {
    return { category: "Student", categoryHref: "/student/progress", current: "Privacy & Consent" };
  }
  if (pathname.startsWith("/mentor/dashboard")) {
    return { category: "Mentor", categoryHref: "/mentor/dashboard", current: "Mentee Dashboard" };
  }
  if (pathname.startsWith("/mentor/interventions")) {
    return { category: "Mentor", categoryHref: "/mentor/dashboard", current: "Intervention Workspace" };
  }
  if (pathname.startsWith("/admin/institution-kpis")) {
    return { category: "Administration", categoryHref: "/admin/institution-kpis", current: "Institution KPIs" };
  }
  if (pathname.startsWith("/admin/data-management")) {
    return { category: "Administration", categoryHref: "/admin/institution-kpis", current: "Data Management" };
  }
  if (pathname.startsWith("/admin/configuration")) {
    return { category: "Administration", categoryHref: "/admin/institution-kpis", current: "System Configuration" };
  }
  if (pathname.startsWith("/admin/model-monitor")) {
    return { category: "Administration", categoryHref: "/admin/institution-kpis", current: "Model Monitor" };
  }
  if (pathname.startsWith("/admin/users")) {
    return { category: "Administration", categoryHref: "/admin/institution-kpis", current: "Users & Roles" };
  }
  if (pathname.startsWith("/admin/audit-log")) {
    return { category: "Administration", categoryHref: "/admin/institution-kpis", current: "Audit Log" };
  }
  if (pathname.startsWith("/admin/reports")) {
    return { category: "Administration", categoryHref: "/admin/institution-kpis", current: "Institutional Reports" };
  }
  if (pathname.startsWith("/coordinator/dashboard")) {
    return { category: "Coordinator", categoryHref: "/coordinator/dashboard", current: "Department Dashboard" };
  }
  if (pathname.startsWith("/coordinator/reports")) {
    return { category: "Coordinator", categoryHref: "/coordinator/dashboard", current: "Coordinator Reports" };
  }

  return { category: "EduSentinel AI", categoryHref: "/login", current: "Dashboard" };
}

type SearchablePage = { label: string; href: string; roles: string[] };
const SEARCHABLE_PAGES: SearchablePage[] = [
  { label: "Class Overview", href: "/teacher/class-overview", roles: ["teacher", "coordinator", "admin"] },
  { label: "Student Directory", href: "/teacher/students", roles: ["teacher", "coordinator", "admin"] },
  { label: "Alert Centre", href: "/teacher/alerts", roles: ["teacher", "coordinator", "admin"] },
  { label: "Intervention Planner", href: "/teacher/interventions", roles: ["teacher", "coordinator", "admin"] },
  { label: "Subject Analytics", href: "/teacher/subject-analytics", roles: ["teacher", "coordinator", "admin"] },
  { label: "My Progress", href: "/student/progress", roles: ["student"] },
  { label: "My Support Plan", href: "/student/support-plan", roles: ["student"] },
  { label: "Privacy & Consent", href: "/student/privacy", roles: ["student"] },
  { label: "Mentee Dashboard", href: "/mentor/dashboard", roles: ["mentor", "admin"] },
  { label: "Intervention Workspace", href: "/mentor/interventions", roles: ["mentor", "admin"] },
  { label: "Department Dashboard", href: "/coordinator/dashboard", roles: ["coordinator", "admin"] },
  { label: "Coordinator Reports", href: "/coordinator/reports", roles: ["coordinator", "admin"] },
  { label: "Institution KPIs", href: "/admin/institution-kpis", roles: ["admin", "management"] },
  { label: "Data Management", href: "/admin/data-management", roles: ["admin", "management"] },
  { label: "System Configuration", href: "/admin/configuration", roles: ["admin", "management"] },
  { label: "Model Monitor", href: "/admin/model-monitor", roles: ["admin", "management"] },
  { label: "Users & Roles", href: "/admin/users", roles: ["admin", "management"] },
  { label: "Audit Log", href: "/admin/audit-log", roles: ["admin", "management"] },
  { label: "Institutional Reports", href: "/admin/reports", roles: ["admin", "management"] },
];

function AppHeaderInner({ breadcrumbTitle, category }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, activeRole, switchRole, logout, isReadOnly } = useAuthStore();
  const { toggleMobileSidebar, locale, setLocale } = useUIStore();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [tracebackOpen, setTracebackOpen] = useState(false);
  const tracebackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tracebackOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (tracebackRef.current && !tracebackRef.current.contains(e.target as Node)) {
        setTracebackOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTracebackOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [tracebackOpen]);

  const { data: students = [] } = useStudents();
  const dossierId = pathname.includes("/teacher/students/") ? pathname.split("/").pop() : undefined;
  const dossierName = students.find((st) => st.id === dossierId || st.studentId === dossierId)?.name;
  const breadcrumb = getBreadcrumbData(pathname, dossierName, activeRole);
  const currentTitle = breadcrumbTitle || breadcrumb.current;
  const currentCategory = category || breadcrumb.category;
  const portalHomeHref = breadcrumb.categoryHref;
  const fallbackBackHref = breadcrumb.parentHref || portalHomeHref;
  const isAtPortalRoot = pathname === portalHomeHref;
  const portalQuickLinks = SEARCHABLE_PAGES.filter((pg) => {
    if (!pg.roles.includes(activeRole)) return false;
    const prefix = `/${pathname.split("/")[1] || ""}`;
    return pg.href.startsWith(prefix);
  });

  const handleBackTraceback = () => {
    setTracebackOpen(false);
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackBackHref);
    }
  };

  // Role-scoped notifications: every href is a route this role may open (no 403 traps).
  const { data: notifications = [] } = useNotifications(activeRole);
  const readIds = useUIStore((st) => st.readNotificationIds);
  const markNotificationRead = useUIStore((st) => st.markNotificationRead);
  const markAllNotificationsRead = useUIStore((st) => st.markAllNotificationsRead);
  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;

  // Live quick search (students for staff roles + role-allowed pages)
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const canSearchStudents = ["teacher", "mentor", "coordinator", "admin"].includes(activeRole);
  const needle = query.trim().toLowerCase();
  const studentHits = canSearchStudents && needle
    ? students
        .filter(
          (st) =>
            st.name.toLowerCase().includes(needle) ||
            st.studentId.toLowerCase().includes(needle) ||
            st.id.toLowerCase().includes(needle)
        )
        .slice(0, 5)
    : [];
  const pageHits = needle
    ? SEARCHABLE_PAGES.filter(
        (pg) => pg.roles.includes(activeRole) && pg.label.toLowerCase().includes(needle)
      ).slice(0, 5)
    : [];
  const goTo = (href: string) => {
    setSearchOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <header className="fixed top-0 left-0 md:left-[264px] right-0 h-16 bg-white/95 backdrop-blur-md z-40 border-b border-[#EAECEF]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:rounded-[10px] focus:bg-[#181D26] focus:text-white focus:text-[12px] focus:font-semibold"
      >
        {translateUI("Skip to main content", locale)}
      </a>
      <div className="h-16 w-full px-4 sm:px-6 flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Mobile Toggle, Touchable Traceback & Breadcrumb Navigation */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <button
            onClick={toggleMobileSidebar}
            type="button"
            className="md:hidden p-2 rounded-[10px] text-[#666D7A] hover:text-[#181D26] hover:bg-[#F7F8FA] cursor-pointer shrink-0"
            aria-label="Open sidebar"
          >
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </button>

          {!isAtPortalRoot && (
            <button
              type="button"
              onClick={handleBackTraceback}
              title={`Back to previous view (${translateUI(breadcrumb.parentLabel || currentCategory, locale)})`}
              aria-label="Go back to previous page"
              className="inline-flex items-center justify-center w-8 h-8 rounded-[10px] bg-[#F7F8FA] hover:bg-[#EAECEF] active:scale-95 border border-[#E0E2E6] text-[#181D26] transition-all cursor-pointer shrink-0 touch-manipulation"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[17px]">arrow_back</span>
            </button>
          )}

          <nav aria-label="Breadcrumb" className="flex items-center gap-1 sm:gap-1.5 text-[13px] sm:text-[13.5px] text-[#666D7A] min-w-0 relative">
            <Link
              href={portalHomeHref}
              onClick={() => setTracebackOpen(false)}
              className="px-2 py-1 rounded-[8px] font-medium text-[#666D7A] hover:text-[#181D26] hover:bg-[#F7F8FA] active:bg-[#EAECEF] transition-colors cursor-pointer shrink-0 touch-manipulation"
            >
              {translateUI(currentCategory, locale)}
            </Link>

            {breadcrumb.parentHref && (
              <>
                <span className="hidden sm:inline text-[#DDDDDD] text-[14px]">/</span>
                <Link
                  href={breadcrumb.parentHref}
                  onClick={() => setTracebackOpen(false)}
                  className="hidden sm:inline px-2 py-1 rounded-[8px] hover:text-[#181D26] hover:bg-[#F7F8FA] active:bg-[#EAECEF] transition-colors cursor-pointer shrink-0 touch-manipulation"
                >
                  {translateUI(breadcrumb.parentLabel ?? "", locale)}
                </Link>
              </>
            )}

            <span className="text-[#DDDDDD] text-[14px] shrink-0">/</span>

            <div ref={tracebackRef} className="relative min-w-0">
              <button
                type="button"
                onClick={() => {
                  setTracebackOpen((prev) => !prev);
                  setNotificationsOpen(false);
                  setProfileDropdownOpen(false);
                }}
                aria-expanded={tracebackOpen}
                aria-haspopup="menu"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] font-medium text-[#181D26] hover:bg-[#F7F8FA] active:bg-[#EAECEF] transition-colors cursor-pointer max-w-full truncate touch-manipulation"
              >
                <span className="truncate">{translateUI(currentTitle, locale)}</span>
                {portalQuickLinks.length > 1 && (
                  <span aria-hidden="true" className="material-symbols-outlined text-[15px] text-[#666D7A] shrink-0">
                    {tracebackOpen ? "expand_less" : "expand_more"}
                  </span>
                )}
              </button>

              {tracebackOpen && portalQuickLinks.length > 1 && (
                <div
                  role="menu"
                  aria-label="Portal section traceback menu"
                  className="absolute left-0 top-full mt-2 w-60 bg-white rounded-[16px] shadow-xl border border-[#EAECEF] p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-2.5 py-1.5 flex items-center justify-between border-b border-[#F0F2F5] mb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#666D7A]">
                      {translateUI(currentCategory, locale)}
                    </span>
                    <button
                      type="button"
                      onClick={handleBackTraceback}
                      className="text-[11px] font-semibold text-[#1B61C9] hover:underline cursor-pointer"
                    >
                      ← Back
                    </button>
                  </div>
                  {portalQuickLinks.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        role="menuitem"
                        href={item.href}
                        onClick={() => setTracebackOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-[10px] text-[13px] transition-colors touch-manipulation ${
                          active
                            ? "bg-[#181D26] text-white font-semibold"
                            : "text-[#333840] hover:bg-[#F7F8FA] hover:text-[#181D26]"
                        }`}
                      >
                        <span className="truncate">{translateUI(item.label, locale)}</span>
                        {active && (
                          <span aria-hidden="true" className="material-symbols-outlined text-[14px]">check</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {isReadOnly && (
              <span className="hidden sm:inline-flex ml-1 px-2.5 py-0.5 rounded-[6px] text-[11px] font-semibold uppercase tracking-wider bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] shrink-0">
                {translateUI("Read-Only (Management)", locale)}
              </span>
            )}
          </nav>
        </div>

        {/* Right: Quick Search, Notifications & Profile */}
        <div className="flex items-center gap-3">
          {/* Quick search */}
          <div className="hidden lg:flex items-center relative w-64">
            <span
              aria-hidden="true"
              className="material-symbols-outlined absolute left-3 text-[#666D7A] text-[18px]"
            >
              search
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setSearchOpen(false);
                if (e.key === "Enter") {
                  const first = studentHits[0]
                    ? `/teacher/students/${studentHits[0].id}`
                    : pageHits[0]?.href;
                  if (first) goTo(first);
                }
              }}
              aria-label="Search students and pages"
              placeholder={
                canSearchStudents
                  ? translateUI("Search student or page...", locale)
                  : translateUI("Search pages...", locale)
              }
              className="w-full pl-9 pr-3 py-1.5 text-[13px] bg-[#F7F8FA] border border-[#DDDDDD] rounded-[12px] focus:outline-hidden focus:border-[#181D26] transition-all text-[#181D26] placeholder:text-[#666D7A]"
            />
            {searchOpen && needle && (
              <div
                role="listbox"
                className="absolute left-0 top-full mt-2 w-80 bg-white rounded-[16px] shadow-xl border border-[#EAECEF] p-2 z-50"
              >
                {studentHits.length === 0 && pageHits.length === 0 ? (
                  <p className="px-3 py-2 text-[12.5px] text-[#666D7A]">
                    No results for &ldquo;{query}&rdquo;
                  </p>
                ) : (
                  <>
                    {studentHits.length > 0 && (
                      <p className="px-3 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#666D7A]">
                        Students
                      </p>
                    )}
                    {studentHits.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        role="option"
                        aria-selected="false"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => goTo(`/teacher/students/${st.id}`)}
                        className="w-full text-left px-3 py-1.5 rounded-[10px] text-[13px] hover:bg-[#F7F8FA] flex items-center justify-between cursor-pointer"
                      >
                        <span className="truncate text-[#181D26]">{st.name}</span>
                        <span className="text-[11px] text-[#666D7A]">{st.studentId}</span>
                      </button>
                    ))}
                    {pageHits.length > 0 && (
                      <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#666D7A]">
                        Pages
                      </p>
                    )}
                    {pageHits.map((pg) => (
                      <button
                        key={pg.href}
                        type="button"
                        role="option"
                        aria-selected="false"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => goTo(pg.href)}
                        className="w-full text-left px-3 py-1.5 rounded-[10px] text-[13px] hover:bg-[#F7F8FA] text-[#181D26] cursor-pointer"
                      >
                        {pg.label}
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Localized Date + Multilingual UI Switcher (EN / HI / MR) */}
          <span
            className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[10px] bg-[#F7F8FA] border border-[#EAECEF] text-[11.5px] font-medium text-[#666D7A] whitespace-nowrap"
            title="Localized date format"
          >
            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
            <span>{formatLocalizedDate(new Date("2026-10-30T10:00:00Z"), locale)}</span>
          </span>

          <div
            role="group"
            aria-label="Interface language"
            className="hidden sm:inline-flex items-center rounded-[10px] bg-[#F7F8FA] border border-[#EAECEF] p-0.5"
          >
            {LOCALE_OPTIONS.map((opt) => (
              <button
                key={opt.code}
                type="button"
                onClick={() => setLocale(opt.code)}
                aria-pressed={locale === opt.code}
                title={opt.nativeName}
                className={`px-2 py-1 rounded-[8px] text-[11px] font-semibold transition-colors cursor-pointer ${
                  locale === opt.code
                    ? "bg-[#181D26] text-white shadow-xs"
                    : "text-[#666D7A] hover:text-[#181D26]"
                }`}
              >
                {opt.shortLabel}
              </button>
            ))}
          </div>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileDropdownOpen(false);
              }}
              type="button"
              className="relative p-2 rounded-full text-[#666D7A] hover:text-[#181D26] hover:bg-[#F7F8FA] transition-colors cursor-pointer"
              aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
            >
              <span className="material-symbols-outlined text-[20px]">
                notifications
              </span>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#DC2626] ring-2 ring-white" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-[20px] shadow-xl border border-[#EAECEF] p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#EAECEF]">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold text-[#181D26]">
                      {translateUI("Notifications", locale)}
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF2F2] text-[#DC2626]">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={unreadCount === 0}
                      onClick={() => markAllNotificationsRead(notifications.map((n) => n.id))}
                      className="text-[12px] text-[#1B61C9] hover:underline disabled:text-[#9AA0AB] disabled:no-underline cursor-pointer"
                    >
                      {translateUI("Mark all read", locale)}
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-[12px] text-[#666D7A] hover:text-[#181D26] cursor-pointer"
                    >
                      {translateUI("Close", locale)}
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-[13px] max-h-[360px] overflow-y-auto">
                  {notifications.length === 0 && (
                    <p className="p-3 text-[12.5px] text-[#666D7A]">You&apos;re all caught up.</p>
                  )}
                  {notifications.map((n) => (
                    <Link
                      key={n.id}
                      href={n.href}
                      onClick={() => {
                        markNotificationRead(n.id);
                        setNotificationsOpen(false);
                      }}
                      className={`block p-3 rounded-[14px] hover:bg-white border border-[#EAECEF] transition-all group hover:shadow-xs ${
                        readIds.includes(n.id) ? "bg-white opacity-70" : "bg-[#F7F8FA]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className={`font-medium text-[13px] ${n.type === "critical" ? "text-[#DC2626]" : "text-[#181D26]"}`}>
                          {n.title}
                        </p>
                        <span className="text-[11px] text-[#666D7A] whitespace-nowrap">
                          {n.time}
                        </span>
                      </div>
                      <p className="text-[#333840] text-[12.5px] mt-1 leading-snug">
                        {n.message}
                      </p>
                      <span className="text-[11px] text-[#1B61C9] group-hover:underline font-medium mt-1.5 inline-flex items-center gap-1">
                        <span>Open</span>
                        <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Persona Switcher in Top Navigation */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileDropdownOpen(!profileDropdownOpen);
                setNotificationsOpen(false);
              }}
              type="button"
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-[12px] bg-[#F7F8FA] hover:bg-white border border-[#EAECEF] transition-colors cursor-pointer"
            >
              <Avatar name={user.name} src={user.avatarUrl} size={24} />
              <span className="text-[13px] font-medium text-[#181D26] hidden sm:inline">
                {user.name.split(" ")[0]}
              </span>
              <span className="material-symbols-outlined text-[16px] text-[#666D7A]">
                unfold_more
              </span>
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-[20px] shadow-xl border border-[#EAECEF] p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-2 border-b border-[#EAECEF] mb-2">
                  <p className="text-[13px] font-semibold text-[#181D26]">{user.name}</p>
                  <p className="text-[11px] text-[#666D7A]">{user.email}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#1B61C9] mt-0.5">
                    {user.role} role active
                  </p>
                </div>

                <p className="text-[10px] uppercase font-semibold text-[#666D7A] tracking-wider px-2 mb-1.5">
                  {translateUI("Switch Persona", locale)}
                </p>
                <div className="space-y-1">
                  {(
                    [
                      { role: "teacher", label: "Priya Sharma (Teacher)", path: "/teacher/class-overview" },
                      { role: "student", label: "Aarav Deshmukh (Student)", path: "/student/progress" },
                      { role: "mentor", label: "Dr. Sarah Khan (Mentor)", path: "/mentor/dashboard" },
                      { role: "coordinator", label: "Dr. Neha Sharma (Coord)", path: "/coordinator/dashboard" },
                      { role: "admin", label: "Prof. Deshmukh (Admin)", path: "/admin/institution-kpis" },
                      { role: "management", label: "Dr. Rajesh Gupta (Exec)", path: "/admin/institution-kpis" },
                    ] as const
                  ).map((p) => (
                    <button
                      key={p.role}
                      type="button"
                      onClick={() => {
                        switchRole(p.role);
                        setProfileDropdownOpen(false);
                        router.push(p.path);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-[10px] text-[12px] flex items-center justify-between transition-colors cursor-pointer ${
                        activeRole === p.role
                          ? "bg-[#181D26] text-white font-medium"
                          : "text-[#333840] hover:bg-[#F7F8FA]"
                      }`}
                    >
                      <span className="truncate">{p.label}</span>
                      {activeRole === p.role && (
                        <span className="material-symbols-outlined text-[14px]">check</span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="border-t border-[#EAECEF] mt-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                      router.push("/login");
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-[10px] text-[12px] text-[#DC2626] hover:bg-[#FEF2F2] flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    <span>{translateUI("Sign Out", locale)}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default function AppHeader(props: AppHeaderProps) {
  return (
    <Suspense
      fallback={
        <header className="fixed top-0 left-0 md:left-[264px] right-0 h-16 bg-white border-b border-[#EAECEF] z-40" />
      }
    >
      <AppHeaderInner {...props} />
    </Suspense>
  );
}
