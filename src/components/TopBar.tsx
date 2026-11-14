import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Moon, Sun, MapPin, LocateFixed } from 'lucide-react';
import { BrandLogoIcon } from './BrandAssets';
import { SINGAPORE_HUBS } from '../data/singaporeFacilities';
import { SingaporeHub } from '../types/facility';

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isNearbyOnly: boolean;
  onToggleNearby: (nearby: boolean) => void;
  radiusMeters: number;
  isDark: boolean;
  onToggleTheme: () => void;
  onSelectHub: (hub: SingaporeHub) => void;
  onUseGps: () => void;
  isLocating: boolean;
  activeAnchorLabel: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  searchQuery,
  onSearchChange,
  isNearbyOnly,
  onToggleNearby,
  radiusMeters,
  isDark,
  onToggleTheme,
  onSelectHub,
  onUseGps,
  isLocating,
  activeAnchorLabel,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const radiusLabel = radiusMeters >= 1000 ? `${radiusMeters / 1000}km` : `${radiusMeters}m`;

  return (
    <header className="pointer-events-none fixed top-0 left-0 right-0 z-30 p-3 sm:p-4 lg:p-6">
      <div className="max-w-[1440px] mx-auto flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5 sm:gap-3">
        {/* Brand Capsule */}
        <div className="pointer-events-auto flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-white/92 dark:bg-slate-900/92 backdrop-blur-md border border-white/80 dark:border-slate-700/70 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.08),0_2px_4px_-1px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.45)] shrink-0">
          <BrandLogoIcon className="w-6 h-6" />
          <span className="text-base sm:text-lg font-extrabold tracking-tight text-[#131b2e] dark:text-slate-50 whitespace-nowrap">
            sgtoilets
          </span>
          <span className="hidden sm:inline-block h-4 w-px bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
          <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-[#0D8B99] dark:text-cyan-400 whitespace-nowrap">
            <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="max-w-[130px] truncate">{activeAnchorLabel}</span>
          </span>
        </div>

        {/* Search Input Capsule */}
        <div ref={containerRef} className="pointer-events-auto relative order-3 lg:order-2 w-full lg:flex-1 lg:max-w-md">
          <div className="flex items-center gap-2 px-3.5 h-11 rounded-full bg-white/92 dark:bg-slate-900/92 backdrop-blur-md border border-white/80 dark:border-slate-700/70 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.08),0_2px_4px_-1px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.45)] focus-within:ring-2 focus-within:ring-[#0D8B99] dark:focus-within:ring-cyan-400 transition-shadow">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-400 shrink-0" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search MRT, mall, or Singapore district..."
              aria-label="Search Singapore toilets and water fountains"
              className="w-full bg-transparent text-sm font-medium text-[#131b2e] dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
                className="min-w-[32px] min-h-[32px] flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {showSuggestions && (
            <div className="absolute left-0 right-0 mt-2 p-2 rounded-2xl bg-white/96 dark:bg-slate-900/96 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 shadow-xl z-40">
              <div className="flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>Jump to Singapore Hub</span>
                <button
                  type="button"
                  onClick={() => {
                    onUseGps();
                    setShowSuggestions(false);
                  }}
                  className="inline-flex items-center gap-1 text-[#0D8B99] dark:text-cyan-400 hover:underline whitespace-nowrap"
                >
                  <LocateFixed className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{isLocating ? 'Locating...' : 'Use my GPS'}</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1 mt-1">
                {SINGAPORE_HUBS.map((hub) => (
                  <button
                    key={hub.name}
                    type="button"
                    onClick={() => {
                      onSelectHub(hub);
                      setShowSuggestions(false);
                    }}
                    className="flex flex-col items-start px-2.5 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate w-full">
                      {hub.name}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate w-full">
                      {hub.district}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Controls: Nearby Segmented Toggle & Theme Toggle */}
        <div className="pointer-events-auto order-2 lg:order-3 flex items-center gap-2 shrink-0">
          {/* Nearby Segmented Switch */}
          <div
            role="group"
            aria-label="Distance filter mode"
            className="relative flex items-center p-1 rounded-full bg-white/92 dark:bg-slate-900/92 backdrop-blur-md border border-white/80 dark:border-slate-700/70 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.08),0_2px_4px_-1px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.45)]"
          >
            <button
              type="button"
              onClick={() => onToggleNearby(true)}
              className={`relative z-10 min-h-[36px] px-3 sm:px-3.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                isNearbyOnly
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Nearby · {radiusLabel}
            </button>
            <button
              type="button"
              onClick={() => onToggleNearby(false)}
              className={`relative z-10 min-h-[36px] px-3 sm:px-3.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                !isNearbyOnly
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All SG
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/92 dark:bg-slate-900/92 backdrop-blur-md border border-white/80 dark:border-slate-700/70 text-slate-700 dark:text-amber-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.08),0_2px_4px_-1px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.45)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D8B99]"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
