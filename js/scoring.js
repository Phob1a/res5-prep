export const FULL_MOCK = { part1Count: 110, part1Pass: 0.75, part2Count: 40, part2Pass: 0.80 };

// counts: { 1: n, 2: n }
export function canRunFullMock(counts) {
  return (counts[1] || 0) >= FULL_MOCK.part1Count && (counts[2] || 0) >= FULL_MOCK.part2Count;
}

// raw: { part1:{correct,total}, part2:{correct,total} }；official:boolean
export function gradeExam(raw, { official }) {
  const part = (p, passRate) => {
    const rate = p.total ? p.correct / p.total : 0;
    return { correct: p.correct, total: p.total, rate, pass: official ? rate >= passRate : null };
  };
  const p1 = part(raw.part1, FULL_MOCK.part1Pass);
  const p2 = part(raw.part2, FULL_MOCK.part2Pass);
  return { part1: p1, part2: p2, overallPass: official ? (p1.pass && p2.pass) : null };
}
