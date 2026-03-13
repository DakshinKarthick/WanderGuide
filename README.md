# To run follow these steps
npm install --legacy-peer-deps
npm install -g pnpm
npx shadcn@latest add "https://v0.dev/chat/b/b_Z5CIfTjSaJk"
npm i
npm run dev
npm install leaflet react-leaflet leaflet-routing-machine @types/leaflet --legacy-peer-deps

## Destination images
The app resolves destination and event images in this order:
1. `PEXELS_API_KEY` if configured
2. `UNSPLASH_ACCESS_KEY` if configured
3. Wikimedia Commons and Wikipedia fallback

For broader coverage, add one of these keys to `.env` or `.env.local`:
- `PEXELS_API_KEY`
- `UNSPLASH_ACCESS_KEY`