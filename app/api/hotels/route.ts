import { NextRequest, NextResponse } from 'next/server';
import { createDataClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const destinationId = searchParams.get('destinationId');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const budget = searchParams.get('budget') || 'medium';
  const style = searchParams.get('style');

  if (!((lat && lon) || destinationId)) {
    return NextResponse.json({ error: 'Missing required query parameters: either destinationId or lat and lon' }, { status: 400 });
  }

  let latitude = lat ? parseFloat(lat) : null;
  let longitude = lon ? parseFloat(lon) : null;

  if (destinationId) {
    const supabase = await createDataClient();
    const { data: destination, error } = await supabase
      .from('destinations')
      .select('latitude, longitude')
      .eq('id', destinationId)
      .single();

    if (error || !destination) {
      console.error('Error fetching destination:', error);
      return NextResponse.json({ error: `Destination with ID ${destinationId} not found.` }, { status: 404 });
    }

    latitude = destination.latitude;
    longitude = destination.longitude;
  }

  const apiKey = process.env.GEOAPIFY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Server configuration error: Geoapify API key is missing' }, { status: 500 });
  }

  const radius = 5000; // 5km radius
  const geoapifyUrl = `https://api.geoapify.com/v2/places?categories=accommodation.hotel&filter=circle:${longitude},${latitude},${radius}&apiKey=${apiKey}`;

  try {
    const geoapifyResponse = await fetch(geoapifyUrl);
    if (!geoapifyResponse.ok) {
      const errorData = await geoapifyResponse.json();
      console.error('Geoapify API Error:', errorData);
      return NextResponse.json({ error: 'Failed to fetch data from Geoapify', details: errorData }, { status: geoapifyResponse.status });
    }

    const data = await geoapifyResponse.json();

    const budgetTiers = {
      low: { min: 500, max: 1500, tag: 'budget' },
      medium: { min: 2000, max: 5000, tag: 'best value' },
      luxury: { min: 6000, max: 15000, tag: 'premium' },
    };

    if (!Object.keys(budgetTiers).includes(budget)) {
      return NextResponse.json({ error: 'Invalid budget parameter. Must be one of: low, medium, luxury' }, { status: 400 });
    }

    const selectedBudget = budgetTiers[budget as keyof typeof budgetTiers] || budgetTiers.medium;

    const accommodations = data.features.map((feature: any, index: number) => {
      // Simple logic to vary price within the budget tier
      const price = Math.floor(selectedBudget.min + Math.random() * (selectedBudget.max - selectedBudget.min));
      
      const tags = [selectedBudget.tag];
      if (feature.properties.rank && feature.properties.rank.importance > 0.7) {
          tags.push('popular');
      }


      return {
        id: feature.properties.place_id,
        name: feature.properties.name || 'Unnamed Hotel',
        address: feature.properties.address_line2 || 'No address provided',
        lat: feature.properties.lat,
        lon: feature.properties.lon,
        pricePerNight: price,
        budgetTier: budget,
        tags: tags,
      };
    }).slice(0, 20);

    return NextResponse.json(accommodations);

  } catch (error) {
    console.error('Error fetching accommodations:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}