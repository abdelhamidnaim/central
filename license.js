/* ═══════════════════════════════════════════════
   🔧 Space Naim — ملف الفحص المركزي (license.js) — v4
   هذا الملف لا يُنسخ إلى أي موقع إطلاقاً.
   يعيش في مكان واحد فقط: المستودع المركزي على GitHub Pages.
   كل المواقع تستدعيه مباشرة عبر رابط واحد، بدون أي نسخ محلية.
   ═══════════════════════════════════════════════ */
(function () {
  // ⬇️ رابط GitHub Pages للمستودع المركزي (عدّله هنا فقط إن غيّرت المستودع)
  var BASE_URL = "https://abdelhamidnaim.github.io/central";

  var CONFIG_URL      = BASE_URL + "/stores.json";
  var SUSPENDED_PAGE  = BASE_URL + "/suspended.html";
  var DEFAULT_WHATSAPP = "212687155245";
  var MAX_WAIT_MS = 3000; // أقصى مدة انتظار قبل إظهار الموقع تلقائياً (شبكة أمان)

  // ─────────────────────────────────────────────
  // تحديد "مفتاح" الموقع الذي يُبحث عنه في stores.json
  // - إن كان الموقع على دومين خاص (naimmarket1.com) => المفتاح هو الدومين نفسه.
  // - إن كان الموقع لا يزال على رابط GitHub Pages مباشرة
  //   (مثل abdelhamidnaim.github.io/maison-lumiere/) => كل مواقعك تشترك
  //   بنفس الـ hostname (abdelhamidnaim.github.io)، فلا يكفي الدومين للتمييز.
  //   في هذه الحالة نستخدم اسم المستودع (أول جزء من المسار) كمفتاح بدلاً منه،
  //   مثل "maison-lumiere" أو "naim-site1".
  // ─────────────────────────────────────────────
  function resolveStoreKey() {
    var host = location.hostname.replace(/^www\./, '');

    if (/\.github\.io$/i.test(host)) {
      var segments = location.pathname.split('/').filter(Boolean);
      if (segments.length > 0) {
        return segments[0]; // اسم المستودع، مثل "maison-lumiere"
      }
    }
    return host; // دومين خاص، أو صفحة GitHub Pages جذرية بدون مسار فرعي
  }

  // 1) إخفاء الصفحة فوراً (قبل أي رسم/Paint) لمنع ظهور المتجر ولو للحظة قبل التحويل
  document.documentElement.style.visibility = 'hidden';

  var revealed = false;
  function reveal() {
    if (revealed) return;
    revealed = true;
    document.documentElement.style.visibility = 'visible';
  }

  // شبكة أمان: إن تأخر الفحص (شبكة بطيئة) أكثر من MAX_WAIT_MS، يظهر الموقع تلقائياً
  var safetyTimer = setTimeout(reveal, MAX_WAIT_MS);

  fetch(CONFIG_URL + "?t=" + Date.now())
    .then(function (r) { return r.json(); })
    .then(function (data) {
      clearTimeout(safetyTimer);
      var key   = resolveStoreKey();
      var store = data[key];

      if (store && store.status === 'suspended') {
        var wa = store.whatsapp || data._default_whatsapp || DEFAULT_WHATSAPP;
        var back = encodeURIComponent(location.href);
        location.replace(SUSPENDED_PAGE + "?wa=" + encodeURIComponent(wa) + "&back=" + back);
        // لا نستدعي reveal() هنا، الصفحة سيتم مغادرتها فوراً
      } else {
        // active أو المفتاح غير موجود بالملف => إظهار الموقع طبيعياً
        reveal();
      }
    })
    .catch(function () {
      clearTimeout(safetyTimer);
      reveal(); // فشل تحميل الملف (مشكلة شبكة) → إظهار الموقع افتراضياً (fail-open)
    });
})();
