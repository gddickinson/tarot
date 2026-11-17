// The reading engine (static/reading_engine.js, reading_patterns.js and the text modules): data completeness, pattern
// detection on constructed spreads, sensitive questions, determinism by seed, and no placeholder or undefined text
// for any card, orientation, position, spread and tone.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CARDS, SPREADS, drawReading, shareQuery, queryToArgs } from '../static/engine.js';
import { CARD_TEXT, MAJOR_ELEMENT } from '../static/reading_cards.js';
import { POSITIONS } from '../static/reading_positions.js';
import { TONES } from '../static/reading_phrases.js';
import { analyse, classifyQuestion, longestRun } from '../static/reading_patterns.js';
import { interpret, cardRef, fill } from '../static/reading_engine.js';

const ids = CARDS.map(c => c.id);
// A reading with the given cards ('ar16' upright, '-ar16' reversed) in the spread's positions.
function spread(name, list, { seed = 1, significator = null, reversals = true } = {}) {
  return { seed, spread: name, cutAt: 1, reversals, significator,
    cards: list.map((x, i) => ({ pos: SPREADS[name].positions[i], id: x.replace('-', ''), reversed: x.startsWith('-') })) };
}
const BAD = /undefined|\bnull\b|NaN|\{|\}| {2}| [,.;:]|\.\.|\n{3}/;
const MEDICAL = /illness|sickness|disease|infirm|diagnos|\bcure|\bheal(ing|s|ed)?\b/i;
// The reading speaks to the reader: no third-person pronouns for the querent in engine-written text (quoted text,
// the question and Waite's recurrence table, is left out of the check).
const GENDERED = /\b(him|his|himself|her|hers|herself)\b/i;
function checkText(t, where) {
  assert.ok(t && typeof t === 'string', where);
  assert.doesNotMatch(t, BAD, `${where}: ${t}`);
  assert.doesNotMatch(t, MEDICAL, `${where}: ${t}`);
  const own = t.replace(/“[^”]*”/g, '“”');
  const m = own.match(GENDERED);
  assert.ok(!m, `${where}: "${m && own.slice(Math.max(0, m.index - 60), m.index + 20)}"`);
}

test('every card has glosses, themes, tenor and a reversal mode; no colons in glosses', () => {
  assert.equal(Object.keys(CARD_TEXT).length, 78);
  for (const id of ids) {
    const t = CARD_TEXT[id];
    for (const k of ['up', 'rev', 'kw', 'rkw']) { assert.ok(t[k].length > 2, id + k); assert.doesNotMatch(t[k], /:/, id + k); }
    assert.ok([-1, 0, 1].includes(t.v) && [-1, 0, 1].includes(t.rv), id);
    assert.ok(['blocked', 'inward', 'delay', 'excess', 'easing', 'other'].includes(t.mode), id);
  }
  assert.equal(Object.keys(MAJOR_ELEMENT).length, 22);
  for (const [k, roles] of Object.entries(POSITIONS)) assert.equal(roles.length, SPREADS[k].positions.length, k);
});

test('no undefined or placeholder text: 78 cards x 2 orientations x every position x every spread x 3 tones', () => {
  let n = 0;
  for (const name of Object.keys(SPREADS)) {
    const size = SPREADS[name].positions.length;
    for (let pos = 0; pos < size; pos++) {
      for (const id of ids) {
        for (const rev of [false, true]) {
          // other positions: a rotating filler so neighbours and patterns vary too
          const list = Array.from({ length: size }, (_, j) => ids[(ids.indexOf(id) + 7 * (j + 1)) % 78]);
          list[pos] = (rev ? '-' : '') + id;
          for (const fixed of new Set(list.map(x => x.replace('-', '')))) if (list.filter(x => x.replace('-', '') === fixed).length > 1) list[list.lastIndexOf(fixed)] = 'ar00';
          const r = spread(name, list, { seed: n, significator: name === 'celtic' && n % 3 === 0 ? 'pe13' : null });
          for (const tone of Object.keys(TONES)) {
            const it = interpret(r, { question: n % 2 ? 'Should I change jobs?' : '', tone });
            const where = `${name} pos ${pos} ${id}${rev ? ' rev' : ''} ${tone}`;
            checkText(it.text, where);
            assert.equal(it.positions.length, size, where);
            assert.ok(it.positions[pos].text.toLowerCase().includes(cardRef(id, rev).toLowerCase()), where);
            assert.equal(it.questions.length, tone === 'brief' ? 2 : 3, where);
            assert.equal(new Set(it.questions).size, it.questions.length, where);
            n++;
          }
        }
      }
    }
  }
  assert.ok(n > 8000, `${n} readings checked`);
});

test('second person throughout: position headings are not Waite\'s "him/his" wording', () => {
  const it = interpret(drawReading({ seed: 4, spread: 'celtic', significator: 'cu13' }), { tone: 'traditional' });
  assert.deepEqual(it.positions.map(p => p.pos), ['What covers you', 'What crosses you', 'What crowns you', 'Beneath you',
    'Behind you', 'Before you', 'Yourself', 'Your house', 'Your hopes or fears', 'What will come']);
  assert.equal(SPREADS.celtic.waite[0], 'What covers him', "Waite's names kept apart, for the detail");
  // a reading saved with Waite's names (older journal entries) still gets second-person headings
  const old = drawReading({ seed: 4, spread: 'celtic' });
  old.cards.forEach((c, i) => { c.pos = SPREADS.celtic.waite[i]; });
  assert.ok(interpret(old).positions.every(p => !GENDERED.test(p.heading)));
});

test('a reversal with a different meaning gets no empty "other face" clause', () => {
  const t = interpret(spread('three', ['-cu06', '-cu08', '-pe10']), { tone: 'modern' }).text;
  assert.doesNotMatch(t, /other face|reversed sense|other meaning/);
  assert.match(t, /looking forward instead/);
});

test('share links leave the question out unless asked; the link still writes the same text', () => {
  const r = drawReading({ seed: 21, spread: 'three' });
  const plain = new URLSearchParams(shareQuery(r, 'night', { tone: 'brief', question: 'Will he call?' }));
  assert.equal(plain.get('q'), null);
  assert.equal(plain.get('qw'), '1');
  assert.equal(plain.get('tone'), 'brief');
  const withQ = new URLSearchParams(shareQuery(r, 'night', { tone: 'modern', question: ' Will he call? ', includeQuestion: true }));
  assert.equal(withQ.get('q'), 'Will he call?');
  assert.equal(withQ.get('qw'), null);
  assert.equal(new URLSearchParams(shareQuery(r, 'night', {})).get('qw'), null, 'no question, nothing to withhold');
  const args = queryToArgs(Object.fromEntries(plain));
  assert.deepEqual(drawReading(args).cards, r.cards, 'the same cards');
  const shared = interpret(drawReading(args), { tone: 'brief', questionWithheld: true });
  assert.deepEqual(interpret(drawReading(args), { tone: 'brief', questionWithheld: true }), shared, 'deterministic');
  assert.ok(!shared.text.includes('Will he call') && !/No question/.test(shared.text), 'no question line at all');
  assert.match(interpret(drawReading(args), { tone: 'brief' }).text, /No question: a general reading/);
  assert.match(interpret(r, { question: 'Will he call?', questionWithheld: true }).text, /Will he call\?/,
    'a question typed by the receiver is shown');
});

test('the same seed gives the same text; different seeds vary the wording', () => {
  const r = drawReading({ seed: 42, spread: 'celtic', significator: 'cu13' });
  const a = interpret(r, { question: 'Will I find love this year?', tone: 'modern' });
  const b = interpret(structuredClone(r), { question: 'Will I find love this year?', tone: 'modern' });
  assert.deepEqual(a, b);
  // same cards, different seed: the facts stay, the phrasing changes somewhere
  const texts = new Set();
  for (let s = 0; s < 12; s++) texts.add(interpret({ ...r, seed: s }, { tone: 'modern' }).text);
  assert.ok(texts.size >= 6, `${texts.size} distinct texts`);
  assert.notEqual(interpret(r, { tone: 'traditional' }).text, interpret(r, { tone: 'modern' }).text);
  assert.equal(interpret(r, { tone: 'nonsense' }).tone, 'modern');
});

test('brief is shorter than modern, and traditional speaks of the Querent', () => {
  const r = drawReading({ seed: 9, spread: 'celtic' });
  const brief = interpret(r, { tone: 'brief' }), modern = interpret(r, { tone: 'modern' });
  assert.ok(brief.text.length * 2 < modern.text.length);
  assert.ok(brief.threads.length <= 3);
  assert.match(interpret(r, { tone: 'traditional' }).text, /Querent/);
  assert.doesNotMatch(modern.text, /Querent/);
});

test('question topics and decisions', () => {
  const c = q => classifyQuestion(q);
  assert.deepEqual(c('Does my girlfriend still love me?'), { topic: 'love', decision: false, sensitive: null });
  assert.deepEqual(c('Should I take the new job or stay?'), { topic: 'work', decision: true, sensitive: null });
  assert.deepEqual(c('Will I be able to afford the rent?'), { topic: 'money', decision: false, sensitive: null });
  assert.deepEqual(c('What do I need to know?'), { topic: 'general', decision: false, sensitive: null });
  assert.equal(c('Will he come back to me?').topic, 'love');
  assert.equal(c('Will my skills be noticed?').sensitive, null, '"skills" is not "ill"');
});

test('sensitive questions: classified, and read without forecasts', () => {
  const c = q => classifyQuestion(q).sensitive;
  assert.equal(c('Is the lump cancer?'), 'health');
  assert.equal(c('Am I pregnant?'), 'health');
  assert.equal(c('Will I win the court case?'), 'legal');
  assert.equal(c('Should I invest my savings in bitcoin?'), 'money');
  assert.equal(c("I don't want to live any more"), 'selfharm');
  assert.equal(c('I want to KILL MYSELF'), 'selfharm');
  assert.equal(c('Will my mum recover from surgery?'), 'health');

  const r = drawReading({ seed: 3, spread: 'celtic' });
  const h = interpret(r, { question: 'Will my operation go well?' });
  assert.equal(h.sensitive, 'health');
  assert.match(h.intro.join(' '), /can't answer health questions.*doctor/);
  assert.match(h.closing.join(' '), /doctor/);
  assert.ok(h.positions[5].text.includes('not a prediction') && h.positions[9].text.includes('not a prediction'));
  assert.deepEqual(h.summary, []);
  assert.ok(h.threads.every(t => ['pairs', 'elements', 'courts'].includes(t.key)));
  assert.doesNotMatch(h.text, /lean in your favour|encouraging|tide is turning|in your hands/);
  for (const tone of Object.keys(TONES)) checkText(interpret(r, { question: 'Will my operation go well?', tone }).text, tone);
  assert.match(interpret(r, { question: 'Will I win my lawsuit?' }).text, /lawyer/);
  assert.match(interpret(r, { question: 'Should I take out a mortgage?' }).text, /financial adviser/);

  for (const tone of Object.keys(TONES)) {
    const s = interpret(r, { question: 'I keep thinking about suicide', tone });
    assert.equal(s.sensitive, 'selfharm');
    assert.deepEqual([s.positions, s.threads, s.questions, s.summary], [[], [], [], []]);
    assert.match(s.text, /helpline/);
    assert.match(s.text, /emergency number/);
    assert.doesNotMatch(s.text, /entertainment/);
  }
});

test('patterns: Major Arcana weight, suits, missing suits, courts, reversals', () => {
  let a = analyse(spread('three', ['ar16', 'ar17', 'wa03']));
  assert.deepEqual(a.majors, [0, 1]);
  assert.match(interpret(spread('three', ['ar16', 'ar17', 'wa03'])).text, /Two of the three cards are Major Arcana/);
  assert.match(interpret(spread('three', ['wa02', 'cu05', 'sw09'])).text, /no Major Arcana/);
  a = analyse(spread('celtic', ['cu01', 'cu02', 'cu03', 'cu04', 'wa05', 'wa06', 'ar00', 'ar01', 'cu09', 'wa10']));
  assert.equal(a.dominant, 'cups');
  assert.deepEqual(a.missing, ['swords', 'pentacles']);
  const t = interpret(spread('celtic', ['cu01', 'cu02', 'cu03', 'cu04', 'wa05', 'wa06', 'ar00', 'ar01', 'cu09', 'wa10'])).text;
  assert.match(t, /Cups lead the spread with five cards/);
  assert.match(t, /no Swords.*and no Pentacles/);
  a = analyse(spread('celtic', ['wa11', 'cu12', 'sw13', 'pe14', 'wa01', 'cu03', 'sw05', 'pe07', 'ar09', 'ar10']));
  assert.deepEqual(a.courts, [0, 1, 2, 3]);
  assert.match(interpret(spread('celtic', ['wa11', 'cu12', 'sw13', 'pe14', 'wa01', 'cu03', 'sw05', 'pe07', 'ar09', 'ar10'])).text,
    /With four court cards.*The Page of Wands may be someone/s);
  const many = spread('three', ['-wa01', '-cu02', 'sw03']);
  assert.match(interpret(many).text, /Two of the three cards are reversed/);
  assert.doesNotMatch(interpret({ ...many, reversals: false, cards: many.cards.map(c => ({ ...c, reversed: false })) }).text, /reversed/);
  assert.match(interpret(spread('celtic', ['wa01', 'cu02', 'sw03', 'pe04', 'wa05', 'cu06', 'sw07', 'pe08', 'ar09', 'ar10'])).text, /Every card is upright/);
});

test('patterns: numbers, Waite recurrences (health readings left aside), runs, stage and trend', () => {
  let t = interpret(spread('celtic', ['wa05', 'cu05', 'ar01', 'ar02', 'ar03', 'ar04', 'ar05', 'ar06', 'ar07', 'ar08'])).text;
  assert.match(t, /Two Fives upright\. Waite's old table of recurring cards reads this as “vigils”, and five is the number of disruption/);
  t = interpret(spread('celtic', ['wa11', 'cu11', 'sw11', 'pe11', 'ar02', 'ar03', 'ar04', 'ar05', 'ar06', 'ar07'])).text;
  assert.match(t, /Four Pages upright\. Waite's 1910 table gives a reading for this that is about health or simply dated/);
  assert.doesNotMatch(t, /dangerous/);
  assert.deepEqual(longestRun([7, 3, 5, 4, 9]), [3, 4, 5]);
  assert.equal(longestRun([1, 3, 5]), null);
  assert.match(interpret(spread('three', ['wa01', 'cu02', 'sw03'])).text,
    /The numbers ace, two and three run in sequence.*early days.*climb from card to card/s);
  assert.match(interpret(spread('three', ['wa10', 'cu09', 'sw08'])).text, /late in the cycle.*winding down/s);
});

test('patterns: elemental dignities and classic pairings', () => {
  let a = analyse(spread('three', ['wa02', 'cu05', 'wa09']));
  assert.deepEqual(a.dignities.map(d => d.rel), ['contrary', 'contrary']);
  assert.equal(a.middle, 'weak');
  assert.match(interpret(spread('three', ['wa02', 'cu05', 'wa09'])).text, /The Two of Wands \(fire\) and the Five of Cups \(water\) are contrary elements/);
  a = analyse(spread('three', ['sw02', 'sw05', 'sw09']));
  assert.equal(a.middle, 'strong');
  assert.deepEqual(analyse(spread('three', ['ar01', 'ar10', 'ar19'])).dignities, [], 'planetary trumps take no part');
  assert.equal(analyse(spread('three', ['ar04', 'ar00', 'ar12'])).dignities[0].rel, 'friendly', 'Emperor (Aries, fire) and Fool (air)');
  const t = interpret(spread('three', ['ar16', 'cu04', 'ar17'])).text;
  assert.match(t, /The Tower and the Star together are the classic storm and calm/);
});

test('Celtic Cross: Waite\'s position roles and the relationships inside the cross', () => {
  // cover heavy, crossing kind; fear in 9, kind outcome in 10 (a trump); improving from 5 to 6
  const r = spread('celtic', ['ar16', 'ar19', 'ar17', 'pe10', 'sw10', 'wa06', 'pe03', 'sw05', 'sw09', 'ar21']);
  const it = interpret(r);
  assert.match(it.positions[0].text, /atmosphere|climate|general influence/);
  assert.match(it.positions[1].text, /kindly card, the obstacle is either mild/);
  assert.match(it.positions[8].text, /more like a fear/);
  assert.match(it.positions[9].text, /Major Arcana card, so give it extra weight/);
  const cross = it.threads.find(x => x.key === 'cross').text;
  for (const re of [/kinder card/, /tide is turning in your favour/, /aim .* agree/, /fear .* larger than the outcome/, /at odds/]) assert.match(cross, re);
  const court = interpret(spread('celtic', ['ar16', 'ar19', 'ar17', 'pe10', 'sw10', 'wa06', 'wa03', 'sw05', 'sw09', 'cu14']));
  assert.match(court.positions[9].text, /court card.*in the hands of the person/);
  const sig = interpret(spread('celtic', ['ar16', 'ar19', 'ar17', 'pe10', 'sw10', 'wa06', 'cu03', 'sw05', 'sw09', 'cu14'], { significator: 'cu13' }));
  assert.match(sig.intro.join(' '), /the Queen of Cups is your Significator|The Queen of Cups is your Significator/);
  assert.match(sig.text, /shares the Significator's suit/);
});

test('fill refuses a missing value; questions are never re-scanned for placeholders', () => {
  assert.throws(() => fill('a {x} b', {}), /no value for \{x\}/);
  const it = interpret(spread('single', ['ar00']), { question: 'What about {card} and $1?' });
  assert.equal(it.intro[0], 'Your question: “What about {card} and $1?”'.replace('Your question', it.intro[0].split(':')[0]));
  assert.ok(it.text.includes('{card} and $1'));
});
