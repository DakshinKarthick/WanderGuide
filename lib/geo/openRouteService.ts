// lib/geo/openRouteService.ts
import { z } from 'zod';

const orsApiKey = process.env.OPENROUTESERVICE_API_KEY;

const RouteQuerySchema = z.object({
  start: z.tuple([z.number(), z.number()]),
  end: z.tuple([z.number(), z.number()]),
  profile: z.enum(['driving-car', 'driving-hgv', 'cycling-road', 'foot-walking']),
});

const OrsRouteResponseSchema = z.object({
  routes: z.array(
    z.object({
      summary: z.object({
        distance: z.number(), // in meters
        duration: z.number(), // in seconds
      }),
    })
  ),
});

export async function getRoute(params: z.infer<typeof RouteQuerySchema>) {
  if (!orsApiKey) {
    throw new Error('OPENROUTESERVICE_API_KEY is not set');
  }

  const { start, end, profile } = RouteQuerySchema.parse(params);

  const url = 'https://api.openrouteservice.org/v2/directions/' + profile + '/geojson';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': orsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        coordinates: [start, end],
      }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouteService API Error:', errorText);
        throw new Error(`OpenRouteService API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const validatedData = OrsRouteResponseSchema.parse(data);

    if (validatedData.routes.length === 0) {
      throw new Error('No route found by OpenRouteService.');
    }

    const { distance, duration } = validatedData.routes[0].summary;

    return {
      distance, // in meters
      duration, // in seconds
      raw: data,
    };
  } catch (error) {
    console.error('Failed to fetch or parse route:', error);
    if (error instanceof z.ZodError) {
      throw new Error(`Failed to validate OpenRouteService API response: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while fetching route data.');
  }
}
