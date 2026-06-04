import { loadState, exportProgress, importProgress } from './store.js';
import { SYLLABUS } from './syllabus.js';
import { escapeHtml } from './dom.js';

export function renderReview(main, ctx) {
  const st = loadState();
  const wrong = ctx.content.questions.filter(q => st.wrongbook.includes(q.id));
  const byItem = {};
  for (const q of wrong) byItem[q.syllabusItemId] = (byItem[q.syllabusItemId] || 0) + 1;
  const dash = SYLLABUS.map(s => `<li>${s.id} ${escapeHtml(s.title)}: <b style="color:${byItem[s.id] ? '#c9184a' : '#2d6a4f'}">${byItem[s.id] || 0} 错</b></li>`).join('');
  main.innerHTML = `<div class="card"><h3>弱项仪表盘</h3><ul>${dash}</ul></div>
    <div class="card" style="margin-top:8px"><h3>错题(${wrong.length})</h3>
      ${wrong.map(q => `<p>• [${escapeHtml(q.syllabusItemId)}] ${escapeHtml(q.stem)}<br><span class="note">答案 ${escapeHtml(q.answer)} — ${escapeHtml(q.explanation)}</span></p>`).join('') || '<p class="note">暂无错题</p>'}</div>
    <div class="card" style="margin-top:8px"><h3>学习进度迁移</h3>
      <button id="export">导出进度 JSON</button>
      <input type="file" id="impfile" accept="application/json" />
      <p class="note" id="impmsg"></p></div>`;
  main.querySelector('#export').onclick = () => {
    const blob = new Blob([exportProgress()], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'res5-progress.json'; a.click();
  };
  main.querySelector('#impfile').onchange = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    try { importProgress(await file.text()); main.querySelector('#impmsg').textContent = '导入成功,刷新生效。'; }
    catch (err) { main.querySelector('#impmsg').textContent = '导入失败:' + err.message; }
  };
}
