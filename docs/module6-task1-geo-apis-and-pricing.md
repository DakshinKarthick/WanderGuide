# Task 6.1 – Geo APIs & Pricing Core

## Goal
Provide a reusable backend foundation that wraps Geoapify Places and OpenRouteService, and exposes shared pricing utilities for accommodation and transport without tying to any specific UI.

## Scope
- Environment + configuration
  - Define required env vars for:
    - GEOAPIFY_API_KEY
    - OPENROUTESERVICE_API_KEY
  - Add brief notes to existing env/docs so onboarding is clear.
- Geoapify client wrapper
  - Create a small server-side util, e.g. `lib/geo/geoapify.ts`:
    - `searchPlaces({ categories, lon, lat, radius, limit })`
    - Handles:
      - base URL
      - attaching API key
      - error normalization (friendly message + status)
- OpenRouteService client wrapper
  - Create `lib/geo/openRouteService.ts`:
    - `getRoute({ start, end, profile })` → distance (km/m), duration (seconds) and raw API payload.
    - `getMatrix` helper is optional but useful for future extensions.
- Pricing utilities
  - Create `lib/pricing/travelPricing.ts` and `lib/pricing/accommodationPricing.ts`:
    - Accommodation:
      - `getAccommodationPriceRange(budgetLevel)` → [min, max] per night.
      - `estimateStayCost({ nights, budgetLevel })` → total.
    - Transport:
      - `estimateRoadCost(distanceKm)` using ₹8/km (car).
      - `estimateBusCost(distanceKm)` using ₹1.5/km.
      - `estimateTrainCost(distanceKm)` using ₹2.5/km.
      - `estimateFlightCost(distanceKm)` using base ₹1500 + distance factor.

## Out of Scope
- No UI components.
- No page routing logic.
- No chat integration.

## Acceptance Criteria
- All external calls to Geoapify and OpenRouteService go through the new wrappers.
- Pricing is encapsulated in utility functions (no hard-coded rates scattered around).
- If keys are missing, API wrappers fail fast with a clear error instead of silent 500s.
- Unit-level tests or small mockable helpers are possible (pure functions for pricing).
