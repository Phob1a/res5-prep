import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  classifySciQuestion,
  formatKnowledgePoint,
  loadSciContent,
  toSciQuestion,
} from '../js/sci-data.js';

const raw = {
  number: 82,
  question: 'Which of the following is the mission of the Monetary Authority of Singapore?',
  options: [
    { letter: 'A', text: 'Promote and sustain economic growth.', is_correct: true },
    { letter: 'B', text: 'Regulate and control the financial sector.', is_correct: false },
    { letter: 'C', text: 'Manage Singapore’s foreign reserves and assets.', is_correct: false },
    { letter: 'D', text: 'Conduct surveillance of Singapore’s financial stability.', is_correct: false },
  ],
  correct_letter: 'A',
  correct_answer: 'Promote and sustain economic growth.',
  html5url: 'html5/data/js/5xMMTefrr81.js',
};

test('classifySciQuestion assigns part and valid syllabus item from source order and keywords', () => {
  assert.deepEqual(classifySciQuestion(raw), { part: 1, syllabusItemId: 's01' });
  assert.deepEqual(classifySciQuestion({ number: 1, question: 'Which ethical course of action is difficult?' }), { part: 2, syllabusItemId: 's16' });
  assert.deepEqual(classifySciQuestion({ number: 300, question: 'Which of the following regarding his CPF contribution is CORRECT?' }), { part: 1, syllabusItemId: 's13' });
});

test('toSciQuestion converts extracted question into bilingual study shape', () => {
  const q = toSciQuestion(raw);
  assert.equal(q.id, 'sci-q-082');
  assert.equal(q.part, 1);
  assert.equal(q.syllabusItemId, 's01');
  assert.equal(q.stemEn, raw.question);
  assert.match(q.stemZh, /学习辅助翻译/);
  assert.match(q.stemZh, /以下哪一项是|新加坡金融管理局/);
  assert.deepEqual(Object.keys(q.optionsEn), ['A', 'B', 'C', 'D']);
  assert.match(q.optionsZh.A, /促进并维持经济增长/);
  assert.equal(q.answer, 'A');
  assert.match(q.knowledgePoint, /s01/);
  assert.match(q.pitfall, /易错/);
  assert.match(q.sourceRef, /SCI RES5/);
});

test('formatKnowledgePoint uses syllabus metadata', () => {
  const s = formatKnowledgePoint('s13');
  assert.match(s, /s13/);
  assert.match(s, /Central Provident Fund/);
});

test('loadSciContent fetches content/sci/questions.json', async () => {
  const calls = [];
  const fetchFn = async (url) => {
    calls.push(url);
    return { ok: true, json: async () => [{ id: 'sci-q-001', part: 2 }] };
  };
  const got = await loadSciContent(fetchFn);
  assert.deepEqual(calls, ['content/sci/questions.json']);
  assert.deepEqual(got, [{ id: 'sci-q-001', part: 2 }]);
});
