# WanderGuide - Gap Analysis

**Date:** 2026-03-10
**Purpose:** Identify gaps between the current frontend prototype and a production-ready travel planning platform.

## Gap Summary

| Area | Current State | Production Need | Priority |
|---|---|---|---|
| Backend/API | None | REST or tRPC API layer | 🔴 Critical |
| Database | None (localStorage) | PostgreSQL/MongoDB for destinations, users, trips | 🔴 Critical |
| Authentication | Dead buttons | Full auth flow (OAuth + email) | 🔴 Critical |
| Destination data | 6 hardcoded items | Database-backed with admin CRUD | 🔴 Critical |
| Search | 5 hardcoded strings | Full-text search over real data | 🟡 High |
| Filters | UI-only (disconnected) | Connected to data queries | 🟡 High |
| Map integration | Hardcoded route | Dynamic from user's trip stops | 🟡 High |
| Contact form | No submit handler | Backend endpoint / email service | 🟡 High |
| Image assets | `/placeholder.svg` | Real destination images (CDN/S3) | 🟡 High |
| TypeScript types | Implicit `any` everywhere | Proper interfaces for all data | 🟡 High |
| Testing | No tests | Unit + integration + E2E tests | 🟡 High |
| Branding consistency | Mixed names/colors | Unified WanderGuide branding | 🟢 Medium |
| Privacy/Terms | Stub content | Real legal content | 🟢 Medium |
| Error handling | None | Global error boundaries, toast notifications | 🟢 Medium |
| Loading states | Minimal | Skeleton screens, spinners | 🟢 Medium |
| Responsive design | Basic grid | Full mobile optimization | 🟢 Medium |
| SEO | Minimal metadata | Full meta tags, OG images, sitemap | 🟢 Medium |
| Deployment | Not configured | CI/CD pipeline, staging/prod environments | 🟢 Medium |
| Analytics | None | Event tracking, user analytics | 🔵 Low |
| PWA | None | Offline support, installability | 🔵 Low |
| i18n | English only | Multi-language support | 🔵 Low |

## Detailed Gap Analysis

### 1. Backend API Layer (Critical)

**Current:** Zero API routes. No `app/api/` directory exists.

**Needed:**
- REST or tRPC API with endpoints for:
  - `GET /api/destinations` — List/search/filter destinations
  - `GET /api/destinations/:id` — Single destination detail
  - `POST /api/trips` — Save trip itinerary
  - `GET /api/trips` — List user's saved trips
  - `PUT /api/trips/:id` — Update trip
  - `POST /api/contact` — Contact form submission
  - Auth endpoints (login, register, session)

**Options:**
- Next.js API Routes (App Router `route.ts` handlers)
- tRPC for end-to-end type safety
- Separate backend service (Express, Fastify, etc.)

### 2. Database (Critical)

**Current:** localStorage for trip data, everything else hardcoded in component files.

**Needed:**
- Destination catalog with rich data (descriptions, ratings, coordinates, images, categories, regions)
- User accounts and profiles
- Trip itineraries with persistence
- Events/trending data with dates
- Contact form submissions

**Options:**
- PostgreSQL + Prisma (recommended for Next.js)
- MongoDB + Mongoose
- Supabase (BaaS with PostgreSQL + auth)
- PlanetScale (serverless MySQL)

### 3. Authentication (Critical)

**Current:** Header has "Sign In" and "Register" buttons that do nothing.

**Needed:**
- User registration and login
- Session management
- Protected routes (trip planning requires login)
- Profile management

**Options:**
- NextAuth.js / Auth.js
- Supabase Auth
- Clerk
- Custom JWT implementation

### 4. Destination Data (Critical)

**Current:** 6 hardcoded destinations in `DestinationGrid.tsx` with:
- Name, state only
- All images are `/placeholder.svg`
- Modal uses hardcoded fallback values for ratings, descriptions, etc.

**Needed:**
- Database with 100+ Indian destinations
- Rich data per destination: description, rating, highlights, best time to visit, average cost, coordinates, multiple images, categories, region
- Admin interface or seed script for data management
- Pagination and lazy loading

### 5. Search System (High)

**Current:** `SearchBar.tsx` matches against `["Jaipur", "Mumbai", "Goa", "Delhi", "Kolkata"]`.

**Needed:**
- Full-text search across destination names, descriptions, regions
- Server-side search endpoint
- Debounced API calls from frontend
- Search results that link to filtered views

### 6. Filter System (High)

**Current:** `Filters.tsx` renders Region and Type dropdowns but state is **completely isolated** — no props, no callbacks, no effect on `DestinationGrid`.

**Needed:**
- Filters → parent state → API query params → filtered DestinationGrid
- URL-based filter state (query parameters) for shareable links
- Multiple filter types (region, type, budget, rating, season)

### 7. Map Integration (High)

**Current:** `trip-map/page.tsx` displays 4 hardcoded South India locations. Does not read from localStorage or the trip planner.

**Needed:**
- Read trip stops from user's saved trip
- Geocode destination names to coordinates (or store in DB)
- Display user's actual route on the map
- Allow route editing from map view

### 8. TypeScript Types (High)

**Current:** Components accept untyped props (`destination`, `tripStops`, etc. are all implicit `any`).

**Needed:**
```typescript
interface Destination {
  id: string;
  name: string;
  state: string;
  region: string;
  type: string;
  description: string;
  rating: number;
  highlights: string[];
  bestTimeToVisit: string;
  averageCost: string;
  images: string[];
  coordinates: { lat: number; lng: number };
}

interface TripStop {
  id: string;
  destination: Destination;
  order: number;
  days: number;
}

interface Trip {
  id: string;
  userId: string;
  name: string;
  stops: TripStop[];
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Recommended Implementation Order

1. **Define TypeScript types/interfaces** — Foundation for everything else
2. **Set up database + ORM** — Prisma + PostgreSQL or Supabase
3. **Create API routes** — Next.js App Router `route.ts` handlers
4. **Add authentication** — NextAuth.js or Supabase Auth
5. **Seed destination data** — Populate DB with real destinations + coordinates
6. **Connect frontend to API** — Replace hardcoded data with `fetch` calls
7. **Wire up filters** — Connect Filter state → API query → Grid
8. **Wire up search** — Connect SearchBar to search API
9. **Connect map to trip data** — Read from DB/state instead of hardcoded
10. **Add real images** — Source destination photos, set up CDN
11. **Fix branding/colors** — Unify to WanderGuide palette
12. **Add testing** — Set up Vitest + Playwright
13. **Configure deployment** — Vercel or similar

---

_Generated using BMAD Method `document-project` workflow_
