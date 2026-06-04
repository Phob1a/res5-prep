import { SYLLABUS } from './syllabus.js';
import { loadState, saveState } from './store.js';
import { escapeHtml } from './dom.js';

export function renderPractice(main, ctx) {
  const qs = ctx.content.questions.filter(q => q.status !== 'retired');
  const sel = document.createElement('select');
  sel.innerHTML = `<option value="">全部条目</option>` + SYLLABUS.map(s => `<option value="${s.id}">${s.id} ${escapeHtml(s.title)}</option>`).join('');
  const host = document.createElement('div');
  main.append(sel, host);
  const draw = () => {
    const pool = sel.value ? qs.filter(q => q.syllabusItemId === sel.value) : qs;
    host.innerHTML = pool.length ? pool.map(q => card(q)).join('') : '<p class="note">该条目暂无题目</p>';
    host.querySelectorAll('.option').forEach(btn => btn.onclick = () => reveal(btn, pool.find(q => q.id === btn.dataset.q)));
  };
  sel.onchange = draw; draw();
}
function card(q) {
  return `<div class="card" style="margin:8px 0"><p>${escapeHtml(q.stem)}</p>
    ${['A','B','C','D'].map(k => `<button class="option" data-q="${escapeHtml(q.id)}" data-k="${k}">${k}. ${escapeHtml(q.options[k])}</button>`).join('')}
    <p class="exp" style="display:none" id="exp-${escapeHtml(q.id)}"></p></div>`;
}
function reveal(btn, q) {
  const chosen = btn.dataset.k;
  btn.parentElement.querySelectorAll('.option').forEach(b => {
    if (b.dataset.k === q.answer) b.classList.add('correct');
    else if (b.dataset.k === chosen) b.classList.add('wrong');
    b.disabled = true;
  });
  const exp = document.getElementById('exp-' + q.id);
  exp.style.display = 'block'; exp.textContent = (chosen === q.answer ? '✅ ' : '❌ ') + q.explanation; // textContent 安全
  if (chosen !== q.answer) { const st = loadState(); if (!st.wrongbook.includes(q.id)) { st.wrongbook.push(q.id); saveState(st); } }
}
