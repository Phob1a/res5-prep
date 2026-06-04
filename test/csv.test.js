import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv } from '../js/csv.js';

test('parses simple rows into objects keyed by header', () => {
  const { rows, errors } = parseCsv('a,b\n1,2\n3,4');
  assert.deepEqual(errors, []);
  assert.deepEqual(rows, [{ a: '1', b: '2' }, { a: '3', b: '4' }]);
});

test('handles quoted comma/newline and escaped double-quote; CRLF; trailing blank', () => {
  const { rows } = parseCsv('a,b\r\n"x,y","line1\nline2"\r\n');
  assert.equal(rows[0].a, 'x,y');
  assert.equal(rows[0].b, 'line1\nline2');
  const { rows: r2 } = parseCsv('a\n"she said ""hi"""');
  assert.equal(r2[0].a, 'she said "hi"');
});

test('error: unterminated quote', () => {
  const { errors } = parseCsv('a,b\n"oops,2');
  assert.ok(errors.some(e => /unterminated quote/i.test(e)));
});

test('error: row column count mismatch reports row number', () => {
  const { errors } = parseCsv('a,b,c\n1,2');
  assert.ok(errors.some(e => /row 1/.test(e) && /column count/i.test(e)));
});

test('error: duplicate header', () => {
  const { errors } = parseCsv('a,a,b\n1,2,3');
  assert.ok(errors.some(e => /duplicate header/i.test(e)));
});

test('error: empty header name', () => {
  const { errors } = parseCsv('a,,b\n1,2,3');
  assert.ok(errors.some(e => /empty header/i.test(e)));
});
