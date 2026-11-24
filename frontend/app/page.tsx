"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { UserRole } from "@/lib/auth-types";

function getRoleRedirect(role: UserRole): string {
  switch (role) {
    case "teacher":
      return "/teacher/class-overview";
    case "student":
      return "/student/progress";
    case "mentor":
      return "/mentor/dashboard";
    case "coordinator":
      return "/coordinator/dashboard";
    case "admin":
      return "/admin/institution-kpis";
    case "management":
      return "/admin/institution-kpis";
    default:
      return "/login";
  }
}

export default function RootEntryPage() {
  const router = useRouter();
  const { isAuthenticated, activeRole, hasAcknowledgedConsent } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (!hasAcknowledgedConsent && activeRole === "student") {
      router.replace("/consent");
    } else {
      router.replace(getRoleRedirect(activeRole));
    }
  }, [isAuthenticated, activeRole, hasAcknowledgedConsent, router]);

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-3 text-[#666D7A]">
        <div className="w-10 h-10 rounded-full bg-[#181D26] text-white flex items-center justify-center animate-pulse shadow-xs">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-white">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
            <path d="M12 2V22M2 12H22" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.8" />
            <path d="M5 5L19 19M19 5L5 19" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
          </svg>
        </div>
        <p className="text-[13px] font-medium">Entering EduSentinel AI...</p>
      </div>
    </div>
  );
}
