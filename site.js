/* Les choses cachées du monde — language persistence across pages */
(function () {
  var KEY = 'tchdm-lang';

  function stored(l) {
    try { localStorage.setItem(KEY, l); return true; } catch (e) { return false; }
  }

  function decorate(l) {
    // Fallback when browser storage is unavailable: carry the language in the URL.
    var links = document.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href');
      if (!href || /^(https?:|mailto:|#)/.test(href)) continue;
      href = href.split('?')[0];
      links[i].setAttribute('href', href + '?lang=' + l);
    }
  }

  function apply(l) {
    document.documentElement.className = 'lang-' + l;
    document.documentElement.lang = l;
    var f = document.getElementById('btn-fr');
    var e = document.getElementById('btn-en');
    if (f) f.classList.toggle('active', l === 'fr');
    if (e) e.classList.toggle('active', l === 'en');
    if (!stored(l)) decorate(l);
  }

  window.setLang = apply;

  var current = 'fr';
  var cls = document.documentElement.className;
  if (cls.indexOf('lang-en') !== -1) current = 'en';
  apply(current);
})();

/* Auto-hiding header: on narrow screens the nav slides away while the reader
   scrolls down and comes back as soon as they scroll up. */
(function () {
  var nav = document.querySelector('nav');
  if (!nav) return;

  var last = window.pageYOffset || 0;
  var ticking = false;
  var THRESHOLD = 6;   // ignore sub-pixel jitter
  var TOP_ZONE = 90;   // always visible near the top of the page

  function update() {
    ticking = false;
    var y = window.pageYOffset || 0;
    if (y <= TOP_ZONE) {
      nav.classList.remove('hide');
    } else if (y > last + THRESHOLD) {
      nav.classList.add('hide');
    } else if (y < last - THRESHOLD) {
      nav.classList.remove('hide');
    }
    last = y;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
  }, { passive: true });

  // A keyboard user tabbing into a hidden link must be able to see it.
  nav.addEventListener('focusin', function () { nav.classList.remove('hide'); });
})();
