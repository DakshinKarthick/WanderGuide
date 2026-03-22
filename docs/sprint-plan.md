# WanderGuide — Sprint Plan

**Date:** 2026-03-10
**Total:** 5 Epics | 26 Stories | 56 Story Points | ~13 working days
**Velocity Assumption:** ~12 points/sprint (2-3 day sprints)

---

## Sprint Overview

| Sprint | Days | Focus | Points | Stories |
|---|---|---|---|---|
| Sprint 1 | Days 1-3 | Foundation (DB + CSV Seed + Types + Middleware) | 10 | 1.1 → 1.5 |
| Sprint 2 | Days 4-6 | Auth + Start Destinations | 12 | 2.1 → 2.4 + 3.1, 3.2 |
| Sprint 3 | Days 7-9 | Destinations Complete + Start Trips | 11 | 3.3 → 3.7 + 4.1 |
| Sprint 4 | Days 10-11 | Trips Complete | 12 | 4.2 → 4.5 + 5.1 |
| Sprint 5 | Days 12-13 | Chatbot + Dashboard + Polish | 11 | 5.2 → 5.5 |

---

## Sprint 1: Foundation (Days 1-3)

**Goal:** Backend infrastructure fully operational — Supabase running, all tables created from CSV datasets, types compiled, clients connecting.

**Theme:** *"Data in, schema up, types ready"*

| Order | Story | Points | Description |
|---|---|---|---|
| 1 | 1.1 | 1 | Supabase project + `.env.local` + Google OAuth config |
| 2 | 1.2 | 3 | SQL migrations — `cities`, `destinations`, `events`, `trips`, `trip_stops`, `user_profiles`, `chat_sessions` with RLS |
| 3 | 1.3 | 3 | CSV seed — Load `indian-cities.csv` → cities, merge `tourism-atlas.csv` + `tourist-destinations.csv` → destinations, curate events |
| 4 | 1.4 | 1 | TypeScript interfaces for all tables |
| 5 | 1.5 | 2 | Supabase browser/server clients + Next.js auth middleware |

**Total: 10 points**

### Key Deliverables — Sprint 1

- [ ] Supabase project running with 7 tables
- [ ] ~214 cities with coordinates loaded
- [ ] ~1000 destinations with real lat/long, ratings, categories loaded
- [ ] ~15 Indian festival events loaded
- [ ] RLS verified (public read on cities/destinations/events, user-scoped on trips)
- [ ] `@supabase/supabase-js` + `@supabase/ssr` installed
- [ ] TypeScript types compile clean
- [ ] Next.js middleware protects `/dashboard`, `/trip-planning`, `/onboarding`

### CSV Seed Pipeline (Story 1.3)

```
data/indian-cities.csv
    → Normalize state names
    → Derive region from state
    → INSERT INTO cities

data/tourism-atlas.csv (1020 rows, primary)
    → Normalize state names (Maharastra→Maharashtra, Gujrat→Gujarat, etc.)
    → Map interest → category enum
    → Split multi-interests → tags[]
    → Derive region from state
    → INSERT INTO destinations

data/tourist-destinations.csv (326 rows, enrichment)
    → Match on (name, city) with destinations
    → UPDATE matched rows with:
        visit_duration_hours, entrance_fee, best_time_to_visit,
        weekly_off, significance, establishment_year,
        has_airport_nearby, dslr_allowed, review_count_lakhs

Computed: trending_score = rating * 20 + review_count * 10
Events: 15 real Indian festivals (Diwali, Holi, Pushkar Fair, etc.)
```

### Dependencies

```
1.1 ──► 1.2 ──► 1.3
  │       │
  │       └──► 1.4
  └──► 1.5
```

---

## Sprint 2: Auth + Start Destinations (Days 4-6)

**Goal:** Users can sign in (Google + email), header shows real auth state, branding unified, destinations API serving real data.

**Theme:** *"Users in, data out"*

| Order | Story | Points | Description |
|---|---|---|---|
| 1 | 2.1 | 3 | Login, Register, Callback pages (Google OAuth + email) |
| 2 | 2.2 | 2 | `useAuth` hook + `AuthGuard` component |
| 3 | 2.3 | 2 | `UserMenu` dropdown + Header integration |
| 4 | 2.4 | 1 | Branding unification (WanderGuide everywhere) |
| 5 | 3.1 | 2 | Destinations API route (search, filter, paginate) |
| 6 | 3.2 | 2 | `useDestinations` hook with debounced search |

**Total: 12 points**

### Key Deliverables — Sprint 2

- [ ] User can sign in with Google OAuth (full redirect flow)
- [ ] User can register/sign in with email/password
- [ ] Session persists across page navigation and refresh
- [ ] Header shows user avatar + name when signed in
- [ ] Sign out works and clears session
- [ ] All pages say "WanderGuide" with consistent `#4A67C0` palette
- [ ] `GET /api/destinations?search=&region=&category=&sort=&page=&limit=` works
- [ ] `GET /api/destinations/[id]` returns single destination
- [ ] `useDestinations` hook returns typed data with loading/error states

### Dependencies

```
Epic 1 (all) ──► 2.1 ──► 2.2 ──► 2.3
                               2.4 (parallel)
Epic 1 (1.2, 1.3) ──► 3.1 ──► 3.2
```

**Note:** Stories 2.4 and 3.1/3.2 can run in parallel with the auth stories since destinations are publicly readable (no auth required).

---

## Sprint 3: Destinations Complete + Start Trips (Days 7-9)

**Goal:** Full destination browsing experience — connected filters, API search, pagination, real data in modals, trending section. Start trip CRUD API.

**Theme:** *"Browse, search, discover"*

| Order | Story | Points | Description |
|---|---|---|---|
| 1 | 3.3 | 1 | Refactor Filters — connected to parent via callbacks |
| 2 | 3.4 | 2 | Refactor SearchBar — debounced API search |
| 3 | 3.5 | 2 | Refactor DestinationGrid — API data + pagination + skeletons |
| 4 | 3.6 | 1 | Refactor DestinationModal — real data (description, rating, highlights) |
| 5 | 3.7 | 2 | Trending + Events API + TrendingLocations refactor |
| 6 | 4.1 | 3 | Trips API routes — GET/POST, GET/PUT/DELETE per trip |

**Total: 11 points**

### Key Deliverables — Sprint 3

- [ ] Region filter actually filters the grid
- [ ] Category filter actually filters the grid
- [ ] Filters compose with search
- [ ] Search bar queries 1000+ destinations with 300ms debounce
- [ ] Grid shows first 12 results with "Load More"
- [ ] Skeleton loading cards while fetching
- [ ] Destination modal shows: name, description, rating, cost, best time, type
- [ ] Trending section shows top destinations by score
- [ ] Events section shows upcoming festivals
- [ ] `POST /api/trips` creates a trip with stops
- [ ] `GET /api/trips` lists user's trips
- [ ] `PUT /api/trips/[id]` updates trip
- [ ] `DELETE /api/trips/[id]` deletes trip

### Dependencies

```
3.2 ──► 3.3
3.2 ──► 3.4
3.3, 3.4 ──► 3.5 ──► 3.6
1.3, 3.2 ──► 3.7
Epic 1 ──► 4.1
```

---

## Sprint 4: Trips Complete (Days 10-11)

**Goal:** Full trip planning persistence — drag-and-drop saves, dates save, map shows real route. Start chat API.

**Theme:** *"Plan, save, visualize"*

| Order | Story | Points | Description |
|---|---|---|---|
| 1 | 4.2 | 2 | `useTrips` hook — CRUD + optimistic updates |
| 2 | 4.3 | 3 | MultiStopPlanner — Supabase persistence (add/remove/reorder saves) |
| 3 | 4.4 | 3 | Trip date + day allocation — Supabase persistence |
| 4 | 4.5 | 2 | Trip map — real coordinates from trip stops |
| 5 | 5.1 | 2 | Chat API route — streaming GPT-4o-mini with destination context |

**Total: 12 points**

### Key Deliverables — Sprint 4

- [ ] `useTrips()` provides createTrip, updateTrip, deleteTrip, addStop, removeStop, reorderStops
- [ ] Adding a destination to trip saves to Supabase
- [ ] Drag-and-drop reorder saves new order to Supabase
- [ ] Removing a stop deletes from Supabase
- [ ] Trip dates (start/end) save to `trips` table
- [ ] Day allocation per stop saves to `trip_stops.days_allocated`
- [ ] Map markers at actual destination coordinates
- [ ] Route line between stops in order
- [ ] Map auto-fits to show all stops
- [ ] `POST /api/chat` streams AI responses with destination context

### Dependencies

```
4.1 ──► 4.2 ──► 4.3
              ──► 4.4
4.2, 1.3 ──► 4.5
Epic 1 ──► 5.1
```

---

## Sprint 5: Chatbot + Dashboard + Polish (Days 12-13)

**Goal:** AI chatbot guides new users, personalized dashboard for returning users, contact form works.

**Theme:** *"Intelligence + polish"*

| Order | Story | Points | Description |
|---|---|---|---|
| 1 | 5.2 | 3 | OnboardingChat + ChatMessage components (streaming UI) |
| 2 | 5.3 | 3 | Onboarding flow — preferences → suggestions → auto-create trip |
| 3 | 5.4 | 3 | Homepage dashboard — conditional rendering, trips, stats, trending |
| 4 | 5.5 | 2 | Contact form wiring — API endpoint + toast feedback |

**Total: 11 points**

### Key Deliverables — Sprint 5

- [ ] Chatbot welcome message appears on `/onboarding`
- [ ] Real-time streaming responses in chat bubbles
- [ ] Chatbot asks about travel style, climate, dates, budget
- [ ] Chatbot suggests matching destinations from database
- [ ] User can confirm → trip auto-created
- [ ] Preferences saved to `user_profiles`
- [ ] `onboarding_completed` set to true
- [ ] Guest homepage shows hero landing with CTA
- [ ] New user (not onboarded) redirects to `/onboarding`
- [ ] Returning user sees dashboard: welcome, trips, stats, trending, events
- [ ] Contact form submits and shows success toast

### Dependencies

```
5.1 ──► 5.2 ──► 5.3 ──► 5.4
Epic 1 ──► 5.5 (parallel)
```

---

## Critical Path

The longest dependency chain determines the minimum timeline:

```
1.1 → 1.2 → 1.3 → 3.1 → 3.2 → 3.5 → 4.1 → 4.2 → 4.3 → 5.1 → 5.2 → 5.3 → 5.4
 └─────────────────────────────────────────────────────────────────────────────────┘
                        Critical path: 13 stories, ~13 days
```

Parallel tracks that can save time:
- **Auth** (2.1 → 2.2 → 2.3) can run alongside Destinations API (3.1 → 3.2) since destinations are public
- **Branding** (2.4) is fully independent
- **Contact form** (5.5) is independent of chatbot

---

## Risk Register

| Risk | Impact | Mitigation |
|---|---|---|
| CSV state name inconsistencies | Broken filters/queries | Normalize in seed script with explicit mapping |
| Duplicate destinations in merged CSVs | Inflated record count | Deduplicate on `LOWER(name) + LOWER(city)` |
| Supabase free tier limits | Rate limiting during dev | Use local Supabase during development |
| OpenAI API costs | Budget concern | GPT-4o-mini is $0.15/1M input tokens — very cheap |
| Image URLs (placeholder) | Poor visual experience | Use Unsplash category URLs that return real photos |
| Tourism-atlas lat/long errors | Wrong map markers | Spot-check 10-15 major cities against known coordinates |

---

## Definition of Done (per story)

1. Code implemented and builds without TypeScript errors
2. Feature works as described in acceptance criteria
3. Manual testing passed (browser + mobile viewport)
4. No console errors
5. Existing functionality not broken (regression check)

---

## Pre-Sprint Checklist (Before Sprint 1)

- [ ] Supabase account created (free tier)
- [ ] Google Cloud Console project created
- [ ] Google OAuth client ID + secret obtained
- [ ] OpenAI API key obtained (for Sprint 5)
- [ ] CSV files validated and cleaned (state name normalization script ready)
- [ ] Git repo initialized and committed
