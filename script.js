(function () {
  'use strict';

  const PORTAL_BG =
    'https://flick-award-65707097.figma.site/_assets/v11/bbc8d4f1308d5df012c4b0a657b44c6d92609c24.png';
  const CURTAIN_LEFT =
    'https://flick-award-65707097.figma.site/_assets/v11/535b5bc4f8b600a7758bc74dc3540f405f0b89a6.png';
  const CURTAIN_RIGHT =
    'https://flick-award-65707097.figma.site/_assets/v11/ab14033a7fe6dcedbae303726331b6a26d9d201c.png';
  const WORLD_BG =
    'https://flick-award-65707097.figma.site/_assets/v11/4f4f0651516e75fbfeebf87e12be372c0683a7fd.png';
  const BOTTOM_CLOUDS =
    'https://flick-award-65707097.figma.site/_assets/v11/fb811f79bccceab1c4cdbb81b5524632cffc9c52.png';

  const CARD_IMAGES = [
    'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260525_160507_2ccbb4eb-1469-484f-af25-59168ad9a233.png&w=1280&q=85',
    'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260525_160644_072a7f68-a101-4ded-a332-7d37707dbdd1.png&w=1280&q=85',
    'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260525_160706_1c153d04-0dfb-4ac9-a4ef-e74f301c329c.png&w=1280&q=85',
  ];

  const ARC_CARDS = [
    { title: 'Hidden Realms', desc: 'Luminous sanctuaries unseen by wandering eyes', color: '#f3cdd6' },
    { title: 'Wild Solitudes', desc: 'Dissolve into untamed horizons and deep calm', color: '#dcedc2' },
    { title: 'Silent Havens', desc: 'Remote escapes far beyond ordinary reach', color: '#c3e3f4' },
    { title: 'Bespoke Quests', desc: 'Journeys shaped around your vision and soul', color: '#f0e4c0' },
    { title: 'Vivid Drifts', desc: 'Surreal passages through breathtaking terrain', color: '#dcd2f2' },
    { title: 'Mystic Crests', desc: 'Timeless ridgelines wrapped in cloud and myth', color: '#f3cdd6' },
    { title: 'Deep Currents', desc: 'Glowing depths alive with uncharted wonder', color: '#c3e3f4' },
    { title: 'Gilded Dusk', desc: 'Amber horizons that stretch past all reason', color: '#f0e4c0' },
    { title: 'Glassy Tides', desc: 'Calm waters holding skies of pure stillness', color: '#dcedc2' },
  ];

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }
  function clamp(v, min, max) {
    return Math.min(Math.max(v, min), max);
  }

  function getScrollProgress(outerEl) {
    const rect = outerEl.getBoundingClientRect();
    const containerScrollHeight = outerEl.offsetHeight - window.innerHeight;
    const scrolledPastTop = -rect.top;
    return Math.min(Math.max(scrolledPastTop / containerScrollHeight, 0), 1);
  }

  // Upsell pacing (280vh) — slower, more immersive
  function computeOpacities(p) {
    const cloudsOpacity = p < 0.05 ? lerp(0.7, 1, p / 0.05) : 1;
    const scene1Opacity = p < 0.22 ? 1 : clamp(1 - (p - 0.22) / 0.16, 0, 1);
    const portalOpacity = p < 0.4 ? 1 : clamp(1 - (p - 0.4) / 0.22, 0, 1);
    const scene2In = clamp((p - 0.48) / 0.16, 0, 1);
    const scene2Out = p < 0.9 ? 1 : clamp(1 - (p - 0.9) / 0.1, 0, 1);
    const scene2Opacity = scene2In * scene2Out;
    return { portalOpacity, cloudsOpacity, scene1Opacity, scene2Opacity };
  }

  function motionProgress(p) {
    if (p < 0.28) return easeInOut(p / 0.28) * 0.12;
    if (p < 0.62) return 0.12 + easeInOut((p - 0.28) / 0.34) * 0.76;
    return 0.88 + easeInOut((p - 0.62) / 0.38) * 0.12;
  }

  const root = document.getElementById('wonder-experience');
  if (!root) return;

  const worldEl = document.querySelector('[data-ref="world"]');
  const cloudsEl = document.querySelector('[data-ref="clouds"]');
  const portalEl = root.querySelector('[data-ref="portal"]');
  const curtainLeftEl = root.querySelector('[data-ref="curtainLeft"]');
  const curtainRightEl = root.querySelector('[data-ref="curtainRight"]');
  const scene1El = root.querySelector('[data-ref="scene1"]');
  const scene2El = root.querySelector('[data-ref="scene2"]');
  const portfolioEl = document.getElementById('fbs-portfolio');
  const portfolioInner = document.querySelector('.fbs-portfolio-inner');

  // Wire asset constants (single source of truth)
  worldEl.querySelector('img').src = WORLD_BG;
  cloudsEl.querySelector('img').src = BOTTOM_CLOUDS;
  portalEl.querySelector('img').src = PORTAL_BG;
  curtainLeftEl.querySelector('img').src = CURTAIN_LEFT;
  curtainRightEl.querySelector('img').src = CURTAIN_RIGHT;

  const HERO_MEDIA = [
    'https://assets.cdn.filesafe.space/Z4Hh1Nzl43X5TFyPEJUN/media/6a778a2b9994d35aa00d2bf1.mp4',
    'https://assets.cdn.filesafe.space/Z4Hh1Nzl43X5TFyPEJUN/media/6a77885e9a9c7792ea98714a.mp4',
  ];

  function buildHeroMediaCard(src, index) {
    const el = document.createElement('div');
    el.className = 'wonder-hero-video-card';
    el.setAttribute('aria-label', 'Preview ' + (index + 1));
    const isImage = /\.webp($|\?)/i.test(src) || /\.(png|jpe?g|gif)($|\?)/i.test(src);
    if (isImage) {
      el.innerHTML =
        '<img class="wonder-hero-video-media" src="' +
        src +
        '" alt="" loading="lazy" decoding="async" />';
    } else {
      el.innerHTML =
        '<video class="wonder-hero-video-media" src="' +
        src +
        '" muted loop playsinline autoplay preload="metadata"></video>';
    }
    return el;
  }

  document.querySelectorAll('.wonder-hero-videos').forEach(function (container) {
    container.innerHTML = '';
    HERO_MEDIA.forEach(function (src, i) {
      container.appendChild(buildHeroMediaCard(src, i));
    });
  });

  // 4th row moved to top; then original rows 1–3; plus new 5th row
  const LOOK_MEDIA = [
    'https://assets.cdn.filesafe.space/Z4Hh1Nzl43X5TFyPEJUN/media/6a778a2b8880872019727774.mp4',
    'https://assets.cdn.filesafe.space/Z4Hh1Nzl43X5TFyPEJUN/media/6a778a2b9994d35aa00d2bf1.mp4',
    'https://assets.cdn.filesafe.space/Z4Hh1Nzl43X5TFyPEJUN/media/6a77885e88808720196bedb8.mp4',
    'https://assets.cdn.filesafe.space/Z4Hh1Nzl43X5TFyPEJUN/media/6a77885e88808720196bece7.mp4',
    'https://assets.cdn.filesafe.space/Z4Hh1Nzl43X5TFyPEJUN/media/6a77885e9a9c7792ea98714a.mp4',
    'https://assets.cdn.filesafe.space/Z4Hh1Nzl43X5TFyPEJUN/media/6a77885e9a9c7792ea98715b.mp4',
    'https://assets.cdn.filesafe.space/Z4Hh1Nzl43X5TFyPEJUN/media/6a77885e9994d35aa0085d26.webp',
    'https://assets.cdn.filesafe.space/Z4Hh1Nzl43X5TFyPEJUN/media/6a77885e9a9c7792ea987135.mp4',
    'https://assets.cdn.filesafe.space/Z4Hh1Nzl43X5TFyPEJUN/media/6a77954e88808720198ee865.mp4',
    'https://assets.cdn.filesafe.space/Z4Hh1Nzl43X5TFyPEJUN/media/6a77954e03343f290fd2b4f8.mp4',
  ];

  const LOOK_NAME_ORDER = [6, 7, 0, 1, 2, 3, 4, 5, 8, 9];

  // Portfolio cards — 4 rows × 2 columns
  const portfolioGrid = document.getElementById('fbs-portfolio-grid');
  if (portfolioGrid) {
    for (let r = 0; r < LOOK_MEDIA.length; r += 2) {
      const row = document.createElement('div');
      row.className = 'fbs-look-row';

      LOOK_MEDIA.slice(r, r + 2).forEach(function (src, col) {
        const i = r + col;
        const el = document.createElement('article');
        el.className = 'fbs-look-card';
        const nameIdx = LOOK_NAME_ORDER[i];
        const templateName =
          (ARC_CARDS[nameIdx] && ARC_CARDS[nameIdx].title) ||
          'Template ' + String(i + 1).padStart(2, '0');
        el.setAttribute('aria-label', templateName);

        const isImage = /\.webp($|\?)/i.test(src) || /\.(png|jpe?g|gif)($|\?)/i.test(src);
        const mediaHtml = isImage
          ? '<img class="fbs-look-media" src="' + src + '" alt="" loading="lazy" decoding="async" />'
          : '<video class="fbs-look-media" muted loop playsinline preload="none" data-src="' +
            src +
            '"></video>';

        el.innerHTML =
          '<div class="fbs-look-media-wrap">' +
          mediaHtml +
          '</div>' +
          '<div class="fbs-look-name">' +
          templateName +
          '</div>';

        row.appendChild(el);
      });

      portfolioGrid.appendChild(row);
    }
  }

  function activateRowMedia(row) {
    row.querySelectorAll('video.fbs-look-media').forEach(function (video) {
      if (!video.getAttribute('src') && video.dataset.src) {
        video.src = video.dataset.src;
        video.load();
      }
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    });
  }

  // Lightweight row reveal (CSS transform/opacity — once, GPU-friendly)
  function initRowReveals() {
    const rows = portfolioGrid ? portfolioGrid.querySelectorAll('.fbs-look-row') : [];
    if (!rows.length) return;

    if (!('IntersectionObserver' in window)) {
      rows.forEach(function (row) {
        row.classList.add('is-inview');
        activateRowMedia(row);
      });
      return;
    }

    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-inview');
          activateRowMedia(entry.target);
          io.unobserve(entry.target);
        });
      },
      { root: null, rootMargin: '0px 0px -12% 0px', threshold: 0.18 }
    );

    rows.forEach(function (row) {
      io.observe(row);
    });
  }

  let scrollProgressTarget = 0;
  let scrollProgressValue = 0;
  let isMobile = window.innerWidth < 768;
  let curtainsOpen = false;
  let uiVisible = false;
  let entranceDone = false;

  let rawX = 0;
  let rawY = 0;
  let smoothX = 0;
  let smoothY = 0;

  function applyCurtainState() {
    const shift = curtainsOpen ? 62 : 0;
    curtainLeftEl.style.transform =
      'translateX(calc(-' + shift + '%)) translateY(0px) scale(1)';
    curtainLeftEl.style.transformOrigin = 'left center';
    curtainRightEl.style.transform =
      'translateX(calc(' + shift + '%)) translateY(0px) scale(1)';
    curtainRightEl.style.transformOrigin = 'right center';
  }

  function applyScene1UIState() {
    if (uiVisible) {
      scene1El.classList.add('wonder-visible');
    } else {
      scene1El.classList.remove('wonder-visible');
    }
  }

  function onScroll() {
    scrollProgressTarget = getScrollProgress(root);
  }

  const mq = window.matchMedia('(max-width: 767px)');
  mq.addEventListener('change', function (e) {
    isMobile = e.matches;
  });

  root.addEventListener(
    'mousemove',
    function (e) {
      rawX = (e.clientX / window.innerWidth - 0.5) * 2;
      rawY = (e.clientY / window.innerHeight - 0.5) * 2;
    },
    { passive: true }
  );

  // Also listen on window so parallax works over sticky viewport
  window.addEventListener(
    'mousemove',
    function (e) {
      rawX = (e.clientX / window.innerWidth - 0.5) * 2;
      rawY = (e.clientY / window.innerHeight - 0.5) * 2;
    },
    { passive: true }
  );

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Entrance sequence
  setTimeout(function () {
    curtainsOpen = true;
    applyCurtainState();
  }, 100);

  setTimeout(function () {
    uiVisible = true;
    applyScene1UIState();
  }, 600);

  setTimeout(function () {
    entranceDone = true;
    curtainLeftEl.style.transition = 'none';
    curtainRightEl.style.transition = 'none';
  }, 2200);

  // Initial curtain closed state
  applyCurtainState();

  function rafLoop() {
    // Heavy damping — scroll feels slower / more cinematic
    scrollProgressValue = lerp(scrollProgressValue, scrollProgressTarget, 0.055);

    smoothX = lerp(smoothX, rawX, 0.07);
    smoothY = lerp(smoothY, rawY, 0.07);
    const rx = -smoothX;
    const ry = -smoothY;

    const p = scrollProgressValue;
    const ep = motionProgress(p);
    const opacities = computeOpacities(p);

    // WORLD
    const worldScale = lerp(1, 1.18, ep);
    worldEl.style.transform = 'scale(' + worldScale + ') translate(' + rx * 6 + 'px, ' + ry * 6 + 'px)';
    worldEl.style.transformOrigin = '50% 50%';

    // CLOUDS
    const cloudsScale = lerp(1, 1.4, ep);
    cloudsEl.style.transform =
      'scale(' + cloudsScale + ') translate(' + rx * 9 + 'px, ' + ry * 9 * 0.4 + 'px)';
    cloudsEl.style.transformOrigin = '50% 100%';
    cloudsEl.style.opacity = String(opacities.cloudsOpacity);

    // PORTAL
    const portalScale = lerp(1, 7.5, ep);
    // On mobile, shift portal right so the opening sits in the visual center
    const portalOriginX = isMobile ? '50%' : '52%';
    const portalOriginY = isMobile ? '40%' : '38%';
    const portalBiasX = isMobile ? Math.round(window.innerWidth * 0.1) : 0;
    portalEl.style.transform =
      'scale(' +
      portalScale +
      ') translate(' +
      (rx * 7 + portalBiasX) +
      'px, ' +
      ry * 7 +
      'px)';
    portalEl.style.transformOrigin = portalOriginX + ' ' + portalOriginY;
    portalEl.style.opacity = String(opacities.portalOpacity);

    // CURTAINS — CSS transition owns the entrance open; after entranceDone, rAF drives
    if (entranceDone) {
      const totalShiftL = (curtainsOpen ? 62 : 0) + lerp(0, 150, ep);
      const curtainScaleL = lerp(1, 1.3, ep);
      curtainLeftEl.style.transform =
        'translateX(calc(-' +
        totalShiftL +
        '% + ' +
        rx * 14 +
        'px)) translateY(' +
        ry * 14 * 0.3 +
        'px) scale(' +
        curtainScaleL +
        ')';
      curtainLeftEl.style.transformOrigin = 'left center';

      const totalShiftR = (curtainsOpen ? 62 : 0) + lerp(0, 150, ep);
      const curtainScaleR = lerp(1, 1.3, ep);
      curtainRightEl.style.transform =
        'translateX(calc(' +
        totalShiftR +
        '% + ' +
        rx * 14 +
        'px)) translateY(' +
        ry * 14 * 0.3 +
        'px) scale(' +
        curtainScaleR +
        ')';
      curtainRightEl.style.transformOrigin = 'right center';
    }

    // Scene opacities + pointer events
    scene1El.style.opacity = String(opacities.scene1Opacity);
    scene1El.style.pointerEvents = opacities.scene1Opacity < 0.05 ? 'none' : 'auto';

    scene2El.style.opacity = String(opacities.scene2Opacity);
    scene2El.style.pointerEvents = opacities.scene2Opacity < 0.05 ? 'none' : 'auto';

    requestAnimationFrame(rafLoop);
  }

  requestAnimationFrame(rafLoop);

  // Smooth, slowed page scroll (Lenis) for an immersive feel
  function initSmoothScroll() {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || typeof Lenis === 'undefined') return null;

    var lenis = new Lenis({
      duration: 1.75,
      easing: function (t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -12 * t);
      },
      smoothWheel: true,
      touchMultiplier: 1.1,
      wheelMultiplier: 0.85,
    });

    lenis.on('scroll', function () {
      onScroll();
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.update();
    });

    function lenisRaf(time) {
      lenis.raf(time);
      requestAnimationFrame(lenisRaf);
    }
    requestAnimationFrame(lenisRaf);

    return lenis;
  }

  // Section fade-in; rows use IntersectionObserver
  function initHandoff() {
    initSmoothScroll();
    initRowReveals();

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      if (portfolioInner) portfolioInner.style.opacity = '1';
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    if (portfolioInner) {
      gsap.fromTo(
        portfolioInner,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          ease: 'power2.out',
          duration: 1.45,
          scrollTrigger: {
            trigger: portfolioEl,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    }
  }

  if (document.readyState === 'complete') {
    initHandoff();
  } else {
    window.addEventListener('load', initHandoff);
  }
})();
