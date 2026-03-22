import { TrendingUp, Calendar, PlusCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Destination } from "@/lib/types/destination"

interface TrendingLocationsProps {
  onAddToTrip: (destination: Destination) => void
}

const toDestination = (id: string, name: string, state: string): Destination => ({
  id,
  name,
  city: name,
  state,
  region: "central",
  category: "sightseeing",
  type: null,
  description: "Popular location to include in your itinerary.",
  latitude: 0,
  longitude: 0,
  rating: 0,
  entrance_fee: null,
  visit_duration_hours: null,
  best_time_to_visit: null,
  weekly_off: null,
  significance: null,
  establishment_year: null,
  has_airport_nearby: false,
  dslr_allowed: true,
  review_count_lakhs: null,
  image_url: "/placeholder.svg",
  tags: [],
  trending_score: null,
})

export function TrendingLocations({ onAddToTrip }: TrendingLocationsProps) {
  const trendingLocations = [
    { id: "trending-goa", name: "Goa", state: "Goa" },
    { id: "trending-rishikesh", name: "Rishikesh", state: "Uttarakhand" },
    { id: "trending-udaipur", name: "Udaipur", state: "Rajasthan" },
  ]

  const upcomingEvents = [
    { id: 1, name: "Diwali Festival", location: "Delhi, Delhi" },
    { id: 2, name: "Pushkar Camel Fair", location: "Pushkar, Rajasthan" },
    { id: 3, name: "Hornbill Festival", location: "Kohima, Nagaland" },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 mt-8">
      <Card className="border-[#C4D7FF]">
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-[#87A2FF]">
            <TrendingUp className="w-5 h-5 mr-2 text-[#87A2FF]" />
            Trending Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {trendingLocations.map((location) => (
              <li key={location.id} className="flex items-center justify-between">
                <span>
                  {location.name}, {location.state}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-[#C4D7FF] hover:bg-[#FFD7C4] text-gray-800"
                  onClick={() => onAddToTrip(toDestination(location.id, location.name, location.state))}
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add to Trip
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card className="border-[#C4D7FF]">
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-[#87A2FF]">
            <Calendar className="w-5 h-5 mr-2 text-[#87A2FF]" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {upcomingEvents.map((event) => (
              <li key={event.id} className="flex items-center justify-between">
                <span>
                  {event.name} - {event.location}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-[#C4D7FF] hover:bg-[#FFD7C4] text-gray-800"
                  onClick={() =>
                    onAddToTrip(toDestination(`event-${event.id}`, event.name, event.location.split(", ")[1] ?? ""))
                  }
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

