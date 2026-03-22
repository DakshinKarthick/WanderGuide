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
