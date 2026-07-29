(function () {
  'use strict';

  var scrollSpace = document.querySelector('[data-ink-scroll]');
  if (!scrollSpace) return;

  var frame = scrollSpace.querySelector('.ink-scroll-frame');

  // 這個查詢字串必須和 css/pages/dragon-lion-introduction.css 裡水墨舞台的
  // @media 完全一致。先前 JS 用的是 min(innerWidth, innerHeight) < 700，
  // 和 CSS 對不上：1400×650 這種「寬但矮」的桌機視窗，CSS 會套桌機的
  // 430vh sticky 版面，JS 卻判定為手機而不掛捲動監聽 —— 結果是捲過四個
  // 螢幕高的釘住舞台，獅子不動、敘事段落也不出現。
  var MOBILE_QUERY = '(max-width: 760px), (max-height: 700px) and (max-width: 1000px)';
  var mobileQuery = window.matchMedia(MOBILE_QUERY);
  function isMobileNow() { return mobileQuery.matches; }
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

    if (isMobileNow()) {
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

    if (isMobileNow()) {
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

  function applyLayoutMode() {
    scrollSpace.classList.toggle('is-mobile-ink', isMobileNow());
    if (isMobileNow()) initMobileBeats();
    scheduleUpdate();
  }

  applyLayoutMode();

  // 捲動監聽一律掛上：update() 在手機時會自己早退，成本可忽略。
  // 這樣視窗縮放跨過斷點時（例如把桌機視窗拉矮）不需要重新載入頁面。
  window.addEventListener('scroll', scheduleUpdate, { passive: true });

  if (typeof mobileQuery.addEventListener === 'function') {
    mobileQuery.addEventListener('change', applyLayoutMode);
  } else if (typeof mobileQuery.addListener === 'function') {
    mobileQuery.addListener(applyLayoutMode);
  }

  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('pageshow', scheduleUpdate);
  document.addEventListener('visibilitychange', scheduleUpdate);

  // 除錯把手：?inkp=0.3 載入即跳至指定敘事進度。手機上會暫停自動播放並顯示該影格。
  if (hasDebugProgress) {
    if (!isMobileNow()) {
      var rangePx = scrollSpace.offsetHeight - window.innerHeight;
      window.scrollTo({ top: rangePx * debugProgress, behavior: 'instant' });
    }
  }

  update();
})();
