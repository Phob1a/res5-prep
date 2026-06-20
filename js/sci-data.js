import { getItem, isValidSyllabusItemId } from './syllabus.js';

const PART_II_RANGE_END = 80;
const PART_I_MOCK_END = 190;

const RULES = [
  ['s13', /\bCPF\b|Central Provident Fund|Medisave|retirement account|permanent resident/i],
  ['s11', /collective investment scheme|CIS|Code on Collective Investment|fund manager|trustee|custodian|performance fee/i],
  ['s12', /securities dealing|market conduct|insider|false trading|market manipulation|wash sale/i],
  ['s07', /\bILP\b|investment[- ]linked|sub-fund/i],
  ['s05', /money laundering|terrorism|AML|CFT|suspicious transaction|politically exposed|PEP/i],
  ['s08', /CMI 01\/2011|FAA-G01|FSG-G01|FAA-G04|FAA-G05|self-declaration/i],
  ['s09', /balanced scorecard|FAA-G09|FAA-G10|FSG-G04|FAA-G14|remuneration|reference check/i],
  ['s10', /FAA-G13|FAA-G15|FAA-G16|CMG-G02|complaint|training and competency|competency/i],
  ['s06', /FAA-N17|FSM-N23|FAA-N19|FSM-N24|appointed representative|representatives notification framework|RNF/i],
  ['s04', /FAA-N02|FAA-N10|FAA-N12|FAA-N14|FAA-N20|FAA-N26|recommendation|product information disclosure|fact find/i],
  ['s03', /FAA-N16|FAA-N03|FAA-N11|product due diligence|information to clients/i],
  ['s02', /offence|conduct of business|power of authority|representative's action|misrepresentation/i],
  ['s01', /Financial Advisers Act|Financial Advisers Regulations|\bFAA\b|\bFAR\b|Monetary Authority|MAS|licensed financial adviser|exempt financial adviser|investment product/i],
  ['s27', /basic financial planning|death and total permanent disability|coverage|emergency fund|budget/i],
  ['s26', /reviewing clients|portfolio review|review client's portfolio/i],
  ['s25', /presentation of analysis|presenting recommendation|analysis and solutions/i],
  ['s24', /developing appropriate strategies|strategies and solutions|solution/i],
  ['s23', /financial status|net worth|cash flow|investment asset|liability/i],
  ['s22', /fact finding|needs analysis|client information|know your client/i],
  ['s21', /client.*representative relationship|developing client|relationship/i],
  ['s20', /marketing|sale of financial products|sales process|advertisement/i],
  ['s19', /fair dealing|customer service|loyal customer|Richard Shapiro/i],
  ['s18', /conflict of interest|conflicts/i],
  ['s17', /unethical|obstacles to ethical|misrepresentation|ethical decision/i],
  ['s16', /ethical behavior|ethics|ethical course|Aristotle|Socrates|Kant|John Stuart Mill|Machiavellianism/i],
  ['s15', /professionalism|professional conduct|profession/i],
  ['s14', /professional ethics|why professional ethics|moral|self-interest/i],
];

export function classifySciQuestion(question) {
  const text = question.question || question.stemEn || '';
  for (const [id, re] of RULES) {
    if (re.test(text)) return { part: getItem(id).part, syllabusItemId: id };
  }
  if (question.number <= PART_II_RANGE_END) return { part: 2, syllabusItemId: 's14' };
  if (question.number <= PART_I_MOCK_END) return { part: 1, syllabusItemId: 's01' };
  return { part: 1, syllabusItemId: 's01' };
}

export function formatKnowledgePoint(syllabusItemId) {
  const item = getItem(syllabusItemId);
  if (!item) return `${syllabusItemId}: 未映射知识点`;
  return `${item.id}: ${item.title}`;
}

const SYLLABUS_ZH = {
  s01: '财务顾问法与财务顾问条例（FAA & FAR）：财务顾问和代表',
  s02: '财务顾问法与财务顾问条例（FAA & FAR）：业务行为、监管权力和违法行为',
  s03: '新加坡金管局通知（MAS Notices）：FAA-N16、FAA-N03、FAA-N11',
  s04: '新加坡金管局通知（MAS Notices）：FAA-N02、FAA-N10、FAA-N12、FAA-N14、FAA-N20、FAA-N26',
  s05: '反洗钱与反恐融资（AML/CFT）',
  s06: '新加坡金管局通知（MAS Notices）：FAA-N17、FSM-N23、FAA-N19、FSM-N24',
  s07: '投资联结保单（Investment-linked Policies, ILPs）',
  s08: '新加坡金管局指引（MAS Guidelines）：FAA-G01、FSG-G01、FAA-G04、FAA-G05、CMI 01/2011',
  s09: '新加坡金管局指引（MAS Guidelines）：FAA-G09、FAA-G10、FSG-G04、FAA-G14',
  s10: '新加坡金管局指引（MAS Guidelines）：FAA-G13、FAA-G15、FAA-G16、CMG-G02、FSG-G02',
  s11: '集体投资计划守则（Code on Collective Investment Schemes）',
  s12: '证券交易市场行为（Securities Dealing: Market Conduct）',
  s13: '中央公积金（Central Provident Fund, CPF）',
  s14: '专业伦理的重要性（Professional Ethics）',
  s15: '专业精神（Professionalism）',
  s16: '道德行为（Ethical Behavior）',
  s17: '不道德行为（Unethical Behavior）',
  s18: '利益冲突（Conflict of Interest）',
  s19: '公平交易（Fair Dealing）',
  s20: '金融产品的道德营销与销售（Ethical Marketing and Sale of Financial Products）',
  s21: '建立客户与代表关系（Client-Representative Relationship）',
  s22: '事实调查与需求分析（Fact Finding and Needs Analysis）',
  s23: '分析和评估客户财务状况（Financial Status）',
  s24: '制定适当策略和方案（Strategies and Solutions）',
  s25: '向客户呈现分析和方案（Presentation of Analysis and Solutions）',
  s26: '客户投资组合复核（Portfolio Review）',
  s27: '基础财务规划指南（Basic Financial Planning Guide）',
};

const TERM_ZH = [
  [/Which of the following is NOT/gi, '以下哪一项不是'],
  [/Which one of the following is NOT/gi, '以下哪一项不是'],
  [/Which of the following is/gi, '以下哪一项是'],
  [/Which one of the following is/gi, '以下哪一项是'],
  [/Which of the following statements/gi, '以下哪项陈述'],
  [/Which of the following regarding/gi, '关于以下事项，哪一项'],
  [/Which of the following has pointed out that/gi, '以下哪位指出'],
  [/deciding on what is the best ethical course of action for people living in society is difficult/gi, '为社会中的人决定最佳道德行动路线是困难的'],
  [/is CORRECT/gi, '是正确的'],
  [/is TRUE/gi, '是真实/正确的'],
  [/is FALSE/gi, '是错误的'],
  [/mission of the Monetary Authority of Singapore/gi, '新加坡金融管理局（MAS）的使命'],
  [/Monetary Authority of Singapore/gi, '新加坡金融管理局（MAS）'],
  [/Financial Advisers Act/gi, '《财务顾问法》（FAA）'],
  [/Financial Advisers Regulations/gi, '《财务顾问条例》（FAR）'],
  [/licensed financial adviser/gi, '持牌财务顾问'],
  [/exempt financial adviser/gi, '豁免财务顾问'],
  [/financial adviser representative/gi, '财务顾问代表'],
  [/representative/gi, '代表'],
  [/investment product/gi, '投资产品'],
  [/collective investment scheme/gi, '集体投资计划（CIS）'],
  [/investment-linked polic(?:y|ies)/gi, '投资联结保单（ILP）'],
  [/Central Provident Fund/gi, '中央公积金（CPF）'],
  [/CPF contribution/gi, 'CPF 缴款'],
  [/permanent residency/gi, '永久居民身份'],
  [/permanent resident/gi, '永久居民'],
  [/Singapore Citizen/gi, '新加坡公民'],
  [/citizen/gi, '公民'],
  [/Asia Pacific country/gi, '亚太国家'],
  [/is exempted from CPF contribution/gi, '可豁免 CPF 缴款'],
  [/are both required to contribute to his CPF/gi, '都必须为他的 CPF 缴款'],
  [/only required to contribute to his CPF Medisave account/gi, '只需向其 CPF Medisave 账户缴款'],
  [/contribution to his CPF is voluntary/gi, 'CPF 缴款是自愿的'],
  [/not born in Singapore/gi, '不是在新加坡出生'],
  [/money laundering/gi, '洗钱'],
  [/terrorism financing/gi, '恐怖主义融资'],
  [/politically exposed person/gi, '政治公众人物（PEP）'],
  [/customer'?s interest/gi, '客户利益'],
  [/fair dealing/gi, '公平交易'],
  [/conflict of interest/gi, '利益冲突'],
  [/ethical behavior/gi, '道德行为'],
  [/professional ethics/gi, '专业伦理'],
  [/fact finding/gi, '事实调查'],
  [/needs analysis/gi, '需求分析'],
  [/financial status/gi, '财务状况'],
  [/portfolio/gi, '投资组合'],
  [/death and total permanent disability coverage/gi, '死亡及完全永久伤残保障'],
  [/Promote and sustain economic growth/gi, '促进并维持经济增长'],
  [/Regulate and control the financial sector/gi, '监管并控制金融业'],
  [/Manage Singapore’s foreign reserves and assets/gi, '管理新加坡外汇储备和资产'],
  [/Conduct surveillance of Singapore’s financial stability/gi, '监测新加坡金融稳定'],
  [/Moral/gi, '道德动机'],
  [/Self-interest/gi, '自利动机'],
  [/Machiavellianism/gi, '马基雅维利主义'],
  [/Affection/gi, '情感/偏爱'],
  [/Avoid sanctions/gi, '避免制裁'],
  [/Do the right thing/gi, '做正确的事'],
  [/Seek a promotion/gi, '寻求晋升'],
  [/Continue to be in the business/gi, '继续从事该业务'],
  [/Aristotle/gi, '亚里士多德'],
  [/Socrates/gi, '苏格拉底'],
  [/Immanuel Kant/gi, '伊曼努尔·康德'],
  [/John Stuart Mill/gi, '约翰·斯图尔特·密尔'],
  [/Principle of Integrity/gi, '诚信原则（Principle of Integrity）'],
  [/Principle of Selflessness/gi, '无私原则（Principle of Selflessness）'],
  [/Principle of Honesty/gi, '诚实原则（Principle of Honesty）'],
  [/Principle of over delivering one’s promise/gi, '超额履行承诺原则'],
];

export function studyTranslate(text) {
  const original = String(text || '').trim();
  if (!original) return '';
  let translated = original;
  for (const [re, zh] of TERM_ZH) translated = translated.replace(re, zh);
  translated = translated
    .replace(/\bthe 新加坡金融管理局/g, '新加坡金融管理局')
    .replace(/\bNOT\b/g, '不 / NOT')
    .replace(/\bTRUE\b/g, '正确 / TRUE')
    .replace(/\bCORRECT\b/g, '正确 / CORRECT')
    .replace(/\bFALSE\b/g, '错误 / FALSE')
    .replace(/\s+/g, ' ')
    .trim();
  if (!hasUsefulChineseAid(translated)) return '';
  return `【中文术语辅助】${translated}`;
}

function hasUsefulChineseAid(text) {
  const clean = String(text || '').trim();
  const zhCount = (clean.match(/[\u4e00-\u9fff]/g) || []).length;
  const latinCount = (clean.match(/[A-Za-z]/g) || []).length;
  if (zhCount < 4) return false;
  return latinCount / (latinCount + zhCount) <= 0.55;
}

function optionObject(options, key) {
  const found = (options || []).find(option => option.letter === key);
  return found ? found.text : '';
}

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'that', 'with', 'from', 'this', 'which', 'following', 'statement',
  'statements', 'correct', 'true', 'false', 'not', 'one', 'about', 'regarding', 'under',
  'what', 'when', 'where', 'who', 'why', 'how', 'his', 'her', 'their', 'its', 'are',
  'was', 'were', 'has', 'have', 'had', 'does', 'will', 'can', 'may', 'should',
]);

function tokens(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9$]+/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOP_WORDS.has(t));
}

function scoreText(needleTokens, text) {
  const hay = new Set(tokens(text));
  return needleTokens.reduce((sum, token) => sum + (hay.has(token) ? 1 : 0), 0);
}

function firstSentence(text, max = 260) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  const sentence = clean.split(/(?<=[.!?。])\s+/)[0] || clean;
  return sentence.length > max ? sentence.slice(0, max - 1).trimEnd() + '…' : sentence;
}

function bestSentence(text, queryTokens, max = 320) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  const sentences = clean.split(/(?<=[.!?。])\s+/).filter(Boolean);
  const best = sentences
    .map(sentence => ({ sentence, score: scoreText(queryTokens, sentence) }))
    .sort((a, b) => b.score - a.score)[0];
  return firstSentence(best?.sentence || sentences[0] || clean, max);
}

function questionDirective(stem) {
  const lines = String(stem || '')
    .split(/\n+/)
    .map(line => line.trim())
    .filter(Boolean);
  const directive = [...lines]
    .reverse()
    .find(line => /^(which|what|who|when|where|how|under|is|are|does|do)\b/i.test(line));
  return directive || lines.at(-1) || String(stem || '');
}

function isReverseQuestion(stem) {
  return /\b(NOT|FALSE|EXCEPT|LEAST)\b/i.test(questionDirective(stem));
}

function stripStudyPrefix(text) {
  return String(text || '')
    .replace(/^【(?:学习辅助翻译|中文术语辅助)】/, '')
    .replace(/\s*[.。]\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanKeyPoint(text) {
  let clean = chineseBeforeSlash(text)
    .replace(/信任方程式:Trust=\(Credibility\+Reliability\+Intimacy\)\/Self-Interest/g, '信任方程式：可信度、可靠性和亲密度越高，自利程度越低，信任越高')
    .replace(/Trust=\(Credibility\+Reliability\+Intimacy\)\/Self-Interest/g, '信任方程式：可信度、可靠性和亲密度越高，自利程度越低，信任越高')
    .replace(/信任方程式[:：]信任方程式：/g, '信任方程式：')
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean) return '';

  const withoutKnownTerms = clean.replace(
    /\b(FAA|FAR|MAS|CPF|CIS|ILP|ILPs|AML|CFT|PDPA|SFA|RNF|CPD|VCC|ETF|SIP|CKA|CAR|PEP|KYC|LIA|FNA|TPD|SRS|OA|RA|MA)\b/g,
    ''
  );
  if (/[A-Za-z]{4,}/.test(withoutKnownTerms)) return '';
  return clean;
}

function chineseBeforeSlash(text) {
  return String(text || '').split(' / ')[0].replace(/\s+/g, ' ').trim();
}

function optionLabel(q, key) {
  const zh = stripStudyPrefix(q.optionsZh?.[key]);
  const en = String(q.optionsEn?.[key] || '').trim();
  if (!zh) return '该选项所述内容';
  if (!en || zh.includes(en)) return zh;

  const hasChinese = /[\u4e00-\u9fff]/.test(zh);
  const isMostlyEnglish = !hasChinese || /^[A-Za-z0-9$£€.,;:'"()/%\-\s]+$/.test(zh);
  if (isMostlyEnglish) return '该选项';

  const hasTerm =
    /\b(FAA|FAR|MAS|CPF|CIS|ILP|AML|CFT|PDPA|SFA|RNF|CPD|VCC|ETF|SIP|CKA|CAR|PEP|KYC)\b/i.test(en) ||
    /\b(financial adviser|representative|collective investment scheme|investment-linked|money laundering|terrorism financing|conflict of interest|fair dealing|fact finding|needs analysis|portfolio|professional ethics|ethical behavior|unethical behavior|market conduct)\b/i.test(en);
  return hasTerm ? `${zh}（${en}）` : zh;
}

function syllabusLabel(syllabusItemId) {
  return SYLLABUS_ZH[syllabusItemId] || formatKnowledgePoint(syllabusItemId);
}

function bestEvidence(note, q) {
  const fallback = {
    headings: [formatKnowledgePoint(q.syllabusItemId)],
    basisText: `Use the mapped syllabus item ${formatKnowledgePoint(q.syllabusItemId)} to verify the rule tested by this SCI question.`,
    checklist: [`复习 ${formatKnowledgePoint(q.syllabusItemId)} 的定义、适用范围、例外和数字门槛。`],
    sourceRef: '',
  };
  if (!note) return fallback;

  const query = tokens([q.stemEn, q.optionsEn[q.answer]].join(' '));
  const sections = (note.sections || [])
    .map(section => ({
      section,
      score: scoreText(query, `${section.heading} ${section.body}`),
    }))
    .sort((a, b) => b.score - a.score);
  const picked = sections.filter(row => row.score > 0).slice(0, 2);
  const effective = picked.length ? picked : sections.slice(0, 1);

  const keyPoints = (note.keyPoints || [])
    .map(point => ({ point, score: scoreText(query, point) }))
    .sort((a, b) => b.score - a.score)
    .filter(row => row.score > 0)
    .map(row => row.point);
  const checklist = (keyPoints.length ? keyPoints : (note.keyPoints || [])).slice(0, 4);

  return {
    headings: effective.map(row => row.section.heading),
    basisText: effective.map(row => `${row.section.heading}: ${bestSentence(row.section.body, query)}`).join(' '),
    checklist: checklist.length ? checklist : [firstSentence(note.summary || fallback.checklist[0])],
    sourceRef: note.sourceRef || '',
  };
}

function answerSubject(answerText, answerKey) {
  return answerText === '该选项所述内容' ? `选项 ${answerKey}` : answerText;
}

function wrongOptionAnalysis({ key, text, answerText, answerKey, reverse, keyPoints }) {
  const optionText = text === '该选项所述内容' ? '该选项' : text;
  const answer = answerSubject(answerText, answerKey);
  const ruleHint = keyPoints[0] ? `判断依据是：${keyPoints[0]}。` : '';

  if (reverse) {
    return `${key} 错在：${optionText}属于题干所考规则范围内，不是例外项；题干要找的是“不属于/错误”的选项，真正的例外是${answer}。${ruleHint}`;
  }

  return `${key} 错在：${optionText}不是题干要找的正确项目；本题正确项应直接对应${answer}。${ruleHint}`;
}

export function buildSciExplanation(q, note) {
  const evidence = bestEvidence(note, q);
  const reverse = isReverseQuestion(q.stemEn);
  const answerText = optionLabel(q, q.answer);
  const answer = answerSubject(answerText, q.answer);
  const keyPoints = evidence.checklist.map(cleanKeyPoint).filter(Boolean).slice(0, 3);
  const keyPointText = keyPoints.length ? `判断时抓住：${keyPoints.join('；')}。` : '';
  const correctMode = reverse
    ? `题干问“不是/错误/例外”的选项，${answer}是规则之外的例外项。`
    : `题干问正确或最符合规则的选项，${answer}直接对应本题考点。`;

  const optionAnalysis = {};
  for (const key of ['A', 'B', 'C', 'D']) {
    const text = optionLabel(q, key);
    if (key === q.answer) {
      optionAnalysis[key] = `${key} 正确：${text}。${correctMode}`;
    } else {
      optionAnalysis[key] = wrongOptionAnalysis({
        key,
        text,
        answerText,
        answerKey: q.answer,
        reverse,
        keyPoints,
      });
    }
  }

  return {
    kind: 'learning-aid',
    basis: `这道题考察的是${syllabusLabel(q.syllabusItemId)}。`,
    correctReason: `${keyPointText}${correctMode}所以正确答案是 ${q.answer}。`,
    optionAnalysis,
    finalAnswer: answerText === '该选项所述内容' ? q.answer : `${q.answer}. ${answerText}`,
  };
}

export function toSciQuestion(raw, context = {}) {
  const { part, syllabusItemId } = classifySciQuestion(raw);
  if (!isValidSyllabusItemId(syllabusItemId)) throw new Error(`invalid syllabusItemId ${syllabusItemId}`);
  const n = String(raw.number).padStart(3, '0');
  const id = `sci-q-${n}`;
  const stemEn = raw.question.trim();
  const optionsEn = {
    A: optionObject(raw.options, 'A'),
    B: optionObject(raw.options, 'B'),
    C: optionObject(raw.options, 'C'),
    D: optionObject(raw.options, 'D'),
  };
  const fullTranslation = context.translationsById?.[id] || {};
  const translatedOptions = fullTranslation.options || {};
  const kp = formatKnowledgePoint(syllabusItemId);
  const q = {
    id,
    number: raw.number,
    part,
    syllabusItemId,
    stemEn,
    stemZh: fullTranslation.stem || studyTranslate(stemEn),
    optionsEn,
    optionsZh: {
      A: translatedOptions.A || studyTranslate(optionsEn.A),
      B: translatedOptions.B || studyTranslate(optionsEn.B),
      C: translatedOptions.C || studyTranslate(optionsEn.C),
      D: translatedOptions.D || studyTranslate(optionsEn.D),
    },
    answer: raw.correct_letter,
    knowledgePoint: `考点：${kp}`,
    pitfall: `易错：注意题干中的 NOT / TRUE / CORRECT 等限定词，并回到 ${kp} 判断。`,
    sourceRef: `SCI RES5 eBook/Mock Exam extracted 2026-06-20 · ${raw.html5url || raw.source_file || ''}`.trim(),
  };
  q.explanation = buildSciExplanation(q, context.notesByItem?.[syllabusItemId]);
  return q;
}

export async function loadSciContent(fetchFn = fetch) {
  const res = await fetchFn('content/sci/questions.json');
  if (!res.ok) throw new Error(`SCI questions load failed: HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error('SCI questions load failed: top-level not an array');
  return data;
}
