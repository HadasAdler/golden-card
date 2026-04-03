/**
 * pdf-calendar.js — תוכנית עבודה שבועית PDF
 * 4 שבועות × 7 ימים | ימי א'-ה' פעילים | RTL עברית
 * html2canvas + jsPDF | Smart page-break
 */
(function(){
  'use strict';

  var SCALE = 1.8;
  var BRAND = 'המלצות לקידום פרופיל העסק בגוגל | נבנה ע"י הדס אדלר';

  /* כותרות עמודות ימי השבוע */
  var DAY_LABELS = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];

  /* ═══════════════════════════════════════
     4 שבועות × 7 ימים
     tasks[0-4] = א-ה פעיל | tasks[5-6] = null (שישי/שבת)
  ═══════════════════════════════════════ */
  var WEEKS = [
    {
      label:'שבוע 1',
      tasks:[
        { label:'פוסט פתיחת חודש',
          desc:'שתפו הצלחה מהחודש שעבר עם קישור להמלצות.' },
        { label:'בדיקת נוכחות בביו',
          desc:'ודאו שקישור הכרטיס מופיע ב"ביו" באינסטגרם ובטיקטוק.' },
        { label:'סטורי מאחורי הקלעים',
          desc:'תמונה מהעבודה עם מדבקת קישור להמלצה.' },
        { label:'סידור חתימת מייל',
          desc:'ודאו שמתחת לחתימה במייל מופיע משפט הזמנה וקישור.' },
        { label:'פנייה אישית בוואטסאפ',
          desc:'בחרו לקוח מרוצה במיוחד ושלחו לו הודעת וואטסאפ אישית.' },
        null, null
      ]
    },
    {
      label:'שבוע 2',
      tasks:[
        { label:'הודעה בקבוצה משפחתית',
          desc:'הודעה בקבוצה המשפחתית לבקשת פרגון.' },
        { label:'תחזוקת תגובות בגוגל',
          desc:'ענו לכל ההמלצות האחרונות שקיבלתם בפרופיל הגוגל.' },
        { label:'הוכחה חברתית בסטורי',
          desc:'צילום מסך של מחמאה בוואטסאפ לסטורי עם קישור.' },
        { label:'משימת דלפק / QR',
          desc:'ודאו שדף ה-QR המודפס נמצא במקום בולט ונקי (לעסקים פיזיים).' },
        { label:'דיוור לרשימת תפוצה',
          desc:'שלחו מייל קצר לרשימת התפוצה: "הדעה שלכם חשובה לנו".' },
        null, null
      ]
    },
    {
      label:'שבוע 3',
      tasks:[
        { label:'תמונה לסטטוס וואטסאפ',
          desc:'העלו תמונה של לקוח מרוצה לסטטוס עם הקישור.' },
        { label:'גיוס קולגות',
          desc:'פנו לקולגה להחלפת המלצות מקצועיות הדדיות.' },
        { label:'קידום אישי לחברים',
          desc:'שלחו הודעה לחברים בוואטסאפ שאתם מקדמים את העסק ותשמחו לדירוג 5 כוכבים.' },
        { label:'פנייה ללקוח עבר',
          desc:'הודעת "מה שלומך" ללקוח מלפני 3 חודשים עם הקישור.' },
        { label:'פוסט 3 המלצות חזקות',
          desc:'העלו פוסט עם 3 המלצות חזקות שקיבלתם החודש.' },
        null, null
      ]
    },
    {
      label:'שבוע 4',
      tasks:[
        { label:'פוסט / סטורי חוזר',
          desc:'העלו פוסט/סטורי נוסף ברשתות עם בקשה פשוטה לפרגון.' },
        { label:'פנייה פנים אל פנים',
          desc:'בקשו המלצה לפחות מלקוח אחד בסיום שירות היום.' },
        { label:'סטורי הדרכה',
          desc:'צילום מסך של הכרטיס עם הסבר קצר כמה קל להמליץ.' },
        { label:'פוסט תודה לקהילה',
          desc:'פוסט תודה לכל מי שפרגן החודש עם קישור למי שפספס.' },
        { label:'תכנון לשבוע הבא',
          desc:'בחרו 3 לקוחות לפנייה אישית בשבוע הבא.' },
        null, null
      ]
    }
  ];

  /* ═══════════════════════════════════════
     בניית ה-HTML לצילום
  ═══════════════════════════════════════ */
  function buildTemplate(){
    var navy    = '#0a192f';
    var gold    = '#f9b915';
    var light   = '#f1f5f9';   /* אפור-כחלחל בהיר — כותרות ימים */
    var lighter = '#f8fafc';   /* לבן-אפרפר — שורות זוגיות */
    var slate   = '#374151';
    var restBg  = '#e2e8f0';   /* אפור-כחלחל לימי מנוחה */
    var ff      = 'font-family:Heebo,Arial,sans-serif;';

    /* ── עטיפה ── */
    var html =
      '<div style="'+ ff +'width:794px;background:#fff;direction:rtl;'
      + 'padding:38px 36px 40px;box-sizing:border-box;color:'+ navy +';">';

    /* ── כותרת ── */
    html +=
      '<div style="text-align:center;margin-bottom:22px;padding-bottom:18px;'
      + 'border-bottom:3px solid '+ gold +';">'
      + '<div style="'+ ff +'font-size:11px;font-weight:800;color:'+ gold
      + ';letter-spacing:1.2px;margin-bottom:8px;">המדריך המעשי</div>'
      + '<div style="'+ ff +'font-size:22px;font-weight:900;color:'+ navy
      + ';line-height:1.35;">תוכנית עבודה שבועית לחיזוק<br>הנוכחות והדירוג בגוגל</div>'
      + '<div style="'+ ff +'font-size:12px;color:#64748b;margin-top:7px;font-weight:500;">'
      + 'משימה אחת בכל יום עבודה — 20 פעולות לחודש שישמרו אתכם קדימה</div>'
      + '</div>';

    /* ── טבלת לוח שבועי ──
       8 עמודות: תווית שבוע + 7 ימי שבוע (א-ז)
       כותרות ימים: רקע אפור בהיר + טקסט נייבי (רגועים לעין)
       תאי משימה: נייבי + כתב זהב
       שישי/שבת: אפור כהה יותר — "יום מנוחה"
    */

    var HDR_H  = '36px';   /* גובה כותרת ימים */
    var ROW_H  = '90px';   /* גובה שורת שבוע */
    var WK_W   = '58px';   /* רוחב עמודת שבוע */

    html += '<table style="width:100%;border-collapse:separate;border-spacing:3px;'
      + 'margin-bottom:18px;">';

    /* שורת כותרת ימים */
    html += '<tr>';
    /* תא ריק מעל עמודת השבוע */
    html += '<th style="width:'+ WK_W +';height:'+ HDR_H +';"></th>';

    DAY_LABELS.forEach(function(day, idx){
      var isFri = idx === 5, isSat = idx === 6, isRest = isFri || isSat;
      /* ימי עבודה: אפור בהיר + נייבי | ימי מנוחה: אפור כהה + אפור */
      var bg    = isRest ? restBg : light;
      var color = isRest ? '#94a3b8' : navy;
      var fw    = isRest ? '600' : '800';
      html += '<th style="height:'+ HDR_H +';background:'+ bg +';border-radius:7px 7px 0 0;'
        + ff +'font-size:12px;font-weight:'+ fw +';color:'+ color +';text-align:center;">'
        + day +'</th>';
    });
    html += '</tr>';

    /* שורות שבועות */
    WEEKS.forEach(function(week){
      html += '<tr>';

      /* תווית שבוע — כפתור קטן מעוגל, ללא writing-mode */
      html += '<td style="width:'+ WK_W +';height:'+ ROW_H +';background:'+ navy +';'
        + 'border-radius:7px;text-align:center;vertical-align:middle;padding:6px 4px;">'
        + '<div style="'+ ff +'font-size:10px;font-weight:900;color:'+ gold
        + ';line-height:1.4;white-space:nowrap;">'
        + week.label.replace(' ','<br>') +'</div>'
        + '</td>';

      /* 7 ימים */
      week.tasks.forEach(function(task, idx){
        var isFri = idx === 5, isSat = idx === 6, isRest = isFri || isSat;

        if (isRest){
          html += '<td style="height:'+ ROW_H +';background:'+ restBg +';'
            + 'border-radius:0 0 7px 7px;text-align:center;vertical-align:middle;">'
            + '<div style="'+ ff +'font-size:10px;color:#94a3b8;font-weight:600;">'
            + (isSat ? 'שבת שלום' : 'יום מנוחה')
            + '</div></td>';
        } else if (task){
          html += '<td style="height:'+ ROW_H +';background:'+ navy +';'
            + 'border-radius:0 0 7px 7px;padding:9px 8px 7px;vertical-align:top;'
            + 'box-sizing:border-box;">'
            + '<div style="'+ ff +'font-size:9.5px;font-weight:800;color:'+ gold
            + ';line-height:1.38;word-break:break-word;">'
            + task.label +'</div>'
            + '</td>';
        } else {
          html += '<td style="height:'+ ROW_H +';background:'+ light
            + ';border-radius:0 0 7px 7px;"></td>';
        }
      });

      html += '</tr>';
    });

    html += '</table>';

    /* ── מקרא ── */
    html +=
      '<div style="display:flex;gap:16px;align-items:center;margin-bottom:22px;'
      + 'padding:8px 14px;background:'+ light +';border-radius:8px;flex-wrap:wrap;">'
      + '<div style="display:flex;align-items:center;gap:7px;">'
      + '<div style="width:12px;height:12px;background:'+ navy
      + ';border-radius:3px;flex-shrink:0;"></div>'
      + '<span style="'+ ff +'font-size:11px;color:#475569;font-weight:700;">משימה פעילה</span>'
      + '</div>'
      + '<div style="display:flex;align-items:center;gap:7px;">'
      + '<div style="width:12px;height:12px;background:'+ restBg
      + ';border:1px solid #cbd5e1;border-radius:3px;flex-shrink:0;"></div>'
      + '<span style="'+ ff +'font-size:11px;color:#475569;font-weight:700;">יום מנוחה</span>'
      + '</div>'
      + '<span style="'+ ff +'font-size:11px;color:#94a3b8;margin-right:auto;">'
      + '✓ סמנו כל משימה לאחר ביצוע</span>'
      + '</div>';

    /* ── כותרת פירוט ── */
    html +=
      '<div style="'+ ff +'text-align:center;margin:4px 0 16px;font-size:14px;'
      + 'font-weight:900;color:'+ navy +';border-top:1px solid #e2e8f0;padding-top:17px;">'
      + 'פירוט המשימות השבועיות</div>';

    /* ── כרטיסי פירוט ── */
    var taskIdx = 0;
    WEEKS.forEach(function(week, wi){
      html +=
        '<div style="'+ ff +'font-size:12px;font-weight:900;color:'+ gold
        + ';letter-spacing:.8px;margin:'
        + (wi === 0 ? '0' : '16px') +' 0 8px;padding-bottom:4px;'
        + 'border-bottom:1px solid rgba(249,185,21,.3);">'
        + week.label +'</div>';

      week.tasks.forEach(function(task, di){
        if (!task) return;
        var bg = (taskIdx % 2 === 0) ? lighter : '#ffffff';
        taskIdx++;

        html +=
          '<div class="tip-card" style="margin-bottom:9px;padding:11px 15px 10px;'
          + 'background:'+ bg +';border-radius:9px;border-right:4px solid '+ gold +';">'
          + '<div style="display:flex;align-items:flex-start;gap:11px;">'
          + '<div style="'+ ff +'min-width:62px;font-size:11px;font-weight:800;'
          + 'color:#64748b;margin-top:1px;white-space:nowrap;">'
          + DAY_LABELS[di] +'</div>'
          + '<div>'
          + '<div style="'+ ff +'font-size:14px;font-weight:800;color:'+ navy
          + ';margin-bottom:3px;">'+ task.label +'</div>'
          + '<div style="'+ ff +'font-size:12.5px;color:'+ slate +';line-height:1.68;">'
          + task.desc +'</div>'
          + '</div></div></div>';
      });
    });

    /* ── Footer ── */
    html +=
      '<div style="margin-top:22px;padding:16px 22px;background:'+ light +';'
      + 'border-radius:10px;border-top:2px solid '+ gold +';text-align:center;">'
      + '<div style="'+ ff +'font-size:15px;font-weight:900;color:'+ navy
      + ';margin-bottom:5px;">בצעו את המשימות בעקביות — וצפו בדירוג שלכם עולה!</div>'
      + '<div style="'+ ff +'font-size:12px;color:#64748b;line-height:1.6;">'
      + '5 משימות בשבוע = 20 פעולות שיווקיות לחודש.</div>'
      + '</div>'
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
     Smart page-break + PDF
  ═══════════════════════════════════════ */
  function generatePDF(btn){
    document.fonts.ready.then(function(){

      var wrap = document.createElement('div');
      wrap.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-100;width:794px;';
      wrap.innerHTML = buildTemplate();
      document.body.appendChild(wrap);

      var cards    = wrap.querySelectorAll('.tip-card');
      var wrapTop  = wrap.getBoundingClientRect().top;
      var cardRects = [];
      Array.prototype.forEach.call(cards, function(card){
        var r = card.getBoundingClientRect();
        cardRects.push({ top: r.top - wrapTop, bottom: r.bottom - wrapTop });
      });

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

        var pageHPx = pageH / ratio;
        var slices  = [];
        var cur     = 0;

        while (cur < imgH){
          var ideal = cur + pageHPx;
          if (ideal >= imgH){ slices.push({ s:cur, e:imgH }); break; }
          var cutAt = ideal;
          for (var i = 0; i < cardsPx.length; i++){
            var c = cardsPx[i];
            if (c.top < ideal && c.bottom > ideal){ cutAt = c.top - 6; break; }
          }
          if (cutAt <= cur) cutAt = ideal;
          slices.push({ s:cur, e:cutAt });
          cur = cutAt;
        }

        slices.forEach(function(sl, idx){
          if (idx > 0) pdf.addPage();
          var srcH = Math.round(sl.e - sl.s);
          if (srcH <= 0) return;
          var slice = document.createElement('canvas');
          slice.width = imgW; slice.height = srcH;
          var sCtx = slice.getContext('2d');
          sCtx.fillStyle = '#ffffff'; sCtx.fillRect(0,0,imgW,srcH);
          sCtx.drawImage(canvas, 0, Math.round(sl.s), imgW, srcH, 0, 0, imgW, srcH);
          pdf.addImage(slice.toDataURL('image/jpeg', 0.93), 'JPEG', 0, 0, pageW, srcH * ratio);
        });

        pdf.save('תוכנית-עבודה-שבועית-גוגל.pdf');

        if (btn){
          btn.textContent = '✅ הורד בהצלחה!';
          btn.disabled = false;
          setTimeout(function(){ btn.textContent = '📅 הורד את תוכנית העבודה השבועית'; }, 3000);
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
