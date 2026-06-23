/* RES5 备考 · SCI 原题视图:原题学习 / SCI Mock / SCI 错题 */
(function () {
const U = window.RES5UI;
const { React, Icon, PageHead, PartBadge, GroupBadge, SyllabusPicker, useStore, sylItem, SYL, pct1 } = U;
const { useState, useMemo } = React;
const R5 = window.RES5;

const byPart = (part) => (q) => !part || q.part === part;
const bySyllabus = (id) => (q) => !id || q.syllabusItemId === id;
const sortedSci = (arr) => arr.slice().sort((a, b) =>
  a.part - b.part || a.syllabusItemId.localeCompare(b.syllabusItemId) || a.number - b.number
);
const SCI_OFFICIAL_MOCK = { part1Count: 110, part2Count: 40 };
const bySourceNumber = (a, b) => (a.number || 0) - (b.number || 0) || String(a.id).localeCompare(String(b.id));
const buildSciOfficialMock = (questions) => {
  const part1 = questions.filter(q => q.part === 1).sort(bySourceNumber).slice(0, SCI_OFFICIAL_MOCK.part1Count);
  const part2 = questions.filter(q => q.part === 2).sort(bySourceNumber).slice(0, SCI_OFFICIAL_MOCK.part2Count);
  return [...part1, ...part2];
};

function SciNotice() {
  return (
    <div className="draft-banner">
      <span className="dot"></span>
      <span>SCI 英文题干/答案来自抓取的 eBook/Mock 资源；中文翻译、题解、考点和易错点是学习辅助版，非 SCI 官方中文/官方题解。</span>
    </div>
  );
}

function SciExplanation({ q, resultLine }) {
  const ex = q.explanation;
  if (!ex) {
    return (
      <div className="explain good">
        {resultLine && <div className="ex-head">{resultLine}</div>}
        <div>{q.knowledgePoint}</div>
        <div style={{ marginTop: 6 }}>{q.pitfall}</div>
      </div>
    );
  }
  return (
    <div className="explain good">
      {resultLine && <div className="ex-head">{resultLine}</div>}
      <div className="ex-head"><Icon name="target" size={14} />题解</div>
      {ex.basis && <div style={{ marginTop: 8 }}>{ex.basis}</div>}
      {ex.correctReason && <div style={{ marginTop: 8 }}>{ex.correctReason}</div>}
      <div style={{ marginTop: 10 }}>
        {['A', 'B', 'C', 'D'].map(k => (
          <div key={k} style={{ marginTop: 6 }}>{ex.optionAnalysis[k]}</div>
        ))}
      </div>
      {ex.finalAnswer && <div style={{ marginTop: 10 }}>最终答案：{ex.finalAnswer}</div>}
    </div>
  );
}

function SciQuestionCard({ q, compact, action }) {
  const item = sylItem(q.syllabusItemId);
  return (
    <div className="card pad" style={{ marginBottom: 14 }}>
      <div className="q-meta">
        <span className="mono" style={{ color: 'var(--fg3)', fontSize: 12 }}>{q.id}</span>
        <PartBadge part={q.part} />
        <GroupBadge id={q.syllabusItemId} />
        <span className="badge badge-reviewed">SCI</span>
      </div>
      <p className="q-stem">{q.stemEn}</p>
      {!compact && <p className="summary" style={{ margin: '10px 0 14px' }}>{q.stemZh}</p>}
      <div className="opts">
        {['A', 'B', 'C', 'D'].map(k => (
          <div key={k} className={'opt readonly' + (k === q.answer ? ' is-correct' : '')}>
            <span className="opt-key">{k}</span>
            <span className="opt-text">
              {q.optionsEn[k]}
              {!compact && <span className="muted" style={{ display: 'block', marginTop: 4 }}>{q.optionsZh[k]}</span>}
            </span>
            {k === q.answer && <span className="opt-flag">答案</span>}
          </div>
        ))}
      </div>
      <SciExplanation q={q} resultLine={<><Icon name="target" size={14} />正确答案 {q.answer} · {q.optionsEn[q.answer]}</>} />
      <span className="ex-src">知识点 · {item.id} {item.title}</span>
      {action && <div className="row" style={{ marginTop: 12 }}>{action}</div>}
    </div>
  );
}

function SciStudy() {
  const questions = R5.SCI_QUESTIONS || [];
  const [part, setPart] = useState(0);
  const [item, setItem] = useState('');
  const available = useMemo(() => new Set(questions.filter(byPart(part)).map(q => q.syllabusItemId)), [questions, part]);
  const pool = useMemo(() => sortedSci(questions.filter(byPart(part)).filter(bySyllabus(item))), [questions, part, item]);

  return (
    <div className="view-inner">
      <PageHead eyebrow="SCI 原题 · ORIGINALS" title="原题快速学习"
        sub="按 Part 与知识点排列，直接查看题目、选项、正确答案、考点和易错点。" />
      <SciNotice />
      <div className="chips" style={{ marginBottom: 14 }}>
        {[[0, '全部'], [1, 'Part I'], [2, 'Part II']].map(([v, label]) => (
          <button key={v} className={'chip' + (part === v ? ' is-active' : '')} onClick={() => { setPart(v); setItem(''); }}>{label}</button>
        ))}
      </div>
      <SyllabusPicker value={item} onChange={setItem} available={available} allLabel="全部知识点" />
      <div className="progress-strip">
        <span className="pbar-count">SCI 原题 {pool.length} / {questions.length}</span>
        <div className="pbar"><div className="pbar-fill" style={{ width: (questions.length ? pool.length / questions.length * 100 : 0) + '%' }} /></div>
        <span className="pbar-count">{item || (part ? 'Part ' + (part === 1 ? 'I' : 'II') : '全部')}</span>
      </div>
      {pool.length === 0 && <div className="empty">暂无 SCI 原题</div>}
      {pool.map(q => <SciQuestionCard key={q.id} q={q} />)}
    </div>
  );
}

function grade(questions, answers) {
  const rows = questions.map(q => {
    const chosen = answers[q.id] || '';
    return { q, chosen, ok: chosen === q.answer };
  });
  const correct = rows.filter(r => r.ok).length;
  return { rows, total: rows.length, correct, rate: rows.length ? correct / rows.length : 0 };
}

function SciMock() {
  const store = useStore();
  const all = R5.SCI_QUESTIONS || [];
  const [running, setRunning] = useState(null);
  const [result, setResult] = useState(null);
  const pool = useMemo(() => buildSciOfficialMock(all), [all]);
  const p1 = all.filter(q => q.part === 1).length;
  const p2 = all.filter(q => q.part === 2).length;
  const canStart = p1 >= SCI_OFFICIAL_MOCK.part1Count && p2 >= SCI_OFFICIAL_MOCK.part2Count;

  function start() {
    setResult(null);
    setRunning({ pick: pool, idx: 0, answers: {} });
  }
  function choose(k) {
    setRunning(s => ({ ...s, answers: { ...s.answers, [s.pick[s.idx].id]: k } }));
  }
  function submit() {
    const res = grade(running.pick, running.answers);
    for (const row of res.rows) if (!row.ok) store.addSciWrong(row.q.id);
    store.pushSciExam({ mode: 'official', total: res.total, correct: res.correct, rate: res.rate, at: new Date().toISOString().slice(0, 10) });
    setResult(res);
    setRunning(null);
  }

  if (result) {
    return (
      <div className="view-inner">
        <PageHead eyebrow="SCI MOCK · 结果" title="SCI 原题成绩单"
          right={<button className="btn" onClick={() => setResult(null)}><Icon name="left" size={15} />返回</button>} />
        <div className="verdict neutral">
          <div className="v-tag">SCI Mock 完成</div>
          <div className="score-row">
            <div className="sc"><div className="sc-v">{pct1(result.rate)}%</div><div className="sc-l">正确率</div></div>
            <div className="sc"><div className="sc-v">{result.correct}<span style={{ fontSize: 16, color: 'var(--fg3)' }}>/{result.total}</span></div><div className="sc-l">答对</div></div>
            <div className="sc"><div className="sc-v" style={{ color: 'var(--bad-ink)' }}>{result.total - result.correct}</div><div className="sc-l">新增/保留错题</div></div>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          {result.rows.map((row, i) => (
            <div key={row.q.id} className="card pad" style={{ marginBottom: 14 }}>
              <div className="q-meta">
                <span className="mono" style={{ color: row.ok ? 'var(--good-ink)' : 'var(--bad-ink)', fontSize: 12 }}>Q{i + 1} {row.ok ? '✓' : '✗'}</span>
                <PartBadge part={row.q.part} /><GroupBadge id={row.q.syllabusItemId} />
              </div>
              <p className="q-stem">{row.q.stemEn}</p>
              <p className="summary" style={{ margin: '10px 0 14px' }}>{row.q.stemZh}</p>
              <div className="opts">
                {['A', 'B', 'C', 'D'].map(k => {
                  let cls = 'opt readonly';
                  if (k === row.q.answer) cls += ' is-correct';
                  else if (k === row.chosen) cls += ' is-wrong';
                  return (
                    <div key={k} className={cls}>
                      <span className="opt-key">{k}</span><span className="opt-text">{row.q.optionsEn[k]}</span>
                      {k === row.q.answer && <span className="opt-flag">正确</span>}
                      {k === row.chosen && !row.ok && <span className="opt-flag">你选</span>}
                    </div>
                  );
                })}
              </div>
              <SciExplanation q={row.q} resultLine={<><Icon name={row.ok ? 'check' : 'x'} size={14} />你选 {row.chosen || '未答'} · 正确 {row.q.answer}</>} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (running) {
    const q = running.pick[running.idx];
    const answered = Object.keys(running.answers).length;
    return (
      <div className="view-inner">
        <div className="exam-bar">
          <button className="btn btn-sm" onClick={() => setRunning(null)}><Icon name="x" size={14} /></button>
          <span className="badge badge-reviewed">SCI 官方规格</span>
          <span className="mono" style={{ fontSize: 12, color: 'var(--fg3)' }}>{answered}/{running.pick.length}</span>
          <button className="btn btn-primary btn-sm" onClick={submit}>交卷</button>
        </div>
        <div className="card pad">
          <div className="q-meta"><span className="mono" style={{ color: 'var(--fg3)', fontSize: 12 }}>Q{running.idx + 1}</span><PartBadge part={q.part} /><GroupBadge id={q.syllabusItemId} /></div>
          <p className="q-stem">{q.stemEn}</p>
          <p className="summary" style={{ margin: '10px 0 14px' }}>{q.stemZh}</p>
          <div className="opts">
            {['A', 'B', 'C', 'D'].map(k => (
              <button key={k} className={'opt' + (running.answers[q.id] === k ? ' is-chosen' : '')} onClick={() => choose(k)}>
                <span className="opt-key">{k}</span><span className="opt-text">{q.optionsEn[k]}<span className="muted" style={{ display: 'block', marginTop: 4 }}>{q.optionsZh[k]}</span></span>
              </button>
            ))}
          </div>
          <div className="row" style={{ marginTop: 18 }}>
            <button className="btn btn-sm" onClick={() => setRunning(s => ({ ...s, idx: Math.max(0, s.idx - 1) }))} disabled={running.idx === 0}><Icon name="left" size={15} />上一题</button>
            <div className="spacer" />
            <button className="btn btn-sm" onClick={() => setRunning(s => ({ ...s, idx: Math.min(s.pick.length - 1, s.idx + 1) }))} disabled={running.idx >= running.pick.length - 1}>下一题<Icon name="right" size={15} /></button>
          </div>
        </div>
        <div className="card pad" style={{ marginTop: 14 }}>
          <div className="field-lab" style={{ marginBottom: 10 }}>答题卡</div>
          <div className="qgrid">
            {running.pick.map((item, i) => (
              <button key={item.id} className={'qgrid-btn' + (running.answers[item.id] ? ' answered' : '') + (i === running.idx ? ' current' : '')} onClick={() => setRunning(s => ({ ...s, idx: i }))}>{i + 1}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="view-inner">
      <PageHead eyebrow="SCI MOCK" title="SCI 原题考试"
        sub="只使用官方规格：Part I 110 题 + Part II 40 题，共 150 题；交卷后自动记录错题。" />
      <SciNotice />
      <div className="card pad">
        <div className="stat-grid" style={{ marginBottom: 16 }}>
          <div className="stat-cell"><div className="s-num">{p1}</div><div className="s-lab">Part I 题库</div></div>
          <div className="stat-cell"><div className="s-num">{p2}</div><div className="s-lab">Part II 题库</div></div>
          <div className="stat-cell"><div className="s-num">150</div><div className="s-lab">本次题量</div></div>
        </div>
        <p className="page-sub" style={{ marginBottom: 18 }}>
          本次固定抽取 Part I 前 110 题与 Part II 前 40 题，按原题顺序作答。
        </p>
        <button className="btn btn-primary btn-lg" onClick={start} disabled={!canStart}>
          <Icon name="clock" size={17} />开始 SCI 官方规格 Mock
        </button>
        {!canStart && <p className="note" style={{ marginTop: 12 }}>题库数量不足，需至少 Part I {SCI_OFFICIAL_MOCK.part1Count} 题、Part II {SCI_OFFICIAL_MOCK.part2Count} 题。</p>}
      </div>
      {(store.state.sciExamHistory || []).length > 0 && (
        <div className="card pad" style={{ marginTop: 16 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, margin: '0 0 12px', color: 'var(--fg2)' }}>SCI 历史成绩</h3>
          {(store.state.sciExamHistory || []).slice().reverse().map((h, i) => (
            <div key={i} className="report-row"><span className="mono">{h.at}</span><span className="badge badge-part">{h.mode}</span><div className="spacer" /><span className="mono">{h.correct}/{h.total} · {pct1(h.rate)}%</span></div>
          ))}
        </div>
      )}
    </div>
  );
}

function SciWrong() {
  const store = useStore();
  const ids = store.state.sciWrongbook || [];
  const wrong = sortedSci((R5.SCI_QUESTIONS || []).filter(q => ids.includes(q.id)));
  return (
    <div className="view-inner">
      <PageHead eyebrow="SCI 错题 · WRONGBOOK" title="SCI 原题错题本"
        sub="只记录 SCI Mock 中答错或未答的原题。"
        right={wrong.length > 0 && <button className="btn btn-sm" onClick={store.clearSciWrong}><Icon name="x" size={14} />清空</button>} />
      <SciNotice />
      {wrong.length === 0 && <div className="empty">暂无 SCI 错题</div>}
      {wrong.map(q => <SciQuestionCard key={q.id} q={q} action={<button className="btn btn-sm" onClick={() => store.removeSciWrong(q.id)}><Icon name="check" size={14} />已掌握，移出错题本</button>} />)}
    </div>
  );
}

window.RES5Views = Object.assign(window.RES5Views || {}, { SciStudy, SciMock, SciWrong });
})();
