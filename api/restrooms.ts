interface ApiRequest {
  method?: string;
  query: Record<string, string | string[] | undefined>;
}

interface ApiResponse {
  setHeader(name: string, value: string): unknown;
  status(code: number): ApiResponse;
  json(body: unknown): unknown;
}

function pickParam(val: string | string[] | undefined): string | undefined {
  if (Array.isArray(val)) return val[0];
  return val;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method && req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  const rawLat = pickParam(req.query.lat);
  const rawLng = pickParam(req.query.lng);
  const rawAda = pickParam(req.query.ada);
  const rawUnisex = pickParam(req.query.unisex);
  const rawPerPage = pickParam(req.query.per_page);

  if (rawLat === undefined || rawLng === undefined || rawLat === '' || rawLng === '') {
    return res.status(400).json({
      error: 'Missing required query parameters: lat and lng.',
    });
  }

  const lat = Number(rawLat);
  const lng = Number(rawLng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({
      error: 'Invalid coordinates. Provide finite lat (-90..90) and lng (-180..180).',
    });
  }

  let perPage = 20;
  if (rawPerPage !== undefined && rawPerPage !== '') {
    const parsedPerPage = Number(rawPerPage);
    if (!Number.isInteger(parsedPerPage) || parsedPerPage < 1 || parsedPerPage > 100) {
      return res.status(400).json({
        error: 'Invalid per_page parameter. Must be an integer between 1 and 100.',
      });
    }
    perPage = parsedPerPage;
  }

  if (rawAda !== undefined && rawAda !== '' && rawAda !== 'true' && rawAda !== 'false') {
    return res.status(400).json({
      error: 'Invalid ada parameter. Must be "true" or "false".',
    });
  }

  if (rawUnisex !== undefined && rawUnisex !== '' && rawUnisex !== 'true' && rawUnisex !== 'false') {
    return res.status(400).json({
      error: 'Invalid unisex parameter. Must be "true" or "false".',
    });
  }

  const upstreamUrl = new URL('https://www.refugerestrooms.org/api/v1/restrooms/by_location');
  upstreamUrl.searchParams.set('lat', String(lat));
  upstreamUrl.searchParams.set('lng', String(lng));
  upstreamUrl.searchParams.set('per_page', String(perPage));

  if (rawAda === 'true' || rawAda === 'false') {
    upstreamUrl.searchParams.set('ada', rawAda);
  }
  if (rawUnisex === 'true' || rawUnisex === 'false') {
    upstreamUrl.searchParams.set('unisex', rawUnisex);
  }

  try {
    const upstreamRes = await fetch(upstreamUrl.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'sgtoilets-wayfinding/1.0',
      },
    });

    if (!upstreamRes.ok) {
      return res.status(500).json({
        error: `REFUGE Restrooms API returned status ${upstreamRes.status}.`,
      });
    }

    const data = await upstreamRes.json();
    if (!Array.isArray(data)) {
      return res.status(500).json({
        error: 'Unexpected response format from REFUGE Restrooms API.',
      });
    }

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown upstream error';
    return res.status(500).json({
      error: `Failed to reach REFUGE Restrooms API: ${message}`,
    });
  }
}
