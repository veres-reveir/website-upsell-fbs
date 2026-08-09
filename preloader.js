(function () {
  'use strict';

  var root = document.documentElement;
  var overlay = document.getElementById('fbs-preloader');
  var bar = document.getElementById('fbs-preloader-bar');

  if (!overlay) {
    root.classList.remove('fbs-loading');
    return;
  }

  // Long enough for the brand beat to land, short enough not to annoy
  var MIN_VISIBLE = 2600;
  // Never trap the visitor if a remote asset stalls
  var MAX_VISIBLE = 7000;
  var FADE_MS = 900;

  var startedAt = Date.now();
  var finished = false;
  var progress = 0;

  function setProgress(value) {
    progress = Math.max(progress, Math.min(value, 100));
    if (bar) bar.style.width = progress + '%';
  }

  // Creep forward on a curve so the bar reflects waiting without faking completion
  var creep = setInterval(function () {
    var elapsed = Date.now() - startedAt;
    setProgress(Math.min(88, (elapsed / MIN_VISIBLE) * 78));
  }, 120);

  function reveal() {
    if (finished) return;
    finished = true;
    clearInterval(creep);
    setProgress(100);

    overlay.classList.add('is-done');
    root.classList.remove('fbs-loading');

    window.setTimeout(function () {
      overlay.classList.add('is-hidden');
    }, FADE_MS);

    window.dispatchEvent(new CustomEvent('fbs:ready'));
  }

  function finishWhenReady() {
    var waited = Date.now() - startedAt;
    var remaining = Math.max(0, MIN_VISIBLE - waited);
    window.setTimeout(reveal, remaining);
  }

  // Above-the-fold imagery matters more than total page weight
  function heroImagesSettled() {
    var images = Array.prototype.slice.call(
      document.querySelectorAll('.fbs-shared-sky img, .wonder-portal img, .wonder-curtain img')
    );
    if (!images.length) return Promise.resolve();

    return Promise.all(
      images.map(function (img) {
        if (img.complete) return Promise.resolve();
        return new Promise(function (resolve) {
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', resolve, { once: true });
        });
      })
    );
  }

  var fontsSettled = document.fonts && document.fonts.ready
    ? document.fonts.ready
    : Promise.resolve();

  Promise.all([heroImagesSettled(), fontsSettled]).then(finishWhenReady, finishWhenReady);

  if (document.readyState === 'complete') {
    finishWhenReady();
  } else {
    window.addEventListener('load', finishWhenReady, { once: true });
  }

  window.setTimeout(reveal, MAX_VISIBLE);
})();
