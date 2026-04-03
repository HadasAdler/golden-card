/**
 * pdf-guide.js — מגנרטור PDF למדריך 30 הדרכים
 * html2canvas + jsPDF | תמיכה מלאה ב-RTL עברית
 * Smart page-break: כל בלוק מוגן מקטיעה בין דפים
 */
(function(){
  'use strict';

  var WA_NUM  = '052-4444468';
  var SCALE   = 1.8;

  /* ═══════════════════════════════════════
     30 הטיפים
  ═══════════════════════════════════════ */
  var TIPS = [
    {
      n:'01',
      title:'כתיבת פוסטים ייעודיים לבקשת המלצות',
      text:'פרסמו מדי פעם פוסטים ייעודיים שבהם אתם משתפים המלצה שקיבלתם ומזמינים לקוחות נוספים לכתוב גם. כאשר הבקשה מופיעה באופן פתוח ופומבי, היא מרגישה טבעית יותר ומעודדת אחרים להצטרף.'
    },
    {
      n:'02',
      title:'שיתוף בקבוצות רלוונטיות',
      text:'ניתן לשתף את הקישור גם בקבוצות רלוונטיות כמו קבוצות לקוחות, קהילות מקצועיות או קבוצות נטוורקינג. חשוב לעשות זאת בניסוח עדין ולא מכירתי, למשל: "מי שעבד איתי ויכול לפרגן במילה — אשמח מאוד." לעיתים דווקא בקבוצות מתקבלות המלצות איכותיות ומפורטות יותר.'
    },
    {
      n:'03',
      title:'פנייה לחברים ומשפחה',
      text:'מעבר לבניית בסיס התחלתי, גם בהמשך ניתן לפנות לחברים, בני משפחה ועמיתים שמכירים אתכם מקצועית ולבקש מהם המלצה. פעמים רבות אנשים רוצים לפרגן, אך פשוט לא חושבים על זה עד שמבקשים מהם באופן ישיר.'
    },
    {
      n:'04',
      title:'יצירת הרגל קבוע לבקשת המלצות',
      text:'אחת הטעויות הנפוצות היא לבקש המלצות באופן אקראי. הגדירו לעצמכם הרגל קבוע, למשל לפנות לשניים עד שלושה לקוחות ביום. עקביות היא מה שיוצר לאורך זמן כמות משמעותית של המלצות ומבדילה בין עסק ממוצע לעסק בולט.'
    },
    {
      n:'05',
      title:'קישור בתיאור הפרופיל ברשתות החברתיות',
      text:'תיאור הפרופיל הוא אחד המקומות הבודדים שבהם ניתן להוסיף קישור קבוע. הוסיפו קישור לכרטיס ההמלצות עם ניסוח ברור כמו: "כאן ממליצים עלינו", בביו שלכם בפייסבוק, באינסטגרם, בטוויטר או ברשתות נוספות שבהן אתם פעילים.'
    },
    {
      n:'06',
      title:'הודעת "הכנה למחויבות"',
      text:'אל תשלחו קישור להמלצה משום מקום. התחילו בהודעה קצרה: "היה לי לעונג לעבוד איתך. אני בתהליך שדרוג הנוכחות הדיגיטלית שלי, ואשמח אם תוכל לכתוב לי מילה על החוויה שלך" — ותוסיפו את הקישור לכרטיס. הגישה הזו מייצרת מחויבות מראש ומעלה משמעותית את הסיכוי לשיתוף פעולה.'
    },
    {
      n:'07',
      title:'חתימה קבועה בדואר האלקטרוני',
      text:'הדואר האלקטרוני הוא כלי עבודה יומיומי שפוגש לקוחות באופן קבוע. מומלץ להוסיף חתימה קבועה המזמינה להשאיר המלצה, למשל: "נהניתם מהשירות? נשמח לפרגון שלכם כאן" בצירוף קישור לכרטיס ההמלצות. פעולה פשוטה שיוצרת חשיפה מתמשכת ללא מאמץ נוסף.'
    },
    {
      n:'08',
      title:'ניצול הודעת תודה בוואטסאפ',
      text:'כאשר לקוח שולח הודעת תודה, זהו רגע אידיאלי לבקשת המלצה. ניתן לצלם את ההודעה, לשלוח אותה בחזרה ולכתוב: "זה כל כך שימח אותי, אכפת לך להעתיק את המילים האלו גם לכאן?" בצירוף קישור. כך חוסכים מהלקוח את הצורך לחשוב מה לכתוב.'
    },
    {
      n:'09',
      title:'הצבת קוד סריקה פיזי בנקודת המפגש',
      text:'בעסקים פיזיים, הרגע שבו הלקוח ממתין או משלם הוא רגע פנוי שבו הוא כבר עם הטלפון ביד. הדפיסו קוד סריקה והציבו אותו על הדלפק, ליד הקופה או באזור ההמתנה. זה הופך את פעולת ההמלצה לפשוטה ונגישה.'
    },
    {
      n:'10',
      title:'שיטת "הסיום החם" פנים אל פנים',
      text:'בקשה אישית היא אחת הדרכים האפקטיביות ביותר. בסיום שירות, כאשר הלקוח מרוצה, שאלו: "נהנית מהשירות?" לאחר תשובה חיובית, המשיכו באופן טבעי: "מעולה, זה ממש יעזור לי אם תוכל להקדיש כמה שניות לפרגן לי בגוגל, אני שולח לך קישור עכשיו."'
    },
    {
      n:'11',
      title:'הצגת המלצות קיימות כמעודדת פעולה',
      text:'לקוחות נוטים לפעול כאשר הם רואים שאחרים כבר עשו זאת. שתפו המלצה שקיבלתם והוסיפו משפט כמו: "אם גם לכם יש מילה טובה, אשמח לשמוע כאן." זה יוצר אפקט של הוכחה חברתית.'
    },
    {
      n:'12',
      title:'גיוס המעגל הראשון',
      text:'כדי לבנות בסיס ראשוני של המלצות, פנו לאנשים שמכירים אתכם מקצועית. שלחו הודעה אישית ובקשו מהם לכתוב מילה על החוויה שלהם אתכם. זה יוצר אמינות ראשונית לפרופיל.'
    },
    {
      n:'13',
      title:'שימוש בסטורי ברשתות',
      text:'הסטורי מאפשר הנעה לפעולה מהירה. העלו פעם בשבוע תוכן רלוונטי, הוסיפו קישור וכתבו: "אשמח לפרגון שלכם כאן." זו דרך פשוטה להזכיר ללקוחות להשאיר המלצה.'
    },
    {
      n:'14',
      title:'ניצול רגע פתיחת המוצר',
      text:'אם אתם מוכרים מוצרים פיזיים, רגע פתיחת האריזה הוא רגע רגשי. הוסיפו גלויה עם קוד סריקה וכיתוב: "תתחדשו! נשמח לשמוע איך היה." זה מחבר בין החוויה לבין הפעולה.'
    },
    {
      n:'15',
      title:'תגובה לכל המלצה',
      text:'בכל פעם שאתם מקבלים המלצה, הגיבו עליה תוך זמן קצר. זה גם משפר נראות בגוגל וגם משדר ללקוחות שאתם קשובים ומעריכים אותם.'
    },
    {
      n:'16',
      title:'פנייה ללקוחות עבר',
      text:'לקוחות מהעבר הם מקור מצוין להמלצות. שלחו הודעה בסגנון: "רציתי לבדוק שהכל בסדר ולשמוע איך הייתה החוויה שלך איתנו." לעיתים זה מספיק כדי לקבל המלצה.'
    },
    {
      n:'17',
      title:'סיום הרצאה או פגישה דיגיטלית',
      text:'בסיום הרצאה או זום, הציגו שקופית עם קוד סריקה וקריאה לפעולה: "נהניתם מהערך שקיבלתם? אשמח למילה טובה כאן." זה רגע שבו הקהל כבר מחובר וקשוב.'
    },
    {
      n:'18',
      title:'בקשת "מחמאה מתועדת"',
      text:'כאשר לקוח מחמיא לכם, אל תסתפקו בתודה. אפשר לומר: "זה ממש חשוב לי, אשלח לך קישור כדי שתוכל לכתוב את זה גם בגוגל." כך הופכים מחמאה רגעית לנכס דיגיטלי קבוע.'
    },
    {
      n:'19',
      title:'פנייה גם אחרי אינטראקציה קצרה',
      text:'שליחת הודעה אישית לא חייבת להיות שמורה רק לסיום שירות מלא. גם אחרי שיחת ייעוץ קצרה או מענה על שאלה, אפשר לשלוח: "שמחתי לעזור, ואם זה היה לך מועיל — אשמח ממש למילה כאן" בצירוף קישור. הרבה בעלי עסקים מפספסים את הרגעים הקטנים האלה, למרות שהם מייצרים לא מעט הזדמנויות.'
    },
    {
      n:'20',
      title:'שליחת תזכורת עדינה',
      text:'כאשר שולחים בקשה להמלצה ולא מתקבלת תגובה, לא כדאי לוותר מיד. תזכורת עדינה לאחר יום-יומיים יכולה לעשות את כל ההבדל. הודעה קצרה כמו "מקפיצה בעדינות 🙏 אם הסתדרת לכתוב, זה ממש יעזור לי" מגדילה משמעותית את אחוזי ההיענות, וברוב המקרים אינה נתפסת כלוחצת.'
    },
    {
      n:'21',
      title:'שליחת דוגמת ניסוח',
      text:'אחת הסיבות המרכזיות לכך שלקוחות לא כותבים המלצות היא חוסר ודאות לגבי מה לכתוב. כדי להקל עליהם, שלחו יחד עם הקישור גם התחלת משפט: "אם תרצה, אפשר לכתוב משהו כמו ׳השירות היה מקצועי, זמין ועזר לי ב...׳". פעולה פשוטה זו מורידה חסמים בצורה דרמטית.'
    },
    {
      n:'22',
      title:'הודעה קולית בוואטסאפ',
      text:'בוואטסאפ, לעיתים עדיף לשלוח הודעה קולית קצרה במקום טקסט כתוב. הודעה קולית נתפסת כאישית יותר, חמה יותר, וקשה הרבה יותר להתעלם ממנה. בקשה להמלצה שנאמרת בקול נשמעת טבעית ואותנטית יותר, ולכן גם מייצרת יותר תגובות.'
    },
    {
      n:'23',
      title:'זיהוי רגעי שיא רגשיים',
      text:'חשוב לזהות את רגעי השיא הרגשיים של הלקוח — לא רק בסיום השירות, אלא דווקא ברגע שבו הלקוח מרגיש הצלחה: כאשר נסגרה עסקה, הושגה תוצאה או התקבל ערך משמעותי. ברגעים כאלה הלקוח הרבה יותר פתוח לפרגן.'
    },
    {
      n:'24',
      title:'שילוב הבקשה בתהליך קיים',
      text:'דרך נוספת לייצר יותר המלצות היא לשלב את הבקשה בתוך תהליך קיים, במקום לייצר פעולה נפרדת. לאחר שליחת קובץ, סיכום פגישה או תוצר — הוסיפו שורה קצרה בסיום ההודעה: "ואם זה היה מועיל — אשמח למילה כאן". כך הבקשה נטמעת באופן טבעי בתוך התקשורת.'
    },
    {
      n:'25',
      title:'ניסוח "הקישור האישי שלי" ושימוש בהומור',
      text:'גם לאופן שבו מציגים את הקישור יש משמעות. כאשר שולחים קישור עם ניסוח כמו "זה הקישור האישי שלי להמלצות", נוצרת תחושת שייכות ומחויבות גבוהה יותר. בנוסף, לעיתים שימוש בהומור יכול להפוך את הבקשה לנעימה — משפט כמו "אם הייתי בסדר — זה המקום לפרגן 😄" מוריד התנגדות ומרגיש פחות רשמי.'
    },
    {
      n:'26',
      title:'יצירת "רגע טקסי" קבוע',
      text:'אפשר ליצור בעסק סוג של "רגע טקסי" קבוע. למשל, לומר ללקוחות: "יש לנו מסורת קטנה — מי שמרוצה משאיר משפט בגוגל". כאשר זה מוצג כחלק טבעי מהתהליך, זה מרגיש פחות כמו בקשה ויותר כמו נורמה.'
    },
    {
      n:'27',
      title:'שליחה עם הוכחה חברתית בזמן אמת',
      text:'חיזוק נוסף מגיע משימוש בהוכחה חברתית. שליחת הקישור יחד עם צילום מסך של המלצות קיימות מעניקה ללקוח ביטחון ומעודדת אותו להצטרף לאחרים שכבר כתבו.'
    },
    {
      n:'28',
      title:'שימוש בסקר ראשוני',
      text:'שאלו את הלקוח "מאחד עד עשר, כמה היית מרוצה?", ולאחר מכן פנו רק למי שענה ציון גבוה ובקשו ממנו המלצה. כך מתמקדים בלקוחות עם סיכוי גבוה יותר לכתוב ביקורת חיובית.'
    },
    {
      n:'29',
      title:'הפיכת האיסוף ליעד משותף',
      text:'ניתן להפוך את כל התהליך למשחק קטן או יעד משותף. למשל: "אני בדרך ל-50 המלצות החודש". כאשר אנשים מרגישים שהם עוזרים להגיע ליעד, הם נוטים יותר לשתף פעולה.'
    },
    {
      n:'30',
      title:'בקשת המלצה ברגע החידוש או הרכישה החוזרת',
      text:'לקוח שחוזר הוא לקוח מרוצה, ולכן זהו רגע מצוין לבקשת המלצה. כאשר לקוח מחדש מנוי, מבצע הזמנה חוזרת או פונה לשירות נוסף, ניתן לכתוב: "שמח שחזרת. אם זה המקום המתאים לך, אשמח מאוד למילה בגוגל." לקוחות חוזרים יש להם גם מה לומר וגם מוטיבציה לפרגן.'
    }
  ];

  /* ═══════════════════════════════════════
     בניית ה-HTML לצילום
  ═══════════════════════════════════════ */
  function buildTemplate() {
    var navy    = '#0a192f';
    var gold    = '#f9b915';
    var slate   = '#374151';
    var light   = '#f1f5f9';
    var teal    = '#0e7490';
    var tealBg  = '#f0f9ff';
    var ff      = 'font-family:Heebo,Arial,sans-serif;';

    /* ── כותרת ראשית ── */
    var html =
      '<div style="'+ ff +'width:794px;background:#fff;direction:rtl;'
      + 'padding:52px 48px 44px;box-sizing:border-box;color:'+ navy +';">'

      // Header
      + '<div style="text-align:center;margin-bottom:32px;padding-bottom:24px;'
      + 'border-bottom:3px solid '+ gold +';">'
      + '<div style="'+ ff +'font-size:13px;font-weight:800;color:'+ gold +';'
      + 'letter-spacing:1.2px;margin-bottom:10px;">המדריך המעשי</div>'
      + '<div style="'+ ff +'font-size:26px;font-weight:900;color:'+ navy +';line-height:1.35;">'
      + '30 הדרכים והאסטרטגיות להזנקת<br>כמות ההמלצות שלכם בגוגל</div>'
      + '<div style="'+ ff +'font-size:13px;color:#64748b;margin-top:10px;font-weight:500;">'
      + 'כל הטכניקות, הניסוחים והאסטרטגיות — במסמך אחד</div>'
      + '</div>';

    /* ── הקדמה ── */
    html +=
      '<div class="tip-card" style="margin-bottom:18px;padding:18px 20px 16px;'
      + 'background:'+ tealBg +';border-radius:10px;border-right:4px solid '+ teal +';">'
      + '<div style="'+ ff +'font-size:15px;font-weight:900;color:'+ teal +';margin-bottom:10px;">'
      + 'ברכות על הצטרפותכם לערכת הפרימיום לניהול מוניטין בגוגל!</div>'
      + '<div style="'+ ff +'font-size:13px;color:#1e3a5f;line-height:1.75;margin-bottom:12px;">'
      + 'הצעד הראשון והחשוב ביותר לקידום העסק שלכם במנועי החיפוש הוא איסוף המלצות איכותיות (5 כוכבים). '
      + 'ככל שיהיו לכם יותר המלצות עדכניות, כך גוגל ידרג אתכם גבוה יותר ויציג אתכם לפני המתחרים.</div>'
      + '<div style="'+ ff +'font-size:14px;font-weight:800;color:'+ navy +';margin-bottom:8px;">'
      + 'איך עובד כרטיס ההמלצות החכם שלכם?</div>'
      + '<div style="'+ ff +'font-size:13px;color:#1e3a5f;line-height:1.75;margin-bottom:12px;">'
      + 'במייל שקיבלתם מחכה לכם הקישור האישי לכרטיס ההמלצות הממותג שהכנו עבורכם. '
      + 'המטרה שלכם היא להפיץ את הקישור הזה בכל נקודת מפגש עם הלקוח.</div>'
      + '<div style="'+ ff +'font-size:13px;font-weight:800;color:'+ teal +';margin-bottom:6px;">שימו לב למנגנון הסינון החכם:</div>'
      + '<div style="'+ ff +'font-size:13px;color:#1e3a5f;line-height:1.8;">'
      + '<span style="color:#16a34a;font-weight:800;">&#x2705; 4–5 כוכבים</span> — הלקוח יועבר אוטומטית לדף כתיבת ההמלצה הרשמי בגוגל.<br>'
      + '<span style="color:#dc2626;font-weight:800;">&#x26A0;&#xFE0F; 1–3 כוכבים</span> — הלקוח ישאר בכרטיס ויועבר לטופס פנימי שבו יוכל לכתוב לכם מה לא היה כשורה. '
      + 'כך תוכלו לטפל בתלונה באופן אישי, מבלי שהדירוג השלילי יפורסם בגוגל ויפגע במוניטין שלכם.'
      + '</div>'
      + '</div>';

    /* ── כותרת חלק המהלכים ── */
    html +=
      '<div style="'+ ff +'text-align:center;margin:22px 0 18px;font-size:16px;font-weight:900;'
      + 'color:'+ navy +';border-top:1px solid #e2e8f0;padding-top:20px;">'
      + 'להלן 30 הדרכים והאסטרטגיות להפצת הכרטיס והזנקת כמות ההמלצות שלכם:</div>';

    /* ── 30 הטיפים ── */
    TIPS.forEach(function(t, i){
      var bg = (i % 2 === 0) ? light : '#ffffff';
      html +=
        '<div class="tip-card" style="margin-bottom:13px;padding:14px 17px 12px;'
        + 'background:'+ bg +';border-radius:10px;border-right:4px solid '+ gold +';">'
        + '<div style="display:flex;align-items:flex-start;gap:12px;">'
        + '<div style="'+ ff +'min-width:30px;height:30px;border-radius:50%;'
        + 'background:'+ navy +';color:'+ gold +';display:flex;align-items:center;'
        + 'justify-content:center;font-size:12px;font-weight:900;flex-shrink:0;margin-top:2px;">'
        + t.n +'</div>'
        + '<div>'
        + '<div style="'+ ff +'font-size:15px;font-weight:800;color:'+ navy +';margin-bottom:5px;">'
        + t.title +'</div>'
        + '<div style="'+ ff +'font-size:13px;color:'+ slate +';line-height:1.72;">'
        + t.text +'</div>'
        + '</div></div></div>';
    });

    /* ── Footer — CTA נקי + קרדיט ── */
    html +=
      '<div style="margin-top:26px;padding:20px 24px;'
      + 'background:'+ light +';border-radius:12px;border-top:3px solid '+ gold +';'
      + 'text-align:center;">'
      + '<div style="'+ ff +'font-size:16px;font-weight:900;color:'+ navy +';margin-bottom:8px;">'
      + 'התחילו ליישם — ותראו תוצאות תוך שבוע!</div>'
      + '<div style="'+ ff +'font-size:13px;color:#64748b;line-height:1.65;margin-bottom:8px;">'
      + 'בחרו 3–5 שיטות שנראות לכם הכי קלות ליישום, ונסו אותן השבוע.</div>'
      + '<div style="'+ ff +'font-size:13px;font-weight:700;color:'+ navy +';">'
      + 'שאלות? נשמח לעזור &nbsp;·&nbsp; 💬 ' + WA_NUM + '</div>'
      + '</div>'

      // קרדיט תחתית
      + '<div style="'+ ff +'text-align:center;margin-top:16px;'
      + 'font-size:11px;color:#94a3b8;font-weight:500;">'
      + 'מסמך זה הוכן ע"י הדס אדלר</div>'

      + '</div>'; // /wrapper

    return html;
  }

  /* ═══════════════════════════════════════
     טעינת סקריפט חיצוני
  ═══════════════════════════════════════ */
  function loadScript(src, cb) {
    if (document.querySelector('script[src="'+ src +'"]')) { cb(); return; }
    var s = document.createElement('script');
    s.src = src;
    s.onload = cb;
    s.onerror = function(){ alert('שגיאה בטעינת ספרייה. בדקו חיבור אינטרנט.'); };
    document.head.appendChild(s);
  }

  /* ═══════════════════════════════════════
     יצירת ה-PDF עם smart page-break
  ═══════════════════════════════════════ */
  function generatePDF(btn) {
    document.fonts.ready.then(function(){

      /* 1. הוסף template ל-DOM מחוץ למסך */
      var wrap = document.createElement('div');
      wrap.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-100;width:794px;';
      wrap.innerHTML = buildTemplate();
      document.body.appendChild(wrap);

      /* 2. מדוד מיקום כל בלוק tip-card לפני הצילום */
      var cards   = wrap.querySelectorAll('.tip-card');
      var wrapTop = wrap.getBoundingClientRect().top;
      var cardRects = [];
      Array.prototype.forEach.call(cards, function(card){
        var r = card.getBoundingClientRect();
        cardRects.push({ top: r.top - wrapTop, bottom: r.bottom - wrapTop });
      });

      /* 3. צלם עם html2canvas */
      window.html2canvas(wrap.firstElementChild, {
        scale:           SCALE,
        useCORS:         true,
        backgroundColor: '#ffffff',
        logging:         false,
        allowTaint:      true
      }).then(function(canvas){
        document.body.removeChild(wrap);

        var jsPDF  = window.jspdf.jsPDF;
        var pdf    = new jsPDF({ orientation:'portrait', unit:'pt', format:'a4' });
        var pageW  = pdf.internal.pageSize.getWidth();
        var pageH  = pdf.internal.pageSize.getHeight();
        var imgW   = canvas.width;
        var imgH   = canvas.height;
        var ratio  = pageW / imgW;

        /* המרת מיקומים ל-canvas pixels */
        var cardsPx = cardRects.map(function(r){
          return { top: r.top * SCALE, bottom: r.bottom * SCALE };
        });

        /* 4. חשב גבולות דפים — הימנע מקטיעת בלוקים */
        var pageHPx = pageH / ratio;
        var slices  = [];
        var cur     = 0;

        while (cur < imgH) {
          var ideal = cur + pageHPx;
          if (ideal >= imgH) { slices.push({ s: cur, e: imgH }); break; }

          var cutAt = ideal;
          for (var i = 0; i < cardsPx.length; i++) {
            var c = cardsPx[i];
            if (c.top < ideal && c.bottom > ideal) {
              cutAt = c.top - 6; // מרווח קטן מעל הבלוק
              break;
            }
          }
          if (cutAt <= cur) cutAt = ideal; // כרטיס גדול מדף — קצץ בלית ברירה

          slices.push({ s: cur, e: cutAt });
          cur = cutAt;
        }

        /* 5. רנדר כל פרוסה ל-JPEG ← PDF */
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

          var imgData = slice.toDataURL('image/jpeg', 0.93);
          pdf.addImage(imgData, 'JPEG', 0, 0, pageW, srcH * ratio);
        });

        pdf.save('מדריך-30-דרכים-המלצות-גוגל.pdf');

        if (btn){
          btn.textContent = '✅ הורד בהצלחה!';
          btn.disabled = false;
          setTimeout(function(){ btn.textContent = '📥 הורד את המדריך המלא'; }, 3000);
        }

      }).catch(function(err){
        console.error('[pdf-guide]', err);
        if (btn){ btn.textContent = '❌ שגיאה — נסו שנית'; btn.disabled = false; }
        if (document.body.contains(wrap)) document.body.removeChild(wrap);
      });
    });
  }

  /* ═══════════════════════════════════════
     נקודת כניסה ציבורית
  ═══════════════════════════════════════ */
  window.downloadGuide = function(){
    var btn = document.getElementById('guideDownloadBtn');
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
