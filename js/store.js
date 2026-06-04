import { NS, defaultState, migrate, serialize, deserialize } from './store-core.js';
const KEY = NS + 'state';
export function loadState() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return defaultState();
  try { return migrate(JSON.parse(raw)); } catch { return defaultState(); }
}
export function saveState(state) { localStorage.setItem(KEY, JSON.stringify(state)); }
export function exportProgress() { return serialize(loadState()); }
export function importProgress(json) { const s = deserialize(json); saveState(s); return s; }
