"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AccountKey, UserRole, UserProfile, AuthState } from "@/lib/auth-types";

export const MOCK_USERS: Record<UserRole, UserProfile> = {
  teacher: {
    id: "TEA-101",
    name: "Priya Sharma",
    email: "p.sharma@edusentinel.edu",
    role: "teacher",
    department: "Information Technology",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAW2oFdvPyPj0JI4DLPgUUFOK5iwmyCwaUdzcCQsQ2lczIcrCaZIGXUR4PpgdLDsVozl4La-jzPcLC0rlLoDWUcSub6XgwV1Oamw6tUWuWm3xv0rFJ_JXcEsJ1Ctm_xvGDXY3_HxUwCeZnxHjGU37_z6relwdja-soF9BFtoDkWmDZ9BHaVH9OfVKCxTTq_oMj1wDM9uwpV1fzqtwxURArIbBl_PbDZ7noZDJSeyAE",
    badge: "Course Instructor & Senior Faculty",
    hasAcknowledgedConsent: true,
  },
  student: {
    id: "STU1001",
    name: "Aarav Deshmukh",
    email: "aarav.d@student.edusentinel.edu",
    role: "student",
    department: "Information Technology - Sem 5",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD-AxWl-ImJLhaI-LORmoT7_Y1pn9iclruRfYtCaAX__Msm_PsBrXn9RcLONhMCndH7Z2kZdxPoSRN9vbNBivO9J4ZhW9e7vjcO2oyTIu29RFqJ2zXd-s-JQKcuAAApHB8rh9hAa7LvAzO3FjtCaaBY14efJbkqVCR9VBBioo_WoHJHTHrDT2fGp0aUG1M_yP6uwDpdo5HNxUK_IIZ_-hDOZXHpdxmGsELsiXIkENVhFLCmVlG0bo4l",
    badge: "Undergraduate Student",
    hasAcknowledgedConsent: false,
  },
  mentor: {
    id: "MEN-204",
    name: "Dr. Sarah Khan",
    email: "s.khan@mentor.edusentinel.edu",
    role: "mentor",
    department: "Academic Success Center",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAqWWd6G6LVOkyy43TvHAlAStXtpy8DRPQrqPl2pDzG6yiYi9UfUJJ9cHg63rUbl43oBBWdNRHwzA5mgYd7lql_5xdI5sxLMOXYWfGWXD3OWWHvD6-ez8rycOWdo5qwA9MCArmKn134VuGGfAekzPIcaEXM7cU4Gcx7NvKU3DLdA_tSU3esfAK85rFwuNhhxDPDHGX-lEdRxEpwZjcaayE9K_6n2D45Tjn4KUC9VyJVpG4zBwBIykTT",
    badge: "Lead Academic Mentor",
    hasAcknowledgedConsent: true,
  },
  coordinator: {
    id: "COORD-301",
    name: "Dr. Neha Sharma",
    email: "n.sharma@edusentinel.edu",
    role: "coordinator",
    department: "Dept of Information Technology",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBvvZ7ChKvm6XgSGJ3bpM1r_D36dmLk_iu-u_5v2s-c9UARneX4kZeOngAGYH1d8g4-0Wn84Dj_k-ZAGtt-OIwSD0EgjUqHvXObrl3NMeRladTKSINKOO_ixHmE42cnEv9TA12Os_MlmBe6QMbWulhoOH3T5YYdbC8TTCNTonus9WVZB1sIr1j6qmfDIo1NSAQfUGDb-5tY-k68VNFM7YjPP-TxKEJsNm8NyHS1djE",
    badge: "Dept Coordinator",
    hasAcknowledgedConsent: true,
  },
  admin: {
    id: "ADM-001",
    name: "Prof. R. Deshmukh",
    email: "r.deshmukh@admin.edusentinel.edu",
    role: "admin",
    department: "Institutional IT & Governance",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC9SvD7aab0rsSDduhHXYu_p7r3JoDBa9yOo_L8ozn9YkGekAP4xx_nFArgO3efDqIpIgb7edqVjemAaTJiz8P5DUkSe435yzvAUI6STwsDCMF1w29ldiqjZ9B-Ap_zSPZ3nDXDxyAwulESfnVoUFjd8gRN4QWhyHLwoghXkXJjOFT0O8AyVlRfMC8xNOMZ_oWGhP3TE97gBs-0wQjZ2LZS8lddlpXYnTqeg1bjSc",
    badge: "System Administrator",
    hasAcknowledgedConsent: true,
  },
  management: {
    id: "MGT-900",
    name: "Dr. Rajesh Gupta",
    email: "dean.gupta@edusentinel.edu",
    role: "management",
    department: "Executive Leadership & Oversight",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCF0XF22JsujjWfh99SZDmKQ1bHRxThCaugYe2d-FvTXI1jEuQ5TNmab7NtMXAgMLtTJNB7AAQEg_qNVs1DGrU8rxi64vL5tAOZQgLxHIwQWP09zdyPHca4wxAhH7aRUoO1OQRRBtli3IwLKINBHCH6rZ41PeL8Hn4OYDBTK3_nZXsu3bCngiUTBl-bz0jwvO26_ieibSB2HyfXBuSCCcGdRbLK4nWCGE0la2G93rk",
    badge: "Dean / Management (Read-Only)",
    hasAcknowledgedConsent: true,
  },
};

export const ACCOUNT_REGISTRY: Record<AccountKey, UserProfile> = {
  ...MOCK_USERS,
  ashish: {
    id: "ADM-ASHISH",
    name: "Ashish",
    email: "ashish@gmail.com",
    role: "admin",
    department: "Institutional IT & Governance",
    badge: "Team 1 Lead • System Administrator",
    hasAcknowledgedConsent: true,
  },
};

function resolveAccountKey(user: UserProfile): AccountKey {
  if (user.id === "ADM-ASHISH" || user.email.trim().toLowerCase() === "ashish@gmail.com") {
    return "ashish";
  }
  return user.role;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: MOCK_USERS.teacher,
      token: null,
      isAuthenticated: false,
      activeRole: "teacher",
      activeAccountKey: "teacher",
      isReadOnly: false,
      hasAcknowledgedConsent: false,

      setAuth: (user: UserProfile, token: string = `token_${user.role}_${Date.now()}`) => {
        const accountKey = resolveAccountKey(user);
        set({
          user,
          token,
          isAuthenticated: true,
          activeRole: user.role,
          activeAccountKey: accountKey,
          isReadOnly: user.role === "management",
          hasAcknowledgedConsent: user.hasAcknowledgedConsent ?? (user.role !== "student"),
        });
      },

      setConsentAcknowledged: () => {
        set((state) => ({
          hasAcknowledgedConsent: true,
          user: {
            ...state.user,
            hasAcknowledgedConsent: true,
          },
        }));
      },

      login: (role: UserRole = "teacher") => {
        const targetUser = MOCK_USERS[role] || MOCK_USERS.teacher;
        set({
          user: targetUser,
          token: `token_${role}_${Date.now()}`,
          isAuthenticated: true,
          activeRole: role,
          activeAccountKey: role,
          isReadOnly: role === "management",
          hasAcknowledgedConsent: role !== "student" ? true : targetUser.hasAcknowledgedConsent ?? false,
        });
      },

      logout: () => {
        set({
          token: null,
          isAuthenticated: false,
          hasAcknowledgedConsent: false,
        });
      },

      switchRole: (role: UserRole) => {
        const targetUser = MOCK_USERS[role] || MOCK_USERS.teacher;
        set({
          user: targetUser,
          token: `token_${role}_${Date.now()}`,
          isAuthenticated: true,
          activeRole: role,
          activeAccountKey: role,
          isReadOnly: role === "management",
          hasAcknowledgedConsent: role !== "student" ? true : targetUser.hasAcknowledgedConsent ?? false,
        });
      },
    }),
    {
      // Session-scoped (cleared when the tab closes). Only non-PII flags are
      // persisted — never the access token or the user's profile fields.
      name: "edusentinel_auth_session",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        activeRole: state.activeRole,
        activeAccountKey: state.activeAccountKey,
        hasAcknowledgedConsent: state.hasAcknowledgedConsent,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AuthState>;
        const role = p.activeRole ?? current.activeRole;
        const accountKey = p.activeAccountKey ?? role;
        const baseUser = ACCOUNT_REGISTRY[accountKey] ?? MOCK_USERS[role] ?? MOCK_USERS.teacher;
        const consent = p.hasAcknowledgedConsent ?? current.hasAcknowledgedConsent;
        return {
          ...current,
          isAuthenticated: p.isAuthenticated ?? false,
          activeRole: role,
          activeAccountKey: accountKey,
          isReadOnly: role === "management",
          hasAcknowledgedConsent: consent,
          user: { ...baseUser, hasAcknowledgedConsent: consent },
          token: null,
        };
      },
    }
  )
);
