
import TripMapClient from './TripMapClient';
import { createClient, createDataClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';


export default async function TripMapPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const tripId = searchParams.trip;

  if (typeof tripId !== 'string') {
    notFound();
  }

  const authSupabase = await createClient();
  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?redirectTo=/trip-map?trip=${tripId}`);
  }

  const dataSupabase = await createDataClient();

  const { data: trip, error } = await dataSupabase
    .from('trips')
    .select(
      `
      id,
      name,
      trip_stops (
        id,
        stop_order,
        destination:destinations (
          id,
          name,
          latitude,
          longitude
        )
      )
    `
    )
    .eq('id', tripId)
    .eq('user_id', user.id)
    .single();

  if (error || !trip) {
    console.error('Error fetching trip:', error);
    notFound();
  }

  // The query doesn't guarantee order, so we sort here.
  const sortedStops = trip.trip_stops.sort((a, b) => a.stop_order - b.stop_order);

  const waypoints = sortedStops.map(stop => {
      const dest = Array.isArray(stop.destination) ? stop.destination[0] : stop.destination;
      if (!dest) return null;
      return {
          // @ts-ignore
          lat: dest.latitude,
          // @ts-ignore
          lng: dest.longitude,
          // @ts-ignore
          name: dest.name
      }
  }).filter(Boolean);


  return <TripMapClient waypoints={waypoints as any} />;
}
