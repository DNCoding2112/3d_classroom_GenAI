# GenAI Academy - walkable 3D school for the Generative AI syllabus

Run:
```
npm install
# put your key in .env  ->  VITE_GEMINI_API_KEY=xxxx   (optional: VITE_GEMINI_MODEL=gemini-2.5-flash)
npm run dev        # http://localhost:5173
```
Controls: WASD move · mouse look · Shift run · E / click = open the board you aim at · M = Exam Hub (map, strategy, mock paper, formula sheet) · Esc = close panel.

- 6 classrooms x 4 chalkboards = 24 boards (src/content/room1..6.js), every 3D object is Three.js geometry (no model/texture files).
- Practice tab: "Try a new sum" asks Gemini for JSON (src/gemini.js). Without a key a built-in randomised generator is used.
  Sums are templates with {symbols}; edit any value and the answer/solution recompute (src/solver.js, safe expression parser).
- The Gemini key is bundled into client code (fine for personal use; do not deploy publicly with it).
