// The API of the local Python app (web/app.py), answered in the browser for the static site (GitHub Pages):
// core.js api() calls staticApi(path, body) when window.APP_STATIC is set. Same paths, same JSON shapes; the journal
// lives in this browser's localStorage instead of data/journal.json.
import { CARDS, CARD, SPREADS, SUITS, DECKS, BACK_FILE, imageFile, drawReading, recurrences, seedFrom,
  randomSeed } from './engine.js';
import { WAITE, WAITE_SOURCE } from './waite_pkt.js';
import { DECK_DESC } from './deck_desc.js';
import { journal } from './widgets.js';
import { cleanEntry, parseJournal, mergeJournals } from './journal_model.js';

const fail = (status, msg) => { throw new Error(`${status} ${msg}`); };
const intOrNull = v => (v === null || v === undefined || v === '' ? null
  : /^-?\d+$/.test(v) ? Number(v) : fail(422, `not an integer: ${v}`));

export function reading(q) {
  const spread = q.get('spread') || 'three', sig = q.get('sig') || null;
  if (!SPREADS[spread]) fail(400, `unknown spread ${spread}`);
  if (sig && !CARD[sig]) fail(400, `unknown significator ${sig}`);
  const seed = intOrNull(q.get('seed'));
  const r = drawReading({ seed: seed === null ? randomSeed() : seed, spread, cutAt: intOrNull(q.get('cut')),
    reversals: !['0', 'false'].includes(q.get('rev')), significator: sig });
  return { ...r, recurrences: recurrences(r.cards) };
}

const store = fn => {
  const entries = fn(journal.load());
  if (!journal.save(entries)) fail(507, 'this browser is not letting the page store data');
  return entries;
};

const GET = {
  info: () => ({ title: 'Tarot Reading', mode: 'static', cards: CARDS.length,
    majors: CARDS.filter(c => c.arcana === 'major').length, spreads: Object.keys(SPREADS).length,
    journal: journal.load().length, journal_store: 'this browser (localStorage)', source: WAITE_SOURCE }),
  deck: () => ({ decks: DECKS, back: BACK_FILE, suits: SUITS, cards: CARDS.map(c => ({ ...c,
    image: imageFile('night', c), upright: WAITE[c.id].upright, reversed: WAITE[c.id].reversed })) }),
  cards: (q, id) => (CARD[id] ? { ...CARD[id], image: imageFile('night', id), waite: WAITE[id], picture: DECK_DESC[id] }
    : fail(404, `no card ${id}`)),
  spreads: () => SPREADS,
  draw: q => reading(q),
  daily: q => {
    const date = q.get('date') || '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail(400, 'date must be YYYY-MM-DD');
    return { date, ...drawReading({ seed: seedFrom('daily ' + date), spread: 'single' }).cards[0] };
  },
  journal: () => ({ entries: journal.load() }),
};

const POST = {
  'journal/add': b => {
    const e = cleanEntry(b.entry);
    if (!e) fail(400, 'not a valid journal entry');
    return { ok: true, count: store(es => mergeJournals(es, [e])).length };
  },
  'journal/note': b => {
    let found = false;
    store(es => es.map(e => (e.id === b.id ? (found = true, { ...e, note: String(b.note ?? '').slice(0, 5000) }) : e)));
    return found ? { ok: true } : fail(404, 'no such reading');
  },
  'journal/delete': b => ({ ok: true, count: store(es => es.filter(e => e.id !== b.id)).length }),
  'journal/import': b => {
    let incoming;
    try { incoming = parseJournal(b.journal); } catch (e) { fail(400, 'Not a tarot journal file'); }
    return { ok: true, imported: incoming.length, count: store(es => mergeJournals(es, incoming)).length };
  },
  'journal/clear': () => { store(() => []); return { ok: true, count: 0 }; },
};

export async function staticApi(path, body) {
  const [p, qs] = path.replace(/^\//, '').split('?');
  const q = new URLSearchParams(qs || '');
  if (body) return POST[p] ? POST[p](body) : fail(404, `no static endpoint POST ${p}`);
  const [name, ...rest] = p.split('/');
  return GET[name] ? GET[name](q, ...rest) : fail(404, `no static endpoint ${p}`);
}
