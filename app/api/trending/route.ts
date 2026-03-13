import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withPlaceImage } from '@/lib/place-image';

function deduplicateByName<T extends { name: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.name.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const DEFAULT_DESTINATION_LIMIT = 5;
const DEFAULT_EVENT_LIMIT = 5;

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const destinationsLimitRaw = Number.parseInt(searchParams.get('destinationsLimit') ?? '', 10);
  const eventsLimitRaw = Number.parseInt(searchParams.get('eventsLimit') ?? '', 10);

  const destinationsLimit = Number.isFinite(destinationsLimitRaw)
    ? Math.min(Math.max(destinationsLimitRaw, 1), 20)
    : DEFAULT_DESTINATION_LIMIT;

  const eventsLimit = Number.isFinite(eventsLimitRaw)
    ? Math.min(Math.max(eventsLimitRaw, 1), 20)
    : DEFAULT_EVENT_LIMIT;

  const today = new Date().toISOString().slice(0, 10);

  const [destinationsResult, eventsResult] = await Promise.all([
    supabase
      .from('destinations')
      .select('*')
      .order('trending_score', { ascending: false, nullsFirst: false })
      .order('rating', { ascending: false, nullsFirst: false })
      .limit(destinationsLimit * 3),
    supabase
      .from('events')
      .select('*')
      .gte('event_date', today)
      .order('event_date', { ascending: true, nullsFirst: false })
      .limit(eventsLimit),
  ]);

  if (destinationsResult.error) {
    return NextResponse.json({ error: destinationsResult.error.message }, { status: 500 });
  }

  if (eventsResult.error) {
    return NextResponse.json({ error: eventsResult.error.message }, { status: 500 });
  }

  const uniqueDestinations = deduplicateByName(destinationsResult.data ?? []).slice(0, destinationsLimit);

  return NextResponse.json({
    trendingDestinations: uniqueDestinations.map((destination) => withPlaceImage(destination)),
    upcomingEvents: (eventsResult.data ?? []).map((event) => withPlaceImage(event)),
  });
}
