const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const revealItems = document.querySelectorAll('.reveal');
const hero = document.querySelector('.hero');
const heroTransform = document.querySelector('[data-transform-title]');
const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let lockedScrollY = 0;

const syncHeader = () => {
  header.classList.toggle('is-scrolled', window.scrollY > 24);
};

syncHeader();
window.addEventListener('scroll', syncHeader, { passive: true });

const lockBodyScroll = () => {
  lockedScrollY = window.scrollY;
  document.body.classList.add('is-nav-open');
  document.body.style.position = 'fixed';
  document.body.style.top = `-${lockedScrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';
};

const unlockBodyScroll = () => {
  document.body.classList.remove('is-nav-open');
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.width = '';
  window.scrollTo(0, lockedScrollY);
};

if (navToggle && siteNav) {
  const navGroups = Array.from(siteNav.querySelectorAll('.nav-services, .nav-gallery'));

  const resetMobileNavState = () => {
    navGroups.forEach((group) => {
      group.classList.add('is-collapsed');
    });

    siteNav.scrollTop = 0;
  };

  const setNavOpen = (isOpen) => {
    siteNav.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));

    if (window.innerWidth <= 760) {
      if (isOpen) {
        lockBodyScroll();
      } else {
        unlockBodyScroll();
        resetMobileNavState();
      }
    }
  };

  navToggle.addEventListener('click', () => {
    setNavOpen(!siteNav.classList.contains('is-open'));
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (
        window.innerWidth <= 760 &&
        (link.parentElement?.classList.contains('nav-services') || link.parentElement?.classList.contains('nav-gallery'))
      ) {
        return;
      }

      setNavOpen(false);
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) {
      navGroups.forEach((group) => {
        group.classList.remove('is-collapsed');
      });
    } else {
      resetMobileNavState();
    }

    if (window.innerWidth > 760 && siteNav.classList.contains('is-open')) {
      setNavOpen(false);
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && siteNav.classList.contains('is-open')) {
      setNavOpen(false);
    }
  });
  navGroups.forEach((group) => {
    const trigger = group.querySelector(':scope > a');

    if (!trigger) {
      return;
    }

    trigger.addEventListener('click', (event) => {
      if (window.innerWidth > 760) {
        return;
      }

      event.preventDefault();
      group.classList.toggle('is-collapsed');
    });
  });

  if (window.innerWidth <= 760) {
    resetMobileNavState();
  }
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.18 });

revealItems.forEach((item) => {
  revealObserver.observe(item);
});

const syncHeroState = () => {
  if (!hero) {
    return;
  }

  if (!heroTransform) {
    return;
  }

  const rect = heroTransform.getBoundingClientRect();
  const travel = Math.max(heroTransform.offsetHeight - window.innerHeight, 1);
  const progress = Math.min(Math.max((-rect.top) / travel, 0), 1);

  heroTransform.style.setProperty('--hero-progress', progress.toFixed(4));
};

syncHeroState();
window.addEventListener('scroll', syncHeroState, { passive: true });
window.addEventListener('resize', syncHeroState);

if (hero && !reduceMotionQuery.matches) {
  let pointerTargetX = 0;
  let pointerTargetY = 0;
  let pointerCurrentX = 0;
  let pointerCurrentY = 0;
  let heroFrame = null;

  const animateHeroPointer = () => {
    pointerCurrentX += (pointerTargetX - pointerCurrentX) * 0.08;
    pointerCurrentY += (pointerTargetY - pointerCurrentY) * 0.08;

    hero.style.setProperty('--hero-pointer-x', `${pointerCurrentX.toFixed(2)}px`);
    hero.style.setProperty('--hero-pointer-y', `${pointerCurrentY.toFixed(2)}px`);

    heroFrame = window.requestAnimationFrame(animateHeroPointer);
  };

  const updateHeroPointer = (event) => {
    const rect = hero.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
    const offsetY = (event.clientY - rect.top) / rect.height - 0.5;

    pointerTargetX = offsetX * 28;
    pointerTargetY = offsetY * 18;
  };

  const resetHeroPointer = () => {
    pointerTargetX = 0;
    pointerTargetY = 0;
  };

  hero.addEventListener('pointermove', updateHeroPointer);
  hero.addEventListener('pointerleave', resetHeroPointer);
  hero.addEventListener('pointercancel', resetHeroPointer);

  animateHeroPointer();

  reduceMotionQuery.addEventListener('change', (event) => {
    if (event.matches) {
      if (heroFrame) {
        window.cancelAnimationFrame(heroFrame);
      }
      hero.style.setProperty('--hero-pointer-x', '0px');
      hero.style.setProperty('--hero-pointer-y', '0px');
    }
  });
}

const flipCards = document.querySelectorAll('.service-card-flip');

const toggleFlipCard = (card) => {
  const willFlip = !card.classList.contains('is-flipped');

  flipCards.forEach((item) => {
    item.classList.remove('is-flipped');
    item.setAttribute('aria-pressed', 'false');
  });

  if (willFlip) {
    card.classList.add('is-flipped');
    card.setAttribute('aria-pressed', 'true');
  }
};

flipCards.forEach((card) => {
  card.addEventListener('click', () => {
    toggleFlipCard(card);
  });

  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleFlipCard(card);
    }
  });
});
