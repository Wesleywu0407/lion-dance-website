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

  function smooth(edge0, edge1, x) {
    var t = clamp((x - edge0) / (edge1 - edge0));
    return t * t * (3 - 2 * t);
  }

  // 敘事節拍：data-range="起,迄"（0-1 進度）。子元素依序錯落浮現（印→題→文），
  // 離場整組較快淡出；捲動倒退時完整可逆。
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var STAGGER = 0.05;
  var beats = Array.prototype.map.call(
    scrollSpace.querySelectorAll('.ink-story-beat'),
    function (el) {
      var range = (el.getAttribute('data-range') || '0,1').split(',');
      return {
        el: el,
        from: parseFloat(range[0]),
        to: parseFloat(range[1]),
        parts: el.querySelectorAll('.ink-anim')
      };
    }
  );

  function updateBeats(progress) {
    beats.forEach(function (beat) {
      var t = (progress - beat.from) / (beat.to - beat.from);
      var inRange = t > 0 && t < 1;
      var exit = inRange ? 1 - smooth(0.84, 1, t) : 0;
      var full = 0;
      for (var i = 0; i < beat.parts.length; i++) {
        var enter = inRange ? smooth(i * STAGGER, 0.2 + i * STAGGER, t) : 0;
        var opacity = enter * exit;
        var part = beat.parts[i];
        part.style.opacity = opacity.toFixed(3);
        if (!reducedMotion) {
          part.style.transform = 'translateY(' + ((1 - enter) * 26).toFixed(1) + 'px)';
        }
        if (i === 0) full = opacity;
      }
      beat.el.classList.toggle('is-active', full > 0.5);
    });
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
    updateBeats(progress);
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

  // 除錯把手：?inkp=0.3 載入即跳至該敘事進度（同 ?debug3d 傳統）
  var inkp = parseFloat(new URLSearchParams(window.location.search).get('inkp'));
  if (!isNaN(inkp)) {
    var rangePx = scrollSpace.offsetHeight - window.innerHeight;
    window.scrollTo({ top: rangePx * Math.max(0, Math.min(1, inkp)), behavior: 'instant' });
  }
  update();
})();
