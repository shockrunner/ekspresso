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
})();
