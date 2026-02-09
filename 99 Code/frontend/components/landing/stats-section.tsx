'use client';

import { useEffect, useRef, useState } from 'react';
import { Wrench, Calendar, Star, ThumbsUp } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/useLovableTranslation';

const translations = {
  de: {
    heading: 'Vertrauen durch Zahlen',
    subheading: 'Über 15.000 zufriedene Kunden haben bereits gebucht',
    labels: ['Werkstätten', 'Buchungen', 'Bewertung', 'Empfehlung'],
  },
  en: {
    heading: 'Trust in Numbers',
    subheading: 'Over 15,000 satisfied customers have already booked',
    labels: ['Workshops', 'Bookings', 'Rating', 'Recommendation'],
  },
};

interface Stat {
  value: number;
  suffix: string;
  icon: any;
  color: string;
  bgColor: string;
}

const stats: Stat[] = [
  {
    value: 200,
    suffix: '+',
    icon: Wrench,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    value: 15000,
    suffix: '+',
    icon: Calendar,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    value: 4.5,
    suffix: '★',
    icon: Star,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  {
    value: 92,
    suffix: '%',
    icon: ThumbsUp,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
];

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  return (
    <div ref={ref} className="text-4xl md:text-5xl font-bold">
      {value % 1 === 0 ? count : count.toFixed(1)}
      {suffix}
    </div>
  );
}

export function StatsSection() {
  const { language } = useLanguage();
  const t = translations[language] || translations.de;

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t.heading}
          </h2>
          <p className="text-xl text-gray-600">
            {t.subheading}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="text-center p-6 rounded-xl bg-white shadow-medium hover:shadow-strong transition-shadow"
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <Counter value={stat.value} suffix={stat.suffix} />
                <div className="text-gray-600 font-medium mt-2">{t.labels[index]}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
