// Room 6 — Module 4 (Applications & Ethics) + Module 5 self-study topics
export default [
  {
    room: 6, tag: 'Module 4 · 4.1 Text Generation', title: 'AI in Text Generation: ChatGPT, Bard & Evaluation',
    chalk: ['Pipeline : pre-train → SFT → RLHF → chat assistant', 'Perplexity = exp( −(1/N) Σ log p(wᵢ | w₍<ᵢ₎) )', 'BLEU brevity penalty BP = min(1, e^(1 − r/c))'],
    summary: 'Chat assistants are autoregressive LLMs pre-trained on huge text, then instruction-tuned and aligned with human feedback. Know the products, the training pipeline, the metrics and the failure modes.',
    notes: [
      { h: 'Products and timeline', body: String.raw`- **ChatGPT** (OpenAI, launched **30 Nov 2022**): GPT-3.5 then GPT-4 (2023, multimodal); trained with **SFT + RLHF** (InstructGPT recipe).
- **Bard** (Google): announced Feb 2023 (LaMDA, later PaLM 2); **renamed Gemini in Feb 2024** with Gemini multimodal models.
- Others: Claude (Anthropic, Constitutional AI), LLaMA-based open assistants, Copilot (Microsoft), Mistral, etc.
- **Uses:** conversation, summarisation, translation, drafting, tutoring, question answering, data extraction, agents that call tools.` },
      { h: 'How a chat model is built', body: String.raw`1. **Pre-training** (self-supervised next-token prediction on web, books, code - trillions of tokens).
2. **Supervised fine-tuning / instruction tuning** on human-written (prompt, answer) pairs.
3. **RLHF** (reward model from preference rankings + PPO) or **DPO** for helpfulness/harmlessness alignment.
4. **Inference:** prompt (system + user) -> tokens -> autoregressive decoding with temperature / top-p -> streamed answer. A **context window** limits prompt + output length; **KV cache** speeds decoding; **RAG/tools** add knowledge.` },
      { h: 'Evaluation metrics', body: String.raw`- **Perplexity** $PPL=\exp\!\big(-\tfrac1N\sum_i\log p(w_i\mid w_{<i})\big)$: "effective branching factor"; lower is better; only comparable with the same tokenizer/data.
- **BLEU** (translation): modified n-gram precision with brevity penalty $BP=\min(1,e^{1-r/c})$ ($r$ = reference length, $c$ = candidate length). **ROUGE** (summarisation, recall-oriented), **METEOR**, **BERTScore** (embedding similarity), **human evaluation / LLM-as-judge**, benchmarks (MMLU, HellaSwag, TruthfulQA).` },
      { h: 'Limitations', body: String.raw`**Hallucination** (fluent but false), outdated knowledge, bias and toxicity, prompt injection/jailbreaks, privacy leakage of training data, inconsistent reasoning, high compute cost. Mitigations: RAG, grounding and citations, guardrails, human review, evaluation suites.` },
    ],
    formulas: [String.raw`PPL=\exp\!\Big(-\frac1N\sum_{i=1}^{N}\log p(w_i\mid w_{<i})\Big)`, String.raw`BP=\min\!\big(1,e^{1-r/c}\big)`, String.raw`\text{BLEU}=BP\cdot\exp\!\Big(\sum_{n}w_n\log p_n\Big)`],
    tpls: [{
      q: 'A language model assigns a total natural-log likelihood of {L} to a test passage of N = {N} tokens. What is its perplexity?',
      vars: [{ s: 'L', label: 'total log-lik', v: -23, min: -40, max: -10, step: 0.5 }, { s: 'N', label: 'tokens N', v: 10, min: 10, max: 20, step: 5 }],
      derive: [{ s: 'avg', expr: '-L/N' }],
      expr: 'exp(avg)', dec: 3,
      steps: ['Average negative log-likelihood = −L/N = −({L})/{N} = {avg}', 'PPL = exp({avg}) = {ans}'],
    }, {
      q: 'A machine translation output has c = {c} words and the closest reference has r = {r} words. Compute the BLEU brevity penalty BP = min(1, exp(1 − r/c)).',
      vars: [{ s: 'c', label: 'candidate c', v: 10, min: 6, max: 14, step: 2 }, { s: 'r', label: 'reference r', v: 12, min: 8, max: 16, step: 2 }],
      expr: 'min(1,exp(1-r/c))', dec: 4,
      steps: ['r/c = {r}/{c}', 'BP = min(1, exp(1 − r/c)) = {ans}  (BP = 1 when the candidate is at least as long as the reference)'],
    }],
    gem: 'Perplexity from total log-likelihood or per-token probabilities, BLEU brevity penalty, or unigram precision/recall (ROUGE-1) on a tiny pair of sentences.',
    exam: [
      { m: 10, q: 'Describe how ChatGPT-like assistants are trained and deployed. List their limitations.', a: 'Pre-train a decoder-only Transformer on large text with next-token prediction; supervised fine-tune on instruction-response pairs; align with RLHF (reward model from human preferences, PPO with KL penalty) or DPO. Deployed with system prompts, safety filters, decoding (temperature/top-p) and optional tools/RAG. Limitations: hallucination, stale knowledge, bias, prompt injection, privacy and copyright concerns, high compute cost.' },
      { m: 5, q: 'Define perplexity. Compute it for N=10 tokens with total log-likelihood -23 (natural log).', a: 'PPL = exp(-(1/N) sum log p(w_i|w_<i)). Average NLL = 2.3; PPL = e^2.3 = 9.97 - the model is as uncertain as choosing among about 10 equally likely tokens.' },
      { m: 5, q: 'Compare Bard (Gemini) and ChatGPT briefly.', a: 'Both are LLM chat assistants. ChatGPT: OpenAI GPT-3.5/GPT-4 family, RLHF-aligned, launched Nov 2022. Bard: Google, launched 2023 on LaMDA then PaLM 2, renamed Gemini (Feb 2024) with natively multimodal Gemini models and Google-services integration. Both can hallucinate; both use Transformer decoders aligned with human feedback.' },
    ],
    tips: ['Learn the dates: ChatGPT 30 Nov 2022; Bard → Gemini Feb 2024.', 'Perplexity: average first, then exponentiate.'],
  },
  {
    room: 6, tag: 'Module 4 · 4.1 Image & Video Synthesis · Self-study: AI Music', title: 'Image/Video Synthesis, Deepfakes, AI Art & AI Music',
    chalk: ['Face-swap: shared encoder + 2 decoders', 'Detection: F1 = 2TP / (2TP + FP + FN)', 'Music: symbolic (MIDI) · spectrogram · neural-codec tokens'],
    summary: 'Generative models now produce photorealistic images, video, speech and music. Deepfakes are the risky face of this power; detection, watermarking and provenance are the defence.',
    notes: [
      { h: 'Image and video synthesis', body: String.raw`- **Images:** GANs (StyleGAN) then diffusion (DALL-E 2/3, Stable Diffusion, Midjourney, Imagen). Tasks: text-to-image, inpainting, super-resolution, style transfer.
- **Video:** extend image diffusion with **temporal layers/attention** (spatio-temporal U-Net or **Diffusion Transformer** on spacetime patches). Systems: Make-A-Video, Imagen Video, Runway Gen, **Sora** (OpenAI, announced Feb 2024), Veo. Challenges: **temporal consistency**, physics, long duration, compute: frames $=fps\times$ seconds, so cost scales with length.
- **AI art:** *Edmond de Belamy* (GAN-generated portrait by Obvious) sold at Christie's in 2018 for **$432,500**; ongoing debates on authorship, copyright, artists' consent and style mimicry.` },
      { h: 'Deepfakes: how they are made', body: String.raw`- **Autoencoder face swap:** one **shared encoder** + **two decoders** (person A, person B). Train each decoder to reconstruct its person; to swap, encode A's face and decode with B's decoder.
- **GAN-based:** StyleGAN faces, face reenactment, image-to-image translation. **Diffusion** for high-fidelity images/video.
- **Lip-sync and voice cloning:** Wav2Lip, neural TTS - audio deepfakes need only seconds of sample speech.
- **Harms:** non-consensual imagery, fraud and impersonation, political misinformation, "liar's dividend" (real evidence dismissed as fake). **Benefits:** film VFX/dubbing, accessibility, education, privacy-preserving avatars.` },
      { h: 'Deepfake detection and provenance', body: String.raw`- **Visual artefacts:** inconsistent lighting/shadows, blending edges, unnatural blinking, teeth/hair/ear glitches; **frequency-domain** fingerprints from upsampling layers; **physiological cues** (pulse/colour variations); audio-visual lip-sync mismatch.
- **Learning-based detectors:** CNN/Transformer classifiers trained on FaceForensics++, DFDC (Facebook Deepfake Detection Challenge), Celeb-DF. Generalisation to unseen generators is the main weakness - an **arms race**.
- **Proactive defences:** **watermarking** (e.g., Google SynthID, invisible watermarks), **content provenance** (C2PA content credentials, signed metadata), platform labelling, legal rules.
- **Metrics:** precision, recall, $F_1=\dfrac{2TP}{2TP+FP+FN}$, ROC-AUC.` },
      { h: 'Self-study: AI-generated music and creativity', body: String.raw`- **Representations:** symbolic (MIDI/notes), mel-**spectrogram**, raw waveform, **neural codec tokens** (EnCodec/SoundStream).
- **Systems:** **MuseNet** (OpenAI 2019, Transformer on MIDI), **Jukebox** (OpenAI 2020, VQ-VAE + Transformers on raw audio, with lyrics), **AudioLM** and **MusicLM** (Google 2023, text-to-music), **MusicGen** (Meta 2023, Transformer over EnCodec tokens), **Riffusion** (diffusion on spectrograms), commercial tools such as Suno and Udio.
- **Creativity:** AI as co-creator (idea generation, accompaniment, style transfer) vs replacement; open issues: training-data licensing, artist compensation, attribution, originality, voice-clone consent. Evaluation: Frechet Audio Distance (FAD), listening tests.` },
    ],
    formulas: [String.raw`F_1=\frac{2\,\text{Precision}\cdot\text{Recall}}{\text{Precision}+\text{Recall}}=\frac{2TP}{2TP+FP+FN}`, String.raw`\#\text{frames}=fps\times t,\quad \text{raw bytes}=fps\cdot t\cdot H\cdot W\cdot 3`],
    tpls: [{
      q: 'A deepfake detector flags {tp} true fakes (TP), wrongly flags {fp} real videos (FP) and misses {fn} fakes (FN). Compute its F1-score.',
      vars: [{ s: 'tp', label: 'TP', v: 90, min: 50, max: 120, step: 10 }, { s: 'fp', label: 'FP', v: 10, min: 5, max: 40, step: 5 }, { s: 'fn', label: 'FN', v: 30, min: 10, max: 50, step: 10 }],
      derive: [{ s: 'pr', expr: 'tp/(tp+fp)' }, { s: 'rc', expr: 'tp/(tp+fn)' }],
      expr: '2*tp/(2*tp+fp+fn)', dec: 4,
      steps: ['Precision = TP/(TP+FP) = {tp}/({tp}+{fp}) = {pr}', 'Recall = TP/(TP+FN) = {tp}/({tp}+{fn}) = {rc}', 'F1 = 2TP/(2TP + FP + FN) = {ans}'],
    }, {
      q: 'An uncompressed generated video runs at {fps} fps for {t} seconds at {H}×{H} resolution with 3 bytes per pixel. How many megabytes (1 MB = 10⁶ bytes) of raw frame data is that?',
      vars: [{ s: 'fps', label: 'fps', v: 24, min: 12, max: 30, step: 6 }, { s: 't', label: 'seconds', v: 10, min: 4, max: 16, step: 2 }, { s: 'H', label: 'side (px)', v: 512, min: 256, max: 1024, step: 256 }],
      derive: [{ s: 'fr', expr: 'fps*t' }],
      expr: 'fr*H*H*3/1e6', dec: 2, unit: 'MB',
      steps: ['Frames = fps × t = {fps} × {t} = {fr}', 'Bytes per frame = {H}·{H}·3', 'Total = {fr} × {H}² × 3 / 10⁶ = {ans} MB'],
    }],
    gem: 'Precision/recall/F1 for a deepfake detector from a small confusion matrix, or raw video size / number of frames from fps, duration and resolution.',
    exam: [
      { m: 10, q: 'Explain how deepfakes are created and how they can be detected. Discuss countermeasures.', a: 'Creation: autoencoder face swap with shared encoder and person-specific decoders; GAN-based synthesis/reenactment (StyleGAN); diffusion-based image/video; lip-sync and voice-cloning models. Detection: artefacts (blending boundaries, inconsistent lighting, unnatural blinks), frequency-domain fingerprints, physiological signals, learned CNN/Transformer classifiers on FaceForensics++/DFDC, audio-visual inconsistency. Weakness: poor generalisation to new generators (arms race). Countermeasures: watermarking (SynthID), provenance metadata (C2PA), platform labelling/takedown, legislation, media literacy.' },
      { m: 5, q: 'How does text-to-video generation differ from text-to-image generation?', a: 'Video models add a time dimension: temporal attention/3D convolutions or spacetime-patch Diffusion Transformers, requiring temporal consistency across frames, motion and physics modelling, and far more compute and data (frames = fps x seconds). Examples: Make-A-Video, Imagen Video, Sora, Veo.' },
      { m: 5, q: 'Write a short note on AI-generated music.', a: 'Models work on MIDI (MuseNet), raw audio/VQ-VAE codes (Jukebox), codec tokens with Transformers (MusicGen, AudioLM, MusicLM) or spectrogram diffusion (Riffusion). They support composition, accompaniment and style transfer; issues include copyright of training data, artist compensation, voice cloning consent and originality; evaluated via listening tests and Frechet Audio Distance.' },
    ],
    tips: ['In a detection answer always mention the arms-race / generalisation problem.', 'F1 numerical: compute TP-based shortcut 2TP/(2TP+FP+FN).'],
  },
  {
    room: 6, tag: 'Module 4 · 4.1 Code Generation', title: 'Generative AI for Code: Codex & Copilot',
    chalk: ['Codex = GPT fine-tuned on public code (OpenAI, 2021)', 'pass@k = 1 − C(n−c, k) / C(n, k)', 'Judge by unit tests (functional correctness), not BLEU'],
    summary: 'Code LLMs are autoregressive Transformers trained on source code. Quality is measured by whether generated programs pass unit tests (pass@k), not by text similarity.',
    notes: [
      { h: 'Codex and GitHub Copilot', body: String.raw`- **Codex** (OpenAI, Chen et al., 2021): a **GPT language model fine-tuned on public GitHub code** (largest paper model 12B parameters). Powers **GitHub Copilot** (technical preview June 2021, generally available 2022; built by GitHub + OpenAI), now using newer models.
- **Copilot workflow:** reads the surrounding file/comments as the prompt -> predicts the next tokens -> suggests completions/whole functions inline; chat, test generation, explanation, refactoring, PR summaries.
- Other code models: AlphaCode (competitive programming), **Code Llama**, StarCoder, CodeT5, and general LLMs (GPT-4, Gemini, Claude).
- **Techniques:** next-token pre-training on code + natural language; **fill-in-the-middle (FIM)** for editors; instruction tuning; RLHF/execution feedback; repository-level context and RAG; tool use (running tests).` },
      { h: 'Evaluating code generation', body: String.raw`**BLEU is a poor fit** - different code can be correct. Use **functional correctness** with unit tests: **HumanEval** (164 hand-written Python problems; also MBPP, APPS).
**pass@k:** generate $n$ samples per problem, $c$ of them pass the tests. Unbiased estimator:
$$\text{pass@}k=\mathbb E_{\text{problems}}\Big[1-\frac{\binom{n-c}{k}}{\binom{n}{k}}\Big]$$
(probability that at least one of $k$ randomly chosen samples is correct). Example: $n=10$, $c=3$, $k=2$: $1-\binom72/\binom{10}2=1-21/45=0.533$. pass@1 = $c/n$.` },
      { h: 'Benefits, risks and good practice', body: String.raw`+ Productivity, boilerplate, learning, test and documentation generation, language translation (e.g., Java -> Python).
- **Risks:** subtly wrong or **insecure** code, hallucinated APIs/packages, licence and copyright concerns (training on public repositories, code regurgitation), secret leakage, over-reliance/skill atrophy, bias to popular languages.
- **Practice:** review all suggestions, write tests first, run linters/SAST, keep secrets out of prompts, check licences, use enterprise privacy settings.` },
    ],
    formulas: [String.raw`\text{pass@}k=1-\frac{\binom{n-c}{k}}{\binom{n}{k}}`, String.raw`\text{pass@}1=\frac cn`],
    tpls: [{
      q: 'For a coding problem a model generates n = {n} samples and c = {c} of them pass all unit tests. Compute the unbiased pass@k estimate for k = {k}.',
      vars: [{ s: 'n', label: 'n', v: 10, min: 10, max: 20, step: 5 }, { s: 'c', label: 'c', v: 3, min: 1, max: 6, step: 1 }, { s: 'k', label: 'k', v: 2, min: 1, max: 4, step: 1 }],
      derive: [{ s: 'a', expr: 'comb(n-c,k)' }, { s: 'b', expr: 'comb(n,k)' }],
      expr: '1-comb(n-c,k)/comb(n,k)', dec: 4,
      steps: ['C(n−c, k) = C({n}−{c}, {k}) = {a}', 'C(n, k) = C({n}, {k}) = {b}', 'pass@k = 1 − {a}/{b} = {ans}'],
    }],
    gem: 'pass@k with the unbiased estimator for given n, c, k; or acceptance-rate / time-saved estimates for a code assistant.',
    exam: [
      { m: 10, q: 'Explain how Codex/Copilot work and how code generation models are evaluated.', a: 'Codex is a GPT model fine-tuned on public code; Copilot sends file context/comments as the prompt and the model autoregressively predicts completions, optionally with fill-in-the-middle. Evaluation uses functional correctness on test suites (HumanEval, 164 problems) with pass@k = 1 - C(n-c,k)/C(n,k) because text-similarity metrics like BLEU ignore semantics. Risks: insecure/wrong code, licence issues, hallucinated APIs.' },
      { m: 5, q: 'n=20 samples, c=5 correct. Compute pass@1 and pass@5.', a: 'pass@1 = 5/20 = 0.25. pass@5 = 1 - C(15,5)/C(20,5) = 1 - 3003/15504 = 1 - 0.1937 = 0.8063.' },
      { m: 5, q: 'List benefits and risks of AI coding assistants.', a: 'Benefits: faster boilerplate, tests/docs, learning, translation between languages. Risks: incorrect or vulnerable code, hallucinated packages, licensing/copyright, secret leakage, over-reliance; mitigated by review, tests, scanners, policy.' },
    ],
    tips: ['Unbiased pass@k beats the naive 1−(1−c/n)^k - show the binomial form.', 'State that Copilot is built on Codex-family models by OpenAI + GitHub.'],
  },
  {
    room: 6, tag: 'Module 4 · Ethics · Self-study: Bias, Fairness & Careers', title: 'Ethics, Bias, Fairness & Responsible AI (+ Careers)',
    chalk: ['Demographic parity : P(ŷ=1|A=a) = P(ŷ=1|A=b)', 'Disparate impact = rate_B / rate_A ≥ 0.8  (four-fifths rule)', 'Responsible AI : fair · transparent · accountable · private · safe'],
    summary: 'Generative AI inherits and amplifies bias from data, can spread misinformation and violate privacy and copyright. Responsible AI combines measurement, mitigation, transparency, governance and human oversight.',
    notes: [
      { h: 'Where bias comes from', body: String.raw`- **Data bias:** unrepresentative or stereotyped web data (e.g., image generators drawing "CEO" mostly as men, "nurse" as women; LLMs associating occupations/ethnicities with stereotypes); language and region imbalance.
- **Label/annotation bias:** annotators' culture and preferences (also in RLHF).
- **Algorithmic/objective bias:** optimising likelihood reproduces majority patterns; sampling truncation amplifies the mode.
- **Deployment bias:** use in contexts different from training; feedback loops.` },
      { h: 'Ethical concerns (list for a 10-mark answer)', body: String.raw`1. **Bias and discrimination** (representational and allocative harms).
2. **Misinformation and deepfakes**; erosion of trust.
3. **Privacy:** memorisation and leakage of personal data; consent for training data.
4. **Copyright and attribution:** training on copyrighted works, style mimicry, ownership of outputs.
5. **Hallucination and safety:** confident falsehoods in medicine, law, code; harmful content, jailbreaks.
6. **Security misuse:** phishing, malware, fraud, voice-clone scams.
7. **Environmental cost:** energy and water for training/inference; **labour** (data labelling, job displacement); concentration of power.` },
      { h: 'Fairness metrics', body: String.raw`With protected attribute $A$ and decision $\hat Y$:
- **Demographic (statistical) parity:** $P(\hat Y=1\mid A=a)=P(\hat Y=1\mid A=b)$; **difference** $=|P_a-P_b|$.
- **Disparate impact ratio:** $\dfrac{P(\hat Y=1\mid\text{unprivileged})}{P(\hat Y=1\mid\text{privileged})}$; the **four-fifths (80%) rule** flags values $<0.8$.
- **Equal opportunity:** equal true-positive rates across groups; **equalized odds:** equal TPR **and** FPR.
- Trade-off: several fairness criteria cannot all hold at once (impossibility results) unless base rates are equal.` },
      { h: 'Mitigation and Responsible AI', body: String.raw`- **Pre-processing:** curate and rebalance data, filter toxic content, documentation (datasheets, model cards). **In-processing:** fairness constraints, adversarial debiasing, RLHF / Constitutional AI. **Post-processing:** output filters, threshold adjustment, red-teaming, human-in-the-loop.
- **Principles:** fairness, transparency/explainability, accountability, privacy, safety and robustness, human oversight, sustainability. **Frameworks/regulation:** NIST AI Risk Management Framework, EU AI Act (2024), data-protection laws such as India's DPDP Act 2023; provenance and watermarking (C2PA, SynthID) for synthetic media.` },
      { h: 'Self-study: Future careers and research directions', body: String.raw`**Careers:** ML/AI engineer, LLM-application and RAG engineer, research scientist, data scientist, MLOps/LLMOps engineer, AI product manager, AI safety/alignment researcher, AI ethics and policy specialist, creative technologist (design, games, film, music).
**Skills:** Python and PyTorch, linear algebra and probability, Transformers/diffusion internals, evaluation, distributed training, data engineering, cloud/GPU optimisation, responsible-AI practice.
**Research directions:** efficient and small models (quantisation, distillation, MoE), long-context and multimodal models, reasoning and agents with tools, retrieval and grounding, alignment and interpretability, robust evaluation and benchmarks, controllable and faster diffusion, video/3D/world models, AI for science (proteins, materials), watermarking and detection, privacy-preserving and federated training.` },
    ],
    formulas: [String.raw`DI=\frac{P(\hat Y=1\mid A=b)}{P(\hat Y=1\mid A=a)}\ \ (\text{flag if }DI<0.8)`, String.raw`\Delta_{DP}=|P(\hat Y=1\mid A=a)-P(\hat Y=1\mid A=b)|`, String.raw`TPR_a=TPR_b\ \ (\text{equal opportunity})`],
    tpls: [{
      q: 'A resume-screening model selects {sa} of {na} applicants from group A and {sb} of {nb} applicants from group B. Compute the disparate impact ratio (group B rate ÷ group A rate).',
      vars: [{ s: 'na', label: 'n (A)', v: 100, min: 80, max: 200, step: 20 }, { s: 'sa', label: 'selected A', v: 45, min: 30, max: 70, step: 5 }, { s: 'nb', label: 'n (B)', v: 60, min: 40, max: 100, step: 20 }, { s: 'sb', label: 'selected B', v: 18, min: 10, max: 30, step: 2 }],
      derive: [{ s: 'ra', expr: 'sa/na' }, { s: 'rb', expr: 'sb/nb' }],
      expr: 'rb/ra', dec: 4,
      steps: ['Selection rate A = {sa}/{na} = {ra}', 'Selection rate B = {sb}/{nb} = {rb}', 'Disparate impact = {rb} / {ra} = {ans}', 'Compare with 0.8 (four-fifths rule).'],
    }, {
      q: 'A model approves {sa} of {na} applicants in group A and {sb} of {nb} in group B. What is the demographic parity difference |P(approve|A) − P(approve|B)|?',
      vars: [{ s: 'na', label: 'n (A)', v: 100, min: 80, max: 200, step: 20 }, { s: 'sa', label: 'approved A', v: 45, min: 30, max: 70, step: 5 }, { s: 'nb', label: 'n (B)', v: 60, min: 40, max: 100, step: 20 }, { s: 'sb', label: 'approved B', v: 18, min: 10, max: 30, step: 2 }],
      expr: 'abs(sa/na-sb/nb)', dec: 4,
      steps: ['P(approve | A) = {sa}/{na}', 'P(approve | B) = {sb}/{nb}', 'Difference = {ans}'],
    }],
    gem: 'Disparate impact ratio or demographic parity difference from selection counts; equal opportunity gap using true positive rates from small confusion counts.',
    exam: [
      { m: 10, q: 'Discuss ethical concerns of generative AI and describe responsible-AI practices to address them.', a: 'Concerns: bias and stereotyping, deepfakes and misinformation, privacy/memorisation, copyright and attribution, hallucination and safety, malicious use (fraud, phishing), environmental cost, job displacement, concentration of power. Practices: diverse, documented data (datasheets, model cards), bias audits with fairness metrics, RLHF/constitutional alignment, red-teaming and content filters, watermarking/provenance (SynthID, C2PA), human oversight, transparency, privacy protections, governance and regulation (EU AI Act, NIST AI RMF, DPDP Act).' },
      { m: 5, q: 'Group A: 50 of 100 selected; group B: 20 of 80 selected. Compute the disparate impact and say whether the four-fifths rule is met.', a: 'Rate A = 0.50; rate B = 0.25; DI = 0.25/0.50 = 0.5 < 0.8, so adverse impact is indicated and the rule is violated.' },
      { m: 5, q: 'Differentiate demographic parity, equal opportunity and equalized odds.', a: 'Demographic parity: equal positive-prediction rate across groups. Equal opportunity: equal true-positive rates. Equalized odds: equal TPR and FPR. They can conflict with each other and with accuracy when base rates differ.' },
    ],
    tips: ['Structure ethics answers: concern → example → mitigation.', 'Use the four-fifths number (0.8) in every disparate-impact numerical.'],
  },
];
