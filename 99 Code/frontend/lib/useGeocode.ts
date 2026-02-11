'use client';

import { useState, useEffect } from 'react';
import { geocodeAddress } from './geocode';

export function useGeocode(address: string | undefined) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!address) return;

    let cancelled = false;
    geocodeAddress(address).then((result) => {
      if (!cancelled) setCoords(result);
    });

    return () => { cancelled = true; };
  }, [address]);

  return coords;
}
