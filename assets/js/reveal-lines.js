(function () {
  const groups = document.querySelectorAll('[data-reveal-lines]');
  if (!groups.length) return;

  groups.forEach((group) => {
    const lines = group.querySelectorAll('.line');
    lines.forEach((line, i) => {
      line.style.transitionDelay = (i * 0.08) + 's';
    });
  });

  if (typeof IntersectionObserver === 'undefined') {
    groups.forEach((group) => group.classList.add('is-revealed'));
    return;
  }

  // Wait for at least one real render pass before observing: creating the
  // observer and calling observe() before the document has ever been
  // painted can make the very first intersection report unreliable, causing
  // every target (even ones far below the fold) to fire as intersecting.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        });
      }, {
        threshold: 0.2,
        rootMargin: '0px 0px -10% 0px',
      });

      groups.forEach((group) => observer.observe(group));
    });
  });
})();
