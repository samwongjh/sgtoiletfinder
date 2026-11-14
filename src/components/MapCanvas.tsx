import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { FacilityType, FacilityWithDistance } from '../types/facility';
import { FountainPinIcon } from './BrandAssets';

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
  addPinType: FacilityType;
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

function createToiletMarkerHtml(facility: FacilityWithDistance, isSelected: boolean): string {
  const safeName = escapeHtml(facility.name);
  const crowdDotColor =
    facility.crowd === 'low' ? '#059669' : facility.crowd === 'moderate' ? '#D97706' : '#DC2626';

  if (isSelected) {
    return `
      <div style="transform: translate(-50%, -100%); display: inline-flex; flex-direction: column; align-items: center;">
        <div style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 9999px; background: #0D8B99; color: #ffffff; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; font-weight: 700; white-space: nowrap; box-shadow: 0 8px 20px -4px rgba(13, 139, 153, 0.45); border: 2px solid #ffffff;">
          <span style="width: 8px; height: 8px; border-radius: 9999px; background: ${crowdDotColor}; border: 1.5px solid #fff; flex-shrink: 0;"></span>
          <span style="max-width: 170px; overflow: hidden; text-overflow: ellipsis;">${safeName}</span>
          <span style="opacity: 0.9; font-variant-numeric: tabular-nums;">★ ${facility.rating.toFixed(1)}</span>
        </div>
        <div style="width: 0; height: 0; border-left: 7px solid transparent; border-right: 7px solid transparent; border-top: 8px solid #0D8B99; margin-top: -1px;"></div>
      </div>
    `;
  }

  return `
    <div style="transform: translate(-50%, -100%); display: inline-flex; flex-direction: column; align-items: center;">
      <div style="position: relative; width: 34px; height: 34px; border-radius: 9999px; background: #0D8B99; border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.25); display: flex; align-items: center; justify-content: center;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M7 12h10a4 4 0 0 1 0 8H7a4 4 0 0 1 0-8Z"/>
          <path d="M9 12V4h6v8"/>
          <path d="M12 20v2"/>
        </svg>
        <span style="position: absolute; top: -2px; right: -2px; width: 10px; height: 10px; border-radius: 9999px; background: ${crowdDotColor}; border: 2px solid #ffffff;"></span>
      </div>
      <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid #0D8B99; margin-top: -2px;"></div>
    </div>
  `;
}

function createFountainMarkerHtml(facility: FacilityWithDistance, isSelected: boolean): string {
  const safeName = escapeHtml(facility.name);
  if (isSelected) {
    return `
      <div style="transform: translate(-50%, -100%); display: inline-flex; flex-direction: column; align-items: center;">
        <div style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 9999px; background: #059669; color: #ffffff; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; font-weight: 700; white-space: nowrap; box-shadow: 0 8px 20px -4px rgba(5, 150, 105, 0.45); border: 2px solid #ffffff;">
          <img src="https://sgtoilets.web.app/fountain-pin.svg" referrerpolicy="no-referrer" alt="" style="width: 14px; height: 22px; object-fit: contain;" />
          <span style="max-width: 170px; overflow: hidden; text-overflow: ellipsis;">${safeName}</span>
          <span style="opacity: 0.9; font-variant-numeric: tabular-nums;">★ ${facility.rating.toFixed(1)}</span>
        </div>
        <div style="width: 0; height: 0; border-left: 7px solid transparent; border-right: 7px solid transparent; border-top: 8px solid #059669; margin-top: -1px;"></div>
      </div>
    `;
  }

  return `
    <div style="transform: translate(-50%, -100%); display: inline-flex; align-items: center; justify-content: center; filter: drop-shadow(0 4px 6px rgba(15, 23, 42, 0.28));">
      <img src="https://sgtoilets.web.app/fountain-pin.svg" referrerpolicy="no-referrer" alt="Water Fountain" style="width: 26px; height: 40px; object-fit: contain;" />
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
  addPinType,
  onMapCenterChange,
  focusTrigger,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const geofenceLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

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
      const html =
        facility.type === 'fountain'
          ? createFountainMarkerHtml(facility, isSelected)
          : createToiletMarkerHtml(facility, isSelected);

      const icon = L.divIcon({
        className: 'sg-marker-icon',
        iconSize: [0, 0],
        html,
      });

      const marker = L.marker([facility.lat, facility.lng], {
        icon,
        zIndexOffset: isSelected ? 1000 : 10,
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
        aria-label="Interactive map of public toilets and drinking fountains in Singapore"
        className="w-full h-full z-0"
      />

      {/* Crosshair Pin Placement Indicator when adding a new Toilet or Fountain */}
      {isAddPinMode && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center"
        >
          <div className="relative flex flex-col items-center -translate-y-5">
            {addPinType === 'fountain' ? (
              <FountainPinIcon className="w-9 h-14 drop-shadow-lg" />
            ) : (
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
            )}
            <span className="mt-1.5 w-3 h-1.5 rounded-full bg-slate-900/35 dark:bg-white/40 blur-[1px]" />
          </div>
        </div>
      )}
    </div>
  );
};
