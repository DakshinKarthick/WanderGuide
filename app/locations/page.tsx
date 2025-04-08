"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SearchBar } from "../components/SearchBar"
import { Filters } from "../components/Filters"
import { DestinationGrid } from "../components/DestinationGrid"
import { TrendingLocations } from "../components/TrendingLocations"
import { MultiStopPlanner } from "../components/MultiStopPlanner"
import { DestinationModal } from "../components/DestinationModal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

export default function LocationsPage() {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDestination, setSelectedDestination] = useState(null)
  const [tripStops, setTripStops] = useState([])
  const [activeTab, setActiveTab] = useState("explore")

  const addToTrip = (destination) => {
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
      router.push("/trip-planning")
    }
  }

  return (
    <div className="bg-gradient-to-br from-[#6A87E0] to-white dark:from-[#5A77D0] dark:to-gray-700 text-foreground p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white dark:text-white mb-6">Explore Incredible India</h1>
        <SearchBar className="mb-8" />
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 bg-[#6A87E0] dark:bg-[#5A77D0]">
            <TabsTrigger
              value="explore"
              className="data-[state=active]:bg-[#4A67C0] data-[state=active]:text-white dark:data-[state=active]:bg-[#3A57B0] dark:data-[state=active]:text-white"
            >
              Explore Destinations
            </TabsTrigger>
            <TabsTrigger
              value="planner"
              className="data-[state=active]:bg-[#4A67C0] data-[state=active]:text-white dark:data-[state=active]:bg-[#3A57B0] dark:data-[state=active]:text-white"
            >
              Trip Planner {tripStops.length > 0 && `(${tripStops.length})`}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="explore" className="space-y-8">
            <Filters />
            <DestinationGrid
              onDestinationClick={(destination) => {
                setSelectedDestination(destination)
                setIsModalOpen(true)
              }}
              onAddToTrip={addToTrip}
            />
          </TabsContent>
          <TabsContent value="planner">
            <MultiStopPlanner tripStops={tripStops} setTripStops={setTripStops} />
            <TrendingLocations onAddToTrip={addToTrip} />
            {tripStops.length > 0 && (
              <div className="mt-6 text-center">
                <Button
                  onClick={proceedToPlanning}
                  className="bg-[#4A67C0] hover:bg-[#6A87E0] text-white text-lg px-8 py-2"
                >
                  Continue to Trip Planning
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
