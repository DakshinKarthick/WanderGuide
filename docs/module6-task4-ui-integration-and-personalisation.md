# Task 6.4 – UI Integration & Personalised Experience

## Goal
Wire the accommodation and transport endpoints into the existing UI (DestinationModal, MultiStopPlanner, chatbot) so users see contextual recommendations and cost comparisons while planning trips.

## Scope
- Destination details integration
  - Extend `DestinationModal.tsx` to:
    - Fetch `/api/hotels` for the selected destination + user budget.
    - Fetch `/api/transport` for relevant origin–destination context (e.g., previous stop → this stop, or home city → destination).
    - Display:
      - Top 3–5 accommodations with price/night and basic tags.
      - Transport options list with mode, price, duration, and badges (cheapest/best value/fastest).
- MultiStopPlanner integration
  - Use `/api/transport` to:
    - Show cumulative estimated travel cost and duration across all legs in the planner.
    - Optionally show per-leg breakdown (hover/expand) for power users.
- Chatbot integration (if present)
  - Expose helper function(s) the chatbot can call server-side:
    - `getAccommodationSummary(destination, budget)`.
    - `getTransportSummary(origin, destination, budget/style)`.
  - Chatbot can stitch human-readable explanations (no direct API calls from client messages).
- Personalisation layer
  - Respect:
    - Stored user budget preference (if available in profile or settings).
    - Trip duration (from `/trip-planning`) to tune:
      - Recommended stay lengths per city.
      - Warnings if combined accommodation costs exceed a notional budget.
- UX considerations
  - Loading states for hotel/transport requests.
  - Error states with retry/explanation instead of blank sections.

## Out of Scope
- Persisting chosen hotels/transport as bookings.
- Complex budget management UI.

## Acceptance Criteria
- From a destination view, user can see hotels and transport options powered by the new APIs.
- In the multi-stop planner, total estimated travel time and cost update when the itinerary changes.
- Chatbot (if used) can mention realistic accommodation and transport suggestions in its responses using the same data sources.
- All UI calls are debounced or scoped to avoid spamming external APIs (e.g., only fire when a destination is fully selected).
