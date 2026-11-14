import { SingaporeHub } from '../types/facility';

export const CLARKE_QUAY_ANCHOR = {
  lat: 1.2905,
  lng: 103.8466,
  label: 'Clarke Quay MRT',
};

export const SINGAPORE_HUBS: SingaporeHub[] = [
  { name: 'Clarke Quay MRT', district: 'Singapore River', lat: 1.2905, lng: 103.8466 },
  { name: 'Orchard Ion', district: 'Orchard', lat: 1.304, lng: 103.8318 },
  { name: 'Marina Bay Sands', district: 'Marina Bay', lat: 1.2834, lng: 103.8607 },
  { name: 'Bugis Junction', district: 'Bugis', lat: 1.2994, lng: 103.8553 },
  { name: 'Chinatown Point', district: 'Chinatown', lat: 1.2852, lng: 103.8448 },
  { name: 'Tiong Bahru Market', district: 'Tiong Bahru', lat: 1.2851, lng: 103.8324 },
  { name: 'VivoCity', district: 'HarbourFront', lat: 1.2644, lng: 103.8222 },
  { name: 'Jewel Changi', district: 'Changi', lat: 1.3602, lng: 103.9897 },
];

export function haversineDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function estimateWalkMinutes(meters: number): number {
  // Average urban Singapore walking pace ~78m/min
  return Math.max(1, Math.round(meters / 78));
}
