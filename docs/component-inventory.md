# WanderGuide - Component Inventory

**Date:** 2026-03-10

## Application Components (`app/components/`)

### Header (`Header.tsx`)
- **Type:** Layout Component (Server-compatible)
- **Purpose:** Top navigation bar with brand logo, navigation links, theme toggle, auth buttons
- **Props:** None
- **Dependencies:** `next/link`, `lucide-react`, `@/components/ui/button`, `ThemeToggle`
- **Routes linked:** Home (`/`), Locations (`/locations`), About (`/about`), Contact (`/contact`)
- **Issues:** Sign In/Register buttons have no functionality

### Footer (`Footer.tsx`)
- **Type:** Layout Component (Server-compatible)
- **Purpose:** 4-column footer with brand info, quick links, legal links, social links
- **Props:** None
- **Dependencies:** `next/link`
- **Issues:** None notable

### SearchBar (`SearchBar.tsx`)
- **Type:** Interactive Component (`"use client"`)
- **Purpose:** Autocomplete search input with dropdown suggestions
- **Props:** `{ className?: string }`
- **State:** `query` (string), filtered suggestions
- **Data:** Hardcoded: `["Jaipur", "Mumbai", "Goa", "Delhi", "Kolkata"]`
- **Dependencies:** `@/components/ui/input`, `lucide-react`
- **Issues:** No real search — client-side string matching against 5 items only

### Filters (`Filters.tsx`)
- **Type:** Interactive Component (`"use client"`)
- **Purpose:** Region and location type filter dropdowns
- **Props:** None (⚠️ no callbacks to parent)
- **State:** `region` (string), `locationType` (string) — isolated, not shared
- **Data:** Hardcoded: 6 regions, 6 location types
- **Dependencies:** `@/components/ui/select`, `@/components/ui/label`
- **Issues:** **Completely disconnected** — filter state is internal only, never communicated to DestinationGrid

### DestinationGrid (`DestinationGrid.tsx`)
- **Type:** Presentation Component
- **Purpose:** 3-column grid of destination cards with images and action buttons
- **Props:** `{ onDestinationClick: (destination) => void, onAddToTrip: (destination) => void }`
- **Props typed:** ❌ No TypeScript interface
- **Data:** Hardcoded 6 destinations: Jaipur, Varanasi, Mumbai, Kochi, Darjeeling, Amritsar
- **Dependencies:** `next/image`, `lucide-react`, `@/components/ui/button`
- **Issues:** All images are `/placeholder.svg`, no pagination, no filtering support

### DestinationModal (`DestinationModal.tsx`)
- **Type:** Interactive Component (`"use client"`)
- **Purpose:** Dialog showing destination details (rating, description, highlights, cost, best time)
- **Props:** `{ destination: any, onClose: () => void, onAddToTrip: (destination) => void }`
- **Props typed:** ❌ No TypeScript interface
- **Data:** Falls back to hardcoded defaults for all fields
- **Dependencies:** `@/components/ui/dialog`, `@/components/ui/button`, `next/image`, `lucide-react`
- **Issues:** All detail data is fallback values since destinations don't carry that information

### MultiStopPlanner (`MultiStopPlanner.tsx`)
- **Type:** Interactive Component (`"use client"`)
- **Purpose:** Drag-and-drop reorderable list of trip stops, manual stop addition
- **Props:** `{ tripStops: Array<{id, name, state}>, setTripStops: (stops) => void }`
- **Props typed:** ❌ No TypeScript interface
- **Dependencies:** `@hello-pangea/dnd`, `lucide-react`, `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/card`
- **Issues:** Manual add creates stops with generated IDs and no state field

### TrendingLocations (`TrendingLocations.tsx`)
- **Type:** Presentation Component
- **Purpose:** Two side-by-side cards showing trending destinations and upcoming events
- **Props:** `{ onAddToTrip: (destination) => void }`
- **Props typed:** ❌ No TypeScript interface
- **Data:** Hardcoded: 3 trending (Goa, Rishikesh, Udaipur), 3 events (Diwali, Pushkar Camel Fair, Hornbill Festival)
- **Dependencies:** `lucide-react`, `@/components/ui/card`, `@/components/ui/button`

### ThemeToggle (`ThemeToggle.tsx`)
- **Type:** Interactive Component (`"use client"`)
- **Purpose:** Dark/light mode toggle button (sun/moon icons)
- **Props:** None
- **Dependencies:** `next-themes`, `lucide-react`, `@/components/ui/button`
- **Issues:** None — works correctly

## Shared Components (`components/`)

### ThemeProvider (`theme-provider.tsx`)
- **Type:** Provider Component
- **Purpose:** Wraps `next-themes` ThemeProvider for the app
- **Used by:** `app/layout.tsx` (root layout)

### UI Primitives (`components/ui/`)

30+ shadcn/ui components installed. **Components actually used by the application:**

| Component | Used In |
|---|---|
| `accordion.tsx` | FAQ page |
| `alert.tsx` | Trip planning page |
| `button.tsx` | Throughout |
| `calendar.tsx` | Trip planning page |
| `card.tsx` | Multiple pages |
| `dialog.tsx` | DestinationModal |
| `input.tsx` | SearchBar, MultiStopPlanner, Contact |
| `label.tsx` | Filters |
| `popover.tsx` | Trip planning page |
| `select.tsx` | Filters |
| `separator.tsx` | Various |
| `tabs.tsx` | Locations page |
| `textarea.tsx` | Contact page |

**Unused UI components (installed but not referenced):**
alert-dialog, aspect-ratio, avatar, badge, breadcrumb, carousel, chart, checkbox, collapsible, command, context-menu, drawer, dropdown-menu, form, hover-card, input-otp, menubar, navigation-menu, pagination, progress, radio-group, resizable, scroll-area, sheet, sidebar, skeleton, slider, sonner, switch, table, toast, toaster, toggle, toggle-group, tooltip

## Page Components

| Page | File | Rendering | Key Interactions |
|---|---|---|---|
| Home | `app/page.tsx` | Server | Link to `/locations` |
| Locations | `app/locations/page.tsx` | Client | Full trip planning workflow |
| Trip Planning | `app/trip-planning/page.tsx` | Client | Date/day allocation |
| Trip Map | `app/trip-map/page.tsx` | Client | Interactive Leaflet map |
| About | `app/about/page.tsx` | Server | Static content |
| Contact | `app/contact/page.tsx` | Server | Dead form |
| FAQ | `app/faq/page.tsx` | Server | Accordion interactions |
| Privacy | `app/privacy/page.tsx` | Server | Stub content |
| Terms | `app/terms/page.tsx` | Server | Stub content |

---

_Generated using BMAD Method `document-project` workflow_
