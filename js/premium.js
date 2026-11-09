/* ============================================================
   TECHVISION — PREMIUM MOTION LAYER  (v1 · 2026-11)
   Fichier additionnel, sans dépendance. Peut être retiré sans casser le site.
   ============================================================ */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function ready(fn) { document.readyState !== 'loading' ? fn() : document.addEventListener('DOMContentLoaded', fn); }

  ready(function () {

    /* ---------- 1. Barre de progression ---------- */
    var bar = document.createElement('div');
    bar.className = 'pv-progress';
    document.body.appendChild(bar);
    var ticking = false;
    function onScroll() {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var h = document.documentElement.scrollHeight - innerHeight;
        bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(scrollY / h, 1) : 0) + ')';
        ticking = false;
      });
    }
    addEventListener('scroll', onScroll, { passive: true }); onScroll();

    /* ---------- 2. Titres : révélation mot par mot ---------- */
    function splitWords(el) {
      // découpe les nœuds texte en mots, en gardant les <span> colorés
      var i = 0;
      (function walk(node) {
        $$('*', node).length; // noop
        Array.prototype.slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var parts = n.textContent.split(/(\s+)/);
            var frag = document.createDocumentFragment();
            parts.forEach(function (p) {
              if (!p) return;
              if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
              var w = document.createElement('tv-w');
              var b = document.createElement('b'); b.textContent = p; b.style.setProperty('--i', i++);
              w.appendChild(b); frag.appendChild(w);
            });
            n.parentNode.replaceChild(frag, n);
          } else if (n.nodeType === 1 && n.tagName !== 'TV-W') {
            walk(n);
          }
        });
      })(el);
      el.classList.add('pv-split');
    }

    var titleSel = '.section-title';
    var wordIO = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('pv-in'); wordIO.unobserve(e.target); } });
    }, { threshold: .25, rootMargin: '0px 0px -40px 0px' }) : null;

    function prepareTitles(scope) {
      if (reduce) return;
      $$(titleSel, scope).forEach(function (el) {
        if (el.closest('.navbar, .mobile-menu, footer, .mega-nav')) return;
        el.classList.remove('pv-in');
        splitWords(el);
        if (wordIO) wordIO.observe(el); else el.classList.add('pv-in');
      });
    }
    prepareTitles(document);

    // le switch FR/ع réécrit le HTML des titres : on les redécoupe
    $$('.lang-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        setTimeout(function () {
          prepareTitles(document);
          $$('.pv-split').forEach(function (el) {
            var r = el.getBoundingClientRect();
            if (r.top < innerHeight && r.bottom > 0) el.classList.add('pv-in');
          });
          onScroll();
        }, 30);
      });
    });

    /* ---------- 3. Hero : texte rejoué + indicateurs ---------- */
    var wrap = document.querySelector('.hero-banner-wrap');
    var slides = $$('.hsb-slide');
    var actions = document.querySelector('.hero-banner-actions');
    if (wrap && slides.length && actions) {
      var DUR = 5500;
      var dots = document.createElement('div');
      dots.className = 'pv-hero-dots';
      dots.style.setProperty('--pv-dur', DUR + 'ms');
      slides.forEach(function (s, i) {
        var b = document.createElement('button');
        b.type = 'button'; b.setAttribute('aria-label', 'Slide ' + (i + 1));
        b.appendChild(document.createElement('i'));
        b.addEventListener('click', function () {
          var cur = slides.findIndex(function (x) { return x.classList.contains('active'); });
          var nextBtn = document.querySelector('.hero-next'), prevBtn = document.querySelector('.hero-prev');
          var diff = i - cur;
          for (var k = 0; k < Math.abs(diff); k++) (diff > 0 ? nextBtn : prevBtn) && (diff > 0 ? nextBtn : prevBtn).click();
        });
        dots.appendChild(b);
      });
      wrap.appendChild(dots);

      function sync() {
        var idx = slides.findIndex(function (x) { return x.classList.contains('active'); });
        $$('button', dots).forEach(function (b, i) {
          b.classList.toggle('done', i < idx);
          b.classList.remove('on'); void b.offsetWidth;
          if (i === idx) b.classList.add('on');
        });
        if (!reduce) {
          actions.classList.remove('pv-hero-play'); void actions.offsetWidth; actions.classList.add('pv-hero-play');
          var t = actions.querySelector('.hero-anim-title');
          if (t) { t.classList.remove('pv-in'); void t.offsetWidth; requestAnimationFrame(function () { t.classList.add('pv-in'); }); }
        }
      }
      var last = -1;
      var mo = new MutationObserver(function () {
        var idx = slides.findIndex(function (x) { return x.classList.contains('active'); });
        if (idx !== last) { last = idx; sync(); }
      });
      slides.forEach(function (s) { mo.observe(s, { attributes: true, attributeFilter: ['class'] }); });
      last = 0; sync();

      // léger parallaxe du contenu hero au scroll
      if (!reduce) addEventListener('scroll', function () {
        var y = Math.min(scrollY, innerHeight);
        actions.style.transform = 'translate3d(0,' + (y * .18) + 'px,0)';
        actions.style.opacity = String(Math.max(1 - y / (innerHeight * .75), 0));
      }, { passive: true });
    }

    /* ---------- 4. Tilt 3D + reflet (desktop) ---------- */
    if (fine && !reduce) {
      $$('.cat-card, .product-card').forEach(function (card) {
        var g = document.createElement('span'); g.className = 'pv-glare'; card.appendChild(g);
        var max = card.classList.contains('cat-card') ? 6 : 4;
        card.addEventListener('mousemove', function (e) {
          var r = card.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
          card.style.transform = 'perspective(1000px) rotateX(' + ((.5 - py) * max) + 'deg) rotateY(' + ((px - .5) * max) + 'deg) translateY(-6px)';
          card.style.setProperty('--mx', (px * 100) + '%'); card.style.setProperty('--my', (py * 100) + '%');
        });
        card.addEventListener('mouseleave', function () { card.style.transform = ''; });
      });

      /* ---------- 5. Boutons magnétiques ---------- */
      $$('.btn-cta, .btn-whatsapp, .btn-lg').forEach(function (btn) {
        btn.addEventListener('mousemove', function (e) {
          var r = btn.getBoundingClientRect();
          var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
          btn.style.transform = 'translate(' + dx * .18 + 'px,' + (dy * .28 - 2) + 'px)';
        });
        btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
      });

      /* ---------- 6. Lueur sur sections sombres ---------- */
      $$('.brand-pos, .reviews-section, .why-section.dark, .cta-section, .wa-cta, .page-hero').forEach(function (sec) {
        var bg = getComputedStyle(sec).backgroundColor + getComputedStyle(sec).backgroundImage;
        sec.classList.add('pv-glow');
        sec.addEventListener('mousemove', function (e) {
          var r = sec.getBoundingClientRect();
          sec.style.setProperty('--gx', (e.clientX - r.left) + 'px');
          sec.style.setProperty('--gy', (e.clientY - r.top) + 'px');
        });
      });
    }

    /* ---------- 7. Parallaxe douce des images lifestyle ---------- */
    if (!reduce) {
      var px = $$('.cat-card-bg, .brand-pos-img, [data-parallax]');
      addEventListener('scroll', function () {
        requestAnimationFrame(function () {
          px.forEach(function (el) {
            var r = el.getBoundingClientRect();
            if (r.bottom < 0 || r.top > innerHeight) return;
            var p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
            el.style.transform = 'translate3d(0,' + (p * -18) + 'px,0) scale(1.06)';
          });
        });
      }, { passive: true });
    }
  });
})();

/* ============================================================
   v2 · HERO BANNIÈRES · VIDÉOS · PAGES PRODUITS
   ============================================================ */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function ready(fn) { document.readyState !== 'loading' ? fn() : document.addEventListener('DOMContentLoaded', fn); }
  function io(els, cb, opt) {
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { cb(e, true); }); return null; }
    var o = new IntersectionObserver(function (es) { es.forEach(function (e) { cb(e.target, e.isIntersecting, o); }); }, opt || { threshold: .2 });
    els.forEach(function (e) { o.observe(e); });
    return o;
  }

  ready(function () {
    /* ---------- HERO slider ---------- */
    var hero = document.querySelector('[data-tvh]');
    if (hero) {
      var slides = $$('.tvh-slide', hero), dotsBox = hero.querySelector('.tvh-dots');
      var DUR = 6000, cur = 0, timer = null, paused = false;
      hero.style.setProperty('--tvh-dur', DUR + 'ms');
      slides.forEach(function (s, i) {
        var b = document.createElement('button'); b.type = 'button';
        b.setAttribute('aria-label', 'Bannière ' + (i + 1)); b.appendChild(document.createElement('i'));
        b.addEventListener('click', function () { go(i); restart(); });
        dotsBox.appendChild(b);
      });
      var dots = $$('button', dotsBox);
      function paint() {
        dots.forEach(function (d, i) {
          d.classList.toggle('done', i < cur); d.classList.remove('on'); void d.offsetWidth;
          if (i === cur) d.classList.add('on');
        });
      }
      function go(n) {
        var next = (n + slides.length) % slides.length;
        if (next === cur) return;
        var img = slides[next].querySelector('img');
        if (img && img.loading === 'lazy') img.loading = 'eager';
        slides[cur].classList.remove('is-active');
        cur = next; slides[cur].classList.add('is-active'); paint();
      }
      function restart() { clearInterval(timer); if (!paused) timer = setInterval(function () { go(cur + 1); }, DUR); paint(); }
      // précharge la bannière suivante
      setTimeout(function () { slides.forEach(function (s) { var im = s.querySelector('img'); if (im) im.loading = 'eager'; }); }, 2500);
      hero.querySelector('.tvh-prev').addEventListener('click', function () { go(cur - 1); restart(); });
      hero.querySelector('.tvh-next').addEventListener('click', function () { go(cur + 1); restart(); });
      hero.addEventListener('mouseenter', function () { paused = true; hero.classList.add('paused'); clearInterval(timer); });
      hero.addEventListener('mouseleave', function () { paused = false; hero.classList.remove('paused'); clearInterval(timer); timer = setInterval(function () { go(cur + 1); }, DUR); });
      var tx = 0;
      hero.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
      hero.addEventListener('touchend', function (e) {
        var dx = e.changedTouches[0].clientX - tx;
        if (Math.abs(dx) > 45) { go(cur + (dx < 0 ? 1 : -1)); restart(); }
      }, { passive: true });
      document.addEventListener('visibilitychange', function () { if (document.hidden) clearInterval(timer); else restart(); });
      paint(); restart();
    }

    /* ---------- Hero : images des slides suivantes chargées après le load ---------- */
    (function () {
      function hyd() {
        $$('.tvh [data-srcset]').forEach(function (e) { e.setAttribute('srcset', e.getAttribute('data-srcset')); e.removeAttribute('data-srcset'); });
        $$('.tvh img[data-src]').forEach(function (e) { e.src = e.getAttribute('data-src'); e.removeAttribute('data-src'); });
      }
      if (document.readyState === 'complete') setTimeout(hyd, 300); else window.addEventListener('load', function () { setTimeout(hyd, 300); });
    })();

    /* ---------- Vidéos démonstratives ---------- */
    $$('[data-pv-video]').forEach(function (sec) {
      var v = sec.querySelector('video'), bar = sec.querySelector('.pv-video-bar i');
      var tog = sec.querySelector('.pv-video-toggle'), snd = sec.querySelector('.pv-video-sound');
      $$('.pv-video-chips span', sec).forEach(function (c, i) { c.style.setProperty('--i', i); });
      var userPaused = false;
      function icon() { tog.innerHTML = v.paused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>'; }
      tog.addEventListener('click', function () { if (v.paused) { userPaused = false; load(); v.play(); } else { userPaused = true; v.pause(); } });
      snd.addEventListener('click', function () {
        v.muted = !v.muted; if (!v.muted && v.paused) { load(); v.play(); }
        snd.innerHTML = v.muted ? '<i class="fas fa-volume-xmark"></i>' : '<i class="fas fa-volume-high"></i>';
      });
      v.addEventListener('play', icon); v.addEventListener('pause', icon);
      v.addEventListener('timeupdate', function () { if (v.duration) bar.style.transform = 'scaleX(' + (v.currentTime / v.duration) + ')'; });
      function load() {
        if (v.getAttribute('src') || !v.dataset.src) return;
        var m = window.matchMedia('(max-width: 900px)').matches || (navigator.connection && navigator.connection.saveData);
        v.src = (m && v.dataset.srcM) ? v.dataset.srcM : v.dataset.src;
      }
      io([sec], function (el, vis) {
        if (vis) { load(); sec.classList.add('pv-in'); if (!userPaused && !reduce) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } }
        else if (!v.paused) v.pause();
      }, { threshold: .35 });
    });

    /* ---------- Pages produits : cascades ---------- */
    if (!reduce) {
      var groups = $$('.tvp-specs, .tvp-pills, .tvp-gallery-grid, .tvp-feat-grid, .tvp-sim-grid, .order-trust-strip, .models-grid, .similar-grid, .tvp-thumbs, .hero-carousel-thumbs');
      groups = groups.filter(function (g) { return !g.querySelector('[data-reveal]'); });
      groups.forEach(function (g) {
        g.classList.add('pv-stagger');
        Array.prototype.forEach.call(g.children, function (c, i) { c.style.setProperty('--i', Math.min(i, 12)); });
      });
      io(groups, function (el, vis, o) { if (vis) { el.classList.add('pv-in'); if (o) o.unobserve(el); } }, { threshold: .12, rootMargin: '0px 0px -30px 0px' });
    }

    /* ---------- Image principale : transition au changement ---------- */
    $$('#tvpMain, #fourMainImg, #climMainImg, #frigoMainImg, #tvMainImg').forEach(function (img) {
      img.loading = 'eager';
      new MutationObserver(function () {
        if (img.hasAttribute('srcset')) { img.removeAttribute('srcset'); img.removeAttribute('sizes'); }
        img.classList.remove('pv-swap'); void img.offsetWidth; img.classList.add('pv-swap');
      }).observe(img, { attributes: true, attributeFilter: ['src'] });
    });
  });
})();

/* Pages sans traduction arabe : on reste en français et on masque le sélecteur FR/ع */
(function () {
  function run() {
    if (document.querySelectorAll('[data-ar]').length >= 10) return;
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'fr';
    if (document.body) document.body.lang = 'fr';
    Array.prototype.forEach.call(document.querySelectorAll('.lang-toggle'), function (t) { t.style.display = 'none'; });
  }
  document.readyState !== 'loading' ? run() : document.addEventListener('DOMContentLoaded', run);
})();
