// node --test tests/*.test.mjs : reading journal serialisation (static/journal_model.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { drawReading } from '../static/engine.js';
import { makeEntry, serialiseJournal, parseJournal, mergeJournals, journalToMarkdown, cleanEntry,
  JOURNAL_FORMAT } from '../static/journal_model.js';

const r = drawReading({ seed: 99, spread: 'three' });
const e1 = makeEntry(r, { deck: 'night', question: 'What next?', note: 'fun', date: '2026-01-02T03:04:05Z' });
const e2 = makeEntry(drawReading({ seed: 5, spread: 'celtic', significator: 'pe13' }),
  { date: '2026-02-01T00:00:00Z' });

test('makeEntry keeps the reading and metadata', () => {
  assert.equal(e1.deck, 'night');
  assert.equal(e1.spread, 'three');
  assert.equal(e1.seed, 99);
  assert.equal(e1.date, '2026-01-02T03:04:05.000Z');
  assert.deepEqual(e1.cards, r.cards);
  assert.match(e1.id, /^20260102030405-/);
  assert.equal(e2.significator, 'pe13');
});

test('serialise -> parse round trip (newest first)', () => {
  const text = serialiseJournal([e1, e2]);
  assert.equal(JSON.parse(text).format, JOURNAL_FORMAT);
  assert.deepEqual(parseJournal(text), [e2, e1]);
  assert.deepEqual(parseJournal(JSON.stringify([e1])), [e1], 'a bare array is accepted');
});

test('parse rejects foreign files and drops invalid entries', () => {
  assert.throws(() => parseJournal('{"hello":1}'), /Not a tarot journal/);
  assert.throws(() => parseJournal('not json'));
  const bad = [{ ...e1, cards: [{ id: 'xx99' }] }, { ...e1, spread: 'nope' }, { ...e1, date: 'yesterday' }, null, e2];
  assert.deepEqual(parseJournal(bad), [e2]);
});

test('cleanEntry strips unknown fields and coerces types', () => {
  const c = cleanEntry({ ...e1, evil: '<script>', seed: '99', reversals: undefined, deck: 'unknown' });
  assert.equal(c.evil, undefined);
  assert.equal(c.seed, 99);
  assert.equal(c.reversals, true);
  assert.equal(c.deck, 'night', 'unknown or old deck ids map to the one deck');
});

test('merge keeps one copy per id', () => {
  const edited = { ...e1, note: 'edited' };
  const m = mergeJournals([e1, e2], [edited]);
  assert.equal(m.length, 2);
  assert.equal(m.find(x => x.id === e1.id).note, 'edited');
});

test('markdown export lists every card with its position', () => {
  const md = journalToMarkdown([e1]);
  assert.match(md, /^# Tarot reading journal/);
  assert.match(md, /Three cards \(Night\)/);
  assert.match(md, /\*\*Question:\*\* What next\?/);
  for (const c of e1.cards) assert.ok(md.includes(`${c.pos}: `));
  assert.ok(md.trimEnd().endsWith('fun'));
});
