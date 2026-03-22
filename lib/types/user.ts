// lib/types/user.ts

export interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  travel_style: 'adventure' | 'relaxation' | 'culture' | 'luxury' | 'budget' | 'family' | null;
  preferred_climate: 'tropical' | 'temperate' | 'cold' | 'desert' | 'any' | null;
  preferred_budget: 'budget' | 'mid-range' | 'luxury' | 'any' | null;
  onboarding_completed: boolean;
}
