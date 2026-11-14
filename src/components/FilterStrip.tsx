import React from 'react';
import { Clock, DollarSign, Sparkles, Check } from 'lucide-react';
import { FilterChipId, SortOption } from '../types/facility';
import { BabyChangingIcon, NursingBottleIcon, WheelchairIcon } from './BrandAssets';

interface FilterStripProps {
  activeFilters: FilterChipId[];
  onToggleFilter: (id: FilterChipId) => void;
  onClearFilters: () => void;
  sortBy: SortOption;
  onChangeSort: (sort: SortOption) => void;
  radiusMeters: number;
  onChangeRadius: (r: number) => void;
  isNearbyOnly: boolean;
}

const FILTER_OPTIONS: {
  id: FilterChipId;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'wheelchair', label: 'Wheelchair', Icon: WheelchairIcon },
  { id: 'nursing', label: 'Nursing Room', Icon: NursingBottleIcon },
  { id: 'baby-care', label: 'Baby Changing', Icon: BabyChangingIcon },
  { id: 'bidet', label: 'Bidet', Icon: Sparkles },
  { id: 'free', label: 'Free', Icon: DollarSign },
  { id: '24h', label: '24 Hours', Icon: Clock },
];

export const FilterStrip: React.FC<FilterStripProps> = ({
  activeFilters,
  onToggleFilter,
  onClearFilters,
  sortBy,
  onChangeSort,
  radiusMeters,
  onChangeRadius,
  isNearbyOnly,
}) => {
  const isAllSelected = activeFilters.length === 0;

  return (
    <div className="space-y-2.5">
      <div
        role="group"
        aria-label="Multi-select amenity filters"
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5"
      >
        <button
          type="button"
          onClick={onClearFilters}
          aria-pressed={isAllSelected}
          className={`min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap shrink-0 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D8B99] ${
            isAllSelected
              ? 'bg-[#0D8B99] text-white border-[#0D8B99] dark:bg-cyan-500 dark:text-slate-950 dark:border-cyan-500 shadow-sm'
              : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200/70 dark:border-slate-700/70 hover:bg-slate-200/70 dark:hover:bg-slate-700/80'
          }`}
        >
          <span>All</span>
        </button>

        {FILTER_OPTIONS.map(({ id, label, Icon }) => {
          const active = activeFilters.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => onToggleFilter(id)}
              aria-pressed={active}
              className={`min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap shrink-0 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D8B99] ${
                active
                  ? 'bg-[#0D8B99] text-white border-[#0D8B99] dark:bg-cyan-500 dark:text-slate-950 dark:border-cyan-500 shadow-sm'
                  : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200/70 dark:border-slate-700/70 hover:bg-slate-200/70 dark:hover:bg-slate-700/80'
              }`}
            >
              {active ? (
                <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              ) : (
                <Icon className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Sort:</span>
          <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800/90 p-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
            {(
              [
                { id: 'nearest', label: 'Nearest' },
                { id: 'cleanest', label: 'Cleanest' },
                { id: 'least-busy', label: 'Least Busy' },
              ] as { id: SortOption; label: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeSort(opt.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  sortBy === opt.id
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {isNearbyOnly && (
          <div className="flex items-center gap-1 shrink-0">
            {[500, 1000, 2000].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onChangeRadius(r)}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold tabular-nums transition-colors whitespace-nowrap ${
                  radiusMeters === r
                    ? 'bg-[#2563EB]/12 text-[#2563EB] dark:bg-blue-500/20 dark:text-blue-300'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {r >= 1000 ? `${r / 1000}km` : `${r}m`}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
