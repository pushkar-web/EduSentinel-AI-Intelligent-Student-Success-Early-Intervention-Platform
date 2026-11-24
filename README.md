# EduSentinel AI — Intelligent Student Success & Early Intervention Platform

AI-powered student success platform with academic risk prediction, explainable AI, early warnings, personalized interventions, and outcome tracking.

---

## Repository Structure

```text
EduSentinel-AI-Intelligent-Student-Success-Early-Intervention-Platform/
├── frontend/                     # Next.js 16 + React 19 + Tailwind v4 frontend workspace
│   ├── app/                      # 27 App Router pages (35 static + SSG build routes)
│   ├── components/               # Shared shell, RBAC guards, Recharts, UI primitives
│   ├── lib/                      # API client, TypeScript contracts, i18n, Zod schemas, mock data
│   ├── store/                    # Zustand auth, UI locale/toast, and session demo stores
│   ├── __tests__/                # Vitest unit & mathematical-consistency suite
│   ├── e2e/                      # Playwright Chromium E2E & responsive overflow suite
│   └── .env.example              # Backend API base URL template (NEXT_PUBLIC_API_URL)
└── docs/
    ├── BACKEND_API_HANDOVER.md   # FastAPI endpoints, JWT auth, TypeScript schemas, CORS & math rules
    ├── ROUTE_AND_ROLE_MATRIX.md  # Full 27-route RBAC matrix & deep-link conventions
    ├── EDUSENTINEL_DESIGN_SYSTEM.md
    └── FRONTEND_QA_REPORT.md
```

---

## Frontend Quick Start

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

### Connecting the FastAPI Backend

1. Copy `frontend/.env.example` to `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```
2. Implement the JWT Bearer endpoints, CORS config, and JSON schemas documented in **[`docs/BACKEND_API_HANDOVER.md`](./docs/BACKEND_API_HANDOVER.md)**.
3. Leaving `NEXT_PUBLIC_API_URL` empty runs the frontend cleanly in standalone mode using synchronized typed mock datasets with zero browser console or network errors.
