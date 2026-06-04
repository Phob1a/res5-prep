import { SYLLABUS } from './syllabus.js';
import { notesForItem } from './content-loader.js';
import { escapeHtml } from './dom.js';

const nl2br = (s) => escapeHtml(s).replace(/\n/g, '<br>'); // 先 escape 再换行

export function renderNotes(main, ctx) {
  const notes = ctx.content.notes || [];
  const have = new Set(notes.map(n => n.syllabusItemId));
  const opts = SYLLABUS.map(it =>
    `<option value="${escapeHtml(it.id)}">${escapeHtml(it.id)} ${have.has(it.id) ? '📘' : '·'} ${escapeHtml(it.title)}</option>`
  ).join('');
  main.innerHTML = `<div>
    <p class="note">按官方考纲 27 项浏览讲义(📘 = 已有内容)。题目/讲义均为自编 draft,需对照官方教材核验。</p>
    <select id="noteSel"><option value="">— 选择考点 —</option>${opts}</select>
    <div id="noteBody"></div></div>`;
  const body = main.querySelector('#noteBody');
  main.querySelector('#noteSel').onchange = (e) => renderItem(body, notes, e.target.value);
}

function renderItem(body, notes, syllabusItemId) {
  if (!syllabusItemId) { body.innerHTML = ''; return; }
  const items = notesForItem(notes, syllabusItemId);
  if (!items.length) { body.innerHTML = '<p class="note">该考点讲义待补。</p>'; return; }
  body.innerHTML = items.map(n => `<div class="card" style="margin:10px 0">
    <h3>${escapeHtml(n.title)} <span class="note">[${escapeHtml(n.syllabusItemId)}]</span></h3>
    ${n.summary ? `<p>${nl2br(n.summary)}</p>` : ''}
    ${(n.sections || []).map(s => `<p><b>${escapeHtml(s.heading)}</b><br>${nl2br(s.body)}</p>`).join('')}
    ${(n.keyPoints || []).length ? `<p><b>易考点</b></p><ul>${n.keyPoints.map(k => `<li>${escapeHtml(k)}</li>`).join('')}</ul>` : ''}
    <p class="note">出处:${escapeHtml(n.sourceRef || '—')} · 状态:${escapeHtml(n.status)}${n.status === 'draft' ? '(自编,待核验)' : ''}</p>
  </div>`).join('');
}
