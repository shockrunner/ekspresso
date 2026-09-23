(function () {
  const groups = document.querySelectorAll('[data-reveal-lines]');

  // Headings/paragraphs outside the hero are hand-broken into several
  // .line-mask chunks at desktop's much wider column width. At mobile
  // widths those fixed break points are wrong (a word that could still
  // fit on a line gets pushed down because it belongs to the next
  // hard-coded chunk instead of reflowing naturally). Below 768px,
  // collapse each multi-chunk group into a single chunk so the browser
  // wraps the whole thing exactly like a normal paragraph, matching the
  // Figma mobile frame's natural text wrap. The hero already reads
  // correctly as multiple deliberate chunks, so it is left alone.
  // Team member quotes/body-text use their own reveal mechanism (class
  // toggling in team-photo-scrub.js, no data-reveal-lines attribute),
  // so they are included here explicitly as well.
  if (window.matchMedia('(max-width: 767px)').matches) {
    const mergeGroups = document.querySelectorAll(
      '[data-reveal-lines], .team__member-text .heading, .team__member-text .body-text'
    );
    mergeGroups.forEach((group) => {
      if (group.closest('.hero')) return;
      const masks = group.querySelectorAll(':scope > .line-mask');
      if (masks.length <= 1) return;
      const html = [...masks]
        .map((mask) => {
          const line = mask.querySelector('.line');
          return line ? line.innerHTML : '';
        })
        .join(' ');
      group.innerHTML = '<span class="line-mask"><span class="line">' + html + '</span></span>';
    });
  }

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
