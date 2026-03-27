"use client"

import Image from "next/image"
import { Star, Calendar, IndianRupee, PlusCircle, Bed, Train, X, MapPin, Tag } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Destination } from "@/lib/types/destination"
import { useEffect, useState } from "react"
import { DestinationReviews } from "./DestinationReviews"

interface DestinationModalProps {
  destination: Destination | null
  onClose: () => void
  onAddToTrip: (destination: Destination) => void
}

interface Accommodation {
  id: number;
  name: string;
  price: number;
  tags: string[];
}

interface Transport {
  id: number;
  mode: string;
  price: number;
  duration: string;
  badges: string[];
}

export function DestinationModal({ destination, onClose, onAddToTrip }: DestinationModalProps) {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [transportOptions, setTransportOptions] = useState<Transport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (destination) {
      setLoading(true);
      setError(null);
      const fetchModalData = async () => {
        try {
          // Fetch accommodation (GET) — works with destination name
          const accommResponse = await fetch(`/api/accommodation?destination=${encodeURIComponent(destination.name)}`);
          if (accommResponse.ok) {
            setAccommodations(await accommResponse.json());
          }

          // Fetch transport (POST) — requires lat/lon coordinates
          // Use Delhi (28.6139, 77.2090) as a default origin point
          const transportResponse = await fetch('/api/transport', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              origin: { lat: 28.6139, lon: 77.2090 },
              destination: { lat: Number(destination.latitude), lon: Number(destination.longitude) },
            }),
          });
          if (transportResponse.ok) {
            const transportData = await transportResponse.json();
            // Map the API response to the modal's expected shape
            const mapped = (Array.isArray(transportData) ? transportData : []).map((opt: any, i: number) => ({
              id: i + 1,
              mode: opt.label || opt.mode,
              price: Math.round(opt.price),
              duration: opt.durationMinutes
                ? `${Math.floor(opt.durationMinutes / 60)}h ${Math.round(opt.durationMinutes % 60)}m`
                : '',
              badges: opt.tag ? [opt.tag] : [],
            }));
            setTransportOptions(mapped);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
          setLoading(false);
        }
      };
      fetchModalData();
    }
  }, [destination]);

  if (!destination) return null

  const highlights = destination.tags?.length
    ? destination.tags
    : ["Local cuisine", "Historical sites", "Cultural experiences"]

  const costLabel = destination.entrance_fee
    ? `₹${destination.entrance_fee} entry`
    : "Flexible budget"

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto scrollbar-thin p-0 gap-0">
        {/* Hero image */}
        <div className="relative h-52 sm:h-64 w-full overflow-hidden rounded-t-xl">
          <Image
            src={destination.image_url || "/placeholder.svg"}
            alt={destination.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
          {destination.rating && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1.5 rounded-full">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {destination.rating} / 5
            </div>
          )}
          <div className="absolute bottom-4 left-4 right-12">
            <DialogHeader>
              <DialogTitle className="text-white text-xl font-bold leading-tight drop-shadow">
                {destination.name}
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-1 text-white/80 text-sm mt-1">
              <MapPin className="w-3.5 h-3.5" />
              {destination.city ? `${destination.city}, ` : ''}{destination.state}
            </div>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {destination.description || "A beautiful destination in India waiting to be explored."}
          </p>

          {/* Meta pills */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-xs bg-muted rounded-lg px-3 py-2">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>{destination.best_time_to_visit || "Oct–Mar"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs bg-muted rounded-lg px-3 py-2">
              <IndianRupee className="w-3.5 h-3.5 text-primary" />
              <span>{costLabel}</span>
            </div>
            {destination.category && (
              <div className="flex items-center gap-1.5 text-xs bg-muted rounded-lg px-3 py-2">
                <Tag className="w-3.5 h-3.5 text-primary" />
                <span>{destination.category}</span>
              </div>
            )}
          </div>

          {/* Highlights */}
          <div>
            <h3 className="text-sm font-semibold mb-2.5">Highlights</h3>
            <div className="flex flex-wrap gap-2">
              {highlights.map((highlight: string, index: number) => (
                <Badge key={index} variant="secondary" className="rounded-full px-3 py-1 text-xs">
                  {highlight}
                </Badge>
              ))}
            </div>
          </div>

          {/* Accommodation */}
          <div className="border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <Bed className="w-4 h-4 text-primary" />
              Accommodation
            </h3>
            {loading && (
              <div className="space-y-2">
                <div className="skeleton-shimmer h-4 rounded w-3/4" />
                <div className="skeleton-shimmer h-4 rounded w-1/2" />
              </div>
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
            {!loading && !error && accommodations.length === 0 && (
              <p className="text-xs text-muted-foreground">Failed to fetch data</p>
            )}
            {accommodations.length > 0 && (
              <ul className="space-y-1.5">
                {accommodations.map(acc => (
                  <li key={acc.id} className="flex items-center justify-between text-sm">
                    <span>{acc.name}</span>
                    <span className="text-muted-foreground">₹{acc.price}<span className="text-xs">/night</span></span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Transport */}
          <div className="border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <Train className="w-4 h-4 text-primary" />
              Transport Options
            </h3>
            {loading && (
              <div className="space-y-2">
                <div className="skeleton-shimmer h-4 rounded w-3/4" />
                <div className="skeleton-shimmer h-4 rounded w-1/2" />
              </div>
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
            {!loading && !error && transportOptions.length === 0 && (
              <p className="text-xs text-muted-foreground">Failed to fetch data</p>
            )}
            {transportOptions.length > 0 && (
              <ul className="space-y-1.5">
                {transportOptions.map(opt => (
                  <li key={opt.id} className="flex items-center justify-between text-sm">
                    <span>{opt.mode}</span>
                    <span className="text-muted-foreground">₹{opt.price} · {opt.duration}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Reviews */}
          <DestinationReviews destinationId={destination.id} />

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-border">
            <Button
              onClick={() => onAddToTrip(destination)}
              className="flex-1 bg-brand-gradient text-white hover:opacity-90 gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Add to Trip
            </Button>
            <Button variant="outline" onClick={onClose} className="gap-2">
              <X className="w-4 h-4" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
