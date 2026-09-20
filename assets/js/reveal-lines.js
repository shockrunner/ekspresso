(function () {
  const groups = document.querySelectorAll('[data-reveal-lines]');
  if (!groups.length) return;

  groups.forEach((group) => {
    const lines = group.querySelectorAll('.line');
    lines.forEach((line, i) => {
      line.style.transitionDelay = (i * 0.08) + 's';
    });
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      groups.forEach((group) => group.classList.add('is-revealed'));
    });
  });
})();
