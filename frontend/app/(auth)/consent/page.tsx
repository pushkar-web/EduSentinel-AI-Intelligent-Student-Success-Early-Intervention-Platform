"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { UserRole } from "@/lib/auth-types";

export default function ConsentPage() {
  const router = useRouter();
  const { activeRole, isAuthenticated, setConsentAcknowledged } = useAuthStore();
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const roleHomeMap: Record<UserRole, string> = {
    teacher: "/teacher/class-overview",
    student: "/student/progress",
    mentor: "/mentor/dashboard",
    coordinator: "/coordinator/dashboard",
    admin: "/admin/institution-kpis",
    management: "/admin/institution-kpis",
  };

  const handleContinue = () => {
    if (!agreed) return;
    setSubmitting(true);
    // Unauthenticated visitors can read the consent terms, but acknowledgement
    // only applies to a signed-in session — send them to sign in first.
    if (!isAuthenticated) {
      setTimeout(() => router.push("/login"), 300);
      return;
    }
    setConsentAcknowledged();
    setTimeout(() => {
      const target = roleHomeMap[activeRole] || "/teacher/class-overview";
      router.push(target);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#181D26] flex flex-col justify-between py-12 px-4 selection:bg-[#EAECEF]">
      {/* Top Header */}
      <div className="w-full flex flex-col items-center justify-center text-center">
        <Link href="/login" className="flex items-center gap-3 mb-2 group">
          <div className="w-11 h-11 rounded-full bg-[#181D26] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
              <path d="M12 2V22M2 12H22" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.8" />
              <path d="M5 5L19 19M19 5L5 19" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
            </svg>
          </div>
          <span className="text-[20px] font-semibold text-[#181D26] tracking-tight">
            EduSentinel AI
          </span>
        </Link>
        <p className="text-[12px] font-medium uppercase tracking-wider text-[#666D7A]">
          Data Governance &amp; Student Agency
        </p>
      </div>

      {/* Main Content Card */}
      <main className="w-full max-w-[500px] mx-auto my-auto">
        <div className="bg-white rounded-[24px] shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-[#EAECEF] p-8 sm:p-10">
          <div className="text-center mb-6">
            <h1 className="text-[26px] font-normal tracking-tight text-[#181D26] mb-1.5">
              Your data. Your support.
            </h1>
            <p className="text-[14px] text-[#666D7A] leading-relaxed">
              Understand how learning analytics and early warning signals support your academic growth.
            </p>
          </div>

          {/* Three Policy Information Cards */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3.5 p-4 rounded-[16px] border border-[#EAECEF] bg-[#F7F8FA]">
              <div className="shrink-0 w-9 h-9 rounded-full bg-white border border-[#DDDDDD] text-[#181D26] flex items-center justify-center">
                <span className="material-symbols-outlined text-[19px]">description</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-[13.5px] font-semibold text-[#181D26]">
                  What data is processed?
                </h2>
                <p className="text-[12.5px] text-[#41454D] mt-0.5 leading-snug">
                  Course attendance, assessment trends, assignment submissions, and LMS engagement telemetry.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-[16px] border border-[#EAECEF] bg-[#F7F8FA]">
              <div className="shrink-0 w-9 h-9 rounded-full bg-white border border-[#DDDDDD] text-[#181D26] flex items-center justify-center">
                <span className="material-symbols-outlined text-[19px]">groups</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-[13.5px] font-semibold text-[#181D26]">
                  Who can access your records?
                </h2>
                <p className="text-[12.5px] text-[#41454D] mt-0.5 leading-snug">
                  Only assigned faculty instructors, academic mentors, and authorised coordinators.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-[16px] border border-[#EAECEF] bg-[#F7F8FA]">
              <div className="shrink-0 w-9 h-9 rounded-full bg-white border border-[#DDDDDD] text-[#006400] flex items-center justify-center">
                <span className="material-symbols-outlined text-[19px]">shield</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-[13.5px] font-semibold text-[#181D26]">
                  No automated punitive decisions
                </h2>
                <p className="text-[12.5px] text-[#41454D] mt-0.5 leading-snug">
                  AI models provide early guidance alerts to human mentors; algorithms never execute punitive penalties.
                </p>
              </div>
            </div>
          </div>

          {/* Agreement Checkbox */}
          <div className="p-4 rounded-[16px] bg-[#F5E9D4]/30 border border-[#F5E9D4] mb-6">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded-[4px] border-[#DDDDDD] text-[#181D26] focus:ring-0 accent-[#181D26] cursor-pointer"
              />
              <span className="text-[13px] text-[#181D26] leading-relaxed">
                I have read and understand how EduSentinel AI analyzes learning telemetry to provide early intervention and academic support.
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleContinue}
              disabled={!agreed || submitting}
              className={`w-full h-11 rounded-[14px] font-medium text-[14px] flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                agreed && !submitting
                  ? "bg-[#181D26] text-white hover:bg-[#0D1218]"
                  : "bg-[#EAECEF] text-[#9297A0] cursor-not-allowed"
              }`}
            >
              {submitting ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">
                    progress_activity
                  </span>
                  <span>Entering Workspace...</span>
                </>
              ) : (
                <span>Accept &amp; Continue to Workspace</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="w-full text-center text-[13px] text-[#666D7A] hover:text-[#181D26] py-1 cursor-pointer"
            >
              Review Full Privacy Charter
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center text-[12px] text-[#666D7A]">
        <p>© 2026 EduSentinel AI. All rights reserved.</p>
      </footer>

      {/* Policy Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-[22px] max-w-lg w-full p-6 shadow-xl border border-[#EAECEF] space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAECEF]">
              <h2 className="text-[17px] font-medium text-[#181D26]">
                Institutional AI Privacy Charter
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                type="button"
                className="text-[#666D7A] hover:text-[#181D26] p-1 rounded-full"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="text-[13px] text-[#41454D] space-y-3 leading-relaxed">
              <p>
                <strong>1. Data Minimization:</strong> EduSentinel AI exclusively collects academic interactions, class check-ins, and assignment grades directly pertinent to early detection of academic friction.
              </p>
              <p>
                <strong>2. Human In The Loop:</strong> Every AI-suggested intervention must be reviewed and initiated by a verified faculty teacher or mentor.
              </p>
              <p>
                <strong>3. Auditability &amp; Rectification:</strong> Students maintain full rights under FERPA/GDPR to inspect their risk score factors and request data corrections through their student privacy portal.
              </p>
            </div>
            <div className="pt-3 border-t border-[#EAECEF]">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-full py-2.5 rounded-[12px] bg-[#181D26] text-white font-medium text-[13px] hover:bg-[#0D1218]"
              >
                Close Charter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
