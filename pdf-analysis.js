/* pdf-analysis.js — Optimization Report PDF generator
   Depends on: jsPDF, html2canvas (loaded on demand)
   Exports: window.downloadAnalysis(bizName, reviewLink)
*/
(function () {
  'use strict';

  var BRAND = 'המלצות לקידום פרופיל העסק בגוגל | נבנה ע"י הדס אדלר';
  var NAVY  = '#0a192f';
  var GOLD  = '#f9b915';

  /* ── Data ── */
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
    { icon: '📝', priority: 'דחוף',  title: 'הוסיפו "ליווי אישי" ו"זמינות" לתיאור הפרופיל',        desc: 'שתי המילים החמות ביותר בענף — הטמיעו אותן בתיאור העסק בגוגל.' },
    { icon: '⭐', priority: 'דחוף',  title: 'השיגו 5 ביקורות חדשות השבוע',                          desc: 'פער של 91 ביקורות מהמוביל. כל שבוע = 5 ביקורות לפחות.' },
    { icon: '💬', priority: 'דחוף',  title: 'הגיבו לכל הביקורות הקיימות תוך 24 שעות',               desc: 'תגובה לביקורות משפרת דירוג בגוגל ומראה ללקוחות שאתם קשובים.' },
    { icon: '📸', priority: 'גבוה',  title: 'עדכנו תמונות פרופיל — לוגו + תמונת צוות',              desc: 'פרופילים עם תמונות מקצועיות מקבלים 35% יותר קליקים.' },
    { icon: '🕐', priority: 'גבוה',  title: 'הוסיפו שעות פעילות מדויקות ועדכניות',                  desc: 'שעות שגויות גורמות לביקורות שליליות. בדקו עכשיו.' },
    { icon: '📄', priority: 'גבוה',  title: 'הגדילו את תיאור העסק לפחות ל-750 תווים',               desc: 'הטמיעו מילות מפתח: מקצועיות, ניסיון, ליווי אישי, זמינות.' },
    { icon: '🖼', priority: 'בינוני',title: 'הוסיפו 5+ תמונות מהמשרד / עבודה לגלריה',               desc: 'תמונות מקצועיות מהמשרד מעלות אמון אצל לקוחות חדשים.' },
    { icon: '❓', priority: 'בינוני',title: 'הוסיפו שאלות ותשובות (Q&A) לפרופיל',                   desc: 'השיבו על שאלות נפוצות ישירות בפרופיל — זה משפר חיפוש.' }
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
    s.onerror = function() { alert('שגיאה בטעינת ספרייה חיצונית.'); };
    document.head.appendChild(s);
  }

  /* ── Bar row ── */
  function buildBar(comp) {
    var MAX_REVIEWS = 138;
    var pct = Math.round((comp.reviews / MAX_REVIEWS) * 100);
    var bg       = comp.isMe ? GOLD : '#1e5a8a';
    var barColor = comp.isMe ? '#0a192f' : '#ffffff';
    var nameColor = comp.isMe ? GOLD : '#b8d4e8';
    return (
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:11px;">' +
        '<div style="width:175px;text-align:right;line-height:1.35;">' +
          '<div style="font-size:13px;font-weight:700;color:#fff;">' + esc(comp.name) + '</div>' +
          '<div style="font-size:11px;font-weight:600;color:' + nameColor + ';">⭐ ' + comp.rating + '</div>' +
        '</div>' +
        '<div style="flex:1;height:30px;background:rgba(255,255,255,.07);border-radius:6px;overflow:hidden;">' +
          '<div style="width:' + pct + '%;height:100%;background:' + bg + ';border-radius:6px;' +
               'display:flex;align-items:center;padding-right:9px;' +
               'font-size:12px;font-weight:800;color:' + barColor + ';min-width:34px;">' +
            comp.reviews +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  /* ── Legend item ── */
  function legendItem(color, label) {
    return (
      '<div style="display:inline-flex;align-items:center;gap:7px;margin-left:20px;">' +
        '<div style="width:16px;height:16px;border-radius:4px;background:' + color + ';flex-shrink:0;"></div>' +
        '<span style="font-size:13px;font-weight:700;color:#fff;">' + esc(label) + '</span>' +
      '</div>'
    );
  }

  /* ── Word tag ── */
  var wordSizeMap = { xl: '21px', lg: '16px', md: '13px', sm: '11px' };
  var wordOpacMap = { xl: '1',    lg: '0.9',  md: '0.8',  sm: '0.7'  };

  function buildWordTag(w) {
    return (
      '<span style="display:inline-block;' +
        'background:rgba(249,185,21,.14);' +
        'border:1.5px solid rgba(249,185,21,.42);' +
        'border-radius:7px;padding:4px 11px;margin:3px;' +
        'font-size:' + wordSizeMap[w.size] + ';font-weight:800;' +
        'color:' + GOLD + ';opacity:' + wordOpacMap[w.size] + ';' +
      '">' + esc(w.word) + '<span style="font-size:9px;opacity:.65;"> (' + w.freq + ')</span></span>'
    );
  }

  /* ── Checklist card row ── */
  function buildCheckRow(item) {
    var badge_bg  = item.priority === 'דחוף' ? 'rgba(239,68,68,.25)'  :
                    item.priority === 'גבוה'  ? 'rgba(249,185,21,.22)' :
                                                'rgba(34,211,238,.18)';
    var badge_col = item.priority === 'דחוף' ? '#ef4444' :
                    item.priority === 'גבוה'  ? GOLD      : '#22d3ee';
    return (
      '<div style="display:flex;gap:12px;padding:14px 16px;margin-bottom:10px;' +
           'background:rgba(255,255,255,.04);border-radius:12px;' +
           'border:1.5px solid rgba(249,185,21,.18);align-items:flex-start;">' +
        /* icon */
        '<div style="font-size:22px;width:40px;height:40px;flex-shrink:0;' +
             'background:rgba(249,185,21,.12);border-radius:10px;' +
             'display:flex;align-items:center;justify-content:center;' +
             'border:1px solid rgba(249,185,21,.25);">' +
          item.icon +
        '</div>' +
        /* body */
        '<div style="flex:1;">' +
          '<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">' +
            '<div style="font-size:14px;font-weight:800;color:#fff;flex:1;">' + esc(item.title) + '</div>' +
            '<div style="background:' + badge_bg + ';color:' + badge_col + ';' +
                 'font-size:10px;font-weight:800;padding:2px 7px;border-radius:4px;white-space:nowrap;">' +
              esc(item.priority) +
            '</div>' +
          '</div>' +
          '<div style="font-size:12px;color:rgba(255,255,255,.72);line-height:1.6;">' + esc(item.desc) + '</div>' +
        '</div>' +
        /* tick box */
        '<div style="width:22px;height:22px;border-radius:6px;border:2px solid rgba(249,185,21,.5);flex-shrink:0;margin-top:2px;"></div>' +
      '</div>'
    );
  }

  /* ── Full HTML ── */
  function buildReportHTML(bizName) {
    var bars   = COMPETITORS.map(buildBar).join('');
    var legend = legendItem(GOLD, 'העסק שלכם') +
                 legendItem('#1e5a8a', 'מתחרים') +
                 legendItem('rgba(255,255,255,.35)', 'ממוצע ענף');
    var words  = HOT_WORDS.map(buildWordTag).join('');
    var checks = CHECKLIST.map(buildCheckRow).join('');

    return (
      '<div style="font-family:Arial,sans-serif;width:794px;background:' + NAVY + ';' +
           'color:#fff;direction:rtl;padding:0;box-sizing:border-box;">' +

      /* ── Cover ── */
      '<div style="background:linear-gradient(135deg,#112240 0%,#0a192f 100%);' +
           'padding:48px 56px 36px;border-bottom:4px solid ' + GOLD + ';">' +
        '<div style="font-size:11px;font-weight:800;color:' + GOLD + ';letter-spacing:2.5px;' +
             'margin-bottom:12px;text-transform:uppercase;">פרופיל העסק בגוגל</div>' +
        '<div style="font-size:30px;font-weight:900;color:#fff;line-height:1.28;margin-bottom:8px;">' +
          'דוח אופטימיזציה — ניתוח ביצועים מתקדם' +
        '</div>' +
        '<div style="font-size:16px;color:rgba(255,255,255,.75);margin-bottom:26px;font-weight:600;">' +
          esc(bizName) +
        '</div>' +
        '<div style="display:flex;gap:18px;">' +
          /* KPI 1 */
          '<div style="background:rgba(249,185,21,.12);border:1.5px solid rgba(249,185,21,.4);' +
               'border-radius:12px;padding:14px 22px;text-align:center;">' +
            '<div style="font-size:28px;font-weight:900;color:' + GOLD + ';">47</div>' +
            '<div style="font-size:12px;font-weight:700;color:#fff;margin-top:4px;">ביקורות כרגע</div>' +
          '</div>' +
          /* KPI 2 */
          '<div style="background:rgba(249,185,21,.12);border:1.5px solid rgba(249,185,21,.4);' +
               'border-radius:12px;padding:14px 22px;text-align:center;">' +
            '<div style="font-size:28px;font-weight:900;color:' + GOLD + ';">4.9⭐</div>' +
            '<div style="font-size:12px;font-weight:700;color:#fff;margin-top:4px;">דירוג ממוצע</div>' +
          '</div>' +
          /* KPI 3 */
          '<div style="background:rgba(239,68,68,.15);border:1.5px solid rgba(239,68,68,.4);' +
               'border-radius:12px;padding:14px 22px;text-align:center;">' +
            '<div style="font-size:28px;font-weight:900;color:#ef4444;">−91</div>' +
            '<div style="font-size:12px;font-weight:700;color:#fff;margin-top:4px;">פער ממוביל ענף</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      /* ── Bar chart ── */
      '<div style="padding:32px 56px 24px;">' +
        '<div style="font-size:17px;font-weight:900;color:#fff;margin-bottom:6px;">📊 כמות ביקורות — השוואה למתחרים</div>' +
        '<div style="width:100%;height:2px;background:rgba(249,185,21,.28);margin-bottom:18px;"></div>' +
        bars +
        '<div style="margin-top:14px;text-align:center;">' + legend + '</div>' +
      '</div>' +

      /* ── Gap metric ── */
      '<div style="padding:0 56px 28px;">' +
        '<div style="background:rgba(239,68,68,.12);border:2px solid rgba(239,68,68,.35);' +
             'border-radius:14px;padding:20px 22px;">' +
          '<div style="font-size:15px;font-weight:900;color:#fff;margin-bottom:14px;">📉 מדד פער הביצועים שלכם</div>' +
          '<div style="display:flex;gap:14px;margin-bottom:14px;">' +
            '<div style="flex:1;background:rgba(0,0,0,.2);border-radius:10px;padding:12px;text-align:center;">' +
              '<div style="font-size:24px;font-weight:900;color:#22d3ee;">101</div>' +
              '<div style="font-size:12px;font-weight:700;color:#fff;margin-top:4px;">ממוצע Top 3</div>' +
            '</div>' +
            '<div style="flex:1;background:rgba(0,0,0,.2);border-radius:10px;padding:12px;text-align:center;">' +
              '<div style="font-size:24px;font-weight:900;color:' + GOLD + ';">47</div>' +
              '<div style="font-size:12px;font-weight:700;color:#fff;margin-top:4px;">ביקורות שלכם</div>' +
            '</div>' +
            '<div style="flex:1;background:rgba(0,0,0,.2);border-radius:10px;padding:12px;text-align:center;">' +
              '<div style="font-size:24px;font-weight:900;color:#ef4444;">54</div>' +
              '<div style="font-size:12px;font-weight:700;color:#fff;margin-top:4px;">ביקורות חסרות</div>' +
            '</div>' +
          '</div>' +
          '<div style="font-size:14px;font-weight:600;color:#fff;text-align:center;' +
               'background:rgba(0,0,0,.25);border-radius:8px;padding:10px 14px;line-height:1.6;">' +
            '⏱ בקצב של 5 ביקורות בשבוע — תגיעו לממוצע Top 3 תוך כ-11 שבועות' +
          '</div>' +
        '</div>' +
      '</div>' +

      /* ── Word cloud ── */
      '<div style="padding:0 56px 28px;">' +
        '<div style="font-size:17px;font-weight:900;color:#fff;margin-bottom:6px;">🔥 מילים מנצחות מהביקורות של המתחרים</div>' +
        '<div style="width:100%;height:2px;background:rgba(249,185,21,.28);margin-bottom:12px;"></div>' +
        '<div style="font-size:13px;font-weight:600;color:#fff;margin-bottom:14px;line-height:1.65;">' +
          'אלו המילים שגוגל סורק ומזהה כסימני איכות. ' +
          'מומלץ לשלב אותן בתיאור העסק ובתגובות ללקוחות.' +
        '</div>' +
        '<div style="background:rgba(17,34,64,.7);border-radius:14px;' +
             'border:1px solid rgba(249,185,21,.18);padding:18px;text-align:center;">' +
          words +
        '</div>' +
        '<div style="font-size:11px;font-weight:600;color:rgba(255,255,255,.5);' +
             'text-align:center;margin-top:10px;">גודל המילה = תדירות הופעה בביקורות 5 כוכבים</div>' +
      '</div>' +

      /* ── Gold tip ── */
      '<div style="padding:0 56px 28px;">' +
        '<div style="background:linear-gradient(135deg,rgba(249,185,21,.18),rgba(249,185,21,.07));' +
             'border:2px solid rgba(249,185,21,.55);border-radius:16px;padding:22px 22px;">' +
          '<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">' +
            '<div style="font-size:26px;">💡</div>' +
            '<div style="font-size:15px;font-weight:900;color:' + GOLD + ';">טיפ האופטימיזציה של הדס</div>' +
          '</div>' +
          '<div style="font-size:15px;font-weight:800;color:#fff;margin-bottom:8px;">' +
            'הדרך המהירה ביותר להכפיל המלצות בשבוע אחד:' +
          '</div>' +
          '<div style="font-size:14px;font-weight:500;color:rgba(255,255,255,.9);line-height:1.75;">' +
            'שלחו הודעת וואטסאפ אישית ל-10 לקוחות מרוצים שעבדתם איתם ב-6 החודשים האחרונים. ' +
            'לא נוסחה — הודעה אישית בשמם. ' +
            'ציפייה ריאלית: 4-6 ביקורות חדשות תוך שבוע אחד.' +
          '</div>' +
        '</div>' +
      '</div>' +

      /* ── Checklist ── */
      '<div style="padding:0 56px 44px;">' +
        '<div style="font-size:17px;font-weight:900;color:#fff;margin-bottom:6px;">✅ צ׳ק-ליסט פעולות דחופות לשיפור הדירוג</div>' +
        '<div style="width:100%;height:2px;background:rgba(249,185,21,.28);margin-bottom:18px;"></div>' +
        checks +
      '</div>' +

      /* ── Footer ── */
      '<div style="background:#112240;border-top:2px solid rgba(249,185,21,.22);' +
           'padding:16px 56px;display:flex;justify-content:space-between;align-items:center;">' +
        '<div style="font-size:11px;color:rgba(255,255,255,.4);">' + esc(BRAND) + '</div>' +
        '<div style="font-size:11px;color:rgba(255,255,255,.3);">' + new Date().toLocaleDateString('he-IL') + '</div>' +
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
        var ratio  = pageW / canvas.width;
        var sliceH = Math.floor(pageH / ratio);
        var pages  = Math.ceil(canvas.height / sliceH);

        for (var p = 0; p < pages; p++) {
          if (p > 0) pdf.addPage();
          var srcY  = p * sliceH;
          var srcH  = Math.min(sliceH, canvas.height - srcY);
          var tmp   = document.createElement('canvas');
          tmp.width = canvas.width; tmp.height = srcH;
          tmp.getContext('2d').drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);
          pdf.addImage(tmp.toDataURL('image/jpeg', 0.93), 'JPEG', 0, 0, pageW, srcH * ratio);
        }

        pdf.save('דוח-אופטימיזציה-גוגל.pdf');

        if (btn) {
          btn.textContent = '✅ הדוח הורד בהצלחה!';
          btn.disabled    = false;
          setTimeout(function () {
            btn.textContent = '📥 הורד דוח אופטימיזציה מלא (PDF)';
          }, 3500);
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
