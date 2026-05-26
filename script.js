document.documentElement.classList.add('js');

const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const revealItems = document.querySelectorAll('.reveal');
const hero = document.querySelector('.hero');
const heroTransform = document.querySelector('[data-transform-title]');
const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const isHomePage = document.body.classList.contains('home-page');
let lockedScrollY = 0;

document.querySelectorAll('#current-year').forEach((year) => {
  year.textContent = new Date().getFullYear();
});

const syncHeader = () => {
  if (!header) {
    return;
  }

  let isScrolled = window.scrollY > 24;

  if (isHomePage && hero) {
    const heroBottom = hero.getBoundingClientRect().bottom;
    isScrolled = heroBottom <= header.offsetHeight;
  }

  header.classList.toggle('scrolled', isScrolled);
  header.classList.toggle('is-scrolled', isScrolled);
};

syncHeader();
window.addEventListener('scroll', syncHeader, { passive: true });
window.addEventListener('resize', syncHeader);

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
  const serviceNavGroups = Array.from(siteNav.querySelectorAll('.nav-services'));
  const galleryNavGroups = Array.from(siteNav.querySelectorAll('.nav-gallery'));
  const navSubgroups = Array.from(siteNav.querySelectorAll('.nav-subgroup'));

  const resetMobileNavState = () => {
    galleryNavGroups.forEach((group) => {
      group.classList.add('is-collapsed');
    });

    serviceNavGroups.forEach((group) => {
      group.classList.remove('is-open');
    });

    navSubgroups.forEach((subgroup) => {
      subgroup.classList.add('is-collapsed');
      const toggle = subgroup.querySelector('.nav-subgroup-toggle');

      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
      }
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
        (
          link.parentElement?.classList.contains('nav-services') ||
          link.parentElement?.classList.contains('nav-gallery') ||
          link.classList.contains('nav-subgroup-toggle')
        )
      ) {
        return;
      }

      setNavOpen(false);
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) {
      galleryNavGroups.forEach((group) => {
        group.classList.remove('is-collapsed');
      });
      serviceNavGroups.forEach((group) => {
        group.classList.remove('is-open');
      });
      navSubgroups.forEach((subgroup) => {
        subgroup.classList.remove('is-collapsed');
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
  serviceNavGroups.forEach((group) => {
    const trigger = group.querySelector(':scope > a');

    if (!trigger) {
      return;
    }

    trigger.addEventListener('click', (event) => {
      if (window.innerWidth > 760) {
        return;
      }

      event.preventDefault();
      group.classList.toggle('is-open');
    });
  });

  galleryNavGroups.forEach((group) => {
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

  navSubgroups.forEach((subgroup) => {
    const toggle = subgroup.querySelector('.nav-subgroup-toggle');

    if (!toggle) {
      return;
    }

    toggle.addEventListener('click', (event) => {
      if (window.innerWidth > 760) {
        return;
      }

      const href = toggle.getAttribute('href');

      if (subgroup.classList.contains('is-collapsed')) {
        event.preventDefault();
        subgroup.classList.remove('is-collapsed');
        toggle.setAttribute('aria-expanded', 'true');
        return;
      }

      if (href) {
        window.location.href = href;
      }
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

const motionAwareObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) {
      return;
    }

    entry.target.classList.add('visible');
    motionAwareObserver.unobserve(entry.target);
  });
}, { threshold: 0.15 });

document.querySelectorAll('.service-item, .about-block').forEach((item) => {
  motionAwareObserver.observe(item);
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

const processConsultation = document.querySelector('[data-process-consultation]');

if (processConsultation) {
  const processCards = Array.from(document.querySelectorAll('[data-process-card]'));
  const processTitle = processConsultation.querySelector('[data-process-title]');
  const processText = processConsultation.querySelector('[data-process-text]');
  const processTags = Array.from(processConsultation.querySelectorAll('[data-process-tag]'));
  const defaultConsultation = {
    title: processTitle?.textContent || '',
    text: processText?.textContent || '',
    tags: []
  };
  let activeProcessCard = null;
  let processUpdateTimer = null;

  const setActiveTags = (activeTags) => {
    processTags.forEach((tag) => {
      const isActive = activeTags.includes(tag.dataset.processTag);
      tag.classList.toggle('is-active', isActive);
      tag.classList.toggle('is-gold', isActive && tag.dataset.processTag === '綜合演出');
    });
  };

  const renderProcessConsultation = (card = null) => {
    const nextTitle = card?.dataset.processTitle || defaultConsultation.title;
    const nextText = card?.dataset.processText || defaultConsultation.text;
    const nextTags = card?.dataset.processTags
      ? card.dataset.processTags.split(',').map((tag) => tag.trim()).filter(Boolean)
      : defaultConsultation.tags;

    window.clearTimeout(processUpdateTimer);
    processConsultation.classList.add('is-changing');

    processUpdateTimer = window.setTimeout(() => {
      if (processTitle) {
        processTitle.textContent = nextTitle;
      }

      if (processText) {
        processText.textContent = nextText;
      }

      setActiveTags(nextTags);
      processConsultation.classList.toggle('is-active', Boolean(card));
      processConsultation.classList.remove('is-changing');
    }, 120);
  };

  const setActiveProcessCard = (card = null) => {
    processCards.forEach((item) => {
      const isActive = item === card;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-pressed', String(isActive));
    });
  };

  processCards.forEach((card) => {
    card.addEventListener('mouseenter', () => {
      renderProcessConsultation(card);
      setActiveProcessCard(card);
    });

    card.addEventListener('mouseleave', () => {
      renderProcessConsultation(activeProcessCard);
      setActiveProcessCard(activeProcessCard);
    });

    card.addEventListener('focus', () => {
      renderProcessConsultation(card);
      setActiveProcessCard(card);
    });

    card.addEventListener('blur', () => {
      renderProcessConsultation(activeProcessCard);
      setActiveProcessCard(activeProcessCard);
    });

    card.addEventListener('click', () => {
      activeProcessCard = activeProcessCard === card ? null : card;
      renderProcessConsultation(activeProcessCard);
      setActiveProcessCard(activeProcessCard);
    });

    card.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }

      event.preventDefault();
      card.click();
    });
  });
}

const performanceDiary = document.querySelector('.performance-diary');

if (performanceDiary) {
  const serviceItems = Array.from(performanceDiary.querySelectorAll('.service-item[data-image]'));
  const currentPhoto = performanceDiary.querySelector('[data-service-photo-current]');
  const nextPhoto = performanceDiary.querySelector('[data-service-photo-next]');
  let activeItem = serviceItems[0] || null;
  let isTransitioning = false;

  if (activeItem && currentPhoto && nextPhoto) {
    const initialSource = activeItem.dataset.image;
    const initialAlt = activeItem.dataset.alt || `${activeItem.querySelector('h3')?.textContent || ''}演出照`;

    if (initialSource) {
      currentPhoto.src = initialSource;
      currentPhoto.alt = initialAlt;
      nextPhoto.src = initialSource;
      nextPhoto.alt = '';
    }
  }

  const setDiaryPhoto = (item) => {
    if (!item || item === activeItem || !currentPhoto || !nextPhoto || isTransitioning) {
      return;
    }

    const nextSource = item.dataset.image;

    if (!nextSource) {
      return;
    }

    isTransitioning = true;
    const nextAlt = item.dataset.alt || `${item.querySelector('h3')?.textContent || ''}演出照`;
    nextPhoto.src = nextSource;
    nextPhoto.alt = nextAlt;
    nextPhoto.classList.add('is-visible');

    const clearTransition = () => {
      window.clearTimeout(fallbackTimer);
      nextPhoto.removeEventListener('transitionend', onFadeComplete);
      currentPhoto.src = nextSource;
      currentPhoto.alt = nextAlt;
      nextPhoto.classList.remove('is-visible');
      isTransitioning = false;
    };

    const onFadeComplete = (event) => {
      if (event.propertyName !== 'opacity' || !nextPhoto.classList.contains('is-visible')) {
        return;
      }
      clearTransition();
    };

    const fallbackTimer = window.setTimeout(clearTransition, 650);
    nextPhoto.addEventListener('transitionend', onFadeComplete);
    activeItem = item;
  };

  if (activeItem) {
    activeItem.classList.add('is-active');
  }

  if ('IntersectionObserver' in window && serviceItems.length) {
    const performanceObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        serviceItems.forEach((item) => {
          item.classList.toggle('is-active', item === entry.target);
        });

        setDiaryPhoto(entry.target);
      });
    }, { threshold: 0.5 });

    serviceItems.forEach((item) => {
      performanceObserver.observe(item);
    });
  }
}

const albumLightbox = document.querySelector('[data-album-lightbox]');

if (albumLightbox) {
  const albumPhotos = document.querySelectorAll('[data-album-photo]');
  const lightboxImage = albumLightbox.querySelector('[data-album-lightbox-image]');
  const lightboxClose = albumLightbox.querySelector('[data-album-lightbox-close]');

  const closeAlbumLightbox = () => {
    albumLightbox.classList.remove('is-open', 'has-image');
    albumLightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-lightbox-open');

    if (lightboxImage) {
      lightboxImage.removeAttribute('src');
      lightboxImage.alt = '';
    }
  };

  const openAlbumLightbox = (photo) => {
    const embeddedImage = photo.querySelector('img');
    const imageSrc = photo.dataset.lightboxSrc || embeddedImage?.currentSrc || embeddedImage?.src || '';
    const imageAlt = embeddedImage?.alt || photo.getAttribute('aria-label') || '';

    if (imageSrc && lightboxImage) {
      lightboxImage.src = imageSrc;
      lightboxImage.alt = imageAlt;
      albumLightbox.classList.add('has-image');
    }

    albumLightbox.classList.add('is-open');
    albumLightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-lightbox-open');
    lightboxClose?.focus();
  };

  albumPhotos.forEach((photo) => {
    photo.addEventListener('click', () => {
      openAlbumLightbox(photo);
    });
  });

  lightboxClose?.addEventListener('click', closeAlbumLightbox);

  albumLightbox.addEventListener('click', (event) => {
    if (event.target === albumLightbox) {
      closeAlbumLightbox();
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && albumLightbox.classList.contains('is-open')) {
      closeAlbumLightbox();
    }
  });
}

const caseCategoryCards = document.querySelectorAll('.case-category-card');

if (caseCategoryCards.length) {
  const sparkColors = ['#e84a4a', '#f5a623', '#f5c842', '#ff6b35', '#ffd700'];
  const sparkTimers = new WeakMap();
  const sparkState = new WeakMap();

  const spawnCaseSparks = (card) => {
    const firecracker = card.querySelector('.firecracker');

    if (!firecracker) {
      return;
    }

    const rect = firecracker.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let index = 0; index < 10; index += 1) {
      const particle = document.createElement('div');
      const size = 4 + Math.random() * 5;
      const angle = Math.random() * Math.PI * 2;
      const distance = 20 + Math.random() * 40;
      const offsetX = Math.cos(angle) * distance;
      const offsetY = Math.sin(angle) * distance - 10;
      const color = sparkColors[Math.floor(Math.random() * sparkColors.length)];

      particle.className = 'spark-particle';
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${centerX}px`;
      particle.style.top = `${centerY}px`;
      particle.style.background = color;
      particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      document.body.appendChild(particle);

      particle.animate([
        {
          opacity: 1,
          transform: 'translate(-50%, -50%) scale(1)'
        },
        {
          opacity: 0,
          transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) scale(0)`
        }
      ], {
        duration: 500 + Math.random() * 300,
        easing: 'ease-out'
      }).onfinish = () => {
        particle.remove();
      };
    }
  };

  caseCategoryCards.forEach((card) => {
    card.addEventListener('mouseenter', () => {
      sparkState.set(card, false);

      const timer = window.setTimeout(() => {
        if (sparkState.get(card)) {
          return;
        }

        spawnCaseSparks(card);
        sparkState.set(card, true);
      }, 350);

      sparkTimers.set(card, timer);
    });

    card.addEventListener('mouseleave', () => {
      const timer = sparkTimers.get(card);

      if (timer) {
        window.clearTimeout(timer);
      }

      sparkState.set(card, false);
    });
  });
}

/* ── Cinematic about-page text reveal ────────────────────────
   Each .ctb block is observed individually.  When 20 % of a
   block enters the viewport both its .ctb-phrase and
   .ctb-support get .is-visible — CSS handles the 150 ms
   stagger between them via transition-delay on .ctb-support.
   Fires once per block (unobserved immediately after trigger).
   ─────────────────────────────────────────────────────────── */

(function initCinematicReveal() {
  const blocks = document.querySelectorAll('.ctb');
  if (!blocks.length) return;

  /* Skip animation if user prefers reduced motion */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    blocks.forEach((b) => {
      b.querySelector('.ctb-phrase')?.classList.add('is-visible');
      b.querySelector('.ctb-support')?.classList.add('is-visible');
    });
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const phrase  = entry.target.querySelector('.ctb-phrase');
      const support = entry.target.querySelector('.ctb-support');

      /* Phrase appears first; support follows via CSS transition-delay */
      phrase?.classList.add('is-visible');
      support?.classList.add('is-visible');

      io.unobserve(entry.target);   /* play once only */
    });
  }, {
    threshold: 0.20,                /* trigger when 20 % visible */
    rootMargin: '0px 0px -60px 0px' /* slight bottom offset for feel */
  });

  blocks.forEach((block) => io.observe(block));
}());
