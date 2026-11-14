export const ONEMAP_CONFIG = {
  center: {
    lat: 1.3521,
    lng: 103.8198,
  },
  defaultZoom: 12,
  minZoom: 11,
  maxZoom: 19,
  bounds: {
    southwest: [1.144, 103.535] as [number, number],
    northeast: [1.494, 104.502] as [number, number],
  },
  tiles: {
    light: 'https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png',
    dark: 'https://www.onemap.gov.sg/maps/tiles/Night/{z}/{x}/{y}.png',
  },
  attribution:
    '<img src="https://www.onemap.gov.sg/web-assets/images/logo/om_logo.png" alt="OneMap" style="height:20px;width:20px;display:inline-block;vertical-align:middle;"/>&nbsp;<a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener noreferrer">OneMap</a>&nbsp;&copy;&nbsp;contributors&nbsp;&#124;&nbsp;<a href="https://www.sla.gov.sg/" target="_blank" rel="noopener noreferrer">Singapore Land Authority</a>',
  restApiBaseUrl: 'https://www.onemap.gov.sg/api',
} as const;

export function getOneMapApiToken(): string | null {
  const token = import.meta.env.VITE_ONEMAP_API_KEY;
  if (!token || token === 'MY_ONEMAP_API_KEY') {
    return null;
  }
  return token;
}

export function getOneMapAuthHeaders(): HeadersInit {
  const token = getOneMapApiToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (token) {
    headers.Authorization = token;
  }
  return headers;
}

export interface OneMapSearchResult {
  SEARCHVAL: string;
  BLK_NO: string;
  ROAD_NAME: string;
  BUILDING: string;
  ADDRESS: string;
  POSTAL: string;
  LATITUDE: string;
  LONGITUDE: string;
}

export async function searchOneMapAddress(
  searchVal: string,
  signal?: AbortSignal
): Promise<OneMapSearchResult[]> {
  const url = new URL(`${ONEMAP_CONFIG.restApiBaseUrl}/common/elastic/search`);
  url.searchParams.set('searchVal', searchVal);
  url.searchParams.set('returnGeom', 'Y');
  url.searchParams.set('getAddrDetails', 'Y');
  url.searchParams.set('pageNum', '1');

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: getOneMapAuthHeaders(),
    signal,
  });

  if (!response.ok) {
    throw new Error(`OneMap search failed (${response.status})`);
  }

  const data = (await response.json()) as { results?: OneMapSearchResult[] };
  return Array.isArray(data.results) ? data.results : [];
}
