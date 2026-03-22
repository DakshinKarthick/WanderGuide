-- Migration 007: Add unique constraint to trip_stops
-- Source: Gemini

ALTER TABLE public.trip_stops
ADD CONSTRAINT trip_stops_trip_id_destination_id_key UNIQUE (trip_id, destination_id);
