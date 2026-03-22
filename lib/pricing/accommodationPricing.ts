// lib/pricing/accommodationPricing.ts

import { z } from 'zod';

const BudgetLevelSchema = z.enum(['low', 'medium', 'high']);
export type BudgetLevel = z.infer<typeof BudgetLevelSchema>;

// Price ranges per night in INR
const ACCOMMODATION_RATES: Record<BudgetLevel, { min: number; max: number }> = {
  low: { min: 500, max: 1500 },
  medium: { min: 1500, max: 4000 },
  high: { min: 4000, max: 10000 },
};

export function getAccommodationPriceRange(budgetLevel: BudgetLevel): [number, number] {
  const validatedBudget = BudgetLevelSchema.parse(budgetLevel);
  const range = ACCOMMODATION_RATES[validatedBudget];
  return [range.min, range.max];
}

interface EstimateStayCostParams {
  nights: number;
  budgetLevel: BudgetLevel;
}

export function estimateStayCost({ nights, budgetLevel }: EstimateStayCostParams): { min: number; max: number } {
  if (nights <= 0) {
    return { min: 0, max: 0 };
  }
  const [minRate, maxRate] = getAccommodationPriceRange(budgetLevel);
  return {
    min: nights * minRate,
    max: nights * maxRate,
  };
}
