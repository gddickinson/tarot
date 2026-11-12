// node --test tests/*.test.mjs : the pure tarot logic (static/engine.js) and the Waite text module.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { CARDS, CARD, DECKS, SPREADS, buildDeck, imageFile, shuffle, cut, seedFrom,
  drawReading, recurrences, readingToQuery, queryToReading } from '../static/engine.js';
import { rng } from '../static/core.js';
import { WAITE, CELTIC_POSITIONS, RECURRENCE } from '../static/waite_pkt.js';

const root = new URL('..', import.meta.url);

test('deck: 78 unique cards, 22 major + 4 suits of 14', () => {
  const d = buildDeck();
  assert.equal(d.length, 78);
  assert.equal(new Set(d.map(c => c.id)).size, 78);
  assert.equal(d.filter(c => c.arcana === 'major').length, 22);
  for (const s of ['wands', 'cups', 'swords', 'pentacles']) assert.equal(d.filter(c => c.suit === s).length, 14);
  assert.equal(CARD.ar00.name, 'The Fool');
  assert.equal(CARD.ar08.name, 'Strength');
  assert.equal(CARD.ar11.name, 'Justice');
  assert.equal(CARD.cu12.name, 'Knight of Cups');
  assert.equal(CARD.pe01.name, 'Ace of Pentacles');
  assert.equal(CARD.sw14.name, 'King of Swords');
});

test('every card has its picture, with the exact file name', () => {
  const files = new Set(readdirSync(new URL('cards/', root)));
  for (const c of CARDS) assert.ok(files.has(imageFile('night', c).split('/')[1]), imageFile('night', c));
  assert.equal(imageFile('night', 'ar08'), 'cards/ar08.svg');
  assert.equal(imageFile('rider', CARD.cu12), 'cards/cu12.svg', 'old deck ids from saved readings still resolve');
  assert.equal(DECKS.length, 1);
});

test('seeded shuffle is a reproducible permutation', () => {
  const ids = CARDS.map(c => c.id);
  const a = shuffle(ids, rng(42)), b = shuffle(ids, rng(42)), c = shuffle(ids, rng(43));
  assert.deepEqual(a, b);
  assert.notDeepEqual(a, c);
  assert.deepEqual([...a].sort(), [...ids].sort());
  assert.deepEqual(ids, CARDS.map(x => x.id), 'input not modified');
});

test('cut moves the top cards to the bottom', () => {
  assert.deepEqual(cut([1, 2, 3, 4, 5], 2), [3, 4, 5, 1, 2]);
  assert.deepEqual(cut([1, 2, 3], 0), [1, 2, 3]);
  assert.deepEqual(cut([1, 2, 3], 4), [2, 3, 1]);
});

test('seedFrom is stable and spreads values', () => {
  assert.equal(seedFrom('2026-11-11'), seedFrom('2026-11-11'));
  assert.notEqual(seedFrom('2026-11-11'), seedFrom('2026-11-12'));
  assert.equal(seedFrom(''), 0x811c9dc5);
});

test('spreads: positions and Waite\'s Celtic Cross labels', () => {
  assert.deepEqual(Object.keys(SPREADS), ['single', 'three', 'four', 'celtic']);
  assert.equal(SPREADS.single.positions.length, 1);
  assert.equal(SPREADS.four.positions.length, 4);
  assert.equal(CELTIC_POSITIONS.length, 10);
  assert.equal(SPREADS.celtic.positions[0], 'What covers him');
  assert.equal(SPREADS.celtic.positions[9], 'What will come');
});

test('drawReading: deterministic, distinct cards, one per position', () => {
  for (const spread of Object.keys(SPREADS)) {
    const r1 = drawReading({ seed: 7, spread }), r2 = drawReading({ seed: 7, spread });
    assert.deepEqual(r1, r2);
    assert.equal(r1.cards.length, SPREADS[spread].positions.length);
    assert.equal(new Set(r1.cards.map(c => c.id)).size, r1.cards.length);
    assert.ok(r1.cutAt >= 1 && r1.cutAt < 78);
  }
  const a = drawReading({ seed: 7, spread: 'celtic', cutAt: 5 }), b = drawReading({ seed: 7, spread: 'celtic', cutAt: 6 });
  assert.notDeepEqual(a.cards.map(c => c.id), b.cards.map(c => c.id));
  assert.deepEqual(a.cards.map(c => c.reversed), b.cards.map(c => c.reversed), 'the cut does not change reversals');
});

test('the significator is taken out of the pack', () => {
  for (let s = 0; s < 200; s++) {
    const r = drawReading({ seed: s, spread: 'celtic', significator: 'sw13' });
    assert.ok(!r.cards.some(c => c.id === 'sw13'));
    assert.equal(r.significator, 'sw13');
  }
});

test('reversals: about half the cards, none when switched off', () => {
  let rev = 0, n = 0;
  for (let s = 0; s < 400; s++) {
    for (const c of drawReading({ seed: s, spread: 'celtic' }).cards) { rev += c.reversed; n++; }
    assert.ok(drawReading({ seed: s, spread: 'celtic', reversals: false }).cards.every(c => !c.reversed));
  }
  assert.ok(Math.abs(rev / n - 0.5) < 0.03, `reversed share ${rev / n}`);
});

test('share links reproduce the reading', () => {
  const r = drawReading({ seed: 123456, spread: 'celtic', cutAt: 33, significator: 'cu13' });
  const q = Object.fromEntries(new URLSearchParams(readingToQuery(r, 'night')));
  assert.equal(q.deck, 'night');
  assert.deepEqual(queryToReading(q), r);
  assert.equal(queryToReading({ spread: 'nope', seed: '1', cut: '1' }), null);
  assert.equal(queryToReading({ spread: 'three', seed: 'x', cut: '1' }), null);
});

test('recurrences follow Waite Part III §5, upright and reversed counted apart', () => {
  const cards = [{ id: 'wa14', reversed: false }, { id: 'cu14', reversed: false }, { id: 'sw14', reversed: false },
    { id: 'pe02', reversed: true }, { id: 'cu02', reversed: true }, { id: 'ar00', reversed: false }, { id: 'pe05', reversed: false }];
  assert.deepEqual(recurrences(cards), [
    { mode: 'natural', rank: 14, count: 3, meaning: 'consultation' },
    { mode: 'reversed', rank: 2, count: 2, meaning: 'mistrust' },
  ]);
  assert.deepEqual(recurrences([{ id: 'ar01' }, { id: 'ar02' }]), []);
  assert.equal(RECURRENCE.natural['1']['4'], 'favourable chance');
});

test('Waite text present for all 78 cards', () => {
  assert.equal(Object.keys(WAITE).length, 78);
  for (const c of CARDS) {
    const w = WAITE[c.id];
    assert.ok(w.description.length > 40 && w.upright.length > 5, c.id);
    assert.equal(typeof w.reversed, 'string');
    if (c.arcana === 'minor') assert.ok(w.additional, c.id);
  }
  assert.equal(WAITE.cu02.reversed, '', 'Waite gives no reversed meaning for the Two of Cups');
  assert.match(WAITE.ar08.upright, /^Power, energy, action, courage/);
  assert.match(WAITE.sw13.reversed, /^Malice, bigotry/);
});
