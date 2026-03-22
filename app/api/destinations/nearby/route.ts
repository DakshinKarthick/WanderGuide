import { NextRequest, NextResponse } from 'next/server';
import { createDataClient } from '@/lib/supabase/server';
import { findNearbyPlaces } from '@/lib/geoapify';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lon = parseFloat(searchParams.get('lon') || '0');

  if (!city && (!lat || !lon)) {
    return NextResponse.json({ error: 'City or coordinates are required' }, { status: 400 });
  }

  const supabase = await createDataClient();
  
  // 1. Get other destinations from the same city in our DB
  let dbDestinations: any[] = [];
  if (city) {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('city', city)
      .limit(5);
    
    if (!error && data) {
      dbDestinations = data;
    }
  }

  // 2. Get nearby places from Geoapify API if coordinates are provided
  let externalPlaces: any[] = [];
  if (lat && lon) {
    externalPlaces = await findNearbyPlaces(lat, lon, ['tourism.attraction', 'entertainment.culture'], 5);
  }

  return NextResponse.json({
    database: dbDestinations,
    external: externalPlaces
  });
}
