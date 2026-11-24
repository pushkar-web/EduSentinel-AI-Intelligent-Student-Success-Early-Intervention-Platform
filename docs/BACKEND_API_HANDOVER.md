# EduSentinel AI — Backend API & Integration Handover Specification

This document is the authoritative contract between the **Next.js 16 Frontend (`frontend/`)** and the **Python FastAPI / ML Backend**. All endpoint paths, HTTP methods, TypeScript interfaces, and fallback behaviors below reflect the live implementation in:

- [`frontend/lib/api-client.ts`](../frontend/lib/api-client.ts)
- [`frontend/lib/api-types.ts`](../frontend/lib/api-types.ts)
- [`frontend/lib/auth-types.ts`](../frontend/lib/auth-types.ts)
- [`frontend/lib/hooks/useApi.ts`](../frontend/lib/hooks/useApi.ts)
- [`frontend/store/useAuthStore.ts`](../frontend/store/useAuthStore.ts)
- [`frontend/store/useDemoDataStore.ts`](../frontend/store/useDemoDataStore.ts)

---

## 1. Environment Connection & Standalone Fallback

### Frontend Environment Variable
Create `frontend/.env.local` (copied from `frontend/.env.example`):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### How `apiClient` Behaves (`frontend/lib/api-client.ts`)
1. **Standalone Mode (`NEXT_PUBLIC_API_URL` unset or empty `""`):**
   - `ApiClient.request()` short-circuits immediately and returns typed mock data without issuing `fetch()` calls (preventing `ERR_CONNECTION_REFUSED` errors in browser DevTools during standalone UI demos).
2. **Connected Backend Mode (`NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1`):**
   - Sends HTTP requests with `Content-Type: application/json`, a `2500ms` `AbortController` timeout, and `Authorization: Bearer <token>` when `apiClient.setToken(token)` has been set.
   - Non-`2xx` HTTP responses or network timeouts fall back cleanly to typed data during integration rollout unless fallback handling is removed for strict production mode.
3. **Important Wiring Note on Token Sync:**
   - Currently `useAuthStore` stores `token` in memory (`token: null` after hard reload for security; `sessionStorage` persists only non-PII `isAuthenticated`, `activeRole`, `activeAccountKey`, `hasAcknowledgedConsent`).
   - When integrating real JWT cookies or token refresh on the backend:
     - Call `apiClient.setToken(res.token)` inside login / auth hydration, OR switch `ApiClient.request()` to `credentials: "include"` if FastAPI issues `HttpOnly` JWT cookies.

### FastAPI CORS Requirements
Configure FastAPI `CORSMiddleware` to allow the Next.js origin:

```python
allow_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # Add deployed frontend origin (e.g. Vercel) in production
]
allow_credentials = True
allow_methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
allow_headers = ["Authorization", "Content-Type"]
```

---

## 2. Authentication & RBAC Contract

### Supported Roles (`UserRole`)
`"student" | "teacher" | "mentor" | "coordinator" | "admin" | "management"`

- **`management`** is strictly **read-only** (`isReadOnly = true` in `useAuthStore` and `RoleGuard`). Both frontend UI controls and backend endpoints must reject write mutations from `management`.
- **`student`** requires `hasAcknowledgedConsent === true` before opening `/student/*`; unconsented students are routed to `/consent` after login.

### Seeded Test Identities (`ACCOUNT_REGISTRY`)

| Account Key | User ID | Name | Role | Email | Demo Password |
| --- | --- | --- | --- | --- | --- |
| `ashish` | `ADM-ASHISH` | Ashish | `admin` | `ashish@gmail.com` | `ashish123` |
| `admin` | `ADM-001` | Prof. R. Deshmukh | `admin` | `r.deshmukh@admin.edusentinel.edu` | `admin123` |
| `management` | `MGT-900` | Dr. Rajesh Gupta | `management` | `dean.gupta@edusentinel.edu` | `mgmt123` |
| `coordinator` | `COORD-301` | Dr. Neha Sharma | `coordinator` | `n.sharma@edusentinel.edu` | `coord123` |
| `mentor` | `MEN-204` | Dr. Sarah Khan | `mentor` | `s.khan@mentor.edusentinel.edu` | `mentor123` |
| `teacher` | `TEA-101` | Priya Sharma | `teacher` | `p.sharma@edusentinel.edu` | `teacher123` |
| `student` | `STU1001` | Aarav Deshmukh | `student` | `aarav.d@student.edusentinel.edu` | `student123` |

---

## 3. Tier A — Endpoints Currently Wired in `frontend/lib/api-client.ts`

All paths below are appended directly to `NEXT_PUBLIC_API_URL` (so with `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1`, `/auth/login` resolves to `POST http://localhost:8000/api/v1/auth/login`).

| # | Method | Relative Path | Hook / Caller | Request Body / Query | Response Type |
| --- | --- | --- | --- | --- | --- |
| 1 | `POST` | `/auth/login` | `apiClient.login()` (`/login`) | `{ email: string; password?: string }` | `AuthResponse` |
| 2 | `GET` | `/auth/me` | `apiClient.getMe()` | Bearer token | `UserProfile` |
| 3 | `GET` | `/students` | `useStudents()` | Bearer token | `Student[]` |
| 4 | `GET` | `/students/{id}` | `useStudentDetail(id)` (`/teacher/students/[studentId]`) | Path `id` (`STU1001` or `IT26-4091`) | `StudentProfileDetail` |
| 5 | `GET` | `/alerts` | `useAlerts()` | Bearer token | `Alert[]` |
| 6 | `GET` | `/interventions` | `useInterventions()` | Bearer token | `Intervention[]` |
| 7 | `GET` | `/audit/logs` | `useAuditLogs()` (`/admin/audit-log`) | Bearer token (`admin` / `management`) | `AuditLogRecord[]` |
| 8 | `GET` | `/kpis/institutional` | `useInstitutionKPIs()` (`/admin/institution-kpis`) | Bearer token | `InstitutionKPIs` |
| 9 | `GET` | `/notifications?role={role}` | `useNotifications(role)` (`AppHeader.tsx`) | Query `role` (`UserRole`) | `AppNotification[]` |
| 10 | `GET` | `/models/registry` | `useModelRegistry()` (`/admin/model-monitor`) | Bearer token | `ModelVersion[]` |
| 11 | `GET` | `/config/risk` | `useRiskConfig()` (`/admin/configuration`) | Bearer token | `RiskConfig` |

---

## 4. Exact TypeScript Request / Response Payloads

Copied from `frontend/lib/auth-types.ts` and `frontend/lib/api-types.ts` — FastAPI Pydantic schemas must match these field names and casing (`camelCase`):

### Auth
```ts
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "mentor" | "coordinator" | "admin" | "management";
  department?: string;
  avatarUrl?: string;
  badge?: string;
  hasAcknowledgedConsent?: boolean;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
  requiresConsent: boolean;
}
```

### Students & Student 360 Diagnostics
```ts
export type RiskLevel = "Critical" | "High" | "Medium" | "Low" | "Stable";

export interface Student {
  id: string;               // e.g. "STU1001"
  studentId: string;        // Roll code, e.g. "IT26-4091"
  name: string;
  email: string;
  department: string;
  batch: string;
  currentCgpa: number;
  attendanceRate: number;
  riskLevel: RiskLevel;
  riskScore: number;        // 0..100
  keyDrivers: string[];
  lastActive: string;
  avatarUrl?: string;
}

export interface StudentProfileDetail extends Student {
  enrollmentDate: string;
  advisor: string;
  mentor: string;
  predictedRiskTrend: "increasing" | "stable" | "decreasing";
  mlConfidence: number;     // e.g. 0.91
  academicHistory: {
    semester: string;
    gpa: number;
    credits: number;
    attendance: number;
    status: string;
  }[];
  subjectBreakdown: {
    code: string;
    name: string;
    credits: number;
    internalScore: number;
    attendance: number;
    gradeForecast: string;
    risk: RiskLevel;
  }[];
  attendanceHistory: {
    month: string;
    rate: number;
    missedClasses: number;
    excused: number;
  }[];
  recentAlerts: Alert[];
  interventions: Intervention[];
  shapValues: { feature: string; impact: number; description: string }[];
}
```

### Alerts & Interventions
```ts
export interface Alert {
  id: string;
  studentId: string;
  studentName: string;
  avatarUrl?: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  alertType: "ACADEMIC_DROP" | "ATTENDANCE_CRITICAL" | "BEHAVIORAL" | "ENGAGEMENT";
  title: string;
  description: string;
  subject?: string;
  detectedAt: string;
  status: "OPEN" | "IN_REVIEW" | "RESOLVED" | "ACKNOWLEDGED";
  assignedTo?: string;
}

export interface Intervention {
  id: string;
  studentId: string;
  studentName: string;
  avatarUrl?: string;
  title: string;
  category: "ACADEMIC_TUTORING" | "COUNSELING" | "ATTENDANCE_CONTRACT" | "PEER_MENTORSHIP" | "FINANCIAL_AID";
  assignedTo: string;
  assignedToRole: string;
  status: "ACTIVE" | "PENDING_STUDENT" | "SCHEDULED" | "COMPLETED" | "CANCELLED";
  startDate: string;
  targetCompletionDate: string;
  progressPercentage: number;
  milestones: { title: string; completed: boolean; dueDate?: string }[];
  notesCount: number;
  latestNote?: string;
}
```

### Governance, KPIs, Model Monitor & Config
```ts
export interface InstitutionKPIs {
  totalStudents: number;
  atRiskCount: number;
  criticalCount: number;
  activeInterventionsCount: number;
  interventionSuccessRate: number;
  overallAttendanceRate: number;
  averageCgpa: number;
  modelAccuracyF1: number;
}

export interface ModelVersion {
  version: string;          // e.g. "v2.4", "v2.3"
  status: "PRODUCTION" | "STAGING" | "ARCHIVED";
  algorithm: string;
  trainedOn: string;
  prAuc: number;
  brier: number;
  ece: number;
  f1: number;
  confusion: { tp: number; fp: number; fn: number; tn: number };
  topShap: { feature: string; impact: number }[];
}

export interface RiskConfig {
  academicRiskThreshold: number;
  attendanceCutoff: number;
  criticalScore: number;
  highScore: number;
  mediumScore: number;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
}

export interface AuditLogRecord {
  id: string;
  timestamp: string;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  ipAddress: string;
  action: string;
  resourceType: string;
  resourceId: string;
  status: "SUCCESS" | "WARNING" | "FAILED";
  detailsJson: Record<string, unknown>;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "critical" | "warning" | "info";
  href: string;             // Must be a valid route accessible by every role in `roles`
  roles: UserRole[];
}
```

---

## 5. Tier B — Recommended Backend Write & Extended Endpoints

In standalone mode, UI mutations are handled optimistically and persisted in `sessionStorage` via `frontend/store/useDemoDataStore.ts` + page state. Wire these FastAPI endpoints next to persist writes to PostgreSQL:

| Method | Recommended Path | Screen / Trigger | Payload / Purpose |
| --- | --- | --- | --- |
| `POST` | `/auth/forgot-password` | `/forgot-password` | `{ email: string }` password reset dispatch |
| `POST` | `/users/me/consent` | `/consent` | Persist `hasAcknowledgedConsent = true` for student onboarding |
| `POST` | `/students` | `/teacher/students` | Create student record (`Add Student` modal) |
| `POST` | `/students/{id}/notes` | `/teacher/students/[studentId]` | Persist faculty observation note (`student360Notes`) |
| `PATCH` | `/alerts/{id}/status` | `/teacher/alerts` | Update `status` (`OPEN`, `IN_REVIEW`, `ACKNOWLEDGED`, `RESOLVED`) |
| `POST` | `/interventions` | `/teacher/interventions` | Create intervention plan with category, owner, milestones |
| `PATCH` | `/interventions/{id}` | `/teacher/interventions` / `/mentor/interventions` | Update intervention status, milestone completion, or check-in note |
| `PATCH` | `/students/me/goals/{id}` | `/student/support-plan` | Toggle milestone completion (`studentGoals`) |
| `POST` | `/students/me/support-requests` | `/student/support-plan` | Submit guidance request (`urgency`, topic, notes) |
| `PUT` | `/students/me/privacy` | `/student/privacy` | Update consent / sharing preferences |
| `PUT` | `/config/risk` | `/admin/configuration` | Persist `highMax`, `safeMin`, `attendanceCutoff`, `cooldownHours`, `dailyCapPerTeacher`, `dailyDigestEnabled` |
| `POST` | `/models/retrain` | `/admin/model-monitor` | Queue retraining job and return job ID |
| `POST` | `/data/batches` | `/admin/data-management` | Multipart / CSV ingestion upload & validation summary |
| `GET` / `POST` | `/users` | `/admin/users` | Manage RBAC directory users (`addedUsers`) |
| `GET` / `POST` | `/departments/{id}/reports` | `/coordinator/reports` | Fetch/create saved coordinator custom reports (`customCoordinatorReports`) |

---

## 6. Mathematical & Telemetry Invariants (Backend Consistency Rules)

Our Vitest math suite (`frontend/__tests__/data-math-consistency.test.ts`) enforces strict cross-dashboard numerical alignment. Backend aggregations should uphold these invariants so charts and KPI cards never disagree:

1. **Cohort Partitioning:** `lowRisk + modRisk + atRisk === totalStudents` (canonical baseline: `3,504 + 976 + 412 = 4,892`, i.e., `8.4%` at-risk and `91.6%` good standing).
2. **Trend Endpoints:** Month 6 of the Institution `Risk Trend` chart must equal the active KPI band shares (`lowPct%`, `modPct%`, `atRiskPct%`).
3. **Confusion Matrix Alignment (`ModelVersion` `v2.4`):**
   - `Precision = tp / (tp + fp)` (`375 / 412 = 0.910`)
   - `Recall = tp / (tp + fn)` (`363 / 412 = 0.881`)
   - `F1 = 2 * Precision * Recall / (Precision + Recall)` (`0.895`)
   - `False-Alert Rate = fp / (tp + fp)` (`37 / 412 = 9.0%`)
4. **Intervention Resolution Math:** `resolvedCases / activeInterventions === interventionSuccess` (`252 / 328 = 76.8%`), and category totals across `Intervention Success Rate by Type` sum directly to `resolvedCases / activeInterventions`.
5. **Department Rollups:** Coordinator IT Department summary (`486` total = `52` High + `434` Good Standing; `18 / 24 = 75%` faculty leading interventions) and Teacher cohort counts (`Section A` + `Section B` = `38 + 38 = 76`) must reconcile cleanly from sub-records.
