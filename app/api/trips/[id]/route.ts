import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Trip, TripStop, UpdateTripInput } from "@/lib/types/trip";

interface RouteParams {
  params: Promise<{ id: string }>;
}

function normalizeTrip(trip: Trip | null): Trip | null {
  if (!trip) return null;

  const stops = (trip.trip_stops ?? []).slice().sort((a, b) => a.stop_order - b.stop_order);
  return { ...trip, trip_stops: stops };
}

async function getAuthorizedTripId(routeId: string): Promise<{ tripId: string } | { error: NextResponse }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const { data: trip, error } = await supabase
    .from("trips")
    .select("id")
    .eq("id", routeId)
    .eq("user_id", user.id)
    .single();

  if (error || !trip) {
    return { error: NextResponse.json({ error: "Trip not found" }, { status: 404 }) };
  }

  return { tripId: trip.id };
}

export async function GET(_: NextRequest, context: RouteParams) {
  const { id } = await context.params;
  const authorized = await getAuthorizedTripId(id);
  if ("error" in authorized) return authorized.error;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trips")
    .select("*, trip_stops(*, destination:destinations(*), trip_activities(*))")
    .eq("id", authorized.tripId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ trip: normalizeTrip(data as Trip) });
}

export async function PUT(request: NextRequest, context: RouteParams) {
  const { id } = await context.params;
  const authorized = await getAuthorizedTripId(id);
  if ("error" in authorized) return authorized.error;

  const body = (await request.json()) as UpdateTripInput;
  const supabase = await createClient();

  const updates: Record<string, unknown> = {};
  if (typeof body.name === "string") updates.name = body.name.trim() || "My India Trip";
  if (body.start_date !== undefined) updates.start_date = body.start_date;
  if (body.end_date !== undefined) updates.end_date = body.end_date;
  if (body.status) updates.status = body.status;
  if (body.total_budget !== undefined) updates.total_budget = body.total_budget;

  if (Object.keys(updates).length) {
    const { error: updateTripError } = await supabase
      .from("trips")
      .update(updates)
      .eq("id", authorized.tripId);

    if (updateTripError) {
      return NextResponse.json({ error: updateTripError.message }, { status: 500 });
    }
  }

  if (body.stops) {
    const { error: deleteError } = await supabase
      .from("trip_stops")
      .delete()
      .eq("trip_id", authorized.tripId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    if (body.stops.length) {
      const stopsToInsert: Omit<TripStop, "id" | "destination" | "notes">[] = body.stops.map((stop, index) => ({
        trip_id: authorized.tripId,
        destination_id: stop.destination_id,
        stop_order: stop.stop_order ?? index + 1,
        days_allocated: Math.max(1, Number(stop.days_allocated) || 1),
      }));

      const { error: insertStopsError } = await supabase.from("trip_stops").insert(stopsToInsert);

      if (insertStopsError) {
        return NextResponse.json({ error: insertStopsError.message }, { status: 500 });
      }
    }
  }

  const { data: updatedTrip, error: fetchError } = await supabase
    .from("trips")
    .select("*, trip_stops(*, destination:destinations(*), trip_activities(*))")
    .eq("id", authorized.tripId)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  return NextResponse.json({ trip: normalizeTrip(updatedTrip as Trip) });
}
