/**
 * /api/gbp-post — שליפת תאריך הפוסט האחרון מפרופיל גוגל ציבורי
 *
 * Google Business Profile posts are NOT exposed by the public Places API.
 * This endpoint fetches the public Google Maps business page and extracts
 * the most recent post/activity timestamp from the embedded JSON payload
 * that Google ships in the initial HTML (APP_INITIALIZATION_STATE).
 *
 * Returns: { status, postTimestamp }  (postTimestamp = Unix seconds or null)
 */
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { placeId } = req.query;
  if (!placeId || !placeId.trim()) {
    return res.status(400).json({ status: 'INVALID_REQUEST', postTimestamp: null });
  }

  try {
    /* ── 1. Fetch the public Google Maps business page ── */
    const mapsUrl =
      'https://www.google.com/maps/place/?q=place_id:' +
      encodeURIComponent(placeId.trim()) +
      '&hl=he';

    const resp = await fetch(mapsUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) ' +
          'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 ' +
          'Mobile/15E148 Safari/604.1',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      redirect: 'follow',
    });

    if (!resp.ok) {
      return res.status(200).json({ status: 'FETCH_FAILED', postTimestamp: null });
    }

    const html = await resp.text();

    /* ── 2. Extract all 10-digit Unix timestamps from the page ── */
    /* Target range: 01 Jan 2023 → today+1day (safety margin)    */
    const now     = Math.floor(Date.now() / 1000);
    const cutoff  = 1672531200; // 01 Jan 2023 00:00 UTC

    const candidates = new Set();
    // Match standalone 10-digit numbers starting with 16, 17 or 18
    const re = /(?<![.\d])(1[6-9]\d{8})(?![.\d])/g;
    let m;
    while ((m = re.exec(html)) !== null) {
      const ts = parseInt(m[1], 10);
      if (ts >= cutoff && ts <= now + 86400) candidates.add(ts);
    }

    if (candidates.size === 0) {
      return res.status(200).json({ status: 'NOT_FOUND', postTimestamp: null });
    }

    /* ── 3. Also try to find timestamps specifically near "post" markers ──
       Google embeds posts in arrays like: ["לפני X ימים",null,null,TS,...]
       We prefer a timestamp that appears near post-related keywords.        */
    const hePostRe = /(?:לפני|עודכן|פוסט|פרסום|שתף)[^)]{0,400}?(1[6-9]\d{8})/g;
    const postCandidates = new Set();
    while ((m = hePostRe.exec(html)) !== null) {
      const ts = parseInt(m[1], 10);
      if (ts >= cutoff && ts <= now + 86400) postCandidates.add(ts);
    }

    const preferredPool = postCandidates.size > 0 ? postCandidates : candidates;
    const sorted = [...preferredPool].sort((a, b) => b - a);

    return res.status(200).json({
      status: 'OK',
      postTimestamp: sorted[0],
      source: postCandidates.size > 0 ? 'post-marker' : 'latest-ts',
    });

  } catch (err) {
    console.error('[gbp-post error]', err.message);
    return res.status(200).json({ status: 'ERROR', postTimestamp: null });
  }
};
