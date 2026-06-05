/* RES5 备考 · 静态考纲 + 常量。题/卡/讲义由 boot.jsx 从 content/*.json 实时加载后填入。 */
(function () {
  const SYLLABUS = [
    { id: 's01', part: 1, topicGroup: 'rules', title: 'FAA & FAR — Financial Advisers and Representatives' },
    { id: 's02', part: 1, topicGroup: 'rules', title: 'FAA & FAR — Conduct of Business, Power of Authority and Offences' },
    { id: 's03', part: 1, topicGroup: 'notices', title: 'MAS Notices — Part I [FAA-N16; FAA-N03; FAA-N11]' },
    { id: 's04', part: 1, topicGroup: 'notices', title: 'MAS Notices — Part II [FAA-N02; FAA-N10; FAA-N12; FAA-N14; FAA-N20; FAA-N26]' },
    { id: 's05', part: 1, topicGroup: 'aml', title: 'MAS Notice FAA-N06 — Prevention of Money Laundering & CFT (AML/CFT)' },
    { id: 's06', part: 1, topicGroup: 'notices', title: 'MAS Notices — Part III [FAA-N17; FSM-N23; FAA-N19; FSM-N24]' },
    { id: 's07', part: 1, topicGroup: 'products', title: 'MAS Notice MAS 307 — Investment-linked Policies (ILPs)' },
    { id: 's08', part: 1, topicGroup: 'guidelines', title: 'MAS Guidelines — Part I [FAA-G01; FSG-G01; FAA-G04; FAA-G05] + Circular CMI 01/2011' },
    { id: 's09', part: 1, topicGroup: 'guidelines', title: 'MAS Guidelines — Part II [FAA-G09; FAA-G10; FSG-G04; FAA-G14]' },
    { id: 's10', part: 1, topicGroup: 'guidelines', title: 'MAS Guidelines — Part III [FAA-G13; FAA-G15; FAA-G16; CMG-G02; FSG-G02]' },
    { id: 's11', part: 1, topicGroup: 'products', title: 'Revised Code on Collective Investment Schemes' },
    { id: 's12', part: 1, topicGroup: 'conduct', title: 'Securities Dealing — Market Conduct' },
    { id: 's13', part: 1, topicGroup: 'products', title: 'Central Provident Fund (CPF)' },
    { id: 's14', part: 2, topicGroup: 'ethics', title: 'Why Professional Ethics Matter' },
    { id: 's15', part: 2, topicGroup: 'ethics', title: 'Professionalism' },
    { id: 's16', part: 2, topicGroup: 'ethics', title: 'Ethical Behavior' },
    { id: 's17', part: 2, topicGroup: 'ethics', title: 'Unethical Behavior' },
    { id: 's18', part: 2, topicGroup: 'ethics', title: 'Conflict of Interest' },
    { id: 's19', part: 2, topicGroup: 'ethics', title: 'Fair Dealing' },
    { id: 's20', part: 2, topicGroup: 'sales', title: 'Ethical Marketing & Sale of Financial Products' },
    { id: 's21', part: 2, topicGroup: 'process', title: 'Developing Client–Representative Relationships' },
    { id: 's22', part: 2, topicGroup: 'process', title: 'Fact Finding and Needs Analysis' },
    { id: 's23', part: 2, topicGroup: 'process', title: "Analysing and Evaluating a Client's Financial Status" },
    { id: 's24', part: 2, topicGroup: 'process', title: 'Developing Appropriate Strategies and Solutions' },
    { id: 's25', part: 2, topicGroup: 'process', title: 'Presentation of Analysis and Solutions to Clients' },
    { id: 's26', part: 2, topicGroup: 'process', title: "Reviewing Clients' Portfolios" },
    { id: 's27', part: 2, topicGroup: 'process', title: 'Basic Financial Planning Guide' },
  ];
  const GROUP_LABEL = {
    rules: '法规', notices: 'MAS 通告', aml: '反洗钱', products: '产品',
    guidelines: '指引', conduct: '市场行为', ethics: '职业道德', sales: '销售', process: '理财流程',
  };
  const FULL_MOCK = { part1Count: 110, part1Pass: 0.75, part2Count: 40, part2Pass: 0.80 };

  // 内容数组在 boot.jsx 加载 content/*.json 后填入
  window.RES5 = { SYLLABUS, GROUP_LABEL, FULL_MOCK, QUESTIONS: [], FLASHCARDS: [], NOTES: [] };
})();
