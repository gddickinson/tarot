// Pure pattern analysis for the reading engine (no DOM, no text generation): what kind of question was asked, and
// what the spread as a whole shows (Major Arcana, suits and elements, court cards, numbers, reversals, elemental
// dignities between neighbours, classic pairings, overall tenor). Ported to Python in web/reading_patterns.py;
// tests/fixtures/readings.json (tools/make_reading_fixture.mjs) checks the two agree.
import { CARD, recurrences } from './engine.js';
import { CARD_TEXT, MAJOR_ELEMENT } from './reading_cards.js';
import { ELEMENTS, CONTRARY, TOPICS, DECISION_WORDS, SENSITIVE, PAIRS } from './reading_lore.js';

export const NUM_WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve'];
const SUIT_KEYS = ['wands', 'cups', 'swords', 'pentacles'];
// Neighbouring cards whose elements are compared (indices into the spread's positions).
export const DIGNITY_PAIRS = {
  single: [], three: [[0, 1], [1, 2]], four: [[0, 1], [1, 2], [2, 3]],
  celtic: [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [6, 7], [7, 8], [8, 9]],
};

// Lower-case words separated by single spaces, with a space at each end, so ' phrase ' finds whole words.
export function normalise(text) {
  return ' ' + String(text || '').toLowerCase().replace(/’/g, "'").replace(/[^a-z0-9']+/g, ' ').trim() + ' ';
}
const has = (norm, phrase) => norm.includes(normalise(phrase));

// {topic: love|work|money|general, decision: bool, sensitive: selfharm|health|legal|money|null}
export function classifyQuestion(question) {
  const q = normalise(question);
  let sensitive = null;
  for (const cat of ['selfharm', 'health', 'legal', 'money']) {
    if (SENSITIVE[cat].some(p => has(q, p))) { sensitive = cat; break; }
  }
  let topic = 'general';
  for (const t of ['love', 'work', 'money']) {
    if (TOPICS[t].some(p => has(q, p))) { topic = t; break; }
  }
  return { topic, decision: DECISION_WORDS.some(p => has(q, p)), sensitive };
}

export const elementOf = id => (CARD[id].arcana === 'minor' ? ELEMENTS[CARD[id].suit] : MAJOR_ELEMENT[id]);
export function relation(ea, eb) {
  if (ea === eb) return 'same';
  return CONTRARY[ea] === eb ? 'contrary' : 'friendly';
}
export const valence = c => (c.reversed ? CARD_TEXT[c.id].rv : CARD_TEXT[c.id].v);

// The longest run (3 or more) of consecutive numbers among the pip ranks, lowest first; null if none.
export function longestRun(ranks) {
  const u = [...new Set(ranks)].sort((a, b) => a - b);
  let best = [], cur = [];
  for (const r of u) {
    cur = cur.length && r === cur[cur.length - 1] + 1 ? cur.concat([r]) : [r];
    if (cur.length > best.length) best = cur;
  }
  return best.length >= 3 ? best : null;
}

export function analyse(reading) {
  const cards = reading.cards, n = cards.length;
  const majors = [], courts = [], pips = [];
  const suitCounts = { wands: 0, cups: 0, swords: 0, pentacles: 0 };
  let reversed = 0, score = 0;
  cards.forEach((c, i) => {
    const card = CARD[c.id];
    if (c.reversed) reversed += 1;
    score += valence(c);
    if (card.arcana === 'major') { majors.push(i); return; }
    suitCounts[card.suit] += 1;
    if (card.rank >= 11) courts.push(i); else pips.push(card.rank);
  });
  const top = Math.max(...SUIT_KEYS.map(s => suitCounts[s]));
  const leaders = SUIT_KEYS.filter(s => suitCounts[s] === top);
  const dominant = leaders.length === 1 && top >= 2 && top * 10 >= n * 3 ? leaders[0] : null;
  const missing = n >= 6 ? SUIT_KEYS.filter(s => suitCounts[s] === 0) : [];

  let stage = null, trend = null;
  if (pips.length >= 3 && pips.every(r => r <= 4)) stage = 'early';
  if (pips.length >= 3 && pips.every(r => r >= 7)) stage = 'late';
  if ((reading.spread === 'three' || reading.spread === 'four') && pips.length === n && n >= 3) {
    if (pips.every((r, i) => i === 0 || r > pips[i - 1])) trend = 'rising';
    if (pips.every((r, i) => i === 0 || r < pips[i - 1])) trend = 'falling';
  }

  const dignities = [];
  for (const [a, b] of DIGNITY_PAIRS[reading.spread] || []) {
    const ea = elementOf(cards[a].id), eb = elementOf(cards[b].id);
    if (ea && eb) dignities.push({ a, b, ea, eb, rel: relation(ea, eb) });
  }
  let middle = null;
  if (reading.spread === 'three') {
    const [e0, e1, e2] = cards.map(c => elementOf(c.id));
    if (e0 && e1 && e2) {
      const r0 = relation(e1, e0), r2 = relation(e1, e2);
      if (r0 === 'contrary' && r2 === 'contrary') middle = 'weak';
      if (r0 === 'same' && r2 === 'same') middle = 'strong';
    }
  }

  const ids = new Set(cards.map(c => c.id));
  const pairs = PAIRS.map((p, i) => [p, i]).filter(([p]) => ids.has(p.a) && ids.has(p.b)).map(([, i]) => i);
  const tenor = score * 3 >= n ? 'favourable' : score * 3 <= -n ? 'challenging' : 'mixed';
  return { n, majors, courts, pips, suitCounts, dominant, missing, reversed, score, tenor, stage, trend,
    run: longestRun(pips), recurrences: recurrences(cards), dignities, middle, pairs };
}
