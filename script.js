const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const revealItems = document.querySelectorAll('.reveal');
const hero = document.querySelector('.hero');
const heroTransform = document.querySelector('[data-transform-title]');

const syncHeader = () => {
  header.classList.toggle('is-scrolled', window.scrollY > 24);
};

syncHeader();
window.addEventListener('scroll', syncHeader, { passive: true });

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
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

document.querySelector('.contact-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  window.alert('感謝您的洽詢，我們將盡快與您聯繫。');
});

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
