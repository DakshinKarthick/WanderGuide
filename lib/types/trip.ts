// lib/types/trip.ts

import type { Destination } from './destination';

export interface Trip {
  id: string;
  user_id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  status: 'planning' | 'upcoming' | 'active' | 'completed' | 'cancelled';
  total_budget: number | null;
  notes: string | null;
  trip_stops?: TripStop[];
  created_at: string;
  updated_at: string;
}

export interface TripStop {
  id: string;
  trip_id: string;
  destination_id: string;
  destination?: Destination;
  stop_order: number;
  days_allocated: number;
  notes: string | null;
}
