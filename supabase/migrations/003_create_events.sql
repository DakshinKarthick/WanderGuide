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
