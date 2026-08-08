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

  // Upsell pacing (155vh) — tighter / faster
  function computeOpacities(p) {
    const cloudsOpacity = p < 0.04 ? lerp(0.7, 1, p / 0.04) : 1;
    const scene1Opacity = p < 0.18 ? 1 : clamp(1 - (p - 0.18) / 0.14, 0, 1);
    const portalOpacity = p < 0.35 ? 1 : clamp(1 - (p - 0.35) / 0.2, 0, 1);
    const scene2In = clamp((p - 0.42) / 0.12, 0, 1);
    const scene2Out = p < 0.88 ? 1 : clamp(1 - (p - 0.88) / 0.12, 0, 1);
    const scene2Opacity = scene2In * scene2Out;
    return { portalOpacity, cloudsOpacity, scene1Opacity, scene2Opacity };
  }

  function motionProgress(p) {
    if (p < 0.22) return easeInOut(p / 0.22) * 0.12;
    if (p < 0.55) return 0.12 + easeInOut((p - 0.22) / 0.33) * 0.78;
    return 0.9 + easeInOut((p - 0.55) / 0.45) * 0.1;
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

  // Card backgrounds (hero reel cards)
  document.querySelectorAll('[data-card]').forEach(function (el) {
    const idx = parseInt(el.getAttribute('data-card'), 10);
    if (!isNaN(idx) && CARD_IMAGES[idx]) {
      el.style.backgroundImage = 'url(' + CARD_IMAGES[idx] + ')';
    }
  });

  const LOOK_ICONS = [
    '<path d="M12 2l2.4 7.2H22l-6 4.4 2.3 7.2L12 16.8 5.7 20.8 8 13.6 2 9.2h7.6L12 2z"/>',
    '<path d="M12 3a9 9 0 100 18 9 9 0 000-18zm0 4a2 2 0 110 4 2 2 0 010-4zm0 6c2.2 0 4 1.1 4 2.5V17H8v-1.5C8 14.1 9.8 13 12 13z"/>',
    '<path d="M4 20V9.5L12 4l8 5.5V20H4zm5-2h6v-5H9v5z"/>',
    '<path d="M12 2.5C9 7 5.5 9.8 5.5 14a6.5 6.5 0 0013 0c0-4.2-3.5-7-6.5-11.5z"/>',
    '<path d="M3 18c3.5-1 5.5-4.5 9-4.5S17.5 17 21 18v2H3v-2zm0-5c3.5-1 5.5-4.5 9-4.5s5.5 3.5 9 4.5v2H3v-2zm0-5C6.5 7 8.5 4 12 4s5.5 3 9 4v2H3V8z"/>',
    '<path d="M3 19l5.5-11 3.2 6.2L14 9l7 10H3z"/>',
    '<path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 5v4.2l3 1.8-.9 1.5L11 12V7h2z"/>',
    '<path d="M4.5 20c2.2-7 5.2-10.5 7.5-15.5 2.3 5 5.3 8.5 7.5 15.5H4.5z"/>',
    '<path d="M2 13.5C5 12.2 7.5 8 12 8s7 4.2 10 5.5v2.2H2v-2.2zM4 18h16v2H4v-2z"/>',
  ];

  // Portfolio cards live in the conventional cloud section below
  const portfolioGrid = document.getElementById('fbs-portfolio-grid');
  if (portfolioGrid) {
    ARC_CARDS.forEach(function (card, i) {
      const el = document.createElement('article');
      el.className = 'fbs-look-card';
      const iconPath = LOOK_ICONS[i % LOOK_ICONS.length];
      el.innerHTML =
        '<div class="fbs-look-icon" aria-hidden="true">' +
        '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">' +
        iconPath +
        '</svg>' +
        '</div>' +
        '<h3 class="fbs-look-title">' +
        card.title +
        '</h3>' +
        '<p class="fbs-look-desc">' +
        card.desc +
        '</p>';
      portfolioGrid.appendChild(el);
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
    // Light damping — snappier than before
    scrollProgressValue = lerp(scrollProgressValue, scrollProgressTarget, 0.18);

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

  requestAnimationFrame(rafLoop);

  // GSAP: content crossfade only — sky stays the same fixed layer
  function initHandoff() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    if (portfolioInner) {
      gsap.fromTo(
        portfolioInner,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: portfolioEl,
            start: 'top 90%',
            end: 'top 40%',
            scrub: 0.55,
          },
        }
      );
    }

    const cards = portfolioGrid ? portfolioGrid.querySelectorAll('.fbs-look-card') : [];
    if (cards.length) {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 28, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          ease: 'none',
          stagger: 0.03,
          scrollTrigger: {
            trigger: portfolioGrid,
            start: 'top 90%',
            end: 'top 45%',
            scrub: 0.5,
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
