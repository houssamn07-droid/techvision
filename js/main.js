/* ============================================================
   TECHVISION — Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Navbar scroll ---- */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  /* ---- Mobile menu ---- */
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-menu a');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    mobileLinks.forEach(l => {
      l.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---- Mega menu backdrop ---- */
  const megaBackdrop = document.getElementById('megaBackdrop');
  const megaItems = document.querySelectorAll('.nav-item.has-mega');
  if (megaBackdrop && megaItems.length > 0) {
    megaItems.forEach(item => {
      item.addEventListener('mouseenter', () => megaBackdrop.classList.add('active'));
      item.addEventListener('mouseleave', () => megaBackdrop.classList.remove('active'));
    });
  }

  /* ---- Hero Slider: CSS crossfade ---- */
  const heroSlider = document.querySelector('.hero-slider');
  const heroSlides = document.querySelectorAll('.hero-slide');
  const heroDots = document.querySelectorAll('.hero-dot');
  const heroPrev = document.querySelector('.hero-prev');
  const heroNext = document.querySelector('.hero-next');

  if (heroSlider && heroSlides.length > 0) {
    let current = 0;
    let autoplay;

    const goTo = (index) => {
      heroSlides[current].classList.remove('active');
      heroDots.forEach(d => d.classList.remove('active'));
      current = (index + heroSlides.length) % heroSlides.length;
      heroSlides[current].classList.add('active');
      if (heroDots[current]) heroDots[current].classList.add('active');
    };

    const next = () => goTo(current + 1);
    const prev = () => goTo(current - 1);

    const startAuto = () => { autoplay = setInterval(next, 5500); };
    const stopAuto  = () => clearInterval(autoplay);

    /* Init: remove inline styles set by old JS, activate first */
    heroSlides.forEach(s => { s.style.display = ''; });
    heroSlides[0].classList.add('active');
    if (heroDots[0]) heroDots[0].classList.add('active');

    heroDots.forEach((d, i) => {
      d.addEventListener('click', () => { stopAuto(); goTo(i); startAuto(); });
    });
    if (heroNext) heroNext.addEventListener('click', () => { stopAuto(); next(); startAuto(); });
    if (heroPrev) heroPrev.addEventListener('click', () => { stopAuto(); prev(); startAuto(); });

    startAuto();

    /* Touch/swipe */
    let touchStartX = 0;
    heroSlider.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    heroSlider.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { stopAuto(); diff > 0 ? next() : prev(); startAuto(); }
    });
  }

  /* ---- Counter animation ---- */
  const counters = document.querySelectorAll('[data-count]');

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current).toLocaleString('fr-FR') + suffix;
      if (current >= target) clearInterval(timer);
    }, 16);
  };

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        entry.target.dataset.animated = 'true';
        animateCounter(entry.target);
      }
    });
  }, { threshold: .5 });

  counters.forEach(c => counterObserver.observe(c));

  /* ---- Scroll reveal ---- */
  const revealEls = document.querySelectorAll('[data-reveal]');

  if (revealEls.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, parseInt(delay, 10));
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .15, rootMargin: '0px 0px -50px 0px' });

    revealEls.forEach((el, i) => {
      if (!el.dataset.delay) el.dataset.delay = (i % 4) * 80;
      revealObserver.observe(el);
    });
  }

  /* ---- Language toggle ---- */
  const langBtns = document.querySelectorAll('.lang-btn');
  let currentLang = localStorage.getItem('tv-lang') || 'fr';

  const applyLang = (lang) => {
    document.body.lang = lang;
    langBtns.forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
    document.querySelectorAll('[data-fr]').forEach(el => {
      const content = lang === 'ar' ? (el.dataset.ar || el.dataset.fr) : el.dataset.fr;
      if (content !== undefined) el.innerHTML = content;
    });
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('tv-lang', lang);
  };

  langBtns.forEach(b => {
    b.addEventListener('click', () => {
      currentLang = b.dataset.lang;
      applyLang(currentLang);
    });
  });

  applyLang(currentLang);

  /* ---- WhatsApp floating panel toggle ---- */
  const waMainBtn = document.querySelector('.wa-main-btn');
  const waBubbles = document.querySelectorAll('.wa-bubble');

  if (waMainBtn) {
    let bubbleVisible = false;
    waMainBtn.addEventListener('click', () => {
      bubbleVisible = !bubbleVisible;
      waBubbles.forEach(b => {
        b.style.display = bubbleVisible ? 'flex' : 'none';
      });
    });
    // Initially hidden
    waBubbles.forEach(b => { b.style.display = 'none'; });
  }

  /* ---- Product tab filter ---- */
  const tabs = document.querySelectorAll('.model-tab');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      tabPanels.forEach(panel => {
        panel.classList.toggle('hidden', panel.dataset.panel !== target && target !== 'all');
      });
    });
  });

  /* ---- Smooth anchor scroll ---- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ---- Reviews carousel (mobile) ---- */
  const reviewsGrid = document.querySelector('.reviews-grid');
  if (reviewsGrid && window.innerWidth < 768) {
    let isDragging = false;
    let startX, scrollLeft;
    reviewsGrid.style.overflowX = 'auto';
    reviewsGrid.style.gridTemplateColumns = 'repeat(3, 300px)';
    reviewsGrid.style.scrollSnapType = 'x mandatory';
    reviewsGrid.querySelectorAll('.review-card').forEach(card => {
      card.style.scrollSnapAlign = 'start';
    });
  }

  /* ---- Active nav link ---- */
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') && currentPath.includes(link.getAttribute('href').replace('../', '').replace('.html', ''))) {
      link.classList.add('active');
    }
  });

  /* ---- Product card 3D tilt on hover ---- */
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width  / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `translateY(-14px) rotateX(${-dy * 4}deg) rotateY(${dx * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ---- Model card tilt (product pages) ---- */
  document.querySelectorAll('.model-card, .oven-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const dx = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
      const dy = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
      card.style.transform = `translateY(-8px) rotateX(${-dy * 3}deg) rotateY(${dx * 3}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  /* ---- WhatsApp button pulse glow ---- */
  const waBtn = document.querySelector('.wa-main-btn');
  if (waBtn) {
    setInterval(() => {
      waBtn.classList.add('pulsing');
      setTimeout(() => waBtn.classList.remove('pulsing'), 600);
    }, 4000);
  }

  /* ---- Scroll progress bar ---- */
  const progressBar = document.createElement('div');
  progressBar.style.cssText = 'position:fixed;top:0;left:0;height:3px;background:linear-gradient(90deg,var(--primary),var(--accent));z-index:9999;transition:width .1s;pointer-events:none;';
  document.body.appendChild(progressBar);
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
    progressBar.style.width = pct + '%';
  });

  /* ---- Staggered reveal for grids ---- */
  document.querySelectorAll('.products-grid, .why-grid, .reviews-grid, .categories-grid').forEach(grid => {
    const children = grid.querySelectorAll('[data-reveal]');
    children.forEach((el, i) => {
      if (!el.dataset.delay) el.dataset.delay = i * 90;
    });
  });

});
