// Reading journal: entry format, (de)serialisation, merging and Markdown export. Pure, no DOM or storage.
import { CARD, SPREADS, deckById } from './engine.js';

export const JOURNAL_FORMAT = 'tarot-journal';
export const JOURNAL_VERSION = 1;

export function makeEntry(reading, { deck = 'night', question = '', note = '', date = new Date() } = {}) {
  const iso = (date instanceof Date ? date : new Date(date)).toISOString();
  return {
    id: `${iso.replace(/\D/g, '').slice(0, 14)}-${reading.seed.toString(36)}`,
    date: iso, deck, spread: reading.spread, seed: reading.seed, cutAt: reading.cutAt,
    reversals: !!reading.reversals, significator: reading.significator || null,
    question: String(question).slice(0, 500), note: String(note).slice(0, 5000),
    cards: reading.cards.map(({ pos, id, reversed }) => ({ pos, id, reversed: !!reversed })),
  };
}

// One entry from untrusted JSON (localStorage or an imported file): keep only known, valid fields.
export function cleanEntry(e) {
  if (!e || typeof e !== 'object' || !Array.isArray(e.cards) || !e.cards.length) return null;
  if (!SPREADS[e.spread] || Number.isNaN(Date.parse(e.date))) return null;
  const cards = e.cards.map(c => c && CARD[c.id] ? { pos: String(c.pos ?? ''), id: c.id, reversed: !!c.reversed } : null);
  if (cards.includes(null)) return null;
  return {
    id: String(e.id || e.date), date: new Date(e.date).toISOString(), deck: deckById(e.deck).id, spread: e.spread,
    seed: Number(e.seed) >>> 0, cutAt: Number.isInteger(e.cutAt) ? e.cutAt : null, reversals: e.reversals !== false,
    significator: CARD[e.significator] ? e.significator : null,
    question: String(e.question ?? '').slice(0, 500), note: String(e.note ?? '').slice(0, 5000), cards,
  };
}

export function serialiseJournal(entries) {
  return JSON.stringify({ format: JOURNAL_FORMAT, version: JOURNAL_VERSION, entries }, null, 1);
}

// Accepts the exported object or a bare array; throws on anything else. Invalid entries are dropped.
export function parseJournal(text) {
  const data = typeof text === 'string' ? JSON.parse(text) : text;
  const list = Array.isArray(data) ? data
    : data && data.format === JOURNAL_FORMAT && Array.isArray(data.entries) ? data.entries : null;
  if (!list) throw new Error('Not a tarot journal file');
  return sortEntries(list.map(cleanEntry).filter(Boolean));
}

export const sortEntries = list => list.slice().sort((a, b) => b.date.localeCompare(a.date));

// Merge two journals; an entry with the same id is kept once (the one in `incoming` wins).
export function mergeJournals(current, incoming) {
  const byId = new Map(current.map(e => [e.id, e]));
  for (const e of incoming) byId.set(e.id, e);
  return sortEntries([...byId.values()]);
}

export function cardLabel(c) {
  return `${CARD[c.id].name}${c.reversed ? ' (reversed)' : ''}`;
}

export function journalToMarkdown(entries) {
  const out = ['# Tarot reading journal', '', `${entries.length} reading(s). For entertainment.`, ''];
  for (const e of entries) {
    out.push(`## ${e.date.slice(0, 16).replace('T', ' ')} UTC: ${SPREADS[e.spread].label} (${deckById(e.deck).label})`);
    if (e.question) out.push('', `**Question:** ${e.question}`);
    if (e.significator) out.push('', `**Significator:** ${CARD[e.significator].name}`);
    out.push('');
    e.cards.forEach((c, i) => out.push(`${i + 1}. ${c.pos}: ${cardLabel(c)}`));
    if (e.note) out.push('', e.note);
    out.push('');
  }
  return out.join('\n');
}
