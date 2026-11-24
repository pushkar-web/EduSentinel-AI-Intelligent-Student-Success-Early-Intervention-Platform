import { describe, expect, it, beforeEach } from "vitest";
import { useAuthStore, MOCK_USERS } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { apiClient } from "@/lib/api-client";
import { translateUI, formatLocalizedDate } from "@/lib/i18n/messages";

describe("Auth store and institutional credentials", () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it("sets read-only oversight flag strictly for management role", () => {
    useAuthStore.getState().login("management");
    let state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.activeRole).toBe("management");
    expect(state.isReadOnly).toBe(true);

    useAuthStore.getState().switchRole("admin");
    state = useAuthStore.getState();
    expect(state.activeRole).toBe("admin");
    expect(state.isReadOnly).toBe(false);
  });

  it("authenticates Ashish admin account with valid password and rejects wrong password", async () => {
    await expect(
      apiClient.login({ email: "ashish@gmail.com", password: "wrong-password" })
    ).rejects.toThrow("Invalid password for ashish@gmail.com");

    const response = await apiClient.login({
      email: "ashish@gmail.com",
      password: "ashish123",
    });
    expect(response.user.id).toBe("ADM-ASHISH");
    expect(response.user.role).toBe("admin");
    expect(response.user.name).toBe("Ashish");
  });

  it("marks student consent acknowledgment in user profile", () => {
    useAuthStore.getState().login("student");
    expect(useAuthStore.getState().hasAcknowledgedConsent).toBe(false);
    useAuthStore.getState().setConsentAcknowledged();
    expect(useAuthStore.getState().hasAcknowledgedConsent).toBe(true);
    expect(MOCK_USERS.student.id).toBe("STU1001");
  });
});

describe("Multilingual dictionary and localized date formatting", () => {
  it("translates core portal strings across en, hi, and mr", () => {
    expect(translateUI("Dashboard", "en")).toBe("Dashboard");
    expect(translateUI("Dashboard", "hi")).toBe("डैशबोर्ड");
    expect(translateUI("Dashboard", "mr")).toBe("डॅशबोर्ड");
    expect(translateUI("Read-Only (Management)", "hi")).toBe("केवल-पठन (प्रबंधन)");
  });

  it("updates locale state cleanly in UI store and formats dates", () => {
    useUIStore.getState().setLocale("mr");
    expect(useUIStore.getState().locale).toBe("mr");
    const sample = formatLocalizedDate(new Date("2026-10-30T10:00:00Z"), "en");
    expect(sample).toContain("2026");
  });
});
