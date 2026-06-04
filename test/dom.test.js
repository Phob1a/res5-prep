import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml } from '../js/dom.js';

test('escapes HTML-significant chars', () => {
  assert.equal(escapeHtml('<img src=x onerror=alert(1)>'), '&lt;img src=x onerror=alert(1)&gt;');
  assert.equal(escapeHtml(`a & b "c" 'd'`), 'a &amp; b &quot;c&quot; &#39;d&#39;');
});

test('coerces non-strings', () => {
  assert.equal(escapeHtml(42), '42');
  assert.equal(escapeHtml(null), '');
});
