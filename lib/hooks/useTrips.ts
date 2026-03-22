"use client";

import { useCallback, useEffect, useState } from "react";
import type { CreateTripInput, Trip, UpdateTripInput, TripStop, TripActivity } from "@/lib/types/trip";

interface TripsResponse {
  trips: Trip[];
}

interface TripResponse {
  trip: Trip;
}

interface ActivityResponse {
  activity: TripActivity;
}

interface UseTripsResult {
  trips: Trip[];
  activeTrip: Trip | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  refreshTrips: () => Promise<void>;
  createTrip: (payload: CreateTripInput) => Promise<Trip | null>;
  updateTrip: (tripId: string, payload: UpdateTripInput) => Promise<Trip | null>;
  saveTripStops: (tripId: string, stops: TripStop[]) => Promise<Trip | null>;
  removeTripStop: (tripId: string, stopId: string) => Promise<Trip | null>;
  addActivity: (payload: Partial<TripActivity>) => Promise<TripActivity | null>;
  updateActivity: (payload: Partial<TripActivity> & { id: string }) => Promise<TripActivity | null>;
  deleteActivity: (id: string) => Promise<boolean>;
  setActiveTripById: (tripId: string) => void;
  getActiveTrip: () => Trip | null;
  getTripStops: () => TripStop[];
}

export function useTrips(initialTripId?: string): UseTripsResult {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setActiveTripById = useCallback((tripId: string) => {
    setActiveTrip((current) => {
      if (current?.id === tripId) return current;
      return trips.find((trip) => trip.id === tripId) ?? null;
    });
  }, [trips]);

  const getActiveTrip = useCallback(() => {
    return activeTrip;
  }, [activeTrip]);

  const getTripStops = useCallback(() => {
    return activeTrip?.trip_stops ?? [];
  }, [activeTrip]);

  const refreshTrips = useCallback(async () => {
    setError(null);

    try {
      const response = await fetch("/api/trips", {
        method: "GET",
        cache: "no-store",
      });

      if (response.status === 401) {
        setIsAuthenticated(false);
        setTrips([]);
        setActiveTrip(null);
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to load trips (${response.status})`);
      }

      const payload = (await response.json()) as TripsResponse;
      const nextTrips = payload.trips ?? [];

      setIsAuthenticated(true);
      setTrips(nextTrips);

      if (nextTrips.length === 0) {
        setActiveTrip(null);
        return;
      }

      if (initialTripId) {
        const matched = nextTrips.find((trip) => trip.id === initialTripId);
        if (matched) {
          setActiveTrip(matched);
          return;
        }
      }

      setActiveTrip((current) => {
        if (current) {
          const matched = nextTrips.find((trip) => trip.id === current.id);
          if (matched) return matched;
        }

        return nextTrips[0] ?? null;
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to load trips");
    }
  }, [initialTripId]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      await refreshTrips();
      if (!cancelled) {
        setIsLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [refreshTrips]);

  const createTrip = useCallback(async (payload: CreateTripInput): Promise<Trip | null> => {
    setError(null);

    try {
      const response = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        setIsAuthenticated(false);
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to create trip (${response.status})`);
      }

      const data = (await response.json()) as TripResponse;
      const created = data.trip;

      setIsAuthenticated(true);
      setTrips((current) => [created, ...current.filter((trip) => trip.id !== created.id)]);
      setActiveTrip(created);

      return created;
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to create trip");
      return null;
    }
  }, []);

  const updateTrip = useCallback(async (tripId: string, payload: UpdateTripInput): Promise<Trip | null> => {
    setError(null);

    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        setIsAuthenticated(false);
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to update trip (${response.status})`);
      }

      const data = (await response.json()) as TripResponse;
      const updated = data.trip;

      setIsAuthenticated(true);
      setTrips((current) => current.map((trip) => (trip.id === updated.id ? updated : trip)));
      setActiveTrip(updated);

      return updated;
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to update trip");
      return null;
    }
  }, []);

  const saveTripStops = useCallback(async (tripId: string, stops: TripStop[]): Promise<Trip | null> => {
    setError(null);

    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stops }),
      });

      if (response.status === 401) {
        setIsAuthenticated(false);
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to save trip stops (${response.status})`);
      }

      const data = (await response.json()) as TripResponse;
      const updated = data.trip;

      setIsAuthenticated(true);
      setTrips((current) => current.map((trip) => (trip.id === updated.id ? updated : trip)));
      setActiveTrip(updated);

      return updated;
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to save trip stops");
      return null;
    }
  }, []);

  const removeTripStop = useCallback(async (tripId: string, stopId: string): Promise<Trip | null> => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return null;

    const stops = trip.trip_stops?.filter((s) => s.id !== stopId) ?? [];
    return saveTripStops(tripId, stops);
  }, [trips, saveTripStops]);

  const addActivity = useCallback(async (payload: Partial<TripActivity>): Promise<TripActivity | null> => {
    setError(null);
    try {
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to add activity");
      const data = await response.json() as ActivityResponse;
      await refreshTrips();
      return data.activity;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add activity");
      return null;
    }
  }, [refreshTrips]);

  const updateActivity = useCallback(async (payload: Partial<TripActivity> & { id: string }): Promise<TripActivity | null> => {
    setError(null);
    try {
      const response = await fetch("/api/activities", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to update activity");
      const data = await response.json() as ActivityResponse;
      await refreshTrips();
      return data.activity;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update activity");
      return null;
    }
  }, [refreshTrips]);

  const deleteActivity = useCallback(async (id: string): Promise<boolean> => {
    setError(null);
    try {
      const response = await fetch(`/api/activities?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete activity");
      await refreshTrips();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete activity");
      return false;
    }
  }, [refreshTrips]);

  return {
    trips,
    activeTrip,
    isLoading,
    isAuthenticated,
    error,
    refreshTrips,
    createTrip,
    updateTrip,
    saveTripStops,
    removeTripStop,
    addActivity,
    updateActivity,
    deleteActivity,
    setActiveTripById,
    getActiveTrip,
    getTripStops,
  };
}
