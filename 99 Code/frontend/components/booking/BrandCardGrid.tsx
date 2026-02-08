'use client';

import { BrandCard } from './BrandCard';
import { useLanguage } from '@/lib/i18n/useLovableTranslation';

/* Inline SVG logos matching the mockup design */
const BMWLogo = () => (
  <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
    <circle cx="24" cy="24" r="23" fill="none" stroke="#1e293b" strokeWidth="2" />
    <circle cx="24" cy="24" r="20" fill="none" stroke="#1e293b" strokeWidth="1.5" />
    <path d="M24 4 L24 44 M4 24 L44 24" stroke="#1e293b" strokeWidth="1.5" />
    <path d="M24 4 A20 20 0 0 1 44 24 L24 24 Z" fill="#3b82f6" />
    <path d="M4 24 A20 20 0 0 1 24 44 L24 24 Z" fill="#3b82f6" />
    <path d="M24 4 A20 20 0 0 0 4 24 L24 24 Z" fill="#f8fafc" />
    <path d="M44 24 A20 20 0 0 0 24 44 L24 24 Z" fill="#f8fafc" />
    <text x="24" y="15" textAnchor="middle" fontSize="5" fontWeight="700" fill="#1e293b">BMW</text>
  </svg>
);

const MercedesLogo = () => (
  <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
    <circle cx="24" cy="24" r="22" fill="none" stroke="#1e293b" strokeWidth="2.5" />
    <circle cx="24" cy="24" r="19" fill="none" stroke="#1e293b" strokeWidth="1" />
    <line x1="24" y1="5" x2="24" y2="24" stroke="#1e293b" strokeWidth="2.5" />
    <line x1="24" y1="24" x2="7" y2="36" stroke="#1e293b" strokeWidth="2.5" />
    <line x1="24" y1="24" x2="41" y2="36" stroke="#1e293b" strokeWidth="2.5" />
  </svg>
);

const AudiLogo = () => (
  <svg viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
    <circle cx="12" cy="16" r="10" fill="none" stroke="#1e293b" strokeWidth="2.5" />
    <circle cx="25" cy="16" r="10" fill="none" stroke="#1e293b" strokeWidth="2.5" />
    <circle cx="38" cy="16" r="10" fill="none" stroke="#1e293b" strokeWidth="2.5" />
    <circle cx="51" cy="16" r="10" fill="none" stroke="#1e293b" strokeWidth="2.5" />
  </svg>
);

const VWLogo = () => (
  <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
    <circle cx="24" cy="24" r="22" fill="#1e293b" stroke="#1e293b" strokeWidth="1" />
    <path d="M10 14 L18 34 L24 20 L30 34 L38 14" fill="none" stroke="white" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M14 14 L20 28 L24 20 L28 28 L34 14" fill="none" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const PorscheLogo = () => (
  <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
    <path d="M24 2 L44 14 L44 38 L24 46 L4 38 L4 14 Z" fill="none" stroke="#1e293b" strokeWidth="2.5" />
    <path d="M24 8 L38 17 L38 35 L24 41 L10 35 L10 17 Z" fill="none" stroke="#1e293b" strokeWidth="1" />
    <text x="24" y="28" textAnchor="middle" fontSize="8" fontWeight="800" fill="#1e293b">P</text>
  </svg>
);

const AndereLogo = () => (
  <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
    <circle cx="24" cy="24" r="20" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 3" />
    <line x1="24" y1="14" x2="24" y2="34" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
    <line x1="14" y1="24" x2="34" y2="24" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const brandLogos: Record<string, { component: React.ReactNode; label: string }> = {
  bmw: { component: <BMWLogo />, label: 'BMW' },
  mercedes: { component: <MercedesLogo />, label: 'Mercedes' },
  audi: { component: <AudiLogo />, label: 'Audi' },
  vw: { component: <VWLogo />, label: 'VW' },
  porsche: { component: <PorscheLogo />, label: 'Porsche' },
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
