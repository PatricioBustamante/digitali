// ── THEME TOGGLE ──
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

function syncThemeToggleAria() {
  if (!themeToggle) return;
  const current = html.getAttribute('data-theme') || 'light';
  const isDark = current === 'dark';
  themeToggle.setAttribute('aria-pressed', String(isDark));
  themeToggle.setAttribute(
    'aria-label',
    isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
  );
}

try {
  const savedTheme = localStorage.getItem('digitali-theme');
  if (savedTheme) html.setAttribute('data-theme', savedTheme);
} catch (e) { }
syncThemeToggleAria();

function toggleTheme() {
  const current = html.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', next);
  try { localStorage.setItem('digitali-theme', next); } catch (e) { }
  syncThemeToggleAria();
}

if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

// ── MOBILE MENU ──
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
const mobileLinks = document.querySelectorAll('.mobile-menu-links a');
const mobileFocusables = mobileMenu
  ? mobileMenu.querySelectorAll('a, button')
  : [];

function setMenuState(isOpen) {
  navToggle.classList.toggle('active', isOpen);
  mobileMenu.classList.toggle('active', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
  navToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
  mobileMenu.setAttribute('aria-hidden', String(!isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
  mobileFocusables.forEach(el => {
    if (isOpen) el.removeAttribute('tabindex');
    else el.setAttribute('tabindex', '-1');
  });
}

function closeMenu() {
  setMenuState(false);
}

navToggle.addEventListener('click', () => {
  const isOpen = !mobileMenu.classList.contains('active');
  setMenuState(isOpen);
});

mobileLinks.forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Close on Escape — keyboard accessibility
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
    closeMenu();
    navToggle.focus();
  }
});

// ── SCROLL HINT ──
const scrollHint = document.getElementById('scrollHint');
if (scrollHint) {
  let hintHidden = false;
  const updateHint = () => {
    const shouldHide = window.scrollY > 80;
    if (shouldHide !== hintHidden) {
      hintHidden = shouldHide;
      scrollHint.classList.toggle('is-hidden', hintHidden);
    }
  };
  window.addEventListener('scroll', updateHint, { passive: true });
  updateHint();
}

// ── STEPS · adaptive shuffle (FLIP) ──
const stepsFlow = document.getElementById('stepsFlow');
if (stepsFlow && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let shuffleTimer = null;
  let isVisible = false;
  let isHovered = false;

  const chips = () => Array.from(stepsFlow.querySelectorAll('.step-chip'));

  function shuffleSteps() {
    if (isHovered) return;
    const items = chips();
    if (items.length < 2) return;

    const firstRects = items.map(c => c.getBoundingClientRect());

    // Shuffle: pick two random non-equal indices and swap, several times for variety
    const shuffled = items.slice();
    for (let i = 0; i < 3; i++) {
      const a = Math.floor(Math.random() * shuffled.length);
      let b = Math.floor(Math.random() * shuffled.length);
      while (b === a) b = Math.floor(Math.random() * shuffled.length);
      [shuffled[a], shuffled[b]] = [shuffled[b], shuffled[a]];
    }
    shuffled.forEach(c => stepsFlow.appendChild(c));

    const lastRects = items.map(c => c.getBoundingClientRect());

    stepsFlow.classList.add('is-shuffling');
    items.forEach((c, i) => {
      const dx = firstRects[i].left - lastRects[i].left;
      const dy = firstRects[i].top - lastRects[i].top;
      if (dx === 0 && dy === 0) return;
      c.style.transition = 'none';
      c.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    requestAnimationFrame(() => {
      items.forEach(c => {
        c.style.transition = 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)';
        c.style.transform = '';
      });
      setTimeout(() => {
        items.forEach(c => {
          c.style.transition = '';
        });
        stepsFlow.classList.remove('is-shuffling');
      }, 600);
    });
  }

  function start() {
    if (shuffleTimer) return;
    shuffleTimer = setInterval(shuffleSteps, 7500);
  }

  function stop() {
    if (!shuffleTimer) return;
    clearInterval(shuffleTimer);
    shuffleTimer = null;
  }

  // Only run while the section is in view
  const visObserver = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
    if (isVisible) start(); else stop();
  }, { threshold: 0.25 });
  visObserver.observe(stepsFlow);

  // Pause while hovering or focusing inside, so users can read (WCAG 2.2.2)
  stepsFlow.addEventListener('mouseenter', () => { isHovered = true; });
  stepsFlow.addEventListener('mouseleave', () => { isHovered = false; });
  stepsFlow.addEventListener('focusin', () => { isHovered = true; });
  stepsFlow.addEventListener('focusout', () => { isHovered = false; });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else if (isVisible) start();
  });
}

// ── REVEAL ON SCROLL ──
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── COUNT-UP ANIMATION ──
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function finalValue(el) {
  const target = parseFloat(el.getAttribute('data-count'));
  const decimal = el.getAttribute('data-decimal');
  const suffix = el.getAttribute('data-suffix') || '';
  return (decimal !== null && decimal !== undefined && decimal !== '')
    ? target + '.' + decimal + suffix
    : target + suffix;
}

function animateNumber(el, duration) {
  duration = duration || 1800;
  if (el.dataset.animated === 'true') return;
  el.dataset.animated = 'true';

  // Respect reduced-motion: jump directly to final value (WCAG 2.3.3)
  if (prefersReducedMotion) {
    el.textContent = finalValue(el);
    return;
  }

  const target = parseFloat(el.getAttribute('data-count'));
  const suffix = el.getAttribute('data-suffix') || '';
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutCubic(progress);
    const current = Math.floor(target * eased);

    if (progress < 1) {
      el.textContent = current + suffix;
      requestAnimationFrame(tick);
    } else {
      el.textContent = finalValue(el);
    }
  }
  requestAnimationFrame(tick);
}

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    if (e.target.hasAttribute('data-animate')) {
      e.target.classList.add('in-view');
      e.target.querySelectorAll('[data-count]').forEach(num => animateNumber(num));
    } else if (e.target.hasAttribute('data-count')) {
      animateNumber(e.target);
    }
    countObserver.unobserve(e.target);
  });
}, { threshold: 0.2 });

document.querySelectorAll('[data-animate]').forEach(el => countObserver.observe(el));
document.querySelectorAll('[data-count]').forEach(el => {
  if (!el.closest('[data-animate]')) {
    countObserver.observe(el);
  }
});

// Fallback: trigger immediately for elements already in viewport on load
window.addEventListener('load', () => {
  const inViewport = (el) => {
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
  };
  document.querySelectorAll('[data-animate]').forEach(el => {
    if (!inViewport(el)) return;
    el.classList.add('in-view');
    el.querySelectorAll('[data-count]').forEach(num => animateNumber(num));
  });
  document.querySelectorAll('[data-count]').forEach(el => {
    if (el.dataset.animated === 'true') return;
    if (!el.closest('[data-animate]') && inViewport(el)) animateNumber(el);
  });
});

// ── HERO CANVAS · BULLETS ANIMATED BACKGROUND ──────────────────────
(function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width = 0, height = 0;
  let particles = [];
  let mouse = { x: -9999, y: -9999, active: false };
  let animationId = null;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initParticles();
  }

  function initParticles() {
    particles = [];
    const count = Math.min(400, Math.max(200, Math.floor((width * height) / 3500)));
    for (let i = 0; i < count; i++) particles.push(createParticle());
  }

  function createParticle() {
    const isAccent = Math.random() < 0.25;
    const sizeRand = Math.random();
    const baseSize = sizeRand < 0.6
      ? (Math.random() * 1.8 + 1.2)
      : sizeRand < 0.9
        ? (Math.random() * 2 + 2.5)
        : (Math.random() * 2.5 + 4);
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      baseSize,
      size: baseSize,
      opacity: Math.random() * 0.5 + 0.4,
      accent: isAccent,
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.025 + 0.008,
      depth: Math.random() * 0.7 + 0.3,
    };
  }

  function drawConnections() {
    const maxDist = 140;
    const maxDistSq = maxDist * maxDist;
    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < maxDistSq) {
          const dist = Math.sqrt(distSq);
          const alpha = Math.pow(1 - dist / maxDist, 1.4) * 0.6;
          if (p1.accent || p2.accent) {
            ctx.strokeStyle = `rgba(107, 158, 255, ${Math.min(1, alpha * 1.6)})`;
            ctx.lineWidth = 1.1;
          } else {
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 0.8;
          }
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
  }

  function update() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx * p.depth;
      p.y += p.vy * p.depth;
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;
      p.pulsePhase += p.pulseSpeed;
      const pulse = (Math.sin(p.pulsePhase) + 1) / 2;
      p.size = p.baseSize * (0.7 + pulse * 0.6);

      if (mouse.active) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const distSq = dx * dx + dy * dy;
        const interactRadius = 120;
        if (distSq < interactRadius * interactRadius) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / interactRadius) * 1.5;
          const angle = Math.atan2(dy, dx);
          p.x += Math.cos(angle) * force;
          p.y += Math.sin(angle) * force;
        }
      }
    }

    drawConnections();

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const pulse = (Math.sin(p.pulsePhase) + 1) / 2;
      const currentOpacity = p.opacity * (0.6 + pulse * 0.4);

      if (p.accent) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(107, 158, 255, ${currentOpacity * 0.18})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(107, 158, 255, ${currentOpacity * 0.35})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(140, 180, 255, ${Math.min(1, currentOpacity * 2)})`;
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * 0.15})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, currentOpacity * 1.3)})`;
        ctx.fill();
      }
    }

    animationId = requestAnimationFrame(update);
  }

  function start() {
    if (animationId) cancelAnimationFrame(animationId);
    if (prefersReducedMotion) {
      for (let i = 0; i < particles.length; i++) {
        particles[i].vx = 0;
        particles[i].vy = 0;
        particles[i].pulseSpeed = 0;
      }
    }
    update();
  }

  // Pause when hero is offscreen
  const heroEl = document.getElementById('hero');
  const heroVisibilityObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        if (!animationId) start();
      } else if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    });
  }, { threshold: 0 });
  if (heroEl) heroVisibilityObserver.observe(heroEl);

  // Mouse interaction
  if (heroEl) {
    heroEl.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    });
    heroEl.addEventListener('mouseleave', () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    });
  }

  // Resize
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  resize();
  start();
})();
