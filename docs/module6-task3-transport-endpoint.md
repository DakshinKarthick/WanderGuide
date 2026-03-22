# Task 6.3 – Transport Options & Pricing Endpoint

## Goal
Create a transport recommendation endpoint that suggests road/train/flight options between two locations, using Geoapify to find hubs, OpenRouteService to measure distance/time, and internal logic to choose suitable modes and prices.

## Scope
- API route
  - Add `/api/transport` under `app/api/transport/route.ts`.
  - Input:
    - `origin` and `destination` coordinates (or IDs resolvable to lat/lon).
    - Optional `budget` / `travelStyle` hints.
  - Output:
    - A list of options, e.g.:
      - `{ mode: 'car' | 'bus' | 'train' | 'flight', distanceKm, durationMinutes, price, label }`.
    - Indicate comparative tags: `"cheapest"`, `"best value"`, `"fastest"`.
- Geoapify integration
  - Use wrapper from Task 6.1 to optionally:
    - Discover nearby airports or bus/rail hubs for origin/destination.
    - Categories: `transport.airport, transport.public_transport`.
- OpenRouteService integration
  - Use wrapper to get distance & duration for at least one driving profile.
  - Use that distance as the base for pricing (all modes), even if some are simulated.
- Mode selection logic
  - Based on distance:
    - `< 300 km` → Road-dominant; highlight car/bus.
    - `300–800 km` → Train option emphasized.
    - `> 800 km` → Flight emphasized.
- Pricing logic
  - Use shared pricing utils (Task 6.1):
    - Car → ₹8/km.
    - Bus → ₹1.5/km.
    - Train → ₹2.5/km.
    - Flight → base ₹1500 + distance factor.
  - Compute:
    - Per-mode `price` and `durationMinutes`.
    - Mark cheapest and fastest options.

## Out of Scope
- UI drag-and-drop or map rendering.
- Multi-leg complex itineraries (assume single origin-destination pair for now).

## Acceptance Criteria
- `/api/transport` returns at least road + train + flight objects for long distances.
- Modes obey distance thresholds for recommendation emphasis.
- Price and duration values are internally consistent (e.g., flight always fastest when distance is large).
- API gracefully handles bad coordinates and upstream API failures.
