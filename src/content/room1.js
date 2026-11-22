// Room 1 — Module 1: Fundamentals of Generative AI (Unit 1.1)
export default [
  {
    room: 1, tag: 'Module 1 · 1.1 Introduction', title: 'What is Generative AI?',
    chalk: ['Discriminative : learn p(y | x)', 'Generative : learn p(x)  or  p(x | y)', 'Bayes : p(y|x) = p(x|y)p(y) / Σ p(x|y′)p(y′)'],
    summary: 'Generative AI learns the probability distribution of data so it can sample brand-new, realistic data (text, images, audio, video, code).',
    notes: [
      { h: 'Definition', body: String.raw`**Generative AI** = models that learn the (conditional) data distribution $p(x)$ or $p(x\mid c)$ well enough to **sample new data points** that look like the training data but are not copies of it.

- Input: a dataset $\{x_i\}$ (images, sentences, audio...). Output: a model $p_\theta(x)$ you can **sample** from and (often) **evaluate**.
- Conditional generation: $p_\theta(x\mid c)$ where $c$ = text prompt, class label, sketch, another image...
- Typical goal: maximise likelihood $\max_\theta \sum_i \log p_\theta(x_i)$ (VAE, autoregressive, diffusion) or match distributions adversarially (GAN).` },
      { h: 'Discriminative vs Generative', body: String.raw`| | Discriminative | Generative |
|---|---|---|
| Learns | $p(y\mid x)$ (decision boundary) | $p(x)$ or $p(x,y)=p(x\mid y)p(y)$ |
| Task | classify / regress | create data, density estimate, also classify via Bayes |
| Examples | logistic regression, SVM, CNN classifier | Naive Bayes, HMM, GMM, VAE, GAN, GPT, diffusion |
| Needs | labels (usually) | often unlabeled data (self-supervised) |

A generative model **can classify** with Bayes rule: $p(y\mid x)=\dfrac{p(x\mid y)p(y)}{\sum_{y'}p(x\mid y')p(y')}$ (see the sum on the board).` },
      { h: 'Evolution (know the order and the authors)', body: String.raw`- **Classical:** n-gram language models, Naive Bayes, HMMs, Gaussian mixtures (1950s-2000s).
- **2006-2012:** Restricted Boltzmann Machines / Deep Belief Networks (Hinton) revive deep generative modelling.
- **2013:** **VAE** (Kingma & Welling). **2014:** **GAN** (Goodfellow et al.); sequence-to-sequence + attention (Bahdanau).
- **2017:** **Transformer** ("Attention Is All You Need", Vaswani et al.).
- **2018:** GPT-1 and BERT; **2019:** GPT-2; **2020:** GPT-3 (175B) and **DDPM** (Ho et al.).
- **2021-22:** DALL-E, CLIP, Codex/Copilot, **Stable Diffusion**, Midjourney, **ChatGPT (Nov 2022)**.
- **2023 onward:** GPT-4, LLaMA, Bard (later Gemini), Claude; multimodal and video generation; open-weight LLMs.` },
      { h: 'Applications', body: String.raw`- **Text:** chatbots, summarisation, translation, writing aids. **Code:** Copilot, Codex.
- **Images/Video:** text-to-image, inpainting, super-resolution, style transfer, deepfakes, AI art.
- **Audio/Music:** speech synthesis (TTS), voice cloning, music generation.
- **Science/Industry:** drug and protein design, synthetic data, data augmentation, game assets, design.` },
      { h: 'The generative trilemma (good for 5-mark answers)', body: String.raw`Ideal model = **high sample quality + good mode coverage (diversity) + fast sampling.**
- **GANs:** fast and sharp, but can lose diversity (mode collapse).
- **VAEs:** fast and diverse, but samples are often blurry.
- **Diffusion models:** high quality and diversity, but slow (many denoising steps).` },
    ],
    formulas: [String.raw`p(y\mid x)=\frac{p(x\mid y)\,p(y)}{\sum_{y'}p(x\mid y')\,p(y')}`, String.raw`\theta^*=\arg\max_\theta \sum_{i=1}^{N}\log p_\theta(x_i)`],
    tpls: [{
      q: 'A spam filter is a generative classifier. Prior P(spam) = {ps}. A message pattern x has likelihood p(x | spam) = {ls} and p(x | ham) = {lh}. Find the posterior P(spam | x).',
      vars: [{ s: 'ps', label: 'P(spam)', v: 0.3, min: 0.1, max: 0.6, step: 0.05 }, { s: 'ls', label: 'p(x|spam)', v: 0.8, min: 0.5, max: 0.95, step: 0.05 }, { s: 'lh', label: 'p(x|ham)', v: 0.1, min: 0.02, max: 0.3, step: 0.02 }],
      derive: [{ s: 'num', expr: 'ps*ls' }, { s: 'den', expr: 'ps*ls+(1-ps)*lh' }],
      expr: 'num/den', dec: 4,
      steps: ['Bayes: P(spam|x) = p(x|spam)P(spam) / [p(x|spam)P(spam) + p(x|ham)P(ham)]', 'Numerator = {ps} × {ls} = {num}', 'Denominator = {num} + (1 − {ps}) × {lh} = {den}', 'P(spam | x) = {num} / {den} = {ans}'],
    }],
    gem: 'Bayes rule posterior for a generative classifier (prior, class-conditional likelihoods -> posterior probability). Vary the story (disease test, defect detection, sentiment).',
    exam: [
      { m: 5, q: 'Define Generative AI and differentiate it from discriminative models with two examples each.', a: 'Generative AI learns p(x) or p(x|c) and can sample new data (GAN, VAE, GPT, diffusion, Naive Bayes, HMM). Discriminative models learn p(y|x) / a decision boundary (logistic regression, SVM, CNN classifier). Generative models can also classify using Bayes rule but model more (the data itself), so need more capacity; discriminative models usually give higher accuracy on pure classification.' },
      { m: 5, q: 'Explain the generative trilemma and place GAN, VAE and diffusion models on it.', a: 'Quality, diversity and sampling speed are hard to get together. GAN: fast + high quality, weaker diversity (mode collapse). VAE: fast + diverse, blurrier samples. Diffusion: high quality + diversity, slow sampling because it needs many iterative denoising steps (mitigated by DDIM, latent diffusion, distillation).' },
      { m: 10, q: 'Trace the evolution of generative AI from classical models to modern foundation models, citing key milestones and applications.', a: 'Classical (n-gram, HMM, Naive Bayes, GMM) -> RBM/DBN -> 2013 VAE -> 2014 GAN -> 2017 Transformer -> 2018 GPT/BERT -> 2020 GPT-3 and DDPM -> 2021-22 DALL-E, Codex, Stable Diffusion, ChatGPT -> 2023+ multimodal LLMs and video models. Applications: text/chat, code, image/video, audio/music, drug and protein design, synthetic data.' },
    ],
    tips: ['Always write p(x) vs p(y|x) when comparing model types; examiners look for it.', 'Memorise years: VAE 2013, GAN 2014, Transformer 2017, DDPM 2020, Stable Diffusion 2022.'],
  },
  {
    room: 1, tag: 'Module 1 · 1.1 Key Architectures', title: 'VAE · GAN · Transformer (+ Diffusion)',
    chalk: ['VAE : max ELBO = E[log p(x|z)] − KL(q‖p)', 'GAN : min_G max_D  E[log D(x)] + E[log(1−D(G(z)))]', 'Transformer : softmax(QKᵀ/√d_k)·V', 'Diffusion : train ε_θ(x_t,t) to predict the noise'],
    summary: 'Four families dominate: VAE (probabilistic encoder-decoder), GAN (two-player game), Transformer (attention, autoregressive/masked), Diffusion (iterative denoising).',
    notes: [
      { h: 'One-paragraph intuition for each', body: String.raw`- **VAE:** encoder $q_\phi(z\mid x)$ maps data to a *distribution* in a latent space; decoder $p_\theta(x\mid z)$ reconstructs. Trained by maximising the **ELBO**. Sample by drawing $z\sim\mathcal N(0,I)$ and decoding.
- **GAN:** a **generator** $G(z)$ turns noise into fake data; a **discriminator** $D(x)$ tells real from fake; they are trained as a minimax game until $D$ cannot tell the difference.
- **Transformer:** stacks of **self-attention + feed-forward** layers with residual connections; processes all tokens in parallel; used autoregressively (GPT) or as a masked encoder (BERT).
- **Diffusion:** a fixed **forward** process gradually adds Gaussian noise; a network learns the **reverse** denoising; sampling starts from pure noise.` },
      { h: 'Comparison table', body: String.raw`| | VAE | GAN | Transformer (LLM) | Diffusion |
|---|---|---|---|---|
| Training signal | ELBO (likelihood bound) | adversarial loss | next-token cross-entropy | noise-prediction MSE |
| Sampling | 1 decoder pass | 1 generator pass | token by token | 20-1000 denoising steps |
| Likelihood | lower bound | none (implicit) | exact | bound / ODE-based |
| Latent space | explicit, smooth | implicit | none (tokens) | noise trajectory |
| Weakness | blurry | unstable, mode collapse | slow decoding, hallucination | slow sampling |
| Example | beta-VAE | StyleGAN | GPT, LLaMA | Stable Diffusion |` },
      { h: 'Other families (one line each)', body: String.raw`- **Autoregressive models** factorise $p(x)=\prod_t p(x_t\mid x_{<t})$ (PixelCNN, GPT).
- **Normalizing flows** use invertible maps with exact likelihood (RealNVP, Glow).
- **Energy-based / score-based models** learn $\nabla_x\log p(x)$; diffusion is closely linked.` },
    ],
    formulas: [String.raw`\text{ELBO}=\mathbb E_{q(z|x)}[\log p(x|z)]-D_{KL}(q(z|x)\,\|\,p(z))`, String.raw`\min_G\max_D V=\mathbb E_{x\sim p_{data}}[\log D(x)]+\mathbb E_{z\sim p_z}[\log(1-D(G(z)))]`, String.raw`\text{Attention}(Q,K,V)=\text{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)V`],
    tpls: [{
      q: 'A VAE for {n}-dimensional inputs has one encoder hidden layer of {h} units, a {z}-dimensional latent space (two separate linear heads for μ and log σ²) and a mirrored decoder (z → {h} → {n}). Count all trainable parameters (weights + biases).',
      vars: [{ s: 'n', label: 'input dim', v: 784, min: 784, max: 1024, step: 240 }, { s: 'h', label: 'hidden units', v: 400, min: 200, max: 600, step: 100 }, { s: 'z', label: 'latent dim', v: 20, min: 8, max: 32, step: 4 }],
      derive: [{ s: 'e1', expr: 'n*h+h' }, { s: 'mu', expr: 'h*z+z' }, { s: 'd1', expr: 'z*h+h' }, { s: 'd2', expr: 'h*n+n' }],
      expr: 'e1+2*mu+d1+d2', dec: 0,
      steps: ['Encoder hidden: {n}·{h} + {h} = {e1}', 'μ head = logσ² head: {h}·{z} + {z} = {mu} each (×2)', 'Decoder hidden: {z}·{h} + {h} = {d1}', 'Decoder output: {h}·{n} + {n} = {d2}', 'Total = {e1} + 2·{mu} + {d1} + {d2} = {ans}'],
    }],
    gem: 'Parameter counting for a small VAE / GAN generator-discriminator / attention layer (weights plus biases). Vary layer sizes.',
    exam: [
      { m: 5, q: 'Compare VAE, GAN and Transformer-based generative models on training objective, sampling and weaknesses.', a: 'VAE maximises the ELBO, samples in one decoder pass, outputs tend to be blurry. GAN trains G and D adversarially, samples in one pass, sharp but unstable and prone to mode collapse. Transformers maximise next-token likelihood (or masked-token), generate autoregressively (slow, sequential), can hallucinate but scale very well. Diffusion adds a 4th: noise-prediction MSE, many-step sampling, best quality/diversity.' },
      { m: 5, q: 'Draw and explain the block diagram of a VAE.', a: 'x -> Encoder q_phi(z|x) -> (mu, log sigma^2) -> reparameterised sample z = mu + sigma*eps, eps~N(0,I) -> Decoder p_theta(x|z) -> x_hat. Loss = reconstruction term + KL(q(z|x)||N(0,I)). At generation time discard the encoder, sample z~N(0,I) and decode.' },
      { m: 10, q: 'Explain the working of a GAN with its loss function, and list two advantages and two disadvantages.', a: 'G maps z~p_z to fake samples; D outputs probability a sample is real. min_G max_D E[log D(x)] + E[log(1-D(G(z)))]. Alternately update D (ascend) and G (descend/non-saturating). Equilibrium: p_g = p_data, D=1/2. Pros: sharp samples, one-pass sampling, no explicit likelihood needed. Cons: training instability, mode collapse, vanishing gradients, hard to evaluate.' },
    ],
    tips: ['A neat comparison table scores full marks in "compare" questions.', 'Know the one-line loss of each family.'],
  },
  {
    room: 1, tag: 'Module 1 · 1.1 Probability Distributions', title: 'Gaussian & Multimodal Distributions',
    chalk: ['N(x;μ,σ²) = 1/(σ√2π) · exp(−(x−μ)² / 2σ²)', 'GMM : p(x) = Σₖ πₖ N(x; μₖ, σₖ²) ,  Σπₖ = 1', 'Bernoulli / Categorical → binary & token data'],
    summary: 'Generative models are parametrised probability distributions: Gaussians for continuous latent variables, mixtures for multimodal data, categorical for tokens.',
    notes: [
      { h: 'Gaussian (Normal) distribution', body: String.raw`$$\mathcal N(x;\mu,\sigma^2)=\frac{1}{\sigma\sqrt{2\pi}}\exp\!\Big(-\frac{(x-\mu)^2}{2\sigma^2}\Big)$$
- Mean $\mu$, variance $\sigma^2$; 68-95-99.7 rule (±1, 2, 3 σ).
- **Multivariate:** $\mathcal N(x;\mu,\Sigma)$ with covariance $\Sigma$; **diagonal** $\Sigma$ is used in VAEs (independent latent dims).
- **Why Gaussians?** closed-form KL, easy reparameterisation $z=\mu+\sigma\epsilon$, max-entropy for given mean and variance, central limit theorem, standard prior $p(z)=\mathcal N(0,I)$.
- Differential entropy: $H=\tfrac12\ln(2\pi e\sigma^2)$.` },
      { h: 'Multimodal data and Gaussian Mixture Models', body: String.raw`Real data (e.g., handwritten digits, face attributes) has **several modes**; a single Gaussian puts mass between them.

$$p(x)=\sum_{k=1}^{K}\pi_k\,\mathcal N(x;\mu_k,\sigma_k^2),\qquad \pi_k\ge0,\ \sum_k\pi_k=1$$
- Introduce a latent component label $z\in\{1..K\}$: $p(z=k)=\pi_k$, $p(x\mid z=k)=\mathcal N(\mu_k,\sigma_k^2)$ - the simplest **latent-variable generative model**.
- Fitted by **EM**: E-step responsibilities $r_{ik}=\frac{\pi_k\mathcal N(x_i;\mu_k,\sigma_k)}{\sum_j\pi_j\mathcal N(x_i;\mu_j,\sigma_j)}$; M-step re-estimates $\pi,\mu,\sigma$.
- A GAN/VAE/diffusion model is effectively a **very flexible multimodal distribution** produced by a neural network.` },
      { h: 'Discrete distributions', body: String.raw`- **Bernoulli** (binary pixels), **Categorical/Multinomial** (next-token probabilities from a softmax), **Poisson** (counts).
- Language models output a categorical distribution over the vocabulary: $p(w_t\mid w_{<t})=\text{softmax}(\text{logits})$.
- Maximum likelihood = minimise cross-entropy; for a Gaussian with fixed variance MLE = minimise **MSE**.` },
    ],
    formulas: [String.raw`\mathcal N(x;\mu,\sigma^2)=\frac{1}{\sigma\sqrt{2\pi}}e^{-\frac{(x-\mu)^2}{2\sigma^2}}`, String.raw`p(x)=\sum_k\pi_k\mathcal N(x;\mu_k,\sigma_k^2)`, String.raw`H(\mathcal N)=\tfrac12\ln(2\pi e\sigma^2)`],
    tpls: [{
      q: 'A two-component Gaussian mixture has weight π₁ = {p1} (so π₂ = 1 − π₁), means μ₁ = {m1}, μ₂ = {m2} and standard deviations σ₁ = {s1}, σ₂ = {s2}. Compute the mixture density p(x) at x = {x}.',
      vars: [{ s: 'p1', label: 'π₁', v: 0.4, min: 0.2, max: 0.8, step: 0.1 }, { s: 'm1', label: 'μ₁', v: 0, min: -2, max: 2, step: 1 }, { s: 'm2', label: 'μ₂', v: 4, min: 3, max: 6, step: 1 }, { s: 's1', label: 'σ₁', v: 1, min: 0.5, max: 2, step: 0.5 }, { s: 's2', label: 'σ₂', v: 1.5, min: 0.5, max: 2, step: 0.5 }, { s: 'x', label: 'x', v: 1, min: -1, max: 3, step: 1 }],
      derive: [{ s: 'n1', expr: 'exp(-0.5*((x-m1)/s1)^2)/(s1*sqrt(2*PI))' }, { s: 'n2', expr: 'exp(-0.5*((x-m2)/s2)^2)/(s2*sqrt(2*PI))' }],
      expr: 'p1*n1+(1-p1)*n2', dec: 4,
      steps: ['N(x; μ₁, σ₁²) = exp(−½((x−μ₁)/σ₁)²) / (σ₁√2π) = {n1}', 'N(x; μ₂, σ₂²) = exp(−½((x−μ₂)/σ₂)²) / (σ₂√2π) = {n2}', 'p(x) = π₁·{n1} + (1 − π₁)·{n2} = {ans}'],
    }],
    gem: 'Evaluate a univariate Gaussian pdf, a two-component Gaussian mixture density, or a z-score probability. Use numbers that keep exponentials moderate.',
    exam: [
      { m: 5, q: 'Why are Gaussian distributions widely used in generative models such as VAEs?', a: 'Closed-form KL divergence between Gaussians, simple reparameterisation z = mu + sigma*eps, maximum entropy for fixed mean/variance, central limit theorem justification, and a convenient standard-normal prior N(0, I) that is easy to sample from.' },
      { m: 5, q: 'What is a Gaussian mixture model? Why is it better than a single Gaussian for multimodal data? How is it trained?', a: 'p(x)=sum pi_k N(x; mu_k, Sigma_k) with sum pi_k = 1; latent component z picks a Gaussian. A single Gaussian cannot represent several separated modes. Trained by maximum likelihood using EM: E-step computes responsibilities, M-step updates pi, mu, Sigma until the log-likelihood converges.' },
      { m: 5, q: 'Compute N(x=1; mu=0, sigma=1).', a: 'p = (1/sqrt(2*pi)) * exp(-0.5) = 0.3989 * 0.6065 = 0.2420.' },
    ],
    tips: ['Write the full pdf formula first; marks are given for it.', 'Mixture weights must sum to 1 - check this in numericals.'],
  },
  {
    room: 1, tag: 'Module 1 · 1.1 Latent Space & Sampling', title: 'Latent Space & Sampling Techniques',
    chalk: ['z ~ N(0, I)  →  x = G_θ(z)', 'z = μ + σ ⊙ ε ,  ε ~ N(0, I)', 'p_i = exp(l_i / T) / Σⱼ exp(l_j / T)'],
    summary: 'A latent space is a compact, continuous code of the data; sampling it (and sampling from model outputs with temperature, top-k, top-p) is how generative models create new content.',
    notes: [
      { h: 'Latent space representation', body: String.raw`- A **latent vector** $z\in\mathbb R^d$ ($d\ll$ data dimension) captures the factors of variation (pose, style, identity...). Data lie near a low-dimensional **manifold**.
- **Smoothness:** nearby $z$ decode to similar outputs, so we can **interpolate**: $z_\alpha=(1-\alpha)z_a+\alpha z_b$ (use **slerp** for Gaussian latents on a hypersphere shell).
- **Latent arithmetic:** e.g., $z_{\text{smiling woman}}-z_{\text{woman}}+z_{\text{man}}\approx z_{\text{smiling man}}$.
- Autoencoder latent = deterministic code (gaps, not good for sampling). **VAE** latent = regularised towards $\mathcal N(0,I)$ so *any* sample decodes sensibly. GAN latent = input noise $z$; StyleGAN adds an intermediate $w$-space which is more disentangled.` },
      { h: 'Sampling techniques', body: String.raw`1. **Ancestral sampling:** draw $z\sim p(z)$, then $x\sim p_\theta(x\mid z)$.
2. **Reparameterisation trick:** $z=\mu+\sigma\odot\epsilon$, $\epsilon\sim\mathcal N(0,I)$ - makes sampling differentiable w.r.t. $\mu,\sigma$.
3. **Truncation trick (GANs):** resample or shrink $z$ towards 0 (e.g., $|z|\le\psi$) - better quality, less diversity.
4. **Temperature sampling (LLMs):** $p_i=\dfrac{e^{l_i/T}}{\sum_j e^{l_j/T}}$. $T\to0$ = greedy (deterministic), $T=1$ = model distribution, $T>1$ = flatter and more random.
5. **Top-k:** keep the $k$ most likely tokens, renormalise. **Top-p (nucleus):** keep the smallest set whose cumulative probability $\ge p$.
6. **Greedy / beam search:** deterministic decoding; beam keeps the $B$ best partial sequences.
7. **MCMC / Langevin dynamics:** $x_{t+1}=x_t+\tfrac{\eta}{2}\nabla_x\log p(x)+\sqrt\eta\,\xi$ - used in score-based/diffusion samplers.` },
      { h: 'What to remember', body: String.raw`- Low temperature -> safe, repetitive; high temperature -> creative, error-prone.
- Top-p adapts the candidate set to the shape of the distribution; top-k uses a fixed size.
- Latent dimension too small -> blurry reconstructions; too large -> poor regularisation / posterior collapse in VAEs.` },
    ],
    formulas: [String.raw`z=\mu+\sigma\odot\epsilon,\ \epsilon\sim\mathcal N(0,I)`, String.raw`p_i=\frac{\exp(l_i/T)}{\sum_j\exp(l_j/T)}`, String.raw`z_\alpha=(1-\alpha)z_a+\alpha z_b`],
    tpls: [{
      q: 'A language model produces logits {l1}, {l2}, {l3} for three candidate tokens. Using temperature T = {T}, what is the probability of token 1 after the softmax?',
      vars: [{ s: 'l1', label: 'logit 1', v: 2, min: 1, max: 3, step: 0.5 }, { s: 'l2', label: 'logit 2', v: 1, min: 0, max: 2, step: 0.5 }, { s: 'l3', label: 'logit 3', v: 0.1, min: -1, max: 1, step: 0.1 }, { s: 'T', label: 'temperature', v: 0.5, min: 0.5, max: 2, step: 0.25 }],
      derive: [{ s: 'e1', expr: 'exp(l1/T)' }, { s: 'e2', expr: 'exp(l2/T)' }, { s: 'e3', expr: 'exp(l3/T)' }],
      expr: 'e1/(e1+e2+e3)', dec: 4,
      steps: ['Divide logits by T: {l1}/{T}, {l2}/{T}, {l3}/{T}', 'exp values: {e1}, {e2}, {e3}', 'Sum = {e1} + {e2} + {e3}', 'p₁ = {e1} / (sum) = {ans}'],
    }],
    gem: 'Temperature-scaled softmax probabilities, top-k / top-p truncation and renormalisation, or reparameterised sample z = mu + sigma*eps. Include specific logits or mu/sigma/eps values.',
    exam: [
      { m: 5, q: 'What is a latent space? Explain interpolation and latent arithmetic with an example.', a: 'A latent space is a low-dimensional continuous representation z of data in which semantically similar items are close. Interpolation z_alpha=(1-alpha)z_a+alpha z_b decodes to a smooth morph between two images; arithmetic (z_smiling woman - z_woman + z_man) approximates a smiling man, showing semantic directions are linear-ish.' },
      { m: 5, q: 'Explain temperature, top-k and top-p sampling in LLMs.', a: 'Temperature rescales logits before softmax: low T sharpens (near greedy), high T flattens (more random). Top-k keeps only the k highest-probability tokens; top-p keeps the smallest set with cumulative probability >= p, so the set size adapts; the kept probabilities are renormalised and a token is sampled.' },
      { m: 5, q: 'What is the reparameterisation trick and why is it needed?', a: 'Sampling z~N(mu,sigma^2) is not differentiable w.r.t. mu and sigma. Writing z = mu + sigma*eps with eps~N(0,1) moves randomness to eps, so gradients flow through mu and sigma to the encoder, enabling backpropagation in VAEs.' },
    ],
    tips: ['Temperature numericals: divide by T first, then softmax.', 'Always mention renormalisation after top-k/top-p truncation.'],
  },
];
