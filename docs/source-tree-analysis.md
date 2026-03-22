# WanderGuide - Source Tree Analysis

**Date:** 2026-03-10

## Overview

Single-part Next.js 15 App Router web application. All source code lives in the project root with Next.js conventions. The project was scaffolded from v0.dev and uses shadcn/ui for component primitives. BMAD Method tooling installed at `bmad/`.

## Complete Directory Structure

```
WanderGuide/
├── app/                          # Next.js App Router - all pages and app components
│   ├── globals.css               # Tailwind directives + CSS custom properties (theme)
│   ├── layout.tsx                # Root layout (Header, Footer, ThemeProvider)
│   ├── page.tsx                  # Home page (/, static hero)
│   ├── about/
│   │   └── page.tsx              # About page (static)
│   ├── components/               # ⚠️ App-level components (non-standard location)
│   │   ├── DestinationGrid.tsx   # 3-column destination card grid (hardcoded 6 items)
│   │   ├── DestinationModal.tsx  # Destination detail dialog
│   │   ├── Filters.tsx           # Region/type filter dropdowns (NOT connected)
│   │   ├── Footer.tsx            # Site footer
│   │   ├── Header.tsx            # Top nav bar with theme toggle
│   │   ├── MultiStopPlanner.tsx  # DnD trip stop list (@hello-pangea/dnd)
│   │   ├── SearchBar.tsx         # Autocomplete search (5 hardcoded suggestions)
│   │   ├── ThemeToggle.tsx       # Dark/light mode toggle
│   │   └── TrendingLocations.tsx # Trending destinations + events cards
│   ├── contact/
│   │   └── page.tsx              # Contact form (no submit handler)
│   ├── faq/
│   │   └── page.tsx              # FAQ accordion page
│   ├── locations/
│   │   ├── loading.tsx           # Loading skeleton
│   │   └── page.tsx              # Main destination browsing + planner tabs
│   ├── privacy/
│   │   └── page.tsx              # Privacy policy (stub)
│   ├── terms/
│   │   └── page.tsx              # Terms of service (stub)
│   ├── trip-map/
│   │   ├── map.css               # Leaflet map styles
│   │   └── page.tsx              # Interactive Leaflet map (hardcoded route)
│   └── trip-planning/
│       └── page.tsx              # Trip date/day allocation planner
├── components/                   # Shared components (shadcn/ui standard location)
│   ├── theme-provider.tsx        # next-themes ThemeProvider wrapper
│   └── ui/                       # shadcn/ui primitives (30+ components)
│       ├── accordion.tsx
│       ├── alert-dialog.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── popover.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       └── ... (20+ more primitives)
├── hooks/                        # Custom React hooks
│   ├── use-mobile.tsx            # Mobile breakpoint detection
│   └── use-toast.ts              # Toast notification hook
├── lib/
│   └── utils.ts                  # cn() utility (clsx + tailwind-merge)
├── public/                       # Static assets (empty - no real images)
├── styles/
│   └── globals.css               # Duplicate globals (⚠️ redundant)
├── docs/                         # BMAD documentation output
│   └── stories/                  # Story tracking (empty)
├── bmad/                         # BMAD Method installation
├── .gemini/                      # Gemini IDE agent configs
├── .github/                      # GitHub agent/chatmode configs
├── components.json               # shadcn/ui configuration
├── next.config.mjs               # Next.js config (build checks disabled)
├── package.json                  # Dependencies and scripts
├── pnpm-lock.yaml                # Lock file
├── postcss.config.mjs            # PostCSS config
├── tailwind.config.ts            # Tailwind config with shadcn tokens
└── tsconfig.json                 # TypeScript configuration
```

## Critical Directories

### `app/`
**Purpose:** Next.js App Router — all pages, layouts, and application-level components.
**Contains:** 9 route pages, 9 app components, root layout, global styles.
**Entry Points:** `layout.tsx` (root layout), `page.tsx` (home page)

### `app/components/`
**Purpose:** Application-specific components (not route pages).
**Contains:** Header, Footer, SearchBar, Filters, DestinationGrid, DestinationModal, MultiStopPlanner, TrendingLocations, ThemeToggle.
**Note:** ⚠️ Non-standard location — typically these would be in the root `components/` directory or a `features/` directory. Placed here likely by v0.dev scaffold.

### `components/ui/`
**Purpose:** shadcn/ui primitive components (design system).
**Contains:** 30+ Radix UI-based primitives (Button, Card, Dialog, etc.)
**Note:** Standard shadcn/ui installation. Many primitives installed but unused.

### `app/locations/`
**Purpose:** Main destination browsing and trip planner page — the core feature.
**Contains:** `page.tsx` (tabbed Explore/Planner view), `loading.tsx` (skeleton).
**Entry Points:** `/locations` route.

### `app/trip-planning/`
**Purpose:** Trip date selection and day-per-stop allocation.
**Contains:** `page.tsx` — reads trip stops from localStorage, provides calendar UI.

### `app/trip-map/`
**Purpose:** Interactive map visualization with route lines.
**Contains:** `page.tsx` (Leaflet map + routing machine), `map.css`.
**Note:** ⚠️ Uses hardcoded South India locations — NOT connected to user's trip.

## Entry Points

- **Main Entry:** `app/layout.tsx` → wraps all pages with ThemeProvider, Header, Footer
- **Home:** `app/page.tsx` → static hero landing page
- **Core Feature:** `app/locations/page.tsx` → destination browsing + trip planner

## File Organization Patterns

- **Page routes:** `app/{route}/page.tsx` (Next.js App Router convention)
- **App components:** `app/components/{ComponentName}.tsx` (PascalCase, non-standard location)
- **UI primitives:** `components/ui/{component-name}.tsx` (kebab-case, shadcn standard)
- **Hooks:** `hooks/{hook-name}.tsx` (duplicated in `components/ui/`)
- **Utilities:** `lib/utils.ts`
- **No test files** anywhere in the project
- **No API routes** (`app/api/` does not exist)

## Key File Types

| Extension | Count | Purpose |
|---|---|---|
| `.tsx` | ~50 | React components and pages |
| `.ts` | ~5 | Configuration, utilities, hooks |
| `.css` | 3 | Global styles, map styles |
| `.mjs` | 2 | Next.js and PostCSS config |
| `.json` | 3 | Package, tsconfig, shadcn config |
| `.yaml` | 2 | Tailwind config, BMAD config |

---

_Generated using BMAD Method `document-project` workflow_
