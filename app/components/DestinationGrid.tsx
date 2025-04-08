"use client"

import Image from "next/image"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

const destinations = [
  { id: 1, name: "Jaipur", state: "Rajasthan", image: "/placeholder.svg?height=400&width=600" },
  { id: 2, name: "Varanasi", state: "Uttar Pradesh", image: "/placeholder.svg?height=400&width=600" },
  { id: 3, name: "Mumbai", state: "Maharashtra", image: "/placeholder.svg?height=400&width=600" },
  { id: 4, name: "Kochi", state: "Kerala", image: "/placeholder.svg?height=400&width=600" },
  { id: 5, name: "Darjeeling", state: "West Bengal", image: "/placeholder.svg?height=400&width=600" },
  { id: 6, name: "Amritsar", state: "Punjab", image: "/placeholder.svg?height=400&width=600" },
]

export function DestinationGrid({ onDestinationClick, onAddToTrip }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {destinations.map((destination) => (
        <div
          key={destination.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 border border-[#6A87E0] dark:border-[#5A77D0]"
        >
          <div className="relative">
            <Image
              src={destination.image || "/placeholder.svg"}
              alt={destination.name}
              width={600}
              height={400}
              className="w-full h-48 object-cover"
            />
          </div>
          <div className="p-4">
            <h3 className="text-xl font-semibold text-[#4A67C0] dark:text-[#6A87E0]">{destination.name}</h3>
            <p className="text-gray-600 dark:text-gray-300">{destination.state}</p>
            <div className="flex justify-between items-center mt-2">
              <Button
                variant="link"
                className="p-0 text-[#4A67C0] dark:text-[#6A87E0]"
                onClick={() => onDestinationClick(destination)}
              >
                View Details
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="bg-[#6A87E0] hover:bg-[#8AA7FF] text-white dark:bg-[#5A77D0] dark:hover:bg-[#7A97F0]"
                onClick={() => onAddToTrip(destination)}
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add to Trip
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
