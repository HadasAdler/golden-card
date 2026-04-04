/**
 * Vercel Serverless Function — /api/notify
 * שולח מייל התראה להדס כשלקוח מסיים Onboarding
 *
 * הגדרה ב-Vercel Dashboard → Settings → Environment Variables:
 *   RESEND_API_KEY = re_xxxxxxxxxxxxxxxx
 *
 * שירות: resend.com (חינמי עד 100 מיילים/יום, ללא צורך בהגדרת דומיין)
 * https://resend.com/signup → API Keys → Create API Key
 */
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, bizName, phone, email, slug, brandColor } = req.body || {};

  if (!name || !bizName || !phone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // אין מפתח — לא שולחים מייל אבל לא חוסמים את הלקוח
    console.warn('[notify] RESEND_API_KEY not set — skipping email');
    return res.status(200).json({ ok: true, skipped: true });
  }

  const cardUrl  = slug ? `https://review-me.org/${slug}` : '—';
  const dateStr  = new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' });

  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;background:#f0f4f8;padding:24px;direction:rtl;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;
              padding:32px 28px;box-shadow:0 4px 20px rgba(0,0,0,.1);">

    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:40px;">🎉</div>
      <h1 style="color:#0a192f;font-size:22px;margin:8px 0 4px;">לקוח חדש השלים הקמה!</h1>
      <p style="color:#64748b;font-size:14px;margin:0;">${dateStr}</p>
    </div>

    <table style="width:100%;border-collapse:collapse;font-size:15px;">
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#64748b;width:40%;">שם הלקוח</td>
        <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#0f172a;font-weight:700;">${esc(name)}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#64748b;">שם העסק</td>
        <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#0f172a;font-weight:700;">${esc(bizName)}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#64748b;">טלפון</td>
        <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#0f172a;font-weight:700;">
          <a href="tel:${esc(phone)}" style="color:#0891b2;">${esc(phone)}</a>
        </td>
      </tr>
      ${email ? `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#64748b;">מייל</td>
        <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#0f172a;">
          <a href="mailto:${esc(email)}" style="color:#0891b2;">${esc(email)}</a>
        </td>
      </tr>` : ''}
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#64748b;">Slug נבחר</td>
        <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#0f172a;font-weight:700;direction:ltr;">
          ${esc(slug || '—')}
        </td>
      </tr>
      ${brandColor ? `<tr>
        <td style="padding:10px 0;color:#64748b;">צבע כרטיס</td>
        <td style="padding:10px 0;color:#0f172a;font-weight:700;">
          <span style="display:inline-block;width:16px;height:16px;border-radius:50%;
                       background:${esc(brandColor)};margin-left:6px;vertical-align:middle;"></span>
          ${esc(brandColor)}
        </td>
      </tr>` : ''}
    </table>

    <div style="margin-top:24px;text-align:center;">
      <a href="${esc(cardUrl)}"
         style="display:inline-block;background:#f9b915;color:#0a192f;
                padding:12px 28px;border-radius:10px;font-weight:700;
                font-size:15px;text-decoration:none;">
        🔗 הכרטיס החי — ${esc(cardUrl)}
      </a>
    </div>

    <p style="margin-top:24px;text-align:center;color:#94a3b8;font-size:12px;">
      Review Me | review-me.org
    </p>
  </div>
</body>
</html>`;

  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        from:    'Review Me <onboarding@resend.dev>',
        to:      ['adler.hadas@gmail.com'],
        subject: `🎉 לקוח חדש: ${bizName} — ${name}`,
        html
      })
    });

    const body = await r.json();
    if (!r.ok) {
      console.error('[notify] Resend error:', body);
      return res.status(200).json({ ok: true, warning: body });  // לא חוסמים לקוח
    }

    console.log('[notify] Email sent, id:', body.id);
    return res.status(200).json({ ok: true, id: body.id });

  } catch (err) {
    console.error('[notify] fetch error:', err.message);
    return res.status(200).json({ ok: true, warning: err.message }); // לא חוסמים לקוח
  }
};

function esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
