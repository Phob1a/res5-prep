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
  return `【学习辅助翻译】${translated}`;
}

function optionObject(options, key) {
  const found = (options || []).find(option => option.letter === key);
  return found ? found.text : '';
}

export function toSciQuestion(raw) {
  const { part, syllabusItemId } = classifySciQuestion(raw);
  if (!isValidSyllabusItemId(syllabusItemId)) throw new Error(`invalid syllabusItemId ${syllabusItemId}`);
  const n = String(raw.number).padStart(3, '0');
  const stemEn = raw.question.trim();
  const optionsEn = {
    A: optionObject(raw.options, 'A'),
    B: optionObject(raw.options, 'B'),
    C: optionObject(raw.options, 'C'),
    D: optionObject(raw.options, 'D'),
  };
  const kp = formatKnowledgePoint(syllabusItemId);
  return {
    id: `sci-q-${n}`,
    number: raw.number,
    part,
    syllabusItemId,
    stemEn,
    stemZh: studyTranslate(stemEn),
    optionsEn,
    optionsZh: {
      A: studyTranslate(optionsEn.A),
      B: studyTranslate(optionsEn.B),
      C: studyTranslate(optionsEn.C),
      D: studyTranslate(optionsEn.D),
    },
    answer: raw.correct_letter,
    knowledgePoint: `考点：${kp}`,
    pitfall: `易错：注意题干中的 NOT / TRUE / CORRECT 等限定词，并回到 ${kp} 判断。`,
    sourceRef: `SCI RES5 eBook/Mock Exam extracted 2026-06-20 · ${raw.html5url || raw.source_file || ''}`.trim(),
  };
}

export async function loadSciContent(fetchFn = fetch) {
  const res = await fetchFn('content/sci/questions.json');
  if (!res.ok) throw new Error(`SCI questions load failed: HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error('SCI questions load failed: top-level not an array');
  return data;
}
