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
