// 纯函数(可在 Node 测试):计数 + 抽题池 + 合并报告。浏览器函数 loadContent 仅在浏览器调用。

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

// 浏览器:加载 content/index.json 列出的文件
export async function loadContent() {
  const index = await (await fetch('content/index.json')).json();
  const questions = [], flashcards = [];
  for (const f of index.questions) questions.push(...await (await fetch(`content/questions/${f}`)).json());
  for (const f of index.flashcards) flashcards.push(...await (await fetch(`content/flashcards/${f}`)).json());
  return { questions, flashcards };
}
