/**
 * Vercel Serverless Function — /api/analysis
 * מחזיר: נתוני עסק + שדות חסרים + 3 מתחרים מובילים באזור
 * קריאה: GET /api/analysis?placeId=ChIJ...
 */
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { placeId } = req.query;
  if (!placeId || !placeId.trim()) {
    return res.status(400).json({ status: 'INVALID_REQUEST' });
  }

  const key = process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY || process.env.GOOGLE_PLACES_KEY;
  if (!key) return res.status(503).json({ status: 'NOT_CONFIGURED' });

  try {
    // ── 1. Place Details + geometry ──
    const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    detailsUrl.searchParams.set('place_id', placeId.trim());
    detailsUrl.searchParams.set('fields',
      'name,rating,user_ratings_total,formatted_phone_number,website,opening_hours,geometry,types');
    detailsUrl.searchParams.set('language', 'he');
    detailsUrl.searchParams.set('key', key);

    const detResp = await fetch(detailsUrl.toString());
    const detData = await detResp.json();

    if (detData.status !== 'OK') {
      return res.status(200).json({ status: detData.status });
    }

    const r = detData.result || {};

    // ── 2. Missing fields ──
    const missing = [];
    if (!r.website)                    missing.push('אתר אינטרנט');
    if (!r.formatted_phone_number)     missing.push('מספר טלפון');
    if (!r.opening_hours)              missing.push('שעות פתיחה');

    // ── 3. Nearby competitors ──
    let competitors = [];
    const loc = r.geometry && r.geometry.location;
    if (loc) {
      const USEFUL = [
        'restaurant','lawyer','doctor','dentist','gym','beauty_salon','hair_care','spa',
        'real_estate_agency','accounting','car_repair','plumber','electrician','pharmacy',
        'bakery','cafe','bar','hotel','veterinary_care','clothing_store','shoe_store','store'
      ];
      const bizType = (r.types || []).find(t => USEFUL.includes(t)) || (r.types || ['establishment'])[0];

      const nearbyUrl = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
      nearbyUrl.searchParams.set('location', `${loc.lat},${loc.lng}`);
      nearbyUrl.searchParams.set('radius', '2000');
      nearbyUrl.searchParams.set('type', bizType);
      nearbyUrl.searchParams.set('language', 'he');
      nearbyUrl.searchParams.set('key', key);

      const nbResp = await fetch(nearbyUrl.toString());
      const nbData = await nbResp.json();

      competitors = (nbData.results || [])
        .filter(p => p.place_id !== placeId.trim() && typeof p.rating === 'number')
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 3)
        .map(p => ({
          name:        p.name,
          rating:      p.rating       || 0,
          reviewCount: p.user_ratings_total || 0
        }));
    }

    return res.status(200).json({
      status:      'OK',
      name:        r.name || null,
      rating:      typeof r.rating === 'number'             ? r.rating             : null,
      reviewCount: typeof r.user_ratings_total === 'number' ? r.user_ratings_total : null,
      phone:       r.formatted_phone_number || null,
      website:     r.website || null,
      hasHours:    !!r.opening_hours,
      missing,
      competitors
    });

  } catch (err) {
    console.error('[analysis error]', err.message);
    return res.status(502).json({ status: 'API_ERROR' });
  }
};
