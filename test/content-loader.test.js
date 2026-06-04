import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countByPart, mergeQuestions, selectMockPool, notesForItem, loadContent } from '../js/content-loader.js';

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

test('notesForItem filters by syllabusItemId, preserving order', () => {
  const notes = [
    { id: 'note-s05-a', syllabusItemId: 's05' },
    { id: 'note-s18-a', syllabusItemId: 's18' },
    { id: 'note-s05-b', syllabusItemId: 's05' },
  ];
  assert.deepEqual(notesForItem(notes, 's05').map(n => n.id), ['note-s05-a', 'note-s05-b']);
  assert.deepEqual(notesForItem(notes, 's99'), []);
});

// 注入 fetch:url → 响应。缺失映射的 url 视作 404(ok:false)。
function fakeFetch(map) {
  return (url) => {
    if (!(url in map)) return Promise.resolve({ ok: false, status: 404, json: () => Promise.reject(new Error('404')) });
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(map[url]) });
  };
}

test('loadContent: a bad notes/flashcards file is skipped and does NOT empty questions', async () => {
  const validCard = { id: 'fc-s05-001', part: 1, syllabusItemId: 's05', title: 'CDD', point: 'p', status: 'draft' };
  const validNote = { id: 'note-s05-x', part: 1, syllabusItemId: 's05', title: 'AML', sections: [{ heading: 'h', body: 'b' }], status: 'draft' };
  const map = {
    'content/index.json': { questions: ['s05.json'], flashcards: ['bad.json', 'good.json'], notes: ['good.json', 'missing.json'] },
    'content/questions/s05.json': [{ id: 'q-s05-001', part: 1 }],
    'content/flashcards/bad.json': [{ id: 'fc-s05-001' /* missing required title/point/syllabusItemId */ }],
    'content/flashcards/good.json': [validCard],
    'content/notes/good.json': [validNote],
    // content/notes/missing.json absent → 404
  };
  const warns = [];
  const orig = console.warn; console.warn = (...a) => warns.push(a);
  try {
    const { questions, flashcards, notes } = await loadContent(fakeFetch(map));
    assert.equal(questions.length, 1);            // questions untouched by notes/flashcards failures
    assert.deepEqual(flashcards.map(c => c.id), ['fc-s05-001']); // only the valid card kept
    assert.deepEqual(notes.map(n => n.id), ['note-s05-x']);      // only the valid note; 404 file skipped
  } finally { console.warn = orig; }
  assert.ok(warns.length >= 2); // bad flashcard file + missing notes file both warned
});

test('loadContent: missing notes key in old index.json is tolerated', async () => {
  const map = {
    'content/index.json': { questions: ['s05.json'], flashcards: [] }, // no notes key
    'content/questions/s05.json': [{ id: 'q-s05-001', part: 1 }],
  };
  const { questions, flashcards, notes } = await loadContent(fakeFetch(map));
  assert.equal(questions.length, 1);
  assert.deepEqual(flashcards, []);
  assert.deepEqual(notes, []);
});
