import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  addSciWrong,
  clearSciWrong,
  gradeSciExam,
  removeSciWrong,
} from '../js/sci-session.js';
import { defaultState, migrate } from '../js/store-core.js';

const questions = [
  { id: 'sci-q-001', answer: 'A', part: 1 },
  { id: 'sci-q-002', answer: 'C', part: 1 },
  { id: 'sci-q-003', answer: 'D', part: 2 },
];

test('gradeSciExam returns score and per-question rows', () => {
  const result = gradeSciExam(questions, { 'sci-q-001': 'A', 'sci-q-002': 'B' });
  assert.equal(result.total, 3);
  assert.equal(result.correct, 1);
  assert.equal(result.rate, 1 / 3);
  assert.deepEqual(result.rows.map(r => [r.id, r.chosen, r.correct, r.isCorrect]), [
    ['sci-q-001', 'A', 'A', true],
    ['sci-q-002', 'B', 'C', false],
    ['sci-q-003', '', 'D', false],
  ]);
});

test('SCI wrongbook helpers add uniquely, remove, and clear', () => {
  let state = defaultState();
  state = addSciWrong(state, 'sci-q-002');
  state = addSciWrong(state, 'sci-q-002');
  state = addSciWrong(state, 'sci-q-003');
  assert.deepEqual(state.sciWrongbook, ['sci-q-002', 'sci-q-003']);

  state = removeSciWrong(state, 'sci-q-002');
  assert.deepEqual(state.sciWrongbook, ['sci-q-003']);

  state = clearSciWrong(state);
  assert.deepEqual(state.sciWrongbook, []);
});

test('store migration includes SCI wrongbook and SCI exam history', () => {
  const migrated = migrate({ wrongbook: ['q-s01-001'] });
  assert.deepEqual(migrated.wrongbook, ['q-s01-001']);
  assert.deepEqual(migrated.sciWrongbook, []);
  assert.deepEqual(migrated.sciExamHistory, []);
});
