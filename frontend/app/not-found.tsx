import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#181D26] flex flex-col justify-between p-6 sm:p-12">
      {/* Brand Header */}
      <header className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-[#181D26] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-white">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
              <path d="M12 2V22M2 12H22" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.8" />
              <path d="M5 5L19 19M19 5L5 19" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
            </svg>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[19px] font-semibold text-[#181D26] tracking-tight leading-tight">
              EduSentinel AI
            </span>
            <span className="text-[11.5px] font-medium text-[#666D7A] tracking-normal">
              Student Success Intelligence
            </span>
          </div>
        </Link>
      </header>

      {/* 404 Content Card */}
      <main className="max-w-lg mx-auto my-auto text-center py-12 px-4">
        <div className="w-16 h-16 rounded-[22px] bg-white border border-[#E0E2E6] shadow-sm flex items-center justify-center mx-auto mb-6 text-[#181D26]">
          <span className="material-symbols-outlined text-[32px]">find_in_page</span>
        </div>

        <span className="inline-block px-3 py-1 rounded-full bg-[#F1F3F6] text-[#666D7A] text-[12px] font-mono font-semibold tracking-wider uppercase mb-3">
          Error 404 — Not Found
        </span>

        <h1 className="text-[32px] sm:text-[36px] font-semibold text-[#181D26] tracking-tight mb-3">
          Page not located
        </h1>

        <p className="text-[15px] text-[#41454D] leading-relaxed mb-8 max-w-md mx-auto">
          The requested interface, resource dossier, or report cannot be found or is not available in this institutional environment.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 h-12 bg-[#181D26] text-white text-[14px] font-medium rounded-[14px] flex items-center justify-center gap-2 hover:bg-[#0D1218] transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            <span>Return to Workspace</span>
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-6 h-12 bg-white text-[#181D26] text-[14px] font-medium rounded-[14px] border border-[#DDDDDD] hover:bg-[#F8FAFC] flex items-center justify-center gap-2 transition-colors"
          >
            <span>Sign In</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-[12px] text-[#666D7A]">
        © 2026 EduSentinel AI • Institutional Student Success Intelligence
      </footer>
    </div>
  );
}
