-- WanderGuide: AUTH Supabase Project Migrations
-- For: lvogfjmholcylaswdswp.supabase.co
-- Purpose: Store user trips after Google sign-in
-- Paste this entire file into Supabase SQL Editor and click Run

-- Drop tables first to ensure a clean slate on re-run
DROP TABLE IF EXISTS public.trip_stops CASCADE;
DROP TABLE IF EXISTS public.trips CASCADE;

-- ════════════════════════════════════════════════════════════
-- Migration: 001_create_trips.sql
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My India Trip',
  start_date TEXT,
  end_date TEXT,
  status TEXT DEFAULT 'planning',
  total_budget INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security: Users can only manage their own trips
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own trips" ON public.trips 
  FOR ALL USING (auth.uid() = user_id);

-- Index for fast user trip lookups
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON public.trips(user_id);

-- ════════════════════════════════════════════════════════════
-- Migration: 002_create_trip_stops.sql
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.trip_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  destination_id TEXT NOT NULL,
  city_id UUID, -- Storing the city ID from the data project
  stop_order INTEGER NOT NULL,
  days_allocated INTEGER NOT NULL DEFAULT 1,
  notes TEXT
);

-- Row Level Security: Users can only manage stops in their own trips
ALTER TABLE public.trip_stops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own trip stops" ON public.trip_stops
  FOR ALL USING (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()));

-- Index for fast trip stop lookups
CREATE INDEX IF NOT EXISTS idx_trip_stops_trip_id ON public.trip_stops(trip_id);
