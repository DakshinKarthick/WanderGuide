-- Migration 009: Reviews table
-- Used by: Review & Feedback module

CREATE TABLE public.reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id  UUID NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating          INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title           TEXT NOT NULL DEFAULT '',
  body            TEXT NOT NULL DEFAULT '',
  helpful_count   INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One review per user per destination
  UNIQUE (destination_id, user_id)
);

-- Indexes
CREATE INDEX idx_reviews_destination  ON public.reviews(destination_id);
CREATE INDEX idx_reviews_user         ON public.reviews(user_id);
CREATE INDEX idx_reviews_rating       ON public.reviews(rating DESC);
CREATE INDEX idx_reviews_created      ON public.reviews(created_at DESC);

-- Automatically update updated_at on row change
CREATE OR REPLACE FUNCTION public.touch_review_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.touch_review_updated_at();

-- RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews (public)
CREATE POLICY "Reviews are publicly readable"
  ON public.reviews FOR SELECT
  USING (true);

-- Only the author can insert / update / delete their review
CREATE POLICY "Users insert own reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id);
