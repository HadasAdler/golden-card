/**
 * Vercel Serverless Function — /api/analysis
 * מחזיר: נתוני עסק + שדות חסרים + 3 מתחרים לפי קטגוריה + עיר
 * קריאה: GET /api/analysis?placeId=ChIJ...
 */

// מיפוי סוג עסק לשם עברי לחיפוש Text Search
const TYPE_HE = {
  restaurant:         'מסעדה',
  lawyer:             'עורך דין',
  doctor:             'רופא',
  dentist:            'רופא שיניים',
  gym:                'חדר כושר',
  beauty_salon:       'מכון יופי',
  hair_care:          'מספרה',
  spa:                'ספא',
  real_estate_agency: 'תיווך נדלן',
  accounting:         'רואה חשבון',
  car_repair:         'מוסך',
  plumber:            'אינסטלטור',
  electrician:        'חשמלאי',
  pharmacy:           'בית מרקחת',
  bakery:             'מאפייה',
  cafe:               'קפה',
  bar:                'בר',
  hotel:              'מלון',
  lodging:            'מלון',
  veterinary_care:    'וטרינר',
  clothing_store:     'חנות בגדים',
  shoe_store:         'חנות נעליים',
  jewelry_store:      'תכשיטים',
  supermarket:        'סופרמרקט',
  school:             'בית ספר',
  insurance_agency:   'ביטוח',
  store:              'חנות',
};

const USEFUL_TYPES = Object.keys(TYPE_HE);

// חילוץ שם עיר מ-vicinity (בד"כ: "רחוב, עיר" או "עיר")
function extractCity(vicinity) {
  if (!vicinity) return '';
  const parts = vicinity.split(',');
  return parts[parts.length - 1].trim();
}

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
    // ── 1. Place Details + geometry + vicinity ──
    const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    detailsUrl.searchParams.set('place_id', placeId.trim());
    detailsUrl.searchParams.set('fields',
      'name,rating,user_ratings_total,formatted_phone_number,website,opening_hours,geometry,types,vicinity');
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
    if (!r.website)                missing.push('אתר אינטרנט');
    if (!r.formatted_phone_number) missing.push('מספר טלפון');
    if (!r.opening_hours)          missing.push('שעות פתיחה');

    // ── 3. Competitors — Text Search by category + city ──
    let competitors = [];
    const loc = r.geometry && r.geometry.location;

    if (loc) {
      // קבע קטגוריה עברית
      const bizType = (r.types || []).find(t => USEFUL_TYPES.includes(t));
      const categoryHe = bizType ? TYPE_HE[bizType] : (r.name || '');

      // חלץ עיר מ-vicinity
      const city = extractCity(r.vicinity);

      // בנה שאילתת חיפוש: "מסעדה בתל אביב" / "תכשיטים בבאר שבע"
      const searchQuery = city
        ? `${categoryHe} ב${city}`
        : categoryHe;

      const textUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
      textUrl.searchParams.set('query', searchQuery);
      textUrl.searchParams.set('language', 'he');
      // הגבל לאזור הקרוב על ידי location bias
      textUrl.searchParams.set('location', `${loc.lat},${loc.lng}`);
      textUrl.searchParams.set('radius', '5000');
      textUrl.searchParams.set('key', key);

      const txResp = await fetch(textUrl.toString());
      const txData = await txResp.json();

      competitors = (txData.results || [])
        .filter(p => p.place_id !== placeId.trim() && typeof p.rating === 'number')
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 3)
        .map(p => ({
          name:        p.name,
          rating:      p.rating             || 0,
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
