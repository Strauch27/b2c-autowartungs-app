"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Star, Loader2 } from "lucide-react";

interface RatingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  language?: "de" | "en";
}

export function RatingModal({
  open,
  onOpenChange,
  bookingId,
  language = "de",
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;

    try {
      setIsSubmitting(true);

      // TODO: Submit rating to backend once endpoint exists
      // await apiClient.post(`/api/bookings/${bookingId}/rating`, { rating, comment });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      onOpenChange(false);
      setRating(0);
      setComment("");
    } catch (error) {
      console.error("Failed to submit rating:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const texts = {
    de: {
      title: "Wie war Ihr Service?",
      description:
        "Bewerten Sie Ihre Erfahrung mit unserem Hol- und Bringservice.",
      commentPlaceholder: "Optionaler Kommentar...",
      submit: "Bewertung abgeben",
      cancel: "Abbrechen",
      ratingLabels: ["", "Schlecht", "Geht so", "Okay", "Gut", "Ausgezeichnet"],
    },
    en: {
      title: "How was your service?",
      description: "Rate your experience with our pickup and delivery service.",
      commentPlaceholder: "Optional comment...",
      submit: "Submit Rating",
      cancel: "Cancel",
      ratingLabels: ["", "Poor", "Fair", "Okay", "Good", "Excellent"],
    },
  };

  const t = texts[language];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        {/* Star Rating */}
        <div className="flex flex-col items-center gap-2 py-4">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="p-1 transition-transform hover:scale-110"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
          {(hoveredRating || rating) > 0 && (
            <p className="text-sm text-muted-foreground">
              {t.ratingLabels[hoveredRating || rating]}
            </p>
          )}
        </div>

        {/* Comment */}
        <Textarea
          placeholder={t.commentPlaceholder}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
        />

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {t.cancel}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {t.submit}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
