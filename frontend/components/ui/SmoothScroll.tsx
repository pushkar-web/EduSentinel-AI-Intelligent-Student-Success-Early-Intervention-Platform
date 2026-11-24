"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/** Initializes global Lenis smooth scrolling while preserving native scroll in dialogs/drawers and respecting prefers-reduced-motion. */
export default function SmoothScroll() {
  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.09,
      smoothWheel: true,
      allowNestedScroll: true,
      prevent: (node) =>
        Boolean(node.closest?.('[role="dialog"], [data-lenis-prevent]')),
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  return null;
}
