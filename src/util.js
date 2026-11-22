import * as THREE from 'three';

// ---------- seeded RNG (deterministic scenery) ----------
export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
}

// ---------- procedural canvas textures (no image files) ----------
export function canvasTex(w, h, draw, { repeat = null, srgb = true, aniso = 8 } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = aniso;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}

const noise = (g, w, h, n, a, r = rng(7), light = false) => {
  for (let i = 0; i < n; i++) {
    const v = light ? 255 : 0;
    g.fillStyle = `rgba(${v},${v},${v},${r() * a})`;
    g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2);
  }
};

export const TEX = {
  grass: () => canvasTex(512, 512, (g, w, h) => {
    const r = rng(3);
    g.fillStyle = '#4f8f3a'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) {
      const l = 30 + r() * 25;
      g.fillStyle = `hsl(${95 + r() * 25},${45 + r() * 20}%,${l}%)`;
      g.fillRect(r() * w, r() * h, 1.5, 3 + r() * 4);
    }
  }, { repeat: [60, 60] }),
  paving: () => canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#b9b2a4'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#8c857a'; g.lineWidth = 3;
    for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke(); g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.stroke(); }
    noise(g, w, h, 1500, 0.15);
  }, { repeat: [10, 10] }),
  asphalt: () => canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#3b3d42'; g.fillRect(0, 0, w, h); noise(g, w, h, 4000, 0.35, rng(5), true); }, { repeat: [20, 4] }),
  brick: () => canvasTex(256, 256, (g, w, h) => {
    const r = rng(11);
    g.fillStyle = '#c9c0b0'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < 16; y++) for (let x = -1; x < 8; x++) {
      const ox = (y % 2) * 16;
      g.fillStyle = `hsl(${10 + r() * 10},${45 + r() * 15}%,${36 + r() * 10}%)`;
      g.fillRect(x * 32 + ox + 1, y * 16 + 1, 30, 14);
    }
  }, { repeat: [14, 3] }),
  plaster: (col = '#f1ead7') => canvasTex(128, 128, (g, w, h) => { g.fillStyle = col; g.fillRect(0, 0, w, h); noise(g, w, h, 900, 0.07); }, { repeat: [4, 2] }),
  wood: () => canvasTex(256, 256, (g, w, h) => {
    const r = rng(9);
    for (let i = 0; i < 8; i++) {
      g.fillStyle = `hsl(${28 + r() * 8},${45 + r() * 10}%,${42 + r() * 10}%)`;
      g.fillRect(0, i * 32, w, 32);
      g.strokeStyle = 'rgba(60,30,10,.35)'; g.strokeRect(0, i * 32, w, 32);
      for (let k = 0; k < 14; k++) { g.strokeStyle = `rgba(70,35,10,${r() * 0.2})`; g.beginPath(); g.moveTo(0, i * 32 + r() * 32); g.lineTo(w, i * 32 + r() * 32); g.stroke(); }
    }
  }, { repeat: [5, 3] }),
  tiles: () => canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = '#d8d4c8'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#9fb3a6'; g.fillRect(0, 0, 64, 64); g.fillRect(64, 64, 64, 64);
    g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 2; g.strokeRect(0, 0, w, h);
    noise(g, w, h, 500, 0.08);
  }, { repeat: [14, 3] }),
  ceiling: () => canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = '#ecece8'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c3c3bd'; g.lineWidth = 2; g.strokeRect(0, 0, w, h); noise(g, w, h, 500, 0.06);
  }, { repeat: [10, 6] }),
  sky: () => canvasTex(16, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#2f6fc0'); gr.addColorStop(0.55, '#8cc3f0'); gr.addColorStop(0.5, '#cfe8fb'); gr.addColorStop(1, '#eaf5ff');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  }),
};

// ---------- material cache ----------
const cache = new Map();
export function mat(color, o = {}) {
  const key = color + JSON.stringify(o);
  if (!cache.has(key)) cache.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0, ...o }));
  return cache.get(key);
}

// ---------- mesh helpers ----------
export function box(w, h, d, m, x = 0, y = 0, z = 0, parent = null, shadow = true) {
  const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  me.position.set(x, y, z);
  me.castShadow = shadow; me.receiveShadow = true;
  if (parent) parent.add(me);
  return me;
}
export function cyl(rt, rb, h, m, x = 0, y = 0, z = 0, parent = null, seg = 16) {
  const me = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m);
  me.position.set(x, y, z); me.castShadow = true; me.receiveShadow = true;
  if (parent) parent.add(me);
  return me;
}
export function sph(r, m, x = 0, y = 0, z = 0, parent = null, sx = 1, sy = 1, sz = 1, seg = 20) {
  const me = new THREE.Mesh(new THREE.SphereGeometry(r, seg, seg - 4), m);
  me.position.set(x, y, z); me.scale.set(sx, sy, sz); me.castShadow = true;
  if (parent) parent.add(me);
  return me;
}
