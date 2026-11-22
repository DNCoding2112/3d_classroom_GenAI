import * as THREE from 'three';
import { buildWorld } from './world.js';
import { buildScenery } from './scenery.js';
import { populate } from './props.js';
import { BOARDS } from './content/index.js';
import { UI } from './ui.js';

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.1, 900);
scene.add(camera);

// lighting: warm sun with soft shadows + sky/ground hemisphere
const hemi = new THREE.HemisphereLight('#bfe0ff', '#6b7a52', 0.75); scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff0cf', 2.6);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 300 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.04;
scene.add(sun, sun.target);
const sunDir = new THREE.Vector3(-0.55, 0.8, -0.35).normalize();

const world = buildWorld(scene);
const scenery = buildScenery(scene, world.colliders);
const boardsByRoom = {};
BOARDS.forEach((b) => (boardsByRoom[b.room] ||= []).push(b));
const props = populate(world, boardsByRoom);
const tickers = [...scenery.tickers, ...props.tickers];
document.getElementById('progN').textContent = UI.visitedCount();
props.boards.forEach((b) => { b.tick.visible = UI.isVisited(b.id); });
UI.onVisit = (id) => { const b = props.boards.find((x) => x.id === id); if (b) b.tick.visible = true; document.getElementById('progN').textContent = UI.visitedCount(); };

// ---------- player ----------
const player = { pos: new THREE.Vector3(-52, 1.65, 0), yaw: -Math.PI / 2, pitch: 0, vel: new THREE.Vector3(), bob: 0 };
const keys = {};
let locked = false, started = false;
const R = 0.34;

function resolve(pos) {
  for (let it = 0; it < 3; it++) for (const c of world.colliders) {
    const cx = Math.max(c.minX, Math.min(pos.x, c.maxX)), cz = Math.max(c.minZ, Math.min(pos.z, c.maxZ));
    let dx = pos.x - cx, dz = pos.z - cz; const d2 = dx * dx + dz * dz;
    if (d2 < R * R) {
      if (d2 > 1e-8) { const d = Math.sqrt(d2), p = R - d; pos.x += (dx / d) * p; pos.z += (dz / d) * p; }
      else { // centre inside box: push along the shallowest axis
        const l = pos.x - c.minX, r = c.maxX - pos.x, t = pos.z - c.minZ, b = c.maxZ - pos.z, m = Math.min(l, r, t, b);
        if (m === l) pos.x = c.minX - R; else if (m === r) pos.x = c.maxX + R; else if (m === t) pos.z = c.minZ - R; else pos.z = c.maxZ + R;
      }
    }
  }
}

addEventListener('keydown', (e) => {
  if (UI.isOpen()) return;
  keys[e.code] = true;
  if (e.code === 'KeyE') interact();
  if (e.code === 'KeyM') UI.openHub();
});
addEventListener('keyup', (e) => (keys[e.code] = false));
document.addEventListener('pointerlockchange', () => { locked = document.pointerLockElement === canvas; });
document.addEventListener('mousemove', (e) => {
  if (!(locked || drag) || UI.isOpen()) return;
  player.yaw -= e.movementX * 0.0022; player.pitch = Math.max(-1.45, Math.min(1.45, player.pitch - e.movementY * 0.0022));
});
let drag = false;
canvas.addEventListener('mousedown', () => { if (!started || UI.isOpen()) return; if (!locked) { canvas.requestPointerLock?.(); drag = true; } else interact(); });
addEventListener('mouseup', () => (drag = false));
UI.onClose = () => { keys.KeyW = keys.KeyA = keys.KeyS = keys.KeyD = false; canvas.requestPointerLock?.(); };
UI.teleport = (x, z, yaw) => { player.pos.set(x, 1.65, z); player.yaw = yaw; player.pitch = 0; };

document.getElementById('startBtn').onclick = () => {
  document.getElementById('intro').classList.add('hidden'); started = true; canvas.requestPointerLock?.();
};
const ks = document.getElementById('keyStatus');
ks.textContent = import.meta.env.VITE_GEMINI_API_KEY ? 'Gemini key detected: Try generates fresh AI sums.' : 'No Gemini key in .env: Try uses the built-in randomised sum generator (add VITE_GEMINI_API_KEY for AI sums).';

// ---------- interaction ----------
const ray = new THREE.Raycaster(); ray.far = 7;
let target = null;
function updateTarget() {
  ray.setFromCamera({ x: 0, y: 0 }, camera);
  const hits = ray.intersectObjects(props.boards.map((b) => b.mesh), false);
  target = hits.length ? props.boards.find((b) => b.mesh === hits[0].object) : null;
  const pr = document.getElementById('prompt'), ch = document.getElementById('crosshair');
  pr.classList.toggle('hidden', !target); ch.classList.toggle('hot', !!target);
  if (target) pr.textContent = `E · open board: ${target.title}`;
}
function interact() { if (target && !UI.isOpen()) { document.exitPointerLock?.(); UI.openBoard(target.id); } }

// ---------- loop ----------
const clock = new THREE.Clock();
let lastZone = '';
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
  if (started && !UI.isOpen()) {
    const run = keys.ShiftLeft || keys.ShiftRight ? 1.9 : 1;
    const f = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0);
    const s = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
    if (keys.ArrowLeft) player.yaw += dt * 1.8; if (keys.ArrowRight) player.yaw -= dt * 1.8;
    const sp = 3.0 * run;
    const wish = new THREE.Vector3(-Math.sin(player.yaw) * f + Math.cos(player.yaw) * s, 0, -Math.cos(player.yaw) * f - Math.sin(player.yaw) * s);
    if (wish.lengthSq() > 0) wish.normalize();
    player.vel.lerp(wish.multiplyScalar(sp), Math.min(1, dt * 12));
    player.pos.addScaledVector(player.vel, dt);
    resolve(player.pos);
    player.bob += player.vel.length() * dt * 2.6;
  }
  const moving = player.vel.length();
  camera.position.set(player.pos.x, 1.65 + Math.sin(player.bob) * 0.035 * Math.min(1, moving / 2), player.pos.z);
  camera.rotation.set(player.pitch, player.yaw, 0, 'YXZ');
  sun.position.copy(player.pos).addScaledVector(sunDir, 120); sun.target.position.copy(player.pos);
  if (UI.isOpen()) { requestAnimationFrame(frame); return; } // pause the 3D scene while a panel is open
  tickers.forEach((fn) => fn(dt, t));
  updateTarget();
  document.getElementById('resume').classList.toggle('hidden', !started || locked || UI.isOpen() || drag);
  const z = world.zoneAt(player.pos.x, player.pos.z);
  if (z !== lastZone) { lastZone = z; document.getElementById('locName').textContent = z; }
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
frame();
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });

// debug hooks for automated testing
window.__school = { player, camera, renderer, scene, world, props, UI, start: () => { started = true; document.getElementById('intro').classList.add('hidden'); } };
