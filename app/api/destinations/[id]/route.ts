import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withPlaceImage } from '@/lib/place-image';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_: Request, context: RouteParams) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: 'Destination id is required' }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Destination not found' }, { status: 404 });
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ destination: withPlaceImage(data) });
}
