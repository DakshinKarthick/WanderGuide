// app/api/trips/[id]/stops/reorder/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(
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

  const { stops } = await request.json();

  if (!stops || !Array.isArray(stops)) {
    return NextResponse.json(
      { error: "stops array is required" },
      { status: 400 }
    );
  }

  const { error } = await supabase.rpc("update_trip_stops_order", {
    trip_id_param: params.id,
    stops_data: stops,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
