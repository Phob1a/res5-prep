/* RES5 备考 · 共享层:icons / store / 小组件 / helpers */
const { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } = React;

/* ——— Syllabus helpers ——— */
const SYL = window.RES5.SYLLABUS;
const SYL_BY_ID = new Map(SYL.map(s => [s.id, s]));
const sylItem = (id) => SYL_BY_ID.get(id) || { id, title: id, part: 1, topicGroup: '' };
const GROUP_LABEL = window.RES5.GROUP_LABEL;
const pct = (r) => (r * 100).toFixed(0);
const pct1 = (r) => (r * 100).toFixed(1);

/* ——— Icons ——— */
const ICONS = {
  practice: 'M12 2v4M12 18v4M2 12h4M18 12h4M5 5l2.5 2.5M16.5 16.5L19 19M19 5l-2.5 2.5M7.5 16.5L5 19',
  practice2: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
  mock: 'M9 2h6a1 1 0 0 1 1 1v1h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2V3a1 1 0 0 1 1-1zM8 4v2h8V4M9 13l2 2 4-4',
  flash: 'M4 7a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM8 3h10a2 2 0 0 1 2 2v10',
  notes: 'M4 4a2 2 0 0 1 2-2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM14 2v5h5M8 13h7M8 17h7M8 9h3',
  review: 'M3 3v17a1 1 0 0 0 1 1h17M7 15l3-4 3 3 5-6M18 8h-2M18 8v2',
  importv: 'M12 15V3M7 8l5-5 5 5M5 21h14a2 2 0 0 0 2-2v-4M3 15v4a2 2 0 0 0 2 2',
  flame: 'M12 2c1 3-1 5-2 6s-2 3-2 5a4 4 0 0 0 8 0c0-1-.5-2-1-3 2 1 3 3 3 5a6 6 0 0 1-12 0c0-4 4-6 5-9 .5-1.5 1-3 1-4z',
  spark: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z',
  check: 'M5 12l5 5 9-11', x: 'M6 6l12 12M18 6L6 18',
  left: 'M15 5l-7 7 7 7', right: 'M9 5l7 7-7 7',
  refresh: 'M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5',
  download: 'M12 3v12M7 11l5 5 5-5M5 21h14', upload: 'M12 21V9M7 13l5-5 5 5M5 3h14',
  clock: 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
  book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19a2 2 0 0 0 2 2h13', layers: 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5',
  target: 'M12 12m-9 0a9 9 0 1 0 18 0 9 9 0 1 0-18 0M12 12m-5 0a5 5 0 1 0 10 0 5 5 0 1 0-10 0M12 12m-1 0a1 1 0 1 0 2 0 1 1 0 1 0-2 0',
};
function Icon({ name, className, size }) {
  const d = ICONS[name] || '';
  return (
    <svg className={className} width={size || 18} height={size || 18} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {d.split('M').filter(Boolean).map((seg, i) => <path key={i} d={'M' + seg} />)}
    </svg>
  );
}

/* ——— Store (真实 res5:v1 localStorage schema) ——— */
const StoreCtx = createContext(null);
const THEME = (new URLSearchParams(location.search).get('theme') || 'ledger');
const NS = 'res5:v1:';
const LS_KEY = NS + 'state';
const SCHEMA_VERSION = 1;
function defaultState() { return { schemaVersion: SCHEMA_VERSION, wrongbook: [], examHistory: [], flashcardMastery: {}, answerLog: {} }; }
function migrate(s) { return { ...defaultState(), ...(s || {}), schemaVersion: SCHEMA_VERSION }; }

function loadSeed() {
  try { const raw = localStorage.getItem(LS_KEY); if (raw) return migrate(JSON.parse(raw)); } catch (e) {}
  return defaultState();
}
function StoreProvider({ children }) {
  const [state, setState] = useState(loadSeed);
  const [questions, setQuestions] = useState(() => (window.RES5.QUESTIONS || []).slice());
  useEffect(() => { try { localStorage.setItem(LS_KEY, JSON.stringify({ ...state, schemaVersion: SCHEMA_VERSION })); } catch (e) {} }, [state]);
  const api = useMemo(() => ({
    state, setState, questions, setQuestions,
    addWrong: (qid) => setState(s => s.wrongbook.includes(qid) ? s : { ...s, wrongbook: [...s.wrongbook, qid] }),
    removeWrong: (qid) => setState(s => ({ ...s, wrongbook: s.wrongbook.filter(x => x !== qid) })),
    masterCard: (id, on) => setState(s => ({ ...s, flashcardMastery: { ...s.flashcardMastery, [id]: on } })),
    pushExam: (rec) => setState(s => ({ ...s, examHistory: [...s.examHistory, rec] })),
    logAnswer: (qid, correct) => setState(s => ({ ...s, answerLog: { ...s.answerLog, [qid]: { correct, at: Date.now() } } })),
  }), [state, questions]);
  return <StoreCtx.Provider value={api}>{children}</StoreCtx.Provider>;
}
const useStore = () => useContext(StoreCtx);

/* ——— Small components ——— */
function Badge({ kind, children }) {
  const cls = kind === 'reviewed' ? 'badge-reviewed' : kind === 'part' ? 'badge-part' : kind === 'grp' ? 'badge-grp' : 'badge-draft';
  return <span className={'badge ' + cls}>{children}</span>;
}
function PartBadge({ part }) { return <Badge kind="part">Part {part === 1 ? 'I' : 'II'}</Badge>; }
function GroupBadge({ id }) {
  const it = sylItem(id); const lab = GROUP_LABEL[it.topicGroup] || it.topicGroup;
  return <Badge kind="grp">{lab}</Badge>;
}
function PageHead({ eyebrow, title, sub, right }) {
  return (
    <div className="page-head">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="page-title">{title}</h1>
        {sub && <p className="page-sub">{sub}</p>}
      </div>
      {right}
    </div>
  );
}
function DraftBanner({ text }) {
  return (
    <div className="draft-banner">
      <span className="dot"></span>
      <span>{text || '题目与讲义均为照官方考纲自编的 draft 模拟题,非真题;需对照官方教材核验后方可信赖判分。'}</span>
    </div>
  );
}
function Ring({ value, label }) {
  return (
    <div className="ring" style={{ '--p': Math.round(value * 100) }}>
      <span>{pct(value)}%</span>
    </div>
  );
}

/* ——— Syllabus selector (chips on wide, select on narrow) ——— */
function SyllabusPicker({ value, onChange, available, allLabel }) {
  // available: Set of ids that have content
  const items = SYL.filter(s => !available || available.has(s.id));
  return (
    <div className="chips" style={{ marginBottom: 16 }}>
      <button className={'chip' + (value === '' ? ' is-active' : '')} onClick={() => onChange('')}>{allLabel || '全部'}</button>
      {items.map(s => (
        <button key={s.id} className={'chip' + (value === s.id ? ' is-active' : '')} onClick={() => onChange(s.id)} title={s.title}>
          <span className="c-code">{s.id}</span>{GROUP_LABEL[s.topicGroup] || s.topicGroup}
        </button>
      ))}
    </div>
  );
}

window.RES5UI = { React, ReactDOM, Icon, Badge, PartBadge, GroupBadge, PageHead, DraftBanner, Ring, SyllabusPicker,
  StoreProvider, useStore, StoreCtx, sylItem, SYL, GROUP_LABEL, pct, pct1, THEME,
  hooks: { useState, useEffect, useRef, useMemo, useCallback } };
