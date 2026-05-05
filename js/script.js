// ── THEME TOGGLE ──
const themeToggle = document.getElementById('themeToggle');
const themeToggleMobile = document.getElementById('themeToggleMobile');
const html = document.documentElement;
try {
  const savedTheme = localStorage.getItem('digitali-theme');
  if (savedTheme) html.setAttribute('data-theme', savedTheme);
} catch (e) { }

function toggleTheme() {
  const current = html.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', next);
  try { localStorage.setItem('digitali-theme', next); } catch (e) { }
}

if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
if (themeToggleMobile) themeToggleMobile.addEventListener('click', toggleTheme);

// ── MOBILE MENU ──
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
const mobileLinks = document.querySelectorAll('.mobile-menu-links a');

function closeMenu() {
  navToggle.classList.remove('active');
  mobileMenu.classList.remove('active');
}

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  mobileMenu.classList.toggle('active');
});

mobileLinks.forEach(link => {
  link.addEventListener('click', closeMenu);
});

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
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function animateNumber(el, duration) {
  duration = duration || 1800;
  if (el.dataset.animated === 'true') return;
  el.dataset.animated = 'true';

  const target = parseFloat(el.getAttribute('data-count'));
  const decimal = el.getAttribute('data-decimal');
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
      // Valor final exacto
      if (decimal !== null && decimal !== undefined && decimal !== '') {
        el.textContent = target + '.' + decimal + suffix;
      } else {
        el.textContent = target + suffix;
      }
    }
  }
  requestAnimationFrame(tick);
}

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      if (e.target.hasAttribute('data-animate')) {
        // Achievement cell: activar barra azul + animar números internos
        e.target.classList.add('in-view');
        e.target.querySelectorAll('[data-count]').forEach(num => animateNumber(num));
      } else if (e.target.hasAttribute('data-count')) {
        animateNumber(e.target);
      }
      countObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.4 });

// Observar achievement cells (manejan sus números internos)
document.querySelectorAll('[data-animate]').forEach(el => countObserver.observe(el));

// Observar números standalone (que no están dentro de un .achievement-cell)
document.querySelectorAll('[data-count]').forEach(el => {
  if (!el.closest('[data-animate]')) {
    countObserver.observe(el);
  }
});
