import { BOARDS } from './content/index.js';
import { solve, randomValues, fmt } from './solver.js';

const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (a) => a[Math.floor(Math.random() * a.length)];

// Section A: 5 theory (5 marks) + 3 numericals (5 marks) = 40. Section B: 6 x 10 marks, one board per classroom = 60.
export function buildPaper() {
  const used = new Set(); const B = [];
  for (let room = 1; room <= 6; room++) {
    const boards = shuffle(BOARDS.filter((b) => b.room === room));
    const withTen = boards.find((b) => b.exam.some((e) => e.m === 10));
    const b = withTen || boards[0]; used.add(b.id);
    const tens = b.exam.filter((e) => e.m === 10);
    let parts;
    if (tens.length) { const e = pick(tens); parts = [{ label: '', text: e.q, answer: e.a }]; }
    else { const f = shuffle(b.exam.filter((e) => e.m === 5)).slice(0, 2); parts = f.map((e, i) => ({ label: `(${'ab'[i]}) [5]`, text: e.q, answer: e.a })); }
    B.push({ marks: 10, board: b.id, parts });
  }
  const rest = shuffle(BOARDS.filter((b) => !used.has(b.id)));
  const A = [];
  rest.slice(0, 5).forEach((b) => { const e = pick(b.exam.filter((x) => x.m === 5).concat(b.exam.filter((x) => x.m === 10).slice(0, 0))) || b.exam[0]; A.push({ marks: 5, board: b.id, parts: [{ label: '', text: e.q, answer: e.a }] }); });
  rest.slice(5, 8).forEach((b) => {
    const t = pick(b.tpls); const s = solve(t, randomValues(t));
    A.push({ marks: 5, board: b.id, parts: [{ label: 'Numerical:', text: s.text, answer: s.steps.map((x) => `- ${x}`).join('\n') + `\n\n**Answer: ${fmt(s.ans, s.dec)}${t.unit ? ' ' + t.unit : ''}**` }] });
  });
  const A2 = shuffle(A);
  A2.forEach((x, i) => (x.no = i + 1)); B.forEach((x, i) => (x.no = i + 9));
  return { A: A2, B };
}

export const STRATEGY = String.raw`## How to turn this school into 100/100

**Assumed paper (confirm against your department's pattern):** 100 marks, 3 hours, covering Modules 1-4 plus the self-study topics. The table below splits marks in proportion to contact hours - treat it as a planning guide, not an official scheme.

| Module | Hours | Indicative marks | Rooms / boards |
|---|---|---|---|
| 1 Fundamentals | 6 | ~21 | Room 1 · boards 1-4 |
| 2 Deep generative models (VAE, GAN) | 8 | ~29 | Rooms 2-3 · boards 5-12 |
| 3 Transformers, LLMs, Diffusion | 8 | ~29 | Rooms 4-5 · boards 13-20 |
| 4 Applications and ethics (+ self-study) | 6 (+4) | ~21 | Room 6 · boards 21-24 |

## 7-day plan (about 3 hours per day)
1. **Day 1 - Room 1:** definitions, evolution dates, distributions, sampling. Solve 3 sums per board.
2. **Day 2 - Room 2 (VAE):** derive the ELBO twice from memory; KL formula; reparameterisation code.
3. **Day 3 - Room 3 (GAN):** minimax, optimal discriminator proof, mode collapse, WGAN-GP, variants.
4. **Day 4 - Room 4 (Transformers):** attention numericals, multi-head parameter counts, GPT vs BERT vs T5 vs LLaMA table, LoRA.
5. **Day 5 - Room 5 (Diffusion):** forward closed form, reverse mean, training loss, Stable Diffusion pipeline, DDIM.
6. **Day 6 - Room 6:** metrics (perplexity, F1, pass@k), deepfakes, ethics answers, music, careers (self-study).
7. **Day 7:** two mock papers from the Mock paper tab under a 3-hour timer, then revise your weakest boards.

## Must-know derivations and proofs (most likely 10-markers)
1. ELBO derivation (Jensen) and the exact gap KL(q || p(z|x)).
2. Closed-form KL for Gaussians and the VAE loss code.
3. GAN minimax value function and the optimal discriminator D*; global optimum at p_g = p_data with V = -log 4.
4. Vanishing gradients and the non-saturating loss; mode collapse and fixes.
5. WGAN (Earth-Mover, Lipschitz) and the WGAN-GP penalty.
6. Scaled dot-product attention and why we divide by the square root of d_k; multi-head attention dimensions.
7. DDPM forward closed form x_t = sqrt(abar) x0 + sqrt(1-abar) eps; training loss; sampling algorithm.
8. Stable Diffusion block diagram with classifier-free guidance.
9. RLHF pipeline and LoRA parameter saving.
10. Deepfake creation/detection and responsible-AI measures.

## Answer-writing template (what earns full marks)
- **Define** in one line, then **draw** a labelled block diagram.
- Write the **formula/loss** with all symbols named, then a short **derivation or algorithm** (numbered steps).
- Add a **numerical or example**, then **pros/cons** or a comparison table.
- Close with an **application** or a one-line conclusion.

## Time plan inside the 3 hours
- 10 min: read the paper, choose optional questions. 15 min: final revision.
- **5-mark questions:** about 7 minutes each. **10-mark questions:** about 15 minutes each. Numericals: formula, substitution, answer with units - always show the substitution line.
- If stuck on a numerical, move on and return; partial marks are given for the formula and substitution.

## Study loop for every board
Read the chalkboard -> **Learn in depth** -> **Practice** until you can solve three different sums without hints (edit the numbers yourself to test understanding) -> answer each **Exam Q&A** on paper -> only then open the model answer.`;
