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

# Set environment variables for build time (if needed)
# ARG NEXT_PUBLIC_SUPABASE_AUTH_URL
# ARG NEXT_PUBLIC_SUPABASE_AUTH_ANON_KEY
# ENV NEXT_PUBLIC_SUPABASE_AUTH_URL=$NEXT_PUBLIC_SUPABASE_AUTH_URL
# ENV NEXT_PUBLIC_SUPABASE_AUTH_ANON_KEY=$NEXT_PUBLIC_SUPABASE_AUTH_ANON_KEY

# Build the application
RUN pnpm build

# Stage 2: Runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Re-install pnpm if needed for some standalone scripts (optional)
# RUN npm install -g pnpm

# Copy standalone build from builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
