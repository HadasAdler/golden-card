/* pdf-qr.js — A4 black-and-white QR PDF generator
   Depends on: jsPDF, html2canvas, qrcodejs (loaded on demand)
   Exports: window.downloadQR(bizName, reviewLink)
*/
(function () {
  'use strict';

  var BRAND = 'המלצות לקידום פרופיל העסק בגוגל | נבנה ע"י הדס אדלר';

  /* ── Lazy script loader ── */
  function loadScript(src, cb) {
    if (document.querySelector('script[src="' + src + '"]')) { cb(); return; }
    var s = document.createElement('script');
    s.src     = src;
    s.onload  = cb;
    s.onerror = function () { alert('שגיאה בטעינת ספרייה חיצונית. בדוק חיבור לאינטרנט.'); };
    document.head.appendChild(s);
  }

  /* ── HTML template for the A4 page (794px wide = A4 @96dpi) ── */
  function buildPageHTML(bizName, qrDataUrl) {
    return (
      '<div style="' +
        'font-family:Arial,sans-serif;' +
        'width:794px;min-height:1123px;' +
        'background:#ffffff;color:#000000;' +
        'direction:rtl;' +
        'padding:70px 64px 56px;' +
        'box-sizing:border-box;' +
        'display:flex;flex-direction:column;align-items:center;' +
      '">' +

      /* Top rule */
      '<div style="width:100%;height:4px;background:#000;margin-bottom:32px;"></div>' +

      /* Business name */
      '<div style="' +
        'font-size:28px;font-weight:900;color:#000;' +
        'text-align:center;line-height:1.35;margin-bottom:10px;' +
      '">' + esc(bizName) + '</div>' +

      /* Sub-rule */
      '<div style="width:100%;height:2px;background:#000;margin-bottom:52px;"></div>' +

      /* Call-to-action above QR */
      '<div style="' +
        'font-size:20px;font-weight:700;color:#000;' +
        'text-align:center;margin-bottom:28px;line-height:1.4;' +
      '">סרקו עכשיו וכתבו לנו המלצה בגוגל</div>' +

      /* QR image */
      '<img src="' + qrDataUrl + '" style="' +
        'width:320px;height:320px;' +
        'border:4px solid #000;padding:18px;' +
        'image-rendering:pixelated;' +
        'background:#fff;' +
      '" />' +

      /* Stars */
      '<div style="font-size:42px;margin-top:28px;letter-spacing:4px;">⭐⭐⭐⭐⭐</div>' +

      /* Sub-caption */
      '<div style="' +
        'font-size:18px;font-weight:600;color:#333;' +
        'text-align:center;margin-top:18px;line-height:1.5;' +
      '">לוקח פחות מ-30 שניות — נשמח מאוד!</div>' +

      /* Spacer */
      '<div style="flex:1;"></div>' +

      /* Bottom divider */
      '<div style="width:100%;height:1px;background:#aaa;margin-top:44px;margin-bottom:14px;"></div>' +

      /* Brand footer */
      '<div style="font-size:11px;color:#999;text-align:center;">' + esc(BRAND) + '</div>' +

      '</div>'
    );
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── Core generator ── */
  function generateQRPDF(bizName, reviewLink, btn) {

    /* 1. Generate QR canvas off-screen */
    var qrHolder = document.createElement('div');
    qrHolder.style.cssText = 'position:fixed;left:-9999px;top:0;width:400px;height:400px;background:#fff;';
    document.body.appendChild(qrHolder);

    /* eslint-disable no-new */
    new QRCode(qrHolder, {
      text         : reviewLink,
      width        : 400,
      height       : 400,
      colorDark    : '#000000',
      colorLight   : '#ffffff',
      correctLevel : QRCode.CorrectLevel.H
    });

    /* qrcodejs renders asynchronously via a short timeout */
    setTimeout(function () {
      var qrCanvas  = qrHolder.querySelector('canvas');
      var qrDataUrl = qrCanvas ? qrCanvas.toDataURL('image/png') : '';
      document.body.removeChild(qrHolder);

      /* 2. Render A4 HTML template off-screen */
      var wrap = document.createElement('div');
      wrap.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;';
      wrap.innerHTML = buildPageHTML(bizName, qrDataUrl);
      document.body.appendChild(wrap);

      /* 3. Wait for fonts, then capture with html2canvas */
      (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () {
        window.html2canvas(wrap.firstElementChild, {
          scale          : 2,
          backgroundColor: '#ffffff',
          logging        : false,
          allowTaint     : true,
          useCORS        : true
        }).then(function (canvas) {
          document.body.removeChild(wrap);

          /* 4. Add to jsPDF */
          var jsPDF  = window.jspdf.jsPDF;
          var pdf    = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
          var pageW  = pdf.internal.pageSize.getWidth();
          var imgH   = canvas.height * (pageW / canvas.width);

          pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pageW, imgH);
          pdf.save('ערכת-QR-המלצות-גוגל.pdf');

          /* 5. Restore button */
          if (btn) {
            btn.textContent = '✅ הקובץ הורד!';
            btn.disabled    = false;
            setTimeout(function () {
              btn.textContent = '📥 הורד דף QR להדפסה (PDF)';
            }, 3000);
          }
        }).catch(function (err) {
          console.error('html2canvas error:', err);
          if (btn) { btn.textContent = '📥 הורד דף QR להדפסה (PDF)'; btn.disabled = false; }
        });
      });
    }, 350); /* give qrcodejs time to paint */
  }

  /* ── Public API ── */
  window.downloadQR = function (bizName, reviewLink) {
    var btn = document.getElementById('qrDownloadBtn');
    if (btn) { btn.textContent = '⏳ מכין קובץ PDF...'; btn.disabled = true; }

    loadScript(
      'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
      function () {
        loadScript(
          'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
          function () {
            loadScript(
              'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js',
              function () {
                generateQRPDF(bizName, reviewLink, btn);
              }
            );
          }
        );
      }
    );
  };

})();
