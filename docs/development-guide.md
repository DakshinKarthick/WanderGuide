# WanderGuide - Development Guide

**Date:** 2026-03-10

## Prerequisites

- **Node.js** 18.x or later
- **pnpm** 9.x or later (preferred package manager)

## Getting Started

```bash
# Clone the repository
git clone <repo-url>
cd WanderGuide

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app runs at `http://localhost:3000` by default.

## Available Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start Next.js dev server with hot reload |
| `pnpm build` | Production build (ESLint & TS checks disabled) |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |

## Project Structure

```
app/              → Next.js App Router pages and app-level components
components/       → Shared components (shadcn/ui primitives + theme provider)
hooks/            → Custom React hooks
lib/              → Utility functions
public/           → Static assets
styles/           → Additional styles (currently redundant with app/globals.css)
docs/             → Project documentation (BMAD output)
bmad/             → BMAD Method configuration
```

## Key Development Patterns

### Adding a New Page
Create `app/{route}/page.tsx`. For client-side interactivity, add `"use client"` directive.

### Adding a shadcn/ui Component
```bash
pnpm dlx shadcn@latest add <component-name>
```
Components are installed to `components/ui/`.

### Styling
- Use Tailwind CSS utility classes
- Theme colors defined as CSS custom properties in `app/globals.css`
- Dark mode via `dark:` prefix (class-based strategy)
- Access theme colors: `bg-primary`, `text-primary`, etc.

### State Management
Currently all component-level `useState`. Cross-page data passes through `localStorage`.

## Build Configuration Notes

In `next.config.mjs`:
- `eslint.ignoreDuringBuilds: true` — ESLint errors won't break builds
- `typescript.ignoreBuildErrors: true` — Type errors won't break builds
- `images.unoptimized: true` — Next.js Image optimization disabled

## Known Issues

1. Duplicate `globals.css` imports in `app/layout.tsx` (imported twice)
2. `styles/globals.css` duplicates `app/globals.css`
3. Many unused dependencies in `package.json`
4. No test framework configured
5. No environment variables or `.env` file

---

_Generated using BMAD Method `document-project` workflow_
