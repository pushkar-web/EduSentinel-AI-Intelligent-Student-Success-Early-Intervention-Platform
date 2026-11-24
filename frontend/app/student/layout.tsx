"use client";

import React from "react";
import AppSidebar from "@/components/layout/AppSidebar";
import AppHeader from "@/components/layout/AppHeader";
import RoleGuard from "@/components/auth/RoleGuard";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["student", "admin"]} sectionName="Student Portal">
      <div className="min-h-screen bg-[#F7F8FA]">
        <AppSidebar role="student" />
        <AppHeader category="Student" />
        <main id="main-content" tabIndex={-1} className="md:pl-[264px] pt-16 min-h-screen overflow-x-hidden outline-none">
          <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}
