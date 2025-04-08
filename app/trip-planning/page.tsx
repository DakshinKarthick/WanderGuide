"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon, ArrowLeft, Plus, Minus, Save } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function TripPlanningPage() {
  const router = useRouter()
  const [tripStops, setTripStops] = useState([])
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [dayAllocations, setDayAllocations] = useState({})
  const [error, setError] = useState("")

  useEffect(() => {
    // Load trip stops from localStorage
    const savedTripStops = localStorage.getItem("tripStops")
    if (savedTripStops) {
      setTripStops(JSON.parse(savedTripStops))
    }
  }, [])

  useEffect(() => {
    // Initialize day allocations when trip stops change
    if (tripStops.length > 0) {
      const initialAllocations = {}
      tripStops.forEach((stop) => {
        initialAllocations[stop.id] = 1
      })
      setDayAllocations(initialAllocations)
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

  const handleDayChange = (id, value) => {
    const days = Math.max(1, Number.parseInt(value) || 1)
    setDayAllocations({
      ...dayAllocations,
      [id]: days,
    })
  }

  const incrementDays = (id) => {
    setDayAllocations({
      ...dayAllocations,
      [id]: (dayAllocations[id] || 1) + 1,
    })
  }

  const decrementDays = (id) => {
    if (dayAllocations[id] > 1) {
      setDayAllocations({
        ...dayAllocations,
        [id]: dayAllocations[id] - 1,
      })
    }
  }

  const validateAndSave = () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates for your trip.")
      return
    }

    const totalDays = getTotalDays()
    const allocatedDays = getAllocatedDays()

    if (allocatedDays > totalDays) {
      setError(`You've allocated ${allocatedDays} days, but your trip is only ${totalDays} days long.`)
      return
    }

    // Save the trip plan
    const tripPlan = {
      tripStops,
      startDate,
      endDate,
      dayAllocations,
    }
    localStorage.setItem("tripPlan", JSON.stringify(tripPlan))
    setError("")
    alert("Trip plan saved successfully!")
  }

  const remainingDays = getTotalDays() - getAllocatedDays()

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="outline"
        onClick={() => router.push("/locations")}
        className="mb-6 border-[#6A87E0] text-[#4A67C0] hover:bg-[#E6F0FF] dark:border-[#5A77D0] dark:text-[#6A87E0]"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Destinations
      </Button>

      <h1 className="text-3xl font-bold mb-6 text-[#4A67C0] dark:text-[#6A87E0]">Plan Your Trip</h1>

      {tripStops.length === 0 ? (
        <Alert className="mb-6 border-[#6A87E0] bg-[#E6F0FF] text-[#4A67C0] dark:border-[#5A77D0] dark:bg-[#3A57B0]/20 dark:text-[#6A87E0]">
          <AlertDescription>
            You haven't selected any destinations yet. Please go back to the destinations page to add some places to
            your trip.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card className="border-[#6A87E0] dark:border-[#5A77D0]">
              <CardHeader>
                <CardTitle className="text-[#4A67C0] dark:text-[#6A87E0]">Trip Dates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="start-date"
                          variant="outline"
                          className={`w-full justify-start text-left font-normal border-[#6A87E0] dark:border-[#5A77D0] ${!startDate ? "text-muted-foreground" : ""}`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-[#4A67C0] dark:text-[#6A87E0]" />
                          {startDate ? format(startDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="end-date"
                          variant="outline"
                          className={`w-full justify-start text-left font-normal border-[#6A87E0] dark:border-[#5A77D0] ${!endDate ? "text-muted-foreground" : ""}`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-[#4A67C0] dark:text-[#6A87E0]" />
                          {endDate ? format(endDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                          disabled={(date) => (startDate ? date < startDate : false)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {startDate && endDate && (
                  <div className="pt-2">
                    <p className="text-sm font-medium">
                      Trip Duration:{" "}
                      <span className="font-bold text-[#4A67C0] dark:text-[#6A87E0]">{getTotalDays()} days</span>
                    </p>
                    <p className="text-sm font-medium">
                      Days Allocated:{" "}
                      <span className="font-bold text-[#4A67C0] dark:text-[#6A87E0]">{getAllocatedDays()} days</span>
                    </p>
                    <p className="text-sm font-medium">
                      Days Remaining:{" "}
                      <span
                        className={`font-bold ${remainingDays < 0 ? "text-red-500" : "text-[#4A67C0] dark:text-[#6A87E0]"}`}
                      >
                        {remainingDays} days
                      </span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-[#6A87E0] dark:border-[#5A77D0]">
              <CardHeader>
                <CardTitle className="text-[#4A67C0] dark:text-[#6A87E0]">Your Destinations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {tripStops.map((stop) => (
                    <li
                      key={stop.id}
                      className="flex items-center justify-between border-b pb-2 border-[#E6F0FF] dark:border-[#3A57B0]"
                    >
                      <div>
                        <p className="font-medium">{stop.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{stop.state}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => decrementDays(stop.id)}
                          className="h-8 w-8 border-[#6A87E0] dark:border-[#5A77D0]"
                        >
                          <Minus className="h-4 w-4 text-[#4A67C0] dark:text-[#6A87E0]" />
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          value={dayAllocations[stop.id] || 1}
                          onChange={(e) => handleDayChange(stop.id, e.target.value)}
                          className="w-16 text-center border-[#6A87E0] dark:border-[#5A77D0]"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => incrementDays(stop.id)}
                          className="h-8 w-8 border-[#6A87E0] dark:border-[#5A77D0]"
                        >
                          <Plus className="h-4 w-4 text-[#4A67C0] dark:text-[#6A87E0]" />
                        </Button>
                        <span className="text-sm font-medium ml-1">days</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card className="border-[#6A87E0] dark:border-[#5A77D0] mb-8">
            <CardHeader>
              <CardTitle className="text-[#4A67C0] dark:text-[#6A87E0]">Trip Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {startDate && endDate ? (
                <div className="space-y-4">
                  <p>
                    Your trip from{" "}
                    <span className="font-medium">{startDate ? format(startDate, "MMMM d, yyyy") : "..."}</span> to{" "}
                    <span className="font-medium">{endDate ? format(endDate, "MMMM d, yyyy") : "..."}</span> will be{" "}
                    <span className="font-medium">{getTotalDays()} days</span> long.
                  </p>

                  <div className="space-y-2">
                    <h3 className="font-medium">Itinerary:</h3>
                    <ul className="space-y-1 pl-5 list-disc">
                      {tripStops.map((stop) => (
                        <li key={stop.id}>
                          <span className="font-medium">
                            {stop.name}, {stop.state}
                          </span>
                          : {dayAllocations[stop.id] || 1} days
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Please select your trip dates to see a summary.</p>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={validateAndSave}
                className="w-full bg-[#4A67C0] hover:bg-[#6A87E0] text-white dark:bg-[#6A87E0] dark:hover:bg-[#8AA7FF]"
              >
                <Save className="mr-2 h-4 w-4" /> Save Trip Plan
              </Button>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  )
}
