-- WanderGuide: Combined Migrations + Seed
-- Paste this entire file into Supabase SQL Editor and click Run

-- ════════════════════════════════════════════════════════════
-- Migration: 001_create_cities.sql
-- ════════════════════════════════════════════════════════════

-- Migration 001: Cities table
-- Source: data/indian-cities.csv (214 rows)

CREATE TABLE public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  region TEXT NOT NULL CHECK (region IN ('north', 'south', 'east', 'west', 'central', 'northeast')),
  latitude NUMERIC(10,7) NOT NULL,
  longitude NUMERIC(10,7) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Public read access
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cities are publicly readable" ON public.cities FOR SELECT USING (true);

-- Indexes
CREATE INDEX idx_cities_state ON public.cities(state);
CREATE INDEX idx_cities_region ON public.cities(region);
CREATE UNIQUE INDEX idx_cities_name_state ON public.cities(name, state);


-- ════════════════════════════════════════════════════════════
-- Migration: 002_create_destinations.sql
-- ════════════════════════════════════════════════════════════

-- Migration 002: Destinations table
-- Source: Merge of data/tourism-atlas.csv + data/tourist-destinations.csv (~1000 rows)

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
  type TEXT,                           -- Fort, Temple, Beach, etc. (from tourist-destinations.csv)
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

-- Public read access
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Destinations are publicly readable" ON public.destinations FOR SELECT USING (true);

-- Indexes
CREATE INDEX idx_dest_region ON public.destinations(region);
CREATE INDEX idx_dest_category ON public.destinations(category);
CREATE INDEX idx_dest_city ON public.destinations(city);
CREATE INDEX idx_dest_state ON public.destinations(state);
CREATE INDEX idx_dest_rating ON public.destinations(rating DESC);
CREATE INDEX idx_dest_trending ON public.destinations(trending_score DESC);


-- ════════════════════════════════════════════════════════════
-- Migration: 003_create_events.sql
-- ════════════════════════════════════════════════════════════

-- Migration 003: Events table
-- Source: Manually curated Indian festivals/events (~15 rows)

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

-- Public read access
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events are publicly readable" ON public.events FOR SELECT USING (true);

-- Indexes
CREATE INDEX idx_events_date ON public.events(event_date);
CREATE INDEX idx_events_city ON public.events(city);


-- ════════════════════════════════════════════════════════════
-- Migration: 004_create_trips.sql
-- ════════════════════════════════════════════════════════════

-- Migration 004: Trips + Trip Stops tables
-- Source: User-generated (app runtime)

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


-- ════════════════════════════════════════════════════════════
-- Migration: 005_create_user_profiles.sql
-- ════════════════════════════════════════════════════════════

-- Migration 005: User Profiles table + auto-create trigger
-- Source: Auto-created on user signup via Supabase Auth

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

-- Auto-create profile on signup via trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
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


-- ════════════════════════════════════════════════════════════
-- Migration: 006_create_chat_sessions.sql
-- ════════════════════════════════════════════════════════════

-- Migration 006: Chat Sessions table
-- Source: User-generated (chatbot interactions)

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

