// Room 5 — Module 3.2: Diffusion Models & Image Generation
export default [
  {
    room: 5, tag: 'Module 3 · 3.2 DDPM', title: 'DDPM: The Forward (Noising) Process',
    chalk: ['q(x_t | x_{t−1}) = N(√(1−β_t)·x_{t−1} , β_t·I)', 'ᾱ_t = Π_{s≤t} (1 − β_s)', 'x_t = √ᾱ_t · x₀ + √(1−ᾱ_t) · ε ,  ε ~ N(0,I)'],
    summary: 'The forward process gradually destroys an image by adding small Gaussian noise over T steps; thanks to a closed form we can jump straight to any step t.',
    notes: [
      { h: 'Idea (Sohl-Dickstein 2015; Ho et al. 2020)', body: String.raw`A **fixed Markov chain** adds noise step by step until the data becomes pure Gaussian noise $x_T\approx\mathcal N(0,I)$. A neural network then learns to reverse it. Generation = start from noise and denoise.
$$q(x_t\mid x_{t-1})=\mathcal N\big(\sqrt{1-\beta_t}\,x_{t-1},\ \beta_t I\big)$$
- **Variance schedule** $\beta_1<\dots<\beta_T$ (DDPM: $T=1000$, linear $10^{-4}\to0.02$). **Cosine schedule** (Nichol & Dhariwal) keeps more signal at early steps.
- Define $\alpha_t=1-\beta_t$ and $\bar\alpha_t=\prod_{s=1}^t\alpha_s$ (cumulative product; decreases from ~1 to ~0).` },
      { h: 'Closed form (the key trick)', body: String.raw`Because sums of Gaussians are Gaussian, any step can be sampled directly from $x_0$:
$$q(x_t\mid x_0)=\mathcal N\big(\sqrt{\bar\alpha_t}\,x_0,\ (1-\bar\alpha_t)I\big)\ \Longleftrightarrow\ x_t=\sqrt{\bar\alpha_t}\,x_0+\sqrt{1-\bar\alpha_t}\,\epsilon,\ \ \epsilon\sim\mathcal N(0,I)$$
- This makes training cheap: no need to simulate $t$ steps; pick random $t$ and noise the image in one shot.
- As $t\to T$: $\bar\alpha_t\to0$, $x_t\to\mathcal N(0,I)$ (signal gone). At $t=0$: $\bar\alpha=1$, $x_t=x_0$.
- **Signal-to-noise ratio** $SNR(t)=\dfrac{\bar\alpha_t}{1-\bar\alpha_t}$ decreases monotonically with $t$.` },
      { h: 'Derivation sketch (for a 5-mark derivation)', body: String.raw`$x_t=\sqrt{\alpha_t}x_{t-1}+\sqrt{1-\alpha_t}\epsilon_{t-1}$. Substitute $x_{t-1}=\sqrt{\alpha_{t-1}}x_{t-2}+\sqrt{1-\alpha_{t-1}}\epsilon_{t-2}$. The two independent noises merge into one Gaussian with variance $\alpha_t(1-\alpha_{t-1})+(1-\alpha_t)=1-\alpha_t\alpha_{t-1}$. Repeating gives $x_t=\sqrt{\bar\alpha_t}x_0+\sqrt{1-\bar\alpha_t}\,\epsilon$.` },
    ],
    formulas: [String.raw`q(x_t|x_{t-1})=\mathcal N(\sqrt{1-\beta_t}x_{t-1},\beta_tI)`, String.raw`x_t=\sqrt{\bar\alpha_t}x_0+\sqrt{1-\bar\alpha_t}\,\epsilon`, String.raw`\bar\alpha_t=\prod_{s=1}^{t}(1-\beta_s),\quad SNR(t)=\frac{\bar\alpha_t}{1-\bar\alpha_t}`],
    tpls: [{
      q: 'In a DDPM a pixel value x₀ = {x0} is noised to step t where ᾱ_t = {ab}. With noise sample ε = {eps}, compute x_t.',
      vars: [{ s: 'x0', label: 'x₀', v: 0.8, min: -1, max: 1, step: 0.2 }, { s: 'ab', label: 'ᾱ_t', v: 0.64, min: 0.04, max: 0.96, step: 0.04 }, { s: 'eps', label: 'ε', v: -0.5, min: -2, max: 2, step: 0.5 }],
      derive: [{ s: 'sa', expr: 'sqrt(ab)' }, { s: 'sn', expr: 'sqrt(1-ab)' }],
      expr: 'sa*x0+sn*eps', dec: 4,
      steps: ['√ᾱ_t = √{ab} = {sa}', '√(1 − ᾱ_t) = √(1 − {ab}) = {sn}', 'x_t = {sa}·{x0} + {sn}·({eps}) = {ans}'],
    }, {
      q: 'A constant noise schedule β = {b} is used. What is ᾱ_t after t = {t} steps?',
      vars: [{ s: 'b', label: 'β', v: 0.02, min: 0.01, max: 0.05, step: 0.01 }, { s: 't', label: 't', v: 10, min: 5, max: 50, step: 5 }],
      expr: '(1-b)^t', dec: 4,
      steps: ['α = 1 − β = 1 − {b}', 'ᾱ_t = α^t = (1 − {b})^{t} = {ans}'],
    }, {
      q: 'At some step ᾱ_t = {ab}. What is the signal-to-noise ratio SNR = ᾱ_t / (1 − ᾱ_t)?',
      vars: [{ s: 'ab', label: 'ᾱ_t', v: 0.64, min: 0.04, max: 0.96, step: 0.04 }],
      expr: 'ab/(1-ab)', dec: 4,
      steps: ['SNR = ᾱ_t / (1 − ᾱ_t) = {ab} / (1 − {ab}) = {ans}'],
    }],
    gem: 'Forward diffusion x_t = sqrt(abar)*x0 + sqrt(1-abar)*eps for scalar x0, abar from beta schedule products (e.g., alpha_t values multiplied), and SNR computation.',
    exam: [
      { m: 10, q: 'Explain the forward diffusion process in DDPM and derive the closed-form expression for q(x_t|x_0).', a: 'Forward chain q(x_t|x_{t-1})=N(sqrt(1-beta_t)x_{t-1}, beta_t I) with schedule beta_1..beta_T (linear 1e-4 to 0.02, T=1000). Let alpha_t=1-beta_t, abar_t=prod alpha_s. Unrolling x_t = sqrt(alpha_t) x_{t-1} + sqrt(1-alpha_t) e and merging independent Gaussian noises (variances add) gives x_t = sqrt(abar_t) x_0 + sqrt(1-abar_t) e, i.e., q(x_t|x_0)=N(sqrt(abar_t)x_0,(1-abar_t)I). As t->T, abar->0 and x_T ~ N(0,I). The closed form allows training at a random t without simulating the chain.' },
      { m: 5, q: 'Compute x_t if x0=1, abar_t=0.25, eps=2.', a: 'x_t = sqrt(0.25)*1 + sqrt(0.75)*2 = 0.5 + 1.732 = 2.232.' },
      { m: 5, q: 'What is the role of the noise schedule? Compare linear and cosine schedules.', a: 'The schedule sets how fast signal is destroyed. Linear (1e-4 to 0.02) destroys information too quickly at later steps (many wasted near-pure-noise steps for low-resolution images); cosine (Nichol & Dhariwal) makes abar_t decrease more gradually, improving log-likelihood and sample quality.' },
    ],
    tips: ['Write both forms: step-wise q(x_t|x_{t−1}) and one-shot q(x_t|x₀).', 'Check the numeric: √ᾱ and √(1−ᾱ) squares should sum to 1.'],
  },
  {
    room: 5, tag: 'Module 3 · 3.2 DDPM', title: 'Reverse Process, Training Loss & Sampling',
    chalk: ['p_θ(x_{t−1}|x_t) = N( μ_θ(x_t,t) , σ_t² I )', 'μ_θ = (1/√α_t)·( x_t − β_t/√(1−ᾱ_t) · ε_θ(x_t,t) )', 'L_simple = E_{t,x₀,ε} ‖ ε − ε_θ(x_t , t) ‖²'],
    summary: 'A U-Net ε_θ is trained to predict the noise that was added; sampling starts at pure noise and repeatedly removes the predicted noise for T steps.',
    notes: [
      { h: 'Reverse process', body: String.raw`The true reverse $q(x_{t-1}\mid x_t)$ is intractable, but conditioned on $x_0$ it is Gaussian: $q(x_{t-1}\mid x_t,x_0)=\mathcal N(\tilde\mu_t,\tilde\beta_tI)$ with
$$\tilde\mu_t=\frac{\sqrt{\bar\alpha_{t-1}}\beta_t}{1-\bar\alpha_t}x_0+\frac{\sqrt{\alpha_t}(1-\bar\alpha_{t-1})}{1-\bar\alpha_t}x_t,\qquad \tilde\beta_t=\frac{1-\bar\alpha_{t-1}}{1-\bar\alpha_t}\beta_t$$
We learn $p_\theta(x_{t-1}\mid x_t)=\mathcal N(\mu_\theta(x_t,t),\sigma_t^2I)$ with $\sigma_t^2=\beta_t$ or $\tilde\beta_t$. Using $x_0=(x_t-\sqrt{1-\bar\alpha_t}\epsilon)/\sqrt{\bar\alpha_t}$, **noise prediction** gives
$$\mu_\theta(x_t,t)=\frac{1}{\sqrt{\alpha_t}}\Big(x_t-\frac{\beta_t}{\sqrt{1-\bar\alpha_t}}\,\epsilon_\theta(x_t,t)\Big)$$` },
      { h: 'Training objective', body: String.raw`The variational bound reduces (Ho et al.) to a **simple MSE on the noise**:
$$L_{simple}=\mathbb E_{t\sim U\{1..T\},\,x_0,\,\epsilon\sim\mathcal N(0,I)}\Big[\big\|\epsilon-\epsilon_\theta\big(\sqrt{\bar\alpha_t}x_0+\sqrt{1-\bar\alpha_t}\epsilon,\ t\big)\big\|^2\Big]$$
**Training algorithm:** repeat { sample $x_0$ from data; $t\sim U\{1..T\}$; $\epsilon\sim\mathcal N(0,I)$; gradient step on $\|\epsilon-\epsilon_\theta(x_t,t)\|^2$ }.
Equivalent parameterisations: predict $x_0$, or **v-prediction**. Relation to score matching: $\nabla_{x_t}\log q(x_t)\approx-\epsilon_\theta/\sqrt{1-\bar\alpha_t}$.` },
      { h: 'Sampling (ancestral)', body: String.raw`1. $x_T\sim\mathcal N(0,I)$.
2. For $t=T,\dots,1$: $z\sim\mathcal N(0,I)$ if $t>1$ else $0$; $x_{t-1}=\mu_\theta(x_t,t)+\sigma_tz$.
3. Return $x_0$.
$T=1000$ network evaluations - slow (fixed by DDIM, DPM-Solver, distillation, latent diffusion).
**Network:** a **U-Net** (ResNet blocks, self-attention at low resolution, skip connections) with **sinusoidal time-step embedding** injected into every block; newer models use Transformers (DiT).` },
      { h: 'DDPM vs GAN vs VAE (quick)', body: String.raw`+ Stable, simple MSE loss, no adversarial game; high quality + diversity; flexible conditioning.
- Slow sampling (many steps); high compute for training and inference.` },
    ],
    formulas: [String.raw`\mu_\theta(x_t,t)=\frac{1}{\sqrt{\alpha_t}}\Big(x_t-\frac{\beta_t}{\sqrt{1-\bar\alpha_t}}\epsilon_\theta(x_t,t)\Big)`, String.raw`L_{simple}=\mathbb E\|\epsilon-\epsilon_\theta(x_t,t)\|^2`, String.raw`\tilde\beta_t=\frac{1-\bar\alpha_{t-1}}{1-\bar\alpha_t}\beta_t`],
    tpls: [{
      q: 'In a DDPM reverse step, β_t = {b}, ᾱ_t = {ab}, the current sample (one pixel) is x_t = {xt} and the network predicts ε_θ = {e}. Compute the mean μ_θ(x_t, t) of p(x_{t−1} | x_t).',
      vars: [{ s: 'b', label: 'β_t', v: 0.02, min: 0.01, max: 0.05, step: 0.01 }, { s: 'ab', label: 'ᾱ_t', v: 0.5, min: 0.1, max: 0.9, step: 0.1 }, { s: 'xt', label: 'x_t', v: 1.2, min: -2, max: 2, step: 0.2 }, { s: 'e', label: 'ε_θ', v: 0.4, min: -1, max: 1, step: 0.2 }],
      derive: [{ s: 'al', expr: '1-b' }, { s: 'c', expr: 'b/sqrt(1-ab)*e' }],
      expr: '(xt-c)/sqrt(al)', dec: 4,
      steps: ['α_t = 1 − β_t = {al}', 'β_t/√(1 − ᾱ_t) · ε_θ = {b}/√(1 − {ab}) · {e} = {c}', 'μ_θ = (x_t − {c}) / √α_t = ({xt} − {c}) / √{al} = {ans}'],
    }, {
      q: 'The true noise for a 2-pixel patch is ε = ({e1}, {e2}) and the network predicts ε_θ = ({p1}, {p2}). Compute the mean squared error loss (average over the 2 pixels).',
      vars: [{ s: 'e1', label: 'ε₁', v: 0.5, min: -1.5, max: 1.5, step: 0.5 }, { s: 'e2', label: 'ε₂', v: -1, min: -1.5, max: 1.5, step: 0.5 }, { s: 'p1', label: 'ε_θ1', v: 0.3, min: -1.5, max: 1.5, step: 0.1 }, { s: 'p2', label: 'ε_θ2', v: -0.6, min: -1.5, max: 1.5, step: 0.1 }],
      expr: '((e1-p1)^2+(e2-p2)^2)/2', dec: 4,
      steps: ['(ε₁ − ε_θ1)² = ({e1} − {p1})²', '(ε₂ − ε_θ2)² = ({e2} − {p2})²', 'MSE = [sum of the two] / 2 = {ans}'],
    }],
    gem: 'DDPM reverse-step mean mu_theta from beta_t, abar_t, x_t, eps_theta; the posterior variance beta_tilde; or the MSE noise-prediction loss for a tiny vector.',
    exam: [
      { m: 10, q: 'Explain training and sampling in DDPM. State the loss and why noise prediction is used.', a: 'Training: sample x0, t~U{1..T}, eps~N(0,I); form x_t=sqrt(abar_t)x0+sqrt(1-abar_t)eps; minimise ||eps - eps_theta(x_t,t)||^2 using a U-Net with time embeddings. Sampling: x_T~N(0,I); for t=T..1: x_{t-1} = (1/sqrt(alpha_t))(x_t - beta_t/sqrt(1-abar_t) eps_theta) + sigma_t z, z~N(0,I) except at t=1. Noise prediction gives a simple, stable, well-scaled regression target and equals a reweighted variational bound / denoising score matching.' },
      { m: 5, q: 'Compare DDPM with GANs and VAEs.', a: 'DDPM: stable MSE training, high fidelity and diversity, covers modes, flexible conditioning; but slow iterative sampling (hundreds-1000 steps). GAN: one-step sampling but unstable and mode-collapse-prone. VAE: stable, fast, latent space, but blurrier samples.' },
      { m: 5, q: 'What architecture is used for eps_theta and how is the time step provided?', a: 'A U-Net with ResNet blocks, self-attention at lower resolutions and skip connections; the timestep t is encoded with sinusoidal embeddings passed through an MLP and added/scale-shifted into every residual block (DiT replaces the U-Net with a Transformer).' },
    ],
    tips: ['Write alpha_t = 1−β_t and ᾱ_t = Πα_s before using them.', 'Do the μ_θ numerical in 3 lines: α, correction term, final division.'],
  },
  {
    room: 5, tag: 'Module 3 · 3.2 Stable Diffusion', title: 'Stable Diffusion: Latent Diffusion + CLIP + CFG',
    chalk: ['512×512×3  --VAE(f=8)-->  64×64×4 latent', 'Cross-attention in U-Net ← CLIP text embeddings (77×768)', 'CFG : ε̃ = ε(∅) + w·( ε(c) − ε(∅) )'],
    summary: 'Stable Diffusion runs diffusion in the compressed latent space of a VAE, conditioned on text through cross-attention, and uses classifier-free guidance to follow the prompt.',
    notes: [
      { h: 'Latent Diffusion Model (Rombach et al., CVPR 2022)', body: String.raw`Diffusion in pixel space is expensive. LDM compresses first with a perceptual **autoencoder (VAE)**: $512\times512\times3$ image -> latent $z$ of $64\times64\times4$ (downsampling factor $f=8$; **48x fewer values**). Diffusion happens on $z$; the VAE decoder returns to pixels.
**Components:**
- **VAE** encoder/decoder (~84M params).
- **U-Net denoiser** (~860M params) with ResNet + self-attention + **cross-attention** layers.
- **Text encoder:** frozen **CLIP ViT-L/14** (SD 1.x), producing $77\times768$ token embeddings (SD 2.x uses OpenCLIP ViT-H; SDXL uses two text encoders and a larger U-Net).` },
      { h: 'Training and inference pipeline', body: String.raw`**Training:** $z_0=\mathcal E(x)$; add noise to $z_t$; minimise $\mathbb E\|\epsilon-\epsilon_\theta(z_t,t,\tau_\phi(y))\|^2$ where $\tau$ encodes the prompt $y$ (condition injected by cross-attention: $Q$ from image features, $K,V$ from text). Trained on LAION subsets.
**Inference (text-to-image):** prompt -> CLIP embeddings -> random latent $z_T\sim\mathcal N(0,I)$ -> $S$ denoising steps (20-50 with DDIM / PNDM / Euler / DPM-Solver++) -> VAE decoder -> image.
**Img2img:** encode an image, add noise to an intermediate step ("strength"), denoise with a new prompt. **Inpainting, ControlNet** (spatial control), **LoRA/DreamBooth/Textual Inversion** (personalisation).` },
      { h: 'Classifier-free guidance (CFG)', body: String.raw`Train one network with the prompt randomly dropped (~10%) so it learns both conditional $\epsilon_\theta(z_t,c)$ and unconditional $\epsilon_\theta(z_t,\varnothing)$. At sampling:
$$\tilde\epsilon=\epsilon_\theta(z_t,\varnothing)+w\big(\epsilon_\theta(z_t,c)-\epsilon_\theta(z_t,\varnothing)\big)$$
Guidance scale $w$ (typically 7-8): larger = more prompt adherence but less diversity/saturated artefacts; $w=1$ = plain conditional model. **Negative prompts** replace $\varnothing$ by the negative text.` },
      { h: 'Why it matters', body: String.raw`Open weights, runs on consumer GPUs (~4-8 GB VRAM) because of latent compression. Compared with pixel-space diffusion (DALL-E 2, Imagen): far cheaper. Safety: safety checker, watermarking, dataset/copyright debates.` },
    ],
    formulas: [String.raw`z=\mathcal E(x)\in\mathbb R^{\frac Hf\times\frac Wf\times c}`, String.raw`L_{LDM}=\mathbb E\|\epsilon-\epsilon_\theta(z_t,t,\tau_\phi(y))\|^2`, String.raw`\tilde\epsilon=\epsilon_u+w(\epsilon_c-\epsilon_u)`],
    tpls: [{
      q: 'A {S}×{S}×3 RGB image is compressed by a VAE with downsampling factor f = {f} into a latent with {c} channels. How many times fewer values does the latent have than the pixel image?',
      vars: [{ s: 'S', label: 'image side', v: 512, min: 256, max: 1024, step: 256 }, { s: 'f', label: 'factor f', v: 8, min: 4, max: 8, step: 4 }, { s: 'c', label: 'latent channels', v: 4, min: 4, max: 16, step: 4 }],
      derive: [{ s: 'px', expr: 'S*S*3' }, { s: 'ls', expr: '(S/f)*(S/f)*c' }],
      expr: 'px/ls', dec: 2, unit: '×',
      steps: ['Pixel values = {S}·{S}·3 = {px}', 'Latent values = ({S}/{f})·({S}/{f})·{c} = {ls}', 'Ratio = {px} / {ls} = {ans}'],
    }, {
      q: 'In classifier-free guidance the unconditional noise prediction is ε_u = {eu} and the conditional prediction is ε_c = {ec}. With guidance scale w = {w}, compute the guided prediction ε̃.',
      vars: [{ s: 'eu', label: 'ε_u', v: 0.1, min: -0.5, max: 0.5, step: 0.1 }, { s: 'ec', label: 'ε_c', v: 0.3, min: -0.5, max: 0.8, step: 0.1 }, { s: 'w', label: 'w', v: 7.5, min: 3, max: 12, step: 0.5 }],
      expr: 'eu+w*(ec-eu)', dec: 4,
      steps: ['Direction = ε_c − ε_u = {ec} − {eu}', 'ε̃ = ε_u + w·(ε_c − ε_u) = {eu} + {w}·({ec} − {eu}) = {ans}'],
    }],
    gem: 'Latent compression ratio for image size and VAE factor, or classifier-free guidance combination for scalar noise predictions with a given guidance scale.',
    exam: [
      { m: 10, q: 'Explain the architecture of Stable Diffusion and how a text prompt is converted to an image.', a: 'Three parts: CLIP text encoder (frozen) giving 77x768 embeddings; U-Net denoiser with cross-attention working in latent space; VAE decoder. Inference: tokenise prompt -> CLIP embeddings -> sample random latent 4x64x64 -> iterative denoising for S steps using a scheduler (DDIM/Euler/DPM++), each step using cross-attention to text and classifier-free guidance eps = eps_u + w(eps_c - eps_u) -> VAE decoder upsamples 64x64x4 latent to 512x512x3 image.' },
      { m: 5, q: 'Why does Stable Diffusion work in latent space? Quantify for a 512x512 image.', a: 'Pixel-space diffusion costs scale with number of pixels. The VAE (f=8) maps 512x512x3 = 786,432 values to 64x64x4 = 16,384 values (48x fewer), cutting compute and memory greatly while preserving perceptual detail, enabling training/inference on consumer GPUs.' },
      { m: 5, q: 'What is classifier-free guidance and what does the guidance scale do?', a: 'Combine unconditional and conditional noise predictions: eps~ = eps_u + w(eps_c - eps_u). It strengthens text conditioning without a separate classifier; larger w (7-8 typical) gives higher prompt fidelity but lower diversity and possible over-saturation; w=1 is ordinary conditional sampling.' },
    ],
    tips: ['Quote the numbers: f = 8, 64×64×4, 77×768, 860M U-Net.', 'CFG needs two U-Net passes per step (cond + uncond).'],
  },
  {
    room: 5, tag: 'Module 3 · 3.2 Midjourney & Fast Sampling', title: 'Midjourney, DDIM & Image-Generation Landscape',
    chalk: ['DDIM (σ=0): x_{t−1} = √ᾱ_{t−1}·x̂₀ + √(1−ᾱ_{t−1})·ε_θ', 'x̂₀ = ( x_t − √(1−ᾱ_t)·ε_θ ) / √ᾱ_t', 'Speed-up = T / S  (1000 → 50 steps = 20×)'],
    summary: 'Midjourney is a proprietary diffusion-based text-to-image service (architecture undisclosed); DDIM and related samplers make diffusion fast. Know how the major systems differ.',
    notes: [
      { h: 'Midjourney (what you can safely state)', body: String.raw`- **Proprietary** text-to-image service by Midjourney, Inc. (founder David Holz); open beta **July 2022**, used mainly through **Discord** (later a web app); numbered model versions (v1 ... v6, v7).
- The **exact architecture and training data are not publicly disclosed**; it is generally understood to be diffusion-based. Don't claim more in an exam - say "believed to be diffusion-based".
- Strengths: highly stylised, aesthetic, "artistic" outputs; prompt **parameters**: {{--ar}} (aspect ratio), {{--stylize}}/{{--s}}, {{--chaos}}, {{--seed}}, {{--no}} (negative), {{--v}} (version); **upscale (U) and variation (V)** buttons, image prompts, {{/blend}}, {{/describe}}, style and character references.
- Limitations: closed source and paid, little fine-grained control compared with ControlNet/open pipelines, copyright and data-provenance controversies.` },
      { h: 'Landscape comparison', body: String.raw`| System | Org | Notes |
|---|---|---|
| DALL-E 2 / 3 | OpenAI | DALL-E 2: CLIP prior + diffusion decoder (unCLIP); DALL-E 3 integrated with ChatGPT for prompt rewriting |
| Imagen | Google | frozen T5-XXL text encoder + cascaded pixel diffusion |
| Stable Diffusion | Stability AI et al. | open weights, latent diffusion, huge ecosystem |
| Midjourney | Midjourney Inc. | proprietary, aesthetic style |
| Firefly | Adobe | trained on licensed content |` },
      { h: 'DDIM and fast samplers (Song et al., 2020)', body: String.raw`DDPM sampling is stochastic and needs ~1000 steps. **DDIM** uses the same trained $\epsilon_\theta$ but a **non-Markovian** reverse process: first predict $\hat x_0=\dfrac{x_t-\sqrt{1-\bar\alpha_t}\,\epsilon_\theta}{\sqrt{\bar\alpha_t}}$, then
$$x_{t-1}=\sqrt{\bar\alpha_{t-1}}\,\hat x_0+\sqrt{1-\bar\alpha_{t-1}-\sigma_t^2}\;\epsilon_\theta+\sigma_t z$$
- $\sigma_t=0$: **deterministic** (same noise -> same image; enables interpolation and inversion); can **skip steps** (use a subsequence, e.g., 50 of 1000 => **20x faster**) with small quality loss.
- Others: **DPM-Solver / DPM++**, Euler/Heun (ODE solvers), **consistency models** and **distillation** (1-4 steps), **latent** diffusion, **flow matching / rectified flow** (SD3).
- Score/SDE view (Song & Ermon): forward = SDE, reverse = SDE or the deterministic **probability-flow ODE**; $\epsilon_\theta\leftrightarrow$ score $\nabla\log p_t(x)=-\epsilon_\theta/\sqrt{1-\bar\alpha_t}$.` },
      { h: 'Typical image tasks', body: String.raw`Text-to-image, img2img, **inpainting/outpainting**, super-resolution, style transfer, image editing (InstructPix2Pix), controllable generation (ControlNet - edges, pose, depth).` },
    ],
    formulas: [String.raw`\hat x_0=\frac{x_t-\sqrt{1-\bar\alpha_t}\,\epsilon_\theta}{\sqrt{\bar\alpha_t}}`, String.raw`x_{t-1}=\sqrt{\bar\alpha_{t-1}}\hat x_0+\sqrt{1-\bar\alpha_{t-1}}\,\epsilon_\theta\ \ (\sigma_t=0)`, String.raw`\text{speed-up}=T/S`],
    tpls: [{
      q: 'A deterministic DDIM step (σ = 0) uses ᾱ_t = {ab}, ᾱ_(t−1) = {abp}, the current value x_t = {xt} and predicted noise ε_θ = {e}. Compute x_(t−1).',
      vars: [{ s: 'ab', label: 'ᾱ_t', v: 0.25, min: 0.1, max: 0.4, step: 0.05 }, { s: 'abp', label: 'ᾱ_(t−1)', v: 0.5, min: 0.5, max: 0.9, step: 0.1 }, { s: 'xt', label: 'x_t', v: 1, min: -2, max: 2, step: 0.5 }, { s: 'e', label: 'ε_θ', v: 0.6, min: -1, max: 1, step: 0.2 }],
      derive: [{ s: 'x0h', expr: '(xt-sqrt(1-ab)*e)/sqrt(ab)' }],
      expr: 'sqrt(abp)*x0h+sqrt(1-abp)*e', dec: 4,
      steps: ['Predicted clean value x̂₀ = (x_t − √(1−ᾱ_t)·ε_θ)/√ᾱ_t = {x0h}', 'x_(t−1) = √ᾱ_(t−1)·x̂₀ + √(1−ᾱ_(t−1))·ε_θ', '= √{abp}·{x0h} + √(1−{abp})·{e} = {ans}'],
    }, {
      q: 'A DDPM trained with T = {T} steps is sampled with DDIM using only S = {S} steps. By what factor is sampling faster (network evaluations)?',
      vars: [{ s: 'T', label: 'T', v: 1000, min: 1000, max: 1000, step: 1 }, { s: 'S', label: 'S', v: 50, min: 20, max: 100, step: 10 }],
      expr: 'T/S', dec: 2, unit: '×',
      steps: ['Speed-up = T / S = {T} / {S} = {ans}'],
    }],
    gem: 'One deterministic DDIM update step with given abar_t, abar_{t-1}, x_t, eps_theta; or speed-up of S-step DDIM over T-step DDPM; or conversion between eps and score.',
    exam: [
      { m: 5, q: 'What do you know about Midjourney? How does it differ from Stable Diffusion?', a: 'Midjourney is a proprietary text-to-image service (open beta July 2022, via Discord/web) with versioned models; its architecture is not public but believed diffusion-based; known for stylised aesthetic output and prompt parameters (--ar, --stylize, --chaos, --seed). Stable Diffusion is open-weights latent diffusion (VAE + U-Net + CLIP) that users can run locally, fine-tune (LoRA, DreamBooth) and control (ControlNet); Midjourney trades control/openness for ease of use and default aesthetics.' },
      { m: 10, q: 'Explain how DDIM accelerates diffusion sampling and give its update equation.', a: 'DDIM defines a non-Markovian generative process with the same marginals as DDPM so the trained eps_theta can be reused. Predict x0_hat=(x_t - sqrt(1-abar_t) eps_theta)/sqrt(abar_t); then x_{t-1}=sqrt(abar_{t-1}) x0_hat + sqrt(1-abar_{t-1}-sigma^2) eps_theta + sigma z. With sigma=0 the process is deterministic, enabling skipping to a subsequence of steps (e.g., 50 of 1000 = 20x speed-up) and consistent latent-to-image mapping. Further acceleration: DPM-Solver, distillation, consistency models, latent diffusion.' },
      { m: 5, q: 'Compare DALL-E 2, Imagen and Stable Diffusion in one table.', a: 'DALL-E 2: CLIP image embedding prior + diffusion decoder (unCLIP), closed. Imagen: frozen T5-XXL text encoder + cascaded pixel-space diffusion (64->256->1024), closed. Stable Diffusion: CLIP-conditioned latent diffusion with VAE, open-source and cheap to run.' },
    ],
    tips: ['Never invent Midjourney internals; write "undisclosed, believed diffusion-based".', 'DDIM numerical: first x̂₀, then the update - two steps.'],
  },
];
