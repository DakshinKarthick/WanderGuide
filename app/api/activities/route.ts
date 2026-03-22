import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { TripActivity } from "@/lib/types/trip";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { trip_stop_id, day_number, activity_name, activity_time, cost, notes } = body;

  if (!trip_stop_id || !activity_name) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify ownership of the trip stop
  const { data: stop, error: stopError } = await supabase
    .from("trip_stops")
    .select("trip_id, trips(user_id)")
    .eq("id", trip_stop_id)
    .single();

  if (stopError || !stop || (stop.trips as any).user_id !== user.id) {
    return NextResponse.json({ error: "Unauthorized or stop not found" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("trip_activities")
    .insert({
      trip_stop_id,
      day_number: day_number || 1,
      activity_name,
      activity_time,
      cost: cost || 0,
      notes,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ activity: data }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing activity ID" }, { status: 400 });
  }

  // Verify ownership via join
  const { data: activity, error: activityError } = await supabase
    .from("trip_activities")
    .select("id, trip_stop_id, trip_stops(trip_id, trips(user_id))")
    .eq("id", id)
    .single();

  if (activityError || !activity || (activity.trip_stops as any).trips.user_id !== user.id) {
    return NextResponse.json({ error: "Unauthorized or activity not found" }, { status: 403 });
  }

  const { error: deleteError } = await supabase.from("trip_activities").delete().eq("id", id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing activity ID" }, { status: 400 });
  }

  // Verify ownership
  const { data: activity, error: activityError } = await supabase
    .from("trip_activities")
    .select("id, trip_stop_id, trip_stops(trip_id, trips(user_id))")
    .eq("id", id)
    .single();

  if (activityError || !activity || (activity.trip_stops as any).trips.user_id !== user.id) {
    return NextResponse.json({ error: "Unauthorized or activity not found" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("trip_activities")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ activity: data });
}
