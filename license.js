/* ═══════════════════════════════════════════════
   🔧 Space Naim — ملف الفحص المركزي (license.js) — v4.1
   هذا الملف لا يُنسخ إلى أي موقع إطلاقاً.
   يعيش في مكان واحد فقط: المستودع المركزي على GitHub Pages.
   ═══════════════════════════════════════════════ */
(function () {
  var LICENSE_VERSION = "4.1.0";
  window.__spaceNaimLicenseVersion = LICENSE_VERSION; // للتحقق السريع من نسخة أي موقع عبر console

  // ⬇️ رابط GitHub Pages للمستودع المركزي (عدّله هنا فقط إن غيّرت المستودع)
  var BASE_URL = "https://abdelhamidnaim.github.io/central";

  var CONFIG_URL       = BASE_URL + "/stores.json";
  var SUSPENDED_PAGE   = BASE_URL + "/suspended.html";
  var DEFAULT_WHATSAPP = "212687155245";

  // هل يعمل الدومين غير المسجَّل بعد في stores.json بشكل طبيعي (true)،
  // أم يُعتبر موقوفاً حتى يُضاف صراحةً بحالة active (false)؟
  var ALLOW_UNLISTED_DOMAINS = true;

  // إعادة محاولة الفحص عند فشل الشبكة قبل اعتبار الأمر فشلاً نهائياً (Fail Closed)
  var MAX_ATTEMPTS   = 3;
  var RETRY_DELAY_MS = 1200;

  // إخفاء الصفحة فوراً (قبل أي رسم/Paint) — لا تُكشف إلا بعد تأكيد أن الموقع نشط
  document.documentElement.style.visibility = 'hidden';

  function reveal() {
    document.documentElement.style.visibility = 'visible';
  }

  // Fail Closed: إن تعذّر التحقق نهائياً، لا يُعرض محتوى الموقع الحقيقي إطلاقاً،
  // بل تظهر رسالة محايدة مع زر إعادة محاولة، بدل إظهار المتجر افتراضياً كما في v3.
  function showBlockedFallback() {
    function render() {
      document.body.innerHTML =
        '<div style="min-height:100vh;background:#0f172a;color:#fff;display:flex;' +
        'flex-direction:column;align-items:center;justify-content:center;text-align:center;' +
        'padding:24px;font-family:Cairo,Arial,sans-serif;">' +
          '<div style="font-size:56px;margin-bottom:16px;">⏳</div>' +
          '<h2 style="margin-bottom:10px;">يتعذر التحقق من حالة الموقع الآن</h2>' +
          '<p style="color:#94a3b8;max-width:340px;line-height:1.7;margin-bottom:20px;">' +
          'تأكد من اتصالك بالإنترنت ثم أعد المحاولة.</p>' +
          '<button onclick="location.reload()" style="background:#1a56db;color:#fff;border:none;' +
          'padding:12px 28px;border-radius:50px;font-weight:700;font-size:15px;cursor:pointer;">' +
          'إعادة المحاولة</button>' +
        '</div>';
      reveal();
    }
    if (document.body) render();
    else document.addEventListener('DOMContentLoaded', render);
  }

  function goSuspended(wa) {
    var back = encodeURIComponent(location.href);
    location.replace(SUSPENDED_PAGE + "?wa=" + encodeURIComponent(wa) + "&back=" + back);
  }

  function fetchConfig(attempt) {
    // تُقسَّم الأزمنة إلى حصص من 60 ثانية بدل كسر الكاش في كل تحميل صفحة.
    // هذا يقلل عدد الطلبات الفعلية على GitHub Pages بشكل كبير عند وجود آلاف
    // الزيارات، مع بقاء أي تحديث حالة (active/suspended) نافذاً خلال دقيقة كحد أقصى.
    var cacheBucket = Math.floor(Date.now() / 60000);

    fetch(CONFIG_URL + "?v=" + cacheBucket)
      .then(function (r) {
        if (!r.ok) throw new Error('bad-status');
        return r.json();
      })
      .then(function (data) {
        if (!data || typeof data !== 'object') throw new Error('bad-payload');

        var host  = location.hostname.replace(/^www\./, '');
        var store = data[host];

        if (store) {
          if (store.status === 'suspended') {
            goSuspended(store.whatsapp || data._default_whatsapp || DEFAULT_WHATSAPP);
          } else {
            reveal();
          }
        } else if (ALLOW_UNLISTED_DOMAINS) {
          reveal();
        } else {
          goSuspended(data._default_whatsapp || DEFAULT_WHATSAPP);
        }
      })
      .catch(function () {
        if (attempt < MAX_ATTEMPTS) {
          setTimeout(function () { fetchConfig(attempt + 1); }, RETRY_DELAY_MS);
        } else {
          // فشل التحقق نهائياً بعد كل المحاولات => Fail Closed
          showBlockedFallback();
        }
      });
  }

  fetchConfig(1);
})();
