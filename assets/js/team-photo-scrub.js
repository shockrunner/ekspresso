(function () {
  const members = [...document.querySelectorAll('.team__member[data-team-index]')];
  const photos = document.querySelectorAll('.team__photo[data-team-index]');
  if (!members.length || !photos.length) return;

  const photoByIndex = {};
  photos.forEach((p) => {
    photoByIndex[p.getAttribute('data-team-index')] = p;
  });

  // Photo i wipes away to reveal photo i + 1 at the exact same moment the
  // next member's text becomes visible (same trigger as the sitewide
  // line-mask reveal), so the photo and text for each person change
  // together. The last photo has no successor, so it never wipes away.
  const pairs = [];
  for (let i = 0; i < members.length - 1; i++) {
    const photo = photoByIndex[String(i)];
    const nextMember = members[i + 1];
    if (photo && nextMember) pairs.push({ el: nextMember, photo });
  }
  if (!pairs.length) return;

  function setupScrollSwap() {
    if (typeof IntersectionObserver === 'undefined') {
      pairs.forEach(({ photo }) => photo.classList.add('is-swapped'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const pair = pairs.find((p) => p.el === entry.target);
        if (!pair) return;
        pair.photo.classList.add('is-swapped');
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px 0px -10% 0px',
    });

    pairs.forEach(({ el }) => observer.observe(el));
  }

  // Same safety as the text reveal: wait for a full page load before
  // observing, otherwise the very first intersection check can fire
  // unreliably and swap every photo at once.
  if (document.readyState === 'complete') {
    setupScrollSwap();
  } else {
    window.addEventListener('load', setupScrollSwap);
  }
})();
