import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SYLLABUS, isValidSyllabusItemId, getItem, partItems } from '../js/syllabus.js';

test('has 13 Part I and 14 Part II items (27 total)', () => {
  assert.equal(SYLLABUS.length, 27);
  assert.equal(partItems(1).length, 13);
  assert.equal(partItems(2).length, 14);
});

test('ids are s01..s27, unique, well-formed; part boundary at s14', () => {
  const ids = SYLLABUS.map(s => s.id);
  assert.equal(new Set(ids).size, 27);
  for (const s of SYLLABUS) {
    assert.match(s.id, /^s\d{2}$/);
    assert.ok(s.title && s.topicGroup && (s.part === 1 || s.part === 2));
  }
  assert.equal(getItem('s13').part, 1);
  assert.equal(getItem('s14').part, 2);
});

test('lookup helpers + key items present', () => {
  assert.equal(isValidSyllabusItemId('s05'), true);
  assert.equal(isValidSyllabusItemId('s28'), false);
  assert.match(getItem('s05').title, /Money Laundering|AML/i);
  assert.match(getItem('s18').title, /Conflict of Interest/i);
});
