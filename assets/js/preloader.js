(function () {
  // Preloader: photos flash in a 280x280 frame in the middle of the screen
  // until the page (and the hero video) is ready, then that square becomes
  // a window onto the hero and grows to the full screen.
  // Loaded synchronously right after the preloader markup, so it starts
  // before the rest of the page is parsed.
  const FRAME_MS = 80; // how long each photo stays on screen
  const MIN_MS = 1000; // show the photos at least this long
  const MAX_MS = 8000; // never hold the page longer than this
  const REVEAL_MS = 1100; // square mask growing to full screen (matches CSS)

  const root = document.documentElement;
  const overlay = document.querySelector('.preloader');

  let resolveDone;
  window.preloaderDone = new Promise((resolve) => { resolveDone = resolve; });
  if (!overlay) { resolveDone(); return; }

  root.classList.add('is-preloading');

  // The reveal opens onto the first screen, so a reload starts at the top.
  if (!location.hash) {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }

  const preventScroll = (e) => e.preventDefault();
  document.addEventListener('touchmove', preventScroll, { passive: false });
  document.addEventListener('wheel', preventScroll, { passive: false });

  // ---- photo cycle: hard cuts, no transitions, only photos already loaded ----
  const photos = Array.from(overlay.querySelectorAll('.preloader__frame img'));
  let index = -1;
  let current = null;
  function tick() {
    for (let n = 0; n < photos.length; n++) {
      index = (index + 1) % photos.length;
      const img = photos[index];
      if (img.complete && img.naturalWidth) {
        if (current) current.classList.remove('is-active');
        img.classList.add('is-active');
        current = img;
        return;
      }
    }
  }
  tick();
  const timer = setInterval(tick, FRAME_MS);

  // ---- wait for the page: DOM, window load, fonts and the hero video ----
  const domReady = new Promise((resolve) => {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', resolve, { once: true });
    else resolve();
  });

  domReady.then(() => {
    // Lenis is created by smooth-scroll.js, which has run by now.
    if (window.lenis) window.lenis.stop();
  });

  const pageLoaded = new Promise((resolve) => {
    if (document.readyState === 'complete') resolve();
    else window.addEventListener('load', resolve, { once: true });
  });

  const videoReady = domReady.then(() => new Promise((resolve) => {
    const video = document.querySelector('.hero__bg');
    if (!video || video.readyState >= 3) return resolve();
    video.addEventListener('canplay', resolve, { once: true });
    video.addEventListener('error', resolve, { once: true });
  }));

  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  Promise.race([
    Promise.all([domReady, pageLoaded, videoReady, fontsReady, wait(MIN_MS)]),
    wait(MAX_MS),
  ]).then(reveal);

  // ---- reveal: the photo frame turns into a window onto the hero and grows ----
  function reveal() {
    clearInterval(timer);
    const hero = document.querySelector('.hero');
    if (!hero) { overlay.remove(); finish(null); return; }

    const f = overlay.querySelector('.preloader__frame').getBoundingClientRect();
    const h = hero.getBoundingClientRect();
    hero.style.clipPath =
      'inset(' + (f.top - h.top) + 'px ' + (h.right - f.right) + 'px ' +
      (h.bottom - f.bottom) + 'px ' + (f.left - h.left) + 'px)';
    overlay.remove();

    // Commit the square as the transition's starting point, then grow it.
    getComputedStyle(hero).clipPath;
    hero.classList.add('is-unmasking');
    hero.style.clipPath = 'inset(0px 0px 0px 0px)';

    // Hero texts start sliding in while the square is still growing.
    setTimeout(resolveDone, REVEAL_MS * 0.4);
    setTimeout(() => finish(hero), REVEAL_MS + 50);
  }

  function finish(hero) {
    // Dropping clip-path also restores the header's mix-blend-mode, which
    // the clip's stacking context isolates while the mask is animating.
    if (hero) {
      hero.classList.remove('is-unmasking');
      hero.style.clipPath = '';
    }
    root.classList.remove('is-preloading');
    document.removeEventListener('touchmove', preventScroll);
    document.removeEventListener('wheel', preventScroll);
    if (window.lenis) window.lenis.start();
    resolveDone();
  }
})();
