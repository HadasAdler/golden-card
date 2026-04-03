/* pdf-analysis.js — Optimization Report PDF generator
   Depends on: jsPDF, html2canvas (loaded on demand)
   Exports: window.downloadAnalysis(bizName, reviewLink)
*/
(function () {
  'use strict';

  var BRAND = 'המלצות לקידום פרופיל העסק בגוגל | נבנה ע"י הדס אדלר';
  var NAVY  = '#0a192f';
  var GOLD  = '#f9b915';

  /* ── Competitors data ── */
  var COMPETITORS = [
    { name: 'מיכל מוזס חברת עו"ד', reviews: 47,  rating: '4.9', isMe: true  },
    { name: 'משרד לוי ושות׳',       reviews: 138, rating: '4.8', isMe: false },
    { name: 'עו"ד כהן ושות׳',       reviews: 94,  rating: '4.7', isMe: false },
    { name: 'עו"ד נועה גולן',        reviews: 73,  rating: '4.9', isMe: false },
    { name: 'ממוצע ענף',             reviews: 87,  rating: '4.8', isMe: false }
  ];

  var HOT_WORDS = [
    { word: 'מקצועי',    size: 'xl', freq: 89 },
    { word: 'זמין',      size: 'xl', freq: 76 },
    { word: 'אמין',      size: 'lg', freq: 68 },
    { word: 'ליווי אישי',size: 'lg', freq: 62 },
    { word: 'ניסיון',   size: 'lg', freq: 54 },
    { word: 'יסודי',    size: 'md', freq: 49 },
    { word: 'ברור',      size: 'md', freq: 43 },
    { word: 'מסור',      size: 'md', freq: 41 },
    { word: 'נגיש',      size: 'md', freq: 38 },
    { word: 'מהיר',      size: 'md', freq: 35 },
    { word: 'שירות',     size: 'sm', freq: 32 },
    { word: 'ידע',       size: 'sm', freq: 30 },
    { word: 'עקבי',      size: 'sm', freq: 27 },
    { word: 'מומלץ',     size: 'sm', freq: 25 },
    { word: 'מיומן',     size: 'sm', freq: 22 },
    { word: 'דיסקרטי',  size: 'sm', freq: 19 },
    { word: 'אנושי',     size: 'sm', freq: 17 },
    { word: 'אפקטיבי',  size: 'sm', freq: 15 }
  ];

  var CHECKLIST = [
    { priority: 'דחוף',  title: 'הוסיפו "ליווי אישי" ו"זמינות" לתיאור הפרופיל',        desc: 'שתי המילים החמות ביותר בענף — הטמיעו אותן בתיאור העסק בגוגל.' },
    { priority: 'דחוף',  title: 'השיגו 5 ביקורות חדשות השבוע',                          desc: 'פער של 91 ביקורות מהמוביל. כל שבוע = 5 ביקורות לפחות.' },
    { priority: 'דחוף',  title: 'הגיבו לכל הביקורות הקיימות תוך 24 שעות',               desc: 'תגובה לביקורות משפרת דירוג בגוגל ומראה ללקוחות שאתם קשובים.' },
    { priority: 'גבוה',  title: 'עדכנו תמונות פרופיל — לוגו + תמונת צוות',              desc: 'פרופילים עם תמונות מקצועיות מקבלים 35% יותר קליקים.' },
    { priority: 'גבוה',  title: 'הוסיפו שעות פעילות מדויקות ועדכניות',                  desc: 'שעות שגויות גורמות לביקורות שליליות. בדקו עכשיו.' },
    { priority: 'גבוה',  title: 'הגדילו את תיאור העסק לפחות ל-750 תווים',               desc: 'הטמיעו מילות מפתח: מקצועיות, ניסיון, ליווי אישי, זמינות.' },
    { priority: 'בינוני',title: 'הוסיפו 5+ תמונות מהמשרד / עבודה לגלריה',               desc: 'תמונות מקצועיות מהמשרד מעלות אמון אצל לקוחות חדשים.' },
    { priority: 'בינוני',title: 'הוסיפו שאלות ותשובות (Q&A) לפרופיל',                   desc: 'השיבו על שאלות נפוצות ישירות בפרופיל — זה משפר חיפוש.' }
  ];

  /* ── Helpers ── */
  function esc(s) {
    return String(s)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;');
  }

  function loadScript(src, cb) {
    if (document.querySelector('script[src="' + src + '"]')) { cb(); return; }
    var s = document.createElement('script');
    s.src = src; s.onload = cb;
    s.onerror = function() { alert('שגיאה בטעינת ספרייה.'); };
    document.head.appendChild(s);
  }

  /* ── Build bar for chart ── */
  function buildBar(comp) {
    var MAX_REVIEWS = 138;
    var pct = Math.round((comp.reviews / MAX_REVIEWS) * 100);
    var bg  = comp.isMe ? GOLD : '#1e4d7a';
    var labelColor = comp.isMe ? '#0a192f' : '#ffffff';
    return (
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">' +
        '<div style="width:170px;text-align:right;font-size:13px;font-weight:700;color:#e8e6e1;line-height:1.3;">' +
          esc(comp.name) + '<br>' +
          '<span style="font-size:11px;color:' + (comp.isMe ? GOLD : '#7eb8d4') + ';">⭐ ' + comp.rating + '</span>' +
        '</div>' +
        '<div style="flex:1;height:28px;background:rgba(255,255,255,.07);border-radius:6px;overflow:hidden;">' +
          '<div style="width:' + pct + '%;height:100%;background:' + bg + ';border-radius:6px;' +
               'display:flex;align-items:center;padding-right:8px;' +
               'font-size:12px;font-weight:800;color:' + labelColor + ';min-width:32px;">' +
            comp.reviews +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  /* ── Font size map for word tags ── */
  var wordSizeMap = { xl: '22px', lg: '17px', md: '14px', sm: '12px' };
  var wordOpacMap = { xl: '1',    lg: '0.9',  md: '0.75', sm: '0.6'  };

  function buildWordTag(w) {
    return (
      '<span style="' +
        'display:inline-block;' +
        'background:rgba(249,185,21,.12);' +
        'border:1.5px solid rgba(249,185,21,.4);' +
        'border-radius:8px;padding:5px 12px;margin:4px;' +
        'font-size:' + wordSizeMap[w.size] + ';' +
        'font-weight:800;' +
        'color:' + GOLD + ';' +
        'opacity:' + wordOpacMap[w.size] + ';' +
      '">' + esc(w.word) + ' <span style="font-size:10px;opacity:.6;">(' + w.freq + ')</span></span>'
    );
  }

  function buildCheckRow(item) {
    var badge_bg  = item.priority === 'דחוף' ? 'rgba(239,68,68,.2)'   :
                    item.priority === 'גבוה'  ? 'rgba(249,185,21,.2)' :
                                                'rgba(34,211,238,.15)';
    var badge_col = item.priority === 'דחוף' ? '#ef4444' :
                    item.priority === 'גבוה'  ? GOLD      : '#22d3ee';
    return (
      '<div style="display:flex;gap:10px;padding:13px 14px;margin-bottom:9px;' +
           'background:rgba(255,255,255,.04);border-radius:10px;border:1px solid rgba(249,185,21,.15);">' +
        '<div style="width:20px;height:20px;border:2px solid rgba(249,185,21,.45);border-radius:5px;flex-shrink:0;margin-top:2px;"></div>' +
        '<div style="background:' + badge_bg + ';color:' + badge_col + ';font-size:10px;font-weight:800;' +
             'padding:2px 7px;border-radius:4px;flex-shrink:0;height:18px;margin-top:3px;white-space:nowrap;">' +
          esc(item.priority) +
        '</div>' +
        '<div style="flex:1;">' +
          '<div style="font-size:14px;font-weight:800;color:#e8e6e1;margin-bottom:3px;">' + esc(item.title) + '</div>' +
          '<div style="font-size:12px;color:rgba(232,230,225,.5);line-height:1.55;">' + esc(item.desc) + '</div>' +
        '</div>' +
      '</div>'
    );
  }

  /* ── Full page HTML ── */
  function buildReportHTML(bizName) {
    var bars   = COMPETITORS.map(buildBar).join('');
    var words  = HOT_WORDS.map(buildWordTag).join('');
    var checks = CHECKLIST.map(buildCheckRow).join('');

    return (
      '<div style="' +
        'font-family:Arial,sans-serif;' +
        'width:794px;' +
        'background:' + NAVY + ';' +
        'color:#e8e6e1;direction:rtl;' +
        'padding:0;box-sizing:border-box;' +
      '">' +

      /* ── Cover header ── */
      '<div style="background:linear-gradient(135deg,#112240,#0a192f);' +
           'padding:48px 56px 40px;border-bottom:4px solid ' + GOLD + ';">' +
        '<div style="font-size:11px;font-weight:800;color:' + GOLD + ';letter-spacing:2px;margin-bottom:12px;">פרופיל העסק בגוגל</div>' +
        '<div style="font-size:32px;font-weight:900;color:#fff;line-height:1.25;margin-bottom:8px;">' +
          'דוח אופטימיזציה<br>ניתוח ביצועים מתקדם' +
        '</div>' +
        '<div style="font-size:15px;color:rgba(232,230,225,.65);margin-bottom:24px;">' +
          esc(bizName) +
        '</div>' +
        '<div style="display:flex;gap:20px;">' +
          '<div style="background:rgba(249,185,21,.12);border:1.5px solid rgba(249,185,21,.35);border-radius:12px;padding:14px 20px;text-align:center;">' +
            '<div style="font-size:26px;font-weight:900;color:' + GOLD + ';">47</div>' +
            '<div style="font-size:11px;color:rgba(232,230,225,.5);margin-top:3px;">ביקורות כרגע</div>' +
          '</div>' +
          '<div style="background:rgba(249,185,21,.12);border:1.5px solid rgba(249,185,21,.35);border-radius:12px;padding:14px 20px;text-align:center;">' +
            '<div style="font-size:26px;font-weight:900;color:' + GOLD + ';">4.9⭐</div>' +
            '<div style="font-size:11px;color:rgba(232,230,225,.5);margin-top:3px;">דירוג ממוצע</div>' +
          '</div>' +
          '<div style="background:rgba(239,68,68,.12);border:1.5px solid rgba(239,68,68,.35);border-radius:12px;padding:14px 20px;text-align:center;">' +
            '<div style="font-size:26px;font-weight:900;color:#ef4444;">−91</div>' +
            '<div style="font-size:11px;color:rgba(232,230,225,.5);margin-top:3px;">פער ממוביל ענף</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      /* ── Section: Bar chart ── */
      '<div style="padding:36px 56px 28px;">' +
        '<div style="font-size:16px;font-weight:900;color:#fff;margin-bottom:6px;">📊 כמות ביקורות — השוואה למתחרים</div>' +
        '<div style="width:100%;height:2px;background:rgba(249,185,21,.25);margin-bottom:20px;"></div>' +
        bars +
        '<div style="font-size:11px;color:rgba(232,230,225,.3);margin-top:6px;text-align:center;">' +
          '🟡 מיכל מוזס  |  🔵 מתחרים  |  ⬜ ממוצע ענף' +
        '</div>' +
      '</div>' +

      /* ── Section: Word cloud ── */
      '<div style="padding:0 56px 32px;">' +
        '<div style="font-size:16px;font-weight:900;color:#fff;margin-bottom:6px;">🔥 מילים חמות — מהמלצות המובילות בענף</div>' +
        '<div style="width:100%;height:2px;background:rgba(249,185,21,.25);margin-bottom:16px;"></div>' +
        '<div style="font-size:12px;color:rgba(232,230,225,.45);margin-bottom:16px;">מילים שחוזרות בביקורות 5 כוכבים של מתחרים מובילים — מומלץ להטמיע בפרופיל</div>' +
        '<div style="background:rgba(17,34,64,.7);border-radius:14px;border:1px solid rgba(249,185,21,.15);padding:20px;text-align:center;">' +
          words +
        '</div>' +
        '<div style="font-size:11px;color:rgba(232,230,225,.3);margin-top:10px;text-align:center;">גודל המילה = תדירות הופעה בביקורות מובילות</div>' +
      '</div>' +

      /* ── Section: Checklist ── */
      '<div style="padding:0 56px 48px;">' +
        '<div style="font-size:16px;font-weight:900;color:#fff;margin-bottom:6px;">✅ צ׳ק-ליסט פעולות דחופות לשיפור הדירוג</div>' +
        '<div style="width:100%;height:2px;background:rgba(249,185,21,.25);margin-bottom:20px;"></div>' +
        checks +
      '</div>' +

      /* ── Footer ── */
      '<div style="background:#112240;border-top:2px solid rgba(249,185,21,.2);padding:18px 56px;' +
           'display:flex;justify-content:space-between;align-items:center;">' +
        '<div style="font-size:11px;color:rgba(232,230,225,.3);">' + esc(BRAND) + '</div>' +
        '<div style="font-size:11px;color:rgba(232,230,225,.25);">' + new Date().toLocaleDateString('he-IL') + '</div>' +
      '</div>' +

      '</div>'
    );
  }

  /* ── Generate PDF ── */
  function generateAnalysisPDF(bizName, btn) {
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;z-index:-100;';
    wrap.innerHTML = buildReportHTML(bizName);
    document.body.appendChild(wrap);

    (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () {
      window.html2canvas(wrap.firstElementChild, {
        scale          : 2,
        backgroundColor: NAVY,
        logging        : false,
        allowTaint     : true,
        useCORS        : true
      }).then(function (canvas) {
        document.body.removeChild(wrap);

        var jsPDF  = window.jspdf.jsPDF;
        var pdf    = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
        var pageW  = pdf.internal.pageSize.getWidth();
        var pageH  = pdf.internal.pageSize.getHeight();
        var imgW   = canvas.width;
        var imgH   = canvas.height;
        var ratio  = pageW / imgW;
        var scaledH = imgH * ratio;

        /* Slice into pages */
        var sliceH   = Math.floor(pageH / ratio); // canvas pixels per page
        var pages    = Math.ceil(imgH / sliceH);

        for (var p = 0; p < pages; p++) {
          if (p > 0) pdf.addPage();
          var srcY     = p * sliceH;
          var srcH     = Math.min(sliceH, imgH - srcY);
          var tmpC     = document.createElement('canvas');
          tmpC.width   = imgW;
          tmpC.height  = srcH;
          var tc       = tmpC.getContext('2d');
          tc.drawImage(canvas, 0, srcY, imgW, srcH, 0, 0, imgW, srcH);
          var sliceUrl = tmpC.toDataURL('image/jpeg', 0.93);
          var sliceRH  = srcH * ratio;
          pdf.addImage(sliceUrl, 'JPEG', 0, 0, pageW, sliceRH);
        }

        pdf.save('דוח-אופטימיזציה-גוגל.pdf');

        if (btn) {
          btn.textContent = '✅ הדוח הורד!';
          btn.disabled    = false;
          setTimeout(function () {
            btn.textContent = '📥 הורד דוח אופטימיזציה מלא (PDF)';
          }, 3000);
        }
      }).catch(function (err) {
        console.error('html2canvas:', err);
        if (btn) { btn.textContent = '📥 הורד דוח אופטימיזציה מלא (PDF)'; btn.disabled = false; }
      });
    });
  }

  /* ── Public API ── */
  window.downloadAnalysis = function (bizName) {
    var btn = document.getElementById('analysisDownloadBtn');
    if (btn) { btn.textContent = '⏳ בונה דוח...'; btn.disabled = true; }

    loadScript(
      'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
      function () {
        loadScript(
          'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
          function () { generateAnalysisPDF(bizName, btn); }
        );
      }
    );
  };

})();
