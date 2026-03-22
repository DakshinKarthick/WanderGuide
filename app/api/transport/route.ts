
import { type NextRequest, NextResponse } from 'next/server';
import { type TransportInput, type TransportOption, type TransportResponse } from '@/lib/types/transport';
import { getDirections } from '@/lib/openrouteservice';
import { getTransportModes, calculatePrice, calculateDuration } from '@/lib/transport';
import { findNearbyPlaces } from '@/lib/geoapify';

function haversineDistanceKm(
  origin: { lat: number; lon: number },
  destination: { lat: number; lon: number }
): number {
  const R = 6371; // Earth radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(destination.lat - origin.lat);
  const dLon = toRad(destination.lon - origin.lon);
  const lat1 = toRad(origin.lat);
  const lat2 = toRad(destination.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export async function POST(req: NextRequest) {
  try {
    const body: TransportInput = await req.json();
    const { origin, destination } = body;
    
    const directions = await getDirections(origin, destination);

    // Fallback: if OpenRouteService fails or no route is found,
    // approximate distance using haversine so the UI still works.
    const distance = directions?.distance ?? haversineDistanceKm(origin, destination);

    if (!Number.isFinite(distance) || distance <= 0) {
      return NextResponse.json({ error: 'Could not calculate distance.' }, { status: 500 });
    }
    const modes = getTransportModes(distance);

    let options: TransportOption[] = modes.map(mode => {
      const price = calculatePrice(mode, distance);
      const durationMinutes = calculateDuration(mode, distance);

      return {
        mode,
        distanceKm: distance,
        durationMinutes,
        price,
        label: mode.charAt(0).toUpperCase() + mode.slice(1),
      };
    });

    // Handle flight-specific logic
    if (modes.includes('flight')) {
      const originAirports = await findNearbyPlaces(origin.lat, origin.lon, ['transport.airport']);
      const destinationAirports = await findNearbyPlaces(destination.lat, destination.lon, ['transport.airport']);

      if (originAirports.length > 0 && destinationAirports.length > 0) {
        // We can add more logic here to select the best airport, but for now we just use the first one
        const flightOption = options.find(o => o.mode === 'flight');
        if (flightOption) {
          flightOption.label = `Flight from ${originAirports[0].name} to ${destinationAirports[0].name}`;
        }
      }
    }
    
    // Add tags
    if (options.length > 0) {
        let cheapest = options[0];
        let fastest = options[0];

        for (const option of options) {
            if (option.price < cheapest.price) {
                cheapest = option;
            }
            if (option.durationMinutes < fastest.durationMinutes) {
                fastest = option;
            }
        }
        cheapest.tag = 'cheapest';
        fastest.tag = 'fastest';

        // simple best value logic
        if (cheapest.mode !== fastest.mode) {
            const bestValue = options.find(o => o.mode !== cheapest.mode && o.mode !== fastest.mode);
            if(bestValue) {
                bestValue.tag = 'best value';
            } else if (options.length > 2) {
                // if there is no third option, we can tag the second cheapest as best value
                const secondCheapest = options.sort((a,b) => a.price - b.price)[1];
                if(secondCheapest.tag === undefined) {
                    secondCheapest.tag = 'best value';
                }
            }
        }
    }


    const response: TransportResponse = options;
    return NextResponse.json(response);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
