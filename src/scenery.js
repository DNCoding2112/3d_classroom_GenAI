import * as THREE from 'three';
import { TEX, mat, box, cyl, sph, rng, canvasTex } from './util.js';
import { plaque } from './world.js';

export function buildScenery(scene, colliders) {
  const G = new THREE.Group(); scene.add(G);
  const r = rng(42);
  const tickers = [];

  // ----- sky dome, sun, clouds -----
  const skyGeo = new THREE.SphereGeometry(500, 24, 16);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color('#2a6cc4') }, mid: { value: new THREE.Color('#9fd0f5') }, bot: { value: new THREE.Color('#e6f3ff') } },
    vertexShader: 'varying vec3 p; void main(){ p=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: 'uniform vec3 top,mid,bot; varying vec3 p; void main(){ float h=normalize(p).y; vec3 c = h>0. ? mix(mid,top,pow(h,.6)) : mix(mid,bot,min(1.,-h*3.)); gl_FragColor=vec4(c,1.); }',
  });
  scene.add(new THREE.Mesh(skyGeo, skyMat));
  const sun = new THREE.Mesh(new THREE.SphereGeometry(12, 20, 12), new THREE.MeshBasicMaterial({ color: '#fff3c4', fog: false }));
  sun.position.set(-180, 260, -120); scene.add(sun);
  const cloudM = new THREE.MeshStandardMaterial({ color: '#fff', roughness: 1, transparent: true, opacity: 0.93 });
  const clouds = [];
  for (let i = 0; i < 16; i++) {
    const c = new THREE.Group();
    for (let k = 0; k < 5; k++) sph(7 + r() * 6, cloudM, (k - 2) * 9 + r() * 4, r() * 3, r() * 6, c, 1.4, 0.6, 1, 10).castShadow = false;
    c.position.set((r() - 0.5) * 500, 90 + r() * 40, (r() - 0.5) * 500); scene.add(c); clouds.push(c);
  }
  tickers.push((dt) => clouds.forEach((c) => { c.position.x += dt * 1.2; if (c.position.x > 260) c.position.x = -260; }));

  // ----- ground -----
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), mat('#ffffff', { map: TEX.grass(), roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.05; ground.receiveShadow = true; G.add(ground);
  const pave = mat('#ffffff', { map: TEX.paving() });
  const slab = (w, d, x, z, m = pave, y = 0.03) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, d), m); p.rotation.x = -Math.PI / 2; p.position.set(x, y, z); p.receiveShadow = true; G.add(p); return p; };
  slab(36, 5, -39.5, 0); slab(60, 8, -22, 20.5); slab(12, 12, -26, 0);
  const road = slab(300, 14, 0, -62, mat('#fff', { map: TEX.asphalt(), roughness: 0.95 }));
  for (let x = -140; x < 140; x += 8) slab(3.5, 0.25, x, -62, mat('#f2e27a'), 0.04);

  // ----- fence & gate (west side), boundary colliders -----
  const fenceM = mat('#2e3b4a', { metalness: 0.6, roughness: 0.4 });
  const fenceLine = (x1, z1, x2, z2, gap = null) => {
    const len = Math.hypot(x2 - x1, z2 - z1), n = Math.floor(len / 1.2);
    for (let i = 0; i <= n; i++) {
      const t = i / n, x = x1 + (x2 - x1) * t, z = z1 + (z2 - z1) * t;
      if (gap && Math.abs(z) < gap) continue;
      cyl(0.04, 0.04, 1.6, fenceM, x, 0.8, z, G, 6);
    }
    const horizontal = Math.abs(z2 - z1) < 0.01;
    for (const y of [0.4, 1.4]) {
      if (horizontal) box(len, 0.05, 0.05, fenceM, (x1 + x2) / 2, y, z1, G, false);
      else if (gap) { const a = Math.abs(z1) - gap; for (const s of [-1, 1]) box(0.05, 0.05, a, fenceM, x1, y, s * (gap + a / 2), G, false); }
      else box(0.05, 0.05, len, fenceM, x1, y, (z1 + z2) / 2, G, false);
    }
  };
  fenceLine(-60, -50, -60, 50, 4); fenceLine(-60, -50, 90, -50); fenceLine(-60, 50, 90, 50); fenceLine(90, -50, 90, 50);
  for (const s of [-1, 1]) { box(1, 3.4, 1, mat('#a8412f'), -60, 1.7, s * 4.6, G); box(1.3, 0.3, 1.3, mat('#d8cfba'), -60, 3.5, s * 4.6, G); }
  const gateSign = new THREE.Mesh(new THREE.PlaneGeometry(8.4, 0.7), new THREE.MeshBasicMaterial({ map: plaque('GENAI ACADEMY · WELCOME', '', 1024, 90, '#14324f') }));
  gateSign.position.set(-60, 3.7, 0); gateSign.rotation.y = Math.PI / 2; G.add(gateSign);
  box(0.3, 0.3, 8.2, mat('#a8412f'), -60, 3.4, 0, G);
  colliders.push({ minX: -62, maxX: -59.5, minZ: -50, maxZ: -3.8 }, { minX: -62, maxX: -59.5, minZ: 3.8, maxZ: 50 }, { minX: -75, maxX: -62, minZ: -3, maxZ: -2.9 },
    { minX: -75, maxX: -62, minZ: 2.9, maxZ: 3 }, { minX: -75, maxX: -74.9, minZ: -3, maxZ: 3 }, { minX: -60, maxX: 90, minZ: -51, maxZ: -49.5 }, { minX: -60, maxX: 90, minZ: 49.5, maxZ: 51 }, { minX: 89.5, maxX: 91, minZ: -50, maxZ: 50 });

  // ----- entrance porch -----
  for (const z of [-3.4, 3.4]) cyl(0.32, 0.36, 3.8, mat('#e9e1cd'), -24.2, 1.9, z, G, 20);
  box(3.4, 0.35, 8.4, mat('#cfc6b0'), -23.6, 3.95, 0, G);
  colliders.push({ minX: -24.6, maxX: -23.8, minZ: -3.8, maxZ: -3 }, { minX: -24.6, maxX: -23.8, minZ: 3, maxZ: 3.8 });
  for (let i = 0; i < 3; i++) box(3.4 - i * 0.5, 0.12, 5, mat('#c9c1ae'), -24.6 + i * 0.01, 0.06 * (3 - i) - 0.02, 0, G);

  // ----- flagpole with waving flag -----
  cyl(0.08, 0.12, 11, mat('#c9ccd1', { metalness: 0.8, roughness: 0.3 }), -34, 5.5, -10, G, 10);
  sph(0.18, mat('#d6b84a', { metalness: 0.8 }), -34, 11.1, -10, G);
  const flagGeo = new THREE.PlaneGeometry(3, 2, 20, 8);
  const flagTex = canvasTex(300, 200, (g) => { g.fillStyle = '#ff9933'; g.fillRect(0, 0, 300, 67); g.fillStyle = '#fff'; g.fillRect(0, 67, 300, 66); g.fillStyle = '#138808'; g.fillRect(0, 133, 300, 67); g.strokeStyle = '#000080'; g.lineWidth = 3; g.beginPath(); g.arc(150, 100, 22, 0, 7); g.stroke(); for (let i = 0; i < 24; i++) { const a = i * Math.PI / 12; g.beginPath(); g.moveTo(150, 100); g.lineTo(150 + 22 * Math.cos(a), 100 + 22 * Math.sin(a)); g.stroke(); } });
  const flag = new THREE.Mesh(flagGeo, new THREE.MeshStandardMaterial({ map: flagTex, side: THREE.DoubleSide, roughness: 0.9 }));
  flag.position.set(-34, 9.6, -8.5); flag.rotation.y = Math.PI / 2; flag.castShadow = true; G.add(flag);
  const base = flagGeo.attributes.position.array.slice();
  tickers.push((dt, t) => { const p = flagGeo.attributes.position; for (let i = 0; i < p.count; i++) { const x = base[i * 3] + 1.5; p.setZ(i, Math.sin(x * 2.2 - t * 4) * 0.16 * (x / 3)); } p.needsUpdate = true; });
  colliders.push({ minX: -34.3, maxX: -33.7, minZ: -10.3, maxZ: -9.7 });

  // ----- trees, bushes, lamps, benches -----
  const trunkM = mat('#6b4a2b'), leafMs = ['#2f7a35', '#3b8c3f', '#4c9a3a'].map((c) => mat(c, { roughness: 0.9 }));
  const tree = (x, z, s = 1) => {
    const t = new THREE.Group(); t.position.set(x, 0, z); t.scale.setScalar(s);
    cyl(0.18, 0.28, 2.6, trunkM, 0, 1.3, 0, t, 8);
    for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1 + r() * 0.5, 1), leafMs[i % 3]); m.position.set((r() - 0.5) * 1.2, 3 + r() * 1.2, (r() - 0.5) * 1.2); m.castShadow = true; t.add(m); }
    G.add(t); colliders.push({ minX: x - 0.35 * s, maxX: x + 0.35 * s, minZ: z - 0.35 * s, maxZ: z + 0.35 * s });
  };
  for (let i = 0; i < 46; i++) {
    const x = -57 + r() * 145, z = (r() < 0.5 ? -1 : 1) * (15 + r() * 32);
    if (x > 24 && x < 74 && Math.abs(z) < 30) continue;
    if (x > -50 && x < -20 && Math.abs(z) < 7) continue;
    tree(x, z, 0.8 + r() * 0.6);
  }
  for (let i = 0; i < 26; i++) { const x = -22 + i * 1.7; if (x > 22) break; const b = sph(0.5, leafMs[i % 3], x, 0.45, -13.7, G, 1.3, 0.9, 1); const b2 = sph(0.5, leafMs[(i + 1) % 3], x, 0.45, 13.7, G, 1.3, 0.9, 1); }
  const lamp = (x, z) => { cyl(0.06, 0.08, 4.2, mat('#2a2f36', { metalness: 0.7 }), x, 2.1, z, G, 8); sph(0.22, new THREE.MeshStandardMaterial({ color: '#fff', emissive: '#ffe9b0', emissiveIntensity: 1.5 }), x, 4.3, z, G); colliders.push({ minX: x - 0.12, maxX: x + 0.12, minZ: z - 0.12, maxZ: z + 0.12 }); };
  for (let x = -58; x < -22; x += 9) { lamp(x, -3.3); lamp(x, 3.3); }
  const bench = (x, z, ry = 0) => { const b = new THREE.Group(); b.position.set(x, 0, z); b.rotation.y = ry; box(1.8, 0.08, 0.5, trunkM, 0, 0.5, 0, b); box(1.8, 0.5, 0.06, trunkM, 0, 0.8, -0.24, b); for (const s of [-0.8, 0.8]) box(0.08, 0.5, 0.5, mat('#222'), s, 0.25, 0, b); G.add(b); colliders.push({ minX: x - 0.95, maxX: x + 0.95, minZ: z - 0.35, maxZ: z + 0.35 }); };
  bench(-30, -6, Math.PI / 2); bench(-30, 6, Math.PI / 2); bench(-40, -4.3); bench(-48, 4.3, Math.PI);

  // ----- school bus -----
  const bus = new THREE.Group(); bus.position.set(-38, 0, 19); G.add(bus);
  box(9, 2.3, 2.5, mat('#f1b400', { roughness: 0.4 }), 0, 1.65, 0, bus);
  box(9.02, 0.12, 2.52, mat('#111'), 0, 1.1, 0, bus); box(9.02, 0.12, 2.52, mat('#111'), 0, 2.3, 0, bus);
  for (let i = 0; i < 7; i++) for (const s of [-1.26, 1.26]) box(0.9, 0.7, 0.04, mat('#9ec9e8', { metalness: 0.6, roughness: 0.1 }), -3.6 + i * 1.2, 1.9, s, bus, false);
  for (const [x, z] of [[-3, 1.25], [3, 1.25], [-3, -1.25], [3, -1.25]]) { const w = cyl(0.55, 0.55, 0.35, mat('#1a1a1a'), x, 0.55, z, bus, 20); w.rotation.x = Math.PI / 2; const hub = cyl(0.25, 0.25, 0.37, mat('#aaa', { metalness: 0.8 }), x, 0.55, z, bus, 12); hub.rotation.x = Math.PI / 2; }
  box(0.3, 0.5, 2.3, mat('#555'), 4.6, 0.6, 0, bus);
  colliders.push({ minX: -42.6, maxX: -33.4, minZ: 17.6, maxZ: 20.4 });

  // ----- sports field (east) -----
  const field = new THREE.Mesh(new THREE.PlaneGeometry(46, 28), new THREE.MeshStandardMaterial({ map: canvasTex(512, 320, (g, w, h) => { g.fillStyle = '#3f8a35'; g.fillRect(0, 0, w, h); for (let i = 0; i < 10; i++) { g.fillStyle = i % 2 ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.05)'; g.fillRect(i * w / 10, 0, w / 10, h); } g.strokeStyle = '#fff'; g.lineWidth = 4; g.strokeRect(14, 14, w - 28, h - 28); g.beginPath(); g.moveTo(w / 2, 14); g.lineTo(w / 2, h - 14); g.stroke(); g.beginPath(); g.arc(w / 2, h / 2, 38, 0, 7); g.stroke(); g.strokeRect(14, h / 2 - 60, 60, 120); g.strokeRect(w - 74, h / 2 - 60, 60, 120); }), roughness: 1 }));
  field.rotation.x = -Math.PI / 2; field.position.set(48, 0.04, 0); field.receiveShadow = true; G.add(field);
  const track = new THREE.Mesh(new THREE.RingGeometry(0.1, 1, 40), mat('#a8452f')); track.visible = false; G.add(track);
  slab(54, 36, 48, 0, mat('#a8452f', { roughness: 1 }), 0.02);
  for (const s of [-1, 1]) {
    const gp = new THREE.Group(); gp.position.set(48 + s * 22.2, 0, 0);
    const wm = mat('#fff', { metalness: 0.3 });
    for (const z of [-3.6, 3.6]) cyl(0.07, 0.07, 2.4, wm, 0, 1.2, z, gp, 8);
    const cb = cyl(0.07, 0.07, 7.3, wm, 0, 2.4, 0, gp, 8); cb.rotation.x = Math.PI / 2;
    const net = new THREE.Mesh(new THREE.BoxGeometry(2, 2.3, 7.2), new THREE.MeshBasicMaterial({ color: '#fff', wireframe: true, transparent: true, opacity: 0.35 })); net.position.set(s * 1.1, 1.2, 0); gp.add(net);
    G.add(gp);
  }
  // bleachers
  for (let i = 0; i < 4; i++) box(1, 0.4, 16, mat(i % 2 ? '#3b6ea5' : '#cfd6dd'), 48, 0.2 + i * 0.4, -23.5 - i * 1.0, G).rotation.y = Math.PI / 2;
  // ----- playground: swings, slide, seesaw -----
  const pg = new THREE.Group(); pg.position.set(-20, 0, 30); G.add(pg);
  const redM = mat('#c0392b', { metalness: 0.3 }), blueM = mat('#2c6fbb', { metalness: 0.3 });
  for (const x of [-2.4, 2.4]) for (const z of [-0.8, 0.8]) { const l = cyl(0.06, 0.06, 3.2, redM, x, 1.5, z, pg, 8); l.rotation.z = (x < 0 ? 1 : -1) * 0.12; }
  cyl(0.07, 0.07, 5, redM, 0, 3, 0, pg, 8).rotation.z = Math.PI / 2;
  const swings = [];
  for (const x of [-1, 1]) { const s = new THREE.Group(); s.position.set(x, 3, 0); for (const dx of [-0.25, 0.25]) cyl(0.012, 0.012, 2.2, mat('#222'), dx, -1.1, 0, s, 4); box(0.6, 0.06, 0.25, mat('#e1b23a'), 0, -2.2, 0, s); pg.add(s); swings.push(s); }
  tickers.push((dt, t) => swings.forEach((s, i) => (s.rotation.x = Math.sin(t * 1.6 + i) * 0.45)));
  const sl = new THREE.Group(); sl.position.set(7, 0, 0); pg.add(sl);
  box(1.2, 0.1, 1.2, blueM, 0, 2, 0, sl); for (const [a, b] of [[-0.55, -0.55], [0.55, -0.55], [-0.55, 0.55], [0.55, 0.55]]) cyl(0.04, 0.04, 2, redM, a, 1, b, sl, 6);
  const ramp = box(1, 0.06, 3.4, mat('#cfd6dd', { metalness: 0.7, roughness: 0.2 }), 0, 1.0, 2.5, sl); ramp.rotation.x = 0.52; for (let i = 0; i < 6; i++) box(0.8, 0.05, 0.25, redM, 0, 0.3 + i * 0.3, -0.9 - 0.12 * i * 0, sl).visible = false;
  colliders.push({ minX: -22.6, maxX: -17.4, minZ: 29, maxZ: 31 }, { minX: -14, maxX: -12, minZ: 29.3, maxZ: 34.5 });
  // ----- background hills -----
  const hillM = mat('#5f8f5a', { roughness: 1, fog: true });
  for (let i = 0; i < 22; i++) { const a = (i / 22) * Math.PI * 2, d = 330 + r() * 60; const h = sph(40 + r() * 40, hillM, Math.cos(a) * d, -15, Math.sin(a) * d, G, 2.2, 0.8 + r() * 0.8, 1.6, 12); h.castShadow = false; }
  // ----- bike rack -----
  for (let i = 0; i < 6; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.03, 8, 16, Math.PI), mat('#555', { metalness: 0.8 })); t.position.set(-46 + i * 0.6, 0.0, 12); t.rotation.y = Math.PI / 2; G.add(t); }

  scene.fog = new THREE.Fog('#cfe6f7', 120, 520);
  return { group: G, tickers, sun };
}
