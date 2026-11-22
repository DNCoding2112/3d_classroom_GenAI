// Safe expression evaluator (recursive descent) + template instantiation for numerical sums.
const comb = (n, k) => { if (k < 0 || k > n) return 0; let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };
export const FN = {
  exp: Math.exp, ln: Math.log, log: Math.log, log2: Math.log2, log10: Math.log10, sqrt: Math.sqrt, abs: Math.abs,
  min: Math.min, max: Math.max, pow: Math.pow, sin: Math.sin, cos: Math.cos, tanh: Math.tanh,
  sigmoid: (x) => 1 / (1 + Math.exp(-x)), comb,
};
const CONST = { PI: Math.PI, E: Math.E };

export function evalExpr(src, vars = {}) {
  const toks = [];
  const re = /\s*(?:(\d+\.?\d*(?:e[+-]?\d+)?|\.\d+)|([A-Za-z_][A-Za-z_0-9]*)|(.))/gy;
  let m; re.lastIndex = 0;
  while (re.lastIndex < src.length && (m = re.exec(src))) {
    if (m[1] !== undefined) toks.push({ t: 'n', v: parseFloat(m[1]) });
    else if (m[2] !== undefined) toks.push({ t: 'id', v: m[2] });
    else if (m[3] !== undefined && m[3].trim()) toks.push({ t: 'op', v: m[3] });
  }
  let i = 0;
  const peek = () => toks[i], next = () => toks[i++];
  const expect = (v) => { const t = next(); if (!t || t.v !== v) throw new Error(`Expected ${v}`); };
  function primary() {
    const t = next(); if (!t) throw new Error('Unexpected end');
    if (t.t === 'n') return t.v;
    if (t.t === 'id') {
      if (peek() && peek().v === '(') {
        next(); const args = [];
        if (peek() && peek().v !== ')') { args.push(add()); while (peek() && peek().v === ',') { next(); args.push(add()); } }
        expect(')');
        const f = FN[t.v]; if (!f) throw new Error(`Unknown function ${t.v}`);
        return f(...args);
      }
      if (t.v in vars) return Number(vars[t.v]);
      if (t.v in CONST) return CONST[t.v];
      throw new Error(`Unknown symbol ${t.v}`);
    }
    if (t.v === '(') { const v = add(); expect(')'); return v; }
    throw new Error(`Unexpected ${t.v}`);
  }
  function unary() { const t = peek(); if (t && t.t === 'op' && (t.v === '-' || t.v === '+')) { next(); const v = unary(); return t.v === '-' ? -v : v; } return power(); }
  function power() { const b = primary(); if (peek() && peek().v === '^') { next(); return Math.pow(b, unary()); } return b; }
  function mul() { let v = unary(); while (peek() && (peek().v === '*' || peek().v === '/')) { const o = next().v; const r = unary(); v = o === '*' ? v * r : v / r; } return v; }
  function add() { let v = mul(); while (peek() && (peek().v === '+' || peek().v === '-')) { const o = next().v; const r = mul(); v = o === '+' ? v + r : v - r; } return v; }
  const out = add();
  if (i < toks.length) throw new Error('Trailing input');
  return out;
}

export function fmt(n, dec = 4) {
  if (!Number.isFinite(n)) return String(n);
  if (Number.isInteger(n)) return n.toLocaleString('en-US');
  if (Math.abs(n) >= 1000) return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
  if (Math.abs(n) < 1e-4) return n.toExponential(3);
  return String(+n.toFixed(Math.max(dec, 4)));
}

const fill = (s, ctx, ans, dec) => s.replace(/\{(\w+)\}/g, (_, k) => (k === 'ans' ? fmt(ans, dec) : k in ctx ? fmt(ctx[k]) : `{${k}}`));

// Evaluate a template with given variable values -> {ctx, ans, steps, text}
export function solve(tpl, values) {
  const ctx = { ...values };
  for (const d of tpl.derive || []) ctx[d.s] = evalExpr(d.expr, ctx);
  const ans = evalExpr(tpl.expr, ctx);
  const dec = tpl.dec ?? 2;
  return {
    ctx, ans, dec,
    steps: (tpl.steps || []).map((s) => fill(s, ctx, ans, dec)),
    text: fill(tpl.q, ctx, ans, dec),
  };
}
export const defaults = (tpl) => Object.fromEntries(tpl.vars.map((v) => [v.s, v.v]));
export function randomValues(tpl, r = Math.random) {
  return Object.fromEntries(tpl.vars.map((v) => {
    const n = Math.round((v.max - v.min) / v.step);
    const x = v.min + Math.floor(r() * (n + 1)) * v.step;
    return [v.s, +x.toFixed(6)];
  }));
}
export function check(user, ans, dec = 2) {
  const u = parseFloat(String(user).replace(/,/g, ''));
  if (!Number.isFinite(u)) return false;
  const tol = Math.max(Math.abs(ans) * 0.01, 0.5 * Math.pow(10, -dec) + 1e-9);
  return Math.abs(u - ans) <= tol;
}
