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
