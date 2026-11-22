const KEY = 'genai-school-v1';
let data = { visited: {}, solved: {}, tried: {} };
try { data = { ...data, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch (e) { /* storage may be unavailable */ }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* ignore */ } };
export const store = {
  visit: (id) => { data.visited[id] = true; save(); },
  isVisited: (id) => !!data.visited[id],
  visitedCount: () => Object.keys(data.visited).length,
  tried: (id) => { data.tried[id] = (data.tried[id] || 0) + 1; save(); },
  solve: (id) => { data.solved[id] = (data.solved[id] || 0) + 1; save(); },
  solvedCount: (id) => data.solved[id] || 0,
  triedCount: (id) => data.tried[id] || 0,
  totalSolved: () => Object.values(data.solved).reduce((a, b) => a + b, 0),
  reset: () => { data = { visited: {}, solved: {}, tried: {} }; save(); },
};
