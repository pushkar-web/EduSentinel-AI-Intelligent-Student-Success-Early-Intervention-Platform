"use client";

import React, { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { UserRole } from "@/lib/auth-types";
import UnauthorizedPage from "@/app/unauthorized/page";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  sectionName: string;
}

function subscribeHydration(onStoreChange: () => void) {
  return useAuthStore.persist?.onFinishHydration?.(onStoreChange) ?? (() => {});
}

function getHydratedSnapshot() {
  return useAuthStore.persist?.hasHydrated?.() ?? true;
}

function getServerHydratedSnapshot() {
  return false;
}

export default function RoleGuard({
  children,
  allowedRoles,
  sectionName,
}: RoleGuardProps) {
  const router = useRouter();
  const { activeRole, isAuthenticated } = useAuthStore();
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    getHydratedSnapshot,
    getServerHydratedSnapshot
  );

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center bg-[#F7F8FA]">
        <p className="text-[13px] font-medium text-[#666D7A]">Restoring secure workspace...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center bg-[#F7F8FA]">
        <div className="p-8 bg-white rounded-2xl border border-[#E0E2E6] shadow-sm max-w-md">
          <span className="material-symbols-outlined text-[#181D26] text-[40px] mb-3">
            lock
          </span>
          <h2 className="text-xl font-bold text-[#181D26] mb-2">
            Authentication Required
          </h2>
          <p className="text-[13px] text-[#666D7A] mb-4">
            Redirecting to EduSentinel AI login...
          </p>
          <a
            href="/login"
            className="px-5 py-2.5 bg-[#181D26] text-white text-[13px] font-semibold rounded-xl inline-block hover:bg-[#0D1218] transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // If role is not allowed
  if (!allowedRoles.includes(activeRole)) {
    return (
      <UnauthorizedPage
        currentRole={activeRole}
        requiredRole={sectionName}
      />
    );
  }

  return <>{children}</>;
}
