export const SCI_MOCK_GROUP = { count: 15, size: 20 };

const bySourceOrder = (a, b) =>
  (a.part || 0) - (b.part || 0) ||
  (a.number || 0) - (b.number || 0) ||
  String(a.id).localeCompare(String(b.id));

export function buildSciMockGroups(questions) {
  const ordered = questions.slice().sort(bySourceOrder).slice(0, SCI_MOCK_GROUP.count * SCI_MOCK_GROUP.size);
  return Array.from({ length: SCI_MOCK_GROUP.count }, (_, i) =>
    ordered.slice(i * SCI_MOCK_GROUP.size, (i + 1) * SCI_MOCK_GROUP.size)
  );
}

export function buildSciMockSet(questions, groupNumber = 1) {
  const index = Math.max(0, Number(groupNumber || 1) - 1);
  return buildSciMockGroups(questions)[index] || [];
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
