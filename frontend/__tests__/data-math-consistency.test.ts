import { describe, expect, it, beforeEach } from "vitest";
import {
  MOCK_KPIS,
  MOCK_MODEL_REGISTRY,
  MOCK_INTERVENTIONS,
  MOCK_STUDENT_360,
} from "@/lib/mock-data";
import { ACCOUNT_REGISTRY, useAuthStore } from "@/store/useAuthStore";
import { useDemoDataStore } from "@/store/useDemoDataStore";
import { apiClient } from "@/lib/api-client";

describe("Institutional Mock Data & Calculation Consistency", () => {
  it("aligns MOCK_MODEL_REGISTRY confusion matrices exactly with MOCK_KPIS cohort totals and F1 formulas", () => {
    for (const model of MOCK_MODEL_REGISTRY) {
      const { tp, fp, fn, tn } = model.confusion;
      const total = tp + fp + fn + tn;
      const actualPositives = tp + fn;
      const computedF1 = Number(((2 * tp) / (2 * tp + fp + fn)).toFixed(3));

      expect(total).toBe(MOCK_KPIS.totalStudents);
      expect(actualPositives).toBe(MOCK_KPIS.atRiskCount);
      expect(model.f1).toBe(computedF1);
    }

    const production = MOCK_MODEL_REGISTRY.find((m) => m.status === "PRODUCTION");
    expect(production?.f1).toBe(MOCK_KPIS.modelAccuracyF1);
  });

  it("derives intervention progressPercentage strictly from milestone completion ratios", () => {
    for (const item of MOCK_INTERVENTIONS) {
      const done = item.milestones.filter((m) => m.completed).length;
      const expectedPct = Math.round((done / item.milestones.length) * 100);
      expect(item.progressPercentage).toBe(expectedPct);
    }
    const stu360Int = MOCK_STUDENT_360.interventions[0];
    const stuDone = stu360Int.milestones.filter((m) => m.completed).length;
    expect(stu360Int.progressPercentage).toBe(
      Math.round((stuDone / stu360Int.milestones.length) * 100)
    );
  });
});

describe("All Testing Accounts Authentication & Persistence Sync", () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it("authenticates every seeded persona account cleanly and preserves Ashish account key", async () => {
    const credentials: Array<[string, string, keyof typeof ACCOUNT_REGISTRY]> = [
      ["ashish@gmail.com", "ashish123", "ashish"],
      ["p.sharma@edusentinel.edu", "teacher123", "teacher"],
      ["aarav.d@student.edusentinel.edu", "student123", "student"],
      ["s.khan@mentor.edusentinel.edu", "mentor123", "mentor"],
      ["n.sharma@edusentinel.edu", "coord123", "coordinator"],
      ["r.deshmukh@admin.edusentinel.edu", "admin123", "admin"],
      ["dean.gupta@edusentinel.edu", "mgmt123", "management"],
    ];

    for (const [email, password, expectedKey] of credentials) {
      const res = await apiClient.login({ email, password });
      expect(res.user.id).toBe(ACCOUNT_REGISTRY[expectedKey].id);
      expect(res.user.role).toBe(ACCOUNT_REGISTRY[expectedKey].role);

      useAuthStore.getState().setAuth(res.user, res.token);
      expect(useAuthStore.getState().activeAccountKey).toBe(expectedKey);
      expect(useAuthStore.getState().user.name).toBe(ACCOUNT_REGISTRY[expectedKey].name);
    }
  });

  it("persists demo mutations across session store actions and resets cleanly", () => {
    useDemoDataStore.getState().resetDemoData();
    useDemoDataStore.getState().saveThresholds({
      highMax: 58,
      safeMin: 78,
      attendanceCutoff: 72,
      cooldownHours: 48,
      dailyCapPerTeacher: 6,
      dailyDigestEnabled: false,
    });
    expect(useDemoDataStore.getState().thresholds.highMax).toBe(58);

    const toggled = useDemoDataStore.getState().toggleStudentGoal("G-3");
    expect(toggled).toBe(true);
    expect(useDemoDataStore.getState().studentGoals.find((g) => g.id === "G-3")?.completed).toBe(true);

    useDemoDataStore.getState().addStudent360Note("STU1001", {
      id: "note-test",
      author: "Ashish",
      date: "Just now",
      text: "Verified persistent note.",
    });
    expect(useDemoDataStore.getState().student360Notes.STU1001?.[0]?.text).toBe("Verified persistent note.");

    useDemoDataStore.getState().resetDemoData();
    expect(useDemoDataStore.getState().thresholds.highMax).toBe(60);
  });
});
