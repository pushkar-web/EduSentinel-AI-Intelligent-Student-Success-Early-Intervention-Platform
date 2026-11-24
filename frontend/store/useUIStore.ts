"use client";

import { create } from "zustand";
import { Locale } from "@/lib/i18n/messages";

interface ToastNotification {
  id: string;
  title: string;
  message?: string;
  type?: "success" | "error" | "info" | "warning";
}

interface UIState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
  notificationsPanelOpen: boolean;
  setNotificationsPanelOpen: (open: boolean) => void;
  readNotificationIds: string[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (ids: string[]) => void;
  toasts: ToastNotification[];
  addToast: (toast: Omit<ToastNotification, "id">) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  locale: "en",
  setLocale: (locale) => set({ locale }),
  mobileSidebarOpen: false,
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
  toggleMobileSidebar: () =>
    set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
  notificationsPanelOpen: false,
  setNotificationsPanelOpen: (open) =>
    set({ notificationsPanelOpen: open }),
  readNotificationIds: [],
  markNotificationRead: (id) =>
    set((state) => ({
      readNotificationIds: state.readNotificationIds.includes(id)
        ? state.readNotificationIds
        : [...state.readNotificationIds, id],
    })),
  markAllNotificationsRead: (ids) =>
    set((state) => ({
      readNotificationIds: Array.from(new Set([...state.readNotificationIds, ...ids])),
    })),
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
