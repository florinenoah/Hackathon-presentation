const progressBar = document.querySelector('.progress span');
const revealItems = document.querySelectorAll('.reveal');
const map = document.querySelector('.map');
const mapZoomIn = document.querySelector('.map-plus');
const mapZoomOut = document.querySelector('.map-minus');
const mapLocate = document.querySelector('.map-locate');
const navLinks = [...document.querySelectorAll('.topbar nav a')];

mapZoomIn?.addEventListener('click', () => map?.classList.add('map-zoomed'));
mapZoomOut?.addEventListener('click', () => map?.classList.remove('map-zoomed'));
mapLocate?.addEventListener('click', () => {
  map?.classList.remove('map-zoomed');
  map?.classList.add('map-locating');
  window.setTimeout(() => map?.classList.remove('map-locating'), 900);
});

const sectionLinks = navLinks.map((link) => ({
  link,
  section: document.querySelector(link.getAttribute('href'))
}));

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      sectionLinks.forEach(({ link, section }) => link.classList.toggle('active', section === entry.target));
    }
  });
}, { rootMargin: '-35% 0px -55% 0px' });

sectionLinks.forEach(({ section }) => section && sectionObserver.observe(section));

if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray('.feature-panel, .capability-card').forEach((panel, index) => {
    gsap.fromTo(panel, { y: 26 }, {
      y: index % 2 ? -8 : 0,
      ease: 'none',
      scrollTrigger: { trigger: panel, start: 'top bottom', end: 'bottom top', scrub: 1.2 }
    });
  });

  gsap.to('.hero-backdrop', {
    yPercent: 12,
    scale: 1.16,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });

  gsap.to('.phone', {
    rotate: -4,
    y: -28,
    ease: 'none',
    scrollTrigger: { trigger: '.solution', start: 'top bottom', end: 'bottom top', scrub: true }
  });

  gsap.to('.closing-bg', {
    scale: 1.14,
    ease: 'none',
    scrollTrigger: { trigger: '.closing', start: 'top bottom', end: 'bottom top', scrub: true }
  });
}

const updateProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = `${scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0}%`;
};

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index * 70, 280)}ms`;
  revealObserver.observe(item);
});

window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();
