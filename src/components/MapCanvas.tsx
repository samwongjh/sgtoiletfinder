import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { AmenityTag, CrowdLevel, FacilityWithDistance } from '../types/facility';
import {
  BabyChangingIcon,
  NursingBottleIcon,
  WheelchairIcon,
} from './BrandAssets';

interface MapCanvasProps {
  facilities: FacilityWithDistance[];
  selectedFacilityId: string | null;
  onSelectFacility: (facility: FacilityWithDistance) => void;
  navigatingFacility: FacilityWithDistance | null;
  anchor: { lat: number; lng: number };
  radiusMeters: number;
  isNearbyOnly: boolean;
  isDark: boolean;
  isAddPinMode: boolean;
  onMapCenterChange: (coords: { lat: number; lng: number }) => void;
  focusTrigger: number;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const CROWD_STYLES: Record<
  CrowdLevel,
  {
    color: string;
    bgLight: string;
    textColor: string;
    halo: string;
    shortLabel: string;
  }
> = {
  low: {
    color: '#059669',
    bgLight: '#ECFDF5',
    textColor: '#065F46',
    halo: 'rgba(5, 150, 105, 0.28)',
    shortLabel: 'Low',
  },
  moderate: {
    color: '#D97706',
    bgLight: '#FFFBEB',
    textColor: '#92400E',
    halo: 'rgba(217, 119, 6, 0.28)',
    shortLabel: 'Mod',
  },
  busy: {
    color: '#DC2626',
    bgLight: '#FEF2F2',
    textColor: '#991B1B',
    halo: 'rgba(220, 38, 38, 0.3)',
    shortLabel: 'Busy',
  },
};

const WHEELCHAIR_SVG = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="4.5" r="1.75" fill="currentColor" stroke="none"/><path d="M11 8.5v5.5h5.5l2 4.5"/><path d="M11 11.5h4"/><path d="M14.5 16.5a5 5 0 1 1-5.8-6.4"/></svg>`;
const NURSING_SVG = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3.5a2 2 0 0 1 4 0v1.5h-4V3.5Z"/><path d="M8.5 5h7l.5 2.5H8L8.5 5Z"/><rect x="7.5" y="7.5" width="9" height="13" rx="2.5"/><path d="M10.5 11.5h2.5"/><path d="M10.5 14.5h2.5"/></svg>`;
const BABY_CHANGING_SVG = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="7" r="2"/><path d="M5 14c1.5-2.2 4.5-2.5 7.5-1.5l3.5 1.2"/><path d="M4 17.5h16"/><path d="M6 17.5V20"/><path d="M18 17.5V20"/></svg>`;

function renderAmenityChipsHtml(amenities: AmenityTag[], compact = true): string {
  const chips: string[] = [];

  if (amenities.includes('wheelchair')) {
    chips.push(
      `<span title="Wheelchair Accessible" style="display: inline-flex; align-items: center; justify-content: center; width: ${compact ? 17 : 18}px; height: ${compact ? 17 : 18}px; border-radius: 9999px; background: #EFF6FF; color: #2563EB; border: 1px solid #BFDBFE;">${WHEELCHAIR_SVG}</span>`
    );
  }
  if (amenities.includes('nursing')) {
    chips.push(
      `<span title="Nursing Room" style="display: inline-flex; align-items: center; justify-content: center; width: ${compact ? 17 : 18}px; height: ${compact ? 17 : 18}px; border-radius: 9999px; background: #FDF2F8; color: #DB2777; border: 1px solid #FBCFE8;">${NURSING_SVG}</span>`
    );
  }
  if (amenities.includes('baby-care')) {
    chips.push(
      `<span title="Baby Changing Room" style="display: inline-flex; align-items: center; justify-content: center; width: ${compact ? 17 : 18}px; height: ${compact ? 17 : 18}px; border-radius: 9999px; background: #ECFEFF; color: #0D8B99; border: 1px solid #A5F3FC;">${BABY_CHANGING_SVG}</span>`
    );
  }

  if (chips.length === 0) return '';
  return `<span style="display: inline-flex; align-items: center; gap: 2px;">${chips.join('')}</span>`;
}

function createToiletMarkerHtml(facility: FacilityWithDistance, isSelected: boolean): string {
  const safeName = escapeHtml(facility.name);
  const crowd = CROWD_STYLES[facility.crowd];
  const amenityHtml = renderAmenityChipsHtml(facility.amenities, !isSelected);

  if (isSelected) {
    return `
      <div style="transform: translate(-50%, -100%); display: inline-flex; flex-direction: column; align-items: center;">
        <div style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 11px; border-radius: 9999px; background: #0D8B99; color: #ffffff; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; font-weight: 700; white-space: nowrap; box-shadow: 0 10px 24px -4px ${crowd.halo}, 0 6px 16px rgba(15,23,42,0.28); border: 2.5px solid #ffffff;">
          <span style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 7px; border-radius: 9999px; background: ${crowd.color}; color: #ffffff; font-size: 10px; font-weight: 800; letter-spacing: 0.02em;">
            <span style="width: 6px; height: 6px; border-radius: 9999px; background: #ffffff;"></span>
            ${crowd.shortLabel}
          </span>
          ${amenityHtml}
          <span style="max-width: 145px; overflow: hidden; text-overflow: ellipsis;">${safeName}</span>
          <span style="opacity: 0.92; font-variant-numeric: tabular-nums;">★ ${facility.rating.toFixed(1)}</span>
        </div>
        <div style="width: 0; height: 0; border-left: 7px solid transparent; border-right: 7px solid transparent; border-top: 8px solid #0D8B99; margin-top: -1px;"></div>
      </div>
    `;
  }

  return `
    <div style="transform: translate(-50%, -100%); display: inline-flex; flex-direction: column; align-items: center;">
      <div style="position: relative; width: 42px; height: 42px; border-radius: 9999px; background: ${crowd.halo}; display: flex; align-items: center; justify-content: center;">
        <div style="width: 32px; height: 32px; border-radius: 9999px; background: ${crowd.color}; border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.28); display: flex; align-items: center; justify-content: center;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7 12h10a4 4 0 0 1 0 8H7a4 4 0 0 1 0-8Z"/>
            <path d="M9 12V4h6v8"/>
            <path d="M12 20v2"/>
          </svg>
        </div>
      </div>
      <div style="margin-top: -5px; display: inline-flex; align-items: center; gap: 3px; padding: 2px 5px; border-radius: 9999px; background: #ffffff; border: 1.5px solid ${crowd.color}; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.2); white-space: nowrap;">
        <span style="padding: 0 4px; border-radius: 9999px; background: ${crowd.bgLight}; color: ${crowd.textColor}; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 9.5px; font-weight: 800; line-height: 1.4;">${crowd.shortLabel}</span>
        ${amenityHtml}
      </div>
    </div>
  `;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  facilities,
  selectedFacilityId,
  onSelectFacility,
  navigatingFacility,
  anchor,
  radiusMeters,
  isNearbyOnly,
  isDark,
  isAddPinMode,
  onMapCenterChange,
  focusTrigger,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const geofenceLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const [isMobileLegendOpen, setIsMobileLegendOpen] = useState(false);

  // Initialize Leaflet map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [anchor.lat, anchor.lng],
      zoom: 16,
      zoomControl: false,
      attributionControl: true,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    const geofenceLayer = L.layerGroup().addTo(map);
    const routeLayer = L.layerGroup().addTo(map);

    mapRef.current = map;
    markersLayerRef.current = markersLayer;
    geofenceLayerRef.current = geofenceLayer;
    routeLayerRef.current = routeLayer;

    const handleMoveEnd = () => {
      const c = map.getCenter();
      onMapCenterChange({ lat: c.lat, lng: c.lng });
    };

    map.on('moveend', handleMoveEnd);

    return () => {
      map.off('moveend', handleMoveEnd);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Switch tile theme cleanly between light and dark CartoDB basemaps
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    const layer = L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20,
    });

    layer.addTo(map);
    tileLayerRef.current = layer;
  }, [isDark]);

  // Pan map when anchor or focusTrigger changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo([anchor.lat, anchor.lng], isNearbyOnly ? 16 : 13, {
      duration: 0.65,
    });
  }, [anchor.lat, anchor.lng, focusTrigger, isNearbyOnly]);

  // Render Anchor Marker & Geofence Ring
  useEffect(() => {
    const layer = geofenceLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    if (isNearbyOnly) {
      L.circle([anchor.lat, anchor.lng], {
        radius: radiusMeters,
        color: isDark ? '#3B82F6' : '#2563EB',
        weight: 1.5,
        opacity: isDark ? 0.55 : 0.45,
        fillColor: isDark ? '#3B82F6' : '#2563EB',
        fillOpacity: isDark ? 0.1 : 0.08,
        dashArray: '6 6',
      }).addTo(layer);
    }

    const anchorIcon = L.divIcon({
      className: 'sg-marker-icon',
      iconSize: [0, 0],
      html: `
        <div style="transform: translate(-50%, -50%); position: relative; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">
          <span style="position: absolute; width: 28px; height: 28px; border-radius: 9999px; background: rgba(37, 99, 235, 0.22);"></span>
          <span style="position: relative; width: 14px; height: 14px; border-radius: 9999px; background: #2563EB; border: 2.5px solid #ffffff; box-shadow: 0 2px 6px rgba(37, 99, 235, 0.45);"></span>
        </div>
      `,
    });

    L.marker([anchor.lat, anchor.lng], { icon: anchorIcon, interactive: false }).addTo(layer);
  }, [anchor.lat, anchor.lng, radiusMeters, isNearbyOnly, isDark]);

  // Render Facility Markers
  useEffect(() => {
    const layer = markersLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    facilities.forEach((facility) => {
      const isSelected = facility.id === selectedFacilityId;
      const html = createToiletMarkerHtml(facility, isSelected);

      const icon = L.divIcon({
        className: 'sg-marker-icon',
        iconSize: [0, 0],
        html,
      });

      const marker = L.marker([facility.lat, facility.lng], {
        icon,
        zIndexOffset: isSelected ? 1000 : facility.crowd === 'low' ? 30 : 10,
      });

      marker.on('click', () => {
        onSelectFacility(facility);
      });

      marker.addTo(layer);
    });
  }, [facilities, selectedFacilityId, onSelectFacility]);

  // Render Active Walking Route Polyline
  useEffect(() => {
    const layer = routeLayerRef.current;
    const map = mapRef.current;
    if (!layer || !map) return;
    layer.clearLayers();

    if (!navigatingFacility) return;

    const midLat = (anchor.lat + navigatingFacility.lat) / 2 + 0.00028;
    const midLng = (anchor.lng + navigatingFacility.lng) / 2 - 0.00022;
    const points: L.LatLngExpression[] = [
      [anchor.lat, anchor.lng],
      [midLat, midLng],
      [navigatingFacility.lat, navigatingFacility.lng],
    ];

    L.polyline(points, {
      color: isDark ? '#38BDF8' : '#2563EB',
      weight: 5,
      opacity: 0.9,
      dashArray: '8 8',
      lineCap: 'round',
    }).addTo(layer);

    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, {
      paddingTopLeft: [window.innerWidth >= 1024 ? 420 : 48, 110],
      paddingBottomRight: [48, window.innerWidth >= 1024 ? 60 : 240],
      maxZoom: 17,
    });
  }, [navigatingFacility, anchor.lat, anchor.lng, isDark]);

  // Fly softly to selected facility if clicked from list
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedFacilityId || navigatingFacility) return;
    const found = facilities.find((f) => f.id === selectedFacilityId);
    if (!found) return;

    map.panTo([found.lat, found.lng], { animate: true, duration: 0.45 });
  }, [selectedFacilityId, facilities, navigatingFacility]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapContainerRef}
        role="application"
        aria-label="Interactive map of public toilets in Singapore with crowd and accessibility indicators"
        className="w-full h-full z-0"
      />

      {/* Desktop Floating Map Legend: Crowd + Accessibility/Care Icons */}
      <div
        aria-label="Map legend"
        className="hidden lg:flex fixed bottom-6 left-[432px] z-20 flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 rounded-2xl bg-white/92 dark:bg-slate-900/92 backdrop-blur-md border border-white/80 dark:border-slate-700/70 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.08)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.45)] text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[calc(100vw-540px)]"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-slate-500 dark:text-slate-400">Crowd:</span>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" aria-hidden="true" />
            <span>Low</span>
          </span>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" aria-hidden="true" />
            <span>Moderate</span>
          </span>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" aria-hidden="true" />
            <span>Busy</span>
          </span>
        </div>

        <span className="h-4 w-px bg-slate-200 dark:bg-slate-700" aria-hidden="true" />

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-[#2563EB] dark:text-blue-400 inline-flex items-center justify-center">
              <WheelchairIcon className="w-3.5 h-3.5" />
            </span>
            <span>Wheelchair</span>
          </span>

          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-5 h-5 rounded-full bg-pink-50 dark:bg-pink-950/70 border border-pink-200 dark:border-pink-800 text-[#DB2777] dark:text-pink-400 inline-flex items-center justify-center">
              <NursingBottleIcon className="w-3.5 h-3.5" />
            </span>
            <span>Nursing Room</span>
          </span>

          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-5 h-5 rounded-full bg-cyan-50 dark:bg-cyan-950/70 border border-cyan-200 dark:border-cyan-800 text-[#0D8B99] dark:text-cyan-400 inline-flex items-center justify-center">
              <BabyChangingIcon className="w-3.5 h-3.5" />
            </span>
            <span>Baby Changing</span>
          </span>
        </div>
      </div>

      {/* Mobile Compact Legend Pill (Expandable) */}
      {!navigatingFacility && (
        <div className="lg:hidden fixed top-[118px] left-3 z-20 max-w-[calc(100vw-24px)]">
          <button
            type="button"
            onClick={() => setIsMobileLegendOpen((o) => !o)}
            aria-expanded={isMobileLegendOpen}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/92 dark:bg-slate-900/92 backdrop-blur-md border border-white/80 dark:border-slate-700/70 shadow-md text-[11px] font-semibold text-slate-700 dark:text-slate-200"
          >
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#059669]" />
              <span className="w-2 h-2 rounded-full bg-[#D97706]" />
              <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
            </span>
            <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">|</span>
            <WheelchairIcon className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
            <NursingBottleIcon className="w-3.5 h-3.5 text-[#DB2777] dark:text-pink-400" />
            <BabyChangingIcon className="w-3.5 h-3.5 text-[#0D8B99] dark:text-cyan-400" />
            <span>Legend</span>
            {isMobileLegendOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {isMobileLegendOpen && (
            <div className="mt-1.5 p-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 shadow-xl text-xs font-semibold text-slate-700 dark:text-slate-200 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-slate-500 dark:text-slate-400">Crowd:</span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" /> Low
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" /> Mod
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" /> Busy
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 pt-1 border-t border-slate-200/70 dark:border-slate-800">
                <span className="inline-flex items-center gap-1">
                  <WheelchairIcon className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
                  Wheelchair
                </span>
                <span className="inline-flex items-center gap-1">
                  <NursingBottleIcon className="w-3.5 h-3.5 text-[#DB2777] dark:text-pink-400" />
                  Nursing Room
                </span>
                <span className="inline-flex items-center gap-1">
                  <BabyChangingIcon className="w-3.5 h-3.5 text-[#0D8B99] dark:text-cyan-400" />
                  Baby Changing
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Crosshair Pin Placement Indicator when adding a new Toilet */}
      {isAddPinMode && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center"
        >
          <div className="relative flex flex-col items-center -translate-y-5">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-[#0D8B99] border-[3px] border-white shadow-xl flex items-center justify-center text-white">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 12h10a4 4 0 0 1 0 8H7a4 4 0 0 1 0-8Z" />
                  <path d="M9 12V4h6v8" />
                  <path d="M12 20v2" />
                </svg>
              </div>
              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[9px] border-l-transparent border-r-transparent border-t-[#0D8B99] -mt-0.5" />
            </div>
            <span className="mt-1.5 w-3 h-1.5 rounded-full bg-slate-900/35 dark:bg-white/40 blur-[1px]" />
          </div>
        </div>
      )}
    </div>
  );
};
