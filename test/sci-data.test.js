import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  classifySciQuestion,
  formatKnowledgePoint,
  loadSciContent,
  studyTranslate,
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
  const q = toSciQuestion(raw, {
    notesByItem: {
      s01: {
        summary: 'MAS promotes sustained non-inflationary economic growth and a sound financial centre.',
        sections: [
          {
            heading: 'MAS mission',
            body: 'The mission of the MAS includes promoting sustained non-inflationary economic growth and maintaining a sound and progressive financial centre.',
          },
        ],
        keyPoints: [
          'MAS mission: promote sustained non-inflationary economic growth / MAS 使命: 促进持续、非通胀式经济增长',
        ],
        sourceRef: 'RES5 Study Text Part I Ch.1',
      },
    },
  });
  assert.equal(q.id, 'sci-q-082');
  assert.equal(q.part, 1);
  assert.equal(q.syllabusItemId, 's01');
  assert.equal(q.stemEn, raw.question);
  assert.match(q.stemZh, /中文术语辅助/);
  assert.match(q.stemZh, /以下哪一项是|新加坡金融管理局/);
  assert.deepEqual(Object.keys(q.optionsEn), ['A', 'B', 'C', 'D']);
  assert.match(q.optionsZh.A, /促进并维持经济增长/);
  assert.equal(q.answer, 'A');
  assert.match(q.knowledgePoint, /s01/);
  assert.match(q.pitfall, /易错/);
  assert.equal(q.explanation.kind, 'learning-aid');
  assert.equal(q.explanation.disclaimer, undefined);
  assert.match(q.explanation.basis, /这道题考察的是/);
  assert.match(q.explanation.correctReason, /A/);
  assert.match(q.explanation.correctReason, /促进并维持经济增长/);
  assert.deepEqual(Object.keys(q.explanation.optionAnalysis), ['A', 'B', 'C', 'D']);
  assert.match(q.explanation.optionAnalysis.A, /正确/);
  assert.match(q.explanation.optionAnalysis.B, /错在/);
  assert.match(q.explanation.optionAnalysis.B, /监管并控制金融业/);
  assert.match(q.explanation.optionAnalysis.B, /促进并维持经济增长/);
  assert.equal(q.explanation.reviewChecklist, undefined);
  assert.match(q.explanation.finalAnswer, /A/);
  assert.match(q.sourceRef, /SCI RES5/);
});

test('wrong option analysis explains the issue in reverse questions', () => {
  const q = toSciQuestion({
    number: 12,
    question: 'Which of the following is NOT one of three motivations to act in the best interest of customers in the financial services industry?',
    options: [
      { letter: 'A', text: 'Moral.', is_correct: false },
      { letter: 'B', text: 'Affection.', is_correct: false },
      { letter: 'C', text: 'Self-interest.', is_correct: false },
      { letter: 'D', text: 'Machiavellianism.', is_correct: true },
    ],
    correct_letter: 'D',
    correct_answer: 'Machiavellianism.',
    html5url: 'html5/data/js/example.js',
  }, {
    notesByItem: {
      s14: {
        keyPoints: [
          '三种动机：自利、情感、道德；马基雅维利主义不是以客户最佳利益行事的动机。',
        ],
      },
    },
  });

  assert.match(q.explanation.optionAnalysis.A, /A 错在/);
  assert.match(q.explanation.optionAnalysis.A, /道德动机/);
  assert.match(q.explanation.optionAnalysis.A, /规则内|范围内|不是例外/);
  assert.match(q.explanation.optionAnalysis.D, /正确/);
  assert.match(q.explanation.optionAnalysis.D, /马基雅维利主义/);
});

test('scenario text containing not does not turn TRUE questions into reverse questions', () => {
  const q = toSciQuestion({
    number: 4,
    question: `Emma wants to bill clients for consultancy work, and not just on product sales.

Which of the following statements about Emma's action is TRUE?`,
    options: [
      { letter: 'A', text: 'She needs permission from the company she represents.', is_correct: true },
      { letter: 'B', text: 'She can proceed without permission.', is_correct: false },
      { letter: 'C', text: 'She is exempt from all conflict checks.', is_correct: false },
      { letter: 'D', text: 'She only needs client consent.', is_correct: false },
    ],
    correct_letter: 'A',
    correct_answer: 'She needs permission from the company she represents.',
    html5url: 'html5/data/js/example.js',
  });

  assert.match(q.explanation.optionAnalysis.B, /B 错在/);
  assert.doesNotMatch(q.explanation.optionAnalysis.B, /例外项/);
  assert.match(q.explanation.optionAnalysis.A, /正确/);
});

test('studyTranslate hides low-quality English passthroughs', () => {
  assert.equal(
    studyTranslate('Which one of the following violates the principle of professionalism in the financial services industry?'),
    ''
  );
  assert.match(
    studyTranslate('Which of the following has pointed out that deciding on what is the best ethical course of action for people living in society is difficult?'),
    /中文术语辅助/
  );
});

test('toSciQuestion uses full translation cache when available', () => {
  const q = toSciQuestion(raw, {
    translationsById: {
      'sci-q-082': {
        stem: '以下哪一项是新加坡金融管理局（MAS）的使命？',
        options: {
          A: '促进并维持经济增长。',
          B: '监管并控制金融业。',
          C: '管理新加坡的外汇储备和资产。',
          D: '监测新加坡的金融稳定。',
        },
      },
    },
  });
  assert.equal(q.stemZh, '以下哪一项是新加坡金融管理局（MAS）的使命？');
  assert.equal(q.optionsZh.A, '促进并维持经济增长。');
  assert.equal(q.optionsZh.D, '监测新加坡的金融稳定。');
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
