import { isValidSyllabusItemId, getItem } from './syllabus.js';

const ANSWERS = new Set(['A', 'B', 'C', 'D']);
const STATUSES = new Set(['draft', 'reviewed', 'retired']);
const DIFFICULTIES = new Set(['easy', 'medium', 'hard']);
const QID_RE = /^q-s\d{2}-[a-z0-9-]+$/;   // 安全 id:进 data-q / DOM id / selector
const FCID_RE = /^fc-s\d{2}-[a-z0-9-]+$/;
const NID_RE = /^note-s\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*$/;  // 收紧:强制 slug,禁连续/尾 hyphen

// CSV 扁平行 → canonical question 对象(不校验,只整形 + 填默认)
export function normalizeCsvRow(r) {
  return {
    id: r.id,
    part: Number(r.part),
    syllabusItemId: r.syllabusItemId,
    topicGroup: r.topicGroup || (isValidSyllabusItemId(r.syllabusItemId) ? getItem(r.syllabusItemId).topicGroup : ''),
    stem: r.stem,
    options: { A: r.optionA, B: r.optionB, C: r.optionC, D: r.optionD },
    answer: (r.answer || '').toUpperCase(),
    explanation: r.explanation || '',
    difficulty: r.difficulty || 'medium',
    sourceRef: r.sourceRef || '',
    status: r.status || 'draft',
    tags: (r.tags || '').split(';').map(t => t.trim()).filter(Boolean),
  };
}

// 统一校验 canonical question 对象数组。返回 { questions, errors }。
export function validateQuestionObjects(objs) {
  const questions = [], errors = [];
  objs.forEach((q, i) => {
    const loc = q && q.id ? `"${q.id}"` : `item ${i + 1}`;
    const errs = [];
    if (!q || typeof q !== 'object') { errors.push(`${loc}: not an object`); return; }
    for (const f of ['id', 'stem', 'syllabusItemId']) if (!q[f]) errs.push(`${loc}: missing required field "${f}"`);
    if (q.id && !QID_RE.test(q.id)) errs.push(`${loc}: id must match ${QID_RE} (got "${q.id}")`);
    if (q.part !== 1 && q.part !== 2) errs.push(`${loc}: part must be 1 or 2 (got "${q.part}")`);
    if (q.syllabusItemId && !isValidSyllabusItemId(q.syllabusItemId)) errs.push(`${loc}: unknown syllabusItemId "${q.syllabusItemId}"`);
    else if (q.syllabusItemId && (q.part === 1 || q.part === 2) && getItem(q.syllabusItemId).part !== q.part)
      errs.push(`${loc}: part ${q.part} does not match syllabusItemId "${q.syllabusItemId}"`);
    if (!q.options || ['A', 'B', 'C', 'D'].some(k => !q.options[k])) errs.push(`${loc}: options A/B/C/D all required`);
    if (!ANSWERS.has(q.answer)) errs.push(`${loc}: answer must be A/B/C/D (got "${q.answer}")`);
    if (!STATUSES.has(q.status || 'draft')) errs.push(`${loc}: status must be draft/reviewed/retired`);
    if (!DIFFICULTIES.has(q.difficulty || 'medium')) errs.push(`${loc}: difficulty must be easy/medium/hard`);
    if (errs.length) { errors.push(...errs); return; }
    questions.push({
      ...q,
      status: q.status || 'draft',
      difficulty: q.difficulty || 'medium',
      tags: Array.isArray(q.tags) ? q.tags : [],
      topicGroup: q.topicGroup || getItem(q.syllabusItemId).topicGroup,
    });
  });
  return { questions, errors };
}

// flashcard 校验(轻量,种子内容也走它)
export function validateFlashcardObjects(objs) {
  const flashcards = [], errors = [];
  objs.forEach((c, i) => {
    const loc = c && c.id ? `"${c.id}"` : `item ${i + 1}`;
    const errs = [];
    if (!c || typeof c !== 'object') { errors.push(`${loc}: not an object`); return; }
    for (const f of ['id', 'title', 'point', 'syllabusItemId']) if (!c[f]) errs.push(`${loc}: missing required field "${f}"`);
    if (c.id && !FCID_RE.test(c.id)) errs.push(`${loc}: id must match ${FCID_RE} (got "${c.id}")`);
    if (c.part !== 1 && c.part !== 2) errs.push(`${loc}: part must be 1 or 2`);
    if (c.syllabusItemId && !isValidSyllabusItemId(c.syllabusItemId)) errs.push(`${loc}: unknown syllabusItemId "${c.syllabusItemId}"`);
    else if (c.syllabusItemId && (c.part === 1 || c.part === 2) && getItem(c.syllabusItemId).part !== c.part)
      errs.push(`${loc}: part ${c.part} does not match syllabusItemId "${c.syllabusItemId}"`);
    if (!STATUSES.has(c.status || 'draft')) errs.push(`${loc}: status must be draft/reviewed/retired`);
    if (c.status === 'reviewed' && !c.sourceRef) errs.push(`${loc}: reviewed flashcard requires non-empty sourceRef`);
    if (errs.length) { errors.push(...errs); return; }
    flashcards.push({ ...c, status: c.status || 'draft', keyfacts: Array.isArray(c.keyfacts) ? c.keyfacts : [] });
  });
  return { flashcards, errors };
}

// 知识点讲义校验。返回 { notes, errors }。part 可选(由 syllabusItemId normalize)。
export function validateNoteObjects(objs) {
  const notes = [], errors = [];
  objs.forEach((n, i) => {
    const loc = n && n.id ? `"${n.id}"` : `item ${i + 1}`;
    const errs = [];
    if (!n || typeof n !== 'object') { errors.push(`${loc}: not an object`); return; }
    for (const f of ['id', 'title', 'syllabusItemId']) if (!n[f]) errs.push(`${loc}: missing required field "${f}"`);
    if (n.id && !NID_RE.test(n.id)) errs.push(`${loc}: id must match ${NID_RE} (got "${n.id}")`);
    if (n.id && n.syllabusItemId) {
      const m = /^note-(s\d{2})-/.exec(n.id);
      if (m && m[1] !== n.syllabusItemId) errs.push(`${loc}: id prefix "${m[1]}" must equal syllabusItemId "${n.syllabusItemId}"`);
    }
    if (n.syllabusItemId && !isValidSyllabusItemId(n.syllabusItemId)) errs.push(`${loc}: unknown syllabusItemId "${n.syllabusItemId}"`);
    else if (n.syllabusItemId && n.part != null && n.part !== 1 && n.part !== 2) errs.push(`${loc}: part must be 1 or 2 if provided (got "${n.part}")`);
    else if (n.syllabusItemId && n.part != null && getItem(n.syllabusItemId).part !== n.part)
      errs.push(`${loc}: part ${n.part} does not match syllabusItemId "${n.syllabusItemId}"`);
    if (!Array.isArray(n.sections) || n.sections.length === 0) errs.push(`${loc}: sections must be a non-empty array`);
    else n.sections.forEach((s, j) => { if (!s || !s.heading || !s.body) errs.push(`${loc}: section ${j + 1} requires heading and body`); });
    if (!STATUSES.has(n.status || 'draft')) errs.push(`${loc}: status must be draft/reviewed/retired`);
    if (n.status === 'reviewed' && !n.sourceRef) errs.push(`${loc}: reviewed note requires non-empty sourceRef`);
    if (errs.length) { errors.push(...errs); return; }
    notes.push({
      ...n,
      status: n.status || 'draft',
      part: n.part != null ? n.part : getItem(n.syllabusItemId).part,
      summary: n.summary || '',
      keyPoints: Array.isArray(n.keyPoints) ? n.keyPoints : [],
    });
  });
  return { notes, errors };
}
