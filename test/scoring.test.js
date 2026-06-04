import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canRunFullMock, gradeExam, FULL_MOCK } from '../js/scoring.js';

test('FULL_MOCK thresholds match official spec', () => {
  assert.deepEqual(FULL_MOCK, { part1Count: 110, part1Pass: 0.75, part2Count: 40, part2Pass: 0.80 });
});

test('canRunFullMock requires >=110 part1 and >=40 part2', () => {
  assert.equal(canRunFullMock({ 1: 110, 2: 40 }), true);
  assert.equal(canRunFullMock({ 1: 109, 2: 40 }), false);
  assert.equal(canRunFullMock({ 1: 110, 2: 39 }), false);
});

test('official grade PASS only when both parts meet threshold', () => {
  const g = gradeExam({ part1: { correct: 90, total: 110 }, part2: { correct: 34, total: 40 } }, { official: true });
  assert.equal(g.part1.pass, true);   // .818 >= .75
  assert.equal(g.part2.pass, true);   // .85 >= .80
  assert.equal(g.overallPass, true);
});

test('official grade FAIL if one part below threshold', () => {
  const g = gradeExam({ part1: { correct: 90, total: 110 }, part2: { correct: 31, total: 40 } }, { official: true });
  assert.equal(g.part2.pass, false);  // .775 < .80
  assert.equal(g.overallPass, false);
});

test('non-official (full-length practice / mini) never returns pass/fail', () => {
  const g = gradeExam({ part1: { correct: 108, total: 110 }, part2: { correct: 39, total: 40 } }, { official: false });
  assert.equal(g.overallPass, null);
  assert.equal(g.part1.pass, null);
  assert.equal(g.part2.pass, null);
});
