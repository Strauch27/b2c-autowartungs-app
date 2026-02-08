'use client';

import { Star } from 'lucide-react';

interface TestimonialCardProps {
  text: string;
  author: string;
  vehicle: string;
  rating: number;
  colorClass: string;
}

export function TestimonialCard({ text, author, vehicle, rating, colorClass }: TestimonialCardProps) {
  const initials = author
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="testimonial-card-landing bg-card rounded-2xl p-6 border border-border">
      <div className="flex text-cta mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'fill-cta text-cta' : 'fill-muted text-muted'}`}
          />
        ))}
      </div>
      <p className="text-muted-foreground mb-5 leading-relaxed">&ldquo;{text}&rdquo;</p>
      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <div
          className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center font-bold text-sm`}
        >
          {initials}
        </div>
        <div>
          <p className="font-semibold text-sm">{author}</p>
          <p className="text-muted-foreground text-xs">{vehicle}</p>
        </div>
      </div>
    </div>
  );
}
