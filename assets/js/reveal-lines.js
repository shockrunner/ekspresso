(function () {
  const groups = document.querySelectorAll('[data-reveal-lines]');
  if (!groups.length) return;

  groups.forEach((group) => {
    const lines = group.querySelectorAll('.line');
    lines.forEach((line, i) => {
      line.style.transitionDelay = (i * 0.08) + 's';
    });
  });

  // Hero content is visible the moment the page opens, so it reveals right
  // away rather than waiting on scroll position.
  const immediateGroups = document.querySelectorAll('[data-reveal-immediate]');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      immediateGroups.forEach((group) => group.classList.add('is-revealed'));
    });
  });

  const scrollGroups = document.querySelectorAll('[data-reveal-lines]:not([data-reveal-immediate])');
  if (!scrollGroups.length) return;

  function setupScrollReveal() {
    if (typeof IntersectionObserver === 'undefined') {
      scrollGroups.forEach((group) => group.classList.add('is-revealed'));
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

    scrollGroups.forEach((group) => observer.observe(group));
  }

  // Wait for the page to fully load before wiring up scroll-triggered
  // reveals: setting up the observer earlier (before images/fonts have
  // settled the layout) can make its first intersection check unreliable
  // and mark far-off-screen headings as revealed immediately.
  if (document.readyState === 'complete') {
    setupScrollReveal();
  } else {
    window.addEventListener('load', setupScrollReveal);
  }
})();
