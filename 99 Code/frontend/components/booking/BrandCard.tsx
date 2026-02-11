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
      className={`brand-card w-full rounded-xl p-3 text-center relative flex flex-col items-center ${selected ? 'brand-card-selected' : ''}`}
      data-testid={`brand-card-${id}`}
      data-selected={selected}
    >
      {selected && (
        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
      <div className="w-10 h-10 mb-1.5 flex items-center justify-center shrink-0">
        {logo}
      </div>
      <span className="text-xs font-semibold leading-tight">{name}</span>
    </button>
  );
}
