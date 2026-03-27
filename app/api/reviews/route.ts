import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/reviews?destination_id=<uuid>
// Returns all reviews for a destination, with reviewer display_name from user_profiles
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const destination_id = searchParams.get('destination_id');

  if (!destination_id) {
    return NextResponse.json({ error: 'destination_id is required' }, { status: 400 });
  }

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
      user_profiles!left ( display_name, avatar_url )
    `)
    .eq('destination_id', destination_id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Compute aggregate stats
  const reviews = data ?? [];
  const avg_rating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const distribution = [1, 2, 3, 4, 5].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return NextResponse.json({ reviews, avg_rating, distribution, total: reviews.length });
}

// POST /api/reviews
// Body: { destination_id, rating, title, body }
// Creates or updates (upserts) a review for the current user
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { destination_id, rating, title, body: reviewBody } = body;

  if (!destination_id || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'destination_id and rating (1-5) are required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('reviews')
    .upsert(
      {
        destination_id,
        user_id: user.id,
        rating: Number(rating),
        title: title ?? '',
        body: reviewBody ?? '',
      },
      { onConflict: 'destination_id,user_id' }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ review: data });
}
