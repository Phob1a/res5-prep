import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countByPart, mergeQuestions, selectMockPool } from '../js/content-loader.js';

const q = (id, part, status) => ({ id, part, status, stem: 's' });

test('countByPart excludes retired; reviewedOnly counts only reviewed', () => {
  const qs = [q('a', 1, 'reviewed'), q('b', 1, 'draft'), q('c', 1, 'retired'), q('d', 2, 'reviewed')];
  assert.deepEqual(countByPart(qs), { 1: 2, 2: 1 });                      // draft counted, retired excluded
  assert.deepEqual(countByPart(qs, { reviewedOnly: true }), { 1: 1, 2: 1 }); // only reviewed
});

test('mergeQuestions: new ids added', () => {
  const r = mergeQuestions([q('a', 1, 'draft')], [q('b', 1, 'draft')]);
  assert.equal(r.added, 1); assert.equal(r.updated, 0); assert.equal(r.questions.length, 2);
});

test('mergeQuestions: identical id+content skipped', () => {
  const r = mergeQuestions([q('a', 1, 'draft')], [q('a', 1, 'draft')]);
  assert.equal(r.skipped, 1); assert.equal(r.added, 0);
});

test('mergeQuestions: same id different content is a conflict, NOT overwritten by default', () => {
  const r = mergeQuestions([{ ...q('a', 1, 'draft'), stem: 'old' }], [{ ...q('a', 1, 'draft'), stem: 'new' }]);
  assert.deepEqual(r.conflicts, ['a']);
  assert.equal(r.updated, 0);
  assert.equal(r.questions.find(x => x.id === 'a').stem, 'old'); // 未覆盖
});

test('mergeQuestions: overwriteConflicts:true applies updates', () => {
  const r = mergeQuestions([{ ...q('a', 1, 'draft'), stem: 'old' }], [{ ...q('a', 1, 'draft'), stem: 'new' }], { overwriteConflicts: true });
  assert.deepEqual(r.conflicts, ['a']);
  assert.equal(r.updated, 1);
  assert.equal(r.questions.find(x => x.id === 'a').stem, 'new');
});

test('mergeQuestions: nested options change is a conflict, NOT skipped (deep stable compare)', () => {
  const base = { id: 'a', part: 1, status: 'draft', stem: 's', options: { A: 'a', B: 'b', C: 'c', D: 'd' } };
  const changed = { ...base, options: { A: 'CHANGED', B: 'b', C: 'c', D: 'd' } };
  const r = mergeQuestions([base], [changed]);
  assert.deepEqual(r.conflicts, ['a']);
  assert.equal(r.skipped, 0);
});

test('selectMockPool: official → only reviewed; full-length/mini → all non-retired', () => {
  const qs = [q('a', 1, 'reviewed'), q('b', 1, 'draft'), q('c', 1, 'retired')];
  assert.deepEqual(selectMockPool(qs, 'official').map(x => x.id), ['a']);
  assert.deepEqual(selectMockPool(qs, 'full-length').map(x => x.id), ['a', 'b']);
  assert.deepEqual(selectMockPool(qs, 'mini').map(x => x.id), ['a', 'b']);
});

test('selectMockPool: official pool never contains a draft', () => {
  const qs = [q('a', 1, 'reviewed'), q('b', 2, 'reviewed'), q('c', 1, 'draft')];
  assert.ok(selectMockPool(qs, 'official').every(x => x.status === 'reviewed'));
});
