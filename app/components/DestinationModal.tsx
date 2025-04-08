"use client"

import Image from "next/image"
import { Star, Calendar, DollarSign, PlusCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function DestinationModal({ destination, onClose, onAddToTrip }) {
  if (!destination) return null

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[#4A67C0] dark:text-[#6A87E0]">{destination.name}</DialogTitle>
        </DialogHeader>
        <div className="relative aspect-video mb-4">
          <Image
            src={destination.image || "/placeholder.svg"}
            alt={destination.name}
            layout="fill"
            objectFit="cover"
            className="rounded-lg"
          />
        </div>
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">{destination.state}</p>
          <div className="flex items-center">
            <Star className="w-5 h-5 text-[#4A67C0] dark:text-[#6A87E0] mr-1" />
            <span>{destination.rating || "4.5"} / 5</span>
          </div>
          <p className="text-sm">
            {destination.description || "A beautiful destination in India waiting to be explored."}
          </p>
          <h3 className="font-semibold text-[#4A67C0] dark:text-[#6A87E0]">Highlights</h3>
          <ul className="list-disc list-inside space-y-1">
            {(destination.highlights || ["Local cuisine", "Historical sites", "Cultural experiences"]).map(
              (highlight, index) => (
                <li key={index}>{highlight}</li>
              ),
            )}
          </ul>
          <div className="flex justify-between text-sm">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-[#4A67C0] dark:text-[#6A87E0]" />
              <span>{destination.bestTimeToVisit || "October to March"}</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-[#4A67C0] dark:text-[#6A87E0]" />
              <span>{destination.averageCost || "₹2000 per day"}</span>
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-4">
          <Button
            onClick={() => onAddToTrip(destination)}
            className="bg-[#4A67C0] hover:bg-[#6A87E0] text-white dark:bg-[#6A87E0] dark:hover:bg-[#8AA7FF]"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Add to Trip
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#6A87E0] dark:border-[#5A77D0] text-[#4A67C0] dark:text-[#6A87E0]"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
