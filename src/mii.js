import * as THREE from 'three';
import { mat, rng } from './util.js';

// Shared geometry (built once, reused by every character)
const G = {
  head: new THREE.SphereGeometry(0.24, 24, 18),
  eye: new THREE.SphereGeometry(0.032, 10, 8),
  eyeW: new THREE.SphereGeometry(0.05, 12, 10),
  brow: new THREE.BoxGeometry(0.09, 0.016, 0.012),
  nose: new THREE.SphereGeometry(0.03, 10, 8),
  mouth: new THREE.TorusGeometry(0.06, 0.009, 6, 14, Math.PI),
  ear: new THREE.SphereGeometry(0.05, 8, 6),
  torso: new THREE.CapsuleGeometry(0.17, 0.3, 6, 14),
  arm: new THREE.CapsuleGeometry(0.045, 0.26, 4, 8),
  leg: new THREE.CapsuleGeometry(0.06, 0.3, 4, 8),
  hand: new THREE.SphereGeometry(0.05, 8, 6),
  shoe: new THREE.BoxGeometry(0.11, 0.07, 0.2),
  hairCap: new THREE.SphereGeometry(0.252, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.37),
  backHair: new THREE.SphereGeometry(0.254, 20, 12, Math.PI, Math.PI, 0, Math.PI * 0.62),
  spike: new THREE.ConeGeometry(0.06, 0.16, 6),
  bun: new THREE.SphereGeometry(0.09, 10, 8),
  longHair: new THREE.CapsuleGeometry(0.19, 0.3, 4, 10),
  glass: new THREE.TorusGeometry(0.045, 0.006, 6, 16),
  pointer: new THREE.CylinderGeometry(0.008, 0.008, 1.1, 5),
  tie: new THREE.ConeGeometry(0.04, 0.22, 4),
};
const SKINS = ['#f7d7b5', '#f2c196', '#e0a979', '#c68a5b', '#a56c43', '#7b4a2c'];
const HAIRS = ['#1b1410', '#3a2515', '#6b4423', '#caa14a', '#a8321f', '#2a2a35', '#d9d9d9'];
const SHIRTS = ['#e45858', '#4a90d9', '#58b368', '#f2b632', '#9b6bd6', '#ec7fb0', '#35a7a0', '#f08a3c', '#6c7a89'];
const PANTS = ['#2d3b55', '#3a3a3a', '#5a4632', '#1f4a3a'];
const dark = mat('#111111', { roughness: 0.4 });
const white = mat('#ffffff', { roughness: 0.3 });

export function makeMii(seed, { sitting = true, teacher = false } = {}) {
  const r = rng(seed * 977 + 13);
  const pick = (a) => a[Math.floor(r() * a.length)];
  const skinM = mat(pick(SKINS), { roughness: 0.55 });
  const hairM = mat(pick(HAIRS), { roughness: 0.7 });
  const shirtM = mat(teacher ? '#7a4aa8' : pick(SHIRTS), { roughness: 0.8 });
  const pantM = mat(pick(PANTS), { roughness: 0.9 });
  const root = new THREE.Group();
  const S = teacher ? 1.12 : 1;
  const hipY = sitting ? 0.46 : 0.62;

  const add = (geo, m, x, y, z, parent = root) => { const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); me.castShadow = true; parent.add(me); return me; };

  // torso
  add(G.torso, shirtM, 0, hipY + 0.3, 0);
  if (teacher) { const t = add(G.tie, mat('#c0392b'), 0, hipY + 0.38, 0.145); t.rotation.x = Math.PI; }
  // legs + shoes
  const legs = [];
  for (const s of [-1, 1]) {
    if (sitting) {
      const th = add(G.leg, pantM, s * 0.08, hipY, 0.17); th.rotation.x = Math.PI / 2; th.scale.set(1, 0.75, 1);
      const sh = add(G.leg, pantM, s * 0.08, hipY / 2 - 0.02, 0.36); sh.scale.set(1, 0.7, 1);
      add(G.shoe, mat('#f4f4f4'), s * 0.08, 0.04, 0.4);
    } else {
      const l = add(G.leg, pantM, s * 0.08, hipY / 2 + 0.05, 0); l.scale.set(1, 1.1, 1);
      add(G.shoe, mat('#222'), s * 0.08, 0.035, 0.04); legs.push(l);
    }
  }
  // arms (pivot at shoulder)
  const arms = [];
  for (const s of [-1, 1]) {
    const piv = new THREE.Group(); piv.position.set(s * 0.21, hipY + 0.5, 0); root.add(piv);
    add(G.arm, shirtM, 0, -0.17, 0, piv); add(G.hand, skinM, 0, -0.35, 0, piv);
    piv.rotation.x = sitting ? -1.05 : 0.0; piv.rotation.z = s * (sitting ? 0.1 : 0.12);
    arms.push(piv);
  }
  // head group
  const head = new THREE.Group(); head.position.set(0, hipY + 0.82, 0); root.add(head);
  const skull = add(G.head, skinM, 0, 0, 0, head); skull.scale.set(1.05, 1, 0.97);
  for (const s of [-1, 1]) {
    add(G.ear, skinM, s * 0.25, 0, 0, head).scale.set(0.5, 1, 0.8);
  }
  const eyes = [];
  for (const s of [-1, 1]) {
    add(G.eyeW, white, s * 0.085, 0.03, 0.2, head).scale.set(1, 1.15, 0.45);
    const e = add(G.eye, dark, s * 0.085, 0.03, 0.222, head); e.scale.set(1, 1.3, 0.5); eyes.push(e);
    const b = add(G.brow, hairM, s * 0.085, 0.115, 0.215, head); b.rotation.z = s * -0.12;
  }
  add(G.nose, skinM, 0, -0.03, 0.24, head).scale.set(1, 0.9, 0.8);
  const mouth = add(G.mouth, mat('#a3423a'), 0, -0.095, 0.215, head); mouth.rotation.z = Math.PI; mouth.scale.set(1.0, 0.7, 0.6);
  add(G.ear, mat('#ff9aa2', { transparent: true, opacity: 0.35 }), -0.14, -0.06, 0.19, head).scale.set(0.9, 0.5, 0.2);
  add(G.ear, mat('#ff9aa2', { transparent: true, opacity: 0.35 }), 0.14, -0.06, 0.19, head).scale.set(0.9, 0.5, 0.2);
  // hair
  const style = teacher ? 1 : Math.floor(r() * 6);
  const cap = add(G.hairCap, hairM, 0, 0.012, -0.005, head); cap.scale.set(1.07, 1.0, 1.03);
  if (style !== 0) { const bh = add(G.backHair, hairM, 0, 0.005, -0.005, head); bh.scale.set(1.07, 1.0, 1.03); }
  if (style === 2) for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; const sp = add(G.spike, hairM, Math.cos(a) * 0.13, 0.22, Math.sin(a) * 0.13, head); sp.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5); }
  if (style === 3) { add(G.longHair, hairM, 0, -0.12, -0.1, head).scale.set(1.15, 1, 0.7); }
  if (style === 4) add(G.bun, hairM, 0, 0.3, -0.05, head);
  if (style === 5) { const a = add(G.hairCap, hairM, 0, 0.03, -0.01, head); a.scale.set(1.35, 1.3, 1.3); }
  if (style === 0) cap.scale.set(1.04, 0.85, 1.0);
  if (teacher || r() < 0.22) for (const s of [-1, 1]) add(G.glass, mat('#222', { metalness: 0.6 }), s * 0.085, 0.03, 0.235, head);
  if (teacher) { const p = add(G.pointer, mat('#c8a165'), 0, -0.3, 0, arms[1]); p.position.set(0, -0.35, 0.45); p.rotation.x = Math.PI / 2; }

  root.scale.setScalar(S);
  root.userData = { head, eyes, arms, mouth, phase: r() * 6.28, hand: r() < 0.18, sitting };
  return root;
}

// idle animation: breathing, head look-around, blinking, occasional raised hand
export function animateMii(m, t) {
  const u = m.userData; const p = u.phase;
  m.children[0].scale.y = 1 + Math.sin(t * 1.8 + p) * 0.015;
  u.head.rotation.y = Math.sin(t * 0.5 + p) * 0.35;
  u.head.rotation.x = Math.sin(t * 0.8 + p * 2) * 0.05;
  const blink = (Math.sin(t * 0.9 + p * 7) > 0.985) ? 0.1 : 1.3;
  u.eyes.forEach((e) => (e.scale.y = blink));
  if (u.hand) {
    const k = (Math.sin(t * 0.35 + p) > 0.55) ? 1 : 0;
    u.arms[0].rotation.x += ((k ? -3.0 : -1.05) - u.arms[0].rotation.x) * 0.08;
  }
}
