/**
 * Vercel Serverless Function — /api/place-details
 * מחזיר נתוני עסק אמיתיים מ-Google Places Details API
 * שדות: rating, user_ratings_total, name
 *
 * קריאה: GET /api/place-details?placeId=ChIJ...
 */
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { placeId } = req.query;

  if (!placeId || !placeId.trim()) {
    return res.status(400).json({ status: 'INVALID_REQUEST' });
  }

  const key = process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY || process.env.GOOGLE_PLACES_KEY;

  if (!key) {
    return res.status(503).json({ status: 'NOT_CONFIGURED' });
  }

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    url.searchParams.set('place_id', placeId.trim());
    // reviews מחזיר עד 5 הביקורות האחרונות עם relative_time_description
    url.searchParams.set('fields', 'rating,user_ratings_total,name,reviews,opening_hours,formatted_phone_number,website');
    url.searchParams.set('language', 'he');
    url.searchParams.set('key', key);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error('Google Places Details returned ' + response.status);
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      return res.status(200).json({ status: data.status, rating: null, reviewCount: null });
    }

    const result = data.result || {};

    // זמן הביקורת האחרונה — מיין לפי timestamp יורד כדי לקבל את הכי עדכנית
    const reviews = Array.isArray(result.reviews)
      ? result.reviews.slice().sort((a, b) => (b.time || 0) - (a.time || 0))
      : [];
    const lastReview = reviews[0] || null;
    const lastReviewTime = lastReview
      ? (lastReview.relative_time_description || null)
      : null;

    return res.status(200).json({
      status:          'OK',
      rating:          typeof result.rating === 'number'             ? result.rating             : null,
      reviewCount:     typeof result.user_ratings_total === 'number' ? result.user_ratings_total : null,
      name:            result.name || null,
      lastReviewTime:      lastReviewTime,
      lastReviewTimestamp: lastReview ? (lastReview.time || null) : null,
      phone:           result.formatted_phone_number || null,
      website:         result.website || null,
      openNow:         result.opening_hours ? (result.opening_hours.open_now ?? null) : null
    });

  } catch (err) {
    console.error('[place-details error]', err.message);
    return res.status(502).json({ status: 'API_ERROR', rating: null, reviewCount: null });
  }
};
