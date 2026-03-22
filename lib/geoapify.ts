
import { type Place } from '@/lib/types';

const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;

if (!GEOAPIFY_API_KEY) {
  console.warn("GEOAPIFY_API_KEY is not set. Geoapify API calls will fail.");
}

export async function findNearbyPlaces(
  lat: number,
  lon: number,
  categories: string[],
  limit: number = 5
): Promise<Place[]> {
  if (!GEOAPIFY_API_KEY) {
    return [];
  }

  const categoriesString = categories.join(',');
  const url = `https://api.geoapify.com/v2/places?categories=${categoriesString}&filter=circle:${lon},${lat},50000&bias=proximity:${lon},${lat}&limit=${limit}&apiKey=${GEOAPIFY_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.features.map((feature: any) => ({
      id: feature.properties.place_id,
      name: feature.properties.name,
      address: feature.properties.formatted,
      lat: feature.properties.lat,
      lon: feature.properties.lon,
    }));
  } catch (error) {
    console.error('Error fetching data from Geoapify:', error);
    return [];
  }
}
