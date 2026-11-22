import { evalExpr } from './solver.js';

const KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
export const hasKey = () => !!KEY;

const schema = {
  type: 'OBJECT',
  properties: {
    question: { type: 'STRING' },
    variables: { type: 'ARRAY', items: { type: 'OBJECT', properties: { sym: { type: 'STRING' }, label: { type: 'STRING' }, value: { type: 'NUMBER' } }, required: ['sym', 'label', 'value'] } },
    derived: { type: 'ARRAY', items: { type: 'OBJECT', properties: { sym: { type: 'STRING' }, expr: { type: 'STRING' } }, required: ['sym', 'expr'] } },
    answerExpr: { type: 'STRING' },
    unit: { type: 'STRING' },
    decimals: { type: 'INTEGER' },
    steps: { type: 'ARRAY', items: { type: 'STRING' } },
    hint: { type: 'STRING' },
  },
  required: ['question', 'variables', 'answerExpr', 'steps', 'hint'],
};

function prompt(board, example, avoid) {
  return `You are an exam-setter for a university course "Generative AI" (topic: ${board.title}).
Create ONE NEW numerical problem testing exactly this concept: ${board.gem}
Reference problem (do NOT copy its numbers or story; change both): ${JSON.stringify({ question: example.q, variables: example.vars, derived: example.derive || [], answerExpr: example.expr })}
${avoid.length ? 'Do not repeat these earlier questions: ' + JSON.stringify(avoid) + '\n' : ''}
Return JSON only, matching the schema. Rules:
- "question": plain text with every editable number written as a {sym} placeholder, e.g. "... with learning rate {lr} ...". Every variable must appear as a placeholder. Use only variables you list.
- "variables": 2 to 6 items. sym = short identifier (letters/digits/underscore, starts with a letter, e.g. a, mu1, T). label = short human label. value = a realistic, clean number (<= 3 decimals).
- "derived": optional intermediate quantities (sym + expr) that may use variables and earlier derived symbols.
- "answerExpr": ONE expression giving the final numeric answer. Allowed syntax ONLY: numbers, symbols, + - * / ^ ( ) , and the functions exp ln log sqrt abs min max pow sin cos tanh sigmoid comb(n,k) and constants PI E. (log = natural log.) No other syntax.
- "decimals": decimals to display (0-4). "unit": unit string or "".
- "steps": 3-6 short solution lines. They may contain {sym} placeholders (variables or derived) and {ans} for the final answer - never hard-code numbers that depend on the variables.
- "hint": one sentence nudging the method without giving the answer.
The mathematics must be correct and the answer finite.`;
}

function validate(o) {
  if (!o || typeof o.question !== 'string' || !Array.isArray(o.variables) || typeof o.answerExpr !== 'string') throw new Error('bad shape');
  const ok = /^[A-Za-z][A-Za-z0-9_]*$/;
  const vars = {};
  for (const v of o.variables) { if (!ok.test(v.sym) || typeof v.value !== 'number') throw new Error('bad variable'); vars[v.sym] = v.value; }
  const ctx = { ...vars };
  for (const d of o.derived || []) { if (!ok.test(d.sym)) throw new Error('bad derived'); ctx[d.sym] = evalExpr(d.expr, ctx); }
  const ans = evalExpr(o.answerExpr, ctx);
  if (!Number.isFinite(ans)) throw new Error('non-finite');
  for (const v of o.variables) if (!o.question.includes(`{${v.sym}}`)) throw new Error('placeholder missing');
  return {
    q: o.question,
    vars: o.variables.map((v) => ({ s: v.sym, label: v.label, v: v.value, min: null, max: null, step: null })),
    derive: (o.derived || []).map((d) => ({ s: d.sym, expr: d.expr })),
    expr: o.answerExpr, dec: Math.max(0, Math.min(6, o.decimals ?? 2)), unit: o.unit || '',
    steps: o.steps || [], hint: o.hint || '', source: 'gemini',
  };
}

export async function generateSum(board, example, avoid = []) {
  if (!KEY) throw new Error('No VITE_GEMINI_API_KEY in .env');
  let lastErr;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt(board, example, avoid) }] }], generationConfig: { responseMimeType: 'application/json', responseSchema: schema, temperature: 0.9 } }),
      });
      if (!res.ok) throw new Error(`Gemini HTTP ${res.status}: ${(await res.text()).slice(0, 160)}`);
      const j = await res.json();
      const text = j.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
      return validate(JSON.parse(text));
    } catch (e) { lastErr = e; if (/HTTP 4(0\d|29)/.test(e.message) && !/429/.test(e.message)) break; }
  }
  throw lastErr;
}
