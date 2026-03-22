import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/reviews/all  — returns all reviews (public) with destination + user info
export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('reviews')
    .select(`
      id,
      destination_id,
      user_id,
      rating,
      title,
      body,
      helpful_count,
      created_at,
      updated_at,
      user_profiles ( display_name, avatar_url ),
      destinations ( name, state )
    `)
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reviews: data ?? [] });
}
