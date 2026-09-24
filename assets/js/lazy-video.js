(function () {
  const videos = document.querySelectorAll('video[data-lazy-src]');
  if (!videos.length) return;

  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  const pick = (video, name) =>
    (isMobile && video.getAttribute(name + '-mobile')) || video.getAttribute(name);

  videos.forEach((video) => {
    const poster = pick(video, 'data-poster');
    if (poster) video.poster = poster;
  });

  function start(video) {
    video.src = pick(video, 'data-lazy-src');
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
