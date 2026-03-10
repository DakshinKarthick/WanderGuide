# WanderGuide — Data Mapping: CSV → Database → API → UI

**Date:** 2026-03-10

---

## Source Datasets

| # | File | Rows | Description |
|---|---|---|---|
| 1 | `data/indian-cities.csv` | 214 | Indian city coordinates + state |
| 2 | `data/tourist-destinations.csv` | 326 | Top tourist attractions with ratings, fees, types |
| 3 | `data/tourism-atlas.csv` | 1020 | Broad tourism atlas with lat/long, interest categories, ratings |

### Data Quality Notes

- **State spelling inconsistencies** in tourism-atlas.csv: `Maharastra` / `Maharashtra` / `Maharahtra`, `Gujrat` / `Gujarat`, `Karanataka` / `Karnataka`, `Kerala` / `Kerala ` (trailing space)
- **Overlapping records**: tourist-destinations.csv and tourism-atlas.csv share ~250 common places (e.g., India Gate, Red Fort, Gateway of India). Tourism-atlas has lat/long; tourist-destinations has richer metadata (visit duration, entrance fee, weekly off, DSLR policy).
- **Interest categories** in tourism-atlas use multi-value strings (comma-separated) — need to be split into tags array.
- **Seed script must normalize** state names and deduplicate by matching `name + city`.

---

## Database Schema: 5 Core Tables + 2 Support Tables

### Table 1: `cities`

**Source:** `indian-cities.csv` (214 rows, loaded directly)

```sql
CREATE TABLE public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  region TEXT NOT NULL CHECK (region IN ('north', 'south', 'east', 'west', 'central', 'northeast')),
  latitude NUMERIC(10,7) NOT NULL,
  longitude NUMERIC(10,7) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Public read
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cities are publicly readable" ON public.cities FOR SELECT USING (true);

CREATE INDEX idx_cities_state ON public.cities(state);
CREATE INDEX idx_cities_region ON public.cities(region);
CREATE UNIQUE INDEX idx_cities_name_state ON public.cities(name, state);
```

**CSV → Column Mapping:**

| CSV Column | DB Column | Transform |
|---|---|---|
| `City` | `name` | Trim whitespace |
| `State` | `state` | Trim whitespace |
| _(derived)_ | `region` | Map state → region (see lookup below) |
| `Lat` | `latitude` | Direct |
| `Long` | `longitude` | Direct |

**State → Region Lookup:**

| Region | States |
|---|---|
| `north` | Delhi, Haryana, Himachal Pradesh, Jammu and Kashmir, Ladakh, Punjab, Rajasthan, Uttarakhand |
| `south` | Andhra Pradesh, Karnataka, Kerala, Tamil Nadu, Telangana, Puducherry |
| `east` | Bihar, Jharkhand, Odisha, West Bengal |
| `west` | Goa, Gujarat, Maharashtra, Daman and Diu |
| `central` | Chhattisgarh, Madhya Pradesh, Uttar Pradesh |
| `northeast` | Arunachal Pradesh, Assam, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, Tripura |

---

### Table 2: `destinations`

**Source:** Merge of `tourist-destinations.csv` + `tourism-atlas.csv`

Strategy: Use tourism-atlas.csv as base (has lat/long per attraction). Enrich matching records with metadata from tourist-destinations.csv (visit duration, entrance fee, weekly off, DSLR allowed, significance, establishment year, review count).

```sql
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
  establishment_year TEXT,             -- Can be "Unknown" or year
  has_airport_nearby BOOLEAN DEFAULT FALSE,
  dslr_allowed BOOLEAN DEFAULT TRUE,
  review_count_lakhs NUMERIC(4,2),     -- Google review count in lakhs
  image_url TEXT NOT NULL DEFAULT '/placeholder.svg',
  tags TEXT[] DEFAULT '{}',            -- Derived from interest categories
  trending_score INTEGER DEFAULT 0,    -- Computed from rating + review count
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

**CSV → Column Mapping (tourism-atlas.csv):**

| CSV Column | DB Column | Transform |
|---|---|---|
| `popular_destination` | `name` | Trim |
| `city` | `city` | Trim |
| `state` | `state` | Normalize spelling |
| _(derived)_ | `region` | State → region lookup |
| `interest` | `category` | Map interest → category enum (see below) |
| `interest` | `tags` | Split comma-separated → array |
| `latitude` | `latitude` | Direct |
| `longitude` | `longitude` | Direct |
| `google_rating` | `rating` | Direct |
| `price_fare` | `entrance_fee` | Direct |

**Enrichment from tourist-destinations.csv (matched on name + city):**

| CSV Column | DB Column |
|---|---|
| `Type` | `type` |
| `time needed to visit in hrs` | `visit_duration_hours` |
| `Best Time to visit` | `best_time_to_visit` |
| `Weekly Off` | `weekly_off` |
| `Significance` | `significance` |
| `Establishment Year` | `establishment_year` |
| `Airport with 50km Radius` | `has_airport_nearby` (> 0 = true) |
| `DSLR Allowed` | `dslr_allowed` (Yes/No) |
| `Number of google review in lakhs` | `review_count_lakhs` |

**Interest → Category Mapping:**

| Interest String (tourism-atlas.csv) | `category` Enum |
|---|---|
| `Cultural & Heritage Sites` | `cultural-heritage` |
| `Cultural & Heritage` | `cultural-heritage` |
| `Religious & Spiritual Pilgrimages` | `religious` |
| `Natural Landscapes & Wildlife` | `nature-wildlife` |
| `Adventure & Outdoor Activities` | `adventure` |
| `Adventure & Outdoor` | `adventure` |
| `Arts, Science & Literature Attractions` | `arts-science` |
| `Shopping & Markets` | `shopping` |
| `Sightseeing & Exploration` | `sightseeing` |
| `Culinary & Food Experiences` | `culinary` |
| `Sports & Recreation` | `sports-recreation` |

For multi-category records (e.g., `"Natural Landscapes & Wildlife, Adventure & Outdoor Activities"`), the **first** interest maps to `category`, and all interests go into `tags[]`.

**Trending Score Computation:**

```
trending_score = ROUND(rating * 20) + COALESCE(review_count_lakhs * 10, 0)
```

This gives a 0-100 range score combining quality (rating) and popularity (review volume).

---

### Table 3: `events`

**Source:** Manually curated (real Indian festivals/events with actual dates)

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

---

### Table 4: `trips`

**Source:** User-generated (app runtime)

```sql
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My India Trip',
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'upcoming', 'active', 'completed', 'cancelled')),
  total_budget INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own trips" ON public.trips FOR ALL USING (auth.uid() = user_id);
```

---

### Table 5: `trip_stops`

**Source:** User-generated (app runtime)

```sql
CREATE TABLE public.trip_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  destination_id UUID NOT NULL REFERENCES public.destinations(id),
  stop_order INTEGER NOT NULL,
  days_allocated INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.trip_stops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own trip stops" ON public.trip_stops
  FOR ALL USING (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()));
```

---

### Support Table: `user_profiles`

```sql
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

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own profile" ON public.user_profiles FOR ALL USING (auth.uid() = id);
```

---

### Support Table: `chat_sessions`

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
CREATE POLICY "Users manage own chats" ON public.chat_sessions FOR ALL USING (auth.uid() = user_id);
```

---

## Data Flow: CSV → Database → API → UI

```
┌──────────────────────────────────────────────────────────────┐
│                     SOURCE DATASETS                          │
│  data/indian-cities.csv ──────────────► cities (214 rows)    │
│  data/tourist-destinations.csv ──┐                           │
│  data/tourism-atlas.csv ─────────┴────► destinations (~1000) │
│  (manually curated) ─────────────────► events (~15)          │
└──────────────────────────────┬───────────────────────────────┘
                               │ supabase/seed.sql
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                   SUPABASE TABLES                            │
│  cities ─────── destinations ─────── events                  │
│                      │                                       │
│            trips ◄───┘ (destination_id FK)                   │
│              │                                               │
│         trip_stops                                           │
│                                                              │
│  user_profiles ─── chat_sessions                             │
└──────────────────────────────┬───────────────────────────────┘
                               │ Next.js API Routes
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                  API ROUTES → QUERIES                        │
│                                                              │
│  GET /api/destinations                                       │
│    → SELECT * FROM destinations WHERE state = ? / region = ? │
│    → Used by: SearchBar, Filters, DestinationGrid            │
│                                                              │
│  GET /api/destinations/[id]                                  │
│    → SELECT * FROM destinations WHERE id = ?                 │
│    → Used by: DestinationModal                               │
│                                                              │
│  GET /api/trending                                           │
│    → SELECT * FROM destinations ORDER BY trending_score DESC │
│    → Used by: TrendingLocations, Dashboard                   │
│                                                              │
│  GET /api/events                                             │
│    → SELECT * FROM events WHERE event_date >= NOW()          │
│    → Used by: Dashboard                                      │
│                                                              │
│  POST /api/chat                                              │
│    → Loads destinations into system prompt                   │
│    → AI generates itinerary from real data                   │
│    → SELECT * FROM destinations WHERE state = 'Rajasthan'    │
│    → Used by: ChatBot, OnboardingChat                        │
│                                                              │
│  GET/POST /api/trips                                         │
│    → CRUD user trips + stops                                 │
│    → Used by: MultiStopPlanner, TripCard, Dashboard          │
│                                                              │
│  GET /api/trips/[id]                                         │
│    → Trip with stops + destination coordinates               │
│    → Used by: trip-planning, trip-map (Leaflet markers)      │
└──────────────────────────────┬───────────────────────────────┘
                               │ React hooks
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                  REACT COMPONENTS                            │
│                                                              │
│  SearchBar.tsx ← useDestinations({search})                   │
│  Filters.tsx ← onChange → parent state → useDestinations     │
│  DestinationGrid.tsx ← destinations[] from hook              │
│  DestinationModal.tsx ← single destination detail            │
│  TrendingLocations.tsx ← trending destinations from API      │
│  MultiStopPlanner.tsx ← useTrips() CRUD                     │
│  TripCard.tsx ← trip summary from useTrips()                 │
│  DashboardStats.tsx ← computed from trips[]                  │
│  ChatBot.tsx ← useChat() → /api/chat (streaming)            │
│  OnboardingChat.tsx ← useChat() + trip creation              │
│  trip-map/page.tsx ← trip stops coordinates → Leaflet        │
│  Header.tsx ← useAuth() → UserMenu or Sign In buttons       │
└──────────────────────────────────────────────────────────────┘
```

---

## Example User Flow with Real Data

**User:** "Plan a 5-day trip to Rajasthan"

```
1. Chatbot receives prompt
2. Server queries: SELECT * FROM destinations WHERE state = 'Rajasthan' LIMIT 10
3. Returns: Jaipur (City Palace, Amber Fort, Albert Hall Museum, Hawa Mahal),
            Udaipur, Jodhpur, Pushkar, Mount Abu, Jaisalmer...
4. AI generates itinerary:
   Day 1: Jaipur – City Palace (Rating: 4.4, ₹200 entry)
   Day 2: Jaipur – Amber Fort (Rating: 4.5, ₹500 entry)
   Day 3: Udaipur – City Palace + Lake Pichola
   Day 4: Jodhpur – Mehrangarh Fort
   Day 5: Pushkar – Brahma Temple
5. User confirms → trip created with 5 stops
6. Trip map shows: Jaipur → Udaipur → Jodhpur → Pushkar
   (coordinates from destinations table)
```

---

## Seed Script Strategy

The seed script (`supabase/seed.sql`) will:

1. **Load cities** from `indian-cities.csv` into `cities` table with derived `region`
2. **Load destinations** from `tourism-atlas.csv` (primary) with lat/long
3. **Enrich destinations** with metadata from `tourist-destinations.csv` where `name + city` matches
4. **Normalize state names** (fix Maharastra→Maharashtra, Gujrat→Gujarat, etc.)
5. **Compute trending_score** from `rating * 20 + review_count_lakhs * 10`
6. **Insert events** with real Indian festival dates for 2026-2027
7. **Set image_url** to relevant Unsplash URLs per category

### Expected Record Counts

| Table | Records | Source |
|---|---|---|
| `cities` | ~214 | indian-cities.csv |
| `destinations` | ~1000 | tourism-atlas.csv + tourist-destinations enrichment |
| `events` | ~15 | Manually curated Indian festivals |
| `trips` | 0 | User-generated at runtime |
| `trip_stops` | 0 | User-generated at runtime |
| `user_profiles` | 0 | Auto-created on signup via trigger |
| `chat_sessions` | 0 | Created during chatbot conversations |
