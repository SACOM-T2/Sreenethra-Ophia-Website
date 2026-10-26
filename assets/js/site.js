// Shared behaviour for every page: the loading screen, theme switch, mobile menu,
// and the magnifier / enlarge view for screenshots.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- loading screen on every page load ---------- */
  if (root.classList.contains('is-loading')) {
    const started = performance.now();
    const finish = () => {
      const wait = Math.max(0, 800 - (performance.now() - started));
      setTimeout(() => {
        root.classList.add('is-loaded');
        setTimeout(() => root.classList.remove('is-loading', 'is-loaded'), 600);
      }, wait);
    };
    if (document.readyState === 'complete') finish();
    else window.addEventListener('load', finish, { once: true });
    setTimeout(finish, 3000); // never hold the page longer than this
  }

  /* ---------- theme ---------- */
  document.getElementById('theme')?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('ophia-theme', root.dataset.theme); } catch (e) {}
  });

  /* ---------- mobile menu ---------- */
  const menu = document.getElementById('menu'), menuBtn = document.getElementById('menuBtn');
  menuBtn?.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });

  /* ---------- magnifier over any [data-zoom] screen ---------- */
  const ZOOM = 2.2, R = 100;
  document.addEventListener('pointermove', (e) => {
    document.querySelectorAll('.loupe.on').forEach((l) => {
      if (!l.parentElement.contains(e.target)) l.classList.remove('on');
    });
    const box = e.target.closest?.('[data-zoom]');
    if (!box || e.pointerType !== 'mouse') return;
    const img = box.querySelector('img.on') || box.querySelector('img');
    if (!img || !img.naturalWidth) return;
    let loupe = box.querySelector('.loupe');
    if (!loupe) { loupe = document.createElement('div'); loupe.className = 'loupe'; box.appendChild(loupe); }
    const r = box.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    const h = r.width * img.naturalHeight / img.naturalWidth; // images fill the width from the top
    loupe.style.backgroundImage = `url("${img.currentSrc || img.src}")`;
    loupe.style.backgroundSize = `${r.width * ZOOM}px ${h * ZOOM}px`;
    loupe.style.backgroundPosition = `${-(x * ZOOM - R)}px ${-(y * ZOOM - R)}px`;
    loupe.style.left = `${x - R}px`; loupe.style.top = `${y - R}px`;
    loupe.classList.add('on');
  });

  /* ---------- enlarge on click ---------- */
  const zoom = document.getElementById('zoom');
  document.addEventListener('click', (e) => {
    const box = e.target.closest('[data-zoom]');
    if (box) {
      const img = box.querySelector('img.on') || box.querySelector('img');
      if (!img) return;
      zoom.querySelector('img').src = img.currentSrc || img.src;
      zoom.querySelector('img').alt = img.alt;
      zoom.querySelector('p').textContent = box.dataset.cap || img.alt || '';
      zoom.hidden = false;
    } else if (e.target.closest('#zoom')) zoom.hidden = true;
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') zoom.hidden = true; });

  /* ---------- sideways galleries ---------- */
  document.querySelectorAll('[data-scroll]').forEach((btn) => btn.addEventListener('click', () => {
    const g = document.getElementById(btn.dataset.scroll);
    g?.scrollBy({ left: Number(btn.dataset.dir) * g.clientWidth * 0.8, behavior: reduce ? 'auto' : 'smooth' });
  }));

  /* ---------- helper the page scripts share ---------- */
  window.Ophia = {
    reduce,
    screen: (name) => `assets/screens/${name}.webp`,
    esc: (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'),
    // Cross-fades a .stack element between images, adding each image on first use.
    show(stack, name, alt) {
      let img = stack.querySelector(`img[data-name="${name}"]`);
      if (!img) {
        img = document.createElement('img');
        img.dataset.name = name; img.src = `assets/screens/${name}.webp`; img.decoding = 'async';
        stack.insertBefore(img, stack.firstChild);
      }
      img.alt = alt || '';
      stack.querySelectorAll('img').forEach((i) => i !== img && i.classList.remove('on'));
      void img.offsetWidth; img.classList.add('on');
    },
  };
})();
