// Regression tests for the original page (script.js): every card image it asks for must exist
// (GitHub Pages is case-sensitive).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('..', import.meta.url);
const el = () => ({ innerHTML: '', style: {} });
const ctx = vm.createContext({ document: { getElementById: el }, console: { log() {} }, Math });
vm.runInContext(readFileSync(new URL('script.js', root), 'utf8'), ctx);
vm.runInContext('buildCards()', ctx);

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
}
