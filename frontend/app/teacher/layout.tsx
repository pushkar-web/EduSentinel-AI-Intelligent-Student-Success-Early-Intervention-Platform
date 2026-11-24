"use client";

import React from "react";
import { usePathname } from "next/navigation";
import AppSidebar from "@/components/layout/AppSidebar";
import AppHeader from "@/components/layout/AppHeader";
import RoleGuard from "@/components/auth/RoleGuard";
import { useAuthStore } from "@/store/useAuthStore";
import { UserRole } from "@/lib/auth-types";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { activeRole } = useAuthStore();

  // Student 360 dossiers are accessible to Teachers, Mentors, Coordinators, and Admins
  const isStudentDossier = pathname.includes("/teacher/students/");
  const allowedRoles: UserRole[] = isStudentDossier
    ? ["teacher", "mentor", "coordinator", "admin"]
    : ["teacher", "admin", "coordinator"];

  return (
    <RoleGuard allowedRoles={allowedRoles} sectionName="Faculty & Student Advisory Portal">
      <div className="min-h-screen bg-[#F7F8FA]">
        <AppSidebar
          role={
            activeRole === "mentor"
              ? "mentor"
              : activeRole === "coordinator"
              ? "coordinator"
              : "teacher"
          }
        />
        <AppHeader category="Faculty Portal" />
        <main id="main-content" tabIndex={-1} className="md:pl-[264px] pt-16 min-h-screen overflow-x-hidden outline-none">
          <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}
