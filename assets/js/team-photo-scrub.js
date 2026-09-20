(function () {
  const members = [...document.querySelectorAll('.team__member[data-team-index]')];
  const photos = document.querySelectorAll('.team__photo[data-team-index]');
  if (!members.length || !photos.length) return;

  const photoByIndex = {};
  photos.forEach((p) => {
    photoByIndex[p.getAttribute('data-team-index')] = p;
  });

  // Photo i wipes away as the NEXT member's text (i + 1) scrolls into view,
  // revealing photo i + 1 underneath. The last photo has no successor, so
  // it just stays put once revealed.
  const triggers = [];
  for (let i = 0; i < members.length - 1; i++) {
    const photo = photoByIndex[String(i)];
    const nextMember = members[i + 1];
    if (photo && nextMember) triggers.push({ el: nextMember, photo });
  }

  function clamp01(v) {
    return Math.max(0, Math.min(1, v));
  }

  function update() {
    const vh = window.innerHeight;
    const triggerStart = vh * 0.7;

    triggers.forEach(({ el, photo }) => {
      const rect = el.getBoundingClientRect();
      const progress = clamp01((triggerStart - rect.top) / (triggerStart + rect.height));
      photo.style.clipPath = 'inset(0 0 ' + (progress * 100).toFixed(2) + '% 0)';
    });
  }

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
})();
