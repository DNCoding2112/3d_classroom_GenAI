// Room 2 — Module 2.1: Variational Autoencoders
export default [
  {
    room: 2, tag: 'Module 2 · 2.1 VAE', title: 'Latent Variables & Autoencoders',
    chalk: ['p(x) = ∫ p(x|z) p(z) dz   (intractable)', 'Posterior : p(z|x) = p(x|z)p(z) / p(x)', 'Approximate it with q_φ(z|x)  (encoder)'],
    summary: 'A VAE is a latent-variable model: hidden z generates x. The true posterior is intractable, so an encoder learns an approximation q(z|x).',
    notes: [
      { h: 'Plain autoencoder (AE) first', body: String.raw`- **Encoder** $z=f_\phi(x)$ compresses; **decoder** $\hat x=g_\theta(z)$ reconstructs; loss $\|x-\hat x\|^2$. The **bottleneck** forces useful features.
- Variants: denoising, sparse, contractive AEs.
- **Problem for generation:** the AE latent space has *holes* and no known distribution to sample from - decoding a random $z$ gives garbage.` },
      { h: 'Latent-variable generative model', body: String.raw`Assume data is produced by a hidden cause $z$:
$$z\sim p(z)=\mathcal N(0,I),\qquad x\sim p_\theta(x\mid z)$$
- Marginal likelihood: $p_\theta(x)=\int p_\theta(x\mid z)p(z)\,dz$ - an integral over all $z$, **intractable** for neural-network decoders.
- True posterior $p_\theta(z\mid x)=\dfrac{p_\theta(x\mid z)p(z)}{p_\theta(x)}$ is therefore also intractable.
- **Variational inference:** introduce a tractable family $q_\phi(z\mid x)=\mathcal N(\mu_\phi(x),\text{diag}\,\sigma^2_\phi(x))$ and make it close to the true posterior.` },
      { h: 'VAE architecture', body: String.raw`- **Encoder (inference / recognition network):** $x\to(\mu,\log\sigma^2)$.
- **Sampling layer:** $z=\mu+\sigma\odot\epsilon$ (reparameterisation).
- **Decoder (generative network):** $z\to$ parameters of $p_\theta(x\mid z)$ (Bernoulli for binary pixels, Gaussian for continuous).
- **Amortised inference:** one network predicts the posterior for every $x$ - no per-sample optimisation.
- Generation: sample $z\sim\mathcal N(0,I)$, run only the decoder.` },
      { h: 'AE vs VAE', body: String.raw`| | Autoencoder | VAE |
|---|---|---|
| Latent | single point | distribution $q(z\mid x)$ |
| Loss | reconstruction | reconstruction + KL regulariser |
| Latent space | irregular | smooth, ~$\mathcal N(0,I)$ |
| Can generate? | poorly | yes |` },
    ],
    formulas: [String.raw`p_\theta(x)=\int p_\theta(x\mid z)p(z)\,dz`, String.raw`p_\theta(z\mid x)=\frac{p_\theta(x\mid z)p(z)}{p_\theta(x)}`, String.raw`q_\phi(z\mid x)=\mathcal N\big(\mu_\phi(x),\text{diag}(\sigma^2_\phi(x))\big)`],
    tpls: [{
      q: 'A latent-variable model has a discrete z ∈ {1, 2, 3} with priors p(z=1) = {p1}, p(z=2) = {p2} and p(z=3) = 1 − {p1} − {p2}. An observation x has likelihoods p(x|z=1) = {l1}, p(x|z=2) = {l2}, p(x|z=3) = {l3}. Find p(z=2 | x).',
      vars: [{ s: 'p1', label: 'p(z=1)', v: 0.2, min: 0.1, max: 0.4, step: 0.1 }, { s: 'p2', label: 'p(z=2)', v: 0.5, min: 0.3, max: 0.5, step: 0.1 }, { s: 'l1', label: 'p(x|z=1)', v: 0.1, min: 0.05, max: 0.2, step: 0.05 }, { s: 'l2', label: 'p(x|z=2)', v: 0.4, min: 0.2, max: 0.6, step: 0.1 }, { s: 'l3', label: 'p(x|z=3)', v: 0.05, min: 0.05, max: 0.3, step: 0.05 }],
      derive: [{ s: 'p3', expr: '1-p1-p2' }, { s: 'px', expr: 'p1*l1+p2*l2+p3*l3' }],
      expr: 'p2*l2/px', dec: 4,
      steps: ['p(z=3) = 1 − {p1} − {p2} = {p3}', 'Marginal p(x) = Σ_z p(x|z)p(z) = {p1}·{l1} + {p2}·{l2} + {p3}·{l3} = {px}', 'Posterior p(z=2|x) = p(x|z=2)p(z=2) / p(x) = {p2}·{l2} / {px} = {ans}'],
    }],
    gem: 'Posterior over a discrete latent variable via Bayes rule and the marginal likelihood sum, or a dimension/compression-ratio calculation for an autoencoder bottleneck.',
    exam: [
      { m: 5, q: 'Why is a plain autoencoder not a good generative model? How does a VAE fix this?', a: 'AE maps each input to a single point; the latent space is irregular with gaps, and there is no prior to sample from. VAE encodes to a distribution q(z|x) and adds a KL term pulling it to N(0,I), so the latent space is continuous, regular and any sampled z decodes to a plausible x.' },
      { m: 5, q: 'Why is the marginal likelihood p(x) intractable in a VAE and what is the remedy?', a: 'p(x)=integral p(x|z)p(z)dz requires integrating over all latent values with a neural-network likelihood - no closed form. The posterior p(z|x) is then intractable too. Remedy: variational inference - approximate the posterior with q_phi(z|x) and maximise the ELBO, a tractable lower bound on log p(x).' },
      { m: 5, q: 'Differentiate encoder and decoder in a VAE and state their outputs.', a: 'Encoder q_phi(z|x) outputs mean mu and log-variance of a diagonal Gaussian over z. Decoder p_theta(x|z) takes a sampled z and outputs the parameters of the data distribution (Bernoulli probabilities or Gaussian mean) used to reconstruct/generate x.' },
    ],
    tips: ['Draw the block diagram: x → (μ, σ) → z → x̂.', 'Say "amortised inference" - examiners like it.'],
  },
  {
    room: 2, tag: 'Module 2 · 2.1 VAE', title: 'KL Divergence',
    chalk: ['KL(p‖q) = Σ p(x) log p(x)/q(x)  ≥ 0', 'KL(N(μ₁,σ₁²)‖N(μ₂,σ₂²)) = ln(σ₂/σ₁) + (σ₁²+(μ₁−μ₂)²)/(2σ₂²) − ½', 'VAE: KL(N(μ,σ²)‖N(0,1)) = ½(μ²+σ²−1−ln σ²)'],
    summary: 'KL divergence measures how one distribution differs from another: always ≥ 0, zero only when identical, and asymmetric. In VAEs it regularises the encoder towards the prior.',
    notes: [
      { h: 'Definition and properties', body: String.raw`$$D_{KL}(p\|q)=\sum_x p(x)\log\frac{p(x)}{q(x)}\ \ \text{or}\ \ \int p(x)\log\frac{p(x)}{q(x)}dx=\mathbb E_{p}\Big[\log\frac{p}{q}\Big]$$
- $D_{KL}\ge 0$ (Gibbs' inequality, from Jensen); $=0$ iff $p=q$ almost everywhere.
- **Not symmetric** and not a true metric (no triangle inequality). Jensen-Shannon divergence is the symmetric, bounded version.
- Interpretation: extra nats/bits needed when coding data from $p$ with a code optimised for $q$. $D_{KL}(p\|q)=H(p,q)-H(p)$ (cross-entropy minus entropy).
- **Forward KL** $D(p_{data}\|q_\theta)$: mass-covering (MLE minimises it). **Reverse KL** $D(q_\theta\|p)$: mode-seeking (used in variational inference).` },
      { h: 'Closed form for Gaussians', body: String.raw`Univariate:
$$D_{KL}\big(\mathcal N(\mu_1,\sigma_1^2)\,\|\,\mathcal N(\mu_2,\sigma_2^2)\big)=\ln\frac{\sigma_2}{\sigma_1}+\frac{\sigma_1^2+(\mu_1-\mu_2)^2}{2\sigma_2^2}-\frac12$$
VAE special case, prior $\mathcal N(0,1)$, summed over $d$ latent dimensions:
$$D_{KL}\big(q(z|x)\,\|\,\mathcal N(0,I)\big)=\frac12\sum_{j=1}^{d}\big(\mu_j^2+\sigma_j^2-1-\ln\sigma_j^2\big)=-\frac12\sum_j\big(1+\log\sigma_j^2-\mu_j^2-\sigma_j^2\big)$$
This is the **exact line of code** {{-0.5 * sum(1 + logvar - mu^2 - exp(logvar))}} in every VAE implementation.` },
      { h: 'Role in VAEs', body: String.raw`- Pushes each $q(z\mid x)$ towards $\mathcal N(0,I)$ so the aggregate latent space is **continuous and samplable**.
- Penalises $\mu\neq0$ (centred) and $\sigma\neq1$ (spread). It is zero only when $\mu=0,\sigma=1$.
- Too strong -> **posterior collapse** (encoder ignores $x$, decoder outputs the average); too weak -> irregular latent space. Controlled with $\beta$-VAE or **KL annealing**.` },
    ],
    formulas: [String.raw`D_{KL}(p\|q)=\mathbb E_p[\log p-\log q]`, String.raw`D_{KL}(\mathcal N(\mu,\sigma^2)\|\mathcal N(0,1))=\tfrac12(\mu^2+\sigma^2-1-\ln\sigma^2)`],
    tpls: [{
      q: 'Compute D_KL( N(μ₁={m1}, σ₁={s1}²) ‖ N(μ₂={m2}, σ₂={s2}²) ) in nats.',
      vars: [{ s: 'm1', label: 'μ₁', v: 1, min: -2, max: 2, step: 0.5 }, { s: 's1', label: 'σ₁', v: 0.5, min: 0.5, max: 2, step: 0.5 }, { s: 'm2', label: 'μ₂', v: 0, min: -1, max: 1, step: 0.5 }, { s: 's2', label: 'σ₂', v: 1, min: 0.5, max: 2, step: 0.5 }],
      derive: [{ s: 'a', expr: 'ln(s2/s1)' }, { s: 'b', expr: '(s1^2+(m1-m2)^2)/(2*s2^2)' }],
      expr: 'a+b-0.5', dec: 4, unit: 'nats',
      steps: ['Formula: ln(σ₂/σ₁) + (σ₁² + (μ₁−μ₂)²)/(2σ₂²) − ½', 'ln({s2}/{s1}) = {a}', '({s1}² + ({m1}−{m2})²) / (2·{s2}²) = {b}', 'KL = {a} + {b} − 0.5 = {ans} nats'],
    }, {
      q: 'Discrete distributions p = ({p1}, {p2}, 1−{p1}−{p2}) and q = ({q1}, {q2}, 1−{q1}−{q2}). Compute D_KL(p ‖ q) in nats.',
      vars: [{ s: 'p1', label: 'p₁', v: 0.5, min: 0.3, max: 0.6, step: 0.1 }, { s: 'p2', label: 'p₂', v: 0.3, min: 0.2, max: 0.3, step: 0.1 }, { s: 'q1', label: 'q₁', v: 0.4, min: 0.3, max: 0.5, step: 0.1 }, { s: 'q2', label: 'q₂', v: 0.4, min: 0.3, max: 0.4, step: 0.1 }],
      derive: [{ s: 'p3', expr: '1-p1-p2' }, { s: 'q3', expr: '1-q1-q2' }],
      expr: 'p1*ln(p1/q1)+p2*ln(p2/q2)+p3*ln(p3/q3)', dec: 4, unit: 'nats',
      steps: ['p₃ = {p3}, q₃ = {q3}', 'KL = Σ pᵢ ln(pᵢ/qᵢ)', '= {p1}·ln({p1}/{q1}) + {p2}·ln({p2}/{q2}) + {p3}·ln({p3}/{q3})', '= {ans} nats'],
    }],
    gem: 'KL divergence between two univariate Gaussians, KL of a VAE encoder N(mu, sigma^2) to N(0,1) for a 1- or 2-dimensional latent, or KL between small discrete distributions. Use natural log, answer in nats.',
    exam: [
      { m: 5, q: 'Define KL divergence, state its properties, and explain its role in a VAE.', a: 'D_KL(p||q)=sum p log(p/q). Non-negative, zero iff p=q, asymmetric, not a metric. In a VAE the term KL(q(z|x)||N(0,I)) regularises the encoder to stay near the prior so the latent space is smooth and sampleable; too large a weight causes posterior collapse.' },
      { m: 5, q: 'Derive/state the closed-form KL between N(mu, sigma^2) and N(0,1) and evaluate for mu=1, sigma=1.', a: 'KL = 0.5(mu^2 + sigma^2 - 1 - ln sigma^2). For mu=1, sigma=1: 0.5(1+1-1-0)=0.5 nats.' },
      { m: 5, q: 'Distinguish forward and reverse KL.', a: 'Forward KL(p_data||q): penalises q wherever data has mass, so q is mass-covering (what MLE minimises). Reverse KL(q||p): penalises q placing mass where p is small, so q is mode-seeking (used in variational inference, can ignore modes).' },
    ],
    tips: ['Use natural log (nats) unless told to use log2 (bits).', 'Sanity check: a KL answer can never be negative.'],
  },
  {
    room: 2, tag: 'Module 2 · 2.1 VAE', title: 'ELBO — Evidence Lower BOund',
    chalk: ['log p(x) ≥ ELBO = E_q[log p(x|z)] − KL(q(z|x)‖p(z))', 'log p(x) = ELBO + KL(q(z|x)‖p(z|x))', 'Loss = −ELBO = Recon + β·KL'],
    summary: 'We cannot maximise log p(x) directly, so we maximise the ELBO: reconstruction quality minus the KL penalty. The gap between log p(x) and the ELBO is exactly KL(q‖true posterior).',
    notes: [
      { h: 'Derivation (Jensen) - 5 steps for 10 marks', body: String.raw`1. $\log p_\theta(x)=\log\int p_\theta(x,z)\,dz$
2. Multiply and divide by $q_\phi(z|x)$: $=\log\mathbb E_{q}\Big[\dfrac{p_\theta(x,z)}{q_\phi(z|x)}\Big]$
3. **Jensen** ($\log$ is concave): $\ge\mathbb E_q\big[\log p_\theta(x,z)-\log q_\phi(z|x)\big]=:\mathcal L$ (ELBO)
4. Expand $p(x,z)=p(x|z)p(z)$: $\mathcal L=\mathbb E_q[\log p_\theta(x|z)]-\mathbb E_q\Big[\log\dfrac{q_\phi(z|x)}{p(z)}\Big]$
5. $$\boxed{\mathcal L=\mathbb E_{q_\phi(z|x)}[\log p_\theta(x|z)]-D_{KL}\big(q_\phi(z|x)\,\|\,p(z)\big)}$$` },
      { h: 'The exact gap', body: String.raw`$$\log p_\theta(x)=\mathcal L(\theta,\phi;x)+D_{KL}\big(q_\phi(z|x)\,\|\,p_\theta(z|x)\big)$$
Because the last term $\ge0$, $\mathcal L\le\log p(x)$ ("evidence lower bound"). Maximising $\mathcal L$ over $\phi$ shrinks the gap (better posterior); over $\theta$ increases the likelihood.` },
      { h: 'Reading the two terms', body: String.raw`- **Reconstruction term** $\mathbb E_q[\log p(x|z)]$: how well $z$ explains $x$ (BCE for Bernoulli pixels, MSE for Gaussian). Estimated with one Monte-Carlo sample.
- **KL term** (regulariser): keeps $q(z|x)$ near the prior; closed form for Gaussians.
- **Trade-off:** reconstruction vs regularisation. $\beta$-VAE: $\mathcal L_\beta=\mathbb E[\log p(x|z)]-\beta D_{KL}$; $\beta>1$ -> more disentangled latents, blurrier output.
- **Training loss** = $-\mathcal L$ (we minimise). Reported in nats (or bits/dim).` },
    ],
    formulas: [String.raw`\mathcal L=\mathbb E_{q_\phi(z|x)}[\log p_\theta(x|z)]-D_{KL}(q_\phi(z|x)\|p(z))`, String.raw`\log p_\theta(x)=\mathcal L+D_{KL}(q_\phi(z|x)\|p_\theta(z|x))`, String.raw`\mathcal L_\beta=\mathbb E[\log p(x|z)]-\beta D_{KL}`],
    tpls: [{
      q: 'For one data point a VAE with a 2-D latent has reconstruction log-likelihood E_q[log p(x|z)] = {R} nats. The encoder gives μ = ({m1}, {m2}) and σ = ({s1}, {s2}); the prior is N(0, I). Compute the β-ELBO with β = {b}.',
      vars: [{ s: 'R', label: 'recon log-lik', v: -85.3, min: -120, max: -60, step: 0.5 }, { s: 'm1', label: 'μ₁', v: 0.5, min: -1.5, max: 1.5, step: 0.5 }, { s: 'm2', label: 'μ₂', v: -1, min: -1.5, max: 1.5, step: 0.5 }, { s: 's1', label: 'σ₁', v: 0.8, min: 0.4, max: 1.2, step: 0.2 }, { s: 's2', label: 'σ₂', v: 0.6, min: 0.4, max: 1.2, step: 0.2 }, { s: 'b', label: 'β', v: 1, min: 0.5, max: 4, step: 0.5 }],
      derive: [{ s: 'k1', expr: 'm1^2+s1^2-1-ln(s1^2)' }, { s: 'k2', expr: 'm2^2+s2^2-1-ln(s2^2)' }, { s: 'KL', expr: '0.5*(k1+k2)' }],
      expr: 'R-b*KL', dec: 3, unit: 'nats',
      steps: ['KL per dim = ½(μ² + σ² − 1 − ln σ²)', 'dim 1 term = {k1}, dim 2 term = {k2}', 'KL = ½({k1} + {k2}) = {KL}', 'ELBO_β = R − β·KL = {R} − {b}·{KL} = {ans}'],
    }],
    gem: 'Compute a (beta-)ELBO or the negative ELBO loss from a given reconstruction term and the closed-form Gaussian KL, or use log p(x) = ELBO + KL(q||posterior) to find the gap.',
    exam: [
      { m: 10, q: 'Derive the ELBO for a VAE and interpret each term.', a: 'log p(x)=log ∫p(x,z)dz = log E_q[p(x,z)/q(z|x)] >= E_q[log p(x,z) - log q(z|x)] (Jensen) = E_q[log p(x|z)] - KL(q(z|x)||p(z)). First term = expected reconstruction log-likelihood; second = regulariser keeping posterior near prior. Exact identity: log p(x)=ELBO+KL(q(z|x)||p(z|x)), so ELBO is a lower bound and maximising it tightens the approximate posterior.' },
      { m: 5, q: 'What does a beta > 1 do in a beta-VAE?', a: 'It increases weight on the KL term, forcing a more factorised, disentangled latent space with independent interpretable factors, at the cost of reconstruction quality (blurrier outputs); beta<1 favours reconstruction.' },
      { m: 5, q: 'If the ELBO is -90 nats and KL(q||true posterior) is 3 nats, what is log p(x)?', a: 'log p(x)=ELBO+KL(q||p(z|x)) = -90 + 3 = -87 nats.' },
    ],
    tips: ['ELBO derivation is the most-asked VAE question - memorise the 5 steps.', 'Remember: loss = −ELBO (minimise), ELBO itself is maximised.'],
  },
  {
    room: 2, tag: 'Module 2 · 2.1 VAE', title: 'Training VAEs (PyTorch / TensorFlow)',
    chalk: ['z = μ + exp(½·logvar) · ε', 'loss = BCE(x̂,x) + (−½ Σ(1+logvar−μ²−e^logvar))', 'Adam · lr 1e-3 · batch 128'],
    summary: 'Training = encode, reparameterise, decode, compute reconstruction + KL, backpropagate. The reparameterisation trick makes the sampling step differentiable.',
    notes: [
      { h: 'Training algorithm', body: String.raw`For each minibatch $x$:
1. **Encode:** $(\mu,\log\sigma^2)=\text{Enc}_\phi(x)$.
2. **Sample:** $\epsilon\sim\mathcal N(0,I)$, $z=\mu+\exp(\tfrac12\log\sigma^2)\odot\epsilon$.
3. **Decode:** $\hat x=\text{Dec}_\theta(z)$.
4. **Loss:** recon($\hat x,x$) + KL (closed form).
5. **Backprop** through decoder, $z$ (thanks to reparameterisation) and encoder; **Adam** update.
We predict $\log\sigma^2$ (not $\sigma$) so the output is unconstrained and numerically stable.` },
      { h: 'PyTorch implementation', body: String.raw`~~~python
class VAE(nn.Module):
    def __init__(self, d=784, h=400, z=20):
        super().__init__()
        self.enc = nn.Linear(d, h)
        self.mu, self.logvar = nn.Linear(h, z), nn.Linear(h, z)
        self.dec1, self.dec2 = nn.Linear(z, h), nn.Linear(h, d)
    def encode(self, x):
        h = F.relu(self.enc(x))
        return self.mu(h), self.logvar(h)
    def reparameterize(self, mu, logvar):
        std = torch.exp(0.5 * logvar)
        return mu + torch.randn_like(std) * std
    def decode(self, z):
        return torch.sigmoid(self.dec2(F.relu(self.dec1(z))))
    def forward(self, x):
        mu, logvar = self.encode(x.view(-1, 784))
        z = self.reparameterize(mu, logvar)
        return self.decode(z), mu, logvar

def loss_fn(x_hat, x, mu, logvar):
    bce = F.binary_cross_entropy(x_hat, x.view(-1, 784), reduction='sum')
    kld = -0.5 * torch.sum(1 + logvar - mu.pow(2) - logvar.exp())
    return bce + kld          # = -ELBO (summed over batch)
~~~
TensorFlow/Keras: write a custom {{Sampling}} layer returning {{mu + exp(0.5*logvar) * tf.random.normal(...)}} and add the KL via {{self.add_loss}} or a custom {{train_step}} using {{tf.GradientTape}}.` },
      { h: 'Practical issues and fixes', body: String.raw`- **Posterior collapse:** KL -> 0, decoder ignores $z$. Fix: **KL annealing** (ramp $\beta$ 0->1), free bits, weaker decoder.
- **Blurry samples:** due to Gaussian/Bernoulli likelihood averaging modes. Use richer decoders, VQ-VAE, hierarchical VAEs, or latent diffusion.
- **Loss choice:** Bernoulli data -> BCE; continuous -> MSE (Gaussian with fixed variance). Use matching reduction ({{sum}}) for correct KL balance.
- **Generation:** {{z = torch.randn(64, 20); model.decode(z)}}.
- **Hyper-parameters (MNIST):** Adam, lr 1e-3, batch 128, 20-50 epochs, latent 2-20.` },
    ],
    formulas: [String.raw`z=\mu+\sigma\odot\epsilon=\mu+e^{\frac12\log\sigma^2}\odot\epsilon`, String.raw`\mathcal L_{\text{train}}=-\mathcal L=\text{BCE}(\hat x,x)+D_{KL}`],
    tpls: [{
      q: 'The encoder of a VAE outputs μ = {mu} and log σ² = {lv} for one latent dimension. Using the reparameterisation trick with ε = {eps}, what is the sampled z?',
      vars: [{ s: 'mu', label: 'μ', v: 0.8, min: -1.5, max: 1.5, step: 0.1 }, { s: 'lv', label: 'log σ²', v: -1.2, min: -2, max: 0, step: 0.2 }, { s: 'eps', label: 'ε', v: 0.5, min: -2, max: 2, step: 0.5 }],
      derive: [{ s: 'sd', expr: 'exp(0.5*lv)' }],
      expr: 'mu+sd*eps', dec: 4,
      steps: ['σ = exp(½·log σ²) = exp(0.5·{lv}) = {sd}', 'z = μ + σ·ε = {mu} + {sd}·{eps} = {ans}'],
    }],
    gem: 'Reparameterisation sample z = mu + exp(0.5*logvar)*eps for given numbers, or one-sample VAE loss = BCE/MSE reconstruction + analytic KL for tiny numeric inputs.',
    exam: [
      { m: 5, q: 'What is the reparameterisation trick? Why can we not backpropagate through direct sampling?', a: 'Sampling z~N(mu,sigma^2) is a stochastic node with no gradient w.r.t. mu, sigma. Write z=mu+sigma*eps, eps~N(0,1): the randomness is an external input, so z is a deterministic differentiable function of (mu, sigma) and gradients reach the encoder.' },
      { m: 10, q: 'Describe the training procedure of a VAE and write the PyTorch loss function.', a: 'Encode x -> mu, logvar; sample z = mu + exp(0.5 logvar)*eps; decode x_hat; loss = reconstruction (BCE with reduction=sum or MSE) + KL = -0.5*sum(1+logvar-mu^2-exp(logvar)); backprop and Adam step. Code: bce = F.binary_cross_entropy(x_hat, x, reduction="sum"); kld = -0.5*torch.sum(1+logvar-mu.pow(2)-logvar.exp()); return bce+kld. Generation: decode z~N(0,I).' },
      { m: 5, q: 'What is posterior collapse and how can it be mitigated?', a: 'The encoder output equals the prior (KL ~ 0) and the decoder ignores z, so the latent carries no information. Mitigate with KL annealing/warm-up, free bits, lower beta, weaker/less autoregressive decoders, or skip connections.' },
    ],
    tips: ['Predict log-variance, not variance - mention why (stability, unconstrained).', 'Know the 1-line KL code by heart.'],
  },
];
