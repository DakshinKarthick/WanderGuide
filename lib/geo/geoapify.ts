// lib/geo/geoapify.ts
import { z } from 'zod';

const geoapifyApiKey = process.env.GEOAPIFY_API_KEY;

const PlaceSchema = z.object({
  properties: z.object({
    name: z.string().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    postcode: z.string().optional(),
    lat: z.number(),
    lon: z.number(),
    formatted: z.string(),
    place_id: z.string(),
  }),
});

const PlacesResponseSchema = z.object({
  features: z.array(PlaceSchema),
});

interface SearchPlacesParams {
  categories: string[];
  lon: number;
  lat: number;
  radius: number;
  limit?: number;
}

export async function searchPlaces({
  categories,
  lon,
  lat,
  radius,
  limit = 20,
}: SearchPlacesParams) {
  if (!geoapifyApiKey) {
    throw new Error('GEOAPIFY_API_KEY is not set');
  }

  const baseUrl = 'https://api.geoapify.com/v2/places';
  const categoriesParam = categories.join(',');
  
  const url = `${baseUrl}?categories=${categoriesParam}&filter=circle:${lon},${lat},${radius}&bias=proximity:${lon},${lat}&limit=${limit}&apiKey=${geoapifyApiKey}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Geoapify API Error:', errorText);
      throw new Error(`Geoapify API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const validatedData = PlacesResponseSchema.parse(data);
    
    return validatedData.features.map(feature => feature.properties);
  } catch (error) {
    console.error('Failed to fetch or parse places:', error);
    if (error instanceof z.ZodError) {
      throw new Error(`Failed to validate Geoapify API response: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while fetching places data.');
  }
}
