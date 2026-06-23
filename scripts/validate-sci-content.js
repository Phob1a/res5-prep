// SCI 题解质量 gate（M1-M4）。
// 用途：在更新 GitHub Pages 之前，对 content/sci/questions.json 做硬门禁校验。
//   M1 硬回声 ：correctReason 不得用“本题给定答案/给定答案对应/按本题答案/本题答案为”这类只复述答案的措辞
//   M2 套娃   ：题解文本不得出现重复括注 / 嵌套括号 / 重复引号（（（、））、““、””、术语（术语…）
//   M3 泛泛错因：错误选项不得只写纯兜底句（“不符合题干要求/不是正确表述/该选项所述内容”等），必须给具体错点
//   M4 字段   ：explanation.finalAnswer 必须只存 A/B/C/D 单字母
//
// 用法：
//   node scripts/validate-sci-content.js            校验默认题库文件，失败 exit 1
//   import { validateSciContent } from ...           供测试调用，返回 { errors }
//
// 注意：本 gate 校验“产物文件”，不依赖 build-sci-content.js 重新生成。
// 当前 content/sci/questions.json 的题解是直接维护在文件里的，重跑生成器会覆盖它（见 README/交接说明）。

import fs from 'node:fs';

export const DEFAULT_QUESTIONS_PATH = 'content/sci/questions.json';

// M1：只拦“死硬回声”，不拦正常的结论句（如“所以答案选 X”）。
const ECHO_PHRASES = ['本题给定答案', '给定答案对应', '按本题答案', '本题答案为'];

// M2：套娃标点。
const NESTED_PUNCT = ['（（', '））', '““', '””'];
// 术语（术语… —— 同一中文术语被括注两次。
const REPEAT_TERM_RE = /([一-鿿、]{2,})（\1[（）]/;

// M3：纯兜底句（精确短语，避免误杀“……不符合题干的非上市要求”这类带具体错点的句子）。
const BOILERPLATE_PHRASES = [
  '不符合题干要求',
  '不是正确表述',
  '该选项所述内容',
  '不是题干要找的正确项目',
  '该选项不符合题干',
];

const LETTERS = ['A', 'B', 'C', 'D'];

export function validateSciContent(questions) {
  const errors = [];
  if (!Array.isArray(questions)) {
    return { errors: ['questions.json: top-level not an array'] };
  }

  for (const q of questions) {
    const id = q?.id || '(missing id)';
    const ex = q?.explanation || {};
    const oa = ex.optionAnalysis || {};
    const correctReason = String(ex.correctReason || '');
    const allText = [ex.basis || '', correctReason, ...LETTERS.map(k => oa[k] || '')].join('\n');

    // M1 硬回声
    for (const phrase of ECHO_PHRASES) {
      if (correctReason.includes(phrase)) {
        errors.push(`${id}: [M1] correctReason 含回声式措辞 “${phrase}”，需改写为规则本身的依据`);
      }
    }

    // M2 套娃
    for (const pat of NESTED_PUNCT) {
      if (allText.includes(pat)) errors.push(`${id}: [M2] 题解出现套娃标点 “${pat}”`);
    }
    const repeat = allText.match(REPEAT_TERM_RE);
    if (repeat) errors.push(`${id}: [M2] 术语重复括注 “${repeat[1]}（${repeat[1]}…”`);

    // M3 泛泛错因（仅错误选项）
    for (const k of LETTERS) {
      if (k === q?.answer) continue;
      const t = String(oa[k] || '');
      for (const phrase of BOILERPLATE_PHRASES) {
        if (t.includes(phrase)) {
          errors.push(`${id}: [M3] 选项 ${k} 使用纯兜底句 “${phrase}”，需给出具体错点`);
        }
      }
    }

    // M4 finalAnswer 单字母
    if (!LETTERS.includes(ex.finalAnswer)) {
      errors.push(`${id}: [M4] finalAnswer 必须为 A/B/C/D 单字母，当前为 ${JSON.stringify(ex.finalAnswer)}`);
    }
  }

  return { errors };
}

function main() {
  const path = process.argv[2] || DEFAULT_QUESTIONS_PATH;
  if (!fs.existsSync(path)) {
    console.error(`SCI gate: 找不到题库文件 ${path}`);
    process.exit(2);
  }
  let questions;
  try {
    questions = JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (err) {
    console.error(`SCI gate: 解析 ${path} 失败: ${err.message}`);
    process.exit(2);
  }
  const { errors } = validateSciContent(questions);
  if (errors.length) {
    console.error(`SCI gate FAILED: ${errors.length} 项违规`);
    for (const e of errors) console.error('  - ' + e);
    process.exit(1);
  }
  console.log(`SCI gate PASSED: ${questions.length} 题全部通过 M1-M4`);
}

// 仅作为 CLI 直接执行时运行 main（被 import 时不执行）。
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
