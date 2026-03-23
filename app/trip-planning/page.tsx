"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import { 
  CalendarIcon, 
  ArrowLeft, 
  Plus, 
  Minus, 
  Save, 
  MapPin, 
  Clock, 
  Ticket, 
  Calculator, 
  Truck, 
  Hotel, 
  Info 
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useTrips } from "@/lib/hooks/useTrips"
import type { Destination } from "@/lib/types/destination"
import type { CreateTripStopInput, TripActivity, TripStop } from "@/lib/types/trip"
import { ActivityPlanner } from "./ActivityPlanner"

const TripMapClient = dynamic(() => import("../trip-map/TripMapClient"), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full bg-[#1E293B] rounded-2xl flex items-center justify-center border border-slate-800 text-slate-400">Loading interactive map and travel summary...</div>
})

export default function TripPlanningPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading trip planner...</div>}>
      <TripPlanningContent />
    </Suspense>
  )
}

function TripPlanningContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedTripId = searchParams.get("trip") ?? undefined
  const { 
    activeTrip, 
    isLoading, 
    isAuthenticated, 
    createTrip, 
    updateTrip, 
    addActivity, 
    updateActivity, 
    deleteActivity, 
    error: tripError 
  } = useTrips(selectedTripId)

  const [tripStops, setTripStops] = useState<Destination[]>([])
  const [dbStops, setDbStops] = useState<TripStop[]>([])
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [dayAllocations, setDayAllocations] = useState<Record<string, number>>({})
  const [totalBudget, setTotalBudget] = useState<number | undefined>(undefined)
  const [budgetTier, setBudgetTier] = useState<"low" | "medium" | "luxury">("medium")
  const [error, setError] = useState("")
  const [saveMessage, setSaveMessage] = useState("")
  const [nearbyAttractions, setNearbyAttractions] = useState<Record<string, { database: any[], external: any[] }>>({})
  const [loadingNearby, setLoadingNearby] = useState<Record<string, boolean>>({})

  const fetchNearby = async (stop: Destination) => {
    if (nearbyAttractions[stop.id]) return;
    
    setLoadingNearby(prev => ({ ...prev, [stop.id]: true }));
    try {
      const response = await fetch(`/api/destinations/nearby?city=${encodeURIComponent(stop.city)}&lat=${stop.latitude}&lon=${stop.longitude}`);
      if (response.ok) {
        const data = await response.json();
        setNearbyAttractions(prev => ({ ...prev, [stop.id]: data }));
      }
    } catch (err) {
      console.error("Failed to fetch nearby attractions", err);
    } finally {
      setLoadingNearby(prev => ({ ...prev, [stop.id]: false }));
    }
  }

  const hydrateFromLocalStorage = () => {
    const savedTripStops = localStorage.getItem("tripStops")
    if (!savedTripStops) {
      setTripStops([])
      setDayAllocations({})
      return
    }

    try {
      const parsedStops = JSON.parse(savedTripStops) as Destination[]
      setTripStops(parsedStops)

      const initialAllocations: Record<string, number> = {}
      parsedStops.forEach((stop) => {
        initialAllocations[stop.id] = 1
      })
      setDayAllocations(initialAllocations)
    } catch {
      setTripStops([])
      setDayAllocations({})
    }
  }

  useEffect(() => {
    const hasLocalDraft = Boolean(localStorage.getItem("tripStops"))

    if (selectedTripId && activeTrip) {
      const sortedStops = (activeTrip.trip_stops ?? []).slice().sort((a, b) => a.stop_order - b.stop_order)
      setDbStops(sortedStops)

      const destinations = sortedStops
        .map((stop) => stop.destination)
        .filter((destination): destination is Destination => Boolean(destination))

      setTripStops(destinations)
      setStartDate(activeTrip.start_date ? new Date(`${activeTrip.start_date}T00:00:00`) : undefined)
      setEndDate(activeTrip.end_date ? new Date(`${activeTrip.end_date}T00:00:00`) : undefined)
      setTotalBudget(activeTrip.total_budget || undefined)

      const allocationMap: Record<string, number> = {}
      sortedStops.forEach((stop) => {
        allocationMap[stop.destination_id] = Math.max(1, stop.days_allocated || 1)
      })
      setDayAllocations(allocationMap)
      return
    }

    if (!selectedTripId && hasLocalDraft) {
      hydrateFromLocalStorage()
      return
    }

    if (activeTrip) {
      const sortedStops = (activeTrip.trip_stops ?? []).slice().sort((a, b) => a.stop_order - b.stop_order)
      setDbStops(sortedStops)

      const destinations = sortedStops
        .map((stop) => stop.destination)
        .filter((destination): destination is Destination => Boolean(destination))

      setTripStops(destinations)
      setStartDate(activeTrip.start_date ? new Date(`${activeTrip.start_date}T00:00:00`) : undefined)
      setEndDate(activeTrip.end_date ? new Date(`${activeTrip.end_date}T00:00:00`) : undefined)
      setTotalBudget(activeTrip.total_budget || undefined)

      const allocationMap: Record<string, number> = {}
      sortedStops.forEach((stop) => {
        allocationMap[stop.destination_id] = Math.max(1, stop.days_allocated || 1)
      })
      setDayAllocations(allocationMap)
      return
    }

    if (!isLoading) {
      hydrateFromLocalStorage()
    }
  }, [activeTrip, isLoading, selectedTripId])

  useEffect(() => {
    // Initialize missing day allocations when stops change
    if (tripStops.length > 0) {
      setDayAllocations((current) => {
        const nextAllocations: Record<string, number> = {}
        tripStops.forEach((stop) => {
          nextAllocations[stop.id] = current[stop.id] || 1
        })
        return nextAllocations
      })
    }
  }, [tripStops])

  const getTotalDays = () => {
    if (!startDate || !endDate) return 0
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  const getAllocatedDays = () => {
    return Object.values(dayAllocations).reduce((sum, days) => sum + Number(days), 0)
  }

  const handleDayChange = (id: string, value: string) => {
    const days = Math.max(1, Number.parseInt(value) || 1)
    setDayAllocations({
      ...dayAllocations,
      [id]: days,
    })
  }

  const incrementDays = (id: string) => {
    setDayAllocations({
      ...dayAllocations,
      [id]: (dayAllocations[id] || 1) + 1,
    })
  }

  const decrementDays = (id: string) => {
    if (dayAllocations[id] > 1) {
      setDayAllocations({
        ...dayAllocations,
        [id]: dayAllocations[id] - 1,
      })
    }
  }

  const toIsoDate = (date: Date | undefined) => (date ? format(date, "yyyy-MM-dd") : null)

  const buildStopsPayload = (): CreateTripStopInput[] => {
    return tripStops.map((stop, index) => ({
      destination_id: stop.id,
      stop_order: index + 1,
      days_allocated: Math.max(1, dayAllocations[stop.id] || 1),
    }))
  }

  const validateAndSave = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates for your trip.")
      setSaveMessage("")
      return
    }

    const totalDays = getTotalDays()
    const allocatedDays = getAllocatedDays()

    if (allocatedDays > totalDays) {
      setError(`You've allocated ${allocatedDays} days, but your trip is only ${totalDays} days long.`)
      setSaveMessage("")
      return
    }

    setError("")
    setSaveMessage("")

    const tripPlan = {
      tripStops,
      startDate,
      endDate,
      dayAllocations,
    }

    if (!isAuthenticated) {
      localStorage.setItem("tripPlan", JSON.stringify(tripPlan))
      setSaveMessage("Trip plan saved locally. Sign in to sync it to your account.")
      return
    }

    const payload = {
      start_date: toIsoDate(startDate),
      end_date: toIsoDate(endDate),
      total_budget: totalBudget || null,
      stops: buildStopsPayload(),
    }

    if (activeTrip) {
      const updatedTrip = await updateTrip(activeTrip.id, payload)
      if (!updatedTrip) {
        setError("Unable to save trip updates right now. Please try again.")
        return
      }
      setSaveMessage("Trip plan updated successfully.")
      return
    }

    const createdTrip = await createTrip({
      name: "My India Trip",
      ...payload,
    })

    if (!createdTrip) {
      setError("Unable to create your trip right now. Please try again.")
      return
    }

    setSaveMessage("Trip plan created and saved to your account.")
    localStorage.removeItem("tripStops")
  }

  const remainingDays = getTotalDays() - getAllocatedDays()

  const calculateActivitiesCost = () => {
    return dbStops.reduce((total, stop) => {
      const stopActivitiesCost = stop.activities?.reduce((sum, activity) => sum + (activity.cost || 0), 0) || 0
      return total + stopActivitiesCost
    }, 0)
  }

  const calculateEstimatedAccommodationCost = () => {
    const tierRates = { low: 1000, medium: 2500, luxury: 7000 }
    const avgPricePerNight = tierRates[budgetTier]
    const totalNights = getAllocatedDays()
    return totalNights * avgPricePerNight
  }

  const calculateTransportCost = () => {
    // Basic estimation for transport based on number of stops
    return tripStops.length > 1 ? (tripStops.length - 1) * 3500 : 0
  }

  const activitiesCost = calculateActivitiesCost()
  const accommodationCost = calculateEstimatedAccommodationCost()
  const transportCost = calculateTransportCost()
  const totalEstimatedCost = activitiesCost + accommodationCost + transportCost

  return (
    <div className="min-h-screen bg-[#0F172A] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/locations")}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-4xl font-bold text-[#6366F1]">Plan Your Trip</h1>
          </div>
        </header>

        {/* Map Integration Section */}
        <section className="mb-8 bg-[#1E293B] rounded-2xl overflow-hidden border border-slate-800 h-[600px]">
          {tripStops.length > 0 ? (
            <TripMapClient
              embedded={true}
              waypoints={tripStops.map((stop) => ({
                id: stop.id,
                lat: stop.latitude,
                lng: stop.longitude,
                name: stop.name,
              }))}
              onWaypointsChange={(newWaypoints) => {
                const newStops = newWaypoints
                  .map(wp => tripStops.find(t => t.id === wp.id))
                  .filter(Boolean) as Destination[];
                setTripStops(newStops);
                if (!activeTrip) {
                  localStorage.setItem("tripStops", JSON.stringify(newStops));
                }
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
              <MapPin className="h-16 w-16 mb-4 text-slate-500 opacity-50" />
              <h3 className="text-xl font-bold text-slate-300 mb-2">No Destinations Selected</h3>
              <p>Add destinations to your trip to see them on the map, visualize your route, and calculate travel times between stops.</p>
            </div>
          )}
        </section>

        {tripError && (
          <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/50 text-red-200">
            <AlertDescription>{tripError}</AlertDescription>
          </Alert>
        )}

        {saveMessage && (
          <Alert className="mb-6 border-green-500/50 bg-green-500/10 text-green-200">
            <AlertDescription>{saveMessage}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            {/* Trip Dates */}
            <section className="bg-[#1E293B] rounded-2xl p-6 border border-slate-800">
              <h2 className="text-xl font-semibold mb-6">Trip Dates</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-400">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-[#0F172A] border-slate-700 hover:bg-[#1E293B] text-white"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-[#6366F1]" />
                        {startDate ? format(startDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[#1E293B] border-slate-700">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => setStartDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-[#0F172A] border-slate-700 hover:bg-[#1E293B] text-white"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-[#6366F1]" />
                        {endDate ? format(endDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[#1E293B] border-slate-700">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => setEndDate(date)}
                        initialFocus
                        disabled={(date) => (startDate ? date < startDate : false)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </section>

            {/* Activity Planning */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-[#6366F1]">Activity Planning</h2>
              <div className="space-y-4">
                {tripStops.length === 0 ? (
                  <div className="bg-[#1E293B] rounded-2xl p-8 border border-dashed border-slate-700 text-center">
                    <p className="text-slate-400">No destinations added yet. Go back to locations to add some!</p>
                  </div>
                ) : (
                  tripStops.map((stop) => {
                    const dbStop = dbStops.find((s) => s.destination_id === stop.id)
                    const allocatedDays = dayAllocations[stop.id] || 1

                    return (
                      <div key={stop.id} className="bg-[#1E293B] rounded-2xl overflow-hidden border border-slate-800 flex flex-col group">
                        <div className="flex flex-col md:flex-row">
                          <div className="w-full md:w-64 relative h-48 md:h-auto overflow-hidden">
                            <img
                              src={stop.image_url || "/placeholder.svg"}
                              alt={stop.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute top-3 left-3">
                              <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                                {stop.category || "Sightseeing"}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 p-6 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-xl font-bold">{stop.name}</h3>
                                <p className="text-slate-400 text-sm flex items-center gap-1">
                                  <MapPin className="h-3 w-3" /> {stop.city}, {stop.state}
                                </p>
                              </div>
                              <div className="flex items-center bg-[#0F172A] rounded-lg p-1 border border-slate-700">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => decrementDays(stop.id)}
                                  className="h-7 w-7 text-slate-400 hover:text-white"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center font-bold text-sm">{allocatedDays}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => incrementDays(stop.id)}
                                  className="h-7 w-7 text-slate-400 hover:text-white"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                                <span className="text-[10px] font-bold text-slate-500 mr-2 uppercase">Days</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-6 mt-4">
                              <div className="flex items-center gap-2">
                                <div className="bg-amber-500/10 p-1.5 rounded-lg">
                                  <Clock className="h-4 w-4 text-amber-500" />
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase font-bold text-slate-500 leading-none">Duration</p>
                                  <p className="text-sm font-semibold">{stop.visit_duration_hours || "2"} hours</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="bg-emerald-500/10 p-1.5 rounded-lg">
                                  <Ticket className="h-4 w-4 text-emerald-500" />
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase font-bold text-slate-500 leading-none">Entry Fee</p>
                                  <p className="text-sm font-semibold">₹{stop.entrance_fee || "0"}</p>
                                </div>
                              </div>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button 
                                    variant="link" 
                                    onClick={() => fetchNearby(stop)}
                                    className="text-[#6366F1] p-0 h-auto text-sm font-bold hover:no-underline hover:text-[#818cf8]"
                                  >
                                    {loadingNearby[stop.id] ? "Loading..." : "Show Nearby Attractions"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 bg-[#1E293B] border-slate-700 text-white p-4 shadow-2xl">
                                  <h4 className="font-bold text-sm mb-3 border-b border-slate-700 pb-2">Nearby in {stop.city}</h4>
                                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                    {/* Database attractions */}
                                    {nearbyAttractions[stop.id]?.database?.filter(d => d.id !== stop.id).length > 0 && (
                                      <div className="space-y-2">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">From WanderGuide</p>
                                        {nearbyAttractions[stop.id].database.filter(d => d.id !== stop.id).map(d => (
                                          <div key={d.id} className="p-2 rounded bg-[#0F172A] border border-slate-800 flex items-center justify-between">
                                            <span className="text-xs font-medium truncate mr-2">{d.name}</span>
                                            <Button size="icon" variant="ghost" className="h-6 w-6 text-[#6366F1]" onClick={() => {
                                              if (!tripStops.some(s => s.id === d.id)) {
                                                const newStops = [...tripStops, d];
                                                setTripStops(newStops);
                                                localStorage.setItem("tripStops", JSON.stringify(newStops));
                                              }
                                            }}>
                                              <Plus className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* External attractions */}
                                    {nearbyAttractions[stop.id]?.external?.length > 0 && (
                                      <div className="space-y-2">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Other Points of Interest</p>
                                        {nearbyAttractions[stop.id].external.map(p => (
                                          <div key={p.id} className="p-2 rounded bg-[#0F172A] border border-slate-800">
                                            <p className="text-xs font-medium">{p.name}</p>
                                            <p className="text-[10px] text-slate-500 truncate">{p.address}</p>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {!loadingNearby[stop.id] && 
                                      (!nearbyAttractions[stop.id]?.database?.filter(d => d.id !== stop.id).length) && 
                                      (!nearbyAttractions[stop.id]?.external?.length) && (
                                      <p className="text-xs text-slate-400 italic">No other nearby attractions found.</p>
                                    )}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>
                        </div>
                        
                        {/* Day-by-day Activity Planner Accordion */}
                        <div className="border-t border-slate-800 bg-[#16202e]">
                          <Accordion type="single" collapsible className="px-6">
                            <AccordionItem value="activities" className="border-none">
                              <AccordionTrigger className="text-xs font-bold uppercase text-slate-500 py-3 hover:no-underline hover:text-slate-300">
                                Plan Daily Activities ({allocatedDays} Days)
                              </AccordionTrigger>
                              <AccordionContent className="pb-6">
                                {dbStop ? (
                                  <div className="space-y-6">
                                    {Array.from({ length: allocatedDays }).map((_, i) => (
                                      <div key={`${stop.id}-day-${i + 1}`} className="bg-[#0F172A] rounded-xl p-4 border border-slate-800/50">
                                        <ActivityPlanner
                                          stop={dbStop}
                                          dayNumber={i + 1}
                                          activities={dbStop.activities || []}
                                          onAddActivity={addActivity}
                                          onUpdateActivity={updateActivity}
                                          onDeleteActivity={deleteActivity}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-4">
                                    <p className="text-sm text-slate-400 italic">Save your trip plan to start adding daily activities.</p>
                                  </div>
                                )}
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </section>
          </div>

          <aside className="lg:col-span-4 space-y-8">
            {/* Budget Estimation */}
            <section className="bg-[#1E293B] rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
              <div className="bg-[#312E81] p-4 flex items-center gap-3">
                <Calculator className="h-5 w-5" />
                <h2 className="font-bold">Budget Estimation</h2>
              </div>
              <div className="p-6 space-y-8">
                <div className="flex justify-center">
                  <div className="bg-[#0F172A] p-1 rounded-xl flex border border-slate-700">
                    {(["low", "medium", "luxury"] as const).map((tier) => (
                      <button
                        key={tier}
                        onClick={() => setBudgetTier(tier)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                          budgetTier === tier 
                            ? "bg-[#6366F1] text-white shadow-lg" 
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {tier.charAt(0).toUpperCase() + tier.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-500/10 p-3 rounded-xl">
                        <Truck className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-bold">Transport</p>
                        <p className="text-xs text-slate-500">Between {tripStops.length} stops</p>
                      </div>
                    </div>
                    <p className="font-bold">₹{transportCost.toLocaleString()}</p>
                  </div>

                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="bg-emerald-500/10 p-3 rounded-xl">
                        <Hotel className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="font-bold">Accommodation</p>
                        <p className="text-xs text-slate-500">{getAllocatedDays()} nights</p>
                      </div>
                    </div>
                    <p className="font-bold">₹{accommodationCost.toLocaleString()}</p>
                  </div>

                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="bg-purple-500/10 p-3 rounded-xl">
                        <MapPin className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="font-bold">Activities</p>
                        <p className="text-xs text-slate-500">Entrance fees & tours</p>
                      </div>
                    </div>
                    <p className="font-bold">₹{activitiesCost.toLocaleString()}</p>
                  </div>
                </div>

                <div className="border-t border-slate-700 pt-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xl font-bold">Total Estimate</p>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                        <Info className="h-3 w-3" /> Includes transport, stay & fees
                      </p>
                    </div>
                    <p className="text-4xl font-black text-[#6366F1]">₹{totalEstimatedCost.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Trip Summary Card */}
            <section className="bg-[#1E293B] rounded-2xl p-6 border border-slate-800">
              <h2 className="text-xl font-semibold mb-4 text-slate-200">Trip Summary</h2>
              <div className="space-y-4 text-sm">
                {startDate && endDate ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-[#0F172A] rounded-xl border border-slate-700">
                      <p className="text-slate-400 text-xs mb-1">Duration</p>
                      <p className="font-bold">{getTotalDays()} Days, {getAllocatedDays()} Nights</p>
                    </div>
                    <div className="space-y-3">
                      <p className="font-bold text-slate-400 text-xs uppercase tracking-wider">Itinerary</p>
                      {tripStops.map((stop, i) => (
                        <div key={stop.id} className="flex items-center gap-3">
                          <div className="h-6 w-6 rounded-full bg-[#6366F1] flex items-center justify-center text-[10px] font-bold">
                            {i + 1}
                          </div>
                          <p className="font-medium">{stop.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 italic">Please select dates to generate summary</p>
                )}

                <Button
                  onClick={validateAndSave}
                  className="w-full bg-[#6366F1] hover:bg-[#818cf8] text-white font-bold h-12 rounded-xl mt-6 shadow-lg shadow-indigo-500/20"
                >
                  <Save className="mr-2 h-5 w-5" /> Save Trip Plan
                </Button>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}
