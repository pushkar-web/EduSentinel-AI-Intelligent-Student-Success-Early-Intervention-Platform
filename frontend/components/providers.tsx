"use client";

import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ToastViewport from "@/components/ui/ToastViewport";
import InactivityMonitor from "@/components/auth/InactivityMonitor";
import SmoothScroll from "@/components/ui/SmoothScroll";
import { useUIStore } from "@/store/useUIStore";

export default function Providers({ children }: { children: React.ReactNode }) {
  const locale = useUIStore((s) => s.locale);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ToastViewport />
      <InactivityMonitor />
      <SmoothScroll />
    </QueryClientProvider>
  );
}
