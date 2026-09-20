(function () {
  if (typeof Lenis === 'undefined') return;

  const lenis = new Lenis({
    anchors: true,
  });
  window.lenis = lenis;

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
})();
