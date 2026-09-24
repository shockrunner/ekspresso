(function () {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if (!toggle || !nav) return;

  // While the menu is open the page must not move: stop Lenis, hide the
  // root overflow, and swallow touch/wheel scrolling (iOS Safari doesn't
  // reliably honour overflow:hidden on the root for touch scrolling).
  const preventScroll = (e) => e.preventDefault();

  function lockScroll() {
    if (window.lenis) window.lenis.stop();
    document.documentElement.classList.add('menu-open');
    document.addEventListener('touchmove', preventScroll, { passive: false });
    document.addEventListener('wheel', preventScroll, { passive: false });
  }

  function unlockScroll() {
    document.removeEventListener('touchmove', preventScroll);
    document.removeEventListener('wheel', preventScroll);
    document.documentElement.classList.remove('menu-open');
    if (window.lenis) window.lenis.start();
  }

  // Menu links also close the menu; that runs on the link itself, before
  // Lenis's window-level anchor handler, so scrolling is unlocked by the
  // time Lenis scrolls to the section.
  function close() {
    if (!nav.classList.contains('is-open')) return;
    toggle.classList.remove('is-open');
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    unlockScroll();
  }

  function open() {
    toggle.classList.add('is-open');
    nav.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    lockScroll();
  }

  toggle.addEventListener('click', () => {
    if (nav.classList.contains('is-open')) close();
    else open();
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', close);
  });

  document.addEventListener('click', (e) => {
    if (!nav.classList.contains('is-open')) return;
    if (nav.contains(e.target) || toggle.contains(e.target)) return;
    close();
  });
})();
