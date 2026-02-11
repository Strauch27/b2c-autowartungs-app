// Default: Buchholz in der Nordheide
const DEFAULT_LAT = 53.3265;
const DEFAULT_LNG = 9.8676;

interface GeocodingResult {
  lat: number;
  lng: number;
}

const cache = new Map<string, GeocodingResult>();

export async function geocodeAddress(address: string): Promise<GeocodingResult> {
  if (!address.trim()) {
    return { lat: DEFAULT_LAT, lng: DEFAULT_LNG };
  }

  const cached = cache.get(address);
  if (cached) return cached;

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'de,en' },
    });

    if (!res.ok) {
      return { lat: DEFAULT_LAT, lng: DEFAULT_LNG };
    }

    const data = await res.json();
    if (data.length > 0) {
      const result = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      cache.set(address, result);
      return result;
    }
  } catch {
    // Geocoding failed, use default
  }

  return { lat: DEFAULT_LAT, lng: DEFAULT_LNG };
}
