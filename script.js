const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const revealItems = document.querySelectorAll('.reveal');
const inkParticles = document.querySelector('.ink-particles');
const hero = document.querySelector('.hero');
const heroTrace = document.querySelector('.hero-dragon-trace');

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

if (inkParticles) {
  for (let index = 0; index < 18; index += 1) {
    const particle = document.createElement('span');
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.animationDuration = `${10 + Math.random() * 12}s`;
    particle.style.animationDelay = `${Math.random() * -12}s`;
    inkParticles.appendChild(particle);
  }
}

const syncParallax = () => {
  if (!hero) {
    return;
  }

  const offset = Math.min(window.scrollY * 0.18, 120);
  hero.style.backgroundPosition = `center calc(50% + ${offset}px)`;

  if (heroTrace) {
    heroTrace.style.transform = `translate3d(0, ${offset * -0.18}px, 0)`;
  }
};

syncParallax();
window.addEventListener('scroll', syncParallax, { passive: true });

document.querySelector('.contact-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  window.alert('感謝您的洽詢，我們將盡快與您聯繫。');
});
