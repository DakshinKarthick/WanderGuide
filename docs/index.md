# WanderGuide Documentation Index

**Type:** Web Application (Single Part)
**Primary Language:** TypeScript
**Architecture:** Next.js App Router (Client-Side Rendered Prototype)
**Last Updated:** 2026-03-10

## Project Overview

WanderGuide is an India-focused travel discovery and trip planning web application. It allows users to browse destinations, build multi-stop itineraries with drag-and-drop, plan trip dates/day allocations, and visualize routes on an interactive map. Currently a **frontend-only prototype** scaffolded from v0.dev with all data hardcoded — no backend, database, or API layer exists.

## Quick Reference

- **Tech Stack:** Next.js 15 / React 19 / TypeScript 5 / Tailwind CSS 3.4 / shadcn/ui / Leaflet
- **Entry Point:** `app/layout.tsx` → `app/page.tsx`
- **Architecture Pattern:** Next.js App Router with client-side components
- **Database:** None (localStorage only)
- **Deployment:** Not configured (Vercel-ready via Next.js)
- **Package Manager:** pnpm

## Generated Documentation

### Core Documentation

- [Project Overview](./project-overview.md) - Executive summary and high-level architecture
- [Source Tree Analysis](./source-tree-analysis.md) - Annotated directory structure
- [Architecture](./architecture.md) - Detailed technical architecture
- [Component Inventory](./component-inventory.md) - Catalog of all UI components
- [Development Guide](./development-guide.md) - Local setup and development workflow

### Planning & Implementation

- [Tech Spec](./tech-spec.md) - Complete technical specification (5 modules, SQL schemas, API routes)
- [Data Mapping](./data-mapping.md) - CSV → Database → API → UI data flow
- [Epics](./epics.md) - 5 epics, 26 stories, 56 story points
- [Sprint Plan](./sprint-plan.md) - 5-sprint timeline (13 days) with dependencies
- [Gate Check Report](./gate-check-report.md) - Implementation readiness assessment (✅ READY)

### Status & Gaps

- [Gap Analysis](./gap-analysis.md) - What's missing vs. what's needed for production

## Key Findings

### What Works
- Destination browsing with 6 hardcoded locations
- Multi-stop trip planner with drag-and-drop reordering
- Trip date planning with day allocation (localStorage persistence)
- Interactive Leaflet map with routing (hardcoded South India route)
- Dark/light theme toggle
- Static pages (About, Contact, FAQ, Privacy, Terms)

### Critical Gaps
1. **No backend/API** — zero data fetching, everything is inline arrays
2. **No authentication** — Sign In/Register buttons are non-functional
3. **Filters not connected** — Region/Type filters don't affect destination grid
4. **Search is mock** — Autocomplete matches against 5 hardcoded city names
5. **Map disconnected from planner** — Shows fixed route, ignores user's trip stops
6. **Contact form dead** — No submit handler, no backend endpoint
7. **No real images** — All images are `/placeholder.svg`
8. **Untyped props** — Components use implicit `any` types
9. **Branding inconsistency** — Some pages reference "TravelIndia" instead of "WanderGuide"
10. **Color scheme inconsistency** — Two different palettes used across pages

---

_Generated using BMAD Method `document-project` workflow_
