// app/api/trips/[id]/stops/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { destination_id } = await request.json();
  const trip_id = params.id;

  if (!destination_id) {
    return NextResponse.json(
      { error: "destination_id is required" },
      { status: 400 }
    );
  }

  // Get the highest stop_order for the trip
  const { data: maxOrder, error: maxOrderError } = await supabase
    .from("trip_stops")
    .select("stop_order")
    .eq("trip_id", trip_id)
    .order("stop_order", { ascending: false })
    .limit(1)
    .single();

  if (maxOrderError && maxOrderError.code !== "PGRST116") {
    // PGRST116: no rows found
    return NextResponse.json({ error: maxOrderError.message }, { status: 500 });
  }

  const newStopOrder = (maxOrder?.stop_order ?? 0) + 1;

  const { data: stop, error } = await supabase
    .from("trip_stops")
    .insert([
      {
        trip_id,
        destination_id,
        stop_order: newStopOrder,
        days_allocated: 1,
      },
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ stop });
}
