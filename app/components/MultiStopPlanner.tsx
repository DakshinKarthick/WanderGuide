"use client"

import { useState, useEffect } from "react"
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
  type DraggableProvided,
  type DroppableProvided,
} from "@hello-pangea/dnd"
import { GripVertical, X, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Destination } from "@/lib/types/destination"
import type { TransportOption } from "@/lib/types/transport"

interface MultiStopPlannerProps {
  tripStops: Destination[]
  setTripStops: React.Dispatch<React.SetStateAction<Destination[]>>
}

interface AccommodationSummary {
  id: number
  name: string
  price: number
  tags: string[]
}

interface Leg {
  origin: string
  destination: string
  transport: TransportOption | null
  accommodations?: AccommodationSummary[]
}

export function MultiStopPlanner({ tripStops, setTripStops }: MultiStopPlannerProps) {
  const [newStop, setNewStop] = useState("")
  const [legs, setLegs] = useState<Leg[]>([])
  const [totalCost, setTotalCost] = useState(0)
  const [totalDurationMinutes, setTotalDurationMinutes] = useState(0)
  const [showBreakdown, setShowBreakdown] = useState(false)

  const formatCurrency = (value: number) => {
    return Math.round(value).toLocaleString("en-IN")
  }

  const formatHours = (minutes: number) => {
    return (minutes / 60).toFixed(1)
  }

  const describeLegCost = (transport: TransportOption) => {
    const distance = transport.distanceKm.toFixed(1)
    switch (transport.mode) {
      case "car":
        return `Car – ${distance} km × ₹8/km = ₹${formatCurrency(transport.price)}`
      case "bus":
        return `Bus – ${distance} km × ₹1.5/km = ₹${formatCurrency(transport.price)}`
      case "train":
        return `Train – ${distance} km × ₹2.5/km = ₹${formatCurrency(transport.price)}`
      case "flight":
        return `Flight – base ₹1,500 + ${distance} km × ₹5/km = ₹${formatCurrency(transport.price)}`
      default:
        return `${transport.label} – ${distance} km, ₹${formatCurrency(transport.price)}`
    }
  }

  useEffect(() => {
    const fetchTransportData = async () => {
      if (tripStops.length < 2) {
        setLegs([])
        setTotalCost(0)
        setTotalDurationMinutes(0)
        return
      }

      const newLegs: Leg[] = []
      let cost = 0
      let durationMinutes = 0

      for (let i = 0; i < tripStops.length - 1; i++) {
        const origin = tripStops[i]
        const destination = tripStops[i + 1]

        let selectedTransport: TransportOption | null = null

        try {
          const hasValidCoords =
            Number.isFinite(origin.latitude) &&
            Number.isFinite(origin.longitude) &&
            Number.isFinite(destination.latitude) &&
            Number.isFinite(destination.longitude)

          const isSameLocation =
            origin.latitude === destination.latitude &&
            origin.longitude === destination.longitude

          // Skip transport lookup for synthetic or identical locations (e.g. custom
          // stops with 0,0 coordinates or duplicate destinations). This avoids
          // backend 500s like "Could not calculate distance." and simply shows
          // "Transport not available" for that leg.
          if (!hasValidCoords || isSameLocation) {
            selectedTransport = null
          } else {
            const response = await fetch("/api/transport", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                origin: { lat: origin.latitude, lon: origin.longitude },
                destination: { lat: destination.latitude, lon: destination.longitude },
              }),
            })

            if (response.ok) {
              const transportOptions: TransportOption[] = await response.json()
              selectedTransport = transportOptions.length > 0 ? transportOptions[0] : null

              if (selectedTransport) {
                cost += selectedTransport.price
                durationMinutes += selectedTransport.durationMinutes
              }
            } else {
              console.error("Failed to fetch transport options", await response.text())
            }
          }
        } catch (e) {
          console.error("Failed to fetch transport options", e)
        }

        let accommodations: AccommodationSummary[] = []
        try {
          const accommResponse = await fetch(
            `/api/accommodation?destination=${encodeURIComponent(destination.name)}`
          )
          if (accommResponse.ok) {
            const accommData: AccommodationSummary[] = await accommResponse.json()
            accommodations = accommData.slice(0, 3)
          }
        } catch (e) {
          console.error("Failed to fetch accommodations", e)
        }

        newLegs.push({
          origin: origin.name,
          destination: destination.name,
          transport: selectedTransport,
          accommodations,
        })
      }

      setLegs(newLegs)
      setTotalCost(cost)
      setTotalDurationMinutes(durationMinutes)
    }

    fetchTransportData()
  }, [tripStops])

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(tripStops)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setTripStops(items)
  }

  const addStop = () => {
    if (newStop.trim() !== "") {
      const safeId = `custom-${Date.now()}`
      setTripStops([
        ...tripStops,
        {
          id: safeId,
          name: newStop,
          city: "Custom",
          state: "",
          region: "central",
          category: "sightseeing",
          type: null,
          description: "Custom stop added manually",
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
        },
      ])
      setNewStop("")
    }
  }

  return (
    <Card className="border-[#C4D7FF]">
      <CardHeader>
        <CardTitle className="text-[#87A2FF]">Multi-Stop Trip Planner</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-4">
          <Input
            placeholder="Add a new stop"
            value={newStop}
            onChange={(e) => setNewStop(e.target.value)}
            className="border-[#C4D7FF]"
          />
          <Button onClick={addStop} className="bg-[#87A2FF] hover:bg-[#FFD7C4] text-gray-800">
            Add
          </Button>
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="stops">
            {(provided: DroppableProvided) => (
              <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {tripStops.map((stop: Destination, index: number) => (
                  <Draggable key={stop.id} draggableId={stop.id} index={index}>
                    {(provided: DraggableProvided) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="flex items-center bg-[#FFF4B5] rounded p-2 text-gray-800"
                      >
                        <span {...provided.dragHandleProps} className="mr-2">
                          <GripVertical className="w-5 h-5 text-[#87A2FF]" />
                        </span>
                        {stop.name}
                        {stop.state && `, ${stop.state}`}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-auto text-[#87A2FF] hover:bg-[#FFD7C4]"
                          onClick={() => setTripStops(tripStops.filter((s: Destination) => s.id !== stop.id))}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
        {tripStops.length > 1 && (
          <div className="mt-6 p-5 rounded-xl bg-[#5A75C0] text-white dark:bg-[#3A57B0] shadow-md border border-white/20">
            <h4 className="font-semibold text-lg mb-1">Travel &amp; Accommodation</h4>
            <p className="text-sm text-white/90">
              Total Estimated Cost: Rs. {formatCurrency(totalCost)}
            </p>
            <p className="text-sm text-white/90 mb-1">
              Total Estimated Duration: {formatHours(totalDurationMinutes)} hours
            </p>
            <Button
              variant="link"
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="px-0"
            >
              {showBreakdown ? "Hide" : "Show"} breakdown
              {showBreakdown ? (
                <ChevronUp className="w-4 h-4 ml-1" />
              ) : (
                <ChevronDown className="w-4 h-4 ml-1" />
              )}
            </Button>
            {showBreakdown && (
              <div className="mt-3 space-y-4">
                {legs.map((leg, index) => (
                  <div key={index} className="rounded-lg bg-white/5 px-4 py-3">
                    <div className="font-medium mb-1">
                      {leg.origin} to {leg.destination}
                    </div>
                    {leg.transport ? (
                      <div className="ml-1 text-sm mb-2">
                        <div>{describeLegCost(leg.transport)}</div>
                        <div>
                          Duration ≈ {formatHours(leg.transport.durationMinutes)} hours
                        </div>
                      </div>
                    ) : (
                      <div className="ml-1 text-sm mb-2">Transport not available</div>
                    )}
                    {leg.accommodations && leg.accommodations.length > 0 && (
                      <div className="ml-1 text-sm text-white/90">
                        Nearby stays:
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {leg.accommodations.map((hotel) => (
                            <div
                              key={hotel.id}
                              className="rounded-lg border border-white/40 bg-white/10 px-3 py-2 shadow-sm"
                            >
                              <div className="font-semibold text-white">
                                {hotel.name}
                              </div>
                              <div className="text-xs text-white/80">
                                Rs. {hotel.price}/night
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}



