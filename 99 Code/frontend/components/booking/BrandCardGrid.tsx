'use client';

import Image from 'next/image';
import { BrandCard } from './BrandCard';
import { useLanguage } from '@/lib/i18n/useLovableTranslation';

const AndereLogo = () => (
  <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
    <path
      d="M8,30 L10,30 L13,22 Q14,20 16,20 L32,20 Q34,20 35,22 L38,30 L40,30 Q42,30 42,32 L42,34 Q42,36 40,36 L38,36 L38,34 L10,34 L10,36 L8,36 Q6,36 6,34 L6,32 Q6,30 8,30 Z"
      fill="none"
      stroke="#94a3b8"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M14,22 L16,22 L14.5,28 L12,28 Z" fill="none" stroke="#94a3b8" strokeWidth="1" />
    <path d="M17,22 L31,22 L33,28 L15.5,28 Z" fill="none" stroke="#94a3b8" strokeWidth="1" />
    <circle cx="14" cy="34" r="3" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
    <circle cx="34" cy="34" r="3" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
    <circle cx="38" cy="12" r="7" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
    <line x1="38" y1="8" x2="38" y2="16" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
    <line x1="34" y1="12" x2="42" y2="12" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const BrandLogo = ({ brand, alt }: { brand: string; alt: string }) => (
  <Image
    src={`/brands/${brand}.svg`}
    alt={alt}
    width={48}
    height={48}
    className="w-12 h-12 object-contain"
    unoptimized
  />
);

const brandLogos: Record<string, { component: React.ReactNode; label: string }> = {
  bmw: { component: <BrandLogo brand="bmw" alt="BMW" />, label: 'BMW' },
  mercedes: { component: <BrandLogo brand="mercedes" alt="Mercedes" />, label: 'Mercedes' },
  audi: { component: <BrandLogo brand="audi" alt="Audi" />, label: 'Audi' },
  vw: { component: <BrandLogo brand="vw" alt="VW" />, label: 'VW' },
  porsche: { component: <BrandLogo brand="porsche" alt="Porsche" />, label: 'Porsche' },
  andere: { component: <AndereLogo />, label: '' },
};

interface BrandCardGridProps {
  selectedBrand: string;
  onSelect: (brandId: string) => void;
}

export function BrandCardGrid({ selectedBrand, onSelect }: BrandCardGridProps) {
  const { language } = useLanguage();
  const andereLabel = language === 'en' ? 'Other' : 'Andere';

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3" data-testid="brand-card-grid">
      {Object.entries(brandLogos).map(([id, { component, label }]) => (
        <BrandCard
          key={id}
          id={id}
          name={id === 'andere' ? andereLabel : label}
          logo={component}
          selected={selectedBrand === id}
          onClick={() => onSelect(id)}
        />
      ))}
    </div>
  );
}
