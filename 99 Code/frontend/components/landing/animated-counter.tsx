'use client';

interface AnimatedCounterProps {
  target: number;
  suffix?: string;
}

export function AnimatedCounter({ target, suffix = '' }: AnimatedCounterProps) {
  const formatted = target.toLocaleString('de-DE');

  return (
    <div className="counter text-4xl md:text-5xl font-bold text-foreground">
      {formatted}{suffix}
    </div>
  );
}
