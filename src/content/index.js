import { solve, defaults } from '../solver.js';
import room1 from './room1.js';
import room2 from './room2.js';
import room3 from './room3.js';
import room4 from './room4.js';
import room5 from './room5.js';
import room6 from './room6.js';

export const MODULES = [
  { n: 1, title: 'Fundamentals of Generative AI', hrs: 6, rooms: [1], topics: 'Definition, evolution, applications · VAE/GAN/Transformer overview · probability distributions · latent space & sampling' },
  { n: 2, title: 'Deep Generative Models', hrs: 8, rooms: [2, 3], topics: 'VAE: latent variables, KL, ELBO, training · GAN: generator/discriminator, mode collapse, vanishing gradients, Wasserstein · DCGAN, StyleGAN, CycleGAN' },
  { n: 3, title: 'Generative Transformers & Large Models', hrs: 8, rooms: [4, 5], topics: 'Self-attention, multi-head · GPT/BERT/T5/LLaMA · prompting & fine-tuning · DDPM · Stable Diffusion & Midjourney' },
  { n: 4, title: 'Applications & Ethical Considerations', hrs: 6, rooms: [6], topics: 'Text, image/video, code generation · deepfakes · bias, fairness, responsible AI' },
  { n: 5, title: 'Self Study', hrs: 4, rooms: [1, 4, 6], topics: 'Auto-regressive & auto-encoding models · AI music · bias & fairness · careers & research directions (folded into the notes of Rooms 4 and 6)' },
];

const raw = [...room1, ...room2, ...room3, ...room4, ...room5, ...room6];
export const BOARDS = raw.map((b, i) => {
  const id = i + 1;
  const first = b.tpls[0];
  const s = solve(first, defaults(first));
  return { ...b, id, example: { q: s.text, ans: `${s.ans.toLocaleString('en-US', { maximumFractionDigits: 4 })}${first.unit ? ' ' + first.unit : ''}`, steps: s.steps } };
});
export const boardById = (id) => BOARDS.find((b) => b.id === id);
