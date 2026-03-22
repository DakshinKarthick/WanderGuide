"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SearchBar } from "../components/SearchBar"
import { Filters } from "../components/Filters"
import { DestinationGrid } from "../components/DestinationGrid"
import { TrendingLocations } from "../components/TrendingLocations"
import { MultiStopPlanner } from "../components/MultiStopPlanner"
import { DestinationModal } from "../components/DestinationModal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useDestinations } from "@/lib/hooks/useDestinations"
import type { Destination, Category, Region } from "@/lib/types/destination"
import { useTrips } from "@/lib/hooks/useTrips"
import type { CreateTripStopInput } from "@/lib/types/trip"

export default function LocationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null)
  const [tripStops, setTripStops] = useState<Destination[]>([])
  const [activeTab, setActiveTab] = useState(() =>
    searchParams.get("tab") === "planner" ? "planner" : "explore",
  )
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "saved" | "error">("idle")
  const didHydrateRef = useRef(false)
  const skipNextPersistRef = useRef(false)
  const [filters, setFilters] = useState<{
    search: string
    region: Region | "all"
    category: Category | "all"
  }>({
    search: "",
    region: "all",
    category: "all",
  })

  const { destinations, isLoading, isLoadingMore, hasMore, loadMore } = useDestinations(filters)
  const { activeTrip, isLoading: tripsLoading, isAuthenticated, createTrip, updateTrip, error: tripsError } = useTrips()

  useEffect(() => {
    if (tripsLoading || didHydrateRef.current) return

    if (isAuthenticated && activeTrip) {
      const persistedStops = (activeTrip.trip_stops ?? [])
        .slice()
        .sort((a, b) => a.stop_order - b.stop_order)
        .map((stop) => stop.destination)
        .filter((destination): destination is Destination => Boolean(destination))

      skipNextPersistRef.current = true
      setTripStops(persistedStops)
      didHydrateRef.current = true
      return
    }

    const localStops = localStorage.getItem("tripStops")
    if (localStops) {
      try {
        const parsed = JSON.parse(localStops) as Destination[]
        setTripStops(parsed)
      } catch {
        setTripStops([])
      }
    }

    didHydrateRef.current = true
  }, [tripsLoading, isAuthenticated, activeTrip])

  useEffect(() => {
    if (!didHydrateRef.current) return

    localStorage.setItem("tripStops", JSON.stringify(tripStops))

    if (!isAuthenticated) {
      setSyncStatus("idle")
      return
    }

    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false
      setSyncStatus("saved")
      return
    }

    const persistPayload: CreateTripStopInput[] = tripStops.map((stop, index) => ({
      destination_id: stop.id,
      stop_order: index + 1,
      days_allocated: 1,
    }))

    let cancelled = false

    const timer = setTimeout(async () => {
      if (!activeTrip && persistPayload.length === 0) {
        setSyncStatus("idle")
        return
      }

      setSyncStatus("syncing")

      const savedTrip = activeTrip
        ? await updateTrip(activeTrip.id, { stops: persistPayload })
        : await createTrip({ name: "My India Trip", stops: persistPayload })

      if (cancelled) return

      setSyncStatus(savedTrip ? "saved" : "error")
    }, 450)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [tripStops, isAuthenticated, activeTrip, createTrip, updateTrip])

  const addToTrip = (destination: Destination) => {
    // Check if destination is already in the trip
    if (!tripStops.some((stop) => stop.id === destination.id)) {
      setTripStops([...tripStops, destination])
      // Switch to the planner tab after adding a destination
      setActiveTab("planner")
    }
  }

  const proceedToPlanning = () => {
    if (tripStops.length > 0) {
      // Store trip stops in localStorage to access them on the trip planning page
      localStorage.setItem("tripStops", JSON.stringify(tripStops))

      if (isAuthenticated && activeTrip?.id) {
        router.push(`/trip-planning?trip=${activeTrip.id}`)
        return
      }

      router.push("/trip-planning")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-3xl font-bold tracking-tight mb-1">Explore India</h1>
          <p className="text-muted-foreground text-sm">Discover, plan, and travel to the most iconic destinations.</p>
          <SearchBar
            className="mt-5 max-w-2xl"
            value={filters.search}
            onSearchChange={(search) => setFilters((prev) => ({ ...prev, search }))}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-sm grid-cols-2 bg-muted rounded-xl p-1 h-auto">
            <TabsTrigger
              value="explore"
              className="rounded-lg py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm dark:data-[state=active]:bg-card"
            >
              Explore Destinations
            </TabsTrigger>
            <TabsTrigger
              value="planner"
              className="rounded-lg py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm dark:data-[state=active]:bg-card"
            >
              Trip Planner {tripStops.length > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-xs font-bold">
                  {tripStops.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="explore" className="space-y-6 mt-0">
            <Filters
              value={{ region: filters.region, category: filters.category }}
              onChange={(next) => setFilters((prev) => ({ ...prev, ...next }))}
            />
            <DestinationGrid
              destinations={destinations}
              isLoading={isLoading}
              isLoadingMore={isLoadingMore}
              hasMore={hasMore}
              onLoadMore={loadMore}
              onDestinationClick={(destination) => {
                setSelectedDestination(destination)
                setIsModalOpen(true)
              }}
              onAddToTrip={addToTrip}
            />
          </TabsContent>

          <TabsContent value="planner" className="mt-0">
            {!isAuthenticated && (
              <Alert className="mb-4 border-primary/20 bg-primary/5 text-primary">
                <AlertDescription className="text-sm">
                  Sign in to save trip stops to your account across devices.
                </AlertDescription>
              </Alert>
            )}

            {(syncStatus === "syncing" || syncStatus === "saved" || syncStatus === "error" || tripsError) && (
              <Alert
                className={`mb-4 text-sm ${
                  syncStatus === "error" || tripsError
                    ? "border-destructive/20 bg-destructive/5 text-destructive"
                    : "border-primary/20 bg-primary/5 text-primary"
                }`}
              >
                <AlertDescription>
                  {tripsError
                    ? tripsError
                    : syncStatus === "syncing"
                      ? "Syncing trip stops…"
                      : syncStatus === "saved"
                        ? "Trip stops saved."
                        : "Could not sync trip stops right now."}
                </AlertDescription>
              </Alert>
            )}

            <MultiStopPlanner tripStops={tripStops} setTripStops={setTripStops} />
            <TrendingLocations onAddToTrip={addToTrip} />
            {tripStops.length > 0 && (
              <div className="mt-8 text-center">
                <Button
                  onClick={proceedToPlanning}
                  size="lg"
                  className="bg-brand-gradient text-white hover:opacity-90 px-10 shadow-lg shadow-primary/20"
                >
                  Continue to Trip Planning →
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {isModalOpen && (
        <DestinationModal
          destination={selectedDestination}
          onClose={() => setIsModalOpen(false)}
          onAddToTrip={addToTrip}
        />
      )}
    </div>
  )
}
