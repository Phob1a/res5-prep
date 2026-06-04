import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SCHEMA_VERSION, NS, defaultState, migrate, serialize, deserialize } from '../js/store-core.js';

test('namespace and version constants', () => {
  assert.equal(NS, 'res5:v1:');
  assert.equal(SCHEMA_VERSION, 1);
});

test('defaultState shape', () => {
  const s = defaultState();
  assert.deepEqual(s.wrongbook, []);
  assert.deepEqual(s.examHistory, []);
  assert.deepEqual(s.flashcardMastery, {});
  assert.equal(s.schemaVersion, 1);
});

test('migrate fills missing fields and stamps version', () => {
  const s = migrate({ wrongbook: ['q1'] });
  assert.deepEqual(s.wrongbook, ['q1']);
  assert.deepEqual(s.examHistory, []);
  assert.equal(s.schemaVersion, 1);
});

test('export/import round-trips', () => {
  const s = defaultState(); s.wrongbook.push('q-s05-001');
  assert.deepEqual(deserialize(serialize(s)).wrongbook, ['q-s05-001']);
});

test('deserialize rejects malformed json with clear error', () => {
  assert.throws(() => deserialize('{not json'), /invalid progress file/i);
});
