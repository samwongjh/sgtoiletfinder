export type FacilityType = 'toilet';

export type CrowdLevel = 'low' | 'moderate' | 'busy';

export type AmenityTag =
  | 'wheelchair'
  | 'baby-care'
  | 'nursing'
  | 'unisex'
  | 'bidet'
  | 'free'
  | '24h';

export type FilterChipId =
  | 'wheelchair'
  | 'baby-care'
  | 'nursing'
  | 'bidet'
  | 'free'
  | '24h';

export type SortOption = 'nearest' | 'cleanest' | 'least-busy';

export type SheetSnap = 'peek' | 'half' | 'full';

export interface HygieneChecklist {
  soap: boolean;
  tissue: boolean;
  dryFloor: boolean;
  ventilation: boolean;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  crowd: CrowdLevel;
  comment: string;
  timestamp: string;
}

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  district: string;
  lat: number;
  lng: number;
  floorNote: string;
  hours: string;
  rating: number;
  ratingCount: number;
  crowd: CrowdLevel;
  lastUpdated: string;
  amenities: AmenityTag[];
  feeText: string;
  hygiene: HygieneChecklist;
  reviews: Review[];
  source: 'refuge' | 'community';
  distanceMetersFromApi?: number;
}

export interface FacilityWithDistance extends Facility {
  distanceMeters: number;
  walkMinutes: number;
}

export interface SingaporeHub {
  name: string;
  district: string;
  lat: number;
  lng: number;
}
