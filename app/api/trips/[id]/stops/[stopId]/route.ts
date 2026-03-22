// app/api/trips/[id]/stops/[stopId]/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; stopId: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("trip_stops")
    .delete()
    .eq("id", params.stopId)
    .eq("trip_id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string; stopId: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { days_allocated } = await request.json();

  if (days_allocated === undefined) {
    return NextResponse.json(
      { error: "days_allocated is required" },
      { status: 400 }
    );
  }

  const { data: stop, error } = await supabase
    .from("trip_stops")
    .update({ days_allocated })
    .eq("id", params.stopId)
    .eq("trip_id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ stop });
}
