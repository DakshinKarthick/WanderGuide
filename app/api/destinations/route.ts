import { NextRequest, NextResponse } from 'next/server';
import { createDataClient } from '@/lib/supabase/server';
import { withPlaceImage } from '@/lib/place-image';

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;

function deduplicateByName<T extends { name: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.name.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const ALLOWED_SORT_COLUMNS = new Set([
  'name',
  'rating',
  'trending_score',
  'created_at',
]);

export async function GET(request: NextRequest) {
  const supabase = await createDataClient();
  const { searchParams } = new URL(request.url);

  const search = searchParams.get('search')?.trim() ?? '';
  const region = searchParams.get('region')?.trim() ?? 'all';
  const category = searchParams.get('category')?.trim() ?? 'all';
  const sort = searchParams.get('sort')?.trim() ?? 'trending_score';

  const pageValue = Number.parseInt(searchParams.get('page') ?? '1', 10);
  const limitValue = Number.parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10);

  const page = Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1;
  const limit = Number.isFinite(limitValue)
    ? Math.min(Math.max(limitValue, 1), MAX_LIMIT)
    : DEFAULT_LIMIT;

  const sortColumn = ALLOWED_SORT_COLUMNS.has(sort) ? sort : 'trending_score';
  const ascending = sortColumn === 'name';

  let query = supabase.from('destinations').select('*', { count: 'exact' });

  if (search) {
    query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%,state.ilike.%${search}%`);
  }

  if (region !== 'all') {
    query = query.eq('region', region);
  }

  if (category !== 'all') {
    query = query.eq('category', category);
  }

  // Fetch a larger batch so deduplication still fills the requested page size.
  const fetchMultiplier = 3;
  const from = (page - 1) * limit;
  const to = from + limit * fetchMultiplier - 1;

  const { data, error, count } = await query
    .order(sortColumn, { ascending, nullsFirst: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const unique = deduplicateByName(data ?? []).slice(0, limit);
  const total = count ?? 0;

  return NextResponse.json({
    destinations: unique.map((destination) => withPlaceImage(destination)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
