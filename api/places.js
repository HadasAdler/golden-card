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

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
    url.searchParams.set('input', q.trim());
    url.searchParams.set('types', 'establishment');
    url.searchParams.set('components', 'country:il');
    url.searchParams.set('language', 'he');
    url.searchParams.set('key', key);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error('Google Places returned ' + response.status);
    }

    const data = await response.json();

    // מחזיר רק את השדות הנחוצים — לא חושף את ה-key
    return res.status(200).json({
      status: data.status,
      predictions: (data.predictions || []).slice(0, 5).map(function(p) {
        return {
          place_id: p.place_id,
          description: p.description,
          structured_formatting: {
            main_text: p.structured_formatting ? p.structured_formatting.main_text : p.description,
            secondary_text: p.structured_formatting ? p.structured_formatting.secondary_text : ''
          }
        };
      })
    });
  } catch (err) {
    console.error('[places API error]', err.message);
    return res.status(502).json({ status: 'API_ERROR', predictions: [] });
  }
};
