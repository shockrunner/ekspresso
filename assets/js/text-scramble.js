(function () {
  const CHARS = '!<>-_\\/[]{}—=+*^?#АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЭЮЯABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const DURATION = 400;
  const originalText = new WeakMap();

  function randomChar() {
    return CHARS[(Math.random() * CHARS.length) | 0];
  }

  function collectTextNodes(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue && node.nodeValue.trim().length) nodes.push(node);
    }
    return nodes;
  }

  function scramble(el) {
    if (el._scrambleRAF) cancelAnimationFrame(el._scrambleRAF);

    const nodes = collectTextNodes(el);
    if (!nodes.length) return;

    const originals = nodes.map((n) => {
      if (!originalText.has(n)) originalText.set(n, n.nodeValue);
      return originalText.get(n);
    });

    let totalChars = 0;
    originals.forEach((t) => { totalChars += t.length; });

    const entries = [];
    let idx = 0;
    originals.forEach((text, ni) => {
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        const scrambleable = /[a-zA-Zа-яА-ЯёЁ0-9]/.test(ch);
        const start = (idx / totalChars) * DURATION * 0.5;
        const end = start + DURATION * 0.3 + Math.random() * DURATION * 0.3;
        entries.push({ ni, i, scrambleable, start, end });
        idx++;
      }
    });

    const buffers = originals.map((t) => t.split(''));
    const startTime = performance.now();

    function frame() {
      const elapsed = performance.now() - startTime;
      let doneCount = 0;
      entries.forEach((e) => {
        if (!e.scrambleable) { doneCount++; return; }
        if (elapsed >= e.end) {
          buffers[e.ni][e.i] = originals[e.ni][e.i];
          doneCount++;
        } else {
          buffers[e.ni][e.i] = randomChar();
        }
      });
      nodes.forEach((n, ni) => { n.nodeValue = buffers[ni].join(''); });

      if (doneCount < entries.length) {
        el._scrambleRAF = requestAnimationFrame(frame);
      } else {
        el._scrambleRAF = null;
        nodes.forEach((n, ni) => { n.nodeValue = originals[ni]; });
      }
    }

    el._scrambleRAF = requestAnimationFrame(frame);
  }

  const targets = document.querySelectorAll('.site-nav a, .footer-dev a, .btn');
  targets.forEach((el) => {
    el.addEventListener('mouseenter', () => scramble(el));
  });
})();
