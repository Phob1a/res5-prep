export const SCHEMA_VERSION = 1;
export const NS = 'res5:v1:';

export function defaultState() {
  return { schemaVersion: SCHEMA_VERSION, wrongbook: [], examHistory: [], flashcardMastery: {}, answerLog: {} };
}
export function migrate(state) {
  const merged = { ...defaultState(), ...(state || {}) };
  merged.schemaVersion = SCHEMA_VERSION;
  return merged;
}
export function serialize(state) { return JSON.stringify({ ...state, schemaVersion: SCHEMA_VERSION }, null, 2); }
export function deserialize(json) {
  let parsed;
  try { parsed = JSON.parse(json); } catch { throw new Error('invalid progress file: not valid JSON'); }
  if (typeof parsed !== 'object' || parsed === null) throw new Error('invalid progress file: expected object');
  return migrate(parsed);
}
