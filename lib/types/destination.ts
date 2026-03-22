// lib/types/destination.ts

export type Region = 'north' | 'south' | 'east' | 'west' | 'central' | 'northeast';

export type Category =
  | 'cultural-heritage'
  | 'religious'
  | 'nature-wildlife'
  | 'adventure'
  | 'arts-science'
  | 'shopping'
  | 'sightseeing'
  | 'culinary'
  | 'sports-recreation';

export interface City {
  id: string;
  name: string;
  state: string;
  region: Region;
  latitude: number;
  longitude: number;
}

export interface Destination {
  id: string;
  name: string;
  city: string;
  state: string;
  region: Region;
  category: Category;
  type: string | null;
  description: string;
  latitude: number;
  longitude: number;
  rating: number;
  entrance_fee: number | null;
  visit_duration_hours: number | null;
  best_time_to_visit: string | null;
  weekly_off: string | null;
  significance: string | null;
  establishment_year: string | null;
  has_airport_nearby: boolean;
  dslr_allowed: boolean;
  review_count_lakhs: number | null;
  image_url: string;
  tags: string[];
  trending_score: number | null;
}

export interface Event {
  id: string;
  name: string;
  city: string;
  state: string;
  event_date: string;
  end_date: string | null;
  description: string;
  category: string;
  image_url: string | null;
  created_at: string;
}
