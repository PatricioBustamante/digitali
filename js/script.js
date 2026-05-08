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
