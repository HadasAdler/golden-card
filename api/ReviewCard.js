/**
 * Vercel Serverless Function — /api/ReviewCard  (legacy URL support)
 *
 * Handles: review-me.org/ReviewCard?card=slug
 * Serves:  card.html content internally — URL bar stays unchanged.
 *
 * Why API instead of vercel.json rewrite:
 *   cleanUrls:true causes Vercel to serve ReviewCard.html (static) BEFORE
 *   any rewrite rules fire.  An API function always wins over static files.
 */
const fs   = require('fs');
const path = require('path');

module.exports = function handler(req, res) {
  // Allow any origin (card is public)
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Read card.html from the project root (one level up from /api/)
  const cardPath = path.join(__dirname, '..', 'card.html');
  fs.readFile(cardPath, 'utf8', function(err, html) {
    if (err) {
      res.status(500).send('card.html not found');
      return;
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(html);
  });
};
