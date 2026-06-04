import { canRunFullMock, gradeExam } from './scoring.js';
import { countByPart, selectMockPool } from './content-loader.js';
import { loadState, saveState } from './store.js';
import { escapeHtml } from './dom.js';

// 阶段0:deterministic 取前 n 题(不洗牌,阶段1 补 shuffle)。
function take(arr, n) { return arr.slice(0, n); }

export function renderMock(main, ctx) {
  const all = ctx.content.questions;
  const allCounts = countByPart(all);
  const reviewedCounts = countByPart(all, { reviewedOnly: true });
  const official = canRunFullMock(reviewedCounts);
  const fullLength = !official && canRunFullMock(allCounts);
  const mode = official ? 'official' : (fullLength ? 'full-length' : 'mini');
  const label = mode === 'official' ? '开始官方完整模拟考(官方判分)'
    : mode === 'full-length' ? '开始全长练习(含未核验题,无官方判定)'
    : '开始 mini mock';
  const note = mode === 'official' ? '可信题库(reviewed)已达 110/40,本卷给官方 PASS/FAIL。'
    : mode === 'full-length' ? '题量达 110/40 但含 draft 未核验题,<b>不给官方及格判定</b>。'
    : `题库不足 110/40 —— 仅出 mini mock,<b>不给官方及格判定</b>。`;
  const wrap = document.createElement('div');
  wrap.innerHTML = `<div class="card">
    <p>题库:全部 Part I ${allCounts[1]||0}/Part II ${allCounts[2]||0};已核验 reviewed Part I ${reviewedCounts[1]||0}/Part II ${reviewedCounts[2]||0}</p>
    <p class="note">${note}</p>
    <button id="start">${label}</button>
  </div><div id="exam"></div>`;
  main.appendChild(wrap);
  wrap.querySelector('#start').onclick = () => runExam(wrap.querySelector('#exam'), all, mode);
}

function runExam(host, all, mode) {
  const official = mode === 'official';
  const pool = selectMockPool(all, mode); // official 只含 reviewed
  const p1 = pool.filter(q => q.part === 1), p2 = pool.filter(q => q.part === 2);
  const pick = (mode === 'mini')
    ? [...take(p1, Math.min(p1.length, 25)), ...take(p2, Math.min(p2.length, 10))]
    : [...take(p1, 110), ...take(p2, 40)];
  const answers = {};
  host.innerHTML = pick.map((q, i) => `<div class="card" style="margin:8px 0">
    <p><b>Q${i + 1}</b> [${q.part === 1 ? 'I' : 'II'}] ${escapeHtml(q.stem)}</p>
    ${['A','B','C','D'].map(k => `<button class="option" data-q="${escapeHtml(q.id)}" data-k="${k}">${k}. ${escapeHtml(q.options[k])}</button>`).join('')}
  </div>`).join('') + `<button id="submit">交卷</button><div id="result"></div>`;
  host.querySelectorAll('.option').forEach(btn => btn.onclick = () => {
    answers[btn.dataset.q] = btn.dataset.k;
    host.querySelectorAll(`[data-q="${btn.dataset.q}"]`).forEach(b => b.style.outline = '');
    btn.style.outline = '2px solid #0b3d2e';
  });
  host.querySelector('#submit').onclick = () => {
    const raw = { part1: { correct: 0, total: 0 }, part2: { correct: 0, total: 0 } };
    for (const q of pick) {
      const key = q.part === 1 ? 'part1' : 'part2'; raw[key].total++;
      if (answers[q.id] === q.answer) raw[key].correct++;
    }
    const g = gradeExam(raw, { official });
    const pct = r => (r * 100).toFixed(1);
    const verdict = official
      ? `<p class="${g.overallPass ? 'pass' : 'fail'}">${g.overallPass ? 'PASS ✅' : 'FAIL ❌'}(Part I ${pct(g.part1.rate)}% 需≥75% / Part II ${pct(g.part2.rate)}% 需≥80%)</p>`
      : `<p class="note">${mode === 'full-length' ? '全长练习(含未核验题)' : 'mini mock'},不代表官方及格判定。Part I ${pct(g.part1.rate)}% / Part II ${pct(g.part2.rate)}%</p>`;
    host.querySelector('#result').innerHTML = verdict;
    const st = loadState(); st.examHistory.push({ mode, p1: g.part1.rate, p2: g.part2.rate }); saveState(st);
  };
}
