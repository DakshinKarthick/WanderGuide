# WanderGuide - Architecture

**Date:** 2026-03-10
**Architecture Pattern:** Next.js App Router — Client-Side Rendered Frontend Prototype

## Architecture Overview

WanderGuide is a **frontend-only** Next.js 15 application using the App Router. Despite being built on a server-capable framework, all pages are client components (`"use client"`) with hardcoded data. There is no server-side rendering, no API routes, no database, and no authentication. The application operates as a static prototype with localStorage as its only persistence mechanism.

```
┌─────────────────────────────────────────────┐
│                   Browser                    │
├─────────────────────────────────────────────┤
│  Next.js App Router (Client Components)      │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
│  │  Pages    │  │Components│  │ shadcn/ui │ │
│  │ (routes)  │  │ (app/)   │  │ (radix)   │ │
│  └────┬─────┘  └────┬─────┘  └───────────┘ │
│       │              │                       │
│  ┌────┴──────────────┴────┐                  │
│  │    React State (useState)│                 │
│  │    + localStorage        │                 │
│  └──────────────────────────┘                │
│                                              │
│  ┌──────────────┐  ┌─────────────────────┐  │
│  │ react-leaflet│  │ @hello-pangea/dnd    │  │
│  │ (map)        │  │ (drag-and-drop)      │  │
│  └──────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────┤
│             No Backend Layer                 │
│        No API │ No DB │ No Auth              │
└─────────────────────────────────────────────┘
```

## Routing Architecture

All routes use the Next.js App Router file-system convention:

| Route | Page File | Type | Description |
|---|---|---|---|
| `/` | `app/page.tsx` | Server | Static hero landing page |
| `/locations` | `app/locations/page.tsx` | Client | Destination browsing + trip planner |
| `/trip-planning` | `app/trip-planning/page.tsx` | Client | Date selection + day allocation |
| `/trip-map` | `app/trip-map/page.tsx` | Client | Leaflet map visualization |
| `/about` | `app/about/page.tsx` | Server | Static about page |
| `/contact` | `app/contact/page.tsx` | Server | Contact form (non-functional) |
| `/faq` | `app/faq/page.tsx` | Server | FAQ accordion page |
| `/privacy` | `app/privacy/page.tsx` | Server | Privacy policy stub |
| `/terms` | `app/terms/page.tsx` | Server | Terms of service stub |

**No API routes exist** — `app/api/` directory is absent.

## Component Architecture

### Layout Hierarchy
```
<html>
  <body>
    <ThemeProvider>              ← next-themes (class-based dark mode)
      <div className="flex flex-col min-h-screen">
        <Header />              ← Navigation + ThemeToggle
        <main>{children}</main> ← Page content
        <Footer />              ← Site footer
      </div>
    </ThemeProvider>
  </body>
</html>
```

### Component Dependency Map
```
LocationsPage
├── SearchBar                   ← Hardcoded suggestions
├── Filters                     ← Isolated state (NOT connected to grid)
├── DestinationGrid             ← Hardcoded 6 destinations
│   └── (triggers) DestinationModal
├── MultiStopPlanner            ← Receives tripStops from parent
│   └── @hello-pangea/dnd      ← Drag-and-drop reordering
└── TrendingLocations           ← Hardcoded trending + events

TripPlanningPage
├── Reads from localStorage     ← tripStops JSON
├── Calendar (shadcn)           ← Date selection
└── Day allocation UI           ← Increment/decrement per stop

TripMapPage
├── react-leaflet               ← Map rendering
├── leaflet-routing-machine     ← Route lines
└── Hardcoded 4 locations       ← NOT connected to trip planner
```

## State Management

### Current Pattern: Component-Level State
- All state managed via React `useState` hooks within individual pages
- No global state management (no Context API, Redux, Zustand, or Jotai)
- Cross-page data sharing via `localStorage` only

### Data Flow
```
LocationsPage (useState: tripStops[])
     │
     ├─ Add destination → tripStops grows
     ├─ DnD reorder → tripStops reorders
     ├─ "Continue to Trip Planning" →
     │       localStorage.setItem("tripStops", JSON.stringify(tripStops))
     │       router.push("/trip-planning")
     │
     └─ TripPlanningPage reads:
            localStorage.getItem("tripStops")
            → displays with date/day allocation UI
```

### Known State Issues
1. **No state sync** — If user navigates back, state is lost
2. **No validation** — localStorage data is not validated on read
3. **Map disconnected** — `/trip-map` ignores localStorage, uses own hardcoded data

## Styling Architecture

### Theme System
- **CSS Custom Properties** defined in `app/globals.css` using HSL values
- **Dark mode** via `next-themes` with `class` strategy
- **Tailwind** consumes CSS variables via `tailwind.config.ts` color mapping

### Color Palette (Primary)
| Token | Light | Dark |
|---|---|---|
| Primary | `hsl(225, 50%, 52%)` / `#4A67C0` | `hsl(225, 55%, 64%)` / `#6A87E0` |
| Secondary | `hsl(217, 60%, 65%)` / `#6A87E0` | Varies |
| Background | `hsl(210, 100%, 97%)` | `hsl(224, 30%, 15%)` |

### Branding Inconsistency
- Main app components use `#4A67C0` / `#6A87E0` palette
- About/Contact/FAQ pages use `#87A2FF` / `#C4D7FF` / `#FFD7C4` palette
- Some pages reference "TravelIndia" instead of "WanderGuide"

## Third-Party Integrations

| Library | Purpose | Pages Used |
|---|---|---|
| `react-leaflet` | Interactive map rendering | `/trip-map` |
| `leaflet-routing-machine` | Route line calculation | `/trip-map` |
| `@hello-pangea/dnd` | Drag-and-drop list | `/locations` (MultiStopPlanner) |
| `date-fns` | Date formatting/manipulation | `/trip-planning` |
| `next-themes` | Dark/light theme toggle | Root layout |

## Security Considerations

- **No authentication** — auth buttons are non-functional placeholders
- **No authorization** — no protected routes or user roles
- **No CSRF/XSS protection** needed (no forms submit data)
- **localStorage data** — trip data stored unencrypted, no PII collected
- **ESLint/TypeScript disabled in build** — potential type safety issues

## Performance Considerations

- **No SSR/SSG** — core pages are client-rendered despite Next.js capabilities
- **Unoptimized images** — `images.unoptimized: true` in Next.js config
- **No code splitting** — all components loaded on their respective pages
- **Leaflet loaded client-side** — appropriate for a map library
- **30+ unused UI components** — tree-shaking should handle these but adds to install size

## Testing

**No tests exist.** No test framework is configured. No test files anywhere in the project.

---

_Generated using BMAD Method `document-project` workflow_
