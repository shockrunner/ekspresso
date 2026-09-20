(function () {
  const members = [...document.querySelectorAll('.team__member[data-team-index]')];
  const photos = document.querySelectorAll('.team__photo[data-team-index]');
  const texts = document.querySelectorAll('.team__member-text[data-team-index]');
  if (!members.length || !photos.length) return;

  const photoByIndex = {};
  photos.forEach((p) => {
    photoByIndex[p.getAttribute('data-team-index')] = p;
  });

  const textByIndex = {};
  texts.forEach((t) => {
    textByIndex[t.getAttribute('data-team-index')] = t;
    const lines = t.querySelectorAll('.line');
    lines.forEach((line, i) => {
      line.style.transitionDelay = (i * 0.08) + 's';
    });
  });

  // Photo i wipes away and text i fades out to reveal photo/text i + 1 at
  // the exact same moment the next member's trigger becomes visible, so
  // the photo and text for each person change together. The last pair has
  // no successor, so it stays put.
  const pairs = [];
  for (let i = 0; i < members.length - 1; i++) {
    const photo = photoByIndex[String(i)];
    const outgoingText = textByIndex[String(i)];
    const incomingText = textByIndex[String(i + 1)];
    const nextMember = members[i + 1];
    if (photo && nextMember) pairs.push({ el: nextMember, photo, outgoingText, incomingText });
  }
  if (!pairs.length) return;

  function applyPair(pair) {
    pair.photo.classList.add('is-swapped');
    if (pair.outgoingText) pair.outgoingText.classList.remove('is-current');
    if (pair.incomingText) pair.incomingText.classList.add('is-current', 'is-revealed');
  }

  function setupScrollSwap() {
    if (typeof IntersectionObserver === 'undefined') {
      pairs.forEach(applyPair);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const pair = pairs.find((p) => p.el === entry.target);
        if (!pair) return;
        applyPair(pair);
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
