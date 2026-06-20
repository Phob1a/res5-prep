import fs from 'node:fs';
import path from 'node:path';
import { toSciQuestion } from '../js/sci-data.js';

const inputPath = 'res5_all_questions_answers.json';
const outputPath = 'content/sci/questions.json';
const notesDir = 'content/notes';

function loadNotesByItem() {
  const notesByItem = {};
  if (!fs.existsSync(notesDir)) return notesByItem;
  for (const file of fs.readdirSync(notesDir).filter(name => name.endsWith('.json'))) {
    const notes = JSON.parse(fs.readFileSync(path.join(notesDir, file), 'utf8'));
    for (const note of notes) {
      if (note?.syllabusItemId && !notesByItem[note.syllabusItemId]) notesByItem[note.syllabusItemId] = note;
    }
  }
  return notesByItem;
}

const raw = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
if (!Array.isArray(raw.questions)) throw new Error(`${inputPath}: missing questions array`);

const notesByItem = loadNotesByItem();
const questions = raw.questions.map(q => toSciQuestion(q, { notesByItem }));
const ids = new Set();
for (const q of questions) {
  if (ids.has(q.id)) throw new Error(`duplicate SCI question id ${q.id}`);
  ids.add(q.id);
  for (const key of ['A', 'B', 'C', 'D']) {
    if (!q.optionsEn[key]) throw new Error(`${q.id}: missing option ${key}`);
    if (!q.explanation?.optionAnalysis?.[key]) throw new Error(`${q.id}: missing explanation for option ${key}`);
  }
  if (!['A', 'B', 'C', 'D'].includes(q.answer)) throw new Error(`${q.id}: invalid answer ${q.answer}`);
  if (!q.explanation?.basis || !q.explanation?.correctReason) throw new Error(`${q.id}: missing detailed explanation`);
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(questions, null, 2) + '\n');
console.log(`wrote ${questions.length} SCI questions to ${outputPath}`);
