'use client';

import { Check } from 'lucide-react';

interface BrandCardProps {
  id: string;
  name: string;
  logo: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}

export function BrandCard({ id, name, logo, selected, onClick }: BrandCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`brand-card rounded-xl p-4 text-center relative ${selected ? 'brand-card-selected' : ''}`}
      data-testid={`brand-card-${id}`}
      data-selected={selected}
    >
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
      <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
        {logo}
      </div>
      <span className="text-sm font-semibold">{name}</span>
    </button>
  );
}
