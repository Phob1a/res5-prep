/* RES5 备考 · 启动:加载 content/*.json → 填入 window.RES5 → 挂载可调 UI。
   内容加载行为对齐 res5-prep 的 content-loader.js(逐文件隔离,坏文件只告警跳过)。 */
(function () {
const U = window.RES5UI;
const { React, ReactDOM, StoreProvider } = U;
const AppShell = window.RES5Shell.AppShell;
const { useState, useEffect } = React;
const { useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakColor, TweakToggle, TweakSlider } = window;

/* —— 内容加载(文件级隔离) —— */
async function loadContent() {
  const base = 'content/';
  const idx = await (await fetch(base + 'index.json')).json();
  const questions = [];
  for (const f of (idx.questions || [])) {
    try {
      const r = await fetch(base + 'questions/' + f); if (!r.ok) throw new Error('HTTP ' + r.status);
      const a = await r.json(); if (Array.isArray(a)) questions.push(...a); else console.warn('[questions]', f, 'top-level not array');
    } catch (e) { console.warn('[skip questions]', f, e.message); }
  }
  const loadKind = async (kind, files, dir, required) => {
    const out = [];
    for (const f of (files || [])) {
      try {
        const r = await fetch(base + dir + '/' + f); if (!r.ok) throw new Error('HTTP ' + r.status);
        const a = await r.json();
        if (!Array.isArray(a)) { console.warn('[' + kind + ']', f, 'top-level not array'); continue; }
        for (const it of a) { if (required.every(k => it[k] != null)) out.push(it); else console.warn('[' + kind + ']', f, 'item missing fields', it && it.id); }
      } catch (e) { console.warn('[skip ' + kind + ']', f, e.message); }
    }
    return out;
  };
  const flashcards = await loadKind('flashcards', idx.flashcards, 'flashcards', ['id', 'syllabusItemId', 'title', 'point']);
  const notes = await loadKind('notes', idx.notes, 'notes', ['id', 'syllabusItemId', 'title']);
  let sciQuestions = [];
  try {
    const r = await fetch(base + 'sci/questions.json'); if (!r.ok) throw new Error('HTTP ' + r.status);
    const a = await r.json(); if (Array.isArray(a)) sciQuestions = a; else console.warn('[sci questions] top-level not array');
  } catch (e) { console.warn('[skip sci questions]', e.message); }
  return { questions, flashcards, notes, sciQuestions };
}

/* —— color helpers —— */
const hexToRgb = (h) => { h = h.replace('#', ''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); };
const toHex = (a) => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mix = (h, t, amt) => { const a = hexToRgb(h), b = hexToRgb(t); return toHex(a.map((v, i) => v + (b[i] - v) * amt)); };
const hexA = (h, a) => { const [r, g, b] = hexToRgb(h); return `rgba(${r},${g},${b},${a})`; };
const lum = (h) => { const [r, g, b] = hexToRgb(h).map(v => v / 255); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
function accentVars(hex, dark) {
  return {
    '--accent': hex,
    '--accent-hi': mix(hex, dark ? '#ffffff' : '#000000', 0.14),
    '--accent-fg': lum(hex) > 0.62 ? '#10141a' : '#ffffff',
    '--accent-ink': dark ? mix(hex, '#ffffff', 0.22) : mix(hex, '#000000', 0.1),
    '--accent-soft': hexA(hex, dark ? 0.14 : 0.09),
    '--accent-glow': dark ? `0 0 16px ${hexA(hex, 0.22)}` : `0 6px 16px ${hexA(hex, 0.24)}`,
  };
}
const THEME_MAP = { '册 · 暖纸': 'ledger', '终端 · 暗色': 'terminal', '闯关 · 明亮': 'drill' };
const NATIVE = { ledger: '#335074', terminal: '#41b3bf', drill: '#5b54e6' };
const DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "册 · 暖纸",
  "accent": "#335074",
  "titleSerif": true,
  "density": "舒适",
  "width": 840
}/*EDITMODE-END*/;

function Root() {
  const [t, setTweak] = useTweaks(DEFAULTS);
  const themeId = THEME_MAP[t.theme] || 'ledger';
  const dark = themeId === 'terminal';
  const vars = { ...accentVars(t.accent, dark), '--content-max': t.width + 'px' };
  if (t.titleSerif) vars['--font-display'] = '"Spectral", Georgia, serif';
  if (t.density === '紧凑') Object.assign(vars, { '--view-pad': '20px 22px 80px', '--card-pad': '16px', '--stem-size': '15px' });
  return (
    <React.Fragment>
      <StoreProvider><AppShell theme={themeId} styleVars={vars} /></StoreProvider>
      <TweaksPanel title="Tweaks">
        <TweakSection label="视觉方向" />
        <TweakRadio label="皮肤" value={t.theme} options={Object.keys(THEME_MAP)}
          onChange={(v) => setTweak({ theme: v, accent: NATIVE[THEME_MAP[v]] || t.accent })} />
        <TweakSection label="强调色" />
        <TweakColor label="Accent" value={t.accent}
          options={['#335074', '#41b3bf', '#5b54e6', '#3f7d54', '#804b6b', '#b05a3c']}
          onChange={(v) => setTweak('accent', v)} />
        <TweakSection label="排版与密度" />
        <TweakToggle label="标题用衬线 (Spectral)" value={t.titleSerif} onChange={(v) => setTweak('titleSerif', v)} />
        <TweakRadio label="密度" value={t.density} options={['舒适', '紧凑']} onChange={(v) => setTweak('density', v)} />
        <TweakSection label="版心" />
        <TweakSlider label="内容宽度" value={t.width} min={720} max={1040} step={20} unit="px"
          onChange={(v) => setTweak('width', v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

function BootGate() {
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [err, setErr] = useState('');
  useEffect(() => {
    loadContent().then(c => {
      window.RES5.QUESTIONS = c.questions;
      window.RES5.FLASHCARDS = c.flashcards;
      window.RES5.NOTES = c.notes;
      window.RES5.SCI_QUESTIONS = c.sciQuestions;
      setStatus('ready');
    }).catch(e => { setErr(String(e && e.message || e)); setStatus('error'); });
  }, []);
  if (status === 'ready') return <Root />;
  const wrap = { minHeight: '100vh', display: 'grid', placeItems: 'center', fontFamily: 'system-ui, sans-serif', color: '#5b5246', background: '#f4f0e7' };
  if (status === 'error') return <div style={wrap}><div style={{ textAlign: 'center', maxWidth: 420, padding: 24 }}>
    <div style={{ fontWeight: 700, fontSize: 18, color: '#ad4631' }}>内容加载失败</div>
    <p style={{ fontSize: 13, lineHeight: 1.6 }}>{err}<br />需通过 static server 打开(不要直接双击 file://),否则 fetch content/*.json 会被浏览器拦截。<br />见 INSTALL.md。</p>
  </div></div>;
  return <div style={wrap}><div style={{ opacity: .7 }}>加载题库与讲义…</div></div>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<BootGate />);
})();
