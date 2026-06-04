// 健壮 CSV:引号包裹、字段内逗号/换行、转义双引号 ""、CRLF;并给出结构性错误语义。
function tokenize(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false, unterminated = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false; }
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = ''; rows.push(row); row = [];
    } else field += c;
  }
  if (inQuotes) unterminated = true;
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  const cleaned = rows.filter(r => !(r.length === 1 && r[0] === ''));
  return { rows: cleaned, unterminated };
}

export function parseCsv(text) {
  const errors = [];
  const { rows: raw, unterminated } = tokenize(text);
  if (unterminated) errors.push('unterminated quote in CSV');
  if (raw.length === 0) return { rows: [], errors };
  const header = raw[0];
  header.forEach((h, i) => { if (h.trim() === '') errors.push(`empty header at column ${i + 1}`); });
  const seen = new Set();
  for (const h of header) { if (seen.has(h)) errors.push(`duplicate header "${h}"`); seen.add(h); }
  const rows = [];
  raw.slice(1).forEach((cells, idx) => {
    if (cells.length !== header.length) {
      errors.push(`row ${idx + 1}: column count ${cells.length} != header count ${header.length}`);
      return;
    }
    const obj = {};
    header.forEach((h, i) => { obj[h] = cells[i] ?? ''; });
    rows.push(obj);
  });
  return { rows, errors };
}
