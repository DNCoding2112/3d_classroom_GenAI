import { BOARDS, MODULES, boardById } from './content/index.js';
import { md, tex } from './rich.js';
import { store } from './store.js';
import { solve, defaults, randomValues, check, fmt } from './solver.js';
import { generateSum, hasKey } from './gemini.js';
import { buildPaper, STRATEGY } from './exam.js';

const overlay = () => document.getElementById('overlay');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
let isOpen = false, timerId = null;

export const UI = {
  onVisit() {}, onClose() {}, teleport() {},
  isOpen: () => isOpen, visitedCount: store.visitedCount, isVisited: store.isVisited,
  openBoard, openHub, close,
};

function show(html) { isOpen = true; const o = overlay(); o.classList.remove('hidden'); o.innerHTML = html; return o; }
function close() {
  if (!isOpen) return;
  isOpen = false; clearInterval(timerId); overlay().classList.add('hidden'); overlay().innerHTML = ''; UI.onClose();
}
addEventListener('keydown', (e) => { if (e.code === 'Escape' && isOpen) close(); });

/* ------------------------------------------------------------------ board modal */
let practice = null;

function openBoard(id, tab = 'example') {
  const b = boardById(id); if (!b) return;
  store.visit(id); UI.onVisit(id);
  if (!practice || practice.id !== id) {
    const t = b.tpls[0];
    practice = { id, sum: { ...t, source: 'example' }, values: defaults(t), answer: '', result: null, showSteps: false, hint: false, history: [], note: '', credited: '', loading: false };
  }
  const o = show(`
    <div class="modal">
      <div class="mhead">
        <button class="btn alt" id="prevB" title="Previous board">◀</button>
        <h2>Board ${b.id} · ${esc(b.title)}</h2><span class="badge">${esc(b.tag)}</span>
        <button class="btn alt" id="nextB" title="Next board">▶</button>
        <button class="btn alt" id="hubB">Exam hub (M)</button>
        <button class="btn" id="closeB">Back to class (Esc)</button>
      </div>
      <div class="tabs">${[['example', 'Worked example'], ['learn', 'Learn in depth'], ['practice', 'Practice · Try'], ['exam', 'Exam Q&A']].map(([k, l]) => `<button class="tab" data-tab="${k}">${l}</button>`).join('')}</div>
      <div class="mbody" id="mbody"></div>
    </div>`);
  const go = (n) => openBoard(((b.id - 1 + n + BOARDS.length) % BOARDS.length) + 1, tab);
  o.querySelector('#prevB').onclick = () => go(-1); o.querySelector('#nextB').onclick = () => go(1);
  o.querySelector('#closeB').onclick = close; o.querySelector('#hubB').onclick = () => openHub();
  const setTab = (t) => {
    o.querySelectorAll('.tab').forEach((x) => x.classList.toggle('on', x.dataset.tab === t));
    const body = o.querySelector('#mbody'); body.scrollTop = 0;
    ({ example: renderExample, learn: renderLearn, practice: renderPractice, exam: renderExam })[t](b, body, setTab);
  };
  o.querySelectorAll('.tab').forEach((x) => (x.onclick = () => setTab(x.dataset.tab)));
  setTab(tab);
}

const formulaList = (b) => b.formulas.map((f) => `<div class="formula">${tex(f, true)}</div>`).join('');

function renderExample(b, body, setTab) {
  const ex = b.example;
  body.innerHTML = `
    <h3>On the board</h3>
    <div class="box">${b.chalk.map((l) => `<div style="font-family:'Segoe Print','Comic Sans MS',cursive;font-size:17px;margin:3px 0">${esc(l)}</div>`).join('')}</div>
    <p>${esc(b.summary)}</p>
    <h3>Key formulas</h3>${formulaList(b)}
    <h3>Worked numerical</h3>
    <div class="box"><div class="q-line">${esc(ex.q)}</div>
      <ol class="steps">${ex.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
      <div class="res ok"><b>Answer:</b> ${esc(ex.ans)}</div></div>
    <p><button class="btn" id="tryBtn">Try a new sum like this →</button> <button class="btn alt" id="learnBtn">Learn the theory</button></p>`;
  body.querySelector('#tryBtn').onclick = () => { setTab('practice'); tryNew(b, document.getElementById('mbody')); };
  body.querySelector('#learnBtn').onclick = () => setTab('learn');
}

function renderLearn(b, body, setTab) {
  body.innerHTML = `
    <div class="box tip"><b>In one line:</b> ${esc(b.summary)}</div>
    ${b.notes.map((n) => `<h3>${esc(n.h)}</h3>${md(n.body)}`).join('')}
    <h3>Formula box</h3>${formulaList(b)}
    <h3>Exam tips</h3><div class="box tip"><ul>${b.tips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>
    <p><button class="btn" id="toP">Practice sums for this topic →</button> <button class="btn alt" id="toE">Exam questions →</button></p>`;
  body.querySelector('#toP').onclick = () => setTab('practice'); body.querySelector('#toE').onclick = () => setTab('exam');
}

function renderExam(b, body, setTab) {
  body.innerHTML = `<p>Likely questions on <b>${esc(b.title)}</b>. Write your own answer first, then open the model answer.</p>
    ${b.exam.map((e, i) => `<details><summary>Q${i + 1} · [${e.m} marks] ${esc(e.q)}</summary><div class="box tip" style="margin-top:8px">${md(e.a)}</div></details>`).join('')}
    <p><button class="btn" id="toP">Practise numericals →</button></p>`;
  body.querySelector('#toP').onclick = () => setTab('practice');
}

/* ------------------------------------------------------------------ practice */
function renderPractice(b, body) {
  const p = practice;
  const s = solve(p.sum, p.values);
  const qHtml = esc(p.sum.q).replace(/\{(\w+)\}/g, (m, k) => {
    const v = p.sum.vars.find((x) => x.s === k);
    if (!v) return k in s.ctx ? esc(fmt(s.ctx[k])) : m;
    return `<span class="sym"><i>${esc(v.label)}</i><input data-s="${k}" value="${p.values[k]}" inputmode="decimal" aria-label="${esc(v.label)}"></span>`;
  });
  const src = { gemini: '✨ Gemini-generated', builtin: '🎲 Built-in generator', example: '📌 Board example' }[p.sum.source] || '';
  body.innerHTML = `
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
      <button class="btn" id="newBtn" ${p.loading ? 'disabled' : ''}>${p.loading ? '<span class="spin"></span>Generating…' : 'Try a new sum'}</button>
      ${p.sum.vars[0] && p.sum.vars[0].min !== null ? '<button class="btn alt" id="rndBtn">Randomise numbers</button>' : ''}
      <button class="btn alt" id="rstBtn">Reset numbers</button>
      <span class="badge">${src}</span>
      <span class="tiny">Solved here: ${store.solvedCount(b.id)} · Attempted: ${store.triedCount(b.id)}</span>
    </div>
    ${p.note ? `<div class="box tip tiny">${esc(p.note)}</div>` : ''}
    <div class="box"><div class="q-line" id="qline">${qHtml}</div>
      <div class="tiny">✎ Edit any highlighted value to build your own sum - the correct answer is recomputed instantly.</div></div>
    <div class="ans"><label for="ansIn"><b>Your answer</b></label>
      <input id="ansIn" value="${esc(p.answer)}" placeholder="number${p.sum.unit ? ' (' + esc(p.sum.unit) + ')' : ''}" inputmode="decimal">
      ${p.sum.unit ? `<span>${esc(p.sum.unit)}</span>` : ''}
      <button class="btn" id="chkBtn">Check</button><button class="btn alt" id="hintBtn">Hint</button><button class="btn alt" id="solBtn">${p.showSteps ? 'Hide' : 'Show'} solution</button></div>
    <div id="resBox">${resHtml()}</div>
    <div id="hintBox">${p.hint ? `<div class="box tip">💡 ${esc(p.sum.hint || b.tips[0])}</div>` : ''}</div>
    <div id="solBox"></div>
    <details style="margin-top:18px"><summary>Quick formula reminder</summary>${formulaList(b)}</details>`;
  fillSolution(body);

  body.querySelectorAll('input[data-s]').forEach((inp) => inp.addEventListener('input', () => {
    const v = parseFloat(inp.value);
    if (Number.isFinite(v)) { p.values[inp.dataset.s] = v; p.result = null; body.querySelector('#resBox').innerHTML = ''; fillSolution(body); inp.style.borderBottomColor = ''; } else inp.style.borderBottomColor = '#ff7b7b';
  }));
  body.querySelector('#ansIn').oninput = (e) => (p.answer = e.target.value);
  body.querySelector('#ansIn').onkeydown = (e) => { e.stopPropagation(); if (e.key === 'Enter') body.querySelector('#chkBtn').click(); };
  body.querySelector('#chkBtn').onclick = () => {
    const cur = solve(p.sum, p.values);
    if (!p.answer.trim()) { p.result = { kind: 'no', msg: 'Type your numerical answer first.' }; }
    else if (check(p.answer, cur.ans, cur.dec)) {
      const key = JSON.stringify(p.values) + p.sum.q;
      if (p.credited !== key) { p.credited = key; store.solve(b.id); }
      p.result = { kind: 'ok', msg: `✔ Correct! Answer = ${fmt(cur.ans, cur.dec)}${p.sum.unit ? ' ' + p.sum.unit : ''}` };
    } else p.result = { kind: 'no', msg: '✘ Not quite. Re-check each step, the formula, and rounding (1% tolerance). Use Hint or Show solution if stuck.' };
    body.querySelector('#resBox').innerHTML = resHtml();
  };
  body.querySelector('#hintBtn').onclick = () => { p.hint = !p.hint; body.querySelector('#hintBox').innerHTML = p.hint ? `<div class="box tip">💡 ${esc(p.sum.hint || b.tips[0])}</div>` : ''; };
  body.querySelector('#solBtn').onclick = (e) => { p.showSteps = !p.showSteps; e.target.textContent = `${p.showSteps ? 'Hide' : 'Show'} solution`; fillSolution(body); };
  body.querySelector('#newBtn').onclick = () => tryNew(b, body);
  const r = body.querySelector('#rndBtn'); if (r) r.onclick = () => { p.values = randomValues(p.sum); p.result = null; p.answer = ''; renderPractice(b, body); };
  body.querySelector('#rstBtn').onclick = () => { p.values = defaults(p.sum); p.result = null; p.answer = ''; renderPractice(b, body); };
}
const resHtml = () => (practice.result ? `<div class="res ${practice.result.kind === 'ok' ? 'ok' : 'no'}">${esc(practice.result.msg)}</div>` : '');

function fillSolution(body) {
  const p = practice, box = body.querySelector('#solBox'); if (!box) return;
  if (!p.showSteps) { box.innerHTML = ''; return; }
  try {
    const s = solve(p.sum, p.values);
    box.innerHTML = `<div class="box"><b>Solution (for the numbers currently shown)</b><ol class="steps">${s.steps.map((x) => `<li>${esc(x)}</li>`).join('')}</ol><div class="res ok"><b>Answer:</b> ${esc(fmt(s.ans, s.dec))} ${esc(p.sum.unit || '')}</div></div>`;
  } catch (e) { box.innerHTML = '<div class="res no">Cannot evaluate with these numbers (check for division by zero or ln of a non-positive value).</div>'; }
}

async function tryNew(b, body) {
  const p = practice; if (p.loading) return;
  store.tried(b.id); p.answer = ''; p.result = null; p.showSteps = false; p.hint = false; p.note = '';
  const local = () => {
    const pool = b.tpls; const t = pool[Math.floor(Math.random() * pool.length)];
    p.sum = { ...t, source: 'builtin' }; p.values = randomValues(t);
  };
  if (hasKey()) {
    p.loading = true; renderPractice(b, body);
    try {
      const g = await generateSum(b, b.tpls[0], p.history.slice(-3));
      p.sum = g; p.values = defaults(g); p.history.push(g.q);
    } catch (e) { p.note = `Gemini request failed (${String(e.message).slice(0, 140)}). Showing a built-in sum instead.`; local(); }
    p.loading = false;
  } else { local(); p.note = 'No Gemini key found in .env - using the built-in randomised generator. Add VITE_GEMINI_API_KEY and restart the dev server for AI-written sums.'; }
  if (isOpen && document.getElementById('mbody') === body) renderPractice(b, body);
}

/* ------------------------------------------------------------------ exam hub */
function openHub(tab = 'map') {
  const o = show(`
    <div class="modal">
      <div class="mhead"><h2>🎓 Exam Hub · Generative AI (100 marks · 3 hours)</h2>
        <span class="badge">boards ${store.visitedCount()}/24 · sums solved ${store.totalSolved()}</span>
        <button class="btn" id="hubClose">Back to school (Esc)</button></div>
      <div class="tabs">${[['map', 'Map & progress'], ['strategy', 'Exam strategy'], ['mock', 'Mock paper'], ['formulas', 'Formula sheet']].map(([k, l]) => `<button class="tab" data-tab="${k}">${l}</button>`).join('')}</div>
      <div class="mbody" id="hbody"></div>
    </div>`);
  o.querySelector('#hubClose').onclick = close;
  const setTab = (t) => {
    clearInterval(timerId);
    o.querySelectorAll('.tab').forEach((x) => x.classList.toggle('on', x.dataset.tab === t));
    const body = o.querySelector('#hbody'); body.scrollTop = 0;
    ({ map: hubMap, strategy: hubStrategy, mock: hubMock, formulas: hubFormulas })[t](body, setTab);
  };
  o.querySelectorAll('.tab').forEach((x) => (x.onclick = () => setTab(x.dataset.tab)));
  setTab(tab);
}

const ROOMS = [
  { id: 1, name: 'Room 1 · Fundamentals', cx: -14, cz: -7.5 }, { id: 2, name: 'Room 2 · VAEs', cx: -14, cz: 7.5 },
  { id: 3, name: 'Room 3 · GANs', cx: 0, cz: -7.5 }, { id: 4, name: 'Room 4 · Transformers & LLMs', cx: 0, cz: 7.5 },
  { id: 5, name: 'Room 5 · Diffusion', cx: 14, cz: -7.5 }, { id: 6, name: 'Room 6 · Applications & Ethics', cx: 14, cz: 7.5 },
];

function hubMap(body) {
  body.innerHTML = `<p>Walk the school in order (Room 1 → 6) and finish every board: <b>Worked example → Learn → Practice (3+ sums) → Exam Q&amp;A</b>. Green = visited. Use the buttons to teleport.</p>
    <p><button class="btn alt" data-tp="gate">Teleport to school gate</button> <button class="btn alt" data-tp="corr">Teleport to main corridor</button> <button class="btn alt" id="resetP">Reset progress</button></p>
    <div class="grid">${ROOMS.map((r) => `<div class="card2"><h4>${r.name}</h4>
      <p class="tiny">${MODULES.filter((m) => m.rooms.includes(r.id) && m.n < 5).map((m) => 'Module ' + m.n).join(' · ')}</p>
      <button class="btn alt" data-tp="room${r.id}">Walk here</button>
      <div style="margin-top:8px">${BOARDS.filter((b) => b.room === r.id).map((b) => `<div class="card2 ${store.isVisited(b.id) ? 'done' : ''}" style="margin:6px 0;cursor:pointer" data-open="${b.id}"><b>${b.id}. ${esc(b.title)}</b><div class="tiny">${store.isVisited(b.id) ? '✓ visited' : 'not visited'} · solved ${store.solvedCount(b.id)}</div></div>`).join('')}</div></div>`).join('')}</div>`;
  body.querySelectorAll('[data-open]').forEach((x) => (x.onclick = () => openBoard(+x.dataset.open)));
  body.querySelectorAll('[data-tp]').forEach((x) => (x.onclick = () => {
    const k = x.dataset.tp;
    if (k === 'gate') UI.teleport(-52, 0, -Math.PI / 2);
    else if (k === 'corr') UI.teleport(-18, 0, -Math.PI / 2);
    else { const r = ROOMS[+k.slice(4) - 1]; UI.teleport(r.cx, r.cz < 0 ? r.cz + 3.8 : r.cz - 3.8, r.cz < 0 ? 0 : Math.PI); }
    close();
  }));
  body.querySelector('#resetP').onclick = () => { if (confirm('Reset all progress? (Green ticks on boards clear after a page reload.)')) { store.reset(); openHub('map'); } };
}

function hubStrategy(body) { body.innerHTML = md(STRATEGY); }

function hubFormulas(body) {
  body.innerHTML = ROOMS.map((r) => `<h3>${r.name}</h3>${BOARDS.filter((b) => b.room === r.id).map((b) => `<details><summary>${b.id}. ${esc(b.title)}</summary>${formulaList(b)}</details>`).join('')}`).join('');
}

function hubMock(body, setTab) {
  const paper = buildPaper();
  const part = (p) => `<details><summary><b>Q${p.no}.</b> [${p.marks}] ${p.parts.map((x) => esc(x.text)).join(' &nbsp;|&nbsp; ')}</summary>
      <div class="box tip" style="margin-top:8px">${p.parts.map((x) => `<div>${x.label ? `<b>${esc(x.label)}</b> ` : ''}${md(x.answer)}</div>`).join('')}<button class="btn alt" data-open="${p.board}">Revise board ${p.board}</button></div></details>`;
  body.innerHTML = `
    <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><span class="timer" id="timer">03:00:00</span>
      <button class="btn" id="tStart">Start 3-hour timer</button><button class="btn alt" id="tStop">Pause</button><button class="btn alt" id="regen">New paper</button></div>
    <p class="tiny">Auto-built from the question bank: Section A = 8 × 5 marks (5 theory + 3 numericals with fresh numbers), Section B = 6 × 10 marks (one per classroom). Attempt on paper first, then open each model answer.</p>
    <h3>Section A · Attempt all · 8 × 5 = 40 marks (~7 min each)</h3>${paper.A.map(part).join('')}
    <h3>Section B · Attempt all · 6 × 10 = 60 marks (~15 min each)</h3>${paper.B.map(part).join('')}`;
  let left = 3 * 3600, running = false;
  const draw = () => { const h = Math.floor(left / 3600), m = Math.floor((left % 3600) / 60), s = left % 60; const e = body.querySelector('#timer'); if (e) e.textContent = [h, m, s].map((x) => String(x).padStart(2, '0')).join(':'); };
  body.querySelector('#tStart').onclick = () => { if (running) return; running = true; clearInterval(timerId); timerId = setInterval(() => { if (left > 0) left--; draw(); }, 1000); };
  body.querySelector('#tStop').onclick = () => { running = false; clearInterval(timerId); };
  body.querySelector('#regen').onclick = () => setTab('mock');
  body.querySelectorAll('[data-open]').forEach((x) => (x.onclick = () => openBoard(+x.dataset.open, 'exam')));
}
