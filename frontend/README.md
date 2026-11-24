# EduSentinel AI — Frontend (`Next.js 16` + `React 19`)

Enterprise frontend for **EduSentinel AI — Intelligent Student Success & Early Intervention Platform**, covering all 6 institutional roles (`student`, `teacher`, `mentor`, `coordinator`, `admin`, `management`) across 27 App Router routes.

---

## Tech Stack

- **Framework:** Next.js `16.4.5` (App Router, Turbopack) + React `19.3.0` + TypeScript `5`
- **Styling & Icons:** Tailwind CSS `4` (`app/globals.css`), self-hosted `material-symbols` (`0.49.0`), `lenis` (`1.3.28`) smooth scrolling
- **Charts & Validation:** Recharts `3.10.1`, React Hook Form `7.91.0` + Zod `4.6.7`
- **State & Data:** Zustand `5.0.16` (`store/useAuthStore.ts`, `store/useDemoDataStore.ts`, `store/useUIStore.ts`), TanStack Query `5.105.3` (`lib/hooks/useApi.ts`)
- **Testing:** Vitest `3.2.7` + Testing Library (`__tests__/`), Playwright `1.65.1` (`e2e/`)

---

## Quick Start

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Standalone Mode (No Backend Required)
Run immediately without `.env.local`. When `NEXT_PUBLIC_API_URL` is unset or empty, `lib/api-client.ts` resolves cleanly from typed mock datasets with **zero network failures** and session-persistent demo edits (`store/useDemoDataStore.ts`).
```bash
npm run dev
```
Open `http://localhost:3000`.

### 3. Connect to FastAPI Backend
Create `frontend/.env.local` from `.env.example`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```
Restart `npm run dev` (or rebuild). See [`../docs/BACKEND_API_HANDOVER.md`](../docs/BACKEND_API_HANDOVER.md) for the exact endpoint paths, JWT Bearer auth format, TypeScript response schemas, CORS rules, and write-endpoint roadmap.

---

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start development server (`http://localhost:3000`) |
| `npm run build` | Compile TypeScript & build all 35 static/SSG routes |
| `npm start` | Serve production build |
| `npm run lint` | Run ESLint (`0` errors / `0` warnings expected) |
| `npm test` | Run Vitest unit & mathematical-consistency suite |
| `npm run test:e2e` | Run Playwright Chromium E2E & responsive overflow suite |

---

## Demo Test Accounts (`/login`)

| Persona | Role | Email | Password |
| --- | --- | --- | --- |
| Ashish | `admin` | `ashish@gmail.com` | `ashish123` |
| Prof. R. Deshmukh | `admin` | `r.deshmukh@admin.edusentinel.edu` | `admin123` |
| Dr. Rajesh Gupta | `management` (Read-Only) | `dean.gupta@edusentinel.edu` | `mgmt123` |
| Dr. Neha Sharma | `coordinator` | `n.sharma@edusentinel.edu` | `coord123` |
| Dr. Sarah Khan | `mentor` | `s.khan@mentor.edusentinel.edu` | `mentor123` |
| Priya Sharma | `teacher` | `p.sharma@edusentinel.edu` | `teacher123` |
| Aarav Deshmukh | `student` | `aarav.d@student.edusentinel.edu` | `student123` |
