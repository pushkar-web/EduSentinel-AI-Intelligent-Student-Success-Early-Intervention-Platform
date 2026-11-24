"use client";

import { useUIStore } from "@/store/useUIStore";
import { translateUI } from "./messages";

/** Lightweight translation hook for dashboard headings, KPIs, badges, and buttons. */
export function useT() {
  const locale = useUIStore((s) => s.locale);
  return {
    locale,
    t: (key: string) => translateUI(key, locale),
  };
}
