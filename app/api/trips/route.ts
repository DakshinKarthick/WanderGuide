import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { CreateTripInput, Trip, TripStop } from "@/lib/types/trip";

function normalizeTrip(trip: Trip | null): Trip | null {
  if (!trip) return null;

  const stops = (trip.trip_stops ?? []).slice().sort((a, b) => a.stop_order - b.stop_order);
  return { ...trip, trip_stops: stops };
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("trips")
    .select("*, trip_stops(*, destination:destinations(*), trip_activities(*))")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const trips = (data as Trip[] | null)?.map((trip) => normalizeTrip(trip)) ?? [];
  return NextResponse.json({ trips });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as CreateTripInput;
  const name = body.name?.trim() || "My India Trip";

  const { data: createdTrip, error: createError } = await supabase
    .from("trips")
    .insert({
      user_id: user.id,
      name,
      start_date: body.start_date ?? null,
      end_date: body.end_date ?? null,
    })
    .select("*")
    .single();

  if (createError || !createdTrip) {
    return NextResponse.json({ error: createError?.message || "Failed to create trip" }, { status: 500 });
  }

  if (body.stops?.length) {
    const stopsToInsert: Omit<TripStop, "id" | "destination" | "notes">[] = body.stops.map((stop, index) => ({
      trip_id: createdTrip.id,
      destination_id: stop.destination_id,
      stop_order: stop.stop_order ?? index + 1,
      days_allocated: Math.max(1, Number(stop.days_allocated) || 1),
    }));

    const { error: stopsError } = await supabase.from("trip_stops").insert(stopsToInsert);

    if (stopsError) {
      return NextResponse.json({ error: stopsError.message }, { status: 500 });
    }
  }

  const { data: tripWithStops, error: fetchError } = await supabase
    .from("trips")
    .select("*, trip_stops(*, destination:destinations(*), trip_activities(*))")
    .eq("id", createdTrip.id)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  return NextResponse.json({ trip: normalizeTrip(tripWithStops as Trip) }, { status: 201 });
}
