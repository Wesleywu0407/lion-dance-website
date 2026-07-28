(function () {
  'use strict';

  var scrollSpace = document.querySelector('[data-ink-scroll]');
  if (!scrollSpace) return;

  var frame = scrollSpace.querySelector('.ink-scroll-frame');
  var mobileQuery = window.matchMedia('(max-width: 760px)');
  var isMobile = mobileQuery.matches || Math.min(window.innerWidth, window.innerHeight) < 700;
  var inkp = parseFloat(new URLSearchParams(window.location.search).get('inkp'));
  var hasDebugProgress = !isNaN(inkp);
  var debugProgress = hasDebugProgress ? clamp(inkp) : 0;
  var frameReady = false;
  var firstSync = true;
  var ticking = false;
  var frameVisible = true;

  function clamp(value) {
    return Math.max(0, Math.min(1, value));
  }

  function smooth(edge0, edge1, x) {
    var t = clamp((x - edge0) / (edge1 - edge0));
    return t * t * (3 - 2 * t);
  }

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

  function updateDesktopBeats(progress) {
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

  function initMobileBeats() {
    beats.forEach(function (beat) {
      Array.prototype.forEach.call(beat.parts, function (part) {
        part.style.opacity = '';
        part.style.transform = '';
      });
    });

    if (!('IntersectionObserver' in window) || reducedMotion) {
      beats.forEach(function (beat) { beat.el.classList.add('is-mobile-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
          entry.target.classList.add('is-mobile-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    beats.forEach(function (beat) { observer.observe(beat.el); });
  }

  function readProgress() {
    var rect = scrollSpace.getBoundingClientRect();
    var pageTop = window.scrollY + rect.top;
    var range = Math.max(1, scrollSpace.offsetHeight - window.innerHeight);
    return clamp((window.scrollY - pageTop) / range);
  }

  function getFrameApi() {
    if (!frameReady || !frame || !frame.contentWindow) return null;
    try {
      return frame.contentWindow.__inkLion || null;
    } catch (error) {
      frameReady = false;
      return null;
    }
  }

  function syncFrame(progress) {
    var api = getFrameApi();
    if (!api) return;

    if (typeof api.setActive === 'function') api.setActive(frameVisible && !document.hidden);

    if (isMobile) {
      // 手機一律靜態：iframe 只畫第 0 格原畫一次就停掉 rAF。
      // ?inkp= 除錯把手在手機上不再改變畫面（靜態模式沒有其餘影格）。
      if (typeof api.setMode === 'function') api.setMode('static');
      return;
    }

    if (typeof api.setMode === 'function') api.setMode('scrub');
    if (firstSync && typeof api.snap === 'function') {
      api.snap(progress);
      firstSync = false;
    } else {
      api.target = progress;
    }
  }

  function update() {
    ticking = false;

    if (isMobile) {
      syncFrame(0);
      return;
    }

    var progress = readProgress();
    var bounds = scrollSpace.getBoundingClientRect();
    var active = bounds.top <= 0 && bounds.bottom > window.innerHeight;
    var introOpacity = clamp(1 - progress / 0.13);
    var hintOpacity = clamp(1 - progress / 0.08);

    scrollSpace.style.setProperty('--ink-progress', progress.toFixed(4));
    scrollSpace.style.setProperty('--ink-intro-opacity', introOpacity.toFixed(4));
    scrollSpace.style.setProperty('--ink-hint-opacity', hintOpacity.toFixed(4));
    document.body.classList.toggle('ink-scroll-active', active);
    updateDesktopBeats(progress);
    syncFrame(progress);
  }

  function scheduleUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  if (frame && 'IntersectionObserver' in window) {
    var frameObserver = new IntersectionObserver(function (entries) {
      frameVisible = entries[0] ? entries[0].isIntersecting : false;
      scheduleUpdate();
    }, { threshold: 0.01 });
    frameObserver.observe(frame);
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

  if (isMobile) {
    scrollSpace.classList.add('is-mobile-ink');
    initMobileBeats();
  } else {
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
  }

  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('pageshow', scheduleUpdate);
  document.addEventListener('visibilitychange', scheduleUpdate);

  // 除錯把手：?inkp=0.3 載入即跳至指定敘事進度。手機上會暫停自動播放並顯示該影格。
  if (hasDebugProgress) {
    if (!isMobile) {
      var rangePx = scrollSpace.offsetHeight - window.innerHeight;
      window.scrollTo({ top: rangePx * debugProgress, behavior: 'instant' });
    }
  }

  update();
})();
