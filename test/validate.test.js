import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateQuestionObjects, normalizeCsvRow, validateFlashcardObjects, validateNoteObjects } from '../js/validate.js';

const goodObj = {
  id: 'q-s05-001', part: 1, syllabusItemId: 's05', topicGroup: 'aml',
  stem: 'Q?', options: { A: 'a', B: 'b', C: 'c', D: 'd' },
  answer: 'C', explanation: 'because', difficulty: 'medium',
  sourceRef: 'MAS FAA-N06', status: 'draft', tags: ['x', 'y'],
};

test('valid canonical object passes', () => {
  const { questions, errors } = validateQuestionObjects([{ ...goodObj }]);
  assert.equal(errors.length, 0);
  assert.equal(questions.length, 1);
  assert.equal(questions[0].answer, 'C');
});

test('bad answer rejected with locator, nothing silently dropped', () => {
  const { questions, errors } = validateQuestionObjects([{ ...goodObj, answer: 'E' }]);
  assert.equal(questions.length, 0);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /q-s05-001/);
  assert.match(errors[0], /answer/);
});

test('unknown syllabusItemId rejected', () => {
  const { errors } = validateQuestionObjects([{ ...goodObj, syllabusItemId: 's99' }]);
  assert.match(errors[0], /syllabusItemId/);
});

test('part must match syllabus item part', () => {
  const { errors } = validateQuestionObjects([{ ...goodObj, part: 2 }]); // s05 is part 1
  assert.match(errors[0], /part/);
});

test('missing required field reported', () => {
  const o = { ...goodObj }; delete o.stem;
  const { errors } = validateQuestionObjects([o]);
  assert.match(errors[0], /stem/);
});

test('missing an option reported', () => {
  const o = { ...goodObj, options: { A: 'a', B: 'b', C: 'c' } };
  const { errors } = validateQuestionObjects([o]);
  assert.match(errors[0], /option D|options/);
});

test('normalizeCsvRow maps flat row to canonical shape', () => {
  const row = {
    id: 'q-s05-002', part: '1', syllabusItemId: 's05', topicGroup: 'aml',
    stem: 'Q?', optionA: 'a', optionB: 'b', optionC: 'c', optionD: 'd',
    answer: 'c', explanation: 'e', difficulty: '', sourceRef: '', status: '', tags: 'x;y',
  };
  const obj = normalizeCsvRow(row);
  assert.equal(obj.part, 1);
  assert.deepEqual(obj.options, { A: 'a', B: 'b', C: 'c', D: 'd' });
  assert.equal(obj.answer, 'C');     // upper-cased
  assert.equal(obj.status, 'draft'); // default
  assert.equal(obj.difficulty, 'medium');
  assert.deepEqual(obj.tags, ['x', 'y']);
  // 经 normalize 后必须能通过校验
  const { errors } = validateQuestionObjects([obj]);
  assert.deepEqual(errors, []);
});

test('question id must match safe format q-sNN-...', () => {
  const { errors } = validateQuestionObjects([{ ...goodObj, id: 'weird id <x>' }]);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /id/);
  // 合法 id 通过
  assert.deepEqual(validateQuestionObjects([{ ...goodObj, id: 'q-s05-001' }]).errors, []);
});

const goodCard = {
  id: 'fc-s05-001', part: 1, syllabusItemId: 's05', topicGroup: 'aml',
  title: 'CDD', point: 'verify identity', keyfacts: ['before onboarding'], status: 'draft',
};

test('validateFlashcardObjects: valid card passes', () => {
  const { flashcards, errors } = validateFlashcardObjects([{ ...goodCard }]);
  assert.deepEqual(errors, []);
  assert.equal(flashcards.length, 1);
});

test('validateFlashcardObjects: bad syllabusItemId / missing title rejected with locator', () => {
  assert.match(validateFlashcardObjects([{ ...goodCard, syllabusItemId: 's99' }]).errors[0], /syllabusItemId/);
  const o = { ...goodCard }; delete o.title;
  assert.match(validateFlashcardObjects([o]).errors[0], /title/);
});

test('validateFlashcardObjects: reviewed card requires sourceRef', () => {
  assert.match(validateFlashcardObjects([{ ...goodCard, status: 'reviewed' }]).errors[0], /sourceRef/);
  assert.deepEqual(validateFlashcardObjects([{ ...goodCard, status: 'reviewed', sourceRef: 'MAS X' }]).errors, []);
});

const goodNote = {
  id: 'note-s05-overview', part: 1, syllabusItemId: 's05',
  title: 'AML', summary: 's', sections: [{ heading: 'h', body: 'b' }],
  keyPoints: ['k'], sourceRef: 'MAS FAA-N06', status: 'draft',
};

test('validateNoteObjects: valid note passes', () => {
  const { notes, errors } = validateNoteObjects([{ ...goodNote }]);
  assert.deepEqual(errors, []);
  assert.equal(notes.length, 1);
});

test('validateNoteObjects: id sNN must equal syllabusItemId', () => {
  const { errors } = validateNoteObjects([{ ...goodNote, syllabusItemId: 's18', part: 2 }]); // id says s05
  assert.ok(errors.some(e => /must equal syllabusItemId/.test(e)));
});

test('validateNoteObjects: bad id format rejected', () => {
  assert.match(validateNoteObjects([{ ...goodNote, id: 'note-s05-' }]).errors[0], /id must match/);
  assert.match(validateNoteObjects([{ ...goodNote, id: 'weird' }]).errors[0], /id must match/);
});

test('validateNoteObjects: part optional, normalized from syllabusItemId', () => {
  const o = { ...goodNote }; delete o.part;
  const { notes, errors } = validateNoteObjects([o]);
  assert.deepEqual(errors, []);
  assert.equal(notes[0].part, 1); // s05 → part 1
});

test('validateNoteObjects: provided part must match syllabus part', () => {
  assert.match(validateNoteObjects([{ ...goodNote, part: 2 }]).errors[0], /part/); // s05 is part 1
});

test('validateNoteObjects: sections must be non-empty with heading+body', () => {
  assert.match(validateNoteObjects([{ ...goodNote, sections: [] }]).errors[0], /sections/);
  assert.match(validateNoteObjects([{ ...goodNote, sections: [{ heading: 'h' }] }]).errors[0], /section 1/);
});

test('validateNoteObjects: reviewed note requires sourceRef', () => {
  const o = { ...goodNote, status: 'reviewed' }; delete o.sourceRef;
  assert.match(validateNoteObjects([o]).errors[0], /sourceRef/);
});
