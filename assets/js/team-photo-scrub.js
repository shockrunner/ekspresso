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

  // The active member is derived fresh from scroll position on every
  // update, rather than a one-shot trigger, so scrolling back up smoothly
  // reverses the transition (previous photo/text reappear) instead of
  // being stuck once passed.
  let lastActive = -1;

  function computeActiveIndex() {
    const vh = window.innerHeight;
    const triggerY = vh * 0.7;
    let active = 0;
    for (let i = 1; i < members.length; i++) {
      if (members[i].getBoundingClientRect().top <= triggerY) active = i;
    }
    return active;
  }

  function update() {
    const active = computeActiveIndex();
    if (active === lastActive) return;
    lastActive = active;

    members.forEach((_, i) => {
      const text = textByIndex[String(i)];
      if (text) {
        const isActive = i === active;
        text.classList.toggle('is-current', isActive);
        text.classList.toggle('is-revealed', isActive);
      }
      const photo = photoByIndex[String(i)];
      if (photo) photo.classList.toggle('is-swapped', active > i);
    });
  }

  function start() {
    if (window.lenis && typeof window.lenis.on === 'function') {
      window.lenis.on('scroll', update);
    } else {
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          update();
        });
      }, { passive: true });
    }
    window.addEventListener('resize', update);
    update();
  }

  // Same load-time safety as the text reveal: querying layout before the
  // page has painted once can read unstable geometry.
  if (document.readyState === 'complete') {
    start();
  } else {
    window.addEventListener('load', start);
  }
})();
