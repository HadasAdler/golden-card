/**
 * pdf-calendar.js — לוח משימות חודשי PDF
 * html2canvas + jsPDF | RTL עברית | Smart page-break
 */
(function(){
  'use strict';

  var SCALE = 1.8;
  var BRAND = 'המלצות לקידום פרופיל העסק בגוגל | נבנה ע"י הדס אדלר';

  /* ═══════════════════════════════════════
     20 המשימות החודשיות
  ═══════════════════════════════════════ */
  var TASKS = [
    { day: 1,  label:'פוסט פתיחת חודש',
      desc:'שתפו הצלחה מהחודש שעבר עם קישור להמלצות.' },
    { day: 2,  label:'בדיקת נוכחות',
      desc:'ודאו שקישור הכרטיס מופיע ב"ביו" באינסטגרם ובטיקטוק.' },
    { day: 4,  label:'סטורי מאחורי הקלעים',
      desc:'תמונה מהעבודה עם מדבקת קישור להמלצה.' },
    { day: 6,  label:'סידור חתימת מייל',
      desc:'ודאו שמתחת לחתימה במייל מופיע משפט הזמנה וקישור.' },
    { day: 8,  label:'פנייה אישית',
      desc:'בחרו לקוח מרוצה במיוחד ושלחו לו הודעת וואטסאפ אישית.' },
    { day: 10, label:'סבב משפחה וחברים',
      desc:'הודעה בקבוצה המשפחתית לבקשת פרגון.' },
    { day: 11, label:'תחזוקת תגובות',
      desc:'ענו לכל ההמלצות האחרונות שקיבלתם בפרופיל הגוגל.' },
    { day: 13, label:'הוכחה חברתית',
      desc:'צילום מסך של מחמאה בוואטסאפ לסטורי עם קישור.' },
    { day: 15, label:'משימת דלפק',
      desc:'ודאו שדף ה-QR המודפס נמצא במקום בולט ונקי (לעסקים פיזיים).' },
    { day: 16, label:'דיוור לקוחות',
      desc:'שלחו מייל קצר לרשימת התפוצה: "הדעה שלכם חשובה לנו".' },
    { day: 18, label:'וואטסאפ סטטוס',
      desc:'העלו תמונה של לקוח מרוצה לסטטוס עם הקישור.' },
    { day: 20, label:'גיוס קולגות',
      desc:'פנו לקולגה להחלפת המלצות מקצועיות הדדיות.' },
    { day: 21, label:'קידום אישי',
      desc:'שלחו הודעה לחברים בוואטסאפ שאתם מקדמים את העסק ותשמחו לדירוג 5 כוכבים.' },
    { day: 23, label:'לקוח עבר',
      desc:'הודעת "מה שלומך" ללקוח מלפני 3 חודשים עם הקישור.' },
    { day: 25, label:'פוסט סיכום',
      desc:'העלו פוסט עם 3 המלצות חזקות שקיבלתם החודש.' },
    { day: 26, label:'סטטוס חוזר',
      desc:'פוסט/סטורי נוסף ברשתות עם בקשה פשוטה לפרגון.' },
    { day: 27, label:'פנייה פנים אל פנים',
      desc:'בקשו המלצה לפחות מלקוח אחד בסיום שירות היום.' },
    { day: 28, label:'סטורי הדרכה',
      desc:'צילום מסך של הכרטיס עם הסבר קצר כמה קל להמליץ.' },
    { day: 30, label:'תודה לקהילה',
      desc:'פוסט תודה לכל מי שפרגן החודש עם קישור למי שפספס.' },
    { day: 31, label:'תכנון קדימה',
      desc:'בחרו 3 לקוחות לפנייה אישית בשבוע הבא.' }
  ];

  /* ═══════════════════════════════════════
     בניית ה-HTML לצילום
  ═══════════════════════════════════════ */
  function buildTemplate() {
    var navy  = '#0a192f';
    var gold  = '#f9b915';
    var light = '#f1f5f9';
    var slate = '#374151';
    var ff    = 'font-family:Heebo,Arial,sans-serif;';

    /* מפה: day → task */
    var taskMap = {};
    TASKS.forEach(function(t){ taskMap[t.day] = t; });

    /* ── עטיפה ראשית ── */
    var html =
      '<div style="'+ ff +'width:794px;background:#fff;direction:rtl;'
      + 'padding:38px 40px 40px;box-sizing:border-box;color:'+ navy +';">';

    /* ── כותרת ── */
    html +=
      '<div style="text-align:center;margin-bottom:22px;padding-bottom:18px;'
      + 'border-bottom:3px solid '+ gold +';">'
      + '<div style="'+ ff +'font-size:11px;font-weight:800;color:'+ gold
      + ';letter-spacing:1.2px;margin-bottom:8px;">המדריך המעשי</div>'
      + '<div style="'+ ff +'font-size:22px;font-weight:900;color:'+ navy
      + ';line-height:1.35;">לוח המשימות החודשי לקידום<br>וחיזוק הנוכחות בגוגל</div>'
      + '<div style="'+ ff +'font-size:12px;color:#64748b;margin-top:7px;font-weight:500;">'
      + 'בצעו משימה אחת ביום המסומן — ותראו שיפור משמעותי בדירוג ובמוניטין</div>'
      + '</div>';

    /* ── לוח שנה Grid (table) ──
       שורות של 7 ימים: 1-7, 8-14, 15-21, 22-28, 29-31
       תאי משימה = רקע נייבי + מספר זהוב + תווית לבנה
       תאים ריקים = רקע בהיר + מספר אפור
    */
    html +=
      '<table style="width:100%;border-collapse:separate;border-spacing:3px;'
      + 'margin-bottom:16px;">';

    var rows = [];
    var cur  = [];
    for (var d = 1; d <= 31; d++) {
      cur.push(d);
      if (cur.length === 7) { rows.push(cur); cur = []; }
    }
    if (cur.length) {
      while (cur.length < 7) cur.push(null); // pad last row
      rows.push(cur);
    }

    rows.forEach(function(row){
      html += '<tr>';
      row.forEach(function(day){
        if (day === null) {
          /* תא ריק */
          html += '<td style="width:14.28%;height:78px;background:#f8fafc;'
            + 'border-radius:7px;"></td>';
        } else if (taskMap[day]) {
          /* יום משימה */
          var t = taskMap[day];
          html +=
            '<td style="width:14.28%;height:78px;background:'+ navy +';'
            + 'border-radius:7px;padding:7px 7px 5px;vertical-align:top;'
            + 'box-sizing:border-box;">'
            + '<div style="'+ ff +'font-size:16px;font-weight:900;color:'+ gold
            + ';line-height:1;">'+ day +'</div>'
            + '<div style="'+ ff +'font-size:9px;font-weight:700;color:#fff;'
            + 'line-height:1.42;margin-top:5px;word-break:break-word;">'
            + t.label +'</div>'
            + '</td>';
        } else {
          /* יום רגיל */
          html +=
            '<td style="width:14.28%;height:78px;background:'+ light +';'
            + 'border-radius:7px;padding:7px 7px 5px;vertical-align:top;'
            + 'box-sizing:border-box;">'
            + '<div style="'+ ff +'font-size:16px;font-weight:700;color:#94a3b8;">'
            + day +'</div>'
            + '</td>';
        }
      });
      html += '</tr>';
    });

    html += '</table>';

    /* ── מקרא ── */
    html +=
      '<div style="display:flex;gap:18px;align-items:center;margin-bottom:22px;'
      + 'padding:9px 14px;background:'+ light +';border-radius:8px;">'
      + '<div style="display:flex;align-items:center;gap:7px;">'
      + '<div style="width:13px;height:13px;background:'+ navy
      + ';border-radius:3px;flex-shrink:0;"></div>'
      + '<span style="'+ ff +'font-size:11px;color:#475569;font-weight:700;">יום עם משימה</span>'
      + '</div>'
      + '<div style="display:flex;align-items:center;gap:7px;">'
      + '<div style="width:13px;height:13px;background:#e2e8f0;'
      + 'border-radius:3px;flex-shrink:0;"></div>'
      + '<span style="'+ ff +'font-size:11px;color:#475569;font-weight:700;">יום חופשי</span>'
      + '</div>'
      + '<div style="'+ ff +'font-size:11px;color:#94a3b8;margin-right:auto;">'
      + '✓ סמנו כל משימה לאחר ביצוע</div>'
      + '</div>';

    /* ── כותרת פירוט משימות ── */
    html +=
      '<div style="'+ ff +'text-align:center;margin:4px 0 16px;font-size:14px;'
      + 'font-weight:900;color:'+ navy +';border-top:1px solid #e2e8f0;padding-top:17px;">'
      + 'פירוט המשימות החודשיות</div>';

    /* ── כרטיסי פירוט ── */
    TASKS.forEach(function(t, i){
      var bg = (i % 2 === 0) ? '#f8fafc' : '#ffffff';
      html +=
        '<div class="tip-card" style="margin-bottom:10px;padding:12px 16px 11px;'
        + 'background:'+ bg +';border-radius:9px;border-right:4px solid '+ gold +';">'
        + '<div style="display:flex;align-items:flex-start;gap:12px;">'
        + '<div style="'+ ff +'min-width:34px;height:34px;border-radius:50%;'
        + 'background:'+ navy +';color:'+ gold +';display:flex;align-items:center;'
        + 'justify-content:center;font-size:13px;font-weight:900;flex-shrink:0;'
        + 'line-height:1;">'+ t.day +'</div>'
        + '<div>'
        + '<div style="'+ ff +'font-size:14px;font-weight:800;color:'+ navy
        + ';margin-bottom:4px;">'+ t.label +'</div>'
        + '<div style="'+ ff +'font-size:13px;color:'+ slate +';line-height:1.7;">'
        + t.desc +'</div>'
        + '</div></div></div>';
    });

    /* ── Footer ── */
    html +=
      '<div style="margin-top:22px;padding:16px 22px;background:'+ light +';'
      + 'border-radius:10px;border-top:2px solid '+ gold +';text-align:center;">'
      + '<div style="'+ ff +'font-size:15px;font-weight:900;color:'+ navy
      + ';margin-bottom:5px;">בצעו את המשימות בעקביות — וצפו בדירוג שלכם עולה!</div>'
      + '<div style="'+ ff +'font-size:12px;color:#64748b;line-height:1.6;">'
      + 'עקביות חודשית היא הסוד האמיתי להצלחה בגוגל.</div>'
      + '</div>'

      /* קרדיט */
      + '<div style="'+ ff +'text-align:center;margin-top:14px;font-size:11px;'
      + 'color:#94a3b8;font-weight:500;">'+ BRAND +'</div>'

      + '</div>'; /* /wrapper */

    return html;
  }

  /* ═══════════════════════════════════════
     טעינת סקריפט חיצוני
  ═══════════════════════════════════════ */
  function loadScript(src, cb){
    if (document.querySelector('script[src="'+ src +'"]')){ cb(); return; }
    var s = document.createElement('script');
    s.src = src; s.onload = cb;
    s.onerror = function(){ alert('שגיאה בטעינת ספרייה. בדקו חיבור אינטרנט.'); };
    document.head.appendChild(s);
  }

  /* ═══════════════════════════════════════
     יצירת ה-PDF עם Smart page-break
  ═══════════════════════════════════════ */
  function generatePDF(btn){
    document.fonts.ready.then(function(){

      /* 1. הוסף template ל-DOM */
      var wrap = document.createElement('div');
      wrap.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-100;width:794px;';
      wrap.innerHTML = buildTemplate();
      document.body.appendChild(wrap);

      /* 2. מדוד מיקום כרטיסי פירוט */
      var cards    = wrap.querySelectorAll('.tip-card');
      var wrapTop  = wrap.getBoundingClientRect().top;
      var cardRects = [];
      Array.prototype.forEach.call(cards, function(card){
        var r = card.getBoundingClientRect();
        cardRects.push({ top: r.top - wrapTop, bottom: r.bottom - wrapTop });
      });

      /* 3. html2canvas */
      window.html2canvas(wrap.firstElementChild, {
        scale: SCALE, useCORS: true,
        backgroundColor: '#ffffff', logging: false, allowTaint: true
      }).then(function(canvas){
        document.body.removeChild(wrap);

        var jsPDF  = window.jspdf.jsPDF;
        var pdf    = new jsPDF({ orientation:'portrait', unit:'pt', format:'a4' });
        var pageW  = pdf.internal.pageSize.getWidth();
        var pageH  = pdf.internal.pageSize.getHeight();
        var imgW   = canvas.width;
        var imgH   = canvas.height;
        var ratio  = pageW / imgW;

        var cardsPx = cardRects.map(function(r){
          return { top: r.top * SCALE, bottom: r.bottom * SCALE };
        });

        /* 4. Smart page-break */
        var pageHPx = pageH / ratio;
        var slices  = [];
        var cur     = 0;

        while (cur < imgH){
          var ideal = cur + pageHPx;
          if (ideal >= imgH){ slices.push({ s:cur, e:imgH }); break; }
          var cutAt = ideal;
          for (var i = 0; i < cardsPx.length; i++){
            var c = cardsPx[i];
            if (c.top < ideal && c.bottom > ideal){
              cutAt = c.top - 6;
              break;
            }
          }
          if (cutAt <= cur) cutAt = ideal;
          slices.push({ s:cur, e:cutAt });
          cur = cutAt;
        }

        /* 5. רנדר לדפי PDF */
        slices.forEach(function(sl, idx){
          if (idx > 0) pdf.addPage();
          var srcH = Math.round(sl.e - sl.s);
          if (srcH <= 0) return;

          var slice = document.createElement('canvas');
          slice.width  = imgW;
          slice.height = srcH;
          var sCtx = slice.getContext('2d');
          sCtx.fillStyle = '#ffffff';
          sCtx.fillRect(0, 0, imgW, srcH);
          sCtx.drawImage(canvas, 0, Math.round(sl.s), imgW, srcH, 0, 0, imgW, srcH);
          pdf.addImage(slice.toDataURL('image/jpeg', 0.93), 'JPEG', 0, 0, pageW, srcH * ratio);
        });

        pdf.save('לוח-משימות-חודשי-גוגל.pdf');

        if (btn){
          btn.textContent = '✅ הורד בהצלחה!';
          btn.disabled = false;
          setTimeout(function(){ btn.textContent = '📅 הורד את לוח המשימות'; }, 3000);
        }

      }).catch(function(err){
        console.error('[pdf-calendar]', err);
        if (btn){ btn.textContent = '❌ שגיאה — נסו שנית'; btn.disabled = false; }
        if (document.body.contains(wrap)) document.body.removeChild(wrap);
      });
    });
  }

  /* ═══════════════════════════════════════
     נקודת כניסה ציבורית
  ═══════════════════════════════════════ */
  window.downloadCalendar = function(){
    var btn = document.getElementById('calendarDownloadBtn');
    if (btn){ btn.textContent = '⏳ מכין קובץ PDF...'; btn.disabled = true; }

    loadScript(
      'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
      function(){
        loadScript(
          'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
          function(){ generatePDF(btn); }
        );
      }
    );
  };

})();
