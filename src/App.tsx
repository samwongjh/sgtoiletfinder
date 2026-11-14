import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  LocateFixed,
  Plus,
  Check,
  X,
  ChevronUp,
  ChevronDown,
  MapPin,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import {
  CLARKE_QUAY_ANCHOR,
  SINGAPORE_CENTER_ANCHOR,
  estimateWalkMinutes,
  formatDistance,
  haversineDistanceMeters,
} from './data/singaporeFacilities';
import { fetchRestrooms } from './services/refugeApi';
import {
  AmenityTag,
  CrowdLevel,
  Facility,
  FacilityWithDistance,
  FilterChipId,
  SheetSnap,
  SingaporeHub,
  SortOption,
} from './types/facility';
import { TopBar } from './components/TopBar';
import { FilterStrip } from './components/FilterStrip';
import { MapCanvas } from './components/MapCanvas';
import { FacilityCard } from './components/FacilityCard';
import { FacilityDetail } from './components/FacilityDetail';
import { AddPinModal } from './components/AddPinModal';
import { NavigationBanner } from './components/NavigationBanner';
import { CrowdBadge, RatingScore } from './components/BrandAssets';

const STORAGE_KEY_CUSTOM_PINS = 'sgtoilets_user_pins_v1';
const STORAGE_KEY_THEME = 'sgtoilets_theme';

export default function App() {
  // Theme state synced with <html class="dark">
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    try {
      localStorage.setItem(STORAGE_KEY_THEME, isDark ? 'dark' : 'light');
    } catch {
      // ignore storage failure
    }
  }, [isDark]);

  // Community-added pins persisted locally + live REFUGE Restrooms API results
  const [customPins, setCustomPins] = useState<Facility[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_PINS);
      if (raw) {
        const parsed = JSON.parse(raw) as Facility[];
        return Array.isArray(parsed) ? parsed.filter((f) => f.type === 'toilet') : [];
      }
    } catch {
      // ignore parse failure
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_PINS, JSON.stringify(customPins));
    } catch {
      // ignore storage failure
    }
  }, [customPins]);

  const [facilities, setFacilities] = useState<Facility[]>(customPins);
  const [isLoadingRestrooms, setIsLoadingRestrooms] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchRevision, setFetchRevision] = useState<number>(0);

  // Anchor / Location State (centered on Singapore 1.3521, 103.8198)
  const [anchor, setAnchor] = useState<{ lat: number; lng: number; label: string }>(
    SINGAPORE_CENTER_ANCHOR
  );
  const [focusTrigger, setFocusTrigger] = useState(0);
  const [isLocating, setIsLocating] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [isNearbyOnly, setIsNearbyOnly] = useState(false);
  const [radiusMeters, setRadiusMeters] = useState(2000);
  const [activeFilters, setActiveFilters] = useState<FilterChipId[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('nearest');

  // Selection & Navigation
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
  const [navigatingFacilityId, setNavigatingFacilityId] = useState<string | null>(null);

  // Mobile Bottom Sheet Snap State
  const [sheetSnap, setSheetSnap] = useState<SheetSnap>('half');

  // Add Pin Placement Flow
  const [isAddPinMode, setIsAddPinMode] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: SINGAPORE_CENTER_ANCHOR.lat,
    lng: SINGAPORE_CENTER_ANCHOR.lng,
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  }, []);

  const isAdaFilterActive = activeFilters.includes('wheelchair');

  // Fetch live restrooms from /api/restrooms whenever anchor, ADA filter, or retry changes
  useEffect(() => {
    const controller = new AbortController();
    setIsLoadingRestrooms(true);
    setFetchError(null);

    fetchRestrooms({
      lat: anchor.lat,
      lng: anchor.lng,
      ada: isAdaFilterActive ? true : undefined,
      perPage: 20,
      signal: controller.signal,
    })
      .then((remoteList) => {
        setFacilities((prev) => {
          const prevById = new Map<string, Facility>(prev.map((item) => [item.id, item]));
          const mergedRemote = remoteList.map((item) => {
            const existing = prevById.get(item.id);
            if (!existing) return item;
            return {
              ...item,
              crowd: existing.crowd,
              rating: existing.rating,
              ratingCount: existing.ratingCount,
              reviews: existing.reviews.length > item.reviews.length ? existing.reviews : item.reviews,
            };
          });
          return [...customPins, ...mergedRemote];
        });
        setIsLoadingRestrooms(false);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const message =
          err instanceof Error ? err.message : 'Unable to load restrooms from REFUGE API.';
        setFetchError(message);
        setFacilities(customPins);
        setIsLoadingRestrooms(false);
      });

    return () => controller.abort();
  }, [anchor.lat, anchor.lng, isAdaFilterActive, fetchRevision, customPins]);

  // Compute distances and apply search/filter/sort
  const facilitiesWithDistance = useMemo<FacilityWithDistance[]>(() => {
    return facilities.map((f) => {
      const distanceMeters =
        typeof f.distanceMetersFromApi === 'number'
          ? f.distanceMetersFromApi
          : haversineDistanceMeters(anchor.lat, anchor.lng, f.lat, f.lng);
      return {
        ...f,
        distanceMeters,
        walkMinutes: estimateWalkMinutes(distanceMeters),
      };
    });
  }, [facilities, anchor.lat, anchor.lng]);

  const filteredFacilities = useMemo<FacilityWithDistance[]>(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = facilitiesWithDistance.filter((f) => {
      if (isNearbyOnly && !q && f.distanceMeters > radiusMeters) {
        return false;
      }

      if (q) {
        const hay = `${f.name} ${f.district} ${f.floorNote}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      if (activeFilters.length > 0) {
        return activeFilters.every((tag) => f.amenities.includes(tag));
      }

      return true;
    });

    const crowdRank: Record<CrowdLevel, number> = { low: 0, moderate: 1, busy: 2 };

    return [...filtered].sort((a, b) => {
      if (sortBy === 'cleanest') {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return a.distanceMeters - b.distanceMeters;
      }
      if (sortBy === 'least-busy') {
        if (crowdRank[a.crowd] !== crowdRank[b.crowd]) {
          return crowdRank[a.crowd] - crowdRank[b.crowd];
        }
        return a.distanceMeters - b.distanceMeters;
      }
      return a.distanceMeters - b.distanceMeters;
    });
  }, [facilitiesWithDistance, isNearbyOnly, radiusMeters, searchQuery, activeFilters, sortBy]);

  const handleToggleFilter = useCallback((id: FilterChipId) => {
    setActiveFilters((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const selectedFacility = useMemo(
    () => facilitiesWithDistance.find((f) => f.id === selectedFacilityId) || null,
    [facilitiesWithDistance, selectedFacilityId]
  );

  const navigatingFacility = useMemo(
    () => facilitiesWithDistance.find((f) => f.id === navigatingFacilityId) || null,
    [facilitiesWithDistance, navigatingFacilityId]
  );

  // Handlers
  const handleSelectHub = (hub: SingaporeHub) => {
    setAnchor({ lat: hub.lat, lng: hub.lng, label: hub.name });
    setSelectedFacilityId(null);
    setNavigatingFacilityId(null);
    setIsNearbyOnly(true);
    setFocusTrigger((n) => n + 1);
  };

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setAnchor(CLARKE_QUAY_ANCHOR);
      setFocusTrigger((n) => n + 1);
      showToast('GPS unavailable — centered on Clarke Quay MRT');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const inSingapore =
          latitude >= 1.13 && latitude <= 1.48 && longitude >= 103.5 && longitude <= 104.1;

        if (inSingapore) {
          setAnchor({ lat: latitude, lng: longitude, label: 'My Location' });
          setFocusTrigger((n) => n + 1);
          showToast('Centered on your current Singapore location');
        } else {
          setAnchor(CLARKE_QUAY_ANCHOR);
          setFocusTrigger((n) => n + 1);
          showToast('Outside Singapore bounds — centered on Clarke Quay MRT');
        }
        setIsLocating(false);
      },
      () => {
        setAnchor(CLARKE_QUAY_ANCHOR);
        setFocusTrigger((n) => n + 1);
        setIsLocating(false);
        showToast('Centered on Clarke Quay MRT');
      },
      { timeout: 6000, enableHighAccuracy: true }
    );
  };

  const handleSelectFacility = useCallback((facility: FacilityWithDistance) => {
    setSelectedFacilityId(facility.id);
    if (window.innerWidth < 1024) {
      setSheetSnap('full');
    }
  }, []);

  const handleNavigate = (facility: FacilityWithDistance) => {
    setSelectedFacilityId(facility.id);
    setNavigatingFacilityId(facility.id);
    if (window.innerWidth < 1024) {
      setSheetSnap('peek');
    }
  };

  const handleUpdateCrowd = (facilityId: string, crowd: CrowdLevel) => {
    setFacilities((prev) =>
      prev.map((f) => (f.id === facilityId ? { ...f, crowd, lastUpdated: 'Just now' } : f))
    );
    showToast('Crowd status updated');
  };

  const handleSubmitReview = (
    facilityId: string,
    payload: { rating: number; crowd: CrowdLevel; comment: string }
  ) => {
    setFacilities((prev) =>
      prev.map((f) => {
        if (f.id !== facilityId) return f;
        const nextCount = f.ratingCount + 1;
        const nextAvg = Number(
          ((f.rating * f.ratingCount + payload.rating) / nextCount).toFixed(1)
        );
        const newReview = {
          id: `rev-${Date.now()}`,
          author: 'You',
          rating: payload.rating,
          crowd: payload.crowd,
          comment: payload.comment,
          timestamp: 'Just now',
        };
        return {
          ...f,
          rating: nextAvg,
          ratingCount: nextCount,
          crowd: payload.crowd,
          lastUpdated: 'Just now',
          reviews: [newReview, ...f.reviews],
        };
      })
    );
  };

  const handleSaveNewPin = (data: {
    name: string;
    floorNote: string;
    district: string;
    amenities: AmenityTag[];
    isFree: boolean;
  }) => {
    const newId = `sg-user-${Date.now()}`;
    const newFacility: Facility = {
      id: newId,
      name: data.name,
      type: 'toilet',
      district: data.district,
      lat: mapCenter.lat,
      lng: mapCenter.lng,
      floorNote: data.floorNote,
      hours: data.amenities.includes('24h') ? '24 Hours' : '07:00 – 22:30',
      rating: 5.0,
      ratingCount: 1,
      crowd: 'low',
      lastUpdated: 'Just now',
      amenities: data.amenities,
      feeText: data.isFree ? 'Free entry' : '$0.20 entry',
      hygiene: { soap: true, tissue: true, dryFloor: true, ventilation: true },
      reviews: [],
      source: 'community',
    };

    setCustomPins((prev) => [newFacility, ...prev]);
    setFacilities((prev) => [newFacility, ...prev]);
    setIsAddModalOpen(false);
    setIsAddPinMode(false);
    setSelectedFacilityId(newId);
    showToast('Toilet pinned to map');
  };

  const cycleMobileSheet = () => {
    setSheetSnap((prev) => (prev === 'peek' ? 'half' : prev === 'half' ? 'full' : 'peek'));
  };

  const mobileSheetHeightClass =
    sheetSnap === 'peek'
      ? 'h-[86px]'
      : sheetSnap === 'half'
      ? 'h-[46vh]'
      : 'h-[84vh]';

  const nearestFacility = filteredFacilities[0] || null;

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#faf8ff] dark:bg-[#0b1120] text-[#131b2e] dark:text-slate-100">
      {/* Level 0: Full-Viewport Map Canvas */}
      <MapCanvas
        facilities={filteredFacilities}
        selectedFacilityId={selectedFacilityId}
        onSelectFacility={handleSelectFacility}
        navigatingFacility={navigatingFacility}
        anchor={anchor}
        radiusMeters={radiusMeters}
        isNearbyOnly={isNearbyOnly}
        isDark={isDark}
        isAddPinMode={isAddPinMode}
        onMapCenterChange={setMapCenter}
        focusTrigger={focusTrigger}
      />

      {/* Level 1: Floating Top Capsule Header */}
      <TopBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isNearbyOnly={isNearbyOnly}
        onToggleNearby={setIsNearbyOnly}
        radiusMeters={radiusMeters}
        isDark={isDark}
        onToggleTheme={() => setIsDark((d) => !d)}
        onSelectHub={handleSelectHub}
        onUseGps={handleUseGps}
        isLocating={isLocating}
        activeAnchorLabel={anchor.label}
      />

      {/* Active Walking Route Banner */}
      {navigatingFacility && (
        <NavigationBanner
          facility={navigatingFacility}
          onStop={() => setNavigatingFacilityId(null)}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-900/92 dark:bg-white/95 text-white dark:text-slate-900 text-xs font-semibold shadow-lg backdrop-blur-md whitespace-nowrap"
        >
          {toastMessage}
        </div>
      )}

      {/* Desktop Left Floating Panel (390px anchored with 1.5rem margin) */}
      <aside
        aria-label="Nearby facilities directory"
        className="hidden lg:flex flex-col fixed left-6 top-24 bottom-6 w-[390px] z-20 rounded-3xl bg-white/92 dark:bg-slate-900/92 backdrop-blur-xl border border-white/80 dark:border-slate-700/70 shadow-[0_8px_30px_rgba(15,23,42,0.12)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.5)] p-5 overflow-hidden"
      >
        {selectedFacility ? (
          <FacilityDetail
            facility={selectedFacility}
            isNavigating={navigatingFacilityId === selectedFacility.id}
            onBack={() => setSelectedFacilityId(null)}
            onNavigate={handleNavigate}
            onStopNavigate={() => setNavigatingFacilityId(null)}
            onUpdateCrowd={handleUpdateCrowd}
            onSubmitReview={handleSubmitReview}
          />
        ) : (
          <>
            <div className="flex items-baseline justify-between gap-2 pb-3">
              <div>
                <h1 className="text-base font-extrabold tracking-tight text-[#131b2e] dark:text-slate-50">
                  {isNearbyOnly ? 'Public Toilets Nearby' : 'All Singapore Toilets'}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums mt-0.5">
                  {filteredFacilities.length}{' '}
                  {filteredFacilities.length === 1 ? 'toilet' : 'toilets'} around {anchor.label}
                </p>
              </div>
              <button
                type="button"
                onClick={handleUseGps}
                className="text-xs font-semibold text-[#0D8B99] dark:text-cyan-400 hover:underline whitespace-nowrap"
              >
                {isLocating ? 'Locating...' : 'Recenter'}
              </button>
            </div>

            <FilterStrip
              activeFilters={activeFilters}
              onToggleFilter={handleToggleFilter}
              onClearFilters={() => setActiveFilters([])}
              sortBy={sortBy}
              onChangeSort={setSortBy}
              radiusMeters={radiusMeters}
              onChangeRadius={setRadiusMeters}
              isNearbyOnly={isNearbyOnly}
            />

            <div className="flex-1 overflow-y-auto thin-scrollbar mt-3.5 space-y-3 pr-1">
              {isLoadingRestrooms ? (
                <div className="py-12 px-4 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70">
                  <Loader2
                    className="w-6 h-6 mx-auto text-[#0D8B99] dark:text-cyan-400 animate-spin mb-2"
                    aria-hidden="true"
                  />
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Loading live restrooms...
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Fetching REFUGE Restrooms near {anchor.label}
                  </p>
                </div>
              ) : fetchError ? (
                <div className="py-10 px-4 text-center rounded-2xl bg-red-50/70 dark:bg-red-950/30 border border-red-200/80 dark:border-red-900/60">
                  <AlertTriangle
                    className="w-6 h-6 mx-auto text-red-600 dark:text-red-400 mb-2"
                    aria-hidden="true"
                  />
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Could not load restrooms
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {fetchError}
                  </p>
                  <button
                    type="button"
                    onClick={() => setFetchRevision((n) => n + 1)}
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D8B99] text-white text-xs font-semibold"
                  >
                    <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Retry</span>
                  </button>
                </div>
              ) : filteredFacilities.length === 0 ? (
                <div className="py-10 px-4 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70">
                  <MapPin className="w-6 h-6 mx-auto text-slate-400 mb-2" aria-hidden="true" />
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    No spots match your filter
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Try expanding to All SG or clearing selected filters.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNearbyOnly(false);
                      setActiveFilters([]);
                      setSearchQuery('');
                    }}
                    className="mt-3 px-4 py-2 rounded-xl bg-[#0D8B99] text-white text-xs font-semibold"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                filteredFacilities.map((facility) => (
                  <FacilityCard
                    key={facility.id}
                    facility={facility}
                    isSelected={selectedFacilityId === facility.id}
                    isNavigating={navigatingFacilityId === facility.id}
                    onSelect={handleSelectFacility}
                    onNavigate={handleNavigate}
                  />
                ))
              )}
            </div>
          </>
        )}
      </aside>

      {/* Floating Map Controls (Bottom Right on Desktop, Right side above sheet on Mobile) */}
      <div className="fixed right-3 sm:right-6 bottom-24 lg:bottom-24 z-20 flex flex-col items-end gap-2.5">
        {isAddPinMode ? (
          <div className="flex flex-col items-end gap-2 p-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700 shadow-xl">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
              Pan map to place public toilet
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAddPinMode(false)}
                aria-label="Cancel pin placement"
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-300"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="min-h-[40px] inline-flex items-center gap-1.5 px-4 rounded-xl bg-[#0D8B99] hover:bg-[#0b7884] text-white text-xs font-bold shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Spot</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-end gap-2">
            <button
              type="button"
              onClick={handleUseGps}
              aria-label="Center map on my location"
              title="Use my GPS location"
              className="min-w-[46px] min-h-[46px] flex items-center justify-center rounded-full bg-white/92 dark:bg-slate-900/92 backdrop-blur-md border border-white/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <LocateFixed className="w-5 h-5 text-[#2563EB] dark:text-blue-400" />
            </button>

            <button
              type="button"
              onClick={() => setIsAddPinMode(true)}
              className="min-h-[46px] inline-flex items-center gap-2 px-4 rounded-full bg-[#0D8B99] hover:bg-[#0b7884] dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white text-xs font-bold shadow-[0_8px_20px_-4px_rgba(13,139,153,0.45)] transition-colors"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Map Toilet</span>
            </button>
          </div>
        )}
      </div>

      {/* Mobile Ergonomic Bottom Sheet (Peek / Half / Full) */}
      <section
        aria-label="Nearby facilities sheet"
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-30 rounded-t-[28px] bg-white/96 dark:bg-slate-900/96 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-700/80 shadow-[0_-8px_28px_-4px_rgba(15,23,42,0.16)] dark:shadow-[0_-8px_32px_rgba(0,0,0,0.6)] transition-[height] duration-200 ease-out flex flex-col ${mobileSheetHeightClass}`}
      >
        {/* Drag / Snap Handle */}
        <button
          type="button"
          onClick={cycleMobileSheet}
          aria-label="Toggle facility drawer height"
          className="w-full pt-2.5 pb-2 px-4 flex flex-col items-center shrink-0 focus-visible:outline-none"
        >
          <span className="w-9 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mb-2" />
          {sheetSnap === 'peek' ? (
            <div className="w-full flex items-center justify-between gap-3">
              <div className="min-w-0 text-left">
                <p className="text-xs font-bold text-[#131b2e] dark:text-slate-100 truncate">
                  {selectedFacility
                    ? selectedFacility.name
                    : nearestFacility
                    ? `Nearest: ${nearestFacility.name}`
                    : `${filteredFacilities.length} spots nearby`}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                  {selectedFacility
                    ? `${formatDistance(selectedFacility.distanceMeters)} · ${selectedFacility.walkMinutes} min walk`
                    : nearestFacility
                    ? `${formatDistance(nearestFacility.distanceMeters)} · ${nearestFacility.walkMinutes} min walk`
                    : 'Tap to browse'}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {(selectedFacility || nearestFacility) && (
                  <>
                    <CrowdBadge crowd={(selectedFacility || nearestFacility)!.crowd} compact />
                    <RatingScore rating={(selectedFacility || nearestFacility)!.rating} />
                  </>
                )}
                <ChevronUp className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          ) : (
            <div className="w-full flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#131b2e] dark:text-slate-100">
                {selectedFacility
                  ? 'Facility Details'
                  : `${filteredFacilities.length} ${
                      filteredFacilities.length === 1 ? 'Spot' : 'Spots'
                    } ${isNearbyOnly ? 'Nearby' : 'in Singapore'}`}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0D8B99] dark:text-cyan-400">
                {sheetSnap === 'full' ? (
                  <>
                    <span>Collapse</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <span>Expand</span>
                    <ChevronUp className="w-3.5 h-3.5" />
                  </>
                )}
              </span>
            </div>
          )}
        </button>

        {/* Sheet Body */}
        {sheetSnap !== 'peek' && (
          <div className="flex-1 min-h-0 px-4 pb-4 flex flex-col overflow-hidden">
            {selectedFacility ? (
              <FacilityDetail
                facility={selectedFacility}
                isNavigating={navigatingFacilityId === selectedFacility.id}
                onBack={() => setSelectedFacilityId(null)}
                onNavigate={handleNavigate}
                onStopNavigate={() => setNavigatingFacilityId(null)}
                onUpdateCrowd={handleUpdateCrowd}
                onSubmitReview={handleSubmitReview}
              />
            ) : (
              <>
                <FilterStrip
                  activeFilters={activeFilters}
                  onToggleFilter={handleToggleFilter}
                  onClearFilters={() => setActiveFilters([])}
                  sortBy={sortBy}
                  onChangeSort={setSortBy}
                  radiusMeters={radiusMeters}
                  onChangeRadius={setRadiusMeters}
                  isNearbyOnly={isNearbyOnly}
                />

                <div className="flex-1 overflow-y-auto thin-scrollbar mt-3 space-y-2.5 pr-0.5">
                  {isLoadingRestrooms ? (
                    <div className="py-10 px-4 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70">
                      <Loader2
                        className="w-5 h-5 mx-auto text-[#0D8B99] dark:text-cyan-400 animate-spin mb-2"
                        aria-hidden="true"
                      />
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Loading live restrooms...
                      </p>
                    </div>
                  ) : fetchError ? (
                    <div className="py-8 px-4 text-center rounded-2xl bg-red-50/70 dark:bg-red-950/30 border border-red-200/80 dark:border-red-900/60">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Could not load restrooms
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {fetchError}
                      </p>
                      <button
                        type="button"
                        onClick={() => setFetchRevision((n) => n + 1)}
                        className="mt-2.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D8B99] text-white text-xs font-semibold"
                      >
                        <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Retry</span>
                      </button>
                    </div>
                  ) : filteredFacilities.length === 0 ? (
                    <div className="py-8 px-4 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        No spots match your filter
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsNearbyOnly(false);
                          setActiveFilters([]);
                          setSearchQuery('');
                        }}
                        className="mt-2.5 px-4 py-2 rounded-xl bg-[#0D8B99] text-white text-xs font-semibold"
                      >
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    filteredFacilities.map((facility) => (
                      <FacilityCard
                        key={facility.id}
                        facility={facility}
                        isSelected={selectedFacilityId === facility.id}
                        isNavigating={navigatingFacilityId === facility.id}
                        onSelect={handleSelectFacility}
                        onNavigate={handleNavigate}
                      />
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </section>

      {/* Add Pin Details Modal */}
      <AddPinModal
        isOpen={isAddModalOpen}
        coords={mapCenter}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleSaveNewPin}
      />
    </div>
  );
}
