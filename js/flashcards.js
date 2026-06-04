import { loadState, saveState } from './store.js';
import { escapeHtml } from './dom.js';

export function renderFlashcards(main, ctx) {
  const cards = ctx.content.flashcards;
  if (!cards.length) { main.innerHTML = '<p class="note">暂无知识卡</p>'; return; }
  const st = loadState();
  main.innerHTML = cards.map(c => `<div class="card" style="margin:8px 0">
    <p><b>${escapeHtml(c.title)}</b> <span class="note">[${escapeHtml(c.syllabusItemId)}]</span></p>
    <button class="flip" data-id="${escapeHtml(c.id)}">翻面看要点</button>
    <div id="back-${escapeHtml(c.id)}" style="display:none">
      <p>${escapeHtml(c.point)}</p><ul>${(c.keyfacts||[]).map(f => `<li>${escapeHtml(f)}</li>`).join('')}</ul>
      <button class="master" data-id="${escapeHtml(c.id)}">${st.flashcardMastery[c.id] ? '已掌握 ✅' : '标记已掌握'}</button>
    </div></div>`).join('');
  main.querySelectorAll('.flip').forEach(b => b.onclick = () => { document.getElementById('back-' + b.dataset.id).style.display = 'block'; });
  main.querySelectorAll('.master').forEach(b => b.onclick = () => {
    const s = loadState(); s.flashcardMastery[b.dataset.id] = true; saveState(s); b.textContent = '已掌握 ✅';
  });
}
