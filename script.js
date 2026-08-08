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

  const ARC_CARDS = [
    { title: 'Smilelab', desc: 'Luminous sanctuaries unseen by wandering eyes', color: '#f3cdd6' },
    { title: 'Prompt', desc: 'Dissolve into untamed horizons and deep calm', color: '#dcedc2' },
    { title: 'Legion VPN', desc: 'Remote escapes far beyond ordinary reach', color: '#c3e3f4' },
    { title: 'Bespoke Architecture', desc: 'Journeys shaped around your vision and soul', color: '#f0e4c0' },
    { title: 'Vivid Drifts', desc: 'Surreal passages through breathtaking terrain', color: '#dcd2f2' },
    { title: 'Cozy Paws', desc: 'Timeless ridgelines wrapped in cloud and myth', color: '#f3cdd6' },
    { title: 'Bloom', desc: 'Glowing depths alive with uncharted wonder', color: '#c3e3f4' },
    { title: 'Oyla', desc: 'Amber horizons that stretch past all reason', color: '#f0e4c0' },
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
        '<video class="wonder-hero-video-media" muted loop playsinline preload="none" data-src="' +
        src +
        '"></video>';
    }
    return el;
  }

  function getActiveHeroContainer() {
    if (window.matchMedia('(min-width: 1280px)').matches) {
      return document.querySelector('.wonder-s1-desktop .wonder-hero-videos');
    }
    if (window.matchMedia('(min-width: 768px)').matches) {
      return document.querySelector('.wonder-s1-tablet .wonder-hero-videos');
    }
    return document.querySelector('.wonder-s1-mobile .wonder-hero-videos');
  }

  // Only mount one visible hero set (was 6 videos across breakpoints)
  function mountHeroVideos() {
    document.querySelectorAll('.wonder-hero-videos').forEach(function (container) {
      container.innerHTML = '';
    });
    const container = getActiveHeroContainer();
    if (!container) return;
    HERO_MEDIA.forEach(function (src, i) {
      container.appendChild(buildHeroMediaCard(src, i));
    });
    container.querySelectorAll('video.wonder-hero-video-media').forEach(function (video) {
      if (!video.dataset.src) return;
      video.src = video.dataset.src;
      video.load();
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    });
  }

  var heroResizeTimer = null;
  window.addEventListener(
    'resize',
    function () {
      clearTimeout(heroResizeTimer);
      heroResizeTimer = setTimeout(mountHeroVideos, 200);
    },
    { passive: true }
  );

  // 4th row moved to top; then original rows 1–3; plus new 5th row
  const LOOK_MEDIA = [
    'https://assets.cdn.filesafe.space/Z4Hh1Nzl43X5TFyPEJUN/media/6a779bc99a9c7792eac72e90.webp',
    'https://assets.cdn.filesafe.space/Z4Hh1Nzl43X5TFyPEJUN/media/6a778a2b9994d35aa00d2bf1.mp4',
    'https://assets.cdn.filesafe.space/Z4Hh1Nzl43X5TFyPEJUN/media/6a77885e88808720196bedb8.mp4',
    'https://assets.cdn.filesafe.space/Z4Hh1Nzl43X5TFyPEJUN/media/6a77885e88808720196bece7.mp4',
    'https://assets.cdn.filesafe.space/Z4Hh1Nzl43X5TFyPEJUN/media/6a77885e9a9c7792ea98714a.mp4',
    'https://assets.cdn.filesafe.space/Z4Hh1Nzl43X5TFyPEJUN/media/6a77885e9a9c7792ea98715b.mp4',
    'https://assets.cdn.filesafe.space/Z4Hh1Nzl43X5TFyPEJUN/media/6a77885e9994d35aa0085d26.webp',
    'https://assets.cdn.filesafe.space/Z4Hh1Nzl43X5TFyPEJUN/media/6a77885e9a9c7792ea987135.mp4',
    'https://assets.cdn.filesafe.space/Z4Hh1Nzl43X5TFyPEJUN/media/6a7796f403343f290fd66140.mp4',
    'https://assets.cdn.filesafe.space/Z4Hh1Nzl43X5TFyPEJUN/media/6a7796f48880872019955c99.mp4',
  ];

  const LOOK_NAME_ORDER = [6, 7, 0, 1, 2, 3, 4, 5];
  const LOOK_NAMES = LOOK_MEDIA.map(function (_, i) {
    if (i === LOOK_MEDIA.length - 2) return 'TEDx Kew website';
    if (i === LOOK_MEDIA.length - 1) return 'Kaley Chu website';
    const nameIdx = LOOK_NAME_ORDER[i];
    return (ARC_CARDS[nameIdx] && ARC_CARDS[nameIdx].title) ||
      'Template ' + String(i + 1).padStart(2, '0');
  });

  // Portfolio cards — rows × 2 columns
  const portfolioGrid = document.getElementById('fbs-portfolio-grid');
  if (portfolioGrid) {
    for (let r = 0; r < LOOK_MEDIA.length; r += 2) {
      const row = document.createElement('div');
      row.className = 'fbs-look-row';

      LOOK_MEDIA.slice(r, r + 2).forEach(function (src, col) {
        const i = r + col;
        const el = document.createElement('article');
        el.className = 'fbs-look-card';
        const templateName = LOOK_NAMES[i];
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

  function pauseRowMedia(row) {
    row.querySelectorAll('video.fbs-look-media').forEach(function (video) {
      if (!video.paused) video.pause();
    });
  }

  // Reveal + play only while in view (pause offscreen to free decode/CPU)
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
          if (entry.isIntersecting) {
            entry.target.classList.add('is-inview');
            activateRowMedia(entry.target);
          } else {
            pauseRowMedia(entry.target);
          }
        });
      },
      { root: null, rootMargin: '120px 0px', threshold: 0.12 }
    );

    rows.forEach(function (row) {
      io.observe(row);
    });
  }

  let scrollProgressTarget = 0;
  let scrollProgressValue = 0;
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

  var allowParallax = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (allowParallax) {
    window.addEventListener(
      'mousemove',
      function (e) {
        rawX = (e.clientX / window.innerWidth - 0.5) * 2;
        rawY = (e.clientY / window.innerHeight - 0.5) * 2;
      },
      { passive: true }
    );
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Entrance sequence
  setTimeout(function () {
    curtainsOpen = true;
    applyCurtainState();
  }, 80);

  setTimeout(function () {
    uiVisible = true;
    applyScene1UIState();
  }, 480);

  // Mount hero videos after first paint / curtain open — avoids load fight
  setTimeout(mountHeroVideos, 650);

  setTimeout(function () {
    entranceDone = true;
    curtainLeftEl.style.transition = 'none';
    curtainRightEl.style.transition = 'none';
  }, 1800);

  // Initial curtain closed state
  applyCurtainState();

  var lenis = null;

  function initSmoothScroll() {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || typeof Lenis === 'undefined') return null;

    lenis = new Lenis({
      duration: 1.05,
      easing: function (t) {
        return Math.min(1, 1.001 - Math.pow(2, -10 * t));
      },
      smoothWheel: true,
      touchMultiplier: 1.2,
      wheelMultiplier: 1,
    });

    lenis.on('scroll', onScroll);
    return lenis;
  }

  function rafLoop(time) {
    if (lenis) lenis.raf(time);

    // Snappier follow — less “stuck” lag behind the wheel
    scrollProgressValue = lerp(scrollProgressValue, scrollProgressTarget, 0.14);

    if (allowParallax) {
      smoothX = lerp(smoothX, rawX, 0.12);
      smoothY = lerp(smoothY, rawY, 0.12);
    } else {
      smoothX = 0;
      smoothY = 0;
    }
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

    // PORTAL — origin matches CSS object-position aperture (52% / 38%)
    const portalScale = lerp(1, 7.5, ep);
    portalEl.style.transform =
      'scale(' + portalScale + ') translate(' + rx * 7 + 'px, ' + ry * 7 + 'px)';
    portalEl.style.transformOrigin = '52% 38%';
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

  function initPortfolioReveal() {
    if (!portfolioInner || !portfolioEl) return;
    if (!('IntersectionObserver' in window)) {
      portfolioInner.classList.add('is-inview');
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          portfolioInner.classList.add('is-inview');
          io.disconnect();
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    io.observe(portfolioEl);
  }

  // Start immediately (defer script) — do not wait for full window load
  initSmoothScroll();
  initPortfolioReveal();
  initRowReveals();
  requestAnimationFrame(rafLoop);
})();
