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

  gsap.fromTo('.solution-head', { opacity: 0, y: 22 }, {
    opacity: 1,
    y: 0,
    duration: 0.65,
    delay: 0.12,
    ease: 'power3.out'
  });

  gsap.fromTo('.phone-stage', { scale: 0.92, opacity: 0 }, {
    scale: 1,
    opacity: 1,
    duration: 0.85,
    delay: 0.3,
    ease: 'back.out(1.4)',
    scrollTrigger: { trigger: '.solution', start: 'top 75%', once: true }
  });

  gsap.utils.toArray('.feature-panel, .capability-card:not(.constat-card):not(.module-card)').forEach((panel, index) => {
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

  gsap.fromTo('.solution-floaters span', { opacity: 0, scale: .72 }, {
    opacity: 1,
    scale: 1,
    duration: .7,
    stagger: .12,
    ease: 'back.out(1.6)',
    scrollTrigger: { trigger: '.solution', start: 'top 70%', once: true }
  });

  gsap.to('.closing-bg', {
    scale: 1.14,
    ease: 'none',
    scrollTrigger: { trigger: '.closing', start: 'top bottom', end: 'bottom top', scrub: true }
  });

  // Objectifs : arrivée horizontale gauche -> droite
  gsap.fromTo('.objectif-row', { x: -70, opacity: 0 }, {
    x: 0,
    opacity: 1,
    duration: 0.65,
    stagger: 0.14,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.objectifs-list', start: 'top 78%', once: true }
  });

}

// Animation d'écriture manuscrite en temps réel (Problématique + Merci)
document.querySelectorAll('.write-reveal').forEach((el) => {
  const rawText = el.textContent.trim();
  const words = rawText.split(/\s+/);

  el.innerHTML = words.map((word) => {
    const chars = [...word].map((char) => `<span class="char">${char}</span>`).join('');
    return `<span class="word">${chars}</span>`;
  }).join('<span class="space"> </span>') + '<span class="pen-cursor"></span>';

  const chars = el.querySelectorAll('.char');
  const cursor = el.querySelector('.pen-cursor');

  if (window.gsap && window.ScrollTrigger) {
    gsap.set(chars, { opacity: 0, y: 5, scale: 0.9 });

    gsap.to(chars, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.04,
      stagger: 0.02,
      ease: 'power1.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 82%',
        once: true
      },
      onComplete: () => {
        if (cursor) {
          gsap.to(cursor, {
            opacity: 0,
            duration: 0.6,
            delay: 0.8,
            onComplete: () => { cursor.style.display = 'none'; }
          });
        }
      }
    });
  } else {
    chars.forEach((c) => { c.style.opacity = '1'; c.style.transform = 'none'; });
    if (cursor) cursor.style.display = 'none';
  }
});

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

// Modules : une seule grande carte à la fois, avec un passage « lentille de verre ».
const moduleCards = [...document.querySelectorAll(".module-card")];

if (moduleCards.length) {

    let activeModule = 0;
    let isModuleTransitioning = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    moduleCards.forEach((card, index) => {
        card.hidden = index !== 0;
        card.tabIndex = index === 0 ? 0 : -1;
    });

    async function showNextModule() {

        if (isModuleTransitioning) return;

        isModuleTransitioning = true;

        const current = moduleCards[activeModule];
        const nextIndex = (activeModule + 1) % moduleCards.length;
        const next = moduleCards[nextIndex];

        current.style.pointerEvents = "none";

        if (!reducedMotion && current.animate) {

            try {
                await current.animate(
                    [
                        {
                            opacity: 1,
                            filter: "blur(0px) saturate(1)",
                            transform: "translateX(0) scale(1) rotateY(0deg)"
                        },
                        {
                            opacity: 0,
                            filter: "blur(10px) saturate(.85)",
                            transform: "translateX(-12%) scale(.95) rotateY(6deg)"
                        }
                    ],
                    {
                        duration: 600,
                        easing: "cubic-bezier(.55,.05,.7,.2)",
                        fill: "forwards"
                    }
                ).finished;
            } catch {}
        }

        current.hidden = true;
        current.style.pointerEvents = "";
        current.tabIndex = -1;

        next.hidden = false;
        next.tabIndex = 0;

        activeModule = nextIndex;

        await new Promise(requestAnimationFrame);

        if (!reducedMotion && next.animate) {

            try {
                await next.animate(
                    [
                        {
                            opacity: 0,
                            filter: "blur(12px) brightness(1.25)",
                            transform: "translateX(12%) scale(.96) rotateY(-6deg)"
                        },
                        {
                            opacity: 1,
                            filter: "blur(0px) brightness(1)",
                            transform: "translateX(0) scale(1) rotateY(0deg)"
                        }
                    ],
                    {
                        duration: 720,
                        easing: "cubic-bezier(.16,1,.3,1)",
                        fill: "forwards"
                    }
                ).finished;
            } catch {}
        }

        next.focus({
            preventScroll: true
        });

        isModuleTransitioning = false;
    }

    moduleCards.forEach(card => {

        card.addEventListener("click", showNextModule);

        card.addEventListener("keydown", e => {

            if (e.key === "Enter" || e.key === " ") {

                e.preventDefault();

                showNextModule();

            }

        });

    });

}// La vidéo d'expérience conserve ses contrôles natifs, avec un bouton central plus élégant.
const demoVideo = document.querySelector('.demo-video');
const demoPlayButton = document.querySelector('.demo-play');
const demoVideoWrap = document.querySelector('.demo-video-wrap');
if (demoVideo && demoPlayButton && demoVideoWrap) {
  demoPlayButton.addEventListener('click', () => {
    demoVideo.play().catch(() => {});
  });
  demoVideo.addEventListener('play', () => demoVideoWrap.classList.add('is-playing'));
  demoVideo.addEventListener('pause', () => demoVideoWrap.classList.remove('is-playing'));
  demoVideo.addEventListener('ended', () => demoVideoWrap.classList.remove('is-playing'));
}

// Sections 01–03 : entrées lentes, nettes et naturelles, inspirées des interfaces iOS.
if (window.gsap && window.ScrollTrigger && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  gsap.fromTo('.problem .chapter-intro', { autoAlpha: 0, y: 38, filter: 'blur(8px)' }, {
    autoAlpha: 1,
    y: 0,
    filter: 'blur(0px)',
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.problem', start: 'top 70%', once: true }
  });

  gsap.fromTo('.problem .constat-card', { autoAlpha: 0, y: 66, scale: .94, rotateX: -7 }, {
    autoAlpha: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    duration: 1.05,
    stagger: .1,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.constats-grid', start: 'top 72%', once: true }
  });

  gsap.fromTo('.problematique-inner', { autoAlpha: 0, y: 40, scale: .97, filter: 'blur(10px)' }, {
    autoAlpha: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    duration: 1.15,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.problematique', start: 'top 68%', once: true }
  });

  gsap.fromTo('.objectifs .chapter-intro, .objectifs .defi-card', { autoAlpha: 0, y: 34 }, {
    autoAlpha: 1,
    y: 0,
    duration: .9,
    stagger: .14,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.objectifs', start: 'top 70%', once: true }
  });
}

// Prix : compte à rebours et confettis au premier passage dans la section.
const prizeSection = document.querySelector('#prix');
const countdown = prizeSection?.querySelector('.countdown');

if (countdown) {
  const deadline = new Date(countdown.dataset.deadline).getTime();
  const units = {
    days: countdown.querySelector('[data-countdown="days"]'),
    hours: countdown.querySelector('[data-countdown="hours"]'),
    minutes: countdown.querySelector('[data-countdown="minutes"]'),
    seconds: countdown.querySelector('[data-countdown="seconds"]')
  };

  const updateCountdown = () => {
    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      countdown.classList.add('is-finished');
      countdown.textContent = 'Le hackathon est lancé !';
      return true;
    }
    const totalSeconds = Math.floor(remaining / 1000);
    const values = [
      Math.floor(totalSeconds / 86400),
      Math.floor((totalSeconds % 86400) / 3600),
      Math.floor((totalSeconds % 3600) / 60),
      totalSeconds % 60
    ];
    Object.values(units).forEach((element, index) => { element.textContent = String(values[index]).padStart(2, '0'); });
    return false;
  };

  if (!updateCountdown()) {
    const timer = window.setInterval(() => { if (updateCountdown()) window.clearInterval(timer); }, 1000);
  }
}

const confettiCanvas = prizeSection?.querySelector('.prize-confetti');
if (prizeSection && confettiCanvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const context = confettiCanvas.getContext('2d');
  let hasCelebrated = false;

  const celebrate = () => {
    if (hasCelebrated) return;
    hasCelebrated = true;
    const bounds = prizeSection.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    confettiCanvas.width = bounds.width * pixelRatio;
    confettiCanvas.height = bounds.height * pixelRatio;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    const colors = ['#ffffff', '#8ee6ff', '#ffd166', '#ff7eb6', '#8cffbc'];
    const pieces = Array.from({ length: 170 }, (_, index) => ({
      x: bounds.width / 2 + (Math.random() - .5) * 90,
      y: bounds.height * .34 + (Math.random() - .5) * 30,
      vx: (Math.random() - .5) * 13,
      vy: -Math.random() * 12 - 4,
      gravity: .18 + Math.random() * .08,
      size: 5 + Math.random() * 8,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - .5) * .3,
      color: colors[index % colors.length],
      life: 0,
      maxLife: 100 + Math.random() * 55
    }));

    const animate = () => {
      context.clearRect(0, 0, bounds.width, bounds.height);
      let alive = false;
      pieces.forEach((piece) => {
        piece.life += 1;
        if (piece.life >= piece.maxLife) return;
        alive = true;
        piece.x += piece.vx;
        piece.y += piece.vy;
        piece.vy += piece.gravity;
        piece.vx *= .994;
        piece.rotation += piece.spin;
        context.save();
        context.globalAlpha = Math.min(1, (piece.maxLife - piece.life) / 25);
        context.translate(piece.x, piece.y);
        context.rotate(piece.rotation);
        context.fillStyle = piece.color;
        context.fillRect(-piece.size / 2, -piece.size / 3, piece.size, piece.size * .66);
        context.restore();
      });
      if (alive) window.requestAnimationFrame(animate);
      else context.clearRect(0, 0, bounds.width, bounds.height);
    };
    animate();
  };

  new IntersectionObserver((entries, observer) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      celebrate();
      observer.disconnect();
    }
  }, { threshold: .34 }).observe(prizeSection);
}


gsap.registerPlugin(ScrollTrigger);

const tl = gsap.timeline({

scrollTrigger:{

trigger:".defi-card",

start:"top 75%",

toggleActions:"play none none reverse"

}

});

tl.from(".defi-label",{

opacity:0,

y:25,

duration:.7,

ease:"power3.out"

})

.to(".hello-text span",{

opacity:1,

y:0,

scale:1,

filter:"blur(0px)",

backgroundPosition:"200%",

duration:2,

ease:"expo.out"

},"-=0.2");
