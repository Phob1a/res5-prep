export const SCI_OFFICIAL_MOCK = { part1Count: 110, part2Count: 40 };

export function buildSciOfficialMock(questions) {
  const byNumber = (a, b) => (a.number || 0) - (b.number || 0) || String(a.id).localeCompare(String(b.id));
  const part1 = questions.filter(q => q.part === 1).sort(byNumber).slice(0, SCI_OFFICIAL_MOCK.part1Count);
  const part2 = questions.filter(q => q.part === 2).sort(byNumber).slice(0, SCI_OFFICIAL_MOCK.part2Count);
  return [...part1, ...part2];
}

export function gradeSciExam(questions, answers) {
  const rows = questions.map(q => {
    const chosen = answers[q.id] || '';
    const isCorrect = chosen === q.answer;
    return {
      id: q.id,
      part: q.part,
      chosen,
      correct: q.answer,
      isCorrect,
      question: q,
    };
  });
  const correct = rows.filter(row => row.isCorrect).length;
  const total = rows.length;
  return {
    total,
    correct,
    rate: total ? correct / total : 0,
    rows,
  };
}

export function addSciWrong(state, qid) {
  const existing = Array.isArray(state.sciWrongbook) ? state.sciWrongbook : [];
  if (existing.includes(qid)) return { ...state, sciWrongbook: existing };
  return { ...state, sciWrongbook: [...existing, qid] };
}

export function removeSciWrong(state, qid) {
  const existing = Array.isArray(state.sciWrongbook) ? state.sciWrongbook : [];
  return { ...state, sciWrongbook: existing.filter(id => id !== qid) };
}

export function clearSciWrong(state) {
  return { ...state, sciWrongbook: [] };
}
