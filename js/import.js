import { parseCsv } from './csv.js';
import { validateQuestionObjects, normalizeCsvRow } from './validate.js';
import { mergeQuestions } from './content-loader.js';
import { escapeHtml } from './dom.js';

export function renderImport(main, ctx) {
  main.innerHTML = `<div class="card">
    <h3>导入题库</h3>
    <p class="note">支持 JSON(canonical 数组)或 CSV。CSV 表头:id,part,syllabusItemId,topicGroup,stem,optionA,optionB,optionC,optionD,answer,explanation,difficulty,sourceRef,status,tags</p>
    <input type="file" id="file" accept=".json,.csv" />
    <label style="display:block;margin-top:6px"><input type="checkbox" id="ow" /> 覆盖同 id 冲突题(默认不覆盖)</label>
    <div id="msg"></div></div>`;
  main.querySelector('#file').onchange = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const text = await file.text();
    const msg = main.querySelector('#msg');
    let candidates = [], parseErrors = [];

    if (file.name.endsWith('.json')) {
      let arr;
      try { arr = JSON.parse(text); } catch { parseErrors = ['JSON 解析失败:不是合法 JSON']; }
      if (Array.isArray(arr)) candidates = arr;
      else if (arr) parseErrors.push('JSON 顶层必须是题目数组');
    } else {
      const { rows, errors } = parseCsv(text);
      parseErrors = errors;
      candidates = rows.map(normalizeCsvRow);
    }
    if (parseErrors.length) { msg.innerHTML = errBlock('解析错误', parseErrors); return; }

    const { questions, errors } = validateQuestionObjects(candidates); // JSON 与 CSV 同校验
    if (errors.length) { msg.innerHTML = errBlock('校验失败,未导入', errors); return; }

    const ow = main.querySelector('#ow').checked;
    const rep = mergeQuestions(ctx.content.questions, questions, { overwriteConflicts: ow });
    ctx.content.questions = rep.questions;
    let html = `<p class="pass">导入完成(本会话生效)。新增 ${rep.added}、更新 ${rep.updated}、跳过(完全相同) ${rep.skipped}。</p>`;
    if (rep.conflicts.length) html += `<p class="${ow ? 'note' : 'fail'}">同 id 内容冲突 ${rep.conflicts.length} 条:${rep.conflicts.map(escapeHtml).join(', ')}${ow ? '(已覆盖)' : '(未覆盖,勾选上面选项并重新导入以覆盖)'}</p>`;
    msg.innerHTML = html;
  };
}
function errBlock(title, errs) {
  return `<p class="fail">${escapeHtml(title)},${errs.length} 处:</p><ul>${errs.map(e => `<li>${escapeHtml(e)}</li>`).join('')}</ul>`;
}
