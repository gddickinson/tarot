// Shared bits of UI: card elements, thumbnails, meaning blocks, and journal storage (localStorage, guarded).
import { esc } from './core.js';
import { CARD, deckById, imageFile, suitOf } from './engine.js';
import { WAITE } from './waite_pkt.js';
import { parseJournal, serialiseJournal, mergeJournals } from './journal_model.js';

export function cardAlt(card, reversed) {
  return `${card.name}${reversed ? ', reversed' : ''}`;
}

// A flippable card: <button class="tcard"> with a back (cards/back.svg) and a face (the picture).
export function cardEl(id, { deck = 'night', reversed = false, up = false, label = '', still = false, lazy = false } = {}) {
  const c = CARD[id], d = deckById(deck);
  const aria = up ? cardAlt(c, reversed) : `${label ? label + ': ' : ''}face-down card, press to turn over`;
  const tag = still ? 'div' : 'button';
  return `<${tag} ${still ? '' : 'type="button"'} class="tcard${up ? ' up' : ''}${reversed ? ' rev' : ''}${still ? ' static' : ''}"
    data-id="${c.id}" aria-label="${esc(aria)}"${still ? ' role="img"' : ''}>
    <span class="tc-inner"><span class="tc-back back-${d.back}"></span>
    <span class="tc-face"><img src="${imageFile(d, c)}" alt="${esc(cardAlt(c, reversed))}"${lazy ? ' loading="lazy"' : ''}></span></span></${tag}>`;
}

export function thumb(id, deck = 'night', { reversed = false, cls = '' } = {}) {
  const c = CARD[id];
  return `<img class="${cls}${reversed ? ' rev' : ''}" src="${imageFile(deck, c)}" alt="${esc(cardAlt(c, reversed))}" loading="lazy">`;
}

export function cardTags(c) {
  const s = suitOf(c);
  return c.arcana === 'major'
    ? `<span class="tag a">Major arcana</span><span class="tag">${c.roman}</span>`
    : `<span class="tag c">${s.sym} ${s.name}</span>${c.court ? '<span class="tag b">Court card</span>' : ''}`;
}

// Waite's divinatory meaning for one card in one orientation.
export function meaningHTML(id, reversed) {
  const w = WAITE[id];
  if (!reversed) return `<p class="quote meaning"><b>Upright.</b> ${esc(w.upright)}</p>`;
  return w.reversed
    ? `<p class="quote meaning"><b>Reversed.</b> ${esc(w.reversed)}</p>`
    : `<p class="quote meaning"><b>Reversed.</b> Waite gives no reversed meaning for this card; its upright
       meaning: ${esc(w.upright)}</p>`;
}

export const WAITE_CITE = 'A. E. Waite, <i>The Pictorial Key to the Tarot</i> (1910), Part III';
export const cite = () => `<p class="src">Meanings: ${WAITE_CITE} (public domain;
  <a href="https://en.wikisource.org/wiki/The_Pictorial_Key_to_the_Tarot" target="_blank" rel="noopener">Wikisource</a>).</p>`;

// --- journal storage: everything in try/catch (private mode, blocked storage, quota) ---------------
const KEY = 'tarot.journal.v1';
export const journal = {
  load() {
    try { const t = localStorage.getItem(KEY); return t ? parseJournal(t) : []; } catch (e) { return []; }
  },
  save(entries) {
    try { localStorage.setItem(KEY, serialiseJournal(entries)); return true; } catch (e) { return false; }
  },
  add(entry) { return this.save(mergeJournals(this.load(), [entry])); },
  remove(id) { return this.save(this.load().filter(e => e.id !== id)); },
};

// Simple preference store (reversals): same guard.
export const prefs = {
  get(k, dflt) { try { const v = localStorage.getItem('tarot.' + k); return v === null ? dflt : v; } catch (e) { return dflt; } },
  set(k, v) { try { localStorage.setItem('tarot.' + k, v); } catch (e) { /* storage unavailable */ } },
};

export const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
