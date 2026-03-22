# Task 6.2 – Accommodation Recommendations Endpoint

## Goal
Implement a backend endpoint that returns hotel/accommodation recommendations for a given destination, applying user budget and basic travel-style preferences using Geoapify data and custom pricing logic.

## Scope
- API route
  - Add `/api/hotels` (or `/api/accommodation`) under `app/api/hotels/route.ts`.
  - Input (query/body):
    - `destinationId` or explicit `lat`, `lon`.
    - `budget` enum: `"low" | "medium" | "luxury"`.
    - Optional `style` or tags (e.g., `"solo"`, `"family"`, `"backpacker"`).
  - Output:
    - Normalized list of hotel-like accommodations:
      - `id`, `name`, `address`, `lat`, `lon`.
      - `pricePerNight` (₹), `budgetTier`, `tags` (e.g., `"best value"`, `"budget"`, `"premium"`).
- Integration with Geoapify
  - Use Geoapify Places via Task 6.1 wrapper with:
    - `categories=accommodation.hotel`.
    - `filter=circle:lon,lat,radius` (radius configurable, e.g., 2000–5000 meters).
  - Map Geoapify response into a clean internal type.
- Pricing & preference logic
  - Apply pricing bands:
    - Budget → ₹500–₹1500.
    - Medium → ₹2000–₹5000.
    - Luxury → ₹6000+.
  - Optionally use randomness or weight by rating to avoid identical prices.
  - Add basic preference tagging:
    - e.g. more central locations or higher ratings get `"best value"`.
- Error handling
  - Return structured error JSON on:
    - Geoapify failure.
    - Invalid/missing coordinates.

## Out of Scope
- No direct UI wiring (DestinationModal, etc.).
- No booking or availability logic.

## Acceptance Criteria
- Calling `/api/hotels` with valid destination and budget returns a list of 5–20 accommodations.
- Response includes deterministic price bands aligned with the budget level.
- Endpoint is safe to call client-side (no key leakage via public envs).
- Clear 4xx/5xx responses with helpful `error` messages when inputs or APIs fail.
