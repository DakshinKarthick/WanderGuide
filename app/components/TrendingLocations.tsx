"use client"

import { TrendingUp, Calendar, PlusCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function TrendingLocations({ onAddToTrip }) {
  const trendingLocations = [
    { id: 1, name: "Goa", state: "Goa" },
    { id: 2, name: "Rishikesh", state: "Uttarakhand" },
    { id: 3, name: "Udaipur", state: "Rajasthan" },
  ]

  const upcomingEvents = [
    { id: 1, name: "Diwali Festival", location: "Delhi, Delhi" },
    { id: 2, name: "Pushkar Camel Fair", location: "Pushkar, Rajasthan" },
    { id: 3, name: "Hornbill Festival", location: "Kohima, Nagaland" },
  ]

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
          <ul className="space-y-2">
            {upcomingEvents.map((event) => (
              <li key={event.id} className="flex items-center justify-between">
                <span>
                  {event.name} - {event.location}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-[#6A87E0] hover:bg-[#8AA7FF] text-white dark:bg-[#5A77D0] dark:hover:bg-[#7A97F0]"
                  onClick={() =>
                    onAddToTrip({ id: `event-${event.id}`, name: event.name, state: event.location.split(", ")[1] })
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
