/* Les choses cachées du monde : language persistence across pages */
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

/* Chronicles index: filter the cards by tag. Deep link with ?tag=xxx. */
(function () {
  var list = document.querySelector('.chron-list');
  var bar = document.querySelector('.tagbar');
  if (!list || !bar) return;

  var cards = list.querySelectorAll('.chron-card');
  var count = document.getElementById('chron-count');
  var empty = document.getElementById('chron-empty');

  function apply(tag) {
    var shown = 0;
    for (var i = 0; i < cards.length; i++) {
      var tags = (cards[i].getAttribute('data-tags') || '').split(/\s+/);
      var ok = tag === 'all' || tags.indexOf(tag) !== -1;
      cards[i].classList.toggle('hidden', !ok);
      if (ok) shown++;
    }
    var btns = bar.querySelectorAll('[data-tag]');
    for (var j = 0; j < btns.length; j++) {
      btns[j].classList.toggle('active', btns[j].getAttribute('data-tag') === tag);
    }
    if (count) count.textContent = String(shown);
    if (empty) empty.hidden = shown !== 0;
    try {
      var url = new URL(window.location.href);
      if (tag === 'all') url.searchParams.delete('tag'); else url.searchParams.set('tag', tag);
      window.history.replaceState(null, '', url.toString());
    } catch (e) {}
  }

  document.addEventListener('click', function (ev) {
    var el = ev.target;
    while (el && el !== document.body) {
      if (el.hasAttribute && el.hasAttribute('data-tag')) {
        ev.preventDefault();
        var t = el.getAttribute('data-tag');
        var cur = bar.querySelector('.tag.active');
        var curTag = cur ? cur.getAttribute('data-tag') : 'all';
        // Clicking the active tag (from a card) turns the filter off again.
        apply(t === curTag && t !== 'all' ? 'all' : t);
        if (el.closest && el.closest('.chron-card')) {
          bar.scrollIntoView({ block: 'start', behavior: 'smooth' });
        }
        return;
      }
      el = el.parentNode;
    }
  });

  var initial = 'all';
  try {
    var q = new URLSearchParams(window.location.search).get('tag');
    if (q && bar.querySelector('[data-tag="' + q.replace(/[^a-z]/g, '') + '"]')) initial = q;
  } catch (e) {}
  apply(initial);
})();
