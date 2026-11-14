import React from 'react';
import { Navigation, X, ExternalLink } from 'lucide-react';
import { FacilityWithDistance } from '../types/facility';
import { formatDistance } from '../data/singaporeFacilities';

interface NavigationBannerProps {
  facility: FacilityWithDistance;
  onStop: () => void;
}

export const NavigationBanner: React.FC<NavigationBannerProps> = ({ facility, onStop }) => {
  const externalMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lng}&travelmode=walking`;

  return (
    <div className="pointer-events-auto fixed top-[116px] lg:top-24 left-3 right-3 lg:left-auto lg:right-6 lg:w-[360px] z-30">
      <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-[#2563EB] dark:bg-blue-600 text-white shadow-[0_12px_28px_-6px_rgba(37,99,235,0.45)] border border-white/20">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <Navigation className="w-4 h-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold truncate">{facility.name}</p>
            <p className="text-[11px] text-blue-100 tabular-nums truncate">
              {formatDistance(facility.distanceMeters)} · {facility.walkMinutes} min walk ·{' '}
              {facility.floorNote}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <a
            href={externalMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open in Google Maps"
            title="Open in Google Maps"
            className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            type="button"
            onClick={onStop}
            aria-label="Stop navigation"
            className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
