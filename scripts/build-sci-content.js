import fs from 'node:fs';
import path from 'node:path';
import { toSciQuestion } from '../js/sci-data.js';

const inputPath = 'res5_all_questions_answers.json';
const outputPath = 'content/sci/questions.json';

const raw = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
if (!Array.isArray(raw.questions)) throw new Error(`${inputPath}: missing questions array`);

const questions = raw.questions.map(toSciQuestion);
const ids = new Set();
for (const q of questions) {
  if (ids.has(q.id)) throw new Error(`duplicate SCI question id ${q.id}`);
  ids.add(q.id);
  for (const key of ['A', 'B', 'C', 'D']) {
    if (!q.optionsEn[key]) throw new Error(`${q.id}: missing option ${key}`);
  }
  if (!['A', 'B', 'C', 'D'].includes(q.answer)) throw new Error(`${q.id}: invalid answer ${q.answer}`);
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(questions, null, 2) + '\n');
console.log(`wrote ${questions.length} SCI questions to ${outputPath}`);
