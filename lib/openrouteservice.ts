
const OPENROUTESERVICE_API_KEY = process.env.OPENROUTESERVICE_API_KEY;

if (!OPENROUTESERVICE_API_KEY) {
  console.warn("OPENROUTESERVICE_API_KEY is not set. OpenRouteService API calls will fail.");
}

export async function getDirections(
  start: { lat: number; lon: number },
  end: { lat: number; lon: number },
  profile: 'driving-car' | 'cycling-regular' | 'foot-walking' = 'driving-car'
): Promise<{ distance: number; duration: number } | null> {
  if (!OPENROUTESERVICE_API_KEY) {
    return null;
  }

  const url = `https://api.openrouteservice.org/v2/directions/${profile}`;
  const body = JSON.stringify({
    coordinates: [[start.lon, start.lat], [end.lon, end.lat]],
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': OPENROUTESERVICE_API_KEY,
        'Content-Type': 'application/json',
      },
      body,
    });

    const data = await response.json();
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        distance: route.summary.distance / 1000, // convert to km
        duration: route.summary.duration / 60, // convert to minutes
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching data from OpenRouteService:', error);
    return null;
  }
}
