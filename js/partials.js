/* Partial loader · injects shared <header>/<footer> markup into pages.
   Must run BEFORE js/script.js so the latter can bind to nav/menu elements.
   Uses string templates (no fetch) → works on file:// and http:// equally. */
(function injectPartials() {
  var isSubdir = location.pathname.indexOf('/services/') !== -1;
  var base = isSubdir ? '../' : './';

  var headerHTML =
    '<header>' +
      '<nav aria-label="Navegación principal">' +
        '<a href="' + base + 'index.html" class="nav-logo" aria-label="Digitali · Inicio">' +
          '<img src="' + base + 'assets/digitali-logo.svg" alt="">' +
        '</a>' +
        '<div class="nav-links">' +
          '<div class="has-submenu">' +
            '<a href="' + base + 'index.html#services" class="submenu-trigger" aria-haspopup="true" aria-expanded="false">Servicios<span class="submenu-chevron" aria-hidden="true"></span></a>' +
            '<ul class="submenu" role="menu">' +
              '<li role="none"><a role="menuitem" href="' + base + 'services/data.html"><span class="submenu-title">Datos</span><span class="submenu-desc">Arquitectura, gobierno, calidad y analítica</span></a></li>' +
              '<li role="none"><a role="menuitem" href="' + base + 'services/artificial-intelligence.html"><span class="submenu-title">Inteligencia Artificial</span><span class="submenu-desc">ML, GenAI y agentes en producción</span></a></li>' +
              '<li role="none"><a role="menuitem" href="' + base + 'services/software-factory.html"><span class="submenu-title">Software Factory</span><span class="submenu-desc">Productos digitales potenciados por IA</span></a></li>' +
            '</ul>' +
          '</div>' +
          '<a href="' + base + 'index.html#achievements">Clientes</a>' +
          '<a href="' + base + 'index.html#cases">Casos</a>' +
          '<a href="' + base + 'index.html#why">Por qué elegirnos</a>' +
          '<a href="' + base + 'index.html#cta" class="nav-cta">Hablemos<span aria-hidden="true"> →</span></a>' +
          '<button class="theme-toggle" id="themeToggle" aria-label="Cambiar a modo oscuro" aria-pressed="false">' +
            '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
              '<circle cx="12" cy="12" r="4" />' +
              '<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />' +
            '</svg>' +
            '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
              '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />' +
            '</svg>' +
          '</button>' +
          '<button class="hamburger" id="navToggle" aria-label="Abrir menú" aria-expanded="false" aria-controls="mobileMenu">' +
            '<span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>' +
          '</button>' +
        '</div>' +
      '</nav>' +
    '</header>' +
    '<div class="mobile-menu" id="mobileMenu" aria-hidden="true">' +
      '<div class="mobile-menu-links">' +
        '<div class="mobile-has-submenu">' +
          '<button type="button" class="mobile-submenu-toggle" aria-expanded="false" aria-controls="mobileServicesSub" tabindex="-1">' +
            '<span class="mobile-submenu-label">Servicios</span>' +
            '<span class="mobile-submenu-chevron" aria-hidden="true"></span>' +
          '</button>' +
          '<div class="mobile-submenu" id="mobileServicesSub" aria-hidden="true">' +
            '<a href="' + base + 'index.html#services" tabindex="-1">Ver todos los servicios</a>' +
            '<a href="' + base + 'services/data.html" tabindex="-1">Datos</a>' +
            '<a href="' + base + 'services/artificial-intelligence.html" tabindex="-1">Inteligencia Artificial</a>' +
            '<a href="' + base + 'services/software-factory.html" tabindex="-1">Software Factory</a>' +
          '</div>' +
        '</div>' +
        '<a href="' + base + 'index.html#achievements" tabindex="-1">Clientes</a>' +
        '<a href="' + base + 'index.html#cases" tabindex="-1">Casos</a>' +
        '<a href="' + base + 'index.html#why" tabindex="-1">Por qué elegirnos</a>' +
      '</div>' +
      '<div class="mobile-menu-footer">' +
        '<a href="' + base + 'index.html#cta" class="nav-cta" tabindex="-1">Hablemos<span aria-hidden="true"> →</span></a>' +
      '</div>' +
    '</div>';

  var footerHTML =
    '<footer>' +
      '<div class="footer-logo"><img loading="lazy" decoding="async" src="' + base + 'assets/digitali-logo.svg" alt="Digitali"></div>' +
      '<div>digitali.cl · Santiago, Chile · Data &amp; Software Factory desde 2016</div>' +
      '<div>© 2026 Digitali</div>' +
    '</footer>';

  var headerSlot = document.querySelector('[data-include="header"]');
  if (headerSlot) headerSlot.outerHTML = headerHTML;

  var footerSlot = document.querySelector('[data-include="footer"]');
  if (footerSlot) footerSlot.outerHTML = footerHTML;

  // aria-current="page" on nav links matching the current pathname
  var pageFile = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var navLinks = document.querySelectorAll('header nav a[href], .mobile-menu a[href]');
  for (var i = 0; i < navLinks.length; i++) {
    var a = navLinks[i];
    try {
      var url = new URL(a.getAttribute('href'), location.href);
      var hrefFile = (url.pathname.split('/').pop() || 'index.html').toLowerCase();
      if (hrefFile === pageFile && !url.hash) {
        a.setAttribute('aria-current', 'page');
      }
    } catch (e) { /* ignore */ }
  }

  // Sync aria-expanded on submenu triggers (hover + focus)
  var submenus = document.querySelectorAll('.has-submenu');
  submenus.forEach(function (container) {
    var trigger = container.querySelector('.submenu-trigger');
    if (!trigger) return;
    var setOpen = function (open) { trigger.setAttribute('aria-expanded', String(open)); };
    container.addEventListener('mouseenter', function () { setOpen(true); });
    container.addEventListener('mouseleave', function () { setOpen(false); });
    container.addEventListener('focusin', function () { setOpen(true); });
    container.addEventListener('focusout', function (e) {
      if (!container.contains(e.relatedTarget)) setOpen(false);
    });
  });

  // Mobile submenu accordion toggle
  document.querySelectorAll('.mobile-submenu-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var isOpen = btn.getAttribute('aria-expanded') === 'true';
      var next = !isOpen;
      btn.setAttribute('aria-expanded', String(next));
      var targetId = btn.getAttribute('aria-controls');
      var panel = targetId ? document.getElementById(targetId) : null;
      if (panel) panel.setAttribute('aria-hidden', String(!next));
      var wrap = btn.closest('.mobile-has-submenu');
      if (wrap) wrap.classList.toggle('open', next);
    });
  });
})();
