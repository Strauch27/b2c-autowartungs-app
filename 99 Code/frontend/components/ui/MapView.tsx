'use client';

import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';

export interface MapViewProps {
  lat?: number;
  lng?: number;
  address?: string;
  height?: string;
  className?: string;
}

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center bg-neutral-100 h-full w-full">
      <div className="text-center">
        <MapPin className="w-6 h-6 text-neutral-300 mx-auto mb-1" />
        <p className="text-xs text-neutral-400">Loading map...</p>
      </div>
    </div>
  ),
});

// Default: Buchholz in der Nordheide
const DEFAULT_LAT = 53.3265;
const DEFAULT_LNG = 9.8676;

export function MapView({
  lat,
  lng,
  address,
  height = 'h-[200px] md:h-[300px]',
  className = '',
}: MapViewProps) {
  const finalLat = lat ?? DEFAULT_LAT;
  const finalLng = lng ?? DEFAULT_LNG;

  return (
    <div
      className={`w-full rounded-xl overflow-hidden ${height} ${className}`}
      data-testid="map-view"
    >
      <LeafletMap lat={finalLat} lng={finalLng} address={address} />
    </div>
  );
}
