/**
 * Vercel Serverless Function — /api/places
 * מחפש עסקים דרך Google Places Autocomplete API
 * המפתח נשמר ב-Environment Variables בלבד (לא בקוד)
 *
 * הגדרה ב-Vercel Dashboard:
 *   Settings → Environment Variables → NEXT_PUBLIC_GOOGLE_PLACES_KEY = AIzaSy...
 */
module.exports = async function handler(req, res) {
  // CORS headers לפיתוח מקומי
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q } = req.query;

  if (!q || !q.trim()) {
    return res.status(400).json({ status: 'INVALID_REQUEST', predictions: [] });
  }

  // תמיכה בשני שמות משתנה אפשריים
  const key = process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY || process.env.GOOGLE_PLACES_KEY;

  if (!key) {
    return res.status(503).json({ status: 'NOT_CONFIGURED', predictions: [] });
  }

  /* ── helper: build a Places Autocomplete URL ── */
  function buildPlacesUrl(input, withTypeFilter) {
    const u = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
    u.searchParams.set('input', input);
    u.searchParams.set('components', 'country:il');
    u.searchParams.set('language', 'he');
    u.searchParams.set('key', key);
    if (withTypeFilter) u.searchParams.set('types', 'establishment');
    return u.toString();
  }

  function mapPrediction(p) {
    return {
      place_id: p.place_id,
      description: p.description,
      structured_formatting: {
        main_text: p.structured_formatting ? p.structured_formatting.main_text : p.description,
        secondary_text: p.structured_formatting ? p.structured_formatting.secondary_text : ''
      }
    };
  }

  try {
    const input = q.trim();

    /* 1st attempt — with establishment type filter (more precise) */
    const r1 = await fetch(buildPlacesUrl(input, true));
    if (!r1.ok) throw new Error('Google Places returned ' + r1.status);
    let data = await r1.json();

    /* 2nd attempt — without type filter if 0 results (broader search) */
    if (!data.predictions || data.predictions.length === 0) {
      const r2 = await fetch(buildPlacesUrl(input, false));
      if (r2.ok) {
        const data2 = await r2.json();
        if (data2.predictions && data2.predictions.length > 0) {
          data = data2;
        }
      }
    }

    return res.status(200).json({
      status: data.status,
      predictions: (data.predictions || []).slice(0, 8).map(mapPrediction)
    });
  } catch (err) {
    console.error('[places API error]', err.message);
    return res.status(502).json({ status: 'API_ERROR', predictions: [] });
  }
};
