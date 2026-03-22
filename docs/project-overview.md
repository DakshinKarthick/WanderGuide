# WanderGuide - Project Overview

**Date:** 2026-03-10
**Type:** Web Application
**Architecture:** Next.js App Router (Frontend Prototype)

## Executive Summary

WanderGuide is an India travel discovery and trip planning platform built as a Next.js 15 frontend prototype. It was scaffolded using Vercel's v0.dev and uses React 19, TypeScript, Tailwind CSS, and shadcn/ui for the component library. The application provides destination browsing, multi-stop trip planning with drag-and-drop, date/day allocation planning, and an interactive Leaflet map — all operating purely on the client side with hardcoded data and localStorage persistence. **No backend, database, authentication, or API layer exists.**

## Project Classification

- **Repository Type:** Monorepo (single application)
- **Project Type(s):** Web Application (Frontend Only)
- **Primary Language(s):** TypeScript, CSS
- **Architecture Pattern:** Next.js App Router with Client Components
- **Origin:** Scaffolded from v0.dev

## Technology Stack Summary

| Category | Technology | Version | Notes |
|---|---|---|---|
| Framework | Next.js | 15.2.4 | App Router, no API routes |
| UI Library | React | 19 | Client components (`"use client"`) |
| Language | TypeScript | 5.8.3 | Minimal type usage |
| Styling | Tailwind CSS | 3.4.17 | With `tailwindcss-animate` |
| Component Library | shadcn/ui | Latest | 30+ Radix UI primitives installed |
| Theme | next-themes | 0.4.6 | Class-based dark mode |
| Drag & Drop | @hello-pangea/dnd | 18.x | Used for trip stop reordering |
| Maps | react-leaflet + leaflet | Latest | With leaflet-routing-machine |
| Date Handling | date-fns | 4.1.0 | Used in trip planning |
| Icons | lucide-react | 0.454.0 | Throughout all components |
| Forms (unused) | react-hook-form + zod | Latest | Installed but not used |
| Charts (unused) | recharts | 2.15.0 | Installed but not used |
| Package Manager | pnpm | 9.x | With lockfile |

### Unused Installed Dependencies

These packages are installed but not referenced in any source file:
- `react-hook-form` / `zod` / `@hookform/resolvers`
- `recharts`
- `react-beautiful-dnd` (replaced by `@hello-pangea/dnd`)
- `react-resizable-panels`
- `sonner` (toast notifications)
- `vaul` (drawer component)
- `cmdk` (command palette)
- Many Radix UI primitives (only a subset are used)

## Key Features

| Feature | Implementation Status |
|---|---|
| Home page with hero section | ✅ Complete (static) |
| Destination grid browsing | ✅ UI only (6 hardcoded destinations, placeholder images) |
| Destination detail modal | ✅ UI only (fallback/default data) |
| Search autocomplete | ⚠️ Mock (5 hardcoded suggestions, no real search) |
| Region/type filters | ❌ UI rendered but **not connected** to data |
| Multi-stop trip planner | ✅ Working (drag-and-drop, client-side state) |
| Trip date + day planning | ✅ Working (localStorage persistence) |
| Interactive map | ⚠️ Working but **disconnected** (hardcoded 4-city route) |
| Trending locations/events | ✅ UI only (hardcoded) |
| Dark/light theme | ✅ Fully working |
| Authentication | ❌ Buttons only, no implementation |
| Contact form submission | ❌ Form renders, no submit handler |
| About / FAQ pages | ✅ Static content |
| Privacy / Terms pages | ⚠️ Placeholder stubs |

## Architecture Highlights

### Routing Structure
```
/ (Home)
├── /locations (Main destination browsing + trip planner)
├── /trip-planning (Date/day allocation for saved trips)
├── /trip-map (Leaflet map with routing)
├── /about
├── /contact
├── /faq
├── /privacy
└── /terms
```

### Data Flow
```
DestinationGrid (hardcoded) → LocationsPage state → localStorage → TripPlanningPage
                                                  ↛ TripMapPage (disconnected)
```

### State Management
- **React useState** for all component state
- **localStorage** as the only persistence layer (trip stops)
- No global state management (no Context, no Redux, no Zustand)

### Component Architecture
- Layout: `Header` + `Footer` wrap all pages via `layout.tsx`
- Theme: `ThemeProvider` (next-themes) at root level
- App components live in `app/components/` (non-standard for Next.js)
- UI primitives live in `components/ui/` (shadcn/ui standard)

## Development Overview

### Prerequisites
- Node.js 18+
- pnpm

### Key Commands
- **Install:** `pnpm install`
- **Dev:** `pnpm dev`
- **Build:** `pnpm build`
- **Start:** `pnpm start`
- **Lint:** `pnpm lint`

### Known Build Configuration
- ESLint checks disabled during build (`eslint.ignoreDuringBuilds: true`)
- TypeScript checks disabled during build (`typescript.ignoreBuildErrors: true`)
- Images use unoptimized mode (`images.unoptimized: true`)

## Repository Structure

Single-part web application with Next.js App Router conventions. Application code in `app/`, shared UI primitives in `components/ui/`, utility functions in `lib/`. No test files, no CI/CD configuration, no environment files.

## Documentation Map

- [index.md](./index.md) - Master documentation index
- [architecture.md](./architecture.md) - Detailed architecture
- [source-tree-analysis.md](./source-tree-analysis.md) - Directory structure
- [component-inventory.md](./component-inventory.md) - Component catalog
- [development-guide.md](./development-guide.md) - Development workflow
- [gap-analysis.md](./gap-analysis.md) - Missing features and backend needs

---

_Generated using BMAD Method `document-project` workflow_
