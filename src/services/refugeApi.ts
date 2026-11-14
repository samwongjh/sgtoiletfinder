import { AmenityTag, CrowdLevel, Facility, Review } from '../types/facility';
import { haversineDistanceMeters } from '../data/singaporeFacilities';

export interface RefugeRestroomDto {
  id: number;
  name: string;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  latitude: number;
  longitude: number;
  accessible?: boolean;
  unisex?: boolean;
  changing_table?: boolean;
  directions?: string | null;
  comment?: string | null;
  distance?: number | null;
  upvote?: number;
  downvote?: number;
  created_at?: string;
  updated_at?: string;
}

export interface FetchRestroomsParams {
  lat: number;
  lng: number;
  ada?: boolean;
  unisex?: boolean;
  perPage?: number;
  signal?: AbortSignal;
}

function inferCrowdLevel(item: RefugeRestroomDto): CrowdLevel {
  const text = `${item.comment ?? ''} ${item.directions ?? ''}`.toLowerCase();
  if (text.includes('very busy') || text.includes('long queue') || text.includes('crowded')) {
    return 'busy';
  }
  if (text.includes('peak') || text.includes('moderate') || text.includes('wait')) {
    return 'moderate';
  }
  return 'low';
}

function computeRating(upvote = 0, downvote = 0): { rating: number; count: number } {
  const total = Math.max(0, upvote) + Math.max(0, downvote);
  if (total === 0) {
    return { rating: 4.2, count: 1 };
  }
  const ratio = upvote / total;
  const rating = Number((3.0 + ratio * 2.0).toFixed(1));
  return { rating, count: total };
}

function formatRelativeDate(iso?: string): string {
  if (!iso) return 'Verified via REFUGE';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Verified via REFUGE';
  return d.toLocaleDateString('en-SG', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function mapRefugeRestroomToFacility(
  item: RefugeRestroomDto,
  anchorLat: number,
  anchorLng: number
): Facility & { distanceMetersFromApi?: number } {
  const amenities: AmenityTag[] = [];
  if (item.accessible) amenities.push('wheelchair');
  if (item.changing_table) amenities.push('baby-care');
  if (item.unisex) amenities.push('unisex');
  amenities.push('free');

  const street = item.street?.trim() || '';
  const city = item.city?.trim() || '';
  const state = item.state?.trim() || '';
  const country = item.country?.trim() || '';
  const directions = item.directions?.trim() || '';
  const comment = item.comment?.trim() || '';

  const districtParts = [city];
  if (state && state.toLowerCase() !== city.toLowerCase()) {
    districtParts.push(state);
  }
  if (country && country.toLowerCase() !== state.toLowerCase() && country.toLowerCase() !== city.toLowerCase()) {
    districtParts.push(country);
  }
  const district = districtParts.filter(Boolean).join(', ') || 'Singapore';

  const floorNote =
    [street, directions].filter(Boolean).join(' · ') ||
    district ||
    'Public restroom access';

  const { rating, count } = computeRating(item.upvote, item.downvote);
  const crowd = inferCrowdLevel(item);
  const updatedLabel = formatRelativeDate(item.updated_at || item.created_at);

  const reviews: Review[] = comment
    ? [
        {
          id: `refuge-note-${item.id}`,
          author: 'REFUGE Community',
          rating,
          crowd,
          comment,
          timestamp: updatedLabel,
        },
      ]
    : [];

  const apiDistanceMeters =
    typeof item.distance === 'number' && Number.isFinite(item.distance)
      ? Math.round(item.distance * 1609.344)
      : haversineDistanceMeters(anchorLat, anchorLng, item.latitude, item.longitude);

  return {
    id: `refuge-${item.id}`,
    name: item.name?.trim() || 'Public Restroom',
    type: 'toilet',
    district,
    lat: item.latitude,
    lng: item.longitude,
    floorNote,
    hours: 'Check venue hours',
    rating,
    ratingCount: count,
    crowd,
    lastUpdated: updatedLabel,
    amenities,
    feeText: 'Public access',
    hygiene: {
      soap: true,
      tissue: !comment.toLowerCase().includes("doesn't always have toilet paper"),
      dryFloor: true,
      ventilation: true,
    },
    reviews,
    source: 'refuge',
    distanceMetersFromApi: apiDistanceMeters,
  };
}

export async function fetchRestrooms({
  lat,
  lng,
  ada,
  unisex,
  perPage = 20,
  signal,
}: FetchRestroomsParams): Promise<(Facility & { distanceMetersFromApi?: number })[]> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    per_page: String(perPage),
  });

  if (typeof ada === 'boolean') {
    params.set('ada', String(ada));
  }
  if (typeof unisex === 'boolean') {
    params.set('unisex', String(unisex));
  }

  const response = await fetch(`/api/restrooms?${params.toString()}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!response.ok) {
    let errorMessage = `Request failed (${response.status})`;
    try {
      const errBody = (await response.json()) as { error?: string };
      if (errBody?.error) errorMessage = errBody.error;
    } catch {
      // ignore non-json body
    }
    throw new Error(errorMessage);
  }

  const payload = (await response.json()) as RefugeRestroomDto[];
  if (!Array.isArray(payload)) {
    throw new Error('Unexpected response format from /api/restrooms.');
  }

  return payload
    .filter(
      (item) =>
        typeof item.latitude === 'number' &&
        typeof item.longitude === 'number' &&
        Number.isFinite(item.latitude) &&
        Number.isFinite(item.longitude)
    )
    .map((item) => mapRefugeRestroomToFacility(item, lat, lng));
}
