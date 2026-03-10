# WanderGuide - Epic Breakdown

**Date:** 2026-03-10
**Project Level:** 2 (Medium — BMad Method Brownfield)

---

## Epic 1: Foundation — Supabase Setup & TypeScript Types

**Slug:** foundation-setup

### Goal

Establish the backend infrastructure: Supabase project, database schema, seed data, client libraries, TypeScript interfaces, and Next.js middleware. This epic produces zero UI changes but is the foundation for all subsequent epics.

### Scope

- Supabase project creation and configuration
- All SQL migrations (destinations, trips, trip_stops, user_profiles, events, chat_sessions)
- Row Level Security policies
- Seed script with 50+ Indian destinations + events
- Supabase client utilities (`lib/supabase/client.ts`, `lib/supabase/server.ts`)
- All TypeScript type definitions (`lib/types/`)
- Environment variable setup (`.env.local`)
- Next.js middleware for auth session management

### Success Criteria

- Supabase project running with all tables created
- 50+ destinations with real coordinates seeded
- RLS policies verified (public read on destinations, user-scoped on trips)
- TypeScript types compile without errors
- Supabase client can connect from both browser and server contexts
- `.env.local` configured and gitignored

### Dependencies

None — this is the first epic.

---

## Story Map - Epic 1

```
1.1 Supabase project + env vars
        ↓
1.2 SQL migrations (cities + 6 more tables)
        ↓
1.3 CSV seed pipeline (~214 cities + ~1000 destinations + ~15 events)
        ↓
1.4 TypeScript interfaces
        ↓
1.5 Supabase client utilities + middleware
```

---

## Stories - Epic 1

### Story 1.1: Supabase Project Setup

As a developer,
I want a configured Supabase project with environment variables,
So that I have a working backend infrastructure to build on.

**Acceptance Criteria:**

**Given** a new Supabase project is created
**When** the environment variables are added to `.env.local`
**Then** the Next.js app can connect to Supabase without errors

**And** `.env.local` is listed in `.gitignore`
**And** Google OAuth provider is configured in Supabase Auth settings

**Prerequisites:** None

**Technical Notes:**
- Create project at supabase.com (free tier)
- Configure Google OAuth in Auth → Providers → Google
- Set redirect URL to `http://localhost:3000/auth/callback`
- Create `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`

**Estimated Effort:** 1 point (~30 min)

---

### Story 1.2: Database Schema Migrations

As a developer,
I want all database tables created with proper RLS policies,
So that the app has a secure, structured data layer.

**Acceptance Criteria:**

**Given** the Supabase project exists
**When** all migration SQL scripts are executed
**Then** tables `cities`, `destinations`, `events`, `trips`, `trip_stops`, `user_profiles`, `chat_sessions` exist with correct columns, constraints, and indexes

**And** RLS is enabled on all tables
**And** `cities`, `destinations` and `events` are publicly readable
**And** `trips`, `trip_stops`, `user_profiles`, `chat_sessions` are scoped to `auth.uid()`
**And** the `handle_new_user()` trigger auto-creates profiles on signup

**Prerequisites:** Story 1.1

**Technical Notes:**
- Create files: `supabase/migrations/001_create_cities.sql` through `006_create_chat_sessions.sql`
- `cities` table: id, name, state, region, latitude, longitude
- `destinations` table: CSV-aligned schema with category enum matching interest categories
- Category enum: `cultural-heritage`, `religious`, `nature-wildlife`, `adventure`, `arts-science`, `shopping`, `sightseeing`, `culinary`, `sports-recreation`
- See [data-mapping.md](./data-mapping.md) for complete schema
- See tech-spec.md for full SQL schemas

**Estimated Effort:** 3 points (~2 hours)

---

### Story 1.3: CSV Seed Pipeline — Cities + Destinations + Events

As a developer,
I want the 3 CSV datasets loaded into the database with normalization and enrichment,
So that the app has ~1000 real destinations to browse, search, and plan trips with.

**Acceptance Criteria:**

**Given** all database tables exist
**When** the seed script is executed
**Then** ~214 cities are loaded from `data/indian-cities.csv` with derived regions

**And** ~1000 destinations are loaded from `data/tourism-atlas.csv` with mapped categories and tags
**And** destinations are enriched with metadata from `data/tourist-destinations.csv` (visit duration, entrance fee, weekly off, DSLR policy, significance)
**And** state names are normalized (Maharastra→Maharashtra, Gujrat→Gujarat, Karanataka→Karnataka)
**And** `trending_score` is computed from `rating * 20 + review_count_lakhs * 10`
**And** ~15 real Indian festival events are inserted with 2026-2027 dates
**And** all coordinates are accurate (from CSV with real lat/long)
**And** all regions and categories match the enum constraints

**Prerequisites:** Story 1.2

**Technical Notes:**
- Create `supabase/seed.sql` — or a Node.js script `scripts/seed.ts` for CSV parsing
- See [data-mapping.md](./data-mapping.md) for complete CSV → DB column mapping
- Normalize state names before insert (fix typos in source CSVs)
- Map `interest` column → `category` enum (first interest = category, all → tags[])
- Match records between datasets on `LOWER(name) + LOWER(city)` for enrichment
- Deduplicate overlapping records between tourism-atlas and tourist-destinations
- Events: Diwali, Holi, Pushkar Fair, Hornbill Festival, Onam, Rann Utsav, Durga Puja, etc.

**Estimated Effort:** 3 points (~2 hours)

---

### Story 1.4: TypeScript Type Definitions

As a developer,
I want typed interfaces for all data models,
So that the codebase has type safety and IntelliSense support.

**Acceptance Criteria:**

**Given** the database schema is finalized
**When** TypeScript interfaces are created
**Then** `lib/types/destination.ts`, `lib/types/trip.ts`, `lib/types/user.ts`, `lib/types/chat.ts` exist with complete type definitions matching the DB schema

**And** `lib/constants.ts` exports region/category enums, state→region lookup, and display label maps
**And** types are exported and importable from `@/lib/types/*`
**And** no `any` types used in the interfaces

**Prerequisites:** Story 1.2

**Technical Notes:**
- See tech-spec.md "TypeScript Interfaces" section for complete definitions
- Include union types for enums (region, category, travel_style, etc.)
- Include optional fields where DB allows NULL

**Estimated Effort:** 1 point (~30 min)

---

### Story 1.5: Supabase Client Utilities + Middleware

As a developer,
I want reusable Supabase client factories and Next.js middleware,
So that all pages and API routes can securely access Supabase.

**Acceptance Criteria:**

**Given** Supabase credentials are in `.env.local`
**When** `createBrowserClient()` is called from a client component
**Then** it returns a configured Supabase client with cookie-based session management

**And** `createServerClient()` works in API routes and server components
**And** Next.js middleware refreshes auth sessions on every request
**And** protected routes (`/dashboard`, `/trip-planning`, `/onboarding`) redirect unauthenticated users to `/auth/login`

**Prerequisites:** Story 1.1

**Technical Notes:**
- `lib/supabase/client.ts` — browser client using `@supabase/ssr` `createBrowserClient()`
- `lib/supabase/server.ts` — server client using `@supabase/ssr` `createServerClient()` with cookies
- `middleware.ts` at project root — session refresh + route protection
- See tech-spec.md middleware code for implementation

**Estimated Effort:** 2 points (~1 hour)

---

## Implementation Timeline - Epic 1

**Total Story Points:** 10
**Estimated Timeline:** 1-2 days

---

## Epic 2: Authentication — Sign-in Module

**Slug:** auth-module

### Goal

Implement complete authentication flow with Google OAuth and email/password, including login/register pages, session management, user profile auto-creation, and Header integration with real auth state.

### Scope

- Login page with Google OAuth button + email/password form
- Register page with email/password + Google
- OAuth callback handler page
- `useAuth` hook for auth state management
- `AuthGuard` component for protected route wrapping
- `UserMenu` dropdown component (profile, trips, sign out)
- Header refactor to show real auth state
- Branding fix: unify to WanderGuide name and color palette

### Success Criteria

- User can sign in with Google OAuth (redirect flow)
- User can register and sign in with email/password
- User session persists across page refreshes and navigation
- Header shows user avatar + name when signed in
- Header shows Sign In / Register buttons when signed out
- Sign out works and clears session
- User profile is auto-created in `user_profiles` table on signup
- All pages consistently use "WanderGuide" branding and `#4A67C0`/`#6A87E0` palette

### Dependencies

Epic 1 (Foundation) must be complete.

---

## Story Map - Epic 2

```
2.1 Auth pages (login, register, callback)
        ↓
2.2 useAuth hook + AuthGuard
        ↓
2.3 UserMenu + Header integration
        ↓
2.4 Branding unification
```

---

## Stories - Epic 2

### Story 2.1: Auth Pages — Login, Register, Callback

As a user,
I want to sign in with Google or email/password,
So that I can access personalized features and save my trips.

**Acceptance Criteria:**

**Given** I am on the login page (`/auth/login`)
**When** I click "Sign in with Google"
**Then** I am redirected to Google OAuth, and after authorization, I am redirected back to the app and signed in

**And** I can sign in with email/password on the same page
**And** a "Register" link takes me to `/auth/register`
**And** the register page allows email/password signup with a "Sign up with Google" option
**And** `/auth/callback` handles the OAuth redirect and exchanges the code for a session
**And** after successful auth, I am redirected to `/` (homepage)

**Prerequisites:** Epic 1

**Technical Notes:**
- `app/auth/login/page.tsx` — form with Google button + email/password
- `app/auth/register/page.tsx` — registration form
- `app/auth/callback/route.ts` — server-side route handler (not page) that exchanges auth code
- Use `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })`
- Use `supabase.auth.signInWithPassword()` and `supabase.auth.signUp()`
- Style with shadcn Card, Input, Button, Label components

**Estimated Effort:** 3 points (~2 hours)

---

### Story 2.2: useAuth Hook + AuthGuard Component

As a developer,
I want a reusable auth state hook and route guard,
So that any component can access user state and protected routes are enforced client-side.

**Acceptance Criteria:**

**Given** a component uses `useAuth()`
**When** the user is signed in
**Then** `user`, `profile`, and `signOut` are available

**And** when the user is not signed in, `user` is null
**And** `AuthGuard` wraps children and shows a loading state while checking auth
**And** `AuthGuard` redirects to `/auth/login` if user is not authenticated

**Prerequisites:** Story 2.1

**Technical Notes:**
- `lib/hooks/useAuth.ts` — subscribes to `supabase.auth.onAuthStateChange()`
- Fetches `user_profiles` row when user changes
- `app/components/AuthGuard.tsx` — wraps children with auth check

**Estimated Effort:** 2 points (~1 hour)

---

### Story 2.3: UserMenu + Header Integration

As a signed-in user,
I want to see my name/avatar in the header with a dropdown menu,
So that I can access my profile, trips, and sign out.

**Acceptance Criteria:**

**Given** I am signed in
**When** I view the header
**Then** I see my avatar (or initial) and display name instead of Sign In/Register buttons

**And** clicking my avatar opens a dropdown with: Dashboard, My Trips, Sign Out
**And** clicking Sign Out signs me out and redirects to homepage
**And** when signed out, the header shows Sign In and Register buttons linked to auth pages

**Prerequisites:** Story 2.2

**Technical Notes:**
- `app/components/UserMenu.tsx` — shadcn DropdownMenu with avatar, name, links
- Modify `app/components/Header.tsx` — conditional rendering based on `useAuth()`
- Use `lucide-react` User, LogOut, Map, LayoutDashboard icons

**Estimated Effort:** 2 points (~1 hour)

---

### Story 2.4: Branding Unification

As a user,
I want a consistent brand experience across all pages,
So that the app feels polished and professional.

**Acceptance Criteria:**

**Given** I navigate to any page in the app
**When** the page loads
**Then** the app name is consistently "WanderGuide" everywhere

**And** all pages use the `#4A67C0` / `#6A87E0` color palette (no `#87A2FF` / `#C4D7FF`)
**And** the About page team section references WanderGuide (not TravelIndia)
**And** the Contact page uses WanderGuide consistent styling
**And** the FAQ page uses WanderGuide consistent styling

**Prerequisites:** None (can be done in parallel)

**Technical Notes:**
- Update `app/about/page.tsx`, `app/contact/page.tsx`, `app/faq/page.tsx`
- Replace all `#87A2FF`, `#C4D7FF`, `#FFD7C4` with theme primary/secondary colors
- Replace "TravelIndia" text with "WanderGuide"

**Estimated Effort:** 1 point (~30 min)

---

## Implementation Timeline - Epic 2

**Total Story Points:** 8
**Estimated Timeline:** 1-2 days

---

## Epic 3: Destination Selection — Database-Backed Browsing

**Slug:** destination-selection

### Goal

Replace all hardcoded destination data with database-backed API calls. Implement real search, connected filters, pagination, and destination detail modal with complete data.

### Scope

- Destinations API route with search, filter, sort, pagination
- Trending destinations + events API route
- `useDestinations` hook with debounced search
- Refactor Filters component with parent callbacks
- Refactor DestinationGrid to fetch from API
- Refactor DestinationModal to display full destination data
- Refactor SearchBar for API-backed autocomplete
- Refactor TrendingLocations to fetch from API
- Destination detail images (from seed data URLs)

### Success Criteria

- DestinationGrid displays destinations from Supabase (not hardcoded)
- Search bar queries API with 300ms debounce
- Region filter filters destinations by region
- Category filter filters destinations by category
- Filters and search work together (composable)
- Pagination loads more destinations
- Destination modal shows real data (description, highlights, rating, cost, best time, images)
- Trending section shows top destinations by trending_score
- Events section shows upcoming events with dates

### Dependencies

Epic 1 (Foundation) must be complete. Can run in parallel with Epic 2 (Auth) since destinations are publicly readable.

---

## Story Map - Epic 3

```
3.1 Destinations API route
        ↓
3.2 useDestinations hook
        ↓
3.3 Refactor Filters (connected)     3.4 Refactor SearchBar (API)
        ↓                                    ↓
3.5 Refactor DestinationGrid (API + pagination)
        ↓
3.6 Refactor DestinationModal (real data)
        ↓
3.7 Trending + Events API + TrendingLocations refactor
```

---

## Stories - Epic 3

### Story 3.1: Destinations API Route

As a frontend developer,
I want a REST API endpoint for querying destinations,
So that the UI can fetch, search, filter, and paginate real destination data.

**Acceptance Criteria:**

**Given** the destinations table is seeded
**When** `GET /api/destinations` is called
**Then** it returns a paginated list of destinations with total count

**And** `?search=jaipur` returns destinations matching the search term (case-insensitive)
**And** `?region=south` filters by region
**And** `?category=nature-wildlife` filters by category
**And** `?sort=rating` sorts by the specified column
**And** `?page=2&limit=12` returns the second page of 12 results
**And** filters compose: `?region=north&category=cultural-heritage&search=jai` works correctly

**Prerequisites:** Stories 1.2, 1.3

**Technical Notes:**
- `app/api/destinations/route.ts`
- Also create `app/api/destinations/[id]/route.ts` for single destination detail
- Use Supabase query builder with conditional filters
- See tech-spec.md for implementation code

**Estimated Effort:** 2 points (~1 hour)

---

### Story 3.2: useDestinations Hook

As a developer,
I want a reusable hook for fetching destinations,
So that components can easily consume destination data with loading/error states.

**Acceptance Criteria:**

**Given** a component calls `useDestinations({ region: 'south', search: 'mun' })`
**When** the filters change
**Then** a debounced API call is made (300ms for search, immediate for filters)

**And** the hook returns `{ destinations, isLoading, error, pagination }`
**And** changing filters resets to page 1
**And** a `loadMore()` function fetches the next page

**Prerequisites:** Story 3.1

**Technical Notes:**
- `lib/hooks/useDestinations.ts`
- Use `useState` + `useEffect` + debounce for search
- Return typed `Destination[]` from API response

**Estimated Effort:** 2 points (~1 hour)

---

### Story 3.3: Refactor Filters Component (Connected)

As a user,
I want filters that actually filter the destination grid,
So that I can find destinations by region and category.

**Acceptance Criteria:**

**Given** I am on the locations page
**When** I select "South India" in the Region filter
**Then** the destination grid shows only destinations in the south region

**And** selecting a category filter (e.g., "Nature & Wildlife") further filters results
**And** selecting "All" in either filter clears that filter
**And** filters visually indicate the active selection

**Prerequisites:** Story 3.2

**Technical Notes:**
- Modify `app/components/Filters.tsx` — accept `value` and `onChange` props
- New prop interface: `{ value: { region: string; category: string }, onChange: (filters) => void }`
- Parent (`locations/page.tsx`) manages filter state and passes to `useDestinations`

**Estimated Effort:** 1 point (~30 min)

---

### Story 3.4: Refactor SearchBar (API-Connected)

As a user,
I want search results from the full destination database,
So that I can find any destination by name.

**Acceptance Criteria:**

**Given** I type "Mun" in the search bar
**When** 300ms passes after my last keystroke
**Then** I see matching destinations from the database (e.g., Munnar, Mumbai)

**And** clicking a suggestion navigates to the locations page with that search active
**And** the search input works alongside filters
**And** clearing the search shows all destinations again

**Prerequisites:** Story 3.2

**Technical Notes:**
- Modify `app/components/SearchBar.tsx` — remove hardcoded suggestions
- Add debounced API call to `/api/destinations?search={query}&limit=5` for suggestions
- Call parent `onSearch` callback to update filter state

**Estimated Effort:** 2 points (~1 hour)

---

### Story 3.5: Refactor DestinationGrid (API + Pagination)

As a user,
I want to browse all 50+ destinations with loading states and pagination,
So that I can discover destinations without being overwhelmed.

**Acceptance Criteria:**

**Given** I am on the locations page
**When** the page loads
**Then** I see the first 12 destinations in a grid with real images (not placeholder.svg)

**And** a "Load More" button appears if more destinations exist
**And** clicking "Load More" appends next page of destinations
**And** a loading skeleton shows while fetching
**And** each card shows destination name, state, rating, and a "View Details" / "Add to Trip" button

**Prerequisites:** Stories 3.2, 3.3, 3.4

**Technical Notes:**
- Modify `app/components/DestinationGrid.tsx` — accept `destinations`, `isLoading` props
- Remove hardcoded `destinations` array
- Add skeleton loading cards (use shadcn Skeleton)
- Use `next/image` with Supabase/Unsplash image URLs
- Update `next.config.mjs` with `images.remotePatterns` for external image domains

**Estimated Effort:** 2 points (~1 hour)

---

### Story 3.6: Refactor DestinationModal (Real Data)

As a user,
I want to see rich details about a destination,
So that I can make informed decisions about where to travel.

**Acceptance Criteria:**

**Given** I click "View Details" on a destination card
**When** the modal opens
**Then** I see the destination's real description, rating, highlights, best time to visit, average daily cost, and images

**And** the "Add to Trip" button adds this destination to my trip planner
**And** the modal data comes from the destination object (no hardcoded fallbacks)

**Prerequisites:** Story 3.5

**Technical Notes:**
- Modify `app/components/DestinationModal.tsx`
- Add typed `Destination` prop interface
- Remove all fallback values — data comes from API
- Display `highlights` as a list, `avg_cost_per_day` formatted as ₹X/day

**Estimated Effort:** 1 point (~30 min)

---

### Story 3.7: Trending + Events API & TrendingLocations Refactor

As a user,
I want to see actually trending destinations and real upcoming events,
So that I can discover timely travel opportunities.

**Acceptance Criteria:**

**Given** I am on the locations page or dashboard
**When** the trending section loads
**Then** I see the top 5 destinations by trending score with real data

**And** I see upcoming events with name, destination, and date
**And** "Add to Trip" on a trending destination works the same as from the grid

**Prerequisites:** Stories 1.3, 3.2

**Technical Notes:**
- `app/api/trending/route.ts` — return top destinations + upcoming events
- Modify `app/components/TrendingLocations.tsx` — remove hardcoded arrays, fetch from API
- Accept `onAddToTrip` callback prop (already exists)

**Estimated Effort:** 2 points (~1 hour)

---

## Implementation Timeline - Epic 3

**Total Story Points:** 12
**Estimated Timeline:** 2-3 days

---

## Epic 4: Trip Planning — Persistence & Map Integration

**Slug:** trip-planning

### Goal

Replace localStorage-based trip planning with Supabase persistence. Wire the trip map to display the user's actual trip stops instead of hardcoded locations.

### Scope

- Trips API routes (CRUD)
- `useTrips` hook for trip state management
- Refactor MultiStopPlanner to persist to Supabase
- Refactor TripPlanningPage to use database persistence
- Refactor TripMapPage to read from trip data
- Trip CRUD: create, read, update stops/dates/allocations, delete

### Success Criteria

- User can create a trip by adding destinations
- Trip persists across sessions (stored in Supabase, not localStorage)
- Drag-and-drop reordering saves to database
- Date selection and day allocation save to database
- Trip map shows markers at user's actual trip stops with routing lines
- User can view multiple saved trips
- User can delete a trip

### Dependencies

Epic 1 (Foundation) + Epic 2 (Auth) must be complete. Epic 3 (Destinations) should be complete for real destination data.

---

## Story Map - Epic 4

```
4.1 Trips API routes (CRUD)
        ↓
4.2 useTrips hook
        ↓
4.3 MultiStopPlanner persistence     4.4 Trip date/day planning persistence
        ↓                                    ↓
4.5 Trip map — real route display
```

---

## Stories - Epic 4

### Story 4.1: Trips API Routes (CRUD)

As a signed-in user,
I want API endpoints to create, read, update, and delete trips,
So that my trip data persists in the cloud.

**Acceptance Criteria:**

**Given** I am authenticated
**When** `POST /api/trips` is called with trip data
**Then** a new trip is created with stops and returns the trip object

**And** `GET /api/trips` returns all my trips with nested stops and destinations
**And** `GET /api/trips/[id]` returns a single trip with full details
**And** `PUT /api/trips/[id]` updates trip name, dates, and stops
**And** `DELETE /api/trips/[id]` deletes the trip and its stops
**And** unauthenticated requests return 401

**Prerequisites:** Epic 1

**Technical Notes:**
- `app/api/trips/route.ts` — GET (list) + POST (create)
- `app/api/trips/[id]/route.ts` — GET (detail) + PUT (update) + DELETE
- Include nested `trip_stops` with expanded `destination` data
- See tech-spec.md for implementation code

**Estimated Effort:** 3 points (~2 hours)

---

### Story 4.2: useTrips Hook

As a developer,
I want a reusable hook for trip CRUD operations,
So that components can easily manage trip state.

**Acceptance Criteria:**

**Given** a component uses `useTrips()`
**When** trips are fetched
**Then** `trips`, `currentTrip`, `isLoading`, and mutation functions are available

**And** `createTrip(data)` creates a trip and refreshes the list
**And** `updateTrip(id, data)` updates and refreshes
**And** `deleteTrip(id)` deletes and refreshes
**And** `addStop(tripId, destinationId)` adds a stop
**And** `removeStop(tripId, stopId)` removes a stop
**And** `reorderStops(tripId, stops)` updates stop order

**Prerequisites:** Story 4.1

**Technical Notes:**
- `lib/hooks/useTrips.ts`
- Manage optimistic updates for drag-and-drop reordering
- Cache trip list to avoid refetching on every action

**Estimated Effort:** 2 points (~1 hour)

---

### Story 4.3: MultiStopPlanner — Supabase Persistence

As a signed-in user,
I want my trip stop changes saved automatically,
So that my trip is preserved even if I close the browser.

**Acceptance Criteria:**

**Given** I am building a trip on the locations page
**When** I add a destination to the trip
**Then** the stop is saved to the database

**And** when I remove a stop, it is deleted from the database
**And** when I reorder stops via drag-and-drop, the new order saves to the database
**And** when I return to the page later, my trip stops are loaded from the database
**And** if I am not signed in, trip planning still works client-side with a prompt to sign in to save

**Prerequisites:** Stories 4.2, 3.5

**Technical Notes:**
- Modify `app/components/MultiStopPlanner.tsx`
- For authenticated users: CRUD through `useTrips` hook
- For unauthenticated: keep current client-side behavior, show "Sign in to save your trip" banner
- Optimistic UI: update local state immediately, sync to DB async

**Estimated Effort:** 3 points (~2 hours)

---

### Story 4.4: Trip Date & Day Planning — Supabase Persistence

As a signed-in user,
I want my trip dates and day allocations saved to the database,
So that my complete itinerary is preserved.

**Acceptance Criteria:**

**Given** I am on the trip planning page (`/trip-planning`)
**When** I select start and end dates
**Then** the dates are saved to the `trips` table

**And** when I allocate days to each stop, the `days_allocated` is saved to `trip_stops`
**And** the page loads trip data from Supabase (not localStorage)
**And** the trip summary shows accurate totals
**And** validation prevents allocating more days than the trip duration

**Prerequisites:** Story 4.2

**Technical Notes:**
- Refactor `app/trip-planning/page.tsx`
- Remove all `localStorage.getItem/setItem` calls
- Load trip from URL param or most recent trip: `/trip-planning?trip=[id]`
- Use `useTrips` hook for all data operations
- Keep existing calendar UI (shadcn Calendar + date-fns)

**Estimated Effort:** 3 points (~2 hours)

---

### Story 4.5: Trip Map — Real Route Display

As a user,
I want the map to show my actual trip route with real coordinates,
So that I can visualize my journey across India.

**Acceptance Criteria:**

**Given** I navigate to the trip map page
**When** the map loads
**Then** markers appear at each of my trip stops' real coordinates

**And** route lines connect the stops in order
**And** clicking a marker shows the destination name
**And** the map auto-fits to show all markers
**And** if no trip exists, a message says "Plan a trip first" with a link to `/locations`

**Prerequisites:** Stories 4.2, 1.3 (need real coordinates from seed data)

**Technical Notes:**
- Refactor `app/trip-map/page.tsx`
- Remove hardcoded `tripLocations` array
- Load trip data via `useTrips` hook or URL param
- Use `destination.latitude` / `destination.longitude` for marker positions
- Keep `leaflet-routing-machine` for route lines
- Use `map.fitBounds()` to auto-zoom

**Estimated Effort:** 2 points (~1 hour)

---

## Implementation Timeline - Epic 4

**Total Story Points:** 13
**Estimated Timeline:** 2-3 days

---

## Epic 5: Chatbot Onboarding & Homepage Dashboard

**Slug:** chatbot-dashboard

### Goal

Build the AI chatbot onboarding experience that guides new users through trip planning, and create the personalized homepage dashboard for returning users.

### Scope

- Chat API route (Vercel AI SDK + OpenAI)
- OnboardingChat component with streaming responses
- ChatMessage component
- Chat session persistence
- Onboarding flow (preferences → suggestions → trip creation)
- Dashboard page with trips, stats, suggestions, trending
- Homepage conditional rendering (guest vs. new user vs. returning user)
- Contact form wiring (bonus)

### Success Criteria

- New users see the chatbot onboarding after first sign-in
- Chatbot asks about travel preferences step-by-step
- Chatbot suggests matching destinations from the database
- User can create a trip from chatbot suggestions
- Onboarding sets `onboarding_completed = true` on profile
- Returning users see a personalized dashboard
- Dashboard shows upcoming trips, quick stats, trending, events
- Contact form sends data to an API endpoint (stored in DB or logged)

### Dependencies

Epics 1-4 should be complete (auth, destinations, trips all working).

---

## Story Map - Epic 5

```
5.1 Chat API route (streaming)
        ↓
5.2 OnboardingChat + ChatMessage components
        ↓
5.3 Onboarding flow (prefs → suggestions → trip)
        ↓
5.4 Homepage dashboard
        ↓
5.5 Contact form wiring
```

---

## Stories - Epic 5

### Story 5.1: Chat API Route (Streaming)

As a developer,
I want a streaming chat API endpoint powered by OpenAI,
So that the chatbot can have real-time conversations with users.

**Acceptance Criteria:**

**Given** a POST request to `/api/chat` with messages array
**When** the request is processed
**Then** a streaming text response is returned from GPT-4o-mini

**And** the system prompt includes available destinations from the database
**And** the system prompt includes user preferences (if available)
**And** the response streams incrementally (not blocked until complete)

**Prerequisites:** Epic 1 (Supabase + env vars with OPENAI_API_KEY)

**Technical Notes:**
- `app/api/chat/route.ts`
- Install: `pnpm add ai @ai-sdk/openai`
- Use `streamText()` from Vercel AI SDK
- Load destinations from Supabase for system prompt context
- See tech-spec.md for full implementation code

**Estimated Effort:** 2 points (~1 hour)

---

### Story 5.2: OnboardingChat + ChatMessage Components

As a new user,
I want a friendly chat interface to plan my trip,
So that I can discover destinations through conversation.

**Acceptance Criteria:**

**Given** I am on the onboarding page (`/onboarding`)
**When** the page loads
**Then** I see a chat interface with WanderBot's welcome message

**And** I can type messages and see streaming responses appear in real time
**And** messages are styled as chat bubbles (user on right, assistant on left)
**And** a typing indicator shows while the assistant is responding
**And** the chat auto-scrolls to the latest message
**And** I can press Enter to send a message

**Prerequisites:** Story 5.1

**Technical Notes:**
- `app/components/OnboardingChat.tsx` — uses `useChat()` hook from `ai/react`
- `app/components/ChatMessage.tsx` — individual message bubble component
- `app/onboarding/page.tsx` — onboarding page (protected, redirects if already onboarded)
- Style with Tailwind: blue bubbles for user, gray for assistant
- Use lucide-react Bot icon for assistant avatar

**Estimated Effort:** 3 points (~2 hours)

---

### Story 5.3: Onboarding Flow — Preferences to Trip Creation

As a new user,
I want the chatbot to help me set preferences and create my first trip,
So that I get a personalized experience from the start.

**Acceptance Criteria:**

**Given** I complete the chatbot conversation (travel style, climate, budget, dates)
**When** the chatbot suggests destinations and I confirm
**Then** my preferences are saved to `user_profiles`

**And** a trip is auto-created with the selected destinations
**And** `onboarding_completed` is set to true on my profile
**And** I am redirected to the dashboard after onboarding
**And** chat session is saved to `chat_sessions` table

**Prerequisites:** Stories 5.2, 4.1 (trips API)

**Technical Notes:**
- Parse structured JSON output from chatbot (action: "create_trip")
- Call trips API to create the trip
- Update user_profiles with preferences via Supabase
- Save chat messages to chat_sessions for history
- Handle edge case: user closes onboarding early → don't mark as completed

**Estimated Effort:** 3 points (~2 hours)

---

### Story 5.4: Homepage Dashboard

As a returning user,
I want a personalized dashboard when I open the app,
So that I can quickly access my trips and discover new destinations.

**Acceptance Criteria:**

**Given** I am signed in and have completed onboarding
**When** I visit the homepage (`/`)
**Then** I see a dashboard with: welcome message, quick stats, upcoming trips, suggested destinations, trending destinations, upcoming events

**And** the "Plan New Trip" button navigates to `/locations`
**And** clicking a trip card navigates to `/trip-planning?trip=[id]`
**And** if I have no trips, I see an encouraging empty state with CTA
**And** if I am NOT signed in, I see the original hero landing page

**Prerequisites:** Stories 5.3, 3.7 (trending API)

**Technical Notes:**
- Modify `app/page.tsx` — conditional rendering based on auth state
- `app/components/DashboardStats.tsx` — trip count, destinations visited, total days
- `app/components/TripCard.tsx` — compact trip summary card
- Server component for data fetching (parallel Supabase queries)
- See tech-spec.md dashboard layout wireframe

**Estimated Effort:** 3 points (~2 hours)

---

### Story 5.5: Contact Form Wiring

As a user,
I want the contact form to actually submit my message,
So that I can reach the WanderGuide team.

**Acceptance Criteria:**

**Given** I fill out the contact form (name, email, message)
**When** I click Submit
**Then** the form data is sent to an API endpoint

**And** I see a success toast notification ("Message sent!")
**And** the form resets after successful submission
**And** validation prevents empty submissions
**And** the data is stored in a `contact_messages` table (or logged to console as a fallback)

**Prerequisites:** Epic 1

**Technical Notes:**
- `app/api/contact/route.ts` — POST endpoint
- Option A: Store in a `contact_messages` table (add migration)
- Option B: Console.log for now (simplest — can add email service later)
- Modify `app/contact/page.tsx` — add `onSubmit` handler with fetch
- Use `sonner` toast for success/error feedback (already installed)

**Estimated Effort:** 2 points (~1 hour)

---

## Implementation Timeline - Epic 5

**Total Story Points:** 13
**Estimated Timeline:** 2-3 days

---

## Full Project Summary

| Epic | Stories | Points | Est. Time |
|---|---|---|---|
| 1. Foundation Setup | 5 | 10 | 1-2 days |
| 2. Auth Module | 4 | 8 | 1-2 days |
| 3. Destination Selection | 7 | 12 | 2-3 days |
| 4. Trip Planning | 5 | 13 | 2-3 days |
| 5. Chatbot & Dashboard | 5 | 13 | 2-3 days |
| **Total** | **26** | **56** | **8-13 days** |

---

## Tech-Spec Reference

See [tech-spec.md](./tech-spec.md) for complete technical implementation details including:
- Full SQL schemas (CSV-aligned)
- API route implementations
- TypeScript interfaces
- Middleware code
- Seed data strategy
- Deployment guide

See [data-mapping.md](./data-mapping.md) for:
- CSV → Database column mappings
- Interest → Category enum mapping
- State → Region lookup
- Data flow diagram (CSV → Supabase → API → UI)

See [sprint-plan.md](./sprint-plan.md) for:
- 5-sprint timeline (13 days)
- Sprint deliverables and dependencies
- Critical path analysis
- Risk register
