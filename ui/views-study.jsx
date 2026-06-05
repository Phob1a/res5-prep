/* RES5 备考 · 学习视图:刷题 / 速记 / 知识点 */
(function () {
const U = window.RES5UI;
const { React, Icon, PageHead, DraftBanner, PartBadge, GroupBadge, SyllabusPicker, useStore, sylItem, SYL, GROUP_LABEL, pct } = U;
const { useState, useMemo, useRef, useEffect } = React;
const R5 = window.RES5;

/* ===================== 刷题 Practice ===================== */
function Practice() {
  const store = useStore();
  const all = store.questions.filter(q => q.status !== 'retired');
  const [sel, setSel] = useState('');
  const pool = useMemo(() => sel ? all.filter(q => q.syllabusItemId === sel) : all, [sel, store.questions]);
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState({});   // qid -> key
  const [session, setSession] = useState({ done: 0, correct: 0 });
  useEffect(() => { setIdx(0); }, [sel]);

  const available = useMemo(() => new Set(all.map(q => q.syllabusItemId)), [store.questions]);
  if (!pool.length) return <Empty>该条目暂无题目</Empty>;
  const q = pool[Math.min(idx, pool.length - 1)];
  const pickedKey = chosen[q.id];
  const revealed = pickedKey != null;
  const isRight = pickedKey === q.answer;

  function choose(k) {
    if (revealed) return;
    setChosen(c => ({ ...c, [q.id]: k }));
    const correct = k === q.answer;
    setSession(s => ({ done: s.done + 1, correct: s.correct + (correct ? 1 : 0) }));
    store.logAnswer(q.id, correct);
    if (!correct) store.addWrong(q.id);
  }
  const next = () => setIdx(i => Math.min(i + 1, pool.length - 1));
  const prev = () => setIdx(i => Math.max(i - 1, 0));
  const acc = session.done ? session.correct / session.done : 0;

  return (
    <div className="view-inner">
      <PageHead eyebrow="刷题 · PRACTICE" title="逐题精练"
        sub="选条目逐题做,即时对错与解析;答错自动进错题本。" />
      <DraftBanner />
      <div className="progress-strip">
        <span className="pbar-count">{idx + 1} / {pool.length}</span>
        <div className="pbar"><div className="pbar-fill" style={{ width: ((idx + 1) / pool.length * 100) + '%' }} /></div>
        <span className="pbar-count">本节 {session.correct}/{session.done} 正确 · {session.done ? pct(acc) : '—'}%</span>
      </div>
      <SyllabusPicker value={sel} onChange={setSel} available={available} allLabel="全部条目" />

      <div className="card pad">
        <div className="q-meta">
          <span className="mono" style={{ color: 'var(--fg3)', fontSize: 12 }}>{q.id}</span>
          <PartBadge part={q.part} />
          <GroupBadge id={q.syllabusItemId} />
          <span className="badge badge-part" style={{ textTransform: 'capitalize' }}>{q.difficulty}</span>
          <span className="badge badge-draft">draft</span>
        </div>
        <p className="q-stem">{q.stem}</p>
        <div className="opts">
          {['A', 'B', 'C', 'D'].map(k => {
            let cls = 'opt';
            if (revealed) {
              if (k === q.answer) cls += ' is-correct';
              else if (k === pickedKey) cls += ' is-wrong';
            } else if (k === pickedKey) cls += ' is-chosen';
            return (
              <button key={k} className={cls} disabled={revealed} onClick={() => choose(k)}>
                <span className="opt-key">{k}</span>
                <span className="opt-text">{q.options[k]}</span>
                {revealed && k === q.answer && <span className="opt-flag">正确</span>}
                {revealed && k === pickedKey && !isRight && <span className="opt-flag">你的答案</span>}
              </button>
            );
          })}
        </div>
        {revealed && (
          <div className={'explain ' + (isRight ? 'good' : 'bad')}>
            <div className="ex-head"><Icon name={isRight ? 'check' : 'x'} size={14} />{isRight ? '答对了' : '答错了 — 已记入错题本'}</div>
            {q.explanation}
            <span className="ex-src">来源方向 · {q.sourceRef}</span>
          </div>
        )}
        <div className="row" style={{ marginTop: 18 }}>
          <button className="btn btn-sm" onClick={prev} disabled={idx === 0}><Icon name="left" size={15} />上一题</button>
          <div className="spacer" />
          <button className="btn btn-primary" onClick={next} disabled={idx >= pool.length - 1}>下一题<Icon name="right" size={15} /></button>
        </div>
      </div>
    </div>
  );
}

/* ===================== 速记 Flashcards ===================== */
function Flashcards() {
  const store = useStore();
  const cards = R5.FLASHCARDS;
  const [partFilter, setPartFilter] = useState(0);
  const deck = useMemo(() => partFilter ? cards.filter(c => c.part === partFilter) : cards, [partFilter]);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  useEffect(() => { setI(0); setFlipped(false); }, [partFilter]);
  const masteredCount = deck.filter(c => store.state.flashcardMastery[c.id]).length;
  if (!deck.length) return <Empty>暂无知识卡</Empty>;
  const c = deck[Math.min(i, deck.length - 1)];
  const mastered = !!store.state.flashcardMastery[c.id];
  const go = (d) => { setFlipped(false); setI(x => (x + d + deck.length) % deck.length); };

  return (
    <div className="view-inner">
      <PageHead eyebrow="速记 · FLASHCARDS" title="知识卡"
        sub="点击卡片翻面看要点;掌握了就标记,进度自动累计。"
        right={<div className="stat-chip accent hide-sm"><b>{masteredCount}/{deck.length}</b><span>已掌握</span></div>} />
      <div className="chips" style={{ marginBottom: 20 }}>
        {[[0, '全部'], [1, 'Part I 法规'], [2, 'Part II 道德 / 流程']].map(([v, l]) => (
          <button key={v} className={'chip' + (partFilter === v ? ' is-active' : '')} onClick={() => setPartFilter(v)}>{l}</button>
        ))}
      </div>

      <div className="deck-stage">
        <div className={'flashcard' + (flipped ? ' flipped' : '')} onClick={() => setFlipped(f => !f)}>
          <div className="flashcard-inner">
            <div className="face">
              <div className="q-meta" style={{ marginBottom: 0 }}>
                <PartBadge part={c.part} /><GroupBadge id={c.syllabusItemId} />
                {mastered && <span className="badge badge-reviewed"><Icon name="check" size={11} />已掌握</span>}
              </div>
              <div className="fc-front-title">{c.title}</div>
              <div className="fc-hint">点击翻面 · {c.syllabusItemId}</div>
            </div>
            <div className="face face-back">
              <p className="fc-back-point">{c.point}</p>
              <ul className="fc-facts">{(c.keyfacts || []).map((f, n) => <li key={n}>{f}</li>)}</ul>
              <div className="note-src" style={{ marginTop: 'auto' }}>出处 · {c.sourceRef}</div>
            </div>
          </div>
        </div>
        <div className="deck-controls">
          <button className="btn btn-sm" onClick={(e) => { e.stopPropagation(); go(-1); }}><Icon name="left" size={15} /></button>
          <span className="deck-pos">{i + 1} / {deck.length}</span>
          <button className="btn btn-sm" onClick={(e) => { e.stopPropagation(); go(1); }}><Icon name="right" size={15} /></button>
        </div>
        <button className={'btn ' + (mastered ? '' : 'btn-primary')} style={{ minWidth: 200 }}
          onClick={() => store.masterCard(c.id, !mastered)}>
          <Icon name="check" size={15} />{mastered ? '取消已掌握' : '标记已掌握'}
        </button>
      </div>
    </div>
  );
}

/* ===================== 知识点 Notes ===================== */
function Notes() {
  const notes = R5.NOTES;
  const haveIds = useMemo(() => notes.map(n => n.syllabusItemId), [notes]);
  const have = useMemo(() => new Set(haveIds), [haveIds]);
  const [active, setActive] = useState(haveIds[0]);
  const note = notes.find(n => n.syllabusItemId === active);
  const activeItem = sylItem(active);

  return (
    <div className="view-inner">
      <PageHead eyebrow="知识点 · NOTES" title="结构化讲义"
        sub="按官方考纲 27 项浏览讲义(概述 + 分段 + 易考点 + MAS 出处)。" />
      <DraftBanner text="讲义为自编 draft,需对照官方教材核验。📘 标记的条目已有讲义,其余待补。" />
      <div className="chips" style={{ marginBottom: 22 }}>
        {SYL.map(it => {
          const has = have.has(it.id);
          return (
            <button key={it.id} className={'chip' + (active === it.id ? ' is-active' : '')}
              style={has ? null : { opacity: 0.62 }}
              onClick={() => setActive(it.id)} title={it.title}>
              <span className="c-code">{it.id}</span>{has ? '📘 ' : ''}{GROUP_LABEL[it.topicGroup] || it.topicGroup}
            </button>
          );
        })}
      </div>

      {note ? (
        <div className="card pad prose">
          <div className="q-meta"><PartBadge part={note.part} /><GroupBadge id={note.syllabusItemId} /><span className="badge badge-draft">draft</span></div>
          <h1 className="page-title" style={{ fontSize: 21, marginBottom: 4 }}>{note.title}</h1>
          {note.summary && <p className="summary" style={{ margin: '14px 0' }}>{note.summary}</p>}
          {(note.sections || []).map((s, n) => (
            <div key={n}><h3>{s.heading}</h3><p>{s.body}</p></div>
          ))}
          {(note.keyPoints || []).length > 0 && (
            <div><h3>易考点</h3><ul>{note.keyPoints.map((k, n) => <li key={n}>{k}</li>)}</ul></div>
          )}
          <div className="note-src">出处 · {note.sourceRef}<span>·</span>状态 · {note.status}(自编,待核验)</div>
        </div>
      ) : (
        <div className="card pad">
          <div className="q-meta"><span className="mono" style={{ color: 'var(--fg3)', fontSize: 12 }}>{activeItem.id}</span><PartBadge part={activeItem.part} /><GroupBadge id={active} /></div>
          <p style={{ fontSize: 16, color: 'var(--fg)', margin: '8px 0 2px', fontFamily: 'var(--font-display)', fontWeight: 600 }}>{activeItem.title}</p>
          <div className="empty" style={{ padding: '22px 0 4px' }}>该考点讲义待补 — 阶段 1 逐条目补 draft。</div>
        </div>
      )}
    </div>
  );
}

function Empty({ children }) { return <div className="view-inner"><div className="empty">{children}</div></div>; }

window.RES5Views = Object.assign(window.RES5Views || {}, { Practice, Flashcards, Notes });
})();
