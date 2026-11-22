import * as THREE from 'three';
import { TEX, mat, box, cyl, sph, canvasTex, rng } from './util.js';
import { plaque } from './world.js';
import { makeMii, animateMii } from './mii.js';

const BW = 4.4, BH = 1.8;

function wrap(g, text, maxW) {
  const words = text.split(' '); const lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); return lines;
}

// Realistic chalkboard: gradient slate, eraser smears, dust, double-struck chalk lettering
function boardTexture(b) {
  const W = 1760, Hh = 720;
  return canvasTex(W, Hh, (g) => {
    const r = rng(b.id * 31 + 5);
    const gr = g.createLinearGradient(0, 0, W, Hh); gr.addColorStop(0, '#1d3b31'); gr.addColorStop(0.5, '#244a3c'); gr.addColorStop(1, '#1a362d');
    g.fillStyle = gr; g.fillRect(0, 0, W, Hh);
    for (let i = 0; i < 26; i++) { g.save(); g.globalAlpha = 0.05 + r() * 0.05; g.strokeStyle = '#d9e6df'; g.lineWidth = 40 + r() * 60; g.lineCap = 'round'; g.beginPath(); const y = r() * Hh, x = r() * W; g.moveTo(x, y); g.quadraticCurveTo(x + 120, y - 30 + r() * 60, x + 300 + r() * 200, y + r() * 40 - 20); g.stroke(); g.restore(); }
    for (let i = 0; i < 6000; i++) { g.fillStyle = `rgba(255,255,255,${r() * 0.07})`; g.fillRect(r() * W, r() * Hh, 1 + r() * 2, 1 + r() * 2); }
    const chalk = (txt, x, y, size, col = '#f4f1e6', align = 'left') => {
      g.font = `600 ${size}px "Segoe Print","Bradley Hand","Comic Sans MS","Chalkboard SE",cursive`; g.textAlign = align; g.textBaseline = 'alphabetic';
      g.shadowColor = 'rgba(255,255,255,.55)'; g.shadowBlur = 5; g.fillStyle = col; g.fillText(txt, x, y);
      g.shadowBlur = 0; g.globalAlpha = 0.35; g.fillText(txt, x + 1.4, y + 1.2); g.globalAlpha = 1;
    };
    // header
    chalk(`${b.tag}`, 60, 62, 30, '#9ad7ff');
    chalk(b.title, 60, 130, 68, '#ffe28a');
    g.strokeStyle = 'rgba(255,226,138,.8)'; g.lineWidth = 4; g.beginPath(); g.moveTo(60, 148); g.bezierCurveTo(400, 160, 800, 140, 1200, 152); g.stroke();
    // key formulas
    let y = 230;
    for (const f of b.chalk) { chalk(f, 80, y, 52, '#ffffff'); y += 74; }
    // worked example box
    const ex = b.example;
    g.strokeStyle = 'rgba(150,220,255,.8)'; g.lineWidth = 3; g.setLineDash([14, 10]); g.strokeRect(50, 470, W - 100, 205); g.setLineDash([]);
    chalk('Example', 70, 505, 30, '#9ad7ff');
    g.font = '600 36px "Segoe Print","Comic Sans MS",cursive';
    const lines = wrap(g, ex.q, W - 160).slice(0, 3);
    lines.forEach((l, i) => chalk(l, 80, 555 + i * 44, 36, '#f4f1e6'));
    chalk(`→ ${ex.ans}`, 80, 555 + lines.length * 44 + 8, 40, '#8cf2b0');
    chalk('[E] study · practice · exam', W - 40, 62, 26, '#ffd9a0', 'right');
    // doodle (neural / bell curve)
    g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 3; g.beginPath();
    for (let x = 0; x <= 260; x += 4) { const yy = 380 - 120 * Math.exp(-Math.pow((x - 130) / 55, 2)); x ? g.lineTo(1400 + x, yy) : g.moveTo(1400, yy); } g.stroke();
  }, { aniso: 16 });
}

function makeBoard(b) {
  const G = new THREE.Group();
  const frameM = mat('#6a4527', { roughness: 0.55 });
  const surf = new THREE.Mesh(new THREE.PlaneGeometry(BW, BH), new THREE.MeshStandardMaterial({ map: boardTexture(b), roughness: 0.92, emissive: '#ffffff', emissiveIntensity: 0.28 }));
  surf.material.emissiveMap = surf.material.map; surf.userData.boardId = b.id; surf.receiveShadow = true; G.add(surf);
  for (const [w, h, x, y] of [[BW + 0.24, 0.12, 0, BH / 2 + 0.06], [BW + 0.24, 0.12, 0, -BH / 2 - 0.06], [0.12, BH, -BW / 2 - 0.06, 0], [0.12, BH, BW / 2 + 0.06, 0]]) box(w, h, 0.09, frameM, x, y, 0.02, G, false);
  box(BW + 0.1, 0.07, 0.16, frameM, 0, -BH / 2 - 0.15, 0.08, G, false);
  for (let i = 0; i < 4; i++) cyl(0.012, 0.012, 0.09, mat('#fff'), -1 + i * 0.35, -BH / 2 - 0.1, 0.12, G, 6).rotation.z = Math.PI / 2;
  box(0.2, 0.05, 0.1, mat('#d4a24a'), 1.4, -BH / 2 - 0.1, 0.12, G, false);
  const tick = new THREE.Mesh(new THREE.CircleGeometry(0.16, 20), new THREE.MeshBasicMaterial({ color: '#59d98a' }));
  tick.position.set(BW / 2 - 0.25, BH / 2 - 0.25, 0.01); tick.visible = false; G.add(tick);
  const t2 = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), new THREE.MeshBasicMaterial({ map: canvasTex(64, 64, (g) => { g.fillStyle = 'rgba(0,0,0,0)'; g.font = 'bold 52px sans-serif'; g.fillStyle = '#04290f'; g.textAlign = 'center'; g.fillText('✓', 32, 50); }), transparent: true }));
  t2.position.set(0, 0, 0.001); tick.add(t2);
  return { group: G, surf, tick };
}

function desk(parent, x, z) {
  const wood = mat('#b98b56', { roughness: 0.6 }), metal = mat('#8d949c', { metalness: 0.8, roughness: 0.35 });
  const d = new THREE.Group(); d.position.set(x, 0, z); parent.add(d);
  box(1.1, 0.04, 0.58, wood, 0, 0.74, 0, d);
  box(1.0, 0.03, 0.5, mat('#9a7144'), 0, 0.48, 0.02, d, false);
  for (const sx of [-0.5, 0.5]) for (const sz of [-0.25, 0.25]) cyl(0.015, 0.015, 0.74, metal, sx, 0.37, sz, d, 6);
  // props on desk: notebook / pen
  const nb = box(0.3, 0.015, 0.22, mat(['#2c6fbb', '#c0392b', '#2e8b57', '#e1b23a'][Math.floor(Math.abs(x * 7 + z * 3)) % 4]), -0.2, 0.77, 0.05, d, false); nb.rotation.y = 0.15;
  cyl(0.008, 0.008, 0.14, mat('#222'), 0.15, 0.775, 0.1, d, 5).rotation.z = Math.PI / 2;
  // chair (behind, toward +z)
  const ch = new THREE.Group(); ch.position.set(0, 0, 0.62); d.add(ch);
  box(0.42, 0.04, 0.42, mat('#3b6ea5'), 0, 0.44, 0, ch); box(0.42, 0.34, 0.04, mat('#3b6ea5'), 0, 0.72, 0.2, ch);
  for (const sx of [-0.18, 0.18]) for (const sz of [-0.18, 0.18]) cyl(0.013, 0.013, 0.44, metal, sx, 0.22, sz, ch, 6);
  return d;
}

function teacherDesk(parent, x, z) {
  const wood = mat('#7d5230', { roughness: 0.5 });
  const d = new THREE.Group(); d.position.set(x, 0, z); parent.add(d);
  box(1.6, 0.06, 0.8, wood, 0, 0.78, 0, d); box(0.08, 0.72, 0.7, wood, -0.75, 0.38, 0, d); box(0.08, 0.72, 0.7, wood, 0.75, 0.38, 0, d); box(1.5, 0.6, 0.04, wood, 0, 0.45, -0.34, d);
  // laptop
  box(0.34, 0.015, 0.24, mat('#9aa0a8', { metalness: 0.8 }), -0.3, 0.82, 0.05, d, false);
  const scr = box(0.34, 0.22, 0.012, mat('#1a1d22'), -0.3, 0.94, -0.06, d, false); scr.rotation.x = -0.25;
  // apple
  sph(0.05, mat('#c0392b', { roughness: 0.3 }), 0.4, 0.86, 0.1, d); cyl(0.004, 0.004, 0.03, trunk, 0.4, 0.92, 0.1, d, 4);
  // books
  for (let i = 0; i < 3; i++) box(0.28, 0.04, 0.2, mat(['#1f4d7a', '#8a2d2d', '#2e6e4e'][i]), 0.1, 0.83 + i * 0.04, 0.0, d, false);
  return d;
}
const trunk = mat('#4a3320');

function decor(room) {
  const g = room.group;
  // clock (real time)
  const face = canvasTex(256, 256, (c) => { c.fillStyle = '#fff'; c.beginPath(); c.arc(128, 128, 120, 0, 7); c.fill(); c.strokeStyle = '#222'; c.lineWidth = 8; c.stroke(); c.fillStyle = '#222'; c.font = 'bold 28px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; for (let i = 1; i <= 12; i++) { const a = i * Math.PI / 6; c.fillText(i, 128 + Math.sin(a) * 92, 128 - Math.cos(a) * 92); } });
  const clock = new THREE.Group(); clock.position.set(0, 2.9, -4.8); g.add(clock);
  const disk = new THREE.Mesh(new THREE.CircleGeometry(0.26, 32), new THREE.MeshBasicMaterial({ map: face })); clock.add(disk);
  const hand = (len, w, col) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, len, 0.005), new THREE.MeshBasicMaterial({ color: col })); m.geometry.translate(0, len / 2, 0); m.position.z = 0.005; clock.add(m); return m; };
  const hh = hand(0.12, 0.014, '#111'), mh = hand(0.19, 0.01, '#111'), sh = hand(0.21, 0.005, '#c0392b');
  room.clock = { hh, mh, sh };
  // shelf with books
  const shelf = new THREE.Group(); shelf.position.set(5.6, 0, 4.5); g.add(shelf);
  box(1.4, 1.7, 0.4, mat('#7d5230'), 0, 0.85, 0, shelf);
  for (let r = 0; r < 4; r++) for (let i = 0; i < 9; i++) box(0.1, 0.25 + (i % 3) * 0.03, 0.26, mat(['#c0392b', '#2c6fbb', '#e1b23a', '#2e8b57', '#8e44ad'][(i + r) % 5]), -0.55 + i * 0.13, 0.28 + r * 0.4, 0.04, shelf, false);
  // plant
  const plant = new THREE.Group(); plant.position.set(-6.1, 0, 4.2); g.add(plant);
  cyl(0.22, 0.17, 0.4, mat('#b5532f'), 0, 0.2, 0, plant);
  for (let i = 0; i < 7; i++) { const l = sph(0.22, mat('#3f9a4a'), Math.cos(i) * 0.15, 0.7 + (i % 3) * 0.12, Math.sin(i) * 0.15, plant, 0.35, 1.2, 0.35); l.rotation.set(Math.sin(i) * 0.4, 0, Math.cos(i) * 0.4); }
  // bin
  cyl(0.17, 0.14, 0.36, mat('#4d5660'), 5.9, 0.18, -3.6, g, 12);
  // back-wall poster (corridor wall, local z = +4.85)
  const p = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1), new THREE.MeshBasicMaterial({ map: plaque(['LATENT', 'ADVERSARIAL', 'ATTENTION', 'DENOISE', 'ETHICS', 'SAMPLING'][room.id - 1] || 'LEARN', 'Room ' + room.id, 384, 256, '#2b3a67') }));
  p.position.set(4.6, 1.7, 4.8); p.rotation.y = Math.PI; g.add(p);
}

export function populate(world, boardsByRoom) {
  const tickers = [], boards = [];
  const col = (room, lx, lz, hx, hz) => { const c = room.toWorld(lx, lz); world.colliders.push({ minX: c.x - hx, maxX: c.x + hx, minZ: c.z - hz, maxZ: c.z + hz }); };
  world.group.updateMatrixWorld(true);
  const students = [];
  world.rooms.forEach((room, ri) => {
    room.group.updateMatrixWorld(true);
    decor(room);
    const slots = [
      { x: -3.35, y: 1.65, z: -4.8, ry: 0 }, { x: 3.35, y: 1.65, z: -4.8, ry: 0 },
      { x: -6.8, y: 1.65, z: 0.2, ry: Math.PI / 2 }, { x: 6.8, y: 1.65, z: 0.2, ry: -Math.PI / 2 },
    ];
    (boardsByRoom[room.id] || []).forEach((b, i) => {
      const s = slots[i]; const bd = makeBoard(b);
      bd.group.position.set(s.x, s.y, s.z); bd.group.rotation.y = s.ry; room.group.add(bd.group);
      boards.push({ ...b, mesh: bd.surf, tick: bd.tick, room: room.id });
    });
    teacherDesk(room.group, 0, -3.3); col(room, 0, -3.3, 0.9, 0.5);
    // teacher stands by the left board (faces students: +z)
    const T = makeMii(ri * 7 + 3, { sitting: false, teacher: true }); T.position.set(-1.6, 0, -3.5); room.group.add(T); students.push(T);
    // students: 3 rows x 4 columns (2 aisle gaps), some seats empty
    const xs = [-4.6, -2.3, 2.3, 4.6], zs = [-1.2, 0.4, 2.0];
    let n = 0;
    zs.forEach((zz, rr) => xs.forEach((xx, cc) => {
      desk(room.group, xx, zz); col(room, xx, zz + 0.3, 0.6, 0.6);
      if ((rr * 4 + cc + ri) % 5 === 4) return; // empty seat
      const m = makeMii(ri * 40 + n++ + 1, { sitting: true }); m.position.set(xx, 0, zz + 0.6); m.rotation.y = Math.PI; room.group.add(m); students.push(m);
    }));
    // wire clock to real time later in tick
  });
  tickers.push((dt, t) => {
    students.forEach((m) => animateMii(m, t));
    const d = new Date(); const s = d.getSeconds(), mi = d.getMinutes() + s / 60, h = (d.getHours() % 12) + mi / 60;
    world.rooms.forEach((r) => { if (!r.clock) return; r.clock.sh.rotation.z = -s * Math.PI / 30; r.clock.mh.rotation.z = -mi * Math.PI / 30; r.clock.hh.rotation.z = -h * Math.PI / 6; });
  });
  return { boards, tickers };
}
