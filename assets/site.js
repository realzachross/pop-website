/* Pop for popexplore.com. Shared behaviors for the v4 site.
   Nav scroll state, reveal-on-scroll, platform-aware store pills,
   the home "How Pop works" tour player, and legal-page TOC scroll-spy. */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- platform detection: which store pill to show on phones ---- */
  var ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/i.test(ua)) document.body.classList.add('ua-ios');
  else if (/Android/i.test(ua)) document.body.classList.add('ua-android');

  /* ---- nav: hairline + blur after 8px of scroll ---- */
  var nav = document.getElementById('nav');
  function onScroll() { if (nav) nav.classList.toggle('scrolled', window.scrollY > 8); }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- reveal-on-scroll ---- */
  var reveals = document.querySelectorAll('.reveal');
  if (reduce) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else if ('IntersectionObserver' in window) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { rio.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- video visibility: pause clips while <30% in view ---- */
  var ratios = new WeakMap();
  function visible(v) { return (ratios.get(v) || 0) >= 0.3; }
  var started = !reduce; // under reduced motion, nothing plays until the user acts
  var held = false;
  var tourVideo = document.querySelector('#tourPhone video');

  function allowPlay(v) {
    if (!started) return false;
    if (v === tourVideo && held) return false;
    return visible(v);
  }
  function maybePlay(v) { if (allowPlay(v)) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } }

  if ('IntersectionObserver' in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        ratios.set(e.target, e.intersectionRatio);
        if (e.intersectionRatio < 0.3) e.target.pause();
        else maybePlay(e.target);
      });
    }, { threshold: [0, 0.3, 0.6, 1] });
    document.querySelectorAll('.phone video').forEach(function (v) { vio.observe(v); });
  } else {
    document.querySelectorAll('.phone video').forEach(function (v) { ratios.set(v, 1); });
  }

  /* ---- graceful fallback: show the phone placeholder if a clip is missing ---- */
  document.querySelectorAll('.phone video').forEach(function (v) {
    v.addEventListener('error', function () {
      var ph = v.closest('.phone'); if (ph) ph.classList.add('missing');
    });
  });

  /* ---- hero: loop the explore clip ---- */
  var heroVideo = document.querySelector('#heroPhone video');
  if (heroVideo && !('IntersectionObserver' in window)) maybePlay(heroVideo);

  /* ---- tour player ---- */
  var steps = Array.prototype.slice.call(document.querySelectorAll('.tour .step'));
  if (steps.length && tourVideo) {
    var tourPh = document.getElementById('tourPh');
    var active = -1;

    function label(step) { return step.querySelector('.t').textContent.replace(/\.$/, ''); }

    function setActive(i, play) {
      if (i < 0) i = steps.length - 1;
      if (i >= steps.length) i = 0;
      active = i;
      steps.forEach(function (s, idx) {
        var on = idx === i;
        s.classList.toggle('on', on);
        s.setAttribute('aria-selected', on ? 'true' : 'false');
        s.tabIndex = on ? 0 : -1;
        s.querySelector('.bar i').style.width = '0%';
      });
      var step = steps[i], k = step.dataset.k;
      if (tourPh) tourPh.textContent = label(step);
      tourVideo.setAttribute('aria-label', 'Pop feature: ' + label(step));
      tourVideo.poster = 'media/' + k + '.jpg';
      if (tourVideo.dataset.k !== k) {
        tourVideo.dataset.k = k;
        tourVideo.src = 'media/' + k + '.mp4';
        tourVideo.load();
      } else {
        try { tourVideo.currentTime = 0; } catch (e) {}
      }
      if (play) maybePlay(tourVideo);
    }

    tourVideo.addEventListener('timeupdate', function () {
      if (active < 0 || !tourVideo.duration) return;
      var pct = Math.min(1, tourVideo.currentTime / tourVideo.duration) * 100;
      var bar = steps[active].querySelector('.bar i');
      if (bar) bar.style.width = pct + '%';
    });
    tourVideo.addEventListener('ended', function () { setActive(active + 1, true); });
    tourVideo.addEventListener('error', function () {
      var ph = tourVideo.closest('.phone'); if (ph) ph.classList.add('missing');
    });

    steps.forEach(function (step, idx) {
      step.addEventListener('click', function () { started = true; setActive(idx, true); });
    });

    var list = document.querySelector('.tour .steps');
    if (list) list.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      started = true;
      var next = active + (e.key === 'ArrowDown' ? 1 : -1);
      if (next < 0) next = steps.length - 1;
      if (next >= steps.length) next = 0;
      setActive(next, true);
      steps[next].focus();
    });

    /* press and hold the phone to pause */
    var tourPhone = document.getElementById('tourPhone');
    if (tourPhone) {
      var hold = function () { held = true; tourPhone.classList.add('held'); tourVideo.pause(); };
      var release = function () { held = false; tourPhone.classList.remove('held'); maybePlay(tourVideo); };
      tourPhone.addEventListener('pointerdown', hold);
      addEventListener('pointerup', release);
      tourPhone.addEventListener('pointercancel', release);
      tourPhone.addEventListener('pointerleave', release);
    }

    setActive(0, false); // load the first clip; vio starts playback when it scrolls into view
  }

  /* ---- legal pages: number headings, build + spy the TOC ---- */
  var prose = document.querySelector('.prose');
  var tocList = document.querySelector('.toc ol');
  if (prose && tocList) {
    var hs = Array.prototype.slice.call(prose.querySelectorAll('h2'));
    var links = [];
    hs.forEach(function (h, i) {
      var text = h.textContent.trim();
      var num = document.createElement('span');
      num.className = 'num';
      num.textContent = String(i + 1);
      h.insertBefore(num, h.firstChild);
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = text;
      li.appendChild(a);
      tocList.appendChild(li);
      links.push(a);
    });
    var spy = function () {
      var idx = 0;
      hs.forEach(function (h, i) { if (h.getBoundingClientRect().top <= 130) idx = i; });
      links.forEach(function (a, i) { a.classList.toggle('on', i === idx); });
    };
    addEventListener('scroll', spy, { passive: true });
    spy();
  }
})();
