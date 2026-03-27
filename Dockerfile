# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Set environment variables for build time
ARG NEXT_PUBLIC_SUPABASE_AUTH_URL=https://placeholder.supabase.co
ARG NEXT_PUBLIC_SUPABASE_AUTH_ANON_KEY=placeholder
ARG GEOAPIFY_API_KEY=placeholder
ARG OPENROUTESERVICE_API_KEY=placeholder

ENV NEXT_PUBLIC_SUPABASE_AUTH_URL=$NEXT_PUBLIC_SUPABASE_AUTH_URL
ENV NEXT_PUBLIC_SUPABASE_AUTH_ANON_KEY=$NEXT_PUBLIC_SUPABASE_AUTH_ANON_KEY
ENV GEOAPIFY_API_KEY=$GEOAPIFY_API_KEY
ENV OPENROUTESERVICE_API_KEY=$OPENROUTESERVICE_API_KEY

# Build the application
RUN pnpm build

# Stage 2: Runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Use the Next standalone build output (produces server.js) so runtime
# doesn't need the `next` binary. This matches Next's `output: 'standalone'`.

# Copy the standalone server produced by the builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Expose and honor the PORT env (Railway and other PaaS inject PORT)
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the standalone server (server.js) binding to the injected PORT
CMD ["node", "server.js"]
