/* RES5 备考 · App 外壳 (Topbar + Nav + AppShell),供 main 与 main-tweak 共用 */
(function () {
const U = window.RES5UI;
const { React, Icon, useStore } = U;
const { useState, useEffect } = React;
const V = window.RES5Views;

const NAV = [
  { id: 'sciStudy', label: 'SCI原题', icon: 'book', sect: 'SCI 原题' },
  { id: 'sciMock', label: 'SCI Mock', icon: 'target', sect: null },
  { id: 'sciWrong', label: 'SCI错题', icon: 'review', sect: null },
  { id: 'practice', label: '刷题', icon: 'practice2', sect: '日常练习' },
  { id: 'mock', label: '模拟考', icon: 'mock', sect: null },
  { id: 'flashcards', label: '速记', icon: 'layers', sect: '记忆' },
  { id: 'notes', label: '知识点', icon: 'notes', sect: null },
  { id: 'review', label: '错题·弱项', icon: 'review', sect: '复盘' },
  { id: 'import', label: '导入', icon: 'importv', sect: null },
];
const VIEW = { sciStudy: V.SciStudy, sciMock: V.SciMock, sciWrong: V.SciWrong, practice: V.Practice, mock: V.Mock, flashcards: V.Flashcards, notes: V.Notes, review: V.Review, import: V.Import };

function Topbar() {
  const store = useStore();
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">R5</div>
        <div className="brand-text">
          <div className="brand-name">RES5 备考</div>
          <div className="brand-sub">CMFAS M5 · MAS 监管</div>
        </div>
      </div>
      <div className="topbar-meta">
        <div className="stat-chip hide-sm"><Icon name="flame" size={14} style={{ color: 'var(--warn)' }} /><b>{store.state.streak || 0}</b><span>连续天</span></div>
        <div className="stat-chip hide-sm"><b>{store.state.studiedDays || 0}</b><span>已学</span></div>
        <div className="stat-chip accent"><b>{store.state.wrongbook.length}</b><span>错题</span></div>
      </div>
    </header>
  );
}

function Nav({ view, setView, theme }) {
  const isTerminal = theme === 'terminal';
  return (
    <nav className="nav">
      {NAV.map(n => (
        <React.Fragment key={n.id}>
          {isTerminal && n.sect && <div className="nav-sect">{n.sect}</div>}
          <button className={'nav-item' + (view === n.id ? ' is-active' : '')} onClick={() => setView(n.id)}>
            <Icon name={n.icon} className="nav-ico" size={18} />
            <span className="nav-label">{n.label}</span>
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
}

function AppShell({ theme, styleVars, view: viewProp, onView }) {
  const [viewLocal, setViewLocal] = useState('sciStudy');
  const view = viewProp || viewLocal;
  const setView = onView || setViewLocal;
  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); }, [theme]);
  const Cur = VIEW[view] || V.Practice;
  return (
    <div className="app" data-theme={theme} style={styleVars || undefined}>
      <Topbar />
      <Nav view={view} setView={setView} theme={theme} />
      <main className="view"><Cur /></main>
    </div>
  );
}

window.RES5Shell = { Topbar, Nav, AppShell, NAV, VIEW };
})();
