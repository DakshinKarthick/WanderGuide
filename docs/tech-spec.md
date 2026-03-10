# WanderGuide - Technical Specification

**Author:** BMad
**Date:** 2026-03-10
**Project Level:** 2 (Medium Project — BMad Method Brownfield)
**Change Type:** Feature Addition — Backend + Frontend Integration
**Development Context:** Brownfield — Existing Next.js 15 frontend prototype

---

## Context

### Available Documents

| Document | Status | Key Insights |
|---|---|---|
| [docs/index.md](../index.md) | Complete | Master index for all project documentation |
| [docs/architecture.md](../architecture.md) | Complete | Current frontend-only architecture |
| [docs/component-inventory.md](../component-inventory.md) | Complete | All 9 app components + 30+ UI primitives |
| [docs/gap-analysis.md](../gap-analysis.md) | Complete | 10+ critical missing features identified |
| [docs/source-tree-analysis.md](../source-tree-analysis.md) | Complete | Full annotated directory tree |

### Project Stack

| Layer | Current | Adding |
|---|---|---|
| Framework | Next.js 15.2.4 (App Router) | Next.js API Routes (`route.ts`) |
| Runtime | React 19 + TypeScript 5.8 | — |
| Backend | **None** | Supabase (PostgreSQL + Auth + Storage) |
| Database | **None** (localStorage) | Supabase PostgreSQL + Row Level Security |
| Auth | **None** (dead buttons) | Supabase Auth (Google OAuth + Email) |
| Storage | **None** (`/placeholder.svg`) | Supabase Storage (destination images) |
| Styling | Tailwind CSS 3.4 + shadcn/ui | — |
| DnD | @hello-pangea/dnd | — |
| Maps | react-leaflet + leaflet | — |
| AI/Chat | **None** | Vercel AI SDK + OpenAI API (chatbot onboarding) |
| State | React useState + localStorage | React Context + Supabase real-time |

### Existing Codebase Structure

```
app/
├── layout.tsx          ← Root layout (Header, Footer, ThemeProvider)
├── page.tsx            ← Home (static hero — WILL BE REPLACED)
├── components/         ← 9 app components (WILL BE REFACTORED)
│   ├── Header.tsx      ← Has dead auth buttons — WILL BE WIRED
│   ├── SearchBar.tsx   ← 5 hardcoded suggestions — WILL CONNECT TO DB
│   ├── Filters.tsx     ← Disconnected state — WILL CONNECT
│   ├── DestinationGrid.tsx  ← 6 hardcoded items — WILL FETCH FROM DB
│   ├── DestinationModal.tsx ← Fallback data — WILL USE REAL DATA
│   ├── MultiStopPlanner.tsx ← Working DnD — WILL PERSIST TO DB
│   └── TrendingLocations.tsx ← Hardcoded — WILL FETCH FROM DB
├── locations/page.tsx  ← Core browsing — WILL USE API
├── trip-planning/page.tsx ← localStorage — WILL USE DB
├── trip-map/page.tsx   ← Hardcoded route — WILL READ FROM TRIP
├── about|contact|faq|privacy|terms  ← Static pages — MINIMAL CHANGES
```

---

## The Change

### Problem Statement

WanderGuide is a frontend-only prototype with **zero backend infrastructure**. All destination data is hardcoded (6 items), search matches 5 strings, filters are disconnected, auth buttons do nothing, the map shows a fixed route, and trip data lives only in localStorage. Users cannot sign in, save trips, get personalized suggestions, or have a meaningful trip planning experience.

### Proposed Solution

Build 5 core modules that transform WanderGuide from a static prototype into a functional, data-driven travel planning app:

1. **Sign-in Module** — Supabase Auth with Google OAuth + email/password
2. **Chatbot Onboarding** — AI-powered conversational trip planner using Vercel AI SDK
3. **Homepage Dashboard** — Personalized dashboard with trips, saved itineraries, quick actions
4. **Destination Selection** — Database-backed destinations with search, filters, trending, events
5. **Trip Duration Module** — Calendar-based trip planning with persistence to Supabase

Data will be loaded from **3 real CSV datasets** (`data/indian-cities.csv`, `data/tourist-destinations.csv`, `data/tourism-atlas.csv`) providing ~214 cities and ~1000 tourist destinations with real coordinates, ratings, and categories — designed to be swappable with a real data source later. See [data-mapping.md](./data-mapping.md) for the complete CSV → Database → API → UI data flow.

### Scope

**In Scope:**

- Supabase project setup (Auth, Database, Storage)
- Database schema design (cities, destinations, events, trips, trip_stops, user_profiles, chat_sessions)
- CSV seed pipeline: `indian-cities.csv` → cities, `tourism-atlas.csv` + `tourist-destinations.csv` → destinations (~1000 records)
- Google OAuth + email/password authentication flow
- Protected routes and session management
- AI chatbot for guided trip planning (Vercel AI SDK + OpenAI)
- Personalized homepage dashboard
- Database-backed destination browsing with search + filters
- Trip CRUD with Supabase persistence (replace localStorage)
- Connect map to user's actual trip stops
- TypeScript interfaces for all data models
- Connect existing UI components to real data

**Out of Scope:**

- Payment processing
- Hotel/flight booking integrations
- User reviews/ratings system (read-only ratings in seed data)
- Push notifications
- Native mobile app
- Multi-language (i18n)
- Admin panel / CMS
- Full test suite (basic smoke tests only)
- CI/CD pipeline
- Analytics/tracking

---

## Implementation Details

### Source Tree Changes

```
app/
├── layout.tsx                    ← MODIFY: Add AuthProvider, ChatProvider
├── page.tsx                      ← REPLACE: New dashboard homepage
├── globals.css                   ← MODIFY: Add chat UI styles
├── api/                          ← NEW: API routes directory
│   ├── destinations/
│   │   └── route.ts              ← NEW: GET destinations (search/filter/paginate)
│   ├── destinations/[id]/
│   │   └── route.ts              ← NEW: GET single destination detail
│   ├── trips/
│   │   └── route.ts              ← NEW: GET/POST trips (list/create)
│   ├── trips/[id]/
│   │   └── route.ts              ← NEW: GET/PUT/DELETE trip
│   ├── trending/
│   │   └── route.ts              ← NEW: GET trending destinations + events
│   ├── chat/
│   │   └── route.ts              ← NEW: POST AI chat completions (streaming)
│   └── contact/
│       └── route.ts              ← NEW: POST contact form submission
├── auth/
│   ├── login/
│   │   └── page.tsx              ← NEW: Login page (Google + email)
│   ├── register/
│   │   └── page.tsx              ← NEW: Register page
│   └── callback/
│       └── route.ts              ← NEW: OAuth callback handler (code exchange)
├── components/
│   ├── Header.tsx                ← MODIFY: Real auth state, user menu
│   ├── SearchBar.tsx             ← MODIFY: Debounced API search
│   ├── Filters.tsx               ← MODIFY: Connected to parent via callbacks
│   ├── DestinationGrid.tsx       ← MODIFY: Fetch from API, loading states
│   ├── DestinationModal.tsx      ← MODIFY: Use real destination data
│   ├── MultiStopPlanner.tsx      ← MODIFY: Persist to Supabase
│   ├── TrendingLocations.tsx     ← MODIFY: Fetch from API
│   ├── ChatMessage.tsx           ← NEW: Individual chat message bubble
│   ├── AuthGuard.tsx             ← NEW: Protected route wrapper
│   ├── UserMenu.tsx              ← NEW: Dropdown with profile/logout
│   ├── TripCard.tsx              ← NEW: Trip summary card for dashboard
│   ├── DashboardStats.tsx        ← NEW: Quick stats (trips, destinations visited)
│   └── OnboardingChat.tsx        ← NEW: Chatbot onboarding flow (includes ChatBot UI)
├── dashboard/
│   └── page.tsx                  ← NEW: User dashboard (replaces old home for logged-in)
├── onboarding/
│   └── page.tsx                  ← NEW: Chatbot onboarding page
├── locations/page.tsx            ← MODIFY: Connect to API, filters, search
├── trip-planning/page.tsx        ← MODIFY: Supabase persistence
├── trip-map/page.tsx             ← MODIFY: Read from user's trip data
├── contact/page.tsx              ← MODIFY: Wire up form submission
lib/
├── supabase/
│   ├── client.ts                 ← NEW: Supabase browser client
│   ├── server.ts                 ← NEW: Supabase server client (for API routes)
│   ├── middleware.ts             ← NEW: Auth middleware helper
│   └── types.ts                  ← NEW: Generated Supabase types
├── types/
│   ├── destination.ts            ← NEW: Destination, Region, Category types
│   ├── trip.ts                   ← NEW: Trip, TripStop, DayAllocation types
│   ├── user.ts                   ← NEW: UserProfile, UserPreferences types
│   └── chat.ts                   ← NEW: ChatMessage, ChatSession types
├── hooks/
│   ├── useAuth.ts                ← NEW: Auth state hook
│   ├── useDestinations.ts        ← NEW: Destination fetching hook
│   ├── useTrips.ts               ← NEW: Trip CRUD hook
│   └── useChat.ts                ← NEW: Chat interaction hook
├── utils.ts                      ← KEEP: Existing cn() utility
└── constants.ts                  ← NEW: App constants, regions, categories
middleware.ts                     ← NEW: Next.js middleware for auth redirects
supabase/
├── migrations/
│   ├── 001_create_cities.sql         ← NEW: Cities table + RLS
│   ├── 002_create_destinations.sql   ← NEW: Destinations table + RLS (CSV-aligned)
│   ├── 003_create_events.sql         ← NEW: Events table + RLS
│   ├── 004_create_trips.sql          ← NEW: Trips + stops tables + RLS
│   ├── 005_create_user_profiles.sql  ← NEW: User profiles table + trigger
│   └── 006_create_chat_sessions.sql  ← NEW: Chat history table + RLS
├── seed.sql                          ← NEW: CSV-loaded ~214 cities + ~1000 destinations + ~15 events
└── config.toml                       ← NEW: Supabase local dev config
data/
├── indian-cities.csv                 ← SOURCE: 214 Indian cities with lat/long
├── tourist-destinations.csv          ← SOURCE: 326 top tourist attractions (metadata-rich)
└── tourism-atlas.csv                 ← SOURCE: 1020 tourism places (lat/long + interest categories)
.env.local                           ← NEW: Supabase keys (gitignored)
```

### Technical Approach

#### Module 1: Sign-in Module

**Technology:** Supabase Auth with `@supabase/ssr` for Next.js App Router

**Authentication Flows:**
- **Google OAuth:** `supabase.auth.signInWithOAuth({ provider: 'google' })` → redirect to Google → callback at `/auth/callback` → session cookie set → redirect to dashboard
- **Email/Password:** `supabase.auth.signUp()` / `supabase.auth.signInWithPassword()` → session cookie → redirect
- **Session Management:** Supabase handles JWT tokens; `@supabase/ssr` manages cookies via Next.js middleware
- **Protected Routes:** Next.js `middleware.ts` checks session on every request to protected paths

**User Profile Extension:**
```sql
-- Extends Supabase auth.users with app-specific profile
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  travel_style TEXT CHECK (travel_style IN ('adventure', 'relaxation', 'culture', 'luxury', 'budget', 'family')),
  preferred_climate TEXT CHECK (preferred_climate IN ('tropical', 'temperate', 'cold', 'desert', 'any')),
  preferred_budget TEXT CHECK (preferred_budget IN ('budget', 'mid-range', 'luxury', 'any')),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Users can only read/update their own profile
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own profile" ON public.user_profiles
  FOR ALL USING (auth.uid() = id);

-- Auto-create profile on signup via trigger
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Header Integration:**
```typescript
// Header.tsx — replace dead buttons with real auth
const { user, signOut } = useAuth();

{user ? (
  <UserMenu user={user} onSignOut={signOut} />
) : (
  <>
    <Link href="/auth/login"><Button variant="outline">Sign In</Button></Link>
    <Link href="/auth/register"><Button>Register</Button></Link>
  </>
)}
```

#### Module 2: Chatbot Onboarding

**Technology:** Vercel AI SDK (`ai` package) + OpenAI GPT-4o-mini

**Architecture:**
```
User ←→ OnboardingChat.tsx ←→ /api/chat (route.ts) ←→ OpenAI API
                                    ↓
                            System prompt with:
                            - Indian destinations context
                            - User preferences (from profile)
                            - Structured output extraction
```

**System Prompt Strategy:**
The chatbot acts as a friendly travel advisor for India. It asks step-by-step questions:
1. Travel style (adventure/relaxation/culture/luxury/budget/family)
2. Preferred climate/season
3. Travel dates + duration
4. Budget range
5. Number of travelers
6. Any specific interests (temples, beaches, mountains, food, wildlife)

After gathering preferences, it suggests 3-5 matching destinations from the database and offers to create a trip itinerary.

**Chat API Route:**
```typescript
// app/api/chat/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { messages } = await req.json();
  
  // Load destinations for context
  const { data: destinations } = await supabase
    .from('destinations')
    .select('name, state, region, category, description, best_time, avg_cost_per_day');
  
  // Load user preferences if they exist
  const { data: profile } = user 
    ? await supabase.from('user_profiles').select('*').eq('id', user.id).single()
    : { data: null };

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: `You are WanderBot, a friendly Indian travel planning assistant.
    
Available destinations: ${JSON.stringify(destinations)}

${profile ? `User preferences: Travel style: ${profile.travel_style}, Climate: ${profile.preferred_climate}, Budget: ${profile.preferred_budget}` : ''}

Guide the user step-by-step to plan their perfect India trip. Ask about:
1. Travel style and interests
2. Preferred climate/region  
3. Dates and duration
4. Budget range
5. Group size

After gathering preferences, suggest 3-5 matching destinations with reasons.
When the user confirms destinations, output a JSON block with:
{"action": "create_trip", "destinations": [...ids], "dates": {...}, "budget": "..."}

Keep responses concise, warm, and enthusiastic about Indian travel.`,
    messages,
  });

  return result.toDataStreamResponse();
}
```

**Chat UI Component:**
```typescript
// app/components/OnboardingChat.tsx
'use client';
import { useChat } from 'ai/react';
import { ChatMessage } from './ChatMessage';

export function OnboardingChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });
  
  // Parse assistant messages for structured actions (create_trip)
  // Auto-create trip when user confirms chatbot suggestions
}
```

**Chat Session Persistence:**
```sql
CREATE TABLE public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]',
  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own chats" ON public.chat_sessions
  FOR ALL USING (auth.uid() = user_id);
```

#### Module 3: Homepage Dashboard

**Behavior:**
- **Logged out:** Show the current hero page with CTA to sign in + explore destinations
- **Logged in + not onboarded:** Redirect to chatbot onboarding
- **Logged in + onboarded:** Show personalized dashboard

**Dashboard Layout:**
```
┌─────────────────────────────────────────────────┐
│ Welcome back, {name}!                    [Plan] │
├─────────────┬───────────────────────────────────┤
│ Quick Stats │ Upcoming Trips                    │
│ • 3 trips   │ ┌─────────┐ ┌─────────┐          │
│ • 12 dest   │ │ Trip 1  │ │ Trip 2  │ +New     │
│ • 24 days   │ └─────────┘ └─────────┘          │
├─────────────┴───────────────────────────────────┤
│ Suggested For You (based on preferences)        │
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐                        │
│ │ D │ │ D │ │ D │ │ D │                        │
│ └───┘ └───┘ └───┘ └───┘                        │
├─────────────────────────────────────────────────┤
│ Trending Now          │ Upcoming Events         │
│ • Goa (↑ 12%)        │ • Diwali - Nov 2026     │
│ • Rishikesh (↑ 8%)   │ • Holi - Mar 2027       │
└─────────────────────────────────────────────────┘
```

**Implementation:**
```typescript
// app/page.tsx — conditional rendering
export default async function HomePage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return <HeroLanding />;           // Current homepage (cleaned up)
  
  const { data: profile } = await supabase
    .from('user_profiles').select('*').eq('id', user.id).single();
  
  if (!profile?.onboarding_completed) {
    redirect('/onboarding');
  }
  
  // Fetch dashboard data in parallel
  const [trips, suggestions, trending, events] = await Promise.all([
    supabase.from('trips').select('*, trip_stops(*, destination:destinations(*))').eq('user_id', user.id).order('start_date', { ascending: true }),
    supabase.from('destinations').select('*').limit(4), // TODO: personalized query based on prefs
    supabase.from('destinations').select('*').order('trending_score', { ascending: false }).limit(5),
    supabase.from('events').select('*').gte('event_date', new Date().toISOString()).order('event_date').limit(5),
  ]);
  
  return <Dashboard user={profile} trips={trips.data} suggestions={suggestions.data} trending={trending.data} events={events.data} />;
}
```

#### Module 4: Destination Selection

**Database Schema (CSV-Aligned):**

See [data-mapping.md](./data-mapping.md) for complete CSV → DB column mappings.

```sql
-- Cities table (from data/indian-cities.csv — 214 rows)
CREATE TABLE public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  region TEXT NOT NULL CHECK (region IN ('north', 'south', 'east', 'west', 'central', 'northeast')),
  latitude NUMERIC(10,7) NOT NULL,
  longitude NUMERIC(10,7) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cities are publicly readable" ON public.cities FOR SELECT USING (true);
CREATE UNIQUE INDEX idx_cities_name_state ON public.cities(name, state);
CREATE INDEX idx_cities_state ON public.cities(state);
CREATE INDEX idx_cities_region ON public.cities(region);

-- Destinations table (merged from data/tourism-atlas.csv + data/tourist-destinations.csv — ~1000 rows)
CREATE TABLE public.destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  region TEXT NOT NULL CHECK (region IN ('north', 'south', 'east', 'west', 'central', 'northeast')),
  category TEXT NOT NULL CHECK (category IN (
    'cultural-heritage', 'religious', 'nature-wildlife',
    'adventure', 'arts-science', 'shopping',
    'sightseeing', 'culinary', 'sports-recreation'
  )),
  type TEXT,                           -- From tourist-destinations: Fort, Temple, Beach, etc.
  description TEXT NOT NULL DEFAULT '',
  latitude NUMERIC(10,7) NOT NULL,
  longitude NUMERIC(10,7) NOT NULL,
  rating NUMERIC(2,1) NOT NULL DEFAULT 4.0 CHECK (rating >= 1.0 AND rating <= 5.0),
  entrance_fee INTEGER DEFAULT 0,      -- INR
  visit_duration_hours NUMERIC(3,1),   -- Hours recommended
  best_time_to_visit TEXT,             -- Morning, Afternoon, Evening, All
  weekly_off TEXT,                      -- None, Monday, etc.
  significance TEXT,                    -- Historical, Religious, Nature, etc.
  establishment_year TEXT,
  has_airport_nearby BOOLEAN DEFAULT FALSE,
  dslr_allowed BOOLEAN DEFAULT TRUE,
  review_count_lakhs NUMERIC(4,2),
  image_url TEXT NOT NULL DEFAULT '/placeholder.svg',
  tags TEXT[] DEFAULT '{}',            -- Derived from interest categories
  trending_score INTEGER DEFAULT 0,    -- Computed: rating * 20 + review_count * 10
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Destinations are publicly readable" ON public.destinations FOR SELECT USING (true);
CREATE INDEX idx_dest_region ON public.destinations(region);
CREATE INDEX idx_dest_category ON public.destinations(category);
CREATE INDEX idx_dest_city ON public.destinations(city);
CREATE INDEX idx_dest_state ON public.destinations(state);
CREATE INDEX idx_dest_rating ON public.destinations(rating DESC);
CREATE INDEX idx_dest_trending ON public.destinations(trending_score DESC);
```

**Events Table:**
```sql
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  event_date DATE NOT NULL,
  end_date DATE,
  category TEXT CHECK (category IN ('festival', 'cultural', 'music', 'sports', 'food', 'nature')),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events are publicly readable" ON public.events FOR SELECT USING (true);
CREATE INDEX idx_events_date ON public.events(event_date);
CREATE INDEX idx_events_city ON public.events(city);
```

**API Route — Destinations:**
```typescript
// app/api/destinations/route.ts
import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const supabase = await createServerClient();
  const { searchParams } = new URL(req.url);
  
  const search = searchParams.get('search');
  const region = searchParams.get('region');
  const category = searchParams.get('category');
  const sort = searchParams.get('sort') || 'trending_score';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  
  let query = supabase
    .from('destinations')
    .select('*', { count: 'exact' });
  
  if (search) {
    query = query.ilike('name', `%${search}%`);
  }
  if (region && region !== 'all') {
    query = query.eq('region', region);
  }
  if (category && category !== 'all') {
    query = query.eq('category', category);
  }
  
  query = query
    .order(sort, { ascending: sort === 'name' })
    .range((page - 1) * limit, page * limit - 1);
  
  const { data, error, count } = await query;
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  return NextResponse.json({
    destinations: data,
    pagination: { page, limit, total: count, totalPages: Math.ceil((count || 0) / limit) }
  });
}
```

**Frontend Integration (Filters → Grid):**
```typescript
// app/locations/page.tsx — connected filters
const [filters, setFilters] = useState({ region: 'all', category: 'all', search: '' });
const { destinations, isLoading, pagination } = useDestinations(filters);

<Filters value={filters} onChange={setFilters} />
<DestinationGrid 
  destinations={destinations} 
  isLoading={isLoading}
  onDestinationClick={...}
  onAddToTrip={...}
/>
```

#### Module 5: Trip Duration Module

**Database Schema:**
```sql
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My India Trip',
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'upcoming', 'active', 'completed', 'cancelled')),
  total_budget INTEGER,  -- INR
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.trip_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  destination_id UUID NOT NULL REFERENCES public.destinations(id),
  stop_order INTEGER NOT NULL,
  days_allocated INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Users manage only their own trips
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own trips" ON public.trips
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.trip_stops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own trip stops" ON public.trip_stops
  FOR ALL USING (
    trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid())
  );
```

**Trip API Routes:**
```typescript
// app/api/trips/route.ts
export async function GET(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { data, error } = await supabase
    .from('trips')
    .select('*, trip_stops(*, destination:destinations(*))')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });
  
  return NextResponse.json({ trips: data });
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const body = await req.json();
  const { name, start_date, end_date, stops } = body;
  
  // Create trip
  const { data: trip, error } = await supabase
    .from('trips')
    .insert({ user_id: user.id, name, start_date, end_date })
    .select()
    .single();
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  // Create stops
  if (stops?.length) {
    const tripStops = stops.map((stop: any, i: number) => ({
      trip_id: trip.id,
      destination_id: stop.destination_id,
      stop_order: i + 1,
      days_allocated: stop.days || 1,
    }));
    await supabase.from('trip_stops').insert(tripStops);
  }
  
  return NextResponse.json({ trip }, { status: 201 });
}
```

**Trip Planning Page Refactor:**
```typescript
// app/trip-planning/page.tsx — Supabase persistence
'use client';
import { useTrips } from '@/lib/hooks/useTrips';

export default function TripPlanningPage() {
  const { trip, updateTrip, updateStop, isLoading } = useTrips();
  // Replace all localStorage logic with Supabase CRUD
  // Calendar still uses shadcn Calendar + date-fns
  // Day allocation updates write to trip_stops via API
}
```

**Map Integration:**
```typescript
// app/trip-map/page.tsx — use actual trip data
'use client';
import { useTrips } from '@/lib/hooks/useTrips';

export default function TripMapPage() {
  const { trip } = useTrips();
  // Map markers from trip.trip_stops[].destination.{latitude, longitude}
  // Route lines between stops in stop_order
  // No more hardcoded locations
}
```

### Existing Patterns to Follow

| Pattern | Where | How to Follow |
|---|---|---|
| `"use client"` directive | All interactive components | Continue for client components, use server components where possible |
| shadcn/ui imports | `@/components/ui/*` | Use existing Button, Card, Dialog, Input, etc. |
| `cn()` utility | `@/lib/utils` | Continue using for conditional class merging |
| Tailwind theme colors | CSS variables in `globals.css` | Use `bg-primary`, `text-primary`, etc. |
| PascalCase components | `app/components/` | Follow for new components |
| lucide-react icons | Throughout | Use for new icons |

### Integration Points

| From | To | Integration |
|---|---|---|
| Header | Supabase Auth | Real user state, sign out |
| SearchBar | `/api/destinations?search=` | Debounced API search (300ms) |
| Filters | LocationsPage | Callback props → URL params → API query |
| DestinationGrid | `/api/destinations` | Fetch with filters, pagination |
| MultiStopPlanner | `/api/trips` | CRUD trip stops |
| TripPlanningPage | `/api/trips/[id]` | Read/update trip dates + allocations |
| TripMapPage | Trip data (via hook) | Read stops for map markers |
| OnboardingChat | `/api/chat` | Streaming AI responses |
| OnboardingChat | `/api/trips` | Auto-create trip from chat output |
| Dashboard | Multiple APIs | Parallel fetch trips, trending, events |

---

## Development Context

### Dependencies

**New Packages to Install:**

```bash
pnpm add @supabase/supabase-js @supabase/ssr ai @ai-sdk/openai
```

| Package | Version | Purpose |
|---|---|---|
| `@supabase/supabase-js` | ^2.x | Supabase client SDK |
| `@supabase/ssr` | ^0.5.x | Next.js App Router SSR helpers |
| `ai` | ^4.x | Vercel AI SDK (streaming chat) |
| `@ai-sdk/openai` | ^1.x | OpenAI provider for Vercel AI SDK |

**Existing Packages Used:**
- `date-fns` — Date formatting in trip planning
- `@hello-pangea/dnd` — Drag-and-drop in trip stop planner
- `react-leaflet` + `leaflet` — Interactive map
- All shadcn/ui components currently in use

**Packages to Remove:**
- `react-beautiful-dnd` — Replaced by `@hello-pangea/dnd` (already done)

### Configuration Changes

**`.env.local` (new file, gitignored):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-openai-key
```

**`next.config.mjs` changes:**
- Remove `images.unoptimized: true` → use Supabase Storage URLs with Next.js Image optimization
- Add Supabase Storage domain to `images.remotePatterns`

**`middleware.ts` (new file at project root):**
```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );
  
  const { data: { user } } = await supabase.auth.getUser();
  
  // Protect routes that require auth
  const protectedPaths = ['/dashboard', '/trip-planning', '/onboarding'];
  const isProtected = protectedPaths.some(p => request.nextUrl.pathname.startsWith(p));
  
  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
};
```

### Existing Conventions (Brownfield)

| Convention | Current | Maintain? |
|---|---|---|
| Component location | `app/components/` | Yes — keep app components here |
| UI primitives | `components/ui/` | Yes — shadcn standard |
| Hooks | `hooks/` | Yes — add new hooks here |
| Utilities | `lib/utils.ts` | Yes — add `lib/supabase/`, `lib/types/`, `lib/hooks/` |
| Tailwind theming | CSS variables + `dark:` | Yes |
| PascalCase files | Component files | Yes |
| No semicolons in imports | Some files | Standardize to consistent style |

---

## Implementation Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 15.2.4 |
| Language | TypeScript | 5.8.3 |
| Runtime | React | 19 |
| Styling | Tailwind CSS + shadcn/ui | 3.4.17 |
| Database | Supabase (PostgreSQL 15) | Cloud |
| Auth | Supabase Auth | Built-in |
| Storage | Supabase Storage | Built-in |
| AI/Chat | Vercel AI SDK + OpenAI GPT-4o-mini | ai@4.x |
| Maps | react-leaflet + Leaflet | Existing |
| DnD | @hello-pangea/dnd | Existing |
| Date | date-fns | 4.1.0 |

---

## Technical Details

### TypeScript Interfaces

```typescript
// lib/types/destination.ts
export type Region = 'north' | 'south' | 'east' | 'west' | 'central' | 'northeast';
export type Category = 'cultural-heritage' | 'religious' | 'nature-wildlife' | 'adventure' | 'arts-science' | 'shopping' | 'sightseeing' | 'culinary' | 'sports-recreation';

export interface City {
  id: string;
  name: string;
  state: string;
  region: Region;
  latitude: number;
  longitude: number;
}

export interface Destination {
  id: string;
  name: string;
  city: string;
  state: string;
  region: Region;
  category: Category;
  type: string | null;                // Fort, Temple, Beach, etc. (from tourist-destinations.csv)
  description: string;
  latitude: number;
  longitude: number;
  rating: number;
  entrance_fee: number | null;        // INR (NULL if unknown)
  visit_duration_hours: number | null; // Hours recommended
  best_time_to_visit: string | null;   // Morning, Afternoon, Evening, All
  weekly_off: string | null;           // None, Monday, etc.
  significance: string | null;         // Historical, Religious, Nature, etc.
  establishment_year: string | null;
  has_airport_nearby: boolean;
  dslr_allowed: boolean;
  review_count_lakhs: number | null;
  image_url: string;
  tags: string[];                      // Derived from interest categories
  trending_score: number | null;
}

// lib/types/trip.ts
export interface Trip {
  id: string;
  user_id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  status: 'planning' | 'upcoming' | 'active' | 'completed' | 'cancelled';
  total_budget: number | null;
  notes: string | null;
  trip_stops?: TripStop[];
  created_at: string;
  updated_at: string;
}

export interface TripStop {
  id: string;
  trip_id: string;
  destination_id: string;
  destination?: Destination;
  stop_order: number;
  days_allocated: number;
  notes: string | null;
}

// lib/types/user.ts
export interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  travel_style: 'adventure' | 'relaxation' | 'culture' | 'luxury' | 'budget' | 'family' | null;
  preferred_climate: 'tropical' | 'temperate' | 'cold' | 'desert' | 'any' | null;
  preferred_budget: 'budget' | 'mid-range' | 'luxury' | 'any' | null;
  onboarding_completed: boolean;
}

// lib/types/destination.ts (continued)
export interface Event {
  id: string;
  name: string;
  city: string;
  state: string;
  event_date: string;
  description: string;
  category: string;
  image_url: string | null;
  created_at: string;
}

// lib/types/chat.ts
export interface ChatSession {
  id: string;
  user_id: string;
  messages: ChatMessage[];
  trip_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}
```

### Seed Data Strategy

The seed script loads data from **3 real CSV datasets** in the `data/` directory:

| Dataset | File | Records | Purpose |
|---|---|---|---|
| Indian Cities | `data/indian-cities.csv` | 214 | City coordinates + state → `cities` table |
| Tourist Destinations | `data/tourist-destinations.csv` | 326 | Rich metadata (visit duration, fees, weekly off, DSLR) → enriches `destinations` |
| Tourism Atlas | `data/tourism-atlas.csv` | 1020 | Primary destinations with lat/long + interest categories → `destinations` table |

**Seed Pipeline:**
1. Load `indian-cities.csv` → `cities` table (normalize state names, derive region)
2. Load `tourism-atlas.csv` → `destinations` table (map interest → category enum, split → tags[])
3. Enrich destinations with `tourist-destinations.csv` metadata (match on `name + city`)
4. Compute `trending_score = rating * 20 + review_count_lakhs * 10`
5. Insert ~15 manually curated Indian festival events

**Data Quality Normalization:**
- State spelling: `Maharastra` → `Maharashtra`, `Gujrat` → `Gujarat`, `Karanataka` → `Karnataka`
- Trailing whitespace: `Kerala ` → `Kerala`
- Deduplicate on `LOWER(name) + LOWER(city)` when merging

**Interest → Category Mapping:**
| Interest (CSV) | `category` (DB) |
|---|---|
| Cultural & Heritage Sites | `cultural-heritage` |
| Religious & Spiritual Pilgrimages | `religious` |
| Natural Landscapes & Wildlife | `nature-wildlife` |
| Adventure & Outdoor Activities | `adventure` |
| Arts, Science & Literature Attractions | `arts-science` |
| Shopping & Markets | `shopping` |
| Sightseeing & Exploration | `sightseeing` |
| Culinary & Food Experiences | `culinary` |
| Sports & Recreation | `sports-recreation` |

See [data-mapping.md](./data-mapping.md) for the complete CSV → Database → API → UI flow.

**Sample seed events (manually curated):**

| Name | City | State | Date | Category |
|---|---|---|---|---|
| Diwali Festival of Lights | Jaipur | Rajasthan | 2026-10-20 | festival |
| Pushkar Camel Fair | Pushkar | Rajasthan | 2026-11-05 | cultural |
| Hornbill Festival | Kohima | Nagaland | 2026-12-01 | festival |
| Holi Festival | Mathura | Uttar Pradesh | 2027-03-14 | festival |
| Onam | Kochi | Kerala | 2026-09-10 | festival |
| Rann Utsav | Bhuj | Gujarat | 2026-11-01 | cultural |
| Durga Puja | Kolkata | West Bengal | 2026-10-01 | festival |
| Ganesh Chaturthi | Mumbai | Maharashtra | 2026-09-17 | festival |
| Pongal | Madurai | Tamil Nadu | 2027-01-14 | festival |
| Cherry Blossom Festival | Shillong | Meghalaya | 2026-11-15 | nature |
| Ziro Music Festival | Ziro | Arunachal Pradesh | 2026-09-25 | music |
| Kumbh Mela | Allahabad | Uttar Pradesh | 2027-01-13 | festival |
| International Kite Festival | Ahmedabad | Gujarat | 2027-01-14 | cultural |
| Mysore Dasara | Mysore | Karnataka | 2026-10-12 | festival |
| Hemis Festival | Leh | Ladakh | 2026-06-20 | cultural |

---

## Development Setup

### Prerequisites
1. Node.js 18+ and pnpm installed
2. Supabase account (free tier works)
3. OpenAI API key (for chatbot — GPT-4o-mini is very cheap)
4. Google Cloud Console project (for Google OAuth)

### Setup Steps

1. **Create Supabase project** at [supabase.com](https://supabase.com)
2. **Configure Google OAuth** in Supabase Dashboard → Authentication → Providers → Google
3. **Copy environment variables** to `.env.local`
4. **Run migrations** via Supabase SQL Editor or CLI
5. **Run seed script** to populate destinations + events
6. **Install new packages:** `pnpm add @supabase/supabase-js @supabase/ssr ai @ai-sdk/openai`
7. **Start dev server:** `pnpm dev`

---

## Implementation Guide

### Implementation Steps (Recommended Order)

1. **Supabase setup + schema** — Create project, run migrations, seed data
2. **Supabase client libraries** — `lib/supabase/client.ts`, `lib/supabase/server.ts`
3. **TypeScript types** — All interfaces in `lib/types/`
4. **Auth module** — Login/register pages, middleware, Header integration
5. **Destinations API + hooks** — `/api/destinations`, `useDestinations` hook
6. **Connect DestinationGrid + Filters + Search** — Wire existing components to API
7. **Trips API + hooks** — `/api/trips`, `useTrips` hook
8. **Trip planning persistence** — Replace localStorage with Supabase
9. **Map integration** — Read from trip data instead of hardcoded
10. **Chatbot** — `/api/chat`, `OnboardingChat` component
11. **Homepage dashboard** — Conditional rendering, dashboard layout
12. **Polish** — Loading states, error handling, branding consistency

### Acceptance Criteria

- [ ] User can sign in with Google OAuth and email/password
- [ ] User session persists across page refreshes
- [ ] Protected routes redirect to login when not authenticated
- [ ] User profile is auto-created on signup
- [ ] Chatbot guides user through trip preference questions
- [ ] Chatbot suggests destinations based on preferences
- [ ] User can create a trip from chatbot suggestions
- [ ] Logged-in homepage shows personalized dashboard
- [ ] Dashboard displays upcoming trips and quick stats
- [ ] Destination grid loads from database (50+ destinations)
- [ ] Search bar queries destination API with debouncing
- [ ] Region and category filters actually filter the grid
- [ ] Pagination works on destination grid
- [ ] Destination modal shows real data (description, rating, highlights, images)
- [ ] User can add destinations to a trip and reorder via drag-and-drop
- [ ] Trip stops persist to Supabase (not localStorage)
- [ ] Calendar date selection saves to trip record
- [ ] Day allocation per stop saves to trip_stops
- [ ] Map displays user's actual trip route with real coordinates
- [ ] Trending destinations show on dashboard and locations page
- [ ] Upcoming events display with real dates

### Testing Strategy

**Scope:** Basic smoke tests + manual QA (full test suite is out of scope)

- Manual testing of all auth flows (Google, email, logout, session persistence)
- Manual testing of chatbot conversation flow
- Browser testing of destination search, filter, pagination
- Manual testing of trip CRUD (create, read, update, delete)
- Map visual verification with real coordinates
- Mobile responsiveness spot-check

---

## UX/UI Considerations

- **Branding unification:** Standardize all pages to "WanderGuide" name and `#4A67C0`/`#6A87E0` palette
- **Loading states:** Skeleton cards while destinations load, spinner for chat responses
- **Empty states:** "No trips yet — start planning!" with CTA
- **Error states:** Toast notifications via `sonner` (already installed) for API errors
- **Chat UX:** Message bubbles, typing indicator, quick-reply chips for common answers
- **Responsive:** Dashboard stacks to single column on mobile
- **Progressive disclosure:** Don't overwhelm — homepage is clean, details on click

---

## Deployment Strategy

### Deployment Steps
1. Deploy Supabase project (already cloud-hosted)
2. Deploy Next.js to Vercel (`vercel deploy`)
3. Set environment variables in Vercel dashboard
4. Configure Supabase auth redirect URLs for production domain

### Rollback Plan
- Vercel instant rollback to previous deployment
- Supabase migrations can be reverted via SQL

### Monitoring
- Supabase Dashboard for database queries, auth events, storage
- Vercel Analytics for page load performance
- OpenAI usage dashboard for chat API costs

---

_Generated using BMAD Method tech-spec workflow_
