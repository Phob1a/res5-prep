import { loadContent } from './content-loader.js';
import { renderMock } from './mock-exam.js';
import { renderFlashcards } from './flashcards.js';
import { renderNotes } from './notes.js';
import { renderPractice } from './practice.js';
import { renderReview } from './review.js';
import { renderImport } from './import.js';

const views = { mock: renderMock, flashcards: renderFlashcards, notes: renderNotes, practice: renderPractice, review: renderReview, import: renderImport };
const ctx = { content: { questions: [], flashcards: [], notes: [] } };

function show(name) {
  document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('active', b.dataset.view === name));
  const main = document.getElementById('view');
  main.innerHTML = '';
  views[name](main, ctx);
}
async function init() {
  document.querySelectorAll('#nav button').forEach(b => b.addEventListener('click', () => show(b.dataset.view)));
  try { ctx.content = await loadContent(); } catch (e) { console.error(e); }
  show('mock');
}
init();
