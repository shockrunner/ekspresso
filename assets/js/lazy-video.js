(function () {
  const videos = document.querySelectorAll('video[data-lazy-src]');
  if (!videos.length) return;

  function start(video) {
    video.src = video.getAttribute('data-lazy-src');
    video.removeAttribute('data-lazy-src');
    const p = video.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  }

  if (typeof IntersectionObserver === 'undefined') {
    videos.forEach(start);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      start(entry.target);
    });
  }, { rootMargin: '800px 0px' });

  videos.forEach((v) => observer.observe(v));
})();
