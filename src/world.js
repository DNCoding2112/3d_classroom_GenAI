import * as THREE from 'three';
import { TEX, mat, box, canvasTex } from './util.js';

export const H = 3.6, T = 0.3;
export const ROOM_DEFS = [
  { id: 1, cx: -14, cz: -7.5, name: 'Room 1 · Fundamentals of Generative AI', short: 'Fundamentals' },
  { id: 2, cx: -14, cz: 7.5, name: 'Room 2 · Variational Autoencoders', short: 'VAEs' },
  { id: 3, cx: 0, cz: -7.5, name: 'Room 3 · Generative Adversarial Networks', short: 'GANs' },
  { id: 4, cx: 0, cz: 7.5, name: 'Room 4 · Transformers & Large Models', short: 'Transformers' },
  { id: 5, cx: 14, cz: -7.5, name: 'Room 5 · Diffusion Models', short: 'Diffusion' },
  { id: 6, cx: 14, cz: 7.5, name: 'Room 6 · Applications, Ethics & Self-Study', short: 'Applications' },
];

export function plaque(text, sub, w = 512, h = 128, bg = '#1b4d3e') {
  return canvasTex(w, h, (g) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#e8d9a8'; g.lineWidth = 6; g.strokeRect(6, 6, w - 12, h - 12);
    g.fillStyle = '#fff6d8'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = 'bold 44px system-ui,sans-serif'; g.fillText(text, w / 2, sub ? h * 0.38 : h / 2);
    if (sub) { g.font = '26px system-ui,sans-serif'; g.fillStyle = '#cfe5d8'; g.fillText(sub, w / 2, h * 0.74); }
  });
}

export function buildWorld(scene) {
  const W = new THREE.Group(); scene.add(W);
  const colliders = [];
  const plaster = mat('#efe6d0', { map: TEX.plaster() });
  const plasterBlue = mat('#d6e6ef', { map: TEX.plaster('#d6e6ef') });
  const brick = mat('#ffffff', { map: TEX.brick(), roughness: 0.95 });
  const trim = mat('#5a3b22', { roughness: 0.6 });
  const ceilM = new THREE.MeshBasicMaterial({ map: TEX.ceiling(), color: '#cfcfc8' });

  // axis-aligned wall; out = direction that is the building exterior (brick) or null
  function wall(x1, z1, x2, z2, { y0 = 0, h = H, out = null, m = plaster } = {}) {
    const dx = Math.abs(x2 - x1), dz = Math.abs(z2 - z1);
    const w = dx >= dz ? dx : T, d = dx >= dz ? T : dz;
    const mats = [m, m, m, m, m, m];
    if (out) mats[{ '+x': 0, '-x': 1, '+z': 4, '-z': 5 }[out]] = brick;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats);
    const cx = (x1 + x2) / 2, cz = (z1 + z2) / 2;
    mesh.position.set(cx, y0 + h / 2, cz);
    mesh.castShadow = mesh.receiveShadow = true;
    W.add(mesh);
    if (y0 === 0) colliders.push({ minX: cx - w / 2, maxX: cx + w / 2, minZ: cz - d / 2, maxZ: cz + d / 2 });
    return mesh;
  }

  // ---- perimeter ----
  wall(-21, -12.5, 21, -12.5, { out: '-z' });
  wall(-21, 12.5, 21, 12.5, { out: '+z' });
  for (const sx of [-21, 21]) {
    const o = sx < 0 ? '-x' : '+x';
    wall(sx, -12.5, sx, -1.4, { out: o }); wall(sx, 1.4, sx, 12.5, { out: o });
    wall(sx, -1.4, sx, 1.4, { y0: 2.5, h: H - 2.5, out: o });
    // door frame posts
    box(0.12, 2.5, T + 0.1, trim, sx, 1.25, -1.46, W); box(0.12, 2.5, T + 0.1, trim, sx, 1.25, 1.46, W);
  }
  // ---- interior partitions between room columns ----
  for (const x of [-7, 7]) { wall(x, -12.5, x, -2.5); wall(x, 2.5, x, 12.5); }
  // ---- corridor walls with door gaps ----
  const doorW = 0.9;
  for (const sz of [-2.5, 2.5]) {
    for (const cx of [-14, 0, 14]) {
      wall(cx - 7, sz, cx - doorW, sz, { m: plasterBlue }); wall(cx + doorW, sz, cx + 7, sz, { m: plasterBlue });
      wall(cx - doorW, sz, cx + doorW, sz, { y0: 2.3, h: H - 2.3, m: plasterBlue });
      // frame
      box(0.1, 2.3, T + 0.08, trim, cx - doorW, 1.15, sz, W); box(0.1, 2.3, T + 0.08, trim, cx + doorW, 1.15, sz, W);
      box(doorW * 2 + 0.1, 0.1, T + 0.08, trim, cx, 2.3, sz, W);
    }
  }

  // ---- floors, ceilings ----
  const corridorFloor = new THREE.Mesh(new THREE.PlaneGeometry(42, 5), mat('#ffffff', { map: TEX.tiles(), roughness: 0.35 }));
  corridorFloor.rotation.x = -Math.PI / 2; corridorFloor.position.set(0, 0.01, 0); corridorFloor.receiveShadow = true; W.add(corridorFloor);
  const woodM = mat('#ffffff', { map: TEX.wood(), roughness: 0.55 });
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(42, 25), ceilM);
  ceil.rotation.x = Math.PI / 2; ceil.position.y = H; W.add(ceil);
  const roof = box(44, 0.4, 27, mat('#6b6f76'), 0, H + 0.2, 0, W);
  for (const [w, d, x, z] of [[44, 0.4, 0, -13.3], [44, 0.4, 0, 13.3], [0.4, 27, -21.8, 0], [0.4, 27, 21.8, 0]]) box(w, 0.7, d, mat('#d8cfba'), x, H + 0.6, z, W);
  // rooftop water tank
  const tank = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 1.8, 20), mat('#2f5d8a', { metalness: 0.3, roughness: 0.4 }));
  tank.position.set(16, H + 1.4, 8); tank.castShadow = true; W.add(tank);
  for (const [a, b] of [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]]) box(0.1, 0.6, 0.1, mat('#444'), 16 + a, H + 0.7, 8 + b, W);

  // ---- ceiling light panels (instanced) ----
  const panelG = new THREE.BoxGeometry(1.4, 0.06, 0.5);
  const panelM = new THREE.MeshStandardMaterial({ color: '#fff', emissive: '#fff6df', emissiveIntensity: 2.2 });
  const spots = [];
  for (const r of ROOM_DEFS) for (const ox of [-4.5, 0, 4.5]) for (const oz of [-2.5, 2.5]) spots.push([r.cx + ox, r.cz + oz]);
  for (const x of [-18, -12, -6, 0, 6, 12, 18]) spots.push([x, 0]);
  const inst = new THREE.InstancedMesh(panelG, panelM, spots.length);
  const m4 = new THREE.Matrix4();
  spots.forEach(([x, z], i) => { m4.makeTranslation(x, H - 0.04, z); inst.setMatrixAt(i, m4); });
  W.add(inst);

  // ---- lights inside ----
  for (const r of ROOM_DEFS) { const l = new THREE.PointLight('#fff1d6', 42, 18, 2); l.position.set(r.cx, 3.1, r.cz); W.add(l); }
  for (const x of [-14, 0, 14]) { const l = new THREE.PointLight('#fff6e8', 26, 16, 2); l.position.set(x, 3.1, 0); W.add(l); }

  // ---- rooms ----
  const rooms = ROOM_DEFS.map((d) => {
    const g = new THREE.Group(); g.position.set(d.cx, 0, d.cz);
    if (d.cz > 0) g.rotation.y = Math.PI; // local -z always points to the front board wall
    W.add(g);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), woodM);
    floor.rotation.x = -Math.PI / 2; floor.position.set(d.cx, 0.01, d.cz); floor.receiveShadow = true; W.add(floor);
    // clerestory sky strip on outer front wall (inside + outside)
    const sky = new THREE.MeshBasicMaterial({ map: TEX.sky() });
    const sgeo = new THREE.PlaneGeometry(13.4, 0.5);
    const dir = d.cz < 0 ? -1 : 1;
    const inS = new THREE.Mesh(sgeo, sky); inS.position.set(d.cx, 3.12, d.cz + dir * 4.84); inS.rotation.y = d.cz < 0 ? 0 : Math.PI; W.add(inS);
    const outS = new THREE.Mesh(sgeo, sky); outS.position.set(d.cx, 3.12, d.cz + dir * 5.16); outS.rotation.y = d.cz < 0 ? Math.PI : 0; W.add(outS);
    for (let i = -6; i <= 6; i += 2) { box(0.06, 0.55, 0.05, trim, d.cx + i, 3.12, d.cz + dir * 4.83, W, false); }
    // door plaque (corridor side) + number inside
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.42), new THREE.MeshBasicMaterial({ map: plaque(`ROOM ${d.id}`, d.short, 512, 128) }));
    const side = d.cz < 0 ? 1 : -1; // corridor is on +z for north rooms
    pl.position.set(d.cx, 2.8, (d.cz < 0 ? -2.5 : 2.5) + side * (T / 2 + 0.01)); pl.rotation.y = d.cz < 0 ? 0 : Math.PI; W.add(pl);
    // open door leaf
    const leaf = box(0.9, 2.2, 0.05, mat('#8a5a2c', { roughness: 0.5 }), 0, 1.1, 0, null);
    const pivot = new THREE.Group(); pivot.add(leaf); leaf.position.set(0.45, 1.1, 0);
    pivot.position.set(d.cx - doorW + 0.02, 0, d.cz + (d.cz < 0 ? 1 : -1) * 4.7); pivot.rotation.y = d.cz < 0 ? Math.PI / 2 * 1 : -Math.PI / 2; W.add(pivot);
    const toWorld = (x, z) => { const v = new THREE.Vector3(x, 0, z).applyMatrix4(g.matrixWorld); return v; };
    return { ...d, group: g, toWorld };
  });
  W.updateMatrixWorld(true);
  rooms.forEach((r) => r.group.updateMatrixWorld(true));

  // lockers & benches in corridor
  const lockerCols = ['#3b6ea5', '#c0503f', '#e1b23a', '#4f9d69'];
  for (const sz of [-1, 1]) for (let i = 0; i < 18; i++) {
    const x = -19.5 + i * 2.3; if (Math.abs(((x + 21) % 14) - 7) < 1.4) continue;
    const L = new THREE.Group(); L.position.set(x, 0, sz * 2.28);
    for (let k = 0; k < 2; k++) {
      const c = lockerCols[(i + k) % 4];
      box(0.5, 1.9, 0.4, mat(c, { metalness: 0.4, roughness: 0.45 }), k * 0.52 - 0.26, 0.95, 0, L);
      box(0.3, 0.02, 0.01, mat('#222'), k * 0.52 - 0.26, 1.5, -sz * 0.21, L, false);
      box(0.04, 0.2, 0.03, mat('#ddd', { metalness: 0.9 }), k * 0.52 - 0.12, 1.1, -sz * 0.21, L, false);
    }
    W.add(L);
  }
  // corridor poster boards
  [-17.5, -3.5, 10.5].forEach((x, i) => {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1), new THREE.MeshBasicMaterial({ map: plaque(['LEARN', 'CREATE', 'QUESTION'][i], ['Gen AI is a skill', 'Latent → Image', 'Why? How? What if?'][i], 384, 256, ['#7a2e5a', '#1f4d7a', '#8a5a14'][i]) }));
    p.position.set(x, 1.6, -2.34); W.add(p);
  });
  const entrance = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.6), new THREE.MeshBasicMaterial({ map: plaque('GENAI ACADEMY', 'Est. 2023 · Learn · Generate · Discover', 1024, 180, '#14324f') }));
  entrance.position.set(-21.2, 3.1, 0); entrance.rotation.y = -Math.PI / 2; W.add(entrance);

  function zoneAt(x, z) {
    if (x > -21 && x < 21 && z > -12.5 && z < 12.5) {
      if (Math.abs(z) < 2.5) return 'Main Corridor';
      for (const r of rooms) if (Math.abs(x - r.cx) < 7 && Math.abs(z - r.cz) < 5) return r.name;
      return 'School';
    }
    if (x > 22 && x < 70 && Math.abs(z) < 30) return 'Sports Field';
    return 'Schoolyard';
  }
  return { group: W, colliders, rooms, zoneAt, tickers: [] };
}
