# To run follow these steps
pnpm install
pnpm dlx shadcn@latest add "https://v0.dev/chat/b/b_Z5CIfTjSaJk"
pnpm dev
pnpm add leaflet react-leaflet leaflet-routing-machine @types/leaflet

## Destination images
The app resolves destination and event images in this order:
1. `PEXELS_API_KEY` if configured
2. `UNSPLASH_ACCESS_KEY` if configured
3. Wikimedia Commons and Wikipedia fallback

For broader coverage, add one of these keys to `.env` or `.env.local`:
- `PEXELS_API_KEY`
- `UNSPLASH_ACCESS_KEY`

---

## 🗄️ Database Administrator Notes (Pending Tasks)

**ATTENTION DB ADMIN:**
There are pending Supabase SQL migrations that need to be manually executed in the Supabase SQL Editor dashboard to fully enable the "Reviews" and "Notifications" modules.

Please run the following migration scripts located in the `supabase/migrations/` directory:
1. `008_create_notifications.sql` - Sets up the notifications table, triggers, and Row Level Security (RLS).
2. `009_create_reviews.sql` - Sets up the traveller reviews table and its respective RLS policies.

*(Ensure that the tables are created in the correct Supabase project linked to the environment variables).*

---

## Harish's Changes Summary

- Added Supabase schema, migrations, and seed SQL under `supabase/` for cities, destinations, events, trips, notifications, and reviews
- Implemented Next.js API routes for destinations, trips, trending, transport, accommodation/hotels, activities, reviews, notifications, and place-image
- Integrated Geoapify and OpenRouteService plus pricing utilities in `lib/geo*`, `lib/openrouteservice.ts`, `lib/transport.ts`, and `lib/pricing/*` for distance, time, and cost estimates
- Extended `MultiStopPlanner` and `DestinationModal` to call these APIs, showing live transport options, accommodation suggestions, and total trip cost/duration instead of pure mock data
- Upgraded the trip map to use dynamic trip stops and OSRM-based routing/summary data instead of a single hardcoded route

