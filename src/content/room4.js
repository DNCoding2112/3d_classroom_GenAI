// Room 4 — Module 3.1: Generative Transformers & Large Models
export default [
  {
    room: 4, tag: 'Module 3 · 3.1 Transformers', title: 'Self-Attention Mechanism',
    chalk: ['Q = XW_Q , K = XW_K , V = XW_V', 'Attention(Q,K,V) = softmax( QKᵀ / √d_k ) · V', 'Causal mask: score(i,j) = −∞ for j > i'],
    summary: 'Every token builds a query, compares it with all keys, turns the scaled dot-products into weights with softmax and takes a weighted sum of the values.',
    notes: [
      { h: 'Why attention?', body: String.raw`RNNs process tokens sequentially (slow, long-range dependencies fade). **Self-attention** lets every position look at every other position **in parallel** with path length $O(1)$ between any two tokens. Introduced for the Transformer (Vaswani et al., 2017).` },
      { h: 'Scaled dot-product attention - step by step', body: String.raw`Input $X\in\mathbb R^{n\times d_{model}}$.
1. Project: $Q=XW_Q,\ K=XW_K,\ V=XW_V$ ($W_Q,W_K\in\mathbb R^{d_{model}\times d_k}$, $W_V\in\mathbb R^{d_{model}\times d_v}$).
2. Scores: $S=QK^\top$ (similarity of every query with every key).
3. **Scale** by $\sqrt{d_k}$: otherwise dot products grow with variance $d_k$, softmax saturates and gradients vanish.
4. (Optional) **mask**: add $-\infty$ to disallowed positions (padding, or future tokens in decoders).
5. Weights: $A=\text{softmax}(S/\sqrt{d_k})$ row-wise (each row sums to 1).
6. Output: $AV$ - each token becomes a weighted mix of value vectors.
$$\text{Attention}(Q,K,V)=\text{softmax}\!\Big(\frac{QK^\top}{\sqrt{d_k}}\Big)V$$` },
      { h: 'Types and related components', body: String.raw`- **Self-attention:** $Q,K,V$ from the same sequence. **Cross-attention:** $Q$ from decoder, $K,V$ from encoder (translation; also text conditioning in Stable Diffusion).
- **Causal (masked) self-attention** in GPT: token $i$ attends only to $j\le i$ -> allows autoregressive training with parallelism.
- **Positional encoding** (attention is permutation-invariant): sinusoidal $PE_{(pos,2i)}=\sin(pos/10000^{2i/d})$, $PE_{(pos,2i+1)}=\cos(\cdot)$, learned, or **RoPE** (LLaMA).
- **Complexity:** time and memory $O(n^2 d)$ in sequence length $n$ - motivates FlashAttention, sparse and linear attention.
- A full block = (multi-head) attention + **residual + LayerNorm** + position-wise **feed-forward network** (FFN, usually $4d_{model}$ inner dimension).` },
    ],
    formulas: [String.raw`\text{Attention}(Q,K,V)=\text{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)V`, String.raw`PE_{(pos,2i)}=\sin\!\big(pos/10000^{2i/d_{model}}\big)`, String.raw`\alpha_{ij}=\frac{\exp(q_i\!\cdot\!k_j/\sqrt{d_k})}{\sum_{l}\exp(q_i\!\cdot\!k_l/\sqrt{d_k})}`],
    tpls: [{
      q: 'A self-attention head has d_k = 2. A query q = ({q1}, {q2}) is compared with two keys k₁ = ({a1}, {a2}) and k₂ = ({b1}, {b2}). Compute the attention weight α₁ given to key 1.',
      vars: [{ s: 'q1', label: 'q₁', v: 1, min: 1, max: 2, step: 1 }, { s: 'q2', label: 'q₂', v: 2, min: 0, max: 2, step: 1 }, { s: 'a1', label: 'k₁[1]', v: 2, min: 1, max: 3, step: 1 }, { s: 'a2', label: 'k₁[2]', v: 1, min: 0, max: 2, step: 1 }, { s: 'b1', label: 'k₂[1]', v: 1, min: 0, max: 2, step: 1 }, { s: 'b2', label: 'k₂[2]', v: 0, min: 0, max: 2, step: 1 }],
      derive: [{ s: 'd1', expr: 'q1*a1+q2*a2' }, { s: 'd2', expr: 'q1*b1+q2*b2' }, { s: 'e1', expr: 'exp(d1/sqrt(2))' }, { s: 'e2', expr: 'exp(d2/sqrt(2))' }],
      expr: 'e1/(e1+e2)', dec: 4,
      steps: ['Dot products: q·k₁ = {d1}, q·k₂ = {d2}', 'Scale by √d_k = √2: {d1}/√2 and {d2}/√2', 'exp values: {e1} and {e2}', 'α₁ = {e1} / ({e1} + {e2}) = {ans}'],
    }],
    gem: 'Compute scaled dot-product attention weights (and optionally the weighted output) for tiny 2-D queries/keys/values with d_k = 2, including a causal-mask variant.',
    exam: [
      { m: 10, q: 'Explain the scaled dot-product self-attention mechanism with the formula. Why is scaling by sqrt(d_k) needed?', a: 'X is projected to Q,K,V. Scores QK^T measure query-key similarity; divide by sqrt(d_k); softmax gives attention weights per query; output = weights times V. Scaling is needed because for random vectors the dot product has variance d_k, so large d_k pushes softmax into saturated regions with tiny gradients; dividing by sqrt(d_k) keeps variance ~1.' },
      { m: 5, q: 'Differentiate self-attention, cross-attention and masked self-attention.', a: 'Self-attention: Q,K,V from the same sequence (encoder). Cross-attention: Q from decoder states, K,V from encoder outputs (or text embeddings in Stable Diffusion). Masked/causal self-attention: future positions get -inf before softmax so token i only sees tokens <= i, required for autoregressive generation in GPT-like decoders.' },
      { m: 5, q: 'What is the complexity of self-attention and why are positional encodings required?', a: 'O(n^2 d) time and O(n^2) memory in sequence length n. Attention is permutation-invariant, so order information must be injected with sinusoidal, learned or rotary positional encodings added to (or applied to) token embeddings.' },
    ],
    tips: ['Always write the formula and name all dimensions.', 'In numericals: dot product → divide by √d_k → softmax → weighted sum.'],
  },
  {
    room: 4, tag: 'Module 3 · 3.1 Transformers', title: 'Multi-Head Attention',
    chalk: ['head_i = Attention(QW_i^Q , KW_i^K , VW_i^V)', 'MHA = Concat(head₁ … head_h) · W_O', 'd_k = d_model / h     params ≈ 4·d_model²'],
    summary: 'Instead of one attention, run h smaller attentions in parallel on different learned projections so the model can attend to different relations at once, then concatenate and mix.',
    notes: [
      { h: 'Idea', body: String.raw`A single attention averages everything into one weighting. **Multi-head attention** splits $d_{model}$ into $h$ subspaces of size $d_k=d_v=d_{model}/h$; each **head** learns its own $W_i^Q,W_i^K,W_i^V$ and can specialise (syntax, coreference, position, rare words...).
$$\text{head}_i=\text{Attention}(QW_i^Q,KW_i^K,VW_i^V),\quad \text{MHA}(Q,K,V)=\text{Concat}(\text{head}_1,\dots,\text{head}_h)\,W^O$$
- Original Transformer: $d_{model}=512$, $h=8$, $d_k=64$; base model 6 encoder + 6 decoder layers, FFN inner size 2048.
- Compute is about the same as one full-width head, because each head is smaller.` },
      { h: 'Parameter counting (numericals!)', body: String.raw`- $W^Q,W^K,W^V,W^O$ are each $d_{model}\times d_{model}$ in total (heads are slices) => **$4d_{model}^2$ weights** (+ $4d_{model}$ biases).
- **FFN:** $d_{model}\to4d_{model}\to d_{model}$ = $8d_{model}^2$ weights.
- => one Transformer layer $\approx12\,d_{model}^2$ parameters (ignoring biases, LayerNorm). Whole model $\approx12\,L\,d_{model}^2$ + embeddings.
- Example: $d_{model}=768$: $12\cdot768^2\approx7.08$M per layer.` },
      { h: 'Variants worth a line', body: String.raw`- **Multi-Query (MQA) / Grouped-Query Attention (GQA):** share $K,V$ across heads (LLaMA-2 70B uses GQA) - smaller KV cache, faster inference.
- **KV cache:** during generation store past keys/values so each new token costs $O(n)$ rather than recomputing.
- Encoder layer = MHA -> Add&Norm -> FFN -> Add&Norm. Decoder layer = masked MHA -> cross-attention -> FFN (each with residual + LayerNorm).` },
    ],
    formulas: [String.raw`\text{MHA}(Q,K,V)=\text{Concat}(\text{head}_1,\dots,\text{head}_h)W^O`, String.raw`d_k=d_v=d_{model}/h`, String.raw`\text{params}_{MHA}=4d_{model}^2\ (+4d_{model}\ \text{biases})`],
    tpls: [{
      q: 'A multi-head attention block has d_model = {d} and h = {h} heads (d_k = d_model/h). Each of W_Q, W_K, W_V, W_O is a {d}×{d} linear layer with bias. How many trainable parameters does the block have?',
      vars: [{ s: 'd', label: 'd_model', v: 512, min: 256, max: 1024, step: 256 }, { s: 'h', label: 'heads', v: 8, min: 4, max: 8, step: 4 }],
      derive: [{ s: 'dk', expr: 'd/h' }, { s: 'one', expr: 'd*d+d' }],
      expr: '4*one', dec: 0,
      steps: ['d_k = d_model / h = {d} / {h} = {dk}', 'One projection: {d}·{d} + {d} (bias) = {one}', 'Four projections (Q, K, V, O): 4 × {one} = {ans}'],
    }, {
      q: 'Approximately how many parameters (ignoring biases and LayerNorm) does one Transformer layer have with d_model = {d} (multi-head attention 4d² plus FFN with inner size 4d: 8d²)?',
      vars: [{ s: 'd', label: 'd_model', v: 768, min: 256, max: 1024, step: 256 }],
      derive: [{ s: 'att', expr: '4*d^2' }, { s: 'ffn', expr: '8*d^2' }],
      expr: 'att+ffn', dec: 0,
      steps: ['Attention: 4·{d}² = {att}', 'FFN: 2·{d}·(4·{d}) = 8·{d}² = {ffn}', 'Total ≈ 12·{d}² = {ans}'],
    }],
    gem: 'Parameter count of multi-head attention or one Transformer layer from d_model, h and FFN inner size; or per-head dimension d_k = d_model/h and total concatenated dimension.',
    exam: [
      { m: 10, q: 'Explain multi-head attention. Why is it better than single-head attention? Give dimensions for the base Transformer.', a: 'Input is projected h times with different learned W_Q, W_K, W_V into dimension d_k=d_model/h; each head runs scaled dot-product attention; outputs are concatenated and multiplied by W_O. Different heads can attend to different positions/relations (syntax, coreference) in different representation subspaces; a single head averages them. Base Transformer: d_model=512, h=8, d_k=d_v=64, FFN 2048, 6+6 layers. Cost is similar to one full-dimension head.' },
      { m: 5, q: 'Compute parameters in multi-head attention (no biases) for d_model=512.', a: 'Four matrices of 512x512: 4 x 262,144 = 1,048,576 parameters (about 1.05M).' },
      { m: 5, q: 'What are MQA and GQA and why are they used?', a: 'Multi-query attention shares one K,V set among all query heads; grouped-query attention shares K,V within groups of heads. They shrink the KV cache and memory bandwidth during autoregressive decoding with small quality loss (used in LLaMA-2 70B).' },
    ],
    tips: ['Heads are slices of d_model - total projection cost is 4d², not 4d²·h.', 'Always mention concatenation then W_O.'],
  },
  {
    room: 4, tag: 'Module 3 · 3.1 Pretrained Models', title: 'GPT · BERT · T5 · LLaMA (+ Self-Study: AR vs AE)',
    chalk: ['GPT : decoder-only, causal LM  p(x)=Πₜ p(xₜ | x₍<ₜ₎)', 'BERT : encoder-only, masked LM (bidirectional)', 'T5 : encoder-decoder, text-to-text, span corruption', 'LLaMA : open decoder-only (RMSNorm, SwiGLU, RoPE)'],
    summary: 'Pretrained Transformers differ by architecture and objective: GPT (autoregressive decoder), BERT (masked encoder), T5 (encoder-decoder, text-to-text), LLaMA (efficient open decoder-only).',
    notes: [
      { h: 'Comparison (high-yield table)', body: String.raw`| | GPT | BERT | T5 | LLaMA |
|---|---|---|---|---|
| Org / year | OpenAI 2018- | Google 2018 | Google 2019 | Meta 2023 |
| Architecture | Decoder-only | Encoder-only | Encoder-decoder | Decoder-only |
| Attention | causal (left-to-right) | bidirectional | enc: bidirectional, dec: causal + cross | causal |
| Pre-training | next-token prediction | masked LM (+ NSP) | span corruption (text-to-text) | next-token prediction |
| Strength | open-ended generation, in-context learning | understanding: classification, NER, QA | any task as text -> text | strong quality per parameter, open weights |
| Sizes | GPT-1 117M, GPT-2 1.5B, GPT-3 175B | base 110M, large 340M | 60M-11B | 7B, 13B, 33B, 65B (v1); 7B-70B (v2) |` },
      { h: 'Details to remember', body: String.raw`- **GPT-3:** 96 layers, $d_{model}=12288$, 96 heads, 2048 context, 175B params; **few-shot / in-context learning** without gradient updates. GPT-4: multimodal, undisclosed size.
- **BERT:** [CLS]/[SEP] tokens. **MLM:** choose 15% of tokens; of these 80% -> [MASK], 10% -> random token, 10% unchanged. **NSP** (next-sentence prediction). BERT-base: 12 layers, 768 hidden, 12 heads. Fine-tune with a small task head. Not a natural text generator.
- **T5:** every task framed as text-to-text with a prefix ("translate English to German: ..."). Pre-trained on **C4** with **span corruption** (dropped spans replaced by sentinel tokens).
- **LLaMA:** pre-normalisation with **RMSNorm**, **SwiGLU** activation, **rotary position embeddings (RoPE)**, trained on 1-1.4T public tokens (v1), 2T (v2, 4K context, GQA in 70B). Open weights enabled a large fine-tuning ecosystem (Alpaca, Vicuna...).
- **Scaling laws:** loss falls as power laws in parameters, data and compute; Chinchilla: scale tokens ~ proportional to parameters (~20 tokens/param).` },
      { h: 'Self-study: Auto-regressive vs Auto-encoding models', body: String.raw`**Auto-regressive (AR):** factorise by the chain rule $p(x)=\prod_{t=1}^{T}p(x_t\mid x_{<t})$; trained with next-token cross-entropy; only past context (causal mask); naturally **generative** (GPT, PixelCNN, WaveNet, LLaMA). Drawback: sequential decoding is slow, errors accumulate (exposure bias).
**Auto-encoding (AE):** reconstruct corrupted input from the full context (denoising/masked objective) - **bidirectional**, great representations for understanding (BERT, RoBERTa), poor at free generation (needs iterative mask-predict). Plain/variational autoencoders also fit this family (reconstruct $x$ through a bottleneck).
**Seq2seq (encoder-decoder):** combine both (T5, BART). Perplexity applies to AR models; MLM accuracy to AE models.` },
    ],
    formulas: [String.raw`p(x)=\prod_{t=1}^{T}p(x_t\mid x_{<t})`, String.raw`\mathcal L_{MLM}=-\sum_{i\in M}\log p(x_i\mid x_{\setminus M})`, String.raw`\text{params}\approx12\,L\,d_{model}^2`],
    tpls: [{
      q: 'Estimate the parameters of the Transformer layers (12·L·d² rule, ignoring embeddings) of a model with L = {L} layers and d_model = {d}. Give the answer in millions.',
      vars: [{ s: 'L', label: 'layers', v: 12, min: 12, max: 48, step: 12 }, { s: 'd', label: 'd_model', v: 768, min: 768, max: 2048, step: 256 }],
      derive: [{ s: 'dd', expr: 'd^2' }],
      expr: '12*L*d^2/1e6', dec: 2, unit: 'million',
      steps: ['d² = {d}² = {dd}', 'Params ≈ 12 · L · d² = 12 · {L} · {dd}', 'Result = {ans} million (for BERT-base: ≈85M here + ≈24M embeddings ≈ 110M total)'],
    }, {
      q: 'BERT pre-training selects {r}% of the n = {n} tokens for prediction; 80% of the selected tokens are replaced by [MASK]. Expected number of tokens replaced by [MASK]?',
      vars: [{ s: 'r', label: 'mask %', v: 15, min: 10, max: 20, step: 5 }, { s: 'n', label: 'tokens n', v: 512, min: 128, max: 512, step: 128 }],
      derive: [{ s: 'sel', expr: 'n*r/100' }],
      expr: 'sel*0.8', dec: 2,
      steps: ['Selected tokens = {n} × {r}/100 = {sel}', '[MASK] replacements = 0.8 × {sel} = {ans}'],
    }, {
      q: 'An autoregressive model gives p(w₁) = {p1}, p(w₂|w₁) = {p2}, p(w₃|w₁,w₂) = {p3}, p(w₄|w₁..w₃) = {p4}. What is the probability of the 4-token sentence?',
      vars: [{ s: 'p1', label: 'p(w₁)', v: 0.2, min: 0.1, max: 0.5, step: 0.1 }, { s: 'p2', label: 'p(w₂|·)', v: 0.5, min: 0.2, max: 0.8, step: 0.1 }, { s: 'p3', label: 'p(w₃|·)', v: 0.6, min: 0.2, max: 0.9, step: 0.1 }, { s: 'p4', label: 'p(w₄|·)', v: 0.9, min: 0.3, max: 0.9, step: 0.1 }],
      expr: 'p1*p2*p3*p4', dec: 5,
      steps: ['Chain rule: P = Π p(wₜ | w₍<ₜ₎)', 'P = {p1} × {p2} × {p3} × {p4} = {ans}'],
    }],
    gem: 'Parameter estimate 12*L*d^2 for GPT/BERT-like models, BERT masking counts (15%, 80/10/10), or the chain-rule probability of a sentence under an autoregressive model.',
    exam: [
      { m: 10, q: 'Compare GPT, BERT and T5 in terms of architecture, pre-training objective and typical applications.', a: 'GPT: decoder-only Transformer with causal attention, next-token prediction, best for generation/in-context learning. BERT: encoder-only, bidirectional, masked LM (15% masking, 80/10/10) + NSP, best for understanding tasks (classification, NER, QA) after fine-tuning. T5: encoder-decoder, every task cast as text-to-text, pre-trained with span corruption on C4; handles translation, summarisation, QA with task prefixes.' },
      { m: 5, q: 'What architectural choices distinguish LLaMA from the original Transformer?', a: 'Decoder-only; pre-normalisation with RMSNorm; SwiGLU activation instead of ReLU/GELU FFN; rotary position embeddings (RoPE) instead of absolute encodings; no bias terms; GQA in larger LLaMA-2; trained on more tokens for a given size and released with open weights.' },
      { m: 5, q: 'Differentiate auto-regressive and auto-encoding language models with examples.', a: 'Auto-regressive: p(x)=prod p(x_t|x_<t), causal, unidirectional, generative (GPT, LLaMA). Auto-encoding: reconstruct masked/corrupted tokens using bidirectional context, good representations but not for open-ended generation (BERT, RoBERTa).' },
    ],
    tips: ['Learn the 15% / 80-10-10 rule exactly.', 'Remember BERT-base 110M, BERT-large 340M, GPT-3 175B.'],
  },
  {
    room: 4, tag: 'Module 3 · 3.1 Prompting & Fine-tuning', title: 'Prompt Engineering & Fine-Tuning LLMs',
    chalk: ['Zero-shot · Few-shot · Chain-of-Thought · ReAct', 'LoRA : W′ = W + (α/r)·B·A ,  B∈ℝ^{d×r}, A∈ℝ^{r×k}', 'RLHF : SFT → reward model → PPO (+KL penalty)'],
    summary: 'Adapt a pretrained LLM without changing it (prompting, RAG) or by training it (full fine-tuning, instruction tuning, RLHF, parameter-efficient methods like LoRA).',
    notes: [
      { h: 'Prompt engineering techniques', body: String.raw`A good prompt = **role/instruction + context + input + output format (+ examples)**.
- **Zero-shot:** instruction only. **Few-shot / in-context learning:** add $k$ input-output examples (no weight update).
- **Chain-of-Thought (CoT):** show/ask for intermediate reasoning ("Let's think step by step") - big gains on arithmetic and logic (Wei et al., 2022). **Self-consistency:** sample several CoT paths and take the majority answer.
- **ReAct:** interleave reasoning with tool/action calls. **Tree-of-Thought:** explore and evaluate multiple reasoning branches.
- **System/role prompts, delimiters, structured output (JSON), negative constraints, temperature/top-p control.**
- **RAG (Retrieval-Augmented Generation):** retrieve documents (vector search) and place them in the prompt to reduce hallucination and add fresh knowledge.
- Limits: context window, prompt sensitivity, prompt injection.` },
      { h: 'Fine-tuning methods', body: String.raw`1. **Full fine-tuning:** update all weights; best quality but expensive (optimizer states ~ $3$-$4\times$ model memory) and risks **catastrophic forgetting**.
2. **Instruction tuning (SFT):** supervised fine-tuning on (instruction, response) pairs (FLAN, Alpaca) -> follows instructions.
3. **RLHF** (InstructGPT/ChatGPT): (i) SFT; (ii) train a **reward model** on human preference rankings (Bradley-Terry); (iii) optimise the policy with **PPO** with a KL penalty to the SFT model. **DPO** optimises preferences directly without a reward model/RL loop.
4. **Parameter-efficient fine-tuning (PEFT):** freeze base model, train few parameters - **adapters**, **prefix/prompt tuning**, **LoRA**, **QLoRA** (4-bit quantised base + LoRA).` },
      { h: 'LoRA in detail (Hu et al., 2021)', body: String.raw`For a frozen weight $W\in\mathbb R^{d\times k}$ learn a low-rank update $\Delta W=\frac{\alpha}{r}BA$ with $B\in\mathbb R^{d\times r}$, $A\in\mathbb R^{r\times k}$, rank $r\ll\min(d,k)$.
- $A$ initialised Gaussian, $B=0$ -> $\Delta W=0$ at start. After training, merge: $W'=W+\Delta W$ (no inference latency).
- Trainable parameters per matrix $=r(d+k)$ versus $dk$ for full fine-tuning. For $d=k=4096$, $r=8$: $65{,}536$ vs $16{,}777{,}216$ = **0.39%**.
- Typically applied to attention projections ($W_Q,W_V$).` },
      { h: 'Choosing a strategy', body: String.raw`| Need | Use |
|---|---|
| Quick task change, no training | prompting / few-shot |
| Fresh or private knowledge | RAG |
| New style/format/skill, modest compute | LoRA / QLoRA |
| Align with human preference/safety | SFT + RLHF / DPO |
| Large data, maximal quality | full fine-tuning |` },
    ],
    formulas: [String.raw`W'=W+\frac{\alpha}{r}BA`, String.raw`\#\text{LoRA params}=r(d+k)`, String.raw`\max_\pi\ \mathbb E[R(x,y)]-\beta D_{KL}(\pi\|\pi_{ref})`],
    tpls: [{
      q: 'A weight matrix W is {d} × {k}. LoRA with rank r = {r} trains A ({r}×{k}) and B ({d}×{r}). What percentage of the parameters of W does LoRA train?',
      vars: [{ s: 'd', label: 'd', v: 4096, min: 1024, max: 4096, step: 1024 }, { s: 'k', label: 'k', v: 4096, min: 1024, max: 4096, step: 1024 }, { s: 'r', label: 'rank r', v: 8, min: 4, max: 32, step: 4 }],
      derive: [{ s: 'lo', expr: 'r*(d+k)' }, { s: 'fu', expr: 'd*k' }],
      expr: '100*lo/fu', dec: 4, unit: '%',
      steps: ['LoRA params = r(d + k) = {r}·({d} + {k}) = {lo}', 'Full params = d·k = {fu}', 'Fraction = {lo} / {fu} × 100 = {ans} %'],
    }, {
      q: 'LoRA with rank r = {r} is applied to a {d} × {k} matrix. How many trainable parameters does the adapter have?',
      vars: [{ s: 'd', label: 'd', v: 4096, min: 1024, max: 4096, step: 1024 }, { s: 'k', label: 'k', v: 4096, min: 1024, max: 4096, step: 1024 }, { s: 'r', label: 'rank r', v: 8, min: 4, max: 32, step: 4 }],
      expr: 'r*(d+k)', dec: 0,
      steps: ['A has r·k = {r}·{k} parameters; B has d·r = {d}·{r}', 'Total = r(d + k) = {ans}'],
    }],
    gem: 'LoRA trainable parameter count or percentage for given d, k, r; few-shot prompt token budgets; or number of trainable parameters in adapter layers.',
    exam: [
      { m: 10, q: 'Explain prompt engineering techniques for LLMs (zero-shot, few-shot, chain-of-thought, RAG) with examples.', a: 'Zero-shot: instruction only ("Translate to French: ..."). Few-shot: add k input-output examples so the model infers the pattern via in-context learning. CoT: include or elicit step-by-step reasoning ("Let us think step by step"), improving multi-step reasoning; self-consistency votes over sampled chains. RAG: retrieve relevant documents via embeddings/vector search and insert them in the prompt for grounded, up-to-date answers. Also role prompts, output-format constraints and temperature control.' },
      { m: 10, q: 'Describe the RLHF pipeline and LoRA fine-tuning. Compare them with full fine-tuning.', a: 'RLHF: SFT on demonstrations -> train reward model from human pairwise preferences -> optimise policy with PPO plus KL penalty to the SFT model (DPO is a simpler alternative). LoRA: freeze W, learn low-rank update (alpha/r)BA with r<<d, adding r(d+k) trainable parameters (e.g., 0.39% for d=k=4096, r=8), mergeable at inference. Full fine-tuning updates all weights: best capacity but heavy memory, storage per task and forgetting risk.' },
      { m: 5, q: 'What is catastrophic forgetting and how do PEFT methods help?', a: 'Fine-tuning all weights on a narrow dataset overwrites general knowledge. PEFT keeps the base weights frozen and trains a small set of extra parameters, preserving pretrained abilities and allowing one base model with many small task-specific adapters.' },
    ],
    tips: ['LoRA numerical: r(d+k) vs d·k - do it in two lines.', 'RLHF has THREE stages: SFT, reward model, PPO.'],
  },
];
