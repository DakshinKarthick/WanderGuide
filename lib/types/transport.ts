
export interface TransportInput {
  origin: { lat: number; lon: number };
  destination: { lat: number; lon: number };
  budget?: number;
  travelStyle?: string;
}

export interface TransportOption {
  mode: 'car' | 'bus' | 'train' | 'flight';
  distanceKm: number;
  durationMinutes: number;
  price: number;
  label: string;
  tag?: 'cheapest' | 'best value' | 'fastest';
}

export type TransportResponse = TransportOption[];
