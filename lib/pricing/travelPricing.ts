// lib/pricing/travelPricing.ts

/**
 * All distance inputs are in kilometers.
 * All outputs are in INR.
 */

// Rate: ₹8/km
export function estimateRoadCost(distanceKm: number): number {
    return distanceKm * 8;
  }
  
  // Rate: ₹1.5/km
  export function estimateBusCost(distanceKm: number): number {
    return distanceKm * 1.5;
  }
  
  // Rate: ₹2.5/km
  export function estimateTrainCost(distanceKm: number): number {
    return distanceKm * 2.5;
  }
  
  // Base fare: ₹1500, plus a distance-based factor
  export function estimateFlightCost(distanceKm: number): number {
    const baseFare = 1500;
    // A simple model: cost increases with distance, but not linearly.
    // This is a placeholder for a more complex model.
    const distanceFactor = distanceKm * 3.5; 
    return baseFare + distanceFactor;
  }
  