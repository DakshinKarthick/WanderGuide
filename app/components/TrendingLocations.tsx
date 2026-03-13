"use client"

import { useEffect, useState } from "react"
import { TrendingUp, Calendar, PlusCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Destination, Event } from "@/lib/types/destination"

interface TrendingLocationsProps {
  onAddToTrip: (destination: Destination) => void
}

interface TrendingApiResponse {
  trendingDestinations: Destination[]
  upcomingEvents: Event[]
}

function eventToDestination(event: Event): Destination {
  return {
    id: `event-${event.id}`,
    name: event.name,
    city: event.city,
    state: event.state,
    region: "north",
    category: "sightseeing",
    type: "Event",
    description: event.description,
    latitude: 0,
    longitude: 0,
    rating: 4.5,
    entrance_fee: null,
    visit_duration_hours: null,
    best_time_to_visit: event.event_date,
    weekly_off: null,
    significance: event.category,
    establishment_year: null,
    has_airport_nearby: false,
    dslr_allowed: true,
    review_count_lakhs: null,
    image_url: event.image_url ?? "/placeholder.svg",
    tags: ["event", event.category],
    trending_score: 0,
  }
}

export function TrendingLocations({ onAddToTrip }: TrendingLocationsProps) {
  const [trendingLocations, setTrendingLocations] = useState<Destination[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadTrendingData() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/trending", { signal: controller.signal })

        if (!response.ok) {
          throw new Error(`Failed to fetch trending data (${response.status})`)
        }

        const payload = (await response.json()) as TrendingApiResponse
        setTrendingLocations(payload.trendingDestinations ?? [])
        setUpcomingEvents(payload.upcomingEvents ?? [])
      } catch (fetchError) {
        if (controller.signal.aborted) {
          return
        }

        setError(fetchError instanceof Error ? fetchError.message : "Failed to load trending data")
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    loadTrendingData()

    return () => controller.abort()
  }, [])

  return (
    <div className="grid gap-6 md:grid-cols-2 mt-8">
      <Card className="border-[#6A87E0] dark:border-[#5A77D0]">
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-[#4A67C0] dark:text-[#6A87E0]">
            <TrendingUp className="w-5 h-5 mr-2 text-[#4A67C0] dark:text-[#6A87E0]" />
            Trending Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Loading trending locations...</p>}
          {error && <p className="text-red-600 dark:text-red-400">{error}</p>}
          {!isLoading && !error && trendingLocations.length === 0 && <p>No trending destinations available.</p>}
          <ul className="space-y-2">
            {trendingLocations.map((location) => (
              <li key={location.id} className="flex items-center justify-between">
                <span>
                  {location.name}, {location.state}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-[#6A87E0] hover:bg-[#8AA7FF] text-white dark:bg-[#5A77D0] dark:hover:bg-[#7A97F0]"
                  onClick={() => onAddToTrip(location)}
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add to Trip
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card className="border-[#6A87E0] dark:border-[#5A77D0]">
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-[#4A67C0] dark:text-[#6A87E0]">
            <Calendar className="w-5 h-5 mr-2 text-[#4A67C0] dark:text-[#6A87E0]" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Loading upcoming events...</p>}
          {error && <p className="text-red-600 dark:text-red-400">{error}</p>}
          {!isLoading && !error && upcomingEvents.length === 0 && <p>No upcoming events available.</p>}
          <ul className="space-y-2">
            {upcomingEvents.map((event) => (
              <li key={event.id} className="flex items-center justify-between">
                <span>
                  {event.name} - {event.city}, {event.state}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-[#6A87E0] hover:bg-[#8AA7FF] text-white dark:bg-[#5A77D0] dark:hover:bg-[#7A97F0]"
                  onClick={() => onAddToTrip(eventToDestination(event))}
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add to Trip
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
