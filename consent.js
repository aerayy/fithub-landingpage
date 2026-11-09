// Fithub Point — çerez / rıza bandı (9 Kas 2026). Tüm sayfalarda /consent.css ile birlikte yüklenir.
//
// İş bölümü:
//   - Her sayfanın <head> başındaki satır içi kod: Google Onay Modu v2 varsayılanı (dört sinyal de
//     'denied'), gtag.js + GA4 config, Meta Pixel (init'ten önce consent revoke). Daha önce verilmiş
//     karar varsa orada hemen uygulanır (bant görünmez).
//   - Bu dosya: karar yoksa bandı çizer; "Kabul et" / "Reddet" seçimini localStorage'a yazar ve
//     dört Onay Modu sinyalini + Meta Pixel rızasını günceller. Rıza geri alma: [data-fp-consent-reset]
//     bağlantısı (privacy.html#cerezler) ya da konsolda fpConsent.reset().
//
// localStorage anahtarı: fp_consent_v1 = 'granted' | 'denied'. Sunucuya hiçbir şey gönderilmez.

(function () {
  "use strict";

  var KEY = "fp_consent_v1";
  var SIGNALS = ["ad_storage", "ad_user_data", "ad_personalization", "analytics_storage"];
  var PRIVACY_URL = "/privacy.html#cerezler";
  var banner = null;

  function read() {
    try {
      var v = localStorage.getItem(KEY);
      return v === "granted" || v === "denied" ? v : null;
    } catch (e) {
      return null; // özel pencere / engelli depolama
    }
  }

  function write(state) {
    try {
      localStorage.setItem(KEY, state);
    } catch (e) {
      /* yazılamazsa seçim yine de bu sayfa için uygulanır; bant sonraki yüklemede tekrar çıkar */
    }
  }

  function clear() {
    try {
      localStorage.removeItem(KEY);
    } catch (e) {
      /* yok say */
    }
  }

  function gtagSafe() {
    if (typeof window.gtag === "function") window.gtag.apply(null, arguments);
  }

  function fbqSafe() {
    if (typeof window.fbq === "function") window.fbq.apply(null, arguments);
  }

  // Google etiketinin "Onay modu" bölümündeki dört sinyali birden günceller; Meta Pixel'e grant/revoke verir.
  function apply(state) {
    var update = {};
    for (var i = 0; i < SIGNALS.length; i++) update[SIGNALS[i]] = state;
    gtagSafe("consent", "update", update);
    if (state === "granted") {
      fbqSafe("consent", "grant");
      fbqSafe("track", "PageView");
    } else {
      fbqSafe("consent", "revoke");
    }
  }

  function choose(state) {
    write(state);
    apply(state);
    hide();
  }

  function hide() {
    if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
    banner = null;
  }

  function show() {
    if (banner || !document.body) return;
    banner = document.createElement("section");
    banner.className = "fp-consent";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", "Çerez tercihleri");
    banner.innerHTML =
      '<div class="fp-consent__icon" aria-hidden="true">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/>' +
          '<path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/><path d="M7 14v.01"/>' +
        "</svg>" +
      "</div>" +
      '<div class="fp-consent__body">' +
        '<h2 class="fp-consent__title">Çerezler</h2>' +
        '<p class="fp-consent__text">Siteyi geliştirmek ve reklam ölçümü için çerez kullanıyoruz. ' +
          'Ayrıntı: <a class="fp-consent__link" href="' + PRIVACY_URL + '">Gizlilik Politikası</a></p>' +
      "</div>" +
      '<div class="fp-consent__actions">' +
        '<button type="button" class="fp-consent__btn fp-consent__btn--ghost" data-fp-consent="denied">Reddet</button>' +
        '<button type="button" class="fp-consent__btn fp-consent__btn--primary" data-fp-consent="granted">Kabul et</button>' +
      "</div>";

    banner.addEventListener("click", function (e) {
      var btn = e.target.closest ? e.target.closest("[data-fp-consent]") : null;
      if (!btn) return;
      choose(btn.getAttribute("data-fp-consent") === "granted" ? "granted" : "denied");
    });

    // DOM'un başına: klavye ve ekran okuyucu sırasında ilk sırada (görsel konum: alt kenar, sabit)
    document.body.insertBefore(banner, document.body.firstChild);
  }

  // Rızayı geri alma bağlantısı (privacy.html#cerezler): kaydı sil, sinyalleri reddedilmişe çek, bandı yeniden göster
  document.addEventListener("click", function (e) {
    var link = e.target.closest ? e.target.closest("[data-fp-consent-reset]") : null;
    if (!link) return;
    e.preventDefault();
    clear();
    apply("denied");
    show();
    var first = banner && banner.querySelector("[data-fp-consent]");
    if (first) first.focus();
  });

  function init() {
    if (read() === null) show();
  }

  if (document.body) init();
  else document.addEventListener("DOMContentLoaded", init);

  window.fpConsent = {
    read: read,
    accept: function () { choose("granted"); },
    deny: function () { choose("denied"); },
    reset: function () { clear(); apply("denied"); show(); }
  };
})();
