(function () {
  // On mobile the team block is a plain stacked list (team-photo-scrub.js
  // is off there), so its quotes, authors and body texts become ordinary
  // scroll-revealed groups like every other text on the page. The static
  // is-revealed/is-current on the first member is desktop-only state.
  if (window.matchMedia('(max-width: 767px)').matches) {
    document.querySelectorAll('.team__member-text').forEach((t) => {
      t.classList.remove('is-revealed', 'is-current');
    });
    document
      .querySelectorAll('.team__member-text .heading, .team__member-text .team__author, .team__member-text .body-text')
      .forEach((el) => el.setAttribute('data-reveal-lines', ''));
  }

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

  // Start after the first layout pass rather than on window 'load':
  // 'load' waits for every image on the page, which on a phone over
  // mobile data can take a minute or more, leaving all scroll-revealed
  // text hidden until then. Every photo sits in a box with a fixed size
  // or aspect-ratio, so the layout is already final before images load.
  requestAnimationFrame(() => requestAnimationFrame(setupScrollReveal));
})();
