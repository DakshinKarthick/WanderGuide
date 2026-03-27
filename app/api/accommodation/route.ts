import { NextResponse } from 'next/server';
import { createDataClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const destinationName = searchParams.get('destination');
  const budget = searchParams.get('budget') || 'medium';

  if (!destinationName) {
    return NextResponse.json({ error: 'destination query param is required' }, { status: 400 });
  }

  // Look up destination coordinates from the database
  const supabase = await createDataClient();
  const { data: dest } = await supabase
    .from('destinations')
    .select('latitude, longitude, city, state')
    .ilike('name', `%${destinationName}%`)
    .limit(1)
    .single();

  let latitude = dest?.latitude ? Number(dest.latitude) : null;
  let longitude = dest?.longitude ? Number(dest.longitude) : null;

  // Fallback: try by city name
  if (!latitude || !longitude) {
    const { data: cityDest } = await supabase
      .from('destinations')
      .select('latitude, longitude')
      .ilike('city', `%${destinationName}%`)
      .limit(1)
      .single();

    latitude = cityDest?.latitude ? Number(cityDest.latitude) : null;
    longitude = cityDest?.longitude ? Number(cityDest.longitude) : null;
  }

  if (!latitude || !longitude) {
    // Return empty array if we can't locate the destination
    return NextResponse.json([]);
  }

  const apiKey = process.env.GEOAPIFY_API_KEY;
  if (!apiKey) {
    return NextResponse.json([]);
  }

  const radius = 5000;
  const geoapifyUrl = `https://api.geoapify.com/v2/places?categories=accommodation.hotel&filter=circle:${longitude},${latitude},${radius}&limit=10&apiKey=${apiKey}`;

  try {
    const response = await fetch(geoapifyUrl);
    if (!response.ok) {
      return NextResponse.json([]);
    }

    const data = await response.json();
    if (!data?.features || !Array.isArray(data.features)) {
      return NextResponse.json([]);
    }

    const budgetTiers: Record<string, { min: number; max: number }> = {
      low: { min: 500, max: 1500 },
      medium: { min: 2000, max: 5000 },
      luxury: { min: 6000, max: 15000 },
    };

    const tier = budgetTiers[budget] || budgetTiers.medium;

    const accommodations = data.features
      .filter((f: any) => f.properties?.name)
      .map((feature: any, index: number) => {
        const price = Math.floor(tier.min + Math.random() * (tier.max - tier.min));
        const tags: string[] = [];
        if (price < 1500) tags.push('budget');
        else if (price > 5000) tags.push('luxury');
        else tags.push('best value');
        if (feature.properties.rank?.importance > 0.7) tags.push('popular');

        return {
          id: index + 1,
          name: feature.properties.name,
          price,
          tags,
        };
      })
      .slice(0, 5);

    return NextResponse.json(accommodations);
  } catch (error) {
    console.error('Error fetching accommodation data:', error);
    return NextResponse.json([]);
  }
}
