(function () {
  'use strict';

  var page = document.querySelector('.intro-page');
  if (!page) return;

  var targets = page.querySelectorAll([
    '.intro-section-heading',
    '.intro-comparison-heading',
    '.intro-values li',
    '.intro-practice-media',
    '.intro-practice-copy',
    '.intro-process-heading',
    '.intro-process-list li',
    '.intro-faq-heading',
    '.intro-faq-row',
    '.intro-contact-copy',
    '.intro-contact-actions'
  ].join(','));

  targets.forEach(function (target, index) {
    target.classList.add('ink-text-reveal');
    target.style.setProperty('--ink-delay', Math.min(index % 4, 3) * 70 + 'ms');
  });

  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    targets.forEach(function (target) { target.classList.add('is-ink-visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
        entry.target.classList.add('is-ink-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });

  targets.forEach(function (target) { observer.observe(target); });
})();
