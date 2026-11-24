"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface PersistedGoalMilestone {
  id: string;
  title: string;
  description: string;
  category: "Mathematics" | "Operating Systems" | "Study Habits";
  mentor: string;
  dueDate: string;
  completed: boolean;
}

export interface PersistedObservationNote {
  id: string;
  author: string;
  date: string;
  text: string;
}

export interface PersistedCustomReport {
  name: string;
  cat: string;
  scope: string;
  date: string;
  by: string;
}

export interface PersistedAddedUser {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Teacher" | "Mentor" | "Student" | "Coordinator" | "Management";
  department: string;
  status: "Active" | "Inactive" | "Pending";
  lastLogin: string;
  avatar?: string;
}

export interface PersistedThresholds {
  highMax: number;
  safeMin: number;
  attendanceCutoff: number;
  cooldownHours: number;
  dailyCapPerTeacher: number;
  dailyDigestEnabled: boolean;
}

const DEFAULT_THRESHOLDS: PersistedThresholds = {
  highMax: 60,
  safeMin: 75,
  attendanceCutoff: 75,
  cooldownHours: 72,
  dailyCapPerTeacher: 8,
  dailyDigestEnabled: true,
};

const DEFAULT_STUDENT_GOALS: PersistedGoalMilestone[] = [
  { id: "G-1", title: "Complete 3 Calculus Diagnostic Problem Sets", description: "Work through chapter 4 review exercises with tutor verification.", category: "Mathematics", mentor: "Dr. Sarah Khan", dueDate: "Dec 15, 2026", completed: true },
  { id: "G-2", title: "1-on-1 Academic Coaching Check-in", description: "Review partial derivatives pacing and morning transit plan.", category: "Mathematics", mentor: "Dr. Sarah Khan", dueDate: "Dec 20, 2026", completed: true },
  { id: "G-3", title: "Finish Operating Systems Lab 5 Walkthrough", description: "Complete TA viva preparation sheet before Friday lab.", category: "Operating Systems", mentor: "Dr. Sarah Khan", dueDate: "Dec 22, 2026", completed: false },
  { id: "G-4", title: "Log 45 Minutes of Daily Focus Blocks", description: "Build steady evening study momentum without distractions.", category: "Study Habits", mentor: "Self-paced", dueDate: "Dec 25, 2026", completed: false },
];

const DEFAULT_CUSTOM_REPORTS: PersistedCustomReport[] = [
  {
    name: "Semester Academic Review – IT Dept",
    cat: "Academic",
    scope: "Entire IT Department (All 5 Divisions)",
    date: "Oct 30, 2026, 10:14 AM",
    by: "Dr. Neha Sharma",
  },
  {
    name: "Intervention Effectiveness – AY 2026–27",
    cat: "Intervention",
    scope: "TE IT - A & TE IT - B Only",
    date: "Oct 28, 2026, 04:16 PM",
    by: "Dr. Neha Sharma",
  },
  {
    name: "Subject-wise Analysis – IT Department",
    cat: "Curriculum",
    scope: "Entire IT Department (All 5 Divisions)",
    date: "Oct 25, 2026, 02:03 PM",
    by: "Dr. Neha Sharma",
  },
];

interface DemoDataState {
  thresholds: PersistedThresholds;
  saveThresholds: (next: PersistedThresholds) => void;
  studentGoals: PersistedGoalMilestone[];
  toggleStudentGoal: (id: string) => boolean;
  addStudentGoal: (goal: PersistedGoalMilestone) => void;
  mentorFollowUpDone: Record<string, boolean>;
  toggleMentorFollowUp: (id: string, defaultDone: boolean) => boolean;
  student360Notes: Record<string, PersistedObservationNote[]>;
  addStudent360Note: (studentId: string, note: PersistedObservationNote) => void;
  customCoordinatorReports: PersistedCustomReport[];
  addCustomCoordinatorReport: (report: PersistedCustomReport) => void;
  addedUsers: PersistedAddedUser[];
  addAdminUser: (u: PersistedAddedUser) => void;
  resetDemoData: () => void;
}

export const useDemoDataStore = create<DemoDataState>()(
  persist(
    (set, get) => ({
      thresholds: DEFAULT_THRESHOLDS,
      saveThresholds: (next) => set({ thresholds: next }),

      studentGoals: DEFAULT_STUDENT_GOALS,
      toggleStudentGoal: (id) => {
        let nextCompleted = false;
        set((state) => ({
          studentGoals: state.studentGoals.map((g) => {
            if (g.id !== id) return g;
            nextCompleted = !g.completed;
            return { ...g, completed: nextCompleted };
          }),
        }));
        return nextCompleted;
      },
      addStudentGoal: (goal) =>
        set((state) => ({ studentGoals: [goal, ...state.studentGoals] })),

      mentorFollowUpDone: {},
      toggleMentorFollowUp: (id, defaultDone) => {
        const current = get().mentorFollowUpDone[id] ?? defaultDone;
        const next = !current;
        set((state) => ({
          mentorFollowUpDone: { ...state.mentorFollowUpDone, [id]: next },
        }));
        return next;
      },

      student360Notes: {},
      addStudent360Note: (studentId, note) =>
        set((state) => ({
          student360Notes: {
            ...state.student360Notes,
            [studentId]: [note, ...(state.student360Notes[studentId] ?? [])],
          },
        })),

      customCoordinatorReports: DEFAULT_CUSTOM_REPORTS,
      addCustomCoordinatorReport: (report) =>
        set((state) => ({
          customCoordinatorReports: [report, ...state.customCoordinatorReports],
        })),

      addedUsers: [],
      addAdminUser: (u) =>
        set((state) => ({ addedUsers: [u, ...state.addedUsers] })),

      resetDemoData: () =>
        set({
          thresholds: DEFAULT_THRESHOLDS,
          studentGoals: DEFAULT_STUDENT_GOALS,
          mentorFollowUpDone: {},
          student360Notes: {},
          customCoordinatorReports: DEFAULT_CUSTOM_REPORTS,
          addedUsers: [],
        }),
    }),
    {
      name: "edusentinel_demo_session_data",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
