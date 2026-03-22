"use client";

import { useCallback, useState } from "react";
import type { Trip, TripStop } from "@/lib/types/trip";

interface UseTripStopsResult {
  stops: TripStop[];
  addStop: (destinationId: string) => Promise<void>;
  removeStop: (stopId: string) => Promise<void>;
  updateStop: (stopId: string, daysAllocated: number) => Promise<void>;
  reorderStops: (startIndex: number, endIndex: number) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useTripStops(trip: Trip | null): UseTripStopsResult {
  const [stops, setStops] = useState<TripStop[]>(trip?.trip_stops ?? []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addStop = useCallback(async (destinationId: string) => {
    if (!trip) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/trips/${trip.id}/stops`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination_id: destinationId }),
      });

      if (!response.ok) {
        throw new Error("Failed to add stop");
      }

      const { stop } = await response.json();
      setStops((prev) => [...prev, stop]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [trip]);

  const removeStop = useCallback(async (stopId: string) => {
    if (!trip) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/trips/${trip.id}/stops/${stopId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove stop");
      }

      setStops((prev) => prev.filter((stop) => stop.id !== stopId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [trip]);

  const updateStop = useCallback(async (stopId: string, daysAllocated: number) => {
    if (!trip) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/trips/${trip.id}/stops/${stopId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days_allocated: daysAllocated }),
      });

      if (!response.ok) {
        throw new Error("Failed to update stop");
      }

      const { stop: updatedStop } = await response.json();
      setStops((prev) => prev.map((stop) => (stop.id === updatedStop.id ? updatedStop : stop)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [trip]);

  const reorderStops = useCallback(async (startIndex: number, endIndex: number) => {
    if (!trip) return;

    const newStops = Array.from(stops);
    const [removed] = newStops.splice(startIndex, 1);
    newStops.splice(endIndex, 0, removed);

    setStops(newStops.map((stop, index) => ({ ...stop, stop_order: index })));

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/trips/${trip.id}/stops/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stops: newStops.map((stop) => ({ id: stop.id, stop_order: stop.stop_order })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reorder stops");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      // Revert to original order if API call fails
      setStops(stops);
    } finally {
      setIsLoading(false);
    }
  }, [stops, trip]);

  return { stops, addStop, removeStop, updateStop, reorderStops, isLoading, error };
}
