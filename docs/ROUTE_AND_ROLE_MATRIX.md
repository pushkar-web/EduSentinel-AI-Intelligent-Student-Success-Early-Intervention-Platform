# EduSentinel AI — Route & Role Access Matrix

Complete inventory of all **27 App Router views** (`35` Next.js static + SSG paths) across public auth routes and 6 institutional RBAC portals.

---

## 1. Public & Onboarding Routes

| # | Route | Screen | Access | Notes |
| --- | --- | --- | --- | --- |
| 01 | `/` | Root Redirect | Public | Redirects to `/login` |
| 02 | `/login` | Sign In & Institutional SSO | Public | RHF + Zod validation, 7 test accounts, SSO picker, `EN`/`हिं`/`मर` toggle |
| 03 | `/forgot-password` | Password Recovery | Public | Email verification dispatch flow |
| 04 | `/privacy-charter` | AI Privacy Charter | Public | Linked from `/login`, `/consent`, and `/student/privacy` |
| 05 | `/consent` | AI Notice & Consent | Public / Auth | Checkbox-gated; routes new students to `/student/progress` |
| 06 | `/unauthorized` | 403 Restricted Scope | Authenticated | Safe fallback link + persona switcher |

---

## 2. Role-Protected Portal Routes (`RoleGuard.tsx`)

| # | Route | Screen | Allowed Roles | Read-Only (`management`) |
| --- | --- | --- | --- | --- |
| 07 | `/teacher/class-overview` | Class Overview | `teacher`, `coordinator`, `admin` | — |
| 08 | `/teacher/students` | Student Directory | `teacher`, `coordinator`, `admin` | — |
| 09 | `/teacher/students/[studentId]` | Student 360 Diagnostics | `teacher`, `mentor`, `coordinator`, `admin` | — |
| 10 | `/teacher/alerts` | Alert Centre | `teacher`, `coordinator`, `admin` | — |
| 11 | `/teacher/interventions` | Intervention Planner | `teacher`, `coordinator`, `admin` | — |
| 12 | `/teacher/subject-analytics` | Subject Analytics | `teacher`, `coordinator`, `admin` | — |
| 13 | `/student/progress` | My Progress (Strengths-Based) | `student`, `admin` | — |
| 14 | `/student/support-plan` | My Support Plan | `student`, `admin` | — |
| 15 | `/student/privacy` | Privacy & Consent | `student`, `admin` | — |
| 16 | `/mentor/dashboard` | Mentee Dashboard | `mentor`, `admin` | — |
| 17 | `/mentor/interventions` | Intervention Workspace | `mentor`, `admin` | — |
| 18 | `/coordinator/dashboard` | Department Dashboard | `coordinator`, `admin`, `management` | Yes |
| 19 | `/coordinator/reports` | Coordinator Reports | `coordinator`, `admin`, `management` | Yes |
| 20 | `/admin/institution-kpis` | Institution KPIs | `admin`, `management` | Yes |
| 21 | `/admin/data-management` | Data Management | `admin`, `management` | Yes (mutations locked) |
| 22 | `/admin/configuration` | Configuration & Policy | `admin`, `management` | Yes (sliders/save locked) |
| 23 | `/admin/model-monitor` | ML Model Monitor | `admin`, `management` | Yes (retrain locked) |
| 24 | `/admin/users` | Users & Roles | `admin`, `management` | Yes (Add User locked) |
| 25 | `/admin/audit-log` | Audit Log & Compliance | `admin`, `management` | Yes |
| 26 | `/admin/reports` | Institutional Reports | `admin`, `management` | Yes (schedule/create locked) |
| 27 | `/dev/route-hub` | Dev Route Index | Non-production only | Returns `404` in `next start` |

---

## 3. Navigation & Deep-Link Conventions

- **Breadcrumb Traceback (`components/layout/AppHeader.tsx`):** Every subpage provides a clickable `←` back button, clickable Category root link, and clickable current-page dropdown switcher for all routes in the active portal.
- **Role-Scoped Notifications (`useNotifications(activeRole)`):** Every notification destination URL belongs exclusively to routes permitted for the active user's role (no 403 notification traps).
- **Safe Read-Only Drilldowns:** When signed in as `management` (`Dr. Rajesh Gupta`), links on `/admin/institution-kpis` route to read-only `/admin/reports` and `/admin/audit-log` views instead of `teacher`/`coordinator` workspaces.
- **Multilingual Chrome + Dashboards:** Header/Sidebar chrome plus all 6 primary landing dashboards support live switching across English (`EN`), Hindi (`हिं`), and Marathi (`मर`) via `store/useUIStore.ts` and `lib/i18n/messages.ts`.
