import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateSciContent, DEFAULT_QUESTIONS_PATH } from '../scripts/validate-sci-content.js';

const baseQuestion = () => ({
  id: 'sci-q-001',
  answer: 'B',
  explanation: {
    basis: '这道题考察的是道德行为（Ethical Behavior）。',
    correctReason: '亚里士多德强调实践判断，因此最符合题干。',
    optionAnalysis: {
      A: 'A 错在：苏格拉底侧重追问美德，不是本题所指来源。',
      B: 'B 正确：亚里士多德强调情境中的实践判断。',
      C: 'C 错在：康德侧重义务与道德法则，不是本题来源。',
      D: 'D 错在：密尔侧重功利与结果，不是本题来源。',
    },
    finalAnswer: 'B',
  },
});

test('real questions.json passes the M1-M4 gate', () => {
  const questions = JSON.parse(fs.readFileSync(DEFAULT_QUESTIONS_PATH, 'utf8'));
  const { errors } = validateSciContent(questions);
  assert.deepEqual(errors, [], `gate violations:\n${errors.join('\n')}`);
});

test('M1 catches hard echo phrasing', () => {
  const q = baseQuestion();
  q.explanation.correctReason = '本题给定答案对应 3 个工作日。';
  const { errors } = validateSciContent([q]);
  assert.ok(errors.some(e => e.includes('[M1]')));
});

test('M1 does NOT flag a normal concluding sentence', () => {
  const q = baseQuestion();
  q.explanation.correctReason = '亚里士多德强调实践判断，所以答案选 B。';
  const { errors } = validateSciContent([q]);
  assert.equal(errors.length, 0);
});

test('M2 catches nested parens and doubled quotes', () => {
  const q = baseQuestion();
  q.explanation.basis = '这道题考察的是终身入息计划（终身入息计划（CPF LIFE））。';
  const { errors } = validateSciContent([q]);
  assert.ok(errors.some(e => e.includes('[M2]')));
});

test('M3 catches pure boilerplate on a wrong option', () => {
  const q = baseQuestion();
  q.explanation.optionAnalysis.A = 'A 错在：该选项不符合题干要求。';
  const { errors } = validateSciContent([q]);
  assert.ok(errors.some(e => e.includes('[M3]')));
});

test('M3 does NOT flag a specific reason that contains 题干', () => {
  const q = baseQuestion();
  q.explanation.optionAnalysis.A = 'A 错在：交易所交易基金属于交易所交易产品，不符合题干的非上市要求。';
  const { errors } = validateSciContent([q]);
  assert.equal(errors.length, 0);
});

test('M4 catches finalAnswer carrying option text', () => {
  const q = baseQuestion();
  q.explanation.finalAnswer = 'B. 利益冲突';
  const { errors } = validateSciContent([q]);
  assert.ok(errors.some(e => e.includes('[M4]')));
});
