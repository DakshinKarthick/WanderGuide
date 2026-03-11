// lib/constants.ts — App-wide constants, enums, and lookup maps

import type { Region, Category } from '@/lib/types/destination';

// ── Regions ──────────────────────────────────────────────────────────

export const REGIONS: Region[] = [
  'north', 'south', 'east', 'west', 'central', 'northeast',
];

export const REGION_LABELS: Record<Region, string> = {
  north: 'North India',
  south: 'South India',
  east: 'East India',
  west: 'West India',
  central: 'Central India',
  northeast: 'Northeast India',
};

// ── Categories ───────────────────────────────────────────────────────

export const CATEGORIES: Category[] = [
  'cultural-heritage', 'religious', 'nature-wildlife', 'adventure',
  'arts-science', 'shopping', 'sightseeing', 'culinary', 'sports-recreation',
];

export const CATEGORY_LABELS: Record<Category, string> = {
  'cultural-heritage': 'Cultural & Heritage',
  religious: 'Religious & Spiritual',
  'nature-wildlife': 'Nature & Wildlife',
  adventure: 'Adventure & Outdoor',
  'arts-science': 'Arts, Science & Literature',
  shopping: 'Shopping & Markets',
  sightseeing: 'Sightseeing & Exploration',
  culinary: 'Culinary & Food',
  'sports-recreation': 'Sports & Recreation',
};

// ── State → Region Lookup ────────────────────────────────────────────

export const STATE_TO_REGION: Record<string, Region> = {
  'Delhi': 'north',
  'Haryana': 'north',
  'Himachal Pradesh': 'north',
  'Jammu and Kashmir': 'north',
  'Ladakh': 'north',
  'Punjab': 'north',
  'Rajasthan': 'north',
  'Uttarakhand': 'north',
  'Chandigarh': 'north',

  'Andhra Pradesh': 'south',
  'Karnataka': 'south',
  'Kerala': 'south',
  'Tamil Nadu': 'south',
  'Telangana': 'south',
  'Puducherry': 'south',
  'Andaman and Nicobar': 'south',
  'Lakshadweep': 'south',

  'Bihar': 'east',
  'Jharkhand': 'east',
  'Odisha': 'east',
  'West Bengal': 'east',

  'Goa': 'west',
  'Gujarat': 'west',
  'Maharashtra': 'west',
  'Daman and Diu': 'west',
  'Dadra and Nagar Haveli': 'west',

  'Chhattisgarh': 'central',
  'Madhya Pradesh': 'central',
  'Uttar Pradesh': 'central',

  'Arunachal Pradesh': 'northeast',
  'Assam': 'northeast',
  'Manipur': 'northeast',
  'Meghalaya': 'northeast',
  'Mizoram': 'northeast',
  'Nagaland': 'northeast',
  'Sikkim': 'northeast',
  'Tripura': 'northeast',
};

// ── Trip Statuses ────────────────────────────────────────────────────

export const TRIP_STATUSES = ['planning', 'upcoming', 'active', 'completed', 'cancelled'] as const;

export const TRIP_STATUS_LABELS: Record<string, string> = {
  planning: 'Planning',
  upcoming: 'Upcoming',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

// ── Pagination ───────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 12;
export const SEARCH_DEBOUNCE_MS = 300;

// ── Travel Preferences (for onboarding) ──────────────────────────────

export const TRAVEL_STYLES = ['adventure', 'relaxation', 'culture', 'luxury', 'budget', 'family'] as const;
export const CLIMATES = ['tropical', 'temperate', 'cold', 'desert', 'any'] as const;
export const BUDGETS = ['budget', 'mid-range', 'luxury', 'any'] as const;
