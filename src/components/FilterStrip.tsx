import React from 'react';
import { Accessibility, Baby, Clock, Droplets, DollarSign, Sparkles } from 'lucide-react';
import { FilterChipId, SortOption } from '../types/facility';

interface FilterStripProps {
  activeFilter: FilterChipId;
  onSelectFilter: (id: FilterChipId) => void;
  sortBy: SortOption;
  onChangeSort: (sort: SortOption) => void;
  radiusMeters: number;
  onChangeRadius: (r: number) => void;
  isNearbyOnly: boolean;
}

const FILTER_OPTIONS: {
  id: FilterChipId;
  label: string;
  Icon?: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'all', label: 'All' },
  { id: 'toilet', label: 'Toilets', Icon: Sparkles },
  { id: 'fountain', label: 'Water Fountains', Icon: Droplets },
  { id: 'wheelchair', label: 'Wheelchair', Icon: Accessibility },
  { id: 'baby-care', label: 'Baby Care', Icon: Baby },
  { id: 'free', label: 'Free', Icon: DollarSign },
  { id: '24h', label: '24 Hours', Icon: Clock },
];

export const FilterStrip: React.FC<FilterStripProps> = ({
  activeFilter,
  onSelectFilter,
  sortBy,
  onChangeSort,
  radiusMeters,
  onChangeRadius,
  isNearbyOnly,
}) => {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {FILTER_OPTIONS.map(({ id, label, Icon }) => {
          const active = activeFilter === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectFilter(id)}
              className={`min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap shrink-0 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D8B99] ${
                active
                  ? 'bg-[#0D8B99] text-white border-[#0D8B99] dark:bg-cyan-500 dark:text-slate-950 dark:border-cyan-500 shadow-sm'
                  : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200/70 dark:border-slate-700/70 hover:bg-slate-200/70 dark:hover:bg-slate-700/80'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
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
