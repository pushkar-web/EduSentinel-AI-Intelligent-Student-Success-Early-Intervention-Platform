"use client";

import React from "react";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";
import { UserRole } from "@/lib/auth-types";

interface DashboardShellProps {
  children: React.ReactNode;
  role: UserRole;
  title?: string;
  category?: string;
}

export default function DashboardShell({
  children,
  role,
  title,
  category,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar role={role} />
      <AppHeader breadcrumbTitle={title} category={category} />
      <main className="md:pl-[264px] pt-16 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

