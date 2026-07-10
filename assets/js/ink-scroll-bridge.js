(function () {
  'use strict';

  var scrollSpace = document.querySelector('[data-ink-scroll]');
  if (!scrollSpace) return;

  var frame = scrollSpace.querySelector('.ink-scroll-frame');
  var frameReady = false;
  var firstSync = true;
  var ticking = false;

  function clamp(value) {
    return Math.max(0, Math.min(1, value));
  }

  function readProgress() {
    var rect = scrollSpace.getBoundingClientRect();
    var pageTop = window.scrollY + rect.top;
    var range = Math.max(1, scrollSpace.offsetHeight - window.innerHeight);
    return clamp((window.scrollY - pageTop) / range);
  }

  function sendProgress(progress) {
    if (!frameReady || !frame || !frame.contentWindow) return;

    try {
      var api = frame.contentWindow.__inkLion;
      if (!api) return;

      if (firstSync && typeof api.snap === 'function') {
        api.snap(progress);
        firstSync = false;
      } else {
        api.target = progress;
      }
    } catch (error) {
      frameReady = false;
    }
  }

  function update() {
    ticking = false;

    var progress = readProgress();
    var bounds = scrollSpace.getBoundingClientRect();
    var active = bounds.top <= 0 && bounds.bottom > window.innerHeight;
    var introOpacity = clamp(1 - progress / 0.13);
    var hintOpacity = clamp(1 - progress / 0.08);

    scrollSpace.style.setProperty('--ink-progress', progress.toFixed(4));
    scrollSpace.style.setProperty('--ink-intro-opacity', introOpacity.toFixed(4));
    scrollSpace.style.setProperty('--ink-hint-opacity', hintOpacity.toFixed(4));
    document.body.classList.toggle('ink-scroll-active', active);
    sendProgress(progress);
  }

  function scheduleUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  if (frame) {
    var markFrameReady = function () {
      frameReady = true;
      firstSync = true;
      update();
    };

    frame.addEventListener('load', markFrameReady);

    try {
      if (frame.contentDocument && frame.contentDocument.readyState === 'complete') {
        markFrameReady();
      }
    } catch (error) {
      frameReady = false;
    }
  }

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('pageshow', scheduleUpdate);
  update();
})();
