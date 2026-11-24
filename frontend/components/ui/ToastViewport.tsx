"use client";

import React from "react";
import { useUIStore } from "@/store/useUIStore";

const TONE: Record<
  NonNullable<ReturnType<typeof useUIStore.getState>["toasts"][number]["type"]>,
  { icon: string; accent: string }
> = {
  success: { icon: "check_circle", accent: "text-[#059669]" },
  error: { icon: "error", accent: "text-[#DC2626]" },
  warning: { icon: "warning", accent: "text-[#D97706]" },
  info: { icon: "info", accent: "text-[#AA2D00]" },
};

export default function ToastViewport() {
  const toasts = useUIStore((s) => s.toasts);
  const removeToast = useUIStore((s) => s.removeToast);

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2"
    >
      {toasts.map((t) => {
        const tone = TONE[t.type ?? "info"];
        return (
          <div
            key={t.id}
            role={t.type === "error" ? "alert" : "status"}
            className="pointer-events-auto flex items-start gap-3 rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-lg"
          >
            <span
              aria-hidden="true"
              className={`material-symbols-outlined text-[20px] ${tone.accent}`}
            >
              {tone.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#181D26]">{t.title}</p>
              {t.message && (
                <p className="mt-0.5 text-xs text-[#4B5563]">{t.message}</p>
              )}
            </div>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => removeToast(t.id)}
              className="rounded p-0.5 text-[#6B7280] hover:bg-[#F3F4F6]"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
                close
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
