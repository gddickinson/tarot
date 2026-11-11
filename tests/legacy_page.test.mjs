// Regression tests for the original page (script.js): every card image it asks for must exist
// (GitHub Pages is case-sensitive), and the card names must match the pictures.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('..', import.meta.url);
const el = () => ({ innerHTML: '', style: {} });
const ctx = vm.createContext({ document: { getElementById: el }, console: { log() {} }, Math });
vm.runInContext(readFileSync(new URL('script.js', root), 'utf8'), ctx);
vm.runInContext('buildCards()', ctx);

// What the picture shows: in Waite's (Rider-Waite) numbering Strength is VIII and Justice XI; the
// Marseilles deck keeps the older order (VIII La Justice, XI La Force). Checked by eye on the images.
const STRENGTH_FILE = { Rider_Waite: 'ar08', 'Colman-Smith': 'ar08', Marseilles: 'ar11' };
const JUSTICE_FILE = { Rider_Waite: 'ar11', 'Colman-Smith': 'ar11', Marseilles: 'ar08' };

function imageFor(deck, index) {
  ctx.deckChoice = deck; ctx.firstCard = false; ctx.count = index;
  const html = vm.runInContext('showCard()', ctx);
  return html.match(/src="([^"]+)"/)[1];
}

for (const deck of ['Rider_Waite', 'Marseilles', 'Colman-Smith']) {
  const files = new Set(readdirSync(new URL(deck + '/', root)));
  test(`${deck}: all 78 card images exist with the exact file name`, () => {
    assert.equal(ctx.cards.length, 78);
    for (let i = 0; i < 78; i++) {
      const src = imageFor(deck, i);
      assert.ok(src.startsWith(deck + '/'), `URL path separator in ${src}`);
      assert.ok(files.has(src.slice(deck.length + 1)), `missing ${src} (${ctx.cards[i].num} ${ctx.cards[i].suit})`);
    }
  });
  test(`${deck}: Strength and Justice show the right picture`, () => {
    const idx = name => ctx.cards.findIndex(c => c.num === name);
    assert.equal(imageFor(deck, idx('Strength')), `${deck}/${STRENGTH_FILE[deck]}.jpg`);
    assert.equal(imageFor(deck, idx('Justice')), `${deck}/${JUSTICE_FILE[deck]}.jpg`);
  });
}
