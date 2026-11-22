# GenAI Academy

GenAI Academy is a browser-based, walkable 3D school for studying a Generative AI syllabus. Explore a school campus, visit six topic-focused classrooms, and interact with 24 boards. Each board combines a worked example, deeper notes and formulas, numerical practice, and exam-style questions.

The project is designed as a self-study and revision aid. Its mock paper and study plan are illustrative, not an official university assessment scheme.

## What you can do

- Walk through a procedurally built 3D school, courtyard, and sports field.
- Enter six classrooms, each with four interactive topic boards.
- Read board summaries, in-depth notes, equations, worked examples, and exam tips.
- Practice editable numerical problems and see the answer and solution steps update from the values you enter.
- Generate a new practice sum with Gemini (optional), or use the built-in randomized question bank.
- Open the Exam Hub for a school map, board progress, revision strategy, a generated mock paper, a timer, and a consolidated formula sheet.
- Track board visits, practice attempts, and correct answers in browser local storage.

## The 3D school

The school is built at runtime with Three.js. Its meshes use Three.js geometry and procedural materials/textures rather than imported 3D model files. The scene includes:

- A six-room school building with doors, a central corridor, classroom floors, ceilings, windows, lighting, and shadows.
- A gate and entrance, outdoor paths, grass, trees, hedges, lamps, benches, a flag, and a school bus.
- An outdoor playground and a sports field with a court, goals, and bleachers.
- Classroom desks, chairs, notebooks, a teacher's desk, bookshelves, plants, clocks, teacher/student figures, and four chalkboards per room.
- Animated clouds, flag, swings, and student figures; the classroom clocks follow the current local time.
- A first-person camera, mouse look, walking/running controls, collision handling, a crosshair, and a prompt when a board is in reach.

Aim at a board and interact to open its study panel. Board content is presented as an HTML overlay over the 3D scene; it is not drawn as navigable 3D text. The 3D scene pauses while a study or exam panel is open.

## Syllabus and study rooms

The content is organized around four main modules. The hours below are the project's stated syllabus allocation, not measured play time.

| Module | Stated hours | Rooms | Main coverage |
|---|---:|---|---|
| 1. Fundamentals of Generative AI | 6 | 1 | Definitions, evolution, applications, model families, probability distributions, latent spaces, and sampling |
| 2. Deep Generative Models | 8 | 2-3 | Variational autoencoders (VAEs), KL divergence, ELBO, training, GANs, training challenges, Wasserstein GANs, and GAN variants |
| 3. Generative Transformers and Large Models | 8 | 4-5 | Attention, pretrained language models, prompting and fine-tuning, diffusion, DDPM, and Stable Diffusion |
| 4. Applications and Ethical Considerations | 6 | 6 | Text, image/video, and code generation; deepfakes; bias, fairness, and responsible AI |
| Self-study topics | 4 | Distributed in related notes | Autoregressive and autoencoding models, AI music, careers, research directions, and additional bias/fairness discussion |

### Room 1 - Fundamentals of Generative AI

1. **What is Generative AI?** Definitions, history, discriminative versus generative modeling, and applications.
2. **VAE, GAN, Transformer, and Diffusion overview.** The major model families and what distinguishes their approaches to generation.
3. **Gaussian and multimodal distributions.** Probability distributions and the role of distribution shape in modeling data.
4. **Latent space and sampling techniques.** Latent representations, sampling, and how random variables can produce new samples.

### Room 2 - Variational Autoencoders

1. **Latent Variables and Autoencoders.** Encoders and decoders, latent-variable models, approximate posteriors, and the difference between an autoencoder and a VAE.
2. **KL Divergence.** Definition, properties, Gaussian and discrete examples, and the VAE regularization term.
3. **ELBO (Evidence Lower Bound).** The Jensen-based derivation, the exact gap to log likelihood, reconstruction/KL trade-offs, and beta-VAEs.
4. **Training VAEs (PyTorch / TensorFlow).** Reparameterization, the training loop, reconstruction and KL losses, posterior collapse, and practical implementation notes.

### Room 3 - Generative Adversarial Networks

1. **GAN architecture: generator versus discriminator.** The minimax objective and the roles of the two networks.
2. **Training challenges.** Mode collapse, vanishing gradients, and common causes and remedies.
3. **Wasserstein GAN and gradient penalty.** Earth-Mover distance intuition, the Lipschitz constraint, and WGAN-GP.
4. **GAN variants.** DCGAN, StyleGAN, and CycleGAN, including their typical design goals and use cases.

### Room 4 - Transformers and Large Models

1. **Self-attention mechanism.** Queries, keys, values, scaled dot-product attention, and why attention is scaled.
2. **Multi-head attention.** Parallel attention heads, dimensions, and combining head outputs.
3. **GPT, BERT, T5, and LLaMA.** Model-family comparisons, pretraining objectives, and an introduction to autoregressive versus autoencoding models.
4. **Prompt engineering and fine-tuning.** Prompting approaches, parameter-efficient fine-tuning, and related large-language-model techniques.

### Room 5 - Diffusion Models

1. **DDPM forward/noising process.** The noise schedule and the forward process that gradually corrupts data.
2. **Reverse process, training loss, and sampling.** Noise prediction, the training objective, and the iterative generation process.
3. **Stable Diffusion.** Latent diffusion, CLIP text conditioning, and classifier-free guidance (CFG).
4. **Midjourney, DDIM, and the image-generation landscape.** A high-level comparison of image-generation systems and faster sampling.

### Room 6 - Applications, Ethics, and Self-Study

1. **Text generation and evaluation.** Conversational systems, language-model use cases, and evaluation concepts.
2. **Image/video synthesis, deepfakes, AI art, and AI music.** Media generation, synthetic media risks, and the self-study topic of AI music.
3. **Generative AI for code.** Code-generation tools, capabilities, and considerations.
4. **Ethics, bias, fairness, responsible AI, and careers.** Risks, responsible-use practices, bias/fairness, and self-study directions for careers and research.

Each board has a short chalkboard summary and example, plus a **Learn in depth** view with topic-specific notes, formulas, tips, and one or more exam questions. Board content and question banks are authored in the source files under [`src/content/`](src/content/).

## Learning and assessment tools

### Board study panel

Every board has four tabs:

- **Worked example** - the board's chalk lines, key formulas, and a worked numerical example with steps.
- **Learn in depth** - explanations, equations, tables or code examples where applicable, and exam tips.
- **Practice** - a question, editable values, answer checking, hints, and a step-by-step solution.
- **Exam Q&A** - topic-specific short and long questions with model answers.

Visited, attempted, and solved counts are displayed in the board UI and Exam Hub.

### Numerical practice

Board question templates define variables, derived values, an answer expression, units, and solution steps. The app evaluates those expressions with a small recursive-descent expression parser rather than JavaScript `eval`. Editing a valid input recomputes the solution immediately. Answers are checked with a small tolerance to accommodate rounding.

Use **Try a new sum** to select a randomized built-in template or request a new question from Gemini. If Gemini is not configured, the built-in generator remains available. The AI-generated output is validated and evaluated by the same local expression system before it is used.

### Exam Hub

Press **M** while walking, or use the Exam Hub button from a board, to open:

- **Map & progress** - room/board progress, direct board access, and teleport shortcuts.
- **Exam strategy** - a suggested study plan, topic priorities, answer-writing guidance, and time management.
- **Mock paper** - a newly assembled paper with Section A (8 questions worth 5 marks each) and Section B (6 questions worth 10 marks each), model answers, and an optional three-hour timer.
- **Formula sheet** - formulas grouped by classroom and board.

The mock paper is assembled from the local question bank. Its structure and the study strategy are revision aids only; check your course's official syllabus, exam pattern, and marking scheme.

## Getting started

### Requirements

- Node.js and npm.
- A modern desktop browser with WebGL enabled. The experience is designed around a keyboard and mouse; pointer lock is used for first-person mouse look.

### Install and run

```bash
npm install
npm run dev
```

Vite prints the local development URL (normally `http://localhost:5173`). Open it in your browser and choose **Enter the school**.

### Optional Gemini setup

Gemini is optional; the application works without an API key.

1. Copy `.env.example` to `.env`.
2. Add your Gemini API key to `VITE_GEMINI_API_KEY`.
3. Optionally set `VITE_GEMINI_MODEL` (the current default is `gemini-2.5-flash`).
4. Restart the Vite development server.

```dotenv
VITE_GEMINI_API_KEY=your-key-here
VITE_GEMINI_MODEL=gemini-2.5-flash
```

**API key warning:** Vite's `VITE_` variables are included in browser-delivered code. A key configured this way can be extracted by anyone who can access the deployed app. This setup is suitable only for local/personal use with appropriate key restrictions. Do not commit `.env` or use a personal key in a public deployment. For a public service, call Gemini from a server-side endpoint that protects and rate-limits the key.

## Controls

| Input | Action |
|---|---|
| **W / A / S / D** | Move forward, left, backward, and right |
| **Arrow keys** | Move forward/backward or turn left/right |
| **Mouse** | Look around while pointer lock is active |
| **Shift** | Run |
| **E** | Open the board currently under the crosshair |
| **Click** | Enter/resume mouse look; click an aimed-at board to open it |
| **M** | Open the Exam Hub |
| **Esc** | Close an open panel or release mouse control |

The intro screen asks for a click before the school starts. If mouse control has been released, click the scene to resume.

## Progress and data

Progress is stored locally in the browser's `localStorage` under the key `genai-school-v1`. It records visited boards, practice attempts, and correct answers. It is not an account, is not synchronized to a server, and will not automatically follow you to another browser or device. The Exam Hub includes a reset-progress action.

No separate backend or database is required for the local learning experience. With Gemini enabled, the browser makes requests to Google's Generative Language API.

## Technology

- **Three.js** for the real-time 3D school, rendering, lighting, camera, interaction raycasting, and animation.
- **Vite** for local development and production bundling.
- **KaTeX** for rendering mathematical notation in the study panels.
- **Browser Canvas API** for procedural textures and scene signage.
- **Gemini API** for optional generation of new practice questions.
- Plain JavaScript modules and CSS for lesson content, UI, and app logic.

## Project layout

```text
.
├── index.html              # Page shell, intro screen, HUD, and scene canvas
├── src/
│   ├── main.js             # Renderer, player controls, interaction, and render loop
│   ├── world.js            # School building, rooms, and collision geometry
│   ├── scenery.js          # Campus, outdoor environment, and animations
│   ├── props.js            # Classrooms, boards, furniture, and figures
│   ├── content/            # Syllabus modules and 24 board lesson/question definitions
│   ├── ui.js               # Board panels, practice UI, progress map, and Exam Hub
│   ├── solver.js           # Safe expression parser and numerical problem evaluation
│   ├── gemini.js           # Optional Gemini question generation and validation
│   ├── exam.js             # Mock-paper assembly and exam strategy text
│   ├── store.js            # Local progress persistence
│   ├── rich.js             # Markdown-like formatting and KaTeX rendering
│   ├── mii.js              # Procedural teacher/student figures and animation
│   ├── util.js             # Shared geometry, material, texture, and random helpers
│   └── styles.css          # HUD, intro screen, study panels, and responsive layout
├── .env.example            # Optional Gemini configuration template
├── package.json            # Dependencies and npm scripts
└── vite.config.js          # Vite build configuration
```

## Available scripts

```bash
npm run dev       # Start the Vite development server
npm run build     # Build the production bundle into dist/
npm run preview   # Serve the production bundle locally
```

## Notes and limitations

- The lesson and exam material is a study aid, not a substitute for course materials or instructor guidance.
- Gemini output can be inaccurate. Review generated questions and solutions rather than treating them as authoritative.
- Gemini is only used for generating practice sums; the board notes, formula sheet, and exam question bank are local project content.
- The project uses a first-person desktop interaction model. Touch/mobile controls are not provided.
- Progress is browser-local and can be cleared with browser storage.
