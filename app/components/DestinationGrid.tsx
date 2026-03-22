"use client"

import Image from "next/image"
import { useState, useCallback } from "react"
import { PlusCircle, MapPin, Star, Eye } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Destination } from "@/lib/types/destination"

interface DestinationGridProps {
  destinations: Destination[]
  isLoading: boolean
  isLoadingMore?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  onDestinationClick: (destination: Destination) => void
  onAddToTrip: (destination: Destination) => void
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-border bg-card">
      <div className="skeleton-shimmer h-48 w-full" />
      <div className="p-5 space-y-3">
        <div className="skeleton-shimmer h-5 w-3/4 rounded-md" />
        <div className="skeleton-shimmer h-4 w-1/2 rounded-md" />
        <div className="flex gap-2 mt-4">
          <div className="skeleton-shimmer h-8 flex-1 rounded-lg" />
          <div className="skeleton-shimmer h-8 flex-1 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function DestinationGrid({
  destinations,
  isLoading,
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
  onDestinationClick,
  onAddToTrip,
}: DestinationGridProps) {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  const handleImageError = useCallback((id: string) => {
    setFailedImages((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (destinations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <MapPin className="w-7 h-7 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-1">No destinations found</h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          Try adjusting your filters or search to discover new places.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {destinations.map((destination, index) => (
          <motion.div
            key={destination.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: (index % 6) * 0.1 }}
            style={{ order: failedImages.has(destination.id) ? 1 : 0 }}
            className="group rounded-2xl overflow-hidden border border-border bg-card shadow-sm card-lift flex flex-col"
          >
            {/* Image */}
            <div className="relative overflow-hidden h-48 bg-muted">
              <Image
                src={destination.image_url || "/placeholder.svg"}
                alt={destination.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                onError={() => handleImageError(destination.id)}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              />
              {/* Category badge */}
              {destination.category && (
                <div className="absolute top-3 left-3">
                  <Badge className="bg-white/90 dark:bg-black/60 text-foreground backdrop-blur-sm border-0 text-xs font-medium shadow-sm">
                    {destination.category}
                  </Badge>
                </div>
              )}
              {/* Rating pill */}
              {destination.rating && (
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {destination.rating}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="font-semibold text-base text-foreground leading-tight mb-1">
                {destination.name}
              </h3>
              <div className="flex items-center gap-1 text-muted-foreground text-sm mb-4">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{destination.city}, {destination.state}</span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5 text-xs font-medium rounded-xl h-9"
                  onClick={() => onDestinationClick(destination)}
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Details
                </Button>
                <Button
                  size="sm"
                  className="flex-1 gap-1.5 text-xs font-medium rounded-xl h-9 bg-primary hover:bg-primary/90"
                  onClick={() => onAddToTrip(destination)}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Add to Trip
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {hasMore && onLoadMore && (
        <div className="text-center pt-2">
          <Button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            variant="outline"
            className="px-8 rounded-xl font-medium"
          >
            {isLoadingMore ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Loading…
              </span>
            ) : (
              "Load more destinations"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
