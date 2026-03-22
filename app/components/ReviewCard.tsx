'use client';

import { Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    title: string;
    body: string;
    helpful_count: number;
    created_at: string;
    user_profiles?: { display_name?: string | null; avatar_url?: string | null } | null;
  };
  compact?: boolean;
}

function StarRow({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const sz = size === 'md' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${sz} ${
            s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'
          }`}
        />
      ))}
    </span>
  );
}

export function ReviewCard({ review, compact = false }: ReviewCardProps) {
  const displayName =
    review.user_profiles?.display_name ?? 'Anonymous Traveller';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3 hover:shadow-md transition-shadow">
      {/* Author row */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-[#6A87E0] text-white flex items-center justify-center text-sm font-semibold flex-shrink-0 select-none">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight truncate">{displayName}</p>
          <p className="text-[11px] text-muted-foreground">
            {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
          </p>
        </div>
        <StarRow rating={review.rating} />
      </div>

      {/* Content */}
      {review.title && (
        <p className="text-sm font-semibold">{review.title}</p>
      )}
      {review.body && !compact && (
        <p className="text-sm text-muted-foreground leading-relaxed">{review.body}</p>
      )}
      {review.body && compact && (
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {review.body}
        </p>
      )}

      {/* Helpful */}
      {review.helpful_count > 0 && (
        <p className="text-[11px] text-muted-foreground">
          {review.helpful_count} people found this helpful
        </p>
      )}
    </div>
  );
}
