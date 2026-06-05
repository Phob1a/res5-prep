/* RES5 备考 · 考试视图:模拟考 / 错题·弱项 / 导入 */
(function () {
const U = window.RES5UI;
const { React, Icon, PageHead, DraftBanner, PartBadge, GroupBadge, Ring, useStore, sylItem, SYL, GROUP_LABEL, pct, pct1 } = U;
const { useState, useMemo, useRef, useEffect } = React;
const R5 = window.RES5;
const FM = R5.FULL_MOCK;

const countByPart = (qs, reviewedOnly) => {
  const out = { 1: 0, 2: 0 };
  for (const q of qs) { if (reviewedOnly && q.status !== 'reviewed') continue; out[q.part] = (out[q.part] || 0) + 1; }
  return out;
};
const canFull = (c) => (c[1] || 0) >= FM.part1Count && (c[2] || 0) >= FM.part2Count;
const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

/* ===================== 模拟考 Mock ===================== */
function Mock() {
  const store = useStore();
  const all = store.questions;
  const allC = countByPart(all), revC = countByPart(all, true);
  const official = canFull(revC), fullLen = !official && canFull(allC);
  const mode = official ? 'official' : fullLen ? 'full-length' : 'mini';
  const [exam, setExam] = useState(null); // running exam state

  if (exam) return <ExamRunner exam={exam} onExit={() => setExam(null)} store={store} />;

  const modeMeta = {
    official: { tag: '官方完整模拟考', cls: 'badge-reviewed', note: '可信题库(reviewed)已达 110/40,本卷给官方 PASS / FAIL 判定。' },
    'full-length': { tag: '全长练习', cls: 'badge-draft', note: '题量达 110/40 但含 draft 未核验题,不给官方及格判定。' },
    mini: { tag: 'Mini Mock', cls: 'badge-draft', note: '可信题库未达 110/40 —— 仅出 mini mock,不代表官方及格判定。' },
  }[mode];

  function start() {
    const pool = official ? all.filter(q => q.status === 'reviewed') : all;
    const p1 = pool.filter(q => q.part === 1), p2 = pool.filter(q => q.part === 2);
    const pick = mode === 'mini'
      ? [...p1.slice(0, Math.min(p1.length, 25)), ...p2.slice(0, Math.min(p2.length, 10))]
      : [...p1.slice(0, 110), ...p2.slice(0, 40)];
    setExam({ pick, mode, official, answers: {}, idx: 0, submitted: false, time: mode === 'mini' ? 20 * 60 : 150 * 60 });
  }

  return (
    <div className="view-inner">
      <PageHead eyebrow="模拟考 · MOCK EXAM" title="计时模拟考"
        sub="官方完整模拟考为 Part I 110 题(需 ≥75%)+ Part II 40 题(需 ≥80%)。" />
      <DraftBanner />
      <div className="card pad">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
          <span className={'badge ' + modeMeta.cls} style={{ fontSize: 12, padding: '5px 12px' }}>{modeMeta.tag}</span>
          <span className="mono" style={{ color: 'var(--fg3)', fontSize: 12 }}>合格线 · I ≥75% / II ≥80%</span>
        </div>
        <div className="stat-grid" style={{ marginBottom: 16 }}>
          <BankCell label="Part I · 全部" have={allC[1]} need={FM.part1Count} />
          <BankCell label="Part I · 已核验" have={revC[1]} need={FM.part1Count} />
          <BankCell label="Part II · 全部" have={allC[2]} need={FM.part2Count} />
          <BankCell label="Part II · 已核验" have={revC[2]} need={FM.part2Count} />
        </div>
        <p className="page-sub" style={{ marginBottom: 18 }}>{modeMeta.note}</p>
        <button className="btn btn-primary btn-lg" onClick={start}>
          <Icon name="clock" size={17} />开始{mode === 'mini' ? ' Mini Mock' : official ? '官方模拟考' : '全长练习'}
        </button>
      </div>

      {store.state.examHistory.length > 0 && (
        <div className="card pad" style={{ marginTop: 16 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, margin: '0 0 12px', color: 'var(--fg2)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase' }}>历史成绩</h3>
          {store.state.examHistory.slice().reverse().map((h, i) => (
            <div key={i} className="report-row">
              <span className="mono" style={{ color: 'var(--fg3)', fontSize: 12, minWidth: 44 }}>{h.at || '—'}</span>
              <span className="badge badge-part">{h.mode}</span>
              <div className="spacer" />
              <span className="mono" style={{ fontSize: 13 }}>I {pct(h.p1)}% · II {pct(h.p2)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function BankCell({ label, have, need }) {
  const ok = have >= need;
  return (
    <div className="stat-cell">
      <div className="s-num" style={{ color: ok ? 'var(--good-ink)' : 'var(--fg)' }}>{have}<span style={{ fontSize: 15, color: 'var(--fg3)', fontWeight: 600 }}> / {need}</span></div>
      <div className="s-lab">{label}</div>
    </div>
  );
}

function ExamRunner({ exam, onExit, store }) {
  const [st, setSt] = useState(exam);
  const tick = useRef();
  useEffect(() => {
    if (st.submitted) return;
    tick.current = setInterval(() => setSt(s => {
      if (s.time <= 1) { clearInterval(tick.current); return submit({ ...s, time: 0 }); }
      return { ...s, time: s.time - 1 };
    }), 1000);
    return () => clearInterval(tick.current);
  }, [st.submitted]);

  function submit(s) {
    const raw = { 1: { c: 0, t: 0 }, 2: { c: 0, t: 0 } };
    for (const q of s.pick) { raw[q.part].t++; if (s.answers[q.id] === q.answer) raw[q.part].c++; }
    const p1 = raw[1].t ? raw[1].c / raw[1].t : 0, p2 = raw[2].t ? raw[2].c / raw[2].t : 0;
    const pass = s.official ? (p1 >= FM.part1Pass && p2 >= FM.part2Pass) : null;
    store.pushExam({ mode: s.mode, p1, p2, at: new Date().toISOString().slice(5, 10) });
    for (const q of s.pick) { if (s.answers[q.id] && s.answers[q.id] !== q.answer) store.addWrong(q.id); }
    return { ...s, submitted: true, result: { p1, p2, pass, raw } };
  }

  const cur = st.pick[st.idx];
  const answeredN = Object.keys(st.answers).length;
  const setAns = (k) => setSt(s => ({ ...s, answers: { ...s.answers, [cur.id]: k } }));
  const goto = (i) => setSt(s => ({ ...s, idx: i }));

  if (st.submitted) {
    const r = st.result;
    const cls = st.official ? (r.pass ? 'pass' : 'fail') : 'neutral';
    return (
      <div className="view-inner">
        <PageHead eyebrow="模拟考 · 结果" title="成绩单" right={<button className="btn" onClick={onExit}><Icon name="left" size={15} />返回</button>} />
        <div className={'verdict ' + cls}>
          <div className="v-tag">{st.official ? (r.pass ? 'PASS' : 'FAIL') : '练习完成'}</div>
          <div className="score-row">
            <div className="sc"><div className="sc-v" style={{ color: !st.official || r.p1 >= FM.part1Pass ? 'var(--good-ink)' : 'var(--bad-ink)' }}>{pct1(r.p1)}%</div><div className="sc-l">Part I · 需 ≥75%</div></div>
            <div className="sc"><div className="sc-v" style={{ color: !st.official || r.p2 >= FM.part2Pass ? 'var(--good-ink)' : 'var(--bad-ink)' }}>{pct1(r.p2)}%</div><div className="sc-l">Part II · 需 ≥80%</div></div>
            <div className="sc"><div className="sc-v">{r.raw[1].c + r.raw[2].c}<span style={{ fontSize: 16, color: 'var(--fg3)' }}>/{r.raw[1].t + r.raw[2].t}</span></div><div className="sc-l">总答对</div></div>
          </div>
          {!st.official && <p className="page-sub" style={{ margin: '14px auto 0', maxWidth: '46ch' }}>{st.mode === 'mini' ? 'Mini mock' : '全长练习'} · 含未核验 draft 题,不代表官方及格判定。</p>}
        </div>
        <div className="card pad" style={{ marginTop: 16 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, margin: '0 0 6px', color: 'var(--fg2)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase' }}>逐题回顾</h3>
          {st.pick.map((q, i) => {
            const a = st.answers[q.id], ok = a === q.answer;
            return (
              <div key={q.id} className="report-row" style={{ alignItems: 'flex-start' }}>
                <span className="mono" style={{ minWidth: 34, color: ok ? 'var(--good-ink)' : a ? 'var(--bad-ink)' : 'var(--fg3)' }}>Q{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5 }}>{q.stem}</div>
                  <div className="mono" style={{ fontSize: 11.5, color: 'var(--fg3)', marginTop: 3 }}>
                    正确 {q.answer} · 你选 {a || '—'} {ok ? '✓' : a ? '✗' : '(未答)'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const low = st.time < 60;
  return (
    <div className="view-inner">
      <div className="exam-bar">
        <div className="row" style={{ gap: 10 }}>
          <button className="btn btn-sm" onClick={onExit}><Icon name="x" size={14} /></button>
          <span className="badge badge-part">{st.mode === 'mini' ? 'MINI MOCK' : st.official ? 'OFFICIAL' : 'FULL-LENGTH'}</span>
        </div>
        <div className={'exam-timer' + (low ? ' low' : '')}><Icon name="clock" size={16} style={{ verticalAlign: -2 }} /> {fmtTime(st.time)}</div>
        <div className="row" style={{ gap: 10 }}>
          <span className="mono" style={{ fontSize: 12, color: 'var(--fg3)' }}>{answeredN}/{st.pick.length}</span>
          <button className="btn btn-primary btn-sm" onClick={() => setSt(s => submit(s))}>交卷</button>
        </div>
      </div>

      <div className="card pad">
        <div className="q-meta">
          <span className="mono" style={{ color: 'var(--fg3)', fontSize: 12 }}>Q{st.idx + 1}</span>
          <PartBadge part={cur.part} /><GroupBadge id={cur.syllabusItemId} />
        </div>
        <p className="q-stem">{cur.stem}</p>
        <div className="opts">
          {['A', 'B', 'C', 'D'].map(k => (
            <button key={k} className={'opt' + (st.answers[cur.id] === k ? ' is-chosen' : '')} onClick={() => setAns(k)}>
              <span className="opt-key">{k}</span><span className="opt-text">{cur.options[k]}</span>
            </button>
          ))}
        </div>
        <div className="row" style={{ marginTop: 18 }}>
          <button className="btn btn-sm" onClick={() => goto(Math.max(0, st.idx - 1))} disabled={st.idx === 0}><Icon name="left" size={15} />上一题</button>
          <div className="spacer" />
          <button className="btn btn-sm" onClick={() => goto(Math.min(st.pick.length - 1, st.idx + 1))} disabled={st.idx >= st.pick.length - 1}>下一题<Icon name="right" size={15} /></button>
        </div>
      </div>

      <div className="card pad" style={{ marginTop: 14 }}>
        <div className="field-lab" style={{ marginBottom: 10 }}>答题卡</div>
        <div className="qgrid">
          {st.pick.map((q, i) => (
            <button key={q.id} className={'qgrid-btn' + (st.answers[q.id] ? ' answered' : '') + (i === st.idx ? ' current' : '')} onClick={() => goto(i)}>{i + 1}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===================== 错题 / 弱项 Review ===================== */
function Review() {
  const store = useStore();
  const all = store.questions;
  const wb = store.state.wrongbook;
  const wrong = all.filter(q => wb.includes(q.id));
  const byItem = {};
  for (const q of wrong) byItem[q.syllabusItemId] = (byItem[q.syllabusItemId] || 0) + 1;
  const maxErr = Math.max(1, ...Object.values(byItem));
  const ranked = SYL.map(s => ({ ...s, n: byItem[s.id] || 0 })).sort((a, b) => b.n - a.n);
  const itemsWithErr = Object.keys(byItem).length;
  const masteredN = Object.values(store.state.flashcardMastery).filter(Boolean).length;

  function exportJSON() {
    const blob = new Blob([JSON.stringify(store.state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'res5-progress.json'; a.click();
  }
  const fileRef = useRef();
  const [msg, setMsg] = useState(null);
  async function importJSON(e) {
    const f = e.target.files[0]; if (!f) return;
    try { const obj = JSON.parse(await f.text()); store.setState(s => ({ ...s, ...obj })); setMsg({ ok: true, t: '进度导入成功。' }); }
    catch (err) { setMsg({ ok: false, t: '导入失败:' + err.message }); }
  }

  return (
    <div className="view-inner">
      <PageHead eyebrow="错题 / 弱项 · REVIEW" title="弱项仪表盘"
        sub="按官方考纲 27 项统计错题分布;导出 / 导入学习进度以跨设备迁移。" />
      <div className="stat-grid" style={{ marginBottom: 18 }}>
        <div className="stat-cell"><div className="s-num" style={{ color: 'var(--bad-ink)' }}>{wrong.length}</div><div className="s-lab">错题总数</div></div>
        <div className="stat-cell"><div className="s-num">{itemsWithErr}<span style={{ fontSize: 15, color: 'var(--fg3)' }}>/27</span></div><div className="s-lab">涉及条目</div></div>
        <div className="stat-cell"><div className="s-num" style={{ color: 'var(--good-ink)' }}>{masteredN}</div><div className="s-lab">已掌握卡片</div></div>
        <div className="stat-cell"><div className="s-num" style={{ color: 'var(--accent-ink)' }}>{store.state.streak || 0}</div><div className="s-lab">连续学习天</div></div>
      </div>

      <div className="card pad">
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, margin: '0 0 8px', color: 'var(--fg2)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase' }}>错题分布 · 全 27 项</h3>
        {ranked.map(s => (
          <div key={s.id} className="meter">
            <span className="meter-id">{s.id}</span>
            <span className="meter-label" title={s.title}>{GROUP_LABEL[s.topicGroup] || s.topicGroup} · {s.title}</span>
            <span className="meter-track"><span className={'meter-fill' + (s.n ? ' warn' : '')} style={{ width: (s.n / maxErr * 100) + '%' }} /></span>
            <span className="meter-val">{s.n}</span>
          </div>
        ))}
      </div>

      <div className="card pad" style={{ marginTop: 16 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, margin: '0 0 10px', color: 'var(--fg2)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase' }}>错题本 ({wrong.length})</h3>
        {wrong.length === 0 && <div className="empty">暂无错题 — 全部答对 🎉</div>}
        {wrong.map(q => (
          <div key={q.id} className="report-row" style={{ alignItems: 'flex-start' }}>
            <span className="mono" style={{ minWidth: 56, color: 'var(--fg3)', fontSize: 11.5 }}>{q.syllabusItemId}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5 }}>{q.stem}</div>
              <div className="mono" style={{ fontSize: 11.5, color: 'var(--fg3)', marginTop: 4 }}>答案 {q.answer} — {q.explanation}</div>
            </div>
            <button className="btn btn-sm" onClick={() => store.removeWrong(q.id)} title="移出错题本"><Icon name="check" size={14} /></button>
          </div>
        ))}
      </div>

      <div className="card pad" style={{ marginTop: 16 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, margin: '0 0 12px', color: 'var(--fg2)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase' }}>学习进度迁移</h3>
        <div className="row">
          <button className="btn" onClick={exportJSON}><Icon name="download" size={15} />导出进度 JSON</button>
          <button className="btn" onClick={() => fileRef.current.click()}><Icon name="upload" size={15} />导入进度</button>
          <input ref={fileRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={importJSON} />
        </div>
        {msg && <div className={'toast ' + (msg.ok ? 'ok' : 'err')}>{msg.t}</div>}
      </div>
    </div>
  );
}

/* ===================== 导入 Import ===================== */
function Import() {
  const store = useStore();
  const fileRef = useRef();
  const [ow, setOw] = useState(false);
  const [report, setReport] = useState(null);
  const [errs, setErrs] = useState(null);

  function validate(arr) {
    const out = [], errors = [];
    arr.forEach((q, i) => {
      const loc = q.id || ('row ' + (i + 1));
      if (!q.id) return errors.push(`${loc}: 缺少 id`);
      if (!q.stem) return errors.push(`${loc}: 缺少 stem`);
      if (!q.options || !['A', 'B', 'C', 'D'].every(k => q.options[k])) return errors.push(`${loc}: options 须含 A/B/C/D`);
      if (!['A', 'B', 'C', 'D'].includes(q.answer)) return errors.push(`${loc}: answer 须为 A/B/C/D`);
      out.push(q);
    });
    return { out, errors };
  }
  function parseCsv(text) {
    const lines = text.trim().split(/\r?\n/); const head = lines[0].split(',').map(s => s.trim());
    return lines.slice(1).map(line => {
      const cols = line.split(','); const o = {}; head.forEach((h, i) => o[h] = (cols[i] || '').trim());
      return { id: o.id, part: +o.part || 1, syllabusItemId: o.syllabusItemId, topicGroup: o.topicGroup,
        stem: o.stem, options: { A: o.optionA, B: o.optionB, C: o.optionC, D: o.optionD },
        answer: o.answer, explanation: o.explanation, difficulty: o.difficulty, sourceRef: o.sourceRef, status: o.status || 'draft' };
    });
  }
  async function onFile(e) {
    const f = e.target.files[0]; if (!f) return;
    setErrs(null); setReport(null);
    const text = await f.text();
    let candidates = [];
    try { candidates = f.name.endsWith('.csv') ? parseCsv(text) : JSON.parse(text); }
    catch (err) { return setErrs(['解析失败:不是合法的 ' + (f.name.endsWith('.csv') ? 'CSV' : 'JSON')]); }
    if (!Array.isArray(candidates)) return setErrs(['顶层必须是题目数组']);
    const { out, errors } = validate(candidates);
    if (errors.length) return setErrs(errors);
    // merge
    const byId = new Map(store.questions.map(q => [q.id, q]));
    let added = 0, updated = 0, skipped = 0; const conflicts = [];
    for (const q of out) {
      const ex = byId.get(q.id);
      if (!ex) { byId.set(q.id, q); added++; }
      else if (JSON.stringify(ex) === JSON.stringify(q)) skipped++;
      else { conflicts.push(q.id); if (ow) { byId.set(q.id, q); updated++; } }
    }
    store.setQuestions(Array.from(byId.values()));
    setReport({ added, updated, skipped, conflicts });
  }

  const sample = JSON.stringify([{ id: 'q-s19-002', part: 2, syllabusItemId: 's19', topicGroup: 'ethics',
    stem: 'Fair dealing outcomes are ultimately the responsibility of:', options: { A: 'Tellers', B: 'Board & senior management', C: 'Clients', D: 'Regulators' },
    answer: 'B', explanation: 'Board & senior management drive fair dealing culture.', difficulty: 'medium', sourceRef: 'Fair Dealing Guidelines', status: 'draft' }], null, 2);
  function downloadSample() {
    const blob = new Blob([sample], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'res5-sample.json'; a.click();
  }

  return (
    <div className="view-inner">
      <PageHead eyebrow="导入 · IMPORT" title="扩充题库"
        sub="支持 JSON(canonical 数组)或 CSV;统一校验,带 locator,不静默丢题。" />
      <DraftBanner text="阶段 0:导入的题仅当前会话生效(刷新即失),用于试跑校验与合并报告。" />

      <div className="card pad">
        <label className="check" style={{ marginBottom: 14 }}>
          <input type="checkbox" checked={ow} onChange={e => setOw(e.target.checked)} />覆盖同 id 冲突题(默认不覆盖)
        </label>
        <div className="dropzone" onClick={() => fileRef.current.click()}>
          <Icon name="upload" className="dz-ico" size={30} />
          <div style={{ fontWeight: 700, marginBottom: 4 }}>选择 JSON / CSV 文件</div>
          <div className="muted" style={{ fontSize: 12.5 }}>CSV 表头:id,part,syllabusItemId,topicGroup,stem,optionA…D,answer,explanation,difficulty,sourceRef,status</div>
          <input ref={fileRef} type="file" accept=".json,.csv" style={{ display: 'none' }} onChange={onFile} />
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn btn-sm" onClick={downloadSample}><Icon name="download" size={14} />下载示例 JSON</button>
          <span className="muted" style={{ fontSize: 12 }}>当前题库 · {store.questions.length} 题</span>
        </div>

        {errs && <div className="toast err" style={{ marginTop: 14 }}><b>校验失败,未导入 · {errs.length} 处</b><ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>{errs.map((e, i) => <li key={i}>{e}</li>)}</ul></div>}
        {report && (
          <div style={{ marginTop: 16 }}>
            <div className="toast ok">导入完成(本会话生效)。</div>
            <div className="grid-2" style={{ marginTop: 12 }}>
              <RepCell n={report.added} l="新增" c="var(--good-ink)" />
              <RepCell n={report.updated} l="更新" c="var(--accent-ink)" />
              <RepCell n={report.skipped} l="跳过(相同)" c="var(--fg3)" />
              <RepCell n={report.conflicts.length} l={ow ? '冲突(已覆盖)' : '冲突(未覆盖)'} c="var(--bad-ink)" />
            </div>
            {report.conflicts.length > 0 && <div className={'toast ' + (ow ? 'ok' : 'err')} style={{ marginTop: 12 }}>同 id 冲突:{report.conflicts.join(', ')} {ow ? '(已覆盖)' : '(勾选上方选项并重新导入以覆盖)'}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
function RepCell({ n, l, c }) {
  return <div className="card raised pad" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
    <span className="r-n" style={{ color: c }}>{n}</span><span style={{ fontSize: 13, color: 'var(--fg2)' }}>{l}</span>
  </div>;
}

window.RES5Views = Object.assign(window.RES5Views || {}, { Mock, Review, Import });
})();
