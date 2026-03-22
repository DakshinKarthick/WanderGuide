'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Star, MessageSquare, PenLine } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ReviewCard } from './ReviewCard';
import { ReviewForm } from './ReviewForm';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

interface DistributionBar {
  star: number;
  count: number;
}

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
  user_profiles?: { display_name?: string | null; avatar_url?: string | null } | null;
}

function FilledStar({ filled }: { filled: boolean }) {
  return (
    <Star
      className={`w-5 h-5 ${filled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
    />
  );
}

interface DestinationReviewsProps {
  destinationId: string;
}

export function DestinationReviews({ destinationId }: DestinationReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [distribution, setDistribution] = useState<DistributionBar[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  const fetchReviews = useCallback(async () => {
    const res = await fetch(`/api/reviews?destination_id=${destinationId}`);
    if (!res.ok) return;
    const json = await res.json();
    setReviews(json.reviews ?? []);
    setAvgRating(json.avg_rating ?? 0);
    setDistribution(json.distribution ?? []);
    setLoading(false);
  }, [destinationId]);

  useEffect(() => {
    fetchReviews();
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data?.user?.id ?? null);
    });
  }, [fetchReviews, supabase]);

  const myReview = currentUserId
    ? reviews.find((r) => r.user_id === currentUserId)
    : null;

  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-[#6A87E0]" />
        <h3 className="font-semibold text-base">
          Reviews{' '}
          {reviews.length > 0 && (
            <span className="text-sm text-muted-foreground font-normal">
              ({reviews.length})
            </span>
          )}
        </h3>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground text-sm">
          <Star className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p>No reviews yet. Be the first to share your experience!</p>
        </div>
      ) : (
        <>
          {/* Rating Summary */}
          <div className="flex gap-4 items-center bg-[#EEF2FF] dark:bg-[#3A4D80]/20 rounded-xl p-3">
            <div className="text-center">
              <p className="text-3xl font-bold text-[#6A87E0]">
                {avgRating.toFixed(1)}
              </p>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <FilledStar key={s} filled={s <= Math.round(avgRating)} />
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex-1 space-y-1">
              {[...distribution].reverse().map((d) => (
                <div key={d.star} className="flex items-center gap-2">
                  <span className="text-xs w-3 text-right">{d.star}</span>
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-yellow-400"
                      style={{ width: `${(d.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs w-4 text-muted-foreground">{d.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Review list (max 3 for modal) */}
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {reviews.slice(0, 5).map((r) => (
              <ReviewCard key={r.id} review={r} compact />
            ))}
          </div>
        </>
      )}

      <Separator />

      {/* Write / Edit review */}
      {currentUserId ? (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm((v) => !v)}
            className="gap-2 text-xs w-full"
          >
            <PenLine className="w-4 h-4" />
            {myReview ? 'Edit your review' : 'Write a review'}
          </Button>
          {showForm && (
            <ReviewForm
              destinationId={destinationId}
              existingReview={myReview ?? null}
              onSuccess={() => { setShowForm(false); fetchReviews(); }}
            />
          )}
        </>
      ) : (
        <p className="text-xs text-muted-foreground text-center">
          <a href="/auth/login" className="text-[#6A87E0] hover:underline">Sign in</a> to leave a review.
        </p>
      )}
    </div>
  );
}
