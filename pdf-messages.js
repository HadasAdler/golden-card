/**
 * pdf-messages.js — בנק הודעות וואטסאפ PDF
 * 20 נוסחים לבקשת המלצה | RTL עברית
 * html2canvas + jsPDF | Smart page-break
 */
(function(){
  'use strict';

  var SCALE = 1.8;
  var BRAND = 'המלצות לקידום פרופיל העסק בגוגל | נבנה ע"י הדס אדלר';

  /* ═══════════════════════════════════════
     20 נוסחים מחולקים לקטגוריות
  ═══════════════════════════════════════ */
  var CATEGORIES = [
    {
      title: 'הסגנון החברי (Low-Touch)',
      icon: '😊',
      messages: [
        { num: 1, text: 'היי [שם הלקוח], היה לי ממש כיף לעבוד איתך! אם ייצא לך לפרגן לי במילה בקישור הזה, זה יעזור לי בטירוף: [קישור]' },
        { num: 2, text: 'אהלן [שם], מה שלומך? אשמח ממש אם תוכל/י להקדיש 20 שניות לכתוב לי מילה טובה בגוגל. הנה הלינק: [קישור]' },
        { num: 3, text: 'היי [שם], רק רציתי להגיד שוב תודה על האמון. אם בא לך לפרגן לי בחזרה, אשמח להמלצה קטנה כאן: [קישור]' }
      ]
    },
    {
      title: 'הסגנון המקצועי / רשמי',
      icon: '💼',
      messages: [
        { num: 4, text: 'שלום [שם], שמחנו לראות שהשירות הסתיים לשביעות רצונך. נשמח מאוד אם תסכים/י לשתף את החוויה שלך בקישור הבא: [קישור]' },
        { num: 5, text: 'שלום [שם], אנו משקיעים רבות בשיפור חוויית הלקוח שלנו. נשמח אם תסייע/י לנו ותכתוב/י חוות דעת קצרה בגוגל: [קישור]' }
      ]
    },
    {
      title: 'סגנון "יעד משותף" (שמניע לפעולה)',
      icon: '🎯',
      messages: [
        { num: 6, text: 'היי [שם], שמתי לי למטרה להגיע ל-50 המלצות החודש. אשמח מאוד אם תעזור/י לי להגיע ליעד בקישור המצורף: [קישור]' },
        { num: 7, text: 'אהלן [שם], אנחנו בתנופה של צמיחה בגוגל! יעזור לי מאוד אם תוכל/י להצטרף לממליצים שלנו כאן: [קישור]' }
      ]
    },
    {
      title: 'סגנון "הכנה למחויבות" (ששאלת קודם)',
      icon: '🤝',
      messages: [
        { num: 8, text: '[שם], היה לי לעונג לעבוד איתך. אני משדרג את הנוכחות הדיגיטלית שלי, אשמח אם תוכל/י לעזור לי במילה על החוויה שלך? (אם הלקוח עונה כן, שלחו: מעולה, הנה הקישור: [קישור])' }
      ]
    },
    {
      title: 'סגנון "האסיסטנטית" (מעולה לעורכי דין / רופאים)',
      icon: '📋',
      messages: [
        { num: 9, text: 'שלום [שם], כאן המשרד של [שם העסק]. אנו עורכים משאל קצר בקרב לקוחותינו, ונשמח מאוד אם תכתוב/י מילה על השירות שקיבלת: [קישור]' },
        { num: 10, text: 'היי [שם], כאן [שם המזכירה] מהמשרד של [שם בעל העסק]. אשמח אם תוכל/י להקדיש דקה לפרגון קטן בקישור הבא: [קישור]' }
      ]
    },
    {
      title: 'סגנון ה"תודה על התודה" (כשכבר קיבלתם מחמאה)',
      icon: '💛',
      messages: [
        { num: 11, text: 'וואו [שם], איזה כיף לקרוא את המילים האלה! אכפת לך להעתיק אותן גם לגוגל? זה ממש יעזור לי: [קישור]' },
        { num: 12, text: 'המחמאה שלך עשתה לי את היום! אשמח אם תסכים/י לשתף אותה גם כאן כדי שכולם יראו: [קישור]' }
      ]
    },
    {
      title: 'סגנון התזכורת העדינה',
      icon: '🔔',
      messages: [
        { num: 13, text: 'היי [שם], רק מקפיץ בעדינות 🙏 אשמח מאוד אם ייצא לך להמליץ בקישור ששלחתי. תודה מראש!' },
        { num: 14, text: 'שלום [שם], בטח הלכת לאיבוד בין כל ההודעות... רק מזכיר/ה לגבי ההמלצה בגוגל. הנה הלינק שוב: [קישור]' }
      ]
    },
    {
      title: 'סגנון "העסק הקטן" (פונה לרגש)',
      icon: '❤️',
      messages: [
        { num: 15, text: 'היי [שם], בתור עסק קטן, כל המלצה שלך היא כמו זהב עבורי. אשמח אם תפרגן/י לי כאן: [קישור]' },
        { num: 16, text: 'אהלן [שם], הדירוג בגוגל משפיע עלינו מאוד. נשמח מאוד למילה טובה ממך בקישור המצורף: [קישור]' }
      ]
    },
    {
      title: 'סגנון ההומור (מתאים לעסקים קלילים)',
      icon: '😄',
      messages: [
        { num: 17, text: 'היי [שם], אם היית מרוצה — זה הלינק להמלצה [קישור]. אם לא — בוא נדבר בוואטסאפ 😄' },
        { num: 18, text: 'מבטיח/ה שזה הקישור הכי משתלם שתלחץ/י עליו היום 😉 המלצה קטנה כאן תעזור לי המון: [קישור]' }
      ]
    },
    {
      title: 'סגנון ה"ביו" והסטטוס',
      icon: '📱',
      messages: [
        { num: 19, text: 'נהניתם מהשירות? נשמח לשמוע על זה! לחצו כאן לדירוג מהיר: [קישור]' },
        { num: 20, text: 'משדרגים את המוניטין שלנו! מוזמנים להצטרף למאות הממליצים בקישור הבא: [קישור]' }
      ]
    }
  ];

  /* ═══════════════════════════════════════
     בניית ה-HTML לצילום
  ═══════════════════════════════════════ */
  function buildTemplate(){
    var navy  = '#0a192f';
    var gold  = '#f9b915';
    var light = '#f1f5f9';
    var ff    = 'font-family:Heebo,Arial,sans-serif;';

    /* ── עטיפה ── */
    var html =
      '<div style="'+ ff +'width:794px;background:#fff;direction:rtl;'
      + 'padding:38px 36px 40px;box-sizing:border-box;color:'+ navy +';">';

    /* ── כותרת ראשית ── */
    html +=
      '<div style="text-align:center;margin-bottom:24px;padding-bottom:20px;'
      + 'border-bottom:3px solid '+ gold +';">'
      + '<div style="'+ ff +'font-size:11px;font-weight:800;color:'+ gold
      + ';letter-spacing:1.2px;margin-bottom:8px;">בנק הודעות</div>'
      + '<div style="'+ ff +'font-size:22px;font-weight:900;color:'+ navy
      + ';line-height:1.35;">בנק הודעות הווטסאפ<br>נוסחים מנצחים לבקשת המלצה</div>'
      + '</div>';

    /* ── הקדמה ── */
    html +=
      '<div style="background:rgba(249,185,21,.08);border-right:4px solid '+ gold +';'
      + 'border-radius:10px;padding:16px 20px;margin-bottom:26px;">'
      + '<div style="'+ ff +'font-size:14.5px;color:#1e3a5f;font-weight:600;line-height:1.75;">'
      + 'כדי להקל עליכם את העבודה, הכנו עבורכם 20 נוסחים שונים לבקשת המלצה בוואטסאפ. '
      + 'כל מה שעליכם לעשות הוא לבחור את הסגנון שמתאים לכם, '
      + 'להעתיק, להדביק את הקישור האישי שלכם ולשלוח.'
      + '</div></div>';

    /* ── קטגוריות ── */
    CATEGORIES.forEach(function(cat){
      /* כותרת קטגוריה */
      html +=
        '<div class="tip-card" style="margin-bottom:16px;">'
        + '<div style="'+ ff +'font-size:13px;font-weight:900;color:'+ gold
        + ';letter-spacing:.6px;margin-bottom:10px;padding-bottom:8px;'
        + 'border-bottom:1.5px solid rgba(249,185,21,.3);display:flex;align-items:center;gap:8px;">'
        + '<span style="font-size:15px;">'+ cat.icon +'</span>'
        + '<span>'+ cat.title +'</span>'
        + '</div>';

      /* הודעות בתוך הקטגוריה */
      cat.messages.forEach(function(msg){
        html +=
          '<div style="display:flex;gap:12px;align-items:flex-start;'
          + 'margin-bottom:10px;padding:14px 16px;'
          + 'background:'+ light +';border-radius:10px;'
          + 'border:1.5px solid #e2e8f0;">'
          /* מספר */
          + '<div style="'+ ff +'min-width:26px;height:26px;background:'+ navy +';'
          + 'border-radius:50%;display:flex;align-items:center;justify-content:center;'
          + 'font-size:11px;font-weight:900;color:'+ gold +';flex-shrink:0;margin-top:1px;">'
          + msg.num +'</div>'
          /* טקסט */
          + '<div style="'+ ff +'font-size:13.5px;color:#1e3a5f;line-height:1.72;font-weight:500;">'
          + msg.text
          + '</div>'
          + '</div>';
      });

      html += '</div>'; /* /tip-card */
    });

    /* ── Footer ── */
    html +=
      '<div style="margin-top:22px;padding:16px 22px;background:'+ light +';'
      + 'border-radius:10px;border-top:2px solid '+ gold +';text-align:center;">'
      + '<div style="'+ ff +'font-size:15px;font-weight:900;color:'+ navy
      + ';margin-bottom:5px;">בחרו את הסגנון שלכם — והתחילו לשלוח!</div>'
      + '<div style="'+ ff +'font-size:12px;color:#64748b;line-height:1.6;">'
      + 'טיפ: החליפו את [שם] ו-[קישור] לפני השליחה. עקביות היא המפתח.</div>'
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

        pdf.save('בנק-הודעות-וואטסאפ-המלצות.pdf');

        if (btn){
          btn.textContent = '✅ הורד בהצלחה!';
          btn.disabled = false;
          setTimeout(function(){ btn.textContent = '💬 הורד את בנק הודעות הווטסאפ'; }, 3000);
        }

      }).catch(function(err){
        console.error('[pdf-messages]', err);
        if (btn){ btn.textContent = '❌ שגיאה — נסו שנית'; btn.disabled = false; }
        if (document.body.contains(wrap)) document.body.removeChild(wrap);
      });
    });
  }

  /* ═══════════════════════════════════════
     נקודת כניסה ציבורית
  ═══════════════════════════════════════ */
  window.downloadMessages = function(){
    var btn = document.getElementById('messagesDownloadBtn');
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
