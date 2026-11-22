// Room 3 — Module 2.2: Generative Adversarial Networks
export default [
  {
    room: 3, tag: 'Module 2 · 2.2 GAN', title: 'GAN Architecture: Generator vs Discriminator',
    chalk: ['min_G max_D  E[log D(x)] + E[log(1 − D(G(z)))]', 'Optimal D*(x) = p_data(x) / (p_data(x) + p_g(x))', 'Equilibrium: p_g = p_data , D* = ½ , V = −log 4'],
    summary: 'Two networks play a minimax game: the generator forges samples from noise, the discriminator tells real from fake. At the optimum the generator matches the data and D outputs 1/2.',
    notes: [
      { h: 'Architecture', body: String.raw`- **Generator $G_\theta(z)$:** maps noise $z\sim p_z$ (Gaussian/uniform, e.g., 100-D) to a fake sample $G(z)$. Never sees real data directly - learns only through $D$'s gradient.
- **Discriminator $D_\phi(x)$:** classifier outputting $P(\text{real}\mid x)\in(0,1)$ (sigmoid).
- Analogy: counterfeiter (G) vs police (D).
- **Training loop (per iteration):** (1) sample real batch and fake batch; (2) update $D$ to separate them ($k$ steps); (3) update $G$ to fool $D$; repeat.` },
      { h: 'Minimax objective (Goodfellow et al., 2014)', body: String.raw`$$\min_G\max_D V(D,G)=\mathbb E_{x\sim p_{data}}[\log D(x)]+\mathbb E_{z\sim p_z}[\log(1-D(G(z)))]$$
- **D's loss** (maximise $V$) = binary cross-entropy: $L_D=-\big[\log D(x)+\log(1-D(G(z)))\big]$.
- **G's loss:** original $\min\log(1-D(G(z)))$; in practice **non-saturating** $\max\log D(G(z))$.` },
      { h: 'Theory (frequently asked proofs)', body: String.raw`For fixed $G$ the optimal discriminator is
$$D^*_G(x)=\frac{p_{data}(x)}{p_{data}(x)+p_g(x)}$$
Substituting gives $C(G)=-\log4+2\,JSD(p_{data}\|p_g)$, so the global minimum is reached iff $p_g=p_{data}$, where $D^*=\tfrac12$ and $V=-\log4$ ($\approx-1.386$).
Training the generator against an optimal $D$ therefore minimises the **Jensen-Shannon divergence**.` },
      { h: 'Why GANs matter', body: String.raw`+ Sharp, realistic samples; single forward pass to generate; no explicit likelihood needed (implicit model).
- Hard to train, no density estimate, hard to evaluate (use IS/FID), mode collapse.` },
    ],
    formulas: [String.raw`\min_G\max_D\ \mathbb E_{x}[\log D(x)]+\mathbb E_z[\log(1-D(G(z)))]`, String.raw`D^*(x)=\frac{p_{data}(x)}{p_{data}(x)+p_g(x)}`, String.raw`C(G)=-\log 4+2\,JSD(p_{data}\|p_g)`],
    tpls: [{
      q: 'At a point x the data density is p_data(x) = {pd} and the generator density is p_g(x) = {pg}. What is the optimal discriminator output D*(x)?',
      vars: [{ s: 'pd', label: 'p_data(x)', v: 0.6, min: 0.2, max: 0.9, step: 0.1 }, { s: 'pg', label: 'p_g(x)', v: 0.2, min: 0.1, max: 0.5, step: 0.1 }],
      expr: 'pd/(pd+pg)', dec: 4,
      steps: ['D*(x) = p_data(x) / (p_data(x) + p_g(x))', 'D*(x) = {pd} / ({pd} + {pg}) = {ans}', 'If p_g = p_data this becomes ½.'],
    }, {
      q: 'For one real sample the discriminator outputs D(x) = {a} and for one generated sample D(G(z)) = {b}. Compute the discriminator loss L_D = −[ln D(x) + ln(1 − D(G(z)))].',
      vars: [{ s: 'a', label: 'D(x)', v: 0.9, min: 0.5, max: 0.95, step: 0.05 }, { s: 'b', label: 'D(G(z))', v: 0.2, min: 0.05, max: 0.5, step: 0.05 }],
      derive: [{ s: 't1', expr: '-ln(a)' }, { s: 't2', expr: '-ln(1-b)' }],
      expr: 't1+t2', dec: 4, unit: 'nats',
      steps: ['−ln D(x) = −ln({a}) = {t1}', '−ln(1 − D(G(z))) = −ln(1 − {b}) = {t2}', 'L_D = {t1} + {t2} = {ans}'],
    }],
    gem: 'Optimal discriminator D*(x)=p_data/(p_data+p_g), discriminator/generator BCE loss for given D outputs, or value V(D,G) at equilibrium (-log 4).',
    exam: [
      { m: 10, q: 'Explain the architecture and training of a GAN with the minimax objective. Show that the optimal discriminator is p_data/(p_data+p_g).', a: 'G maps z to fakes, D classifies real vs fake. V = E[log D(x)] + E[log(1-D(G(z)))]. Alternate D (ascent) and G steps. For fixed G, V = integral [p_data log D + p_g log(1-D)] dx; the integrand a log y + b log(1-y) is maximised at y=a/(a+b), so D*=p_data/(p_data+p_g). Plugging in gives C(G) = -log4 + 2 JSD(p_data||p_g), minimised when p_g=p_data (D*=1/2).' },
      { m: 5, q: 'Why is the non-saturating generator loss used instead of min log(1-D(G(z)))?', a: 'Early in training D(G(z)) is near 0, so log(1-D(G(z))) is flat and its gradient vanishes (saturates). Maximising log D(G(z)) gives strong gradients when G is poor while keeping the same fixed point.' },
      { m: 5, q: 'State the value of V and D at the global optimum.', a: 'p_g=p_data, D*(x)=1/2 everywhere, V = log(1/2)+log(1/2) = -log 4 = -1.386.' },
    ],
    tips: ['Write D* derivation as a one-line calculus step: maximise a·log y + b·log(1−y).', 'Mention JSD and −log 4 for full marks.'],
  },
  {
    room: 3, tag: 'Module 2 · 2.2 GAN', title: 'Training Challenges: Mode Collapse & Vanishing Gradients',
    chalk: ['Saturating: ∂/∂a log(1−σ(a)) = −σ(a) = −D(G(z)) → 0', 'Non-saturating: ∂/∂a [−log σ(a)] = −(1−D(G(z)))', 'Mode collapse: G outputs few distinct samples'],
    summary: 'GANs fail in characteristic ways: mode collapse (low diversity), vanishing gradients (D too strong), oscillation, and hard evaluation. Known fixes exist for each.',
    notes: [
      { h: 'Mode collapse', body: String.raw`**What:** $G$ maps many different $z$ to the same few outputs (e.g., generates only digit "1"). *Complete* collapse = one output; *partial* = few modes.
**Why:** $G$ is optimised against the *current* $D$; it can jump to the single point $D$ currently rates "most real"; $D$ then moves, $G$ hops to another mode - cycling without covering the distribution.
**Detect:** low diversity in samples, low Inception Score, high FID, few modes in a mixture-of-Gaussians toy test.
**Fixes:** minibatch discrimination / minibatch-stddev (ProGAN), feature matching, **unrolled GAN**, PacGAN, **Wasserstein loss**, multiple generators, spectral normalisation.` },
      { h: 'Vanishing gradients', body: String.raw`If $D$ becomes (near) perfect, $D(G(z))\to0$ and the original loss $\log(1-D(G(z)))$ has gradient $\to0$ - $G$ stops learning. Theory (Arjovsky & Bottou): real and fake data lie on low-dimensional manifolds with (almost) **disjoint supports**, so a perfect discriminator exists and JSD is constant ($\log2$), giving no useful gradient.
With $D=\sigma(a)$: saturating gradient magnitude $=D(G(z))$; non-saturating $=1-D(G(z))$. At $D(G(z))=0.02$ the non-saturating gradient is $49\times$ larger.
**Fixes:** non-saturating loss, **Wasserstein/WGAN-GP**, LSGAN, instance noise, don't over-train D, balanced learning rates (TTUR).` },
      { h: 'Other issues', body: String.raw`- **Non-convergence / oscillation:** simultaneous gradient descent on a minimax game can circle the equilibrium; fixes: TTUR, gradient penalties (R1), optimistic/extra-gradient, Adam with $\beta_1=0.5$.
- **Balance:** D too strong -> vanishing gradients; D too weak -> poor feedback.
- **Evaluation:** loss curves are not informative. Use **Inception Score** (quality + diversity) and **FID** (Fréchet distance between Gaussians fitted to Inception features; lower is better): $FID=\|\mu_r-\mu_g\|^2+\text{Tr}(\Sigma_r+\Sigma_g-2(\Sigma_r\Sigma_g)^{1/2})$.
- **Tricks:** label smoothing, spectral norm, batch/instance norm, LeakyReLU, avoid sparse gradients (no max-pool).` },
    ],
    formulas: [String.raw`\frac{\partial}{\partial a}\log(1-\sigma(a))=-\sigma(a)`, String.raw`\frac{\partial}{\partial a}[-\log\sigma(a)]=-(1-\sigma(a))`, String.raw`FID=\|\mu_r-\mu_g\|^2+\text{Tr}\big(\Sigma_r+\Sigma_g-2(\Sigma_r\Sigma_g)^{1/2}\big)`],
    tpls: [{
      q: 'Early in GAN training the discriminator gives D(G(z)) = {p} for a fake sample (D = σ(a)). By what factor is the gradient magnitude of the non-saturating generator loss −log D(G(z)) larger than that of the saturating loss log(1 − D(G(z))) with respect to the logit a?',
      vars: [{ s: 'p', label: 'D(G(z))', v: 0.02, min: 0.01, max: 0.2, step: 0.01 }],
      derive: [{ s: 'sat', expr: 'p' }, { s: 'ns', expr: '1-p' }],
      expr: '(1-p)/p', dec: 2, unit: '×',
      steps: ['Saturating loss gradient: |∂/∂a log(1−σ(a))| = σ(a) = {sat}', 'Non-saturating gradient: |∂/∂a (−log σ(a))| = 1 − σ(a) = {ns}', 'Ratio = {ns} / {sat} = {ans}'],
    }],
    gem: 'Compare saturating and non-saturating generator gradients for a given D(G(z)), or compute an FID-like quantity for 1-D Gaussians: (mu_r-mu_g)^2 + (sigma_r - sigma_g)^2.',
    exam: [
      { m: 10, q: 'Explain mode collapse and vanishing gradients in GANs. Suggest remedies for each.', a: 'Mode collapse: G produces limited varieties because it chases the current D optimum; fixes: minibatch discrimination, feature matching, unrolled GAN, WGAN, PacGAN. Vanishing gradients: when D is near perfect, D(G(z))~0 and log(1-D(G(z))) saturates, gradient ~0; because real/fake supports are nearly disjoint, JSD is constant. Fixes: non-saturating loss, Wasserstein loss with gradient penalty, LSGAN, instance noise, balanced training (TTUR).' },
      { m: 5, q: 'What are IS and FID? Which is preferred and why?', a: 'IS = exp(E KL(p(y|x)||p(y))) using Inception classifier: high when images are confident and classes diverse. FID = distance between Gaussians fitted to Inception features of real and generated images; lower is better. FID is preferred: it compares with real data, is more sensitive to mode dropping and noise.' },
      { m: 5, q: 'Why can loss curves not be used to judge GAN quality?', a: 'G and D losses are adversarial and non-stationary; one improving makes the other worse, so values oscillate without correlating with sample quality (unlike WGAN critic loss, which correlates with quality).' },
    ],
    tips: ['Pair every problem with a fix when answering - "problem-cause-remedy".', 'Quote the gradient numbers (σ vs 1−σ) to show depth.'],
  },
  {
    room: 3, tag: 'Module 2 · 2.2 GAN', title: 'Wasserstein GAN & Gradient Penalty',
    chalk: ['W₁(P,Q) = inf_γ E_(x,y)~γ ‖x − y‖', 'WGAN : max_{‖f‖_L≤1} E_real f(x) − E_fake f(G(z))', 'WGAN-GP : L = D(fake) − D(real) + λ(‖∇D(x̂)‖₂ − 1)²'],
    summary: 'WGAN replaces the JS-based loss with the Earth-Mover (Wasserstein-1) distance, giving useful gradients even when distributions do not overlap. The critic must be 1-Lipschitz: weight clipping or a gradient penalty.',
    notes: [
      { h: 'Why Wasserstein?', body: String.raw`JSD (and KL) saturate when $p_{data}$ and $p_g$ do not overlap: for two parallel lines at distance $\theta$, $JSD=\log2$ for any $\theta\ne0$ (no gradient), while $W_1=|\theta|$ (smooth, informative).
**Earth-Mover distance:** $W_1(P,Q)=\inf_{\gamma\in\Pi(P,Q)}\mathbb E_{(x,y)\sim\gamma}\|x-y\|$ - minimum "work" to move probability mass from $P$ to $Q$.
In 1-D with CDFs $F_P,F_Q$: $W_1=\int|F_P(x)-F_Q(x)|dx$ (use this in numericals).` },
      { h: 'WGAN (Arjovsky et al., 2017)', body: String.raw`Kantorovich-Rubinstein duality:
$$W_1(p_{data},p_g)=\sup_{\|f\|_L\le1}\ \mathbb E_{x\sim p_{data}}[f(x)]-\mathbb E_{z}[f(G(z))]$$
- The **critic** $f_w$ (not a classifier: **no sigmoid**, outputs a real score) must be **1-Lipschitz**.
- Critic loss: $L_C=\mathbb E[f(G(z))]-\mathbb E[f(x)]$; generator loss: $L_G=-\mathbb E[f(G(z))]$.
- Original enforcement: **weight clipping** to $[-c,c]$ ($c=0.01$) - can cause capacity loss / vanishing or exploding gradients.
- Train critic $n_{critic}=5$ times per generator step; use RMSProp (no momentum).
- **Benefits:** meaningful loss that correlates with sample quality, smoother gradients, far less mode collapse.` },
      { h: 'WGAN-GP (Gulrajani et al., 2017)', body: String.raw`Replace clipping by a **gradient penalty** on random interpolates $\hat x=\varepsilon x+(1-\varepsilon)G(z)$, $\varepsilon\sim U[0,1]$:
$$L_C=\mathbb E[D(\tilde x)]-\mathbb E[D(x)]+\lambda\,\mathbb E_{\hat x}\big[(\|\nabla_{\hat x}D(\hat x)\|_2-1)^2\big],\ \ \lambda=10$$
- Pushes the gradient norm towards **1** (the optimal critic has unit gradient norm along lines between real and fake).
- Do **not** use batch norm in the critic (penalty is per-sample); use layer norm. Adam with $\beta_1=0$-$0.5$, $\beta_2=0.9$.
- Related: spectral normalisation, LSGAN (least-squares loss), hinge loss.` },
    ],
    formulas: [String.raw`W_1(P,Q)=\inf_{\gamma}\mathbb E_{(x,y)\sim\gamma}\|x-y\|`, String.raw`W_1=\sup_{\|f\|_L\le1}\mathbb E_{P}f-\mathbb E_{Q}f`, String.raw`L_C=\mathbb E[D(\tilde x)]-\mathbb E[D(x)]+\lambda\mathbb E[(\|\nabla_{\hat x}D(\hat x)\|-1)^2]`],
    tpls: [{
      q: 'In WGAN-GP the critic scores a real sample D(x) = {a} and a fake D(x̃) = {b}. At an interpolated point the gradient norm is ‖∇D(x̂)‖₂ = {g}. With λ = {lam}, compute the critic loss for this sample.',
      vars: [{ s: 'a', label: 'D(real)', v: 2.5, min: 0, max: 4, step: 0.5 }, { s: 'b', label: 'D(fake)', v: -1, min: -3, max: 0, step: 0.5 }, { s: 'g', label: '‖∇D‖', v: 1.4, min: 0.6, max: 1.6, step: 0.2 }, { s: 'lam', label: 'λ', v: 10, min: 1, max: 10, step: 1 }],
      derive: [{ s: 'gp', expr: 'lam*(g-1)^2' }],
      expr: 'b-a+gp', dec: 3,
      steps: ['Gradient penalty = λ(‖∇D‖ − 1)² = {lam}·({g} − 1)² = {gp}', 'Critic loss = D(fake) − D(real) + GP = {b} − {a} + {gp} = {ans}'],
    }, {
      q: 'Two distributions on bins 1, 2, 3 (unit spacing): P = ({p1}, {p2}, 1−{p1}−{p2}) and Q = ({q1}, {q2}, 1−{q1}−{q2}). Compute the Wasserstein-1 (Earth-Mover) distance.',
      vars: [{ s: 'p1', label: 'P₁', v: 0.5, min: 0.3, max: 0.6, step: 0.1 }, { s: 'p2', label: 'P₂', v: 0.3, min: 0.2, max: 0.3, step: 0.1 }, { s: 'q1', label: 'Q₁', v: 0.2, min: 0.1, max: 0.3, step: 0.1 }, { s: 'q2', label: 'Q₂', v: 0.3, min: 0.2, max: 0.4, step: 0.1 }],
      derive: [{ s: 'c1', expr: 'abs(p1-q1)' }, { s: 'c2', expr: 'abs((p1+p2)-(q1+q2))' }],
      expr: 'c1+c2', dec: 3,
      steps: ['W₁ = Σ_k |F_P(k) − F_Q(k)| (CDF differences, unit spacing); the last CDF difference is 0', '|{p1} − {q1}| = {c1}', '|({p1}+{p2}) − ({q1}+{q2})| = {c2}', 'W₁ = {c1} + {c2} = {ans}'],
    }],
    gem: 'WGAN-GP critic loss with gradient penalty from given critic scores and gradient norm, or 1-D discrete Earth-Mover distance via CDF differences.',
    exam: [
      { m: 10, q: 'Explain Wasserstein GAN. How does it fix the problems of the standard GAN and how is the Lipschitz constraint enforced?', a: 'Standard GAN minimises JSD, which is constant/log2 when supports are disjoint -> vanishing gradients and mode collapse. WGAN minimises Earth-Mover W1 via Kantorovich-Rubinstein duality: max over 1-Lipschitz critics of E_real f - E_fake f. Critic has no sigmoid; loss gives gradients everywhere and correlates with quality. Lipschitz: weight clipping to [-c,c] (crude) or gradient penalty lambda(||grad D(x_hat)||-1)^2 on interpolates (WGAN-GP, lambda=10, no batchnorm in critic).' },
      { m: 5, q: 'Compute the W1 distance between P=(0.5,0.5,0) and Q=(0,0.5,0.5) on bins 1,2,3.', a: 'CDF_P=(0.5,1,1); CDF_Q=(0,0.5,1); |diff|=(0.5,0.5,0); W1=1.0 (move 0.5 mass by 1 bin twice: 0.5*1+0.5*1).' },
      { m: 5, q: 'Why is weight clipping poor and what does WGAN-GP do instead?', a: 'Clipping biases the critic toward simple functions, causes vanishing/exploding gradients depending on c. WGAN-GP penalises deviation of the critic gradient norm from 1 on interpolated samples, enforcing the Lipschitz condition softly with better stability.' },
    ],
    tips: ['Remember the three differences from a normal GAN: no sigmoid, no log, 5 critic steps.', 'GP uses interpolates x̂ = εx + (1−ε)G(z).'],
  },
  {
    room: 3, tag: 'Module 2 · 2.2 GAN', title: 'GAN Variants: DCGAN · StyleGAN · CycleGAN',
    chalk: ['DCGAN : out = (in − 1)·s − 2p + k   (transposed conv)', 'StyleGAN : z → mapping → w → AdaIN styles + noise', 'CycleGAN : L = L_GAN(G) + L_GAN(F) + λ(‖F(G(x))−x‖₁ + ‖G(F(y))−y‖₁)'],
    summary: 'DCGAN makes GANs convolutional and stable, StyleGAN controls style at every scale, CycleGAN translates images between domains without paired data.',
    notes: [
      { h: 'DCGAN (Radford et al., 2015)', body: String.raw`Guidelines for stable deep convolutional GANs:
- Replace pooling with **strided convolutions** (D) and **transposed (fractionally-strided) convolutions** (G).
- **Batch normalisation** in G and D (not on G's output layer or D's input layer).
- Remove fully-connected hidden layers; **ReLU** in G (hidden) with **Tanh** output; **LeakyReLU(0.2)** in D.
- Adam, $lr=2\times10^{-4}$, $\beta_1=0.5$. Typical G: $z$ (100) -> $4\times4\times1024$ -> $8\times8\times512$ -> $16\times16\times256$ -> $32\times32\times128$ -> $64\times64\times3$.
- Transposed-conv output size: $\text{out}=(\text{in}-1)s-2p+k\,(+\text{output\_padding})$. Showed latent arithmetic on faces.` },
      { h: 'StyleGAN (Karras et al., NVIDIA)', body: String.raw`- **Mapping network:** 8-layer MLP $z\to w$ (intermediate, more disentangled **W-space**).
- **Synthesis network** starts from a learned constant $4\times4$ tensor (not noise); at each resolution an **AdaIN** layer applies per-channel scale and bias computed from $w$: $\text{AdaIN}(x_i,y)=y_{s,i}\frac{x_i-\mu(x_i)}{\sigma(x_i)}+y_{b,i}$.
- **Per-layer noise inputs** give stochastic detail (hair strands, freckles).
- **Style mixing** (use different $w$ at different layers): coarse layers = pose/face shape; middle = features; fine = colour/texture.
- **Progressive growing** (from ProGAN) to $1024\times1024$; **truncation trick** in $W$.
- **StyleGAN2:** weight demodulation replaces AdaIN (removes droplet artefacts), path-length regularisation, no progressive growing. **StyleGAN3:** alias-free.` },
      { h: 'CycleGAN (Zhu et al., 2017) - unpaired image-to-image translation', body: String.raw`Two generators $G:X\to Y$, $F:Y\to X$ and two discriminators $D_Y, D_X$. No paired examples needed (horse<->zebra, photo<->Monet, summer<->winter).
$$\mathcal L=\mathcal L_{GAN}(G,D_Y)+\mathcal L_{GAN}(F,D_X)+\lambda\,\mathcal L_{cyc}(G,F),\ \ \lambda=10$$
$$\mathcal L_{cyc}=\mathbb E_x\|F(G(x))-x\|_1+\mathbb E_y\|G(F(y))-y\|_1$$
- **Cycle consistency** stops the mapping from collapsing to an arbitrary valid image: translating there and back must recover the input.
- Optional **identity loss** $\|G(y)-y\|_1$ preserves colour. Uses PatchGAN discriminators, least-squares GAN loss, ResNet-based generators.
- Compare **pix2pix** (needs paired data, conditional GAN + L1).` },
    ],
    formulas: [String.raw`\text{out}=(\text{in}-1)\,s-2p+k`, String.raw`\mathcal L_{cyc}=\mathbb E_x\|F(G(x))-x\|_1+\mathbb E_y\|G(F(y))-y\|_1`, String.raw`\text{AdaIN}(x_i,y)=y_{s,i}\frac{x_i-\mu(x_i)}{\sigma(x_i)}+y_{b,i}`],
    tpls: [{
      q: 'A DCGAN generator layer uses a transposed convolution with kernel k = {k}, stride s = {s}, padding p = {p} on a {in}×{in} feature map. What is the spatial size (one side) of the output?',
      vars: [{ s: 'in', label: 'input size', v: 4, min: 4, max: 32, step: 4 }, { s: 'k', label: 'kernel', v: 4, min: 3, max: 5, step: 1 }, { s: 's', label: 'stride', v: 2, min: 1, max: 2, step: 1 }, { s: 'p', label: 'padding', v: 1, min: 0, max: 1, step: 1 }],
      expr: '(in-1)*s-2*p+k', dec: 0,
      steps: ['out = (in − 1)·s − 2p + k', 'out = ({in} − 1)·{s} − 2·{p} + {k} = {ans}'],
    }, {
      q: 'In a CycleGAN the adversarial losses are L_GAN(G) = {g1} and L_GAN(F) = {g2}. The mean L1 cycle errors are ‖F(G(x))−x‖₁ = {c1} and ‖G(F(y))−y‖₁ = {c2}. With λ = {lam}, compute the total loss.',
      vars: [{ s: 'g1', label: 'L_GAN(G)', v: 0.7, min: 0.3, max: 1.2, step: 0.1 }, { s: 'g2', label: 'L_GAN(F)', v: 0.9, min: 0.3, max: 1.2, step: 0.1 }, { s: 'c1', label: 'cycle x', v: 0.05, min: 0.02, max: 0.12, step: 0.01 }, { s: 'c2', label: 'cycle y', v: 0.08, min: 0.02, max: 0.12, step: 0.01 }, { s: 'lam', label: 'λ', v: 10, min: 5, max: 10, step: 5 }],
      derive: [{ s: 'cyc', expr: 'lam*(c1+c2)' }],
      expr: 'g1+g2+cyc', dec: 3,
      steps: ['Cycle term = λ(c₁ + c₂) = {lam}·({c1} + {c2}) = {cyc}', 'Total = L_GAN(G) + L_GAN(F) + cycle = {g1} + {g2} + {cyc} = {ans}'],
    }],
    gem: 'Transposed-convolution / convolution output size formula, or CycleGAN total loss = GAN losses + lambda * cycle-consistency L1 with given numbers.',
    exam: [
      { m: 10, q: 'Explain CycleGAN: architecture, losses and why cycle consistency is needed.', a: 'Two generators G:X->Y, F:Y->X and two discriminators D_Y, D_X learn translation from unpaired sets. Loss = adversarial(G,D_Y) + adversarial(F,D_X) + lambda*cycle loss (L1 of F(G(x))-x and G(F(y))-y, lambda=10), optional identity loss. Without cycle consistency, adversarial loss alone only forces outputs to look like domain Y, allowing G to map all inputs to one image (mode collapse) or ignore content; cycle consistency forces content preservation. Applications: horse<->zebra, style transfer.' },
      { m: 10, q: 'Describe the StyleGAN generator and how it controls image style at different scales.', a: 'Mapping MLP z->w; synthesis network from a learned constant 4x4; at each layer AdaIN uses styles derived from w to scale/shift normalised feature maps; per-layer noise adds stochastic detail; style mixing and truncation. Coarse layers (4-8 px) control pose/face shape, middle layers features like eyes/hair style, fine layers colour and micro-texture. StyleGAN2 replaces AdaIN with weight demodulation to remove artefacts.' },
      { m: 5, q: 'List the architectural guidelines of DCGAN.', a: 'Strided conv in D and transposed conv in G (no pooling); batchnorm (except G output, D input); no fully connected hidden layers; ReLU in G with Tanh output; LeakyReLU in D; Adam lr 2e-4 beta1 0.5.' },
    ],
    tips: ['For CycleGAN always write the full loss with λ = 10.', 'For transposed convolutions, quote out = (in−1)s − 2p + k.'],
  },
];
