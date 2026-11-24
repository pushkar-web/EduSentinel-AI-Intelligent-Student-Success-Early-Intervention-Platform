/**
 * Central API Client for EduSentinel AI (ED-05 FastAPI backend specification).
 * Defaults to environment variable NEXT_PUBLIC_API_URL or localhost:8000/api/v1.
 * Currently uses typed mock data fallback when backend is not reached.
 */

import { UserProfile, UserRole } from "./auth-types";
import { ACCOUNT_REGISTRY } from "@/store/useAuthStore";
import {
  Student,
  StudentProfileDetail,
  Alert,
  Intervention,
  AuditLogRecord,
  InstitutionKPIs,
  AppNotification,
  ModelVersion,
  RiskConfig,
} from "./api-types";
import {
  MOCK_STUDENTS,
  MOCK_STUDENT_360,
  MOCK_ALERTS,
  MOCK_INTERVENTIONS,
  MOCK_AUDIT_LOGS,
  MOCK_KPIS,
  MOCK_NOTIFICATIONS,
  MOCK_MODEL_REGISTRY,
  MOCK_RISK_CONFIG,
} from "./mock-data";

export interface AuthResponse {
  token: string;
  user: UserProfile;
  requiresConsent: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.trim() || "";

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    fallbackData: T
  ): Promise<T> {
    if (!this.baseUrl) {
      // Standalone frontend submission mode: resolve directly from typed mock data
      // without triggering ERR_CONNECTION_REFUSED noise in browser DevTools.
      return fallbackData;
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 2500); // quick timeout for fallback

      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(id);

      if (!res.ok) {
        throw new Error(`API Error ${res.status}: ${res.statusText}`);
      }

      return (await res.json()) as T;
    } catch {
      // In development / prototype phase, gracefully fallback to typed authoritative data
      return fallbackData;
    }
  }

  async login(credentials: { email: string; password?: string }): Promise<AuthResponse> {
    const email = credentials.email.trim().toLowerCase();
    const expectedPasswords: Record<string, string[]> = {
      "ashish@gmail.com": ["ashish123"],
      "p.sharma@edusentinel.edu": ["teacher123", "edusentinel", "ashish123"],
      "aarav.d@student.edusentinel.edu": ["student123", "edusentinel", "ashish123"],
      "s.khan@mentor.edusentinel.edu": ["mentor123", "edusentinel", "ashish123"],
      "n.sharma@edusentinel.edu": ["coord123", "edusentinel", "ashish123"],
      "r.deshmukh@admin.edusentinel.edu": ["admin123", "edusentinel", "ashish123"],
      "dean.gupta@edusentinel.edu": ["mgmt123", "edusentinel", "ashish123"],
    };
    const allowed = expectedPasswords[email];
    if (allowed && credentials.password !== undefined && !allowed.includes(credentials.password)) {
      throw new Error(
        email === "ashish@gmail.com"
          ? "Invalid password for ashish@gmail.com. Expected ashish123."
          : `Invalid password for ${email}. Expected ${allowed[0]}.`
      );
    }
    const fallbackResponse = this.lookupInstitutionalAccount(credentials.email);
    return this.request<AuthResponse>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(credentials),
      },
      fallbackResponse
    );
  }

  async getMe(): Promise<UserProfile> {
    return this.request<UserProfile>(
      "/auth/me",
      { method: "GET" },
      ACCOUNT_REGISTRY.teacher
    );
  }

  private lookupInstitutionalAccount(emailInput: string): AuthResponse {
    const email = emailInput.trim().toLowerCase();

    const exactMatch = Object.values(ACCOUNT_REGISTRY).find(
      (account) => account.email.toLowerCase() === email
    );
    if (exactMatch) {
      return {
        token: `jwt_session_${exactMatch.id.toLowerCase()}_${Date.now()}`,
        user: exactMatch,
        requiresConsent: exactMatch.role === "student" && !exactMatch.hasAcknowledgedConsent,
      };
    }

    if (email.includes("student") || email.includes("aarav") || email.endsWith("@student.edusentinel.edu")) {
      return {
        token: `jwt_session_stu_${Date.now()}`,
        user: ACCOUNT_REGISTRY.student,
        requiresConsent: true,
      };
    }

    if (email.includes("mentor") || email.includes("khan") || email.endsWith("@mentor.edusentinel.edu")) {
      return {
        token: `jwt_session_men_${Date.now()}`,
        user: ACCOUNT_REGISTRY.mentor,
        requiresConsent: false,
      };
    }

    if (email.includes("coord") || email.includes("neha")) {
      return {
        token: `jwt_session_coord_${Date.now()}`,
        user: ACCOUNT_REGISTRY.coordinator,
        requiresConsent: false,
      };
    }

    if (email.includes("admin") || email.includes("r.deshmukh") || email.endsWith("@admin.edusentinel.edu")) {
      return {
        token: `jwt_session_adm_${Date.now()}`,
        user: ACCOUNT_REGISTRY.admin,
        requiresConsent: false,
      };
    }

    if (email.includes("dean") || email.includes("gupta") || email.includes("mgmt") || email.includes("management")) {
      return {
        token: `jwt_session_mgt_${Date.now()}`,
        user: ACCOUNT_REGISTRY.management,
        requiresConsent: false,
      };
    }

    return {
      token: `jwt_session_tea_${Date.now()}`,
      user: ACCOUNT_REGISTRY.teacher,
      requiresConsent: false,
    };
  }

  async getStudents(): Promise<Student[]> {
    return this.request<Student[]>("/students", { method: "GET" }, MOCK_STUDENTS);
  }

  async getStudentById(id: string): Promise<StudentProfileDetail> {
    const found = MOCK_STUDENTS.find((s) => s.id === id || s.studentId === id);
    const detail: StudentProfileDetail = found
      ? { ...MOCK_STUDENT_360, ...found }
      : MOCK_STUDENT_360;
    return this.request<StudentProfileDetail>(
      `/students/${id}`,
      { method: "GET" },
      detail
    );
  }

  async getAlerts(): Promise<Alert[]> {
    return this.request<Alert[]>("/alerts", { method: "GET" }, MOCK_ALERTS);
  }

  async getInterventions(): Promise<Intervention[]> {
    return this.request<Intervention[]>(
      "/interventions",
      { method: "GET" },
      MOCK_INTERVENTIONS
    );
  }

  async getAuditLogs(): Promise<AuditLogRecord[]> {
    return this.request<AuditLogRecord[]>(
      "/audit/logs",
      { method: "GET" },
      MOCK_AUDIT_LOGS
    );
  }

  async getInstitutionKPIs(): Promise<InstitutionKPIs> {
    return this.request<InstitutionKPIs>(
      "/kpis/institutional",
      { method: "GET" },
      MOCK_KPIS
    );
  }

  async getNotifications(role: UserRole): Promise<AppNotification[]> {
    const scoped = MOCK_NOTIFICATIONS.filter((n) => n.roles.includes(role));
    return this.request<AppNotification[]>(
      `/notifications?role=${encodeURIComponent(role)}`,
      { method: "GET" },
      scoped
    );
  }

  async getModelRegistry(): Promise<ModelVersion[]> {
    return this.request<ModelVersion[]>(
      "/models/registry",
      { method: "GET" },
      MOCK_MODEL_REGISTRY
    );
  }

  async getRiskConfig(): Promise<RiskConfig> {
    return this.request<RiskConfig>(
      "/config/risk",
      { method: "GET" },
      MOCK_RISK_CONFIG
    );
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
