// 纯函数(可在 Node 测试):计数 + 抽题池 + 合并报告 + 讲义过滤。浏览器函数 loadContent 仅在浏览器调用。
import { validateFlashcardObjects, validateNoteObjects } from './validate.js';

// 纯函数:取某考点的讲义(保序)
export function notesForItem(notes, syllabusItemId) {
  return notes.filter(n => n.syllabusItemId === syllabusItemId);
}

export function countByPart(questions, { reviewedOnly = false } = {}) {
  const c = { 1: 0, 2: 0 };
  for (const q of questions) {
    if (q.status === 'retired') continue;
    if (reviewedOnly && q.status !== 'reviewed') continue;
    c[q.part] = (c[q.part] || 0) + 1;
  }
  return c;
}

// official 模式只从 reviewed 抽题;full-length / mini 从所有非 retired 抽。
export function selectMockPool(questions, mode) {
  const notRetired = questions.filter(q => q.status !== 'retired');
  return mode === 'official' ? notRetired.filter(q => q.status === 'reviewed') : notRetired;
}

// 递归 stable stringify:键深度排序,正确比较嵌套 options
function stable(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(stable).join(',') + ']';
  return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + stable(v[k])).join(',') + '}';
}

// 默认不覆盖冲突;返回 { questions, added, updated, skipped, conflicts }
export function mergeQuestions(existing, incoming, { overwriteConflicts = false } = {}) {
  const map = new Map(existing.map(q => [q.id, q]));
  let added = 0, updated = 0, skipped = 0; const conflicts = [];
  for (const q of incoming) {
    if (!map.has(q.id)) { map.set(q.id, q); added++; continue; }
    if (stable(map.get(q.id)) === stable(q)) { skipped++; continue; }
    conflicts.push(q.id);
    if (overwriteConflicts) { map.set(q.id, q); updated++; }
  }
  return { questions: [...map.values()], added, updated, skipped, conflicts };
}

// 文件级隔离加载:逐文件 fetch→parse→validate,单文件失败只告警跳过,不 throw。
// validator(arr) → { [key]: [...], errors: [...] };返回所有有效项的扁平数组。
async function loadValidatedFiles(kind, files, pathPrefix, validator, key, fetchFn) {
  const out = [];
  for (const f of files) {
    try {
      const res = await fetchFn(`${pathPrefix}${f}`);
      if (!res.ok) { console.warn({ kind, file: f, errors: [`HTTP ${res.status}`] }); continue; }
      const arr = await res.json();
      if (!Array.isArray(arr)) { console.warn({ kind, file: f, errors: ['top-level not an array'] }); continue; }
      const { [key]: valid, errors } = validator(arr);
      if (errors.length) console.warn({ kind, file: f, errors });
      out.push(...valid);
    } catch (e) {
      console.warn({ kind, file: f, errors: [String(e && e.message || e)] });
    }
  }
  return out;
}

// 浏览器:加载 content/index.json 列出的文件。
// questions 维持现状(由 UI/导入路径校验);notes/flashcards 文件级隔离 + 运行时校验丢弃,失败不影响 questions。
export async function loadContent(fetchFn = fetch) {
  const index = await (await fetchFn('content/index.json')).json();
  const questions = [];
  for (const f of index.questions ?? []) questions.push(...await (await fetchFn(`content/questions/${f}`)).json());
  const flashcards = await loadValidatedFiles('flashcards', index.flashcards ?? [], 'content/flashcards/', validateFlashcardObjects, 'flashcards', fetchFn);
  const notes = await loadValidatedFiles('notes', index.notes ?? [], 'content/notes/', validateNoteObjects, 'notes', fetchFn);
  return { questions, flashcards, notes };
}
