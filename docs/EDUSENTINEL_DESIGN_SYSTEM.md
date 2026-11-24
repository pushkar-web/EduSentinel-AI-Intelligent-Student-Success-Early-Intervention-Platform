# EduSentinel AI — Global Design System Specification
**Document Version:** 2.0.0 (Editorial SaaS & Soft-Edged Interface System)  
**Authoritative Reference:** `DESIGN-airtable.md`, Reference 1 (Expandable Sidebar), Reference 2 (Editorial Asymmetric Layout)

---

## 1. Design Vision & Philosophy

EduSentinel AI transforms from a standard utilitarian dashboard into a **calm, editorial enterprise workflow platform**. The interface is anchored on a pure white canvas with dark-ink typography, comfortable whitespace, soft-edged geometries, and strategic brand voltage from full-bleed signature surfaces.

### Core Architectural Pillars
1. **White Canvas with Ink Typography:** The interface rests on white (`#FFFFFF`) and soft neutral surfaces (`#F8FAFC`, `#F4F5F6`). Contrast is established with dark ink (`#181D26`) and body charcoal (`#333840`), never harsh black or arbitrary colorful gradients.
2. **Expandable, Refined Sidebar (Reference 1):** A light neutral sidebar (`#F7F8FA`) with spacious vertical grouping, clean outline icons, tree-line connectors for nested routes, count badges, and an elevated white rounded selection card (`rounded-[15px]`, `bg-white`, soft elevation shadow) for the active route.
3. **Editorial Asymmetric Composition (Reference 2):** Large editorial page titles (32–40px, regular 400 weight), modular information panels with 18–24px soft rounded corners, segmented pill tab controls, large metric typography, and thoughtful data visualization.
4. **Strategic Signature Colors (Airtable System):** Brand voltage is concentrated in deliberate signature cards:
   - **Coral (`#AA2D00`):** Critical alerts, urgent interventions, high-risk flags.
   - **Forest (`#0A2E0E`):** Positive milestones, high retention achievements, model accuracy benchmarks.
   - **Cream (`#F5E9D4`):** Explanatory banners, AI transparency notes, and policy summaries.
   - **Peach (`#FCAB79`) & Mint (`#A8D8C4`):** Secondary information groupings and count badges.
   - **Yellow (`#F4D35E`) & Mustard (`#D9A441`):** Comparative analytics, attendance distributions, and chart highlights.
   - **Near-Black (`#181D26`):** Confident primary CTAs and active pill tabs.

---

## 2. Color System & Design Tokens

### 2.1 Primary & Neutrals
| Token Name | Hex Value | Semantic Role |
|---|---|---|
| `--color-primary` | `#181D26` | Primary action background, major headlines, active tab pill |
| `--color-primary-active`| `#0D1218` | Pressed state for primary action buttons |
| `--color-ink` | `#181D26` | Highest emphasis typography, headings, strong labels |
| `--color-body` | `#333840` | Running text, description paragraphs, secondary labels |
| `--color-muted` | `#666D7A` | Captions, timestamps, disabled indicators, table column headers |
| `--color-canvas` | `#FFFFFF` | Core application surface, card background, active sidebar card |
| `--color-surface-soft` | `#F8FAFC` | Secondary card surface, subtle alternating table rows |
| `--color-surface-sidebar` | `#F7F8FA` | Sidebar canvas background (Reference 1) |
| `--color-surface-strong` | `#E0E2E6` | Tertiary container surface, segmented tab track |
| `--color-surface-dark` | `#181D26` | Dark signature card surface |
| `--color-surface-dark-elevated` | `#1D1F25` | Elevated dark card surface |
| `--color-hairline` | `#DDDDDD` | 1px border on inputs, outline buttons, dividers, tables |
| `--color-border-strong` | `#9297A0` | Active input borders, focus indicators |

### 2.2 Signature Accent Surfaces
| Accent Token | Hex Value | UI Usage |
|---|---|---|
| `--color-sig-coral` | `#AA2D00` | Critical risk callouts, high-urgency notifications, warning banners |
| `--color-sig-forest` | `#0A2E0E` | Growth journey celebration, high achievement, system health |
| `--color-sig-cream` | `#F5E9D4` | Contextual explainer panels, AI reasoning banners, help guides |
| `--color-sig-peach` | `#FCAB79` | Secondary category cards, alert count badges (`bg-peach/20 text-coral`) |
| `--color-sig-mint` | `#A8D8C4` | Active status badges, completed milestones (`bg-mint/30 text-forest`) |
| `--color-sig-yellow` | `#F4D35E` | Analytical histograms, attention highlights |
| `--color-sig-mustard` | `#D9A441` | Mid-tier risk indicators, progress metrics |

### 2.3 Semantic & Risk Colors
| Status Token | Text Color | Background Pill | Border Tone | Use Case |
|---|---|---|---|---|
| **High Risk** | `#DC2626` | `#FEF2F2` | `#FECACA` | Critical early intervention warnings (Risk > 70%) |
| **Medium Risk** | `#D97706` | `#FFFBEB` | `#FDE68A` | Developing academic or attendance dips (Risk 40–70%) |
| **Low Risk / Safe** | `#059669` | `#ECFDF5` | `#A7F3D0` | Stable progress, on-track students (Risk < 40%) |
| **Interactive Link** | `#1B61C9` | Transparent | N/A | Inline hyperlinks and subtle breadcrumb navigation |
| **Information** | `#254FAD` | `#EFF6FF` | `#BFDBFE` | System info notices and data syncing state |

---

## 3. Typography Hierarchy

The platform uses **Inter Display** and **Inter** (`sans-serif`) at modest weights. Emphasis is achieved through **scale and spatial contrast**, not excessive bolding.

| Role Token | Font Size | Weight | Line Height | Letter Spacing | Element Application |
|---|---|---|---|---|---|
| **Display XL** | 48px | 500 (Medium) | 1.1 | -0.02em | Hero titles on auth pages |
| **Display LG** | 40px | 400 (Regular) | 1.2 | -0.015em | Top dashboard headers (e.g. "Managing Class Progress") |
| **Display MD** | 32px | 400 (Regular) | 1.2 | -0.01em | Major section headers, large analytical titles |
| **Title LG** | 24px | 400 (Regular) | 1.3 | -0.005em | Card headers, modal titles, drawer headings |
| **Title MD** | 20px | 500 (Medium) | 1.35 | 0 | Metric card titles, sub-section headings |
| **Title SM** | 18px | 500 (Medium) | 1.4 | 0 | Subsection titles, table group headers |
| **Label MD** | 16px | 500 (Medium) | 1.4 | 0 | Primary button text, active tab labels |
| **Body MD** | 14px | 400 (Regular) | 1.45 | 0 | Default body text, data table cells, descriptions |
| **Caption** | 13px | 400 (Regular) | 1.4 | +0.01em | Table column headers, helper text, timestamps |
| **Metric Large** | 36–44px | 400–500 | 1.05 | -0.02em | Macro KPI numbers (e.g., "$128k", "780 / 1000", "94.2%") |

---

## 4. Soft Shape & Border Radius System

EduSentinel AI adopts soft, organic, curved geometries based on Reference 2 and modern editorial software design.

| Architectural Level | Radius Token | CSS Value | Applied Components |
|---|---|---|---|
| **Outer Application Shell** | `rounded-[32px]` | `32px` | Main application inner canvas container, auth modal shell |
| **Large Content Panels** | `rounded-[22px]` | `22px` | Signature cards, large chart panels, split workspace panes |
| **Dashboard Cards** | `rounded-[18px]` | `18px` | Standard metric cards, analytical containers, table cards |
| **Secondary Cards** | `rounded-[14px]` | `14px` | Small stat widgets, quick action tiles, filter strips |
| **Active Sidebar Card** | `rounded-[15px]` | `15px` | White elevated selection card in sidebar (Reference 1) |
| **Segmented Pill Tabs** | `rounded-[12px]` | `12px` | Horizontal tab switcher buttons |
| **Input Fields** | `rounded-[12px]` | `12px` | Text search boxes, select dropdowns, textareas |
| **Buttons (Primary / Sec)** | `rounded-[14px]` | `14px` | Near-black primary CTA, white outline secondary button |
| **Dialogs & Drawers** | `rounded-[22px]` | `22px` | Inspection drawers, confirmation modals, edit dialogs |
| **Circular Icon Buttons** | `rounded-full` | `9999px` | Quick icon actions, avatars, status indicator dots |

---

## 5. Layout & Spacing System

All spacing adheres strictly to a **4px base grid**:

```
xxs: 4px  ·  xs: 8px  ·  sm: 12px  ·  md: 16px  ·  lg: 24px  ·  xl: 32px  ·  xxl: 48px  ·  section: 64–96px
```

### Layout Grid Rules
- **Desktop Sidebar:** Fixed `264px` width, light neutral background (`#F7F8FA`), border-r `#EAECEF`.
- **Top Context Bar:** Clean `64px` height with minimal overhead, breadcrumb context, unread alert counter, and user profile.
- **Main Viewport Shell:** Centered with comfortable `px-6 lg:px-10 py-8`, outer soft padding, and maximum width capped at `1440px`.
- **Asymmetric Dashboards:** Uses multi-span grids (e.g., `grid-cols-12` with 8-column main analytical chart paired with 4-column alert feed or quick actions).

---

## 6. Shared Component Specifications

### 6.1 Sidebar Navigation (Reference 1)
- **Container:** Light gray surface `#F7F8FA`, border `#EAECEF`.
- **Brand Symbol:** Sleek geometric mark at top with clean typography `EduSentinel AI`.
- **Navigation Groups:** Expandable groups with outline icon, label, and toggle chevron.
- **Connector Lines:** Subtle 1px vertical tree line connecting nested sub-routes.
- **Active Navigation Card:** Pure white `bg-white`, `rounded-[15px]`, subtle soft shadow (`shadow-[0_2px_8px_rgba(0,0,0,0.04)]`), dark text (`#181D26`), font-weight 500.
- **Count Badges:**
  - Soft coral badge: `bg-[#FCAB79]/25 text-[#AA2D00]` for urgent alerts.
  - Soft mint badge: `bg-[#A8D8C4]/35 text-[#0A2E0E]` for active tasks or completed milestones.

### 6.2 Top Header & Context Bar
- **Canvas:** White `#FFFFFF` with hairline bottom border `#EAECEF`.
- **Breadcrumbs:** Minimalist text link trail in `#666D7A` with slash or chevron separator.
- **Persona Quick Switcher:** Refined pill switcher allowing instant role preview across Teacher, Student, Mentor, Coordinator, Admin, and Management.
- **Notifications Button:** Circular white icon button with unread red badge dot.

### 6.3 Buttons
- **Primary CTA:** Near-black `#181D26`, text `#FFFFFF`, `rounded-[14px]`, `px-5 py-2.5`, subtle shadow.
- **Secondary CTA:** White canvas `#FFFFFF`, text `#181D26`, 1px border `#DDDDDD`, `rounded-[14px]`, `px-5 py-2.5`.
- **Circular Icon Button:** 40×40px circular button, white `#FFFFFF`, border `#DDDDDD`, centered outline icon.

### 6.4 Segmented Tab Control (Reference 2)
- **Track:** Soft surface `#F1F3F6` with `p-1 rounded-[14px]`.
- **Active Tab:** Near-black `#181D26` pill with white text, or clean white pill with soft elevation.
- **Inactive Tab:** Transparent with `#666D7A` text, hover `#181D26`.

### 6.5 Signature Content Cards
- **Editorial Header:** 32–40px page title with subtitle and contextual actions.
- **Metric Cards:** White `#FFFFFF` or soft pastel surface with 18px rounded corners, large metric typography (36px), trend indicator pill (`bg-[#A8D8C4]/30 text-[#0A2E0E]`), and subtle caption.
- **Visual Pill Progress Bar:** Custom pill-capsule bar (Reference 2) displaying filled black capsules and soft muted unfilled capsules.

---

## 7. Role-Specific Application Guidance

| Portal | Signature Accents Applied | Layout Character |
|---|---|---|
| **Teacher Portal** | Mint / Coral badges, asymmetric early-warning feeds | 8-column class metric grid + 4-column alert feed, Student 360 dossiers |
| **Student Portal** | Forest green positive milestones, cream explainer cards | Strengths-based growth rings, empathetic action checklist |
| **Mentor Portal** | Yellow / Mustard what-if simulators, peach mentee tags | Split-panel caseload workspace, interactive attendance/GPA sliders |
| **Admin Portal** | Near-black metric headers, data management pipelines | High-density compliance tables, model monitor confusion matrix |
| **Coordinator Portal** | Coral / Yellow departmental risk heatmap | Division comparative bars, faculty caseload balance widgets |
| **Management Portal** | Read-only amber banners with locked action buttons | High-level executive retention trends and institutional benchmarks |

---

*This document serves as the authoritative visual contract for EduSentinel AI's design system.*

