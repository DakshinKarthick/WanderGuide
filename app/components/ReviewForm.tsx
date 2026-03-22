'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface ReviewFormProps {
  destinationId: string;
  existingReview?: {
    rating: number;
    title: string;
    body: string;
  } | null;
  onSuccess?: () => void;
}

export function ReviewForm({ destinationId, existingReview, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [hovered, setHovered] = useState(0);
  const [title, setTitle] = useState(existingReview?.title ?? '');
  const [body, setBody] = useState(existingReview?.body ?? '');
  const [loading, setLoading] = useState(false);

  const isUpdate = !!existingReview;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination_id: destinationId, rating, title, body }),
      });
      if (res.status === 401) {
        toast.error('Please sign in to leave a review.');
        return;
      }
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? 'Failed to submit review');
      }
      toast.success(isUpdate ? 'Review updated!' : 'Review submitted! Thank you.');
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="text-sm font-semibold mb-2 block">
          {isUpdate ? 'Update your rating' : 'Your rating'}
        </Label>
        {/* Interactive stars */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(s)}
              className="p-0.5 rounded transition-transform hover:scale-110"
              aria-label={`${s} star${s > 1 ? 's' : ''}`}
            >
              <Star
                className={`w-7 h-7 transition-colors ${
                  s <= (hovered || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            </button>
          ))}
          {(hovered || rating) > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">
              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][hovered || rating]}
            </span>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="review-title" className="text-sm font-semibold mb-1 block">
          Review title <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarise your experience…"
          maxLength={120}
        />
      </div>

      <div>
        <Label htmlFor="review-body" className="text-sm font-semibold mb-1 block">
          Your review <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share what you loved, tips for other travellers…"
          rows={4}
          maxLength={1000}
          className="resize-none"
        />
        <p className="text-[11px] text-muted-foreground mt-1 text-right">
          {body.length}/1000
        </p>
      </div>

      <Button
        type="submit"
        disabled={loading || rating === 0}
        className="w-full bg-[#6A87E0] hover:bg-[#5070C0] text-white"
      >
        {loading ? 'Submitting…' : isUpdate ? 'Update Review' : 'Submit Review'}
      </Button>
    </form>
  );
}
