'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Star, SlidersHorizontal, MapPin, MessageSquareDot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReviewCard } from '@/app/components/ReviewCard';

interface Review {
  id: string;
  destination_id: string;
  user_id: string;
  rating: number;
  title: string;
  body: string;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  user_profiles?: { display_name?: string | null } | null;
  // Joined destination name
  destination_name?: string;
  destination_state?: string;
}

interface ReviewWithDestination extends Review {
  destinations?: { name: string; state: string } | null;
}

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'highest', label: 'Highest Rated' },
  { value: 'lowest', label: 'Lowest Rated' },
  { value: 'helpful', label: 'Most Helpful' },
] as const;

type SortOption = typeof SORT_OPTIONS[number]['value'];

function StarFilter({
  selected,
  onChange,
}: {
  selected: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-medium text-muted-foreground">Rating:</span>
      <button
        onClick={() => onChange(null)}
        className={`px-3 py-1.5 rounded-lg text-sm border font-medium transition-colors ${
          selected === null
            ? 'bg-primary text-white border-primary'
            : 'border-border hover:border-primary/50 hover:text-primary'
        }`}
      >
        All
      </button>
      {[5, 4, 3, 2, 1].map((s) => (
        <button
          key={s}
          onClick={() => onChange(s === selected ? null : s)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm border font-medium transition-colors ${
            selected === s
              ? 'bg-primary text-white border-primary'
              : 'border-border hover:border-primary/50 hover:text-primary'
          }`}
        >
          <Star
            className={`w-3 h-3 ${
              selected === s ? 'fill-white text-white' : 'fill-amber-400 text-amber-400'
            }`}
          />
          {s}
        </button>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewWithDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [sort, setSort] = useState<SortOption>('recent');

  // We fetch all reviews by hitting our API for a summary; for the browse
  // page we call a dedicated all-reviews endpoint (or fall back to destinations API)
  const fetchAllReviews = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all reviews via the server API (no destination_id filter = all public reviews)
      const res = await fetch('/api/reviews/all');
      if (!res.ok) return;
      const json = await res.json();
      setReviews(json.reviews ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllReviews();
  }, [fetchAllReviews]);

  // Client-side filter + sort
  const filtered = reviews
    .filter((r) => ratingFilter === null || r.rating === ratingFilter)
    .sort((a, b) => {
      if (sort === 'recent') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sort === 'highest') return b.rating - a.rating;
      if (sort === 'lowest') return a.rating - b.rating;
      if (sort === 'helpful') return b.helpful_count - a.helpful_count;
      return 0;
    });

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      {/* Hero */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
          <MessageSquareDot className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Traveller Reviews</h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm">
          Honest experiences from fellow explorers across India's most beautiful destinations.
        </p>
        {reviews.length > 0 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-5 h-5 ${
                    s <= Math.round(avgRating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-muted fill-muted'
                  }`}
                />
              ))}
            </div>
            <span className="font-bold text-lg">{avgRating.toFixed(1)}</span>
            <span className="text-muted-foreground text-sm">
              across {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 mb-8 p-4 rounded-xl bg-card border border-border">
        <StarFilter selected={ratingFilter} onChange={setRatingFilter} />
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
          <div className="flex gap-2 flex-wrap">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSort(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-sm border font-medium transition-colors ${
                  sort === opt.value
                    ? 'bg-primary text-white border-primary'
                    : 'border-border hover:border-primary/50 hover:text-primary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Review list */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl skeleton-shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-muted-foreground">
          <Star className="w-14 h-14 mb-4 opacity-20" />
          <p className="font-semibold text-lg">No reviews found</p>
          <p className="text-sm mt-1">
            {ratingFilter
              ? `No ${ratingFilter}-star reviews yet.`
              : 'Explore destinations and be the first to review!'}
          </p>
          <Link href="/locations" className="mt-4">
            <Button className="bg-brand-gradient text-white gap-2">
              <MapPin className="w-4 h-4" />
              Explore Destinations
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => (
            <div key={r.id}>
              {r.destinations && (
                <Link
                  href="/locations"
                  className="text-xs text-primary hover:underline flex items-center gap-1 mb-1 ml-1"
                >
                  <MapPin className="w-3 h-3" />
                  {r.destinations.name} · {r.destinations.state}
                </Link>
              )}
              <ReviewCard review={r} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
