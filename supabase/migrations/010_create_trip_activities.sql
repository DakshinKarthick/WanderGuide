-- Migration 010: Trip Activities table
-- Purpose: Allow users to plan specific activities per day of a trip stop

CREATE TABLE public.trip_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_stop_id UUID NOT NULL REFERENCES public.trip_stops(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL DEFAULT 1,
  activity_name TEXT NOT NULL,
  activity_time TEXT, -- e.g. "Morning", "10:00 AM"
  cost INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security: Users manage only their own activities
ALTER TABLE public.trip_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own trip activities" ON public.trip_activities
  FOR ALL USING (
    trip_stop_id IN (
      SELECT id FROM public.trip_stops WHERE trip_id IN (
        SELECT id FROM public.trips WHERE user_id = auth.uid()
      )
    )
  );

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_trip_activities_trip_stop_id ON public.trip_activities(trip_stop_id);
