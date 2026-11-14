interface ApiRequest {
  method?: string;
}

interface ApiResponse {
  setHeader(name: string, value: string): unknown;
  status(code: number): ApiResponse;
  json(body: unknown): unknown;
}

interface ServiceHealth {
  ok: boolean;
  status: number | null;
  latencyMs: number;
  error?: string;
}

interface OneMapHealth extends ServiceHealth {
  tilesOk: boolean;
  tokenConfigured: boolean;
  restApiOk: boolean | null;
  restApiStatus: number | null;
}

async function checkRefugeRestrooms(): Promise<ServiceHealth> {
  const startedAt = Date.now();
  try {
    const res = await fetch(
      'https://www.refugerestrooms.org/api/v1/restrooms/by_location?lat=1.3521&lng=103.8198&per_page=1',
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent': 'sgtoilets-healthcheck/1.0',
        },
        signal: AbortSignal.timeout(6000),
      }
    );

    const latencyMs = Date.now() - startedAt;
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        latencyMs,
        error: `REFUGE API returned HTTP ${res.status}`,
      };
    }

    const data = await res.json();
    const isArray = Array.isArray(data);
    return {
      ok: isArray,
      status: res.status,
      latencyMs,
      ...(isArray ? {} : { error: 'Unexpected response payload from REFUGE API' }),
    };
  } catch (err) {
    return {
      ok: false,
      status: null,
      latencyMs: Date.now() - startedAt,
      error: err instanceof Error ? err.message : 'Failed to reach REFUGE API',
    };
  }
}

async function checkOneMap(): Promise<OneMapHealth> {
  const startedAt = Date.now();
  const rawToken = process.env.ONEMAP_API_KEY || process.env.VITE_ONEMAP_API_KEY || '';
  const token = rawToken && rawToken !== 'MY_ONEMAP_API_KEY' ? rawToken : null;

  let tilesOk = false;
  let tileStatus: number | null = null;
  let restApiOk: boolean | null = null;
  let restApiStatus: number | null = null;
  let errorMessage: string | undefined;

  try {
    const tileRes = await fetch(
      'https://www.onemap.gov.sg/maps/tiles/Default/12/3230/2032.png',
      {
        method: 'HEAD',
        signal: AbortSignal.timeout(6000),
      }
    );
    tileStatus = tileRes.status;
    tilesOk = tileRes.ok;
    if (!tilesOk) {
      errorMessage = `OneMap tiles returned HTTP ${tileRes.status}`;
    }
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : 'Failed to reach OneMap tiles';
  }

  if (token) {
    try {
      const restRes = await fetch(
        'https://www.onemap.gov.sg/api/common/elastic/search?searchVal=Singapore&returnGeom=N&getAddrDetails=N&pageNum=1',
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: token,
          },
          signal: AbortSignal.timeout(6000),
        }
      );
      restApiStatus = restRes.status;
      restApiOk = restRes.ok;
      if (!restApiOk) {
        errorMessage = errorMessage
          ? `${errorMessage}; OneMap REST API returned HTTP ${restRes.status}`
          : `OneMap REST API returned HTTP ${restRes.status}`;
      }
    } catch (err) {
      restApiOk = false;
      const msg = err instanceof Error ? err.message : 'Failed to reach OneMap REST API';
      errorMessage = errorMessage ? `${errorMessage}; ${msg}` : msg;
    }
  }

  const ok = tilesOk && (token ? restApiOk === true : true);

  return {
    ok,
    status: tileStatus,
    latencyMs: Date.now() - startedAt,
    tilesOk,
    tokenConfigured: Boolean(token),
    restApiOk,
    restApiStatus,
    ...(errorMessage ? { error: errorMessage } : {}),
  };
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method && req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  const [restrooms, onemap] = await Promise.all([checkRefugeRestrooms(), checkOneMap()]);
  const allHealthy = restrooms.ok && onemap.ok;

  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  return res.status(allHealthy ? 200 : 503).json({
    ok: allHealthy,
    timestamp: new Date().toISOString(),
    services: {
      restrooms,
      onemap,
    },
  });
}
