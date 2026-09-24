(function () {
  const strip = document.querySelector('.shots-strip');
  const track = document.querySelector('.shots-track');
  if (!strip || !track) return;

  let setWidth = track.scrollWidth / 2;
  let position = 0;
  let dragging = false;
  let startX = 0;
  let startPosition = 0;
  let lastTime = null;

  function getDurationMs() {
    const raw = getComputedStyle(track).getPropertyValue('--marquee-duration');
    const n = parseFloat(raw);
    return isNaN(n) || n <= 0 ? 60000 : n;
  }

  function normalize(pos) {
    let p = pos % setWidth;
    if (p < 0) p += setWidth;
    return p;
  }

  function apply() {
    track.style.transform = `translateX(${-position}px)`;
  }

  function recalc() {
    if (!setWidth) return;
    setWidth = track.scrollWidth / 2 || setWidth;
    position = normalize(position);
  }

  function frame(time) {
    if (lastTime === null) lastTime = time;
    const dt = time - lastTime;
    lastTime = time;

    if (!dragging && setWidth) {
      const speed = setWidth / getDurationMs();
      position = normalize(position + speed * dt);
      apply();
    }
    requestAnimationFrame(frame);
  }

  function pointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    dragging = true;
    startX = e.clientX;
    startPosition = position;
    track.classList.add('is-dragging');
    track.setPointerCapture(e.pointerId);
  }

  function pointerMove(e) {
    if (!dragging) return;
    const deltaX = e.clientX - startX;
    position = normalize(startPosition - deltaX);
    apply();
  }

  function pointerUp(e) {
    if (!dragging) return;
    dragging = false;
    track.classList.remove('is-dragging');
    try { track.releasePointerCapture(e.pointerId); } catch (err) {}
    lastTime = null;
  }

  track.style.animation = 'none';
  track.addEventListener('pointerdown', pointerDown);
  track.addEventListener('pointermove', pointerMove);
  track.addEventListener('pointerup', pointerUp);
  track.addEventListener('pointercancel', pointerUp);
  track.addEventListener('dragstart', (e) => e.preventDefault());

  window.addEventListener('resize', recalc);
  window.addEventListener('load', recalc);

  // Native lazy-loading never fires for shots parked off to the side of the
  // strip, so load the whole strip once it gets close vertically instead.
  const stripImages = track.querySelectorAll('img[loading="lazy"]');
  const loadStrip = () => stripImages.forEach((img) => { img.loading = 'eager'; });
  if (typeof IntersectionObserver === 'undefined') {
    loadStrip();
  } else {
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      loadStrip();
    }, { rootMargin: '1200px 0px' });
    io.observe(strip);
  }

  requestAnimationFrame(frame);
})();
