// The Ophia logo in 3D, above the home page headline. Needs three.js (loaded before this file).
// Falls back to the flat logo when WebGL is unavailable.
(() => {
  const host = document.getElementById('ring3d');
  if (!host) return;
  const fallback = () => { host.innerHTML = '<img src="assets/img/ophia-logo.png" alt="">'; };
  if (!window.THREE) return fallback();

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (e) { return fallback(); }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0, 5.4);

  // The logo is a flat ring, about a third of its radius thick, with a small notch at
  // three o'clock where the two ends meet.
  const R = 1, r = 0.66, GAP = 0.09;
  const shape = new THREE.Shape();
  shape.absarc(0, 0, R, GAP, Math.PI * 2 - GAP, false);
  shape.absarc(0, 0, r, Math.PI * 2 - GAP, GAP, true);
  shape.closePath();
  const DEPTH = 0.24;
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: DEPTH, curveSegments: 120, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.035, bevelSegments: 5,
  });
  geo.translate(0, 0, -DEPTH / 2);

  // Colour runs diagonally, as in the logo: cyan at the top left, teal at the top right,
  // blue at the bottom right.
  const stops = ['#13d3ea', '#00c4bf', '#0a74de'].map((h) => new THREE.Color(h).convertSRGBToLinear());
  const pos = geo.attributes.position, colors = [], c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const t = Math.min(1, Math.max(0, (pos.getX(i) - pos.getY(i) + 1.25) / 2.5)) * 2;
    if (t < 1) c.copy(stops[0]).lerp(stops[1], t); else c.copy(stops[1]).lerp(stops[2], t - 1);
    colors.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const ring = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.38, metalness: 0.05 }));
  scene.add(ring);

  scene.add(new THREE.AmbientLight(0xffffff, 0.78));
  const key = new THREE.DirectionalLight(0xffffff, 0.65); key.position.set(2, 3, 5); scene.add(key);
  const side = new THREE.DirectionalLight(0xbff4ff, 0.35); side.position.set(-4, -1, 2); scene.add(side);

  const size = () => {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  size();
  new ResizeObserver(size).observe(host);

  let mx = 0, my = 0;
  window.addEventListener('pointermove', (e) => {
    mx = (e.clientX / innerWidth) * 2 - 1; my = (e.clientY / innerHeight) * 2 - 1;
  }, { passive: true });

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let visible = true;
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(host);
  const t0 = performance.now();
  const frame = (now) => {
    const t = (now - t0) / 1000;
    // a slow turn either way, never edge-on, leaning towards the pointer
    ring.rotation.y += ((Math.sin(t * 0.7) * 0.55 + mx * 0.3) - ring.rotation.y) * 0.06;
    ring.rotation.x += ((Math.cos(t * 0.5) * 0.18 + my * 0.25) - ring.rotation.x) * 0.06;
    ring.position.y = Math.sin(t * 1.1) * 0.04;
    renderer.render(scene, camera);
  };
  if (reduce) { frame(t0); return; }
  const loop = (now) => { if (visible && !document.hidden) frame(now); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
})();
