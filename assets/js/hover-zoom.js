(function () {
  const COOLDOWN_MS = 1500;
  const items = document.querySelectorAll(
    '.intro__media, .cph, .rph, .shot, .team__photo, .site-footer__media'
  );

  items.forEach((el) => {
    let lockedUntil = 0;

    el.addEventListener('mouseenter', () => {
      if (Date.now() < lockedUntil) return;
      el.classList.add('is-zoomed');
    });

    el.addEventListener('mouseleave', () => {
      el.classList.remove('is-zoomed');
      lockedUntil = Date.now() + COOLDOWN_MS;
    });
  });
})();
