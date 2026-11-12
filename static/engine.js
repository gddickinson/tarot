// Pure tarot logic (no DOM): the 78-card deck, the card pictures, seeded shuffle/cut/deal,
// reversals, spreads and Waite's "recurrence of cards". Imported by the pages and by engine.test.mjs.
import { rng } from './core.js';
import { CELTIC_POSITIONS, RECURRENCE } from './waite_pkt.js';

export const SUITS = [
  { id: 'wa', key: 'wands', name: 'Wands', sym: '☤' },
  { id: 'cu', key: 'cups', name: 'Cups', sym: '☕' },
  { id: 'sw', key: 'swords', name: 'Swords', sym: '†' },
  { id: 'pe', key: 'pentacles', name: 'Pentacles', sym: '✪' },
];
// Rank names as in the original script.js (Ace, 2-10, Page, Knight, Queen, King), spelt out.
export const RANKS = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Page', 'Knight', 'Queen', 'King'];
export const RANK_PLURAL = ['', 'Aces', 'Twos', 'Threes', 'Fours', 'Fives', 'Sixes', 'Sevens', 'Eights', 'Nines',
  'Tens', 'Pages', 'Knights', 'Queens', 'Kings'];
// Major arcana names from script.js, in Waite's (Rider-Waite) numbering: 8 Strength, 11 Justice.
export const MAJORS = ['The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
  'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit', 'Wheel of Fortune', 'Justice',
  'The Hanged Man', 'Death', 'Temperance', 'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun',
  'Judgement', 'The World'];
const ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV',
  'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];
const pad = n => String(n).padStart(2, '0');

// Card ids: ar00-ar21 (majors, Waite numbering), wa/cu/sw/pe + 01..14 (01 Ace ... 11 Page, 14 King).
export function buildDeck() {
  const deck = MAJORS.map((name, n) => ({ id: 'ar' + pad(n), arcana: 'major', suit: null, number: n,
    roman: ROMAN[n], name }));
  for (const s of SUITS) {
    RANKS.forEach((r, i) => deck.push({ id: s.id + pad(i + 1), arcana: 'minor', suit: s.key, rank: i + 1,
      court: i >= 10, name: `${r} of ${s.name}` }));
  }
  return deck;
}
export const CARDS = buildDeck();
export const CARD = Object.fromEntries(CARDS.map(c => [c.id, c]));
export const suitOf = card => SUITS.find(s => s.key === card.suit) || null;

// The pictures: one original deck, cards/<id>.svg and cards/back.svg (made by tools/make_deck.mjs). Kept as a
// list so journal entries and links from the earlier three-deck site (deck=rider etc.) still resolve.
export const DECKS = [{ id: 'night', label: 'Night', dir: 'cards', back: 0 }];
export const deckById = id => DECKS.find(d => d.id === id) || DECKS[0];

export function imageFile(deck, card) {
  const d = typeof deck === 'string' ? deckById(deck) : deck || DECKS[0];
  const c = typeof card === 'string' ? CARD[card] : card;
  return `${d.dir}/${c.id}.svg`;
}
export const BACK_FILE = 'cards/back.svg';

// --- shuffling and dealing ---------------------------------------------------------------
// FNV-1a: turns any text (a date, a question) into a 32-bit seed.
export function seedFrom(text) {
  let h = 0x811c9dc5;
  for (const ch of String(text)) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
}
export const randomSeed = () => (Math.random() * 4294967296) >>> 0;

// Fisher-Yates (as in script.js shuffleArray) on a copy, driven by rand().
export function shuffle(items, rand) {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
// Cut: the top `at` cards go to the bottom.
export function cut(items, at) {
  const k = ((at % items.length) + items.length) % items.length;
  return items.slice(k).concat(items.slice(0, k));
}

export const SPREADS = {
  single: { label: 'Single card', blurb: 'One card for a quick look.', positions: ['The card'] },
  three: { label: 'Three cards', blurb: 'Past, present and future, the usual three-card layout.',
    positions: ['Past', 'Present', 'Future'] },
  four: { label: 'Four-card draw', blurb: 'The reading of the original page: four cards drawn in a row.',
    positions: ['First card', 'Second card', 'Third card', 'Fourth card'] },
  celtic: { label: 'Celtic Cross', blurb: 'Ten cards, "An Ancient Celtic Method of Divination" from Waite\'s ' +
    'Pictorial Key (1910), with an optional Significator.', significator: true,
    positions: CELTIC_POSITIONS.map(p => p.replace(/^\d+\.\s*/, '').replace(/\.$/, '')) },
};

// A reading is fully determined by (seed, spread, cut, reversals, significator): the same inputs give
// the same cards, which makes readings shareable as links and testable.
export function drawReading({ seed, spread = 'three', cutAt = null, reversals = true, significator = null }) {
  const sp = SPREADS[spread];
  if (!sp) throw new Error('unknown spread ' + spread);
  const rand = rng(seed >>> 0);
  let pack = shuffle(CARDS.filter(c => c.id !== significator).map(c => c.id), rand);
  const auto = 1 + Math.floor(rand() * (pack.length - 1)); // always drawn, so a chosen cut keeps the reversals
  const at = cutAt === null || cutAt === undefined ? auto : cutAt;
  pack = cut(pack, at);
  const cards = sp.positions.map((pos, i) => ({ pos, id: pack[i], reversed: reversals && rand() < 0.5 }));
  return { seed: seed >>> 0, spread, cutAt: at, reversals, significator: significator || null, cards };
}

// Waite, Part III §5: two, three or four cards of the same rank in a reading. Upright and reversed cards
// are counted separately ("In the Natural Position" / "Reversed").
export function recurrences(cards) {
  const counts = {};
  for (const { id, reversed } of cards) {
    const c = CARD[id];
    if (!c || c.arcana !== 'minor') continue;
    const k = `${reversed ? 'reversed' : 'natural'}:${c.rank}`;
    counts[k] = (counts[k] || 0) + 1;
  }
  return Object.entries(counts).filter(([, n]) => n >= 2).map(([k, n]) => {
    const [mode, rank] = k.split(':');
    const count = Math.min(n, 4);
    return { mode, rank: +rank, count, meaning: RECURRENCE[mode][rank][String(count)] };
  }).sort((a, b) => b.rank - a.rank);
}

// Encode/decode a reading as URL query parameters for share links.
export function readingToQuery(r, deck) {
  const q = new URLSearchParams({ spread: r.spread, deck, seed: String(r.seed), cut: String(r.cutAt),
    rev: r.reversals ? '1' : '0' });
  if (r.significator) q.set('sig', r.significator);
  return q.toString();
}
export function queryToReading(q) {
  if (!q.seed || !SPREADS[q.spread]) return null;
  const seed = Number(q.seed), cutAt = Number(q.cut);
  if (!Number.isFinite(seed) || !Number.isInteger(cutAt)) return null;
  const sig = q.sig && CARD[q.sig] ? q.sig : null;
  return drawReading({ seed, spread: q.spread, cutAt, reversals: q.rev !== '0', significator: sig });
}
