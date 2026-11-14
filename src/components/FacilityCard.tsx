import React from 'react';
import { Navigation, ChevronRight } from 'lucide-react';
import { FacilityWithDistance } from '../types/facility';
import { formatDistance } from '../data/singaporeFacilities';
import { AmenityBadge, CrowdBadge, FountainPinIcon, RatingScore } from './BrandAssets';

interface FacilityCardProps {
  facility: FacilityWithDistance;
  isSelected: boolean;
  isNavigating: boolean;
  onSelect: (facility: FacilityWithDistance) => void;
  onNavigate: (facility: FacilityWithDistance) => void;
}

export const FacilityCard: React.FC<FacilityCardProps> = ({
  facility,
  isSelected,
  isNavigating,
  onSelect,
  onNavigate,
}) => {
  return (
    <article
      className={`p-4 rounded-2xl transition-all border ${
        isSelected
          ? 'bg-[#f0fdfe] dark:bg-cyan-950/35 border-[#0D8B99] dark:border-cyan-500/70 shadow-[0_8px_20px_-4px_rgba(13,139,153,0.18)]'
          : 'bg-white dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => onSelect(facility)}
          className="flex-1 min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D8B99] rounded-lg"
        >
          <div className="flex items-center gap-2">
            {facility.type === 'fountain' && <FountainPinIcon className="w-4 h-6 shrink-0" />}
            <h3 className="text-sm sm:text-[15px] font-bold text-[#131b2e] dark:text-slate-100 leading-snug truncate">
              {facility.name}
            </h3>
          </div>
          <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400 tabular-nums">
            {formatDistance(facility.distanceMeters)}
            <span aria-hidden="true"> · </span>
            {facility.walkMinutes} min walk
            <span aria-hidden="true"> · </span>
            <span>{facility.district}</span>
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
            {facility.floorNote}
          </p>
        </button>

        <RatingScore rating={facility.rating} />
      </div>

      {/* Status Row */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <CrowdBadge crowd={facility.crowd} compact />
        {facility.amenities.slice(0, 2).map((tag) => (
          <AmenityBadge key={tag} tag={tag} />
        ))}
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 ml-auto whitespace-nowrap">
          {facility.feeText}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="mt-3.5 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onNavigate(facility)}
          className={`min-h-[42px] inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D8B99] ${
            isNavigating
              ? 'bg-[#2563EB] text-white hover:bg-[#1d4ed8]'
              : 'bg-[#0D8B99] text-white hover:bg-[#0b7884] dark:bg-cyan-600 dark:hover:bg-cyan-500'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{isNavigating ? 'Navigating' : 'Navigate'}</span>
        </button>

        <button
          type="button"
          onClick={() => onSelect(facility)}
          className="min-h-[42px] inline-flex items-center justify-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200/70 dark:border-slate-700 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D8B99]"
        >
          <span>Details</span>
          <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
};
