// The reading engine: turns a dealt reading (engine.js drawReading) plus the question and a tone into a written
// interpretation: an introduction, a summary, one passage per position (the card's meaning woven into the position's
// role, reversals read as blocked / inward / delayed / overdone / easing), "threads" (patterns across the spread) and
// a closing reflection with questions. Rule-based and deterministic: every phrase variant is chosen from the reading's
// seed (pick), so a share link always gives the same text. Pure (no DOM). Python port: web/reading.py.
import { CARD, SPREADS, RANK_PLURAL, seedFrom } from './engine.js';
import { CARD_TEXT } from './reading_cards.js';
import { SUIT_LORE, SUIT_TOPIC, NUMBER_LORE, COURT_LORE, SUIT_ADJ, PAIRS, TOPIC_NAMES } from './reading_lore.js';
import { POSITIONS, REFLECT, EXTRAS } from './reading_positions.js';
import { TONES, SPREAD_NAMES, MODE, OPEN, SUMMARY, SENSITIVE_MSG, THREAD_TITLES, THREAD, CLOSE,
  QUESTIONS } from './reading_phrases.js';
import { analyse, classifyQuestion, elementOf, relation, valence, NUM_WORDS } from './reading_patterns.js';

export { TONES };
export const DEFAULT_TONE = 'modern';
const ANCHOR = { single: 0, three: 2, four: 3, celtic: 9 };
const REFLECTIVE = ['health', 'legal', 'money'];
const SKIP_RECURRENCE = /illness|infirmity|women/;
const THREAD_ORDER = ['weight', 'suits', 'cross', 'pairs', 'elements', 'courts', 'numbers', 'reversals'];
// For health, legal and money-decision questions only the threads that describe the cards, not where things go.
const REFLECTIVE_THREADS = ['pairs', 'elements', 'courts'];

export function fill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (m, k) => {
    if (vars[k] === undefined || vars[k] === null) throw new Error(`no value for {${k}} in: ${template}`);
    return String(vars[k]);
  });
}
export const cap = s => (s ? s[0].toUpperCase() + s.slice(1) : s);
const sign = v => (v > 0 ? 1 : v < 0 ? -1 : 0);
export function joinList(items, sep = ', ', last = ' and ') {
  if (items.length <= 1) return items.join('');
  return items.slice(0, -1).join(sep) + last + items[items.length - 1];
}

// The card's name as it reads mid-sentence: "the Tower", "Strength", "the Three of Cups" (+ " reversed").
export function cardRef(id, reversed = false) {
  const c = CARD[id];
  let name = c.name;
  if (c.arcana === 'minor' || name === 'Wheel of Fortune') name = 'the ' + name;
  else if (name.startsWith('The ')) name = 'the ' + name.slice(4);
  return reversed ? name + ' reversed' : name;
}

function makeCtx(reading, question, tone) {
  const q = classifyQuestion(question);
  const topicKey = q.topic !== 'general' ? q.topic : q.decision ? 'decision' : null;
  return { reading, seed: reading.seed >>> 0, tone, spread: reading.spread, cards: reading.cards,
    roles: POSITIONS[reading.spread], an: analyse(reading), q, topicKey, usedTopic: {} };
}
const pick = (ctx, list, key) => (Array.isArray(list) ? list[seedFrom(`${ctx.seed}|${key}`) % list.length] : list);
const ref = (ctx, i) => cardRef(ctx.cards[i].id, ctx.cards[i].reversed);
const pairVars = (ctx, a, b) => ({ a: ref(ctx, a), A: cap(ref(ctx, a)), b: ref(ctx, b), B: cap(ref(ctx, b)),
  sa: ctx.roles[a].short, sb: ctx.roles[b].short });

function positionText(ctx, i) {
  const { tone } = ctx, c = ctx.cards[i], role = ctx.roles[i], ct = CARD_TEXT[c.id], card = CARD[c.id];
  const rev = !!c.reversed, r = cardRef(c.id, rev);
  const reflect = REFLECTIVE.includes(ctx.q.sensitive) && role.time === 'future';
  const vars = { card: r, Card: cap(r), meaning: rev ? ct.rev : ct.up, short: role.short, Short: cap(role.short) };
  const parts = [fill(pick(ctx, reflect ? REFLECT[tone] : role.frames[tone], `pos${i}`), vars)];
  if (rev) parts.push(pick(ctx, MODE[tone][ct.mode], `mode${i}`));
  const v = valence(c);
  if (ctx.spread === 'celtic') {
    if (i === 1 && v > 0) parts.push(EXTRAS.cross_kind[tone]);
    if (i === 8 && v !== 0) parts.push(EXTRAS[v > 0 ? 'hope' : 'fear'][tone]);
    if (i === 9 && !reflect && card.arcana === 'major') parts.push(EXTRAS.outcome_major[tone]);
    if (i === 9 && !reflect && card.court) parts.push(EXTRAS.outcome_court[tone]);
  }
  if (role.key && ctx.topicKey && tone !== 'brief' && !ctx.q.sensitive) {
    const group = card.arcana === 'major' ? 'major' : card.suit;
    if (!ctx.usedTopic[group]) { parts.push(SUIT_TOPIC[group][ctx.topicKey]); ctx.usedTopic[group] = true; }
  }
  return { i, pos: c.pos, id: c.id, reversed: rev,
    heading: `${i + 1}. ${c.pos}: ${card.name}${rev ? ' (reversed)' : ''}`, text: parts.join(' ') };
}

function intro(ctx, question) {
  const { tone, q } = ctx;
  if (q.sensitive === 'selfharm') return [SENSITIVE_MSG.selfharm[tone]];
  const text = String(question || '').trim();
  const first = text ? fill(pick(ctx, OPEN.question[tone], 'q'), { q: text }) : pick(ctx, OPEN.noquestion[tone], 'noq');
  const rest = [];
  const topic = { topic: TOPIC_NAMES[q.topic] };
  if (q.sensitive) rest.push(SENSITIVE_MSG[q.sensitive][tone]);
  else if (q.topic !== 'general') rest.push(fill(OPEN[q.decision ? 'topic_decision' : 'topic'][tone], topic));
  else if (q.decision) rest.push(OPEN.decision[tone]);
  const sig = ctx.reading.significator;
  if (sig) rest.push(fill(OPEN.sig[tone], { card: cardRef(sig), Card: cap(cardRef(sig)) }));
  return [first, rest.filter(Boolean).join(' ')].filter(Boolean);
}

function summary(ctx) {
  const n = ctx.cards.length, a = ANCHOR[ctx.spread];
  if (n < 2 || ctx.q.sensitive) return [];
  return [fill(pick(ctx, SUMMARY[ctx.tone][ctx.an.tenor], 'sum'), { Count: cap(NUM_WORDS[n]), count: NUM_WORDS[n],
    spread: SPREAD_NAMES[ctx.spread], anchor: ref(ctx, a), short: ctx.roles[a].short })];
}

const THREADS = {
  weight(ctx) {
    const { tone, an } = ctx, k = an.majors.length, n = an.n;
    if (n < 3) return '';
    const vars = { K: cap(NUM_WORDS[k]), k: NUM_WORDS[k], n: NUM_WORDS[n] };
    if (k >= 2 && k * 2 >= n) return fill(THREAD.majors_many[tone], vars);
    if (k === 0) return THREAD.majors_none[tone];
    if (k === 1 && n >= 5) return fill(THREAD.majors_one[tone], { card: ref(ctx, an.majors[0]), short: ctx.roles[an.majors[0]].short });
    return '';
  },
  suits(ctx) {
    const { tone, an } = ctx, out = [];
    if (an.dominant) out.push(fill(SUIT_LORE[an.dominant].dominant[tone], { k: NUM_WORDS[an.suitCounts[an.dominant]] }));
    if (an.missing.length) out.push(fill(THREAD.missing[tone], { list: joinList(an.missing.map(s => SUIT_LORE[s].missing[tone]), '; ', '; and ') }));
    return out.join(' ');
  },
  cross(ctx) {
    if (ctx.spread !== 'celtic') return '';
    const { tone } = ctx, v = ctx.cards.map(valence), out = [], T = (key, a, b) => fill(THREAD[key][tone], pairVars(ctx, a, b));
    const centre = v[0] > 0 && v[1] < 0 ? 'centre_kind_hard' : v[0] < 0 && v[1] > 0 ? 'centre_hard_kind'
      : v[0] < 0 && v[1] < 0 ? 'centre_hard' : v[0] > 0 && v[1] > 0 ? 'centre_kind' : 'centre_mixed';
    out.push(T(centre, 0, 1));
    if (!ctx.q.sensitive) out.push(T(v[5] > v[4] ? 'trend_up' : v[5] < v[4] ? 'trend_down' : 'trend_flat', 4, 5));
    out.push(T(sign(v[2]) === sign(v[3]) ? 'aim_close' : 'aim_gap', 2, 3));
    const e6 = elementOf(ctx.cards[6].id), e7 = elementOf(ctx.cards[7].id);
    if (e6 && e7) out.push(T(relation(e6, e7) === 'contrary' ? 'self_odds' : 'self_step', 6, 7));
    if (!ctx.q.sensitive) {
      const h = v[8] < 0 && v[9] > 0 ? 'fear_bigger' : v[8] > 0 && v[9] < 0 ? 'hope_ahead'
        : v[8] > 0 && v[9] > 0 ? 'hope_met' : v[8] < 0 && v[9] < 0 ? 'fear_met' : 'hope_mixed';
      out.push(T(h, 8, 9));
    }
    const sig = ctx.reading.significator, own = CARD[ctx.cards[6].id];
    if (sig && CARD[sig].arcana === 'minor' && own.arcana === 'minor' && CARD[sig].suit === own.suit) out.push(THREAD.sig_suit[tone]);
    return out.join(' ');
  },
  pairs(ctx) {
    return ctx.an.pairs.map(i => PAIRS[i][ctx.tone === 'traditional' ? 'traditional' : 'modern']).join(' ');
  },
  elements(ctx) {
    const { tone, an } = ctx;
    const items = an.dignities.filter(d => d.rel === 'contrary').slice(0, 2)
      .concat(an.dignities.filter(d => d.rel === 'same').slice(0, 1));
    if (!items.length && an.dignities.length && an.dignities[0].rel === 'friendly') items.push(an.dignities[0]);
    const out = items.map(d => fill(THREAD['dig_' + d.rel][tone], { ...pairVars(ctx, d.a, d.b), ea: d.ea, eb: d.eb }));
    if (an.middle) out.push(fill(THREAD['dig_middle_' + an.middle][tone], { A: cap(ref(ctx, 1)) }));
    return out.length ? [THREAD.dig_lead[tone], ...out].filter(Boolean).join(' ') : '';
  },
  courts(ctx) {
    const { tone, an } = ctx, out = [];
    if (an.courts.length >= 3) out.push(fill(THREAD.courts_many[tone], { K: cap(NUM_WORDS[an.courts.length]), k: NUM_WORDS[an.courts.length] }));
    for (const i of an.courts.slice(0, 4)) {
      const c = CARD[ctx.cards[i].id], lore = COURT_LORE[String(c.rank)];
      out.push(fill(THREAD.court[tone], { Card: cap(ref(ctx, i)), adj: SUIT_ADJ[c.suit], person: lore.person, aspect: lore.aspect }));
    }
    return out.join(' ');
  },
  numbers(ctx) {
    const { tone, an } = ctx, out = [];
    for (const r of an.recurrences) {
      const vars = { Count: cap(NUM_WORDS[r.count]), plural: RANK_PLURAL[r.rank], orient: r.mode === 'reversed' ? 'reversed' : 'upright', meaning: r.meaning };
      if (SKIP_RECURRENCE.test(r.meaning)) out.push(fill(THREAD.recur_skip[tone], vars));
      else if (r.rank > 10) out.push(fill(THREAD.recur_court[tone], vars));
      else out.push(fill(THREAD.recur[tone], { ...vars, num: NUMBER_LORE[String(r.rank)].name.toLowerCase(), theme: NUMBER_LORE[String(r.rank)].theme }));
    }
    if (an.run) {
      out.push(fill(THREAD.run[tone], { list: joinList(an.run.map(x => NUMBER_LORE[String(x)].name.toLowerCase())),
        from: NUMBER_LORE[String(an.run[0])].theme, to: NUMBER_LORE[String(an.run[an.run.length - 1])].theme }));
    }
    if (an.stage) out.push(THREAD[an.stage][tone]);
    if (an.trend) out.push(THREAD[an.trend][tone]);
    return out.join(' ');
  },
  reversals(ctx) {
    const { tone, an } = ctx;
    if (!ctx.reading.reversals || an.n < 3) return '';
    const vars = { K: cap(NUM_WORDS[an.reversed]), n: NUM_WORDS[an.n] };
    if (an.reversed * 2 > an.n) return fill(THREAD.rev_many[tone], vars);
    if (an.reversed === 0 && an.n >= 5) return THREAD.rev_none[tone];
    return '';
  },
};

function threads(ctx) {
  if (ctx.q.sensitive === 'selfharm') return [];
  const out = [];
  for (const key of THREAD_ORDER) {
    if (ctx.q.sensitive && !REFLECTIVE_THREADS.includes(key)) continue;
    const text = THREADS[key](ctx);
    if (text) out.push({ key, title: THREAD_TITLES[key], text });
  }
  return ctx.tone === 'brief' ? out.slice(0, 3) : out;
}

function closing(ctx) {
  const { tone, q, an } = ctx;
  if (q.sensitive === 'selfharm') return [CLOSE.sensitive.selfharm[tone]];
  const kws = ctx.cards.map(c => (c.reversed ? CARD_TEXT[c.id].rkw : CARD_TEXT[c.id].kw));
  const parts = [];
  if (q.sensitive) parts.push(fill(CLOSE.arc_reflect[tone], { list: joinList([...new Set(kws)]) }));
  else {
    const vars = {};
    kws.forEach((k, i) => { vars['k' + i] = k; vars['K' + i] = cap(k); });
    parts.push(fill(CLOSE.arc[ctx.spread][tone], vars), CLOSE.tenor[an.tenor][tone]);
  }
  if (q.sensitive) parts.push(CLOSE.sensitive[q.sensitive][tone]);
  else if (q.topic === 'money') parts.push(CLOSE.money_note[tone]);
  return [parts.join(' ')];
}

// Which question banks to draw from, and how many from each, in order.
function questionBanks(ctx) {
  const { an, q } = ctx;
  if (q.sensitive) return [['sensitive', 2], ['general', 3]];
  const banks = [];
  const pattern = ctx.reading.reversals && an.n >= 3 && an.reversed * 2 > an.n ? 'reversed'
    : an.n >= 3 && an.majors.length >= 2 && an.majors.length * 2 >= an.n ? 'majors'
      : an.courts.length ? 'courts' : an.missing.length ? 'missing_' + an.missing[0]
        : an.dominant ? 'dominant_' + an.dominant : null;
  if (pattern) banks.push([pattern, 1]);
  if (q.decision) banks.push(['decision', 1]);
  if (q.topic !== 'general') banks.push([q.topic, 3]);
  banks.push(['general', 3]);
  return banks;
}

function questions(ctx) {
  if (ctx.q.sensitive === 'selfharm') return [];
  const want = ctx.tone === 'brief' ? 2 : 3, out = [];
  for (const [bank, quota] of questionBanks(ctx)) {
    const list = QUESTIONS[bank], start = seedFrom(`${ctx.seed}|q|${bank}`) % list.length;
    let taken = 0;
    for (let j = 0; j < list.length && taken < quota && out.length < want; j++) {
      const item = list[(start + j) % list.length];
      if (!out.includes(item)) { out.push(item); taken += 1; }
    }
  }
  return out;
}

// The full interpretation. reading: {seed, spread, cards: [{pos, id, reversed}], significator, reversals}.
export function interpret(reading, { question = '', tone = DEFAULT_TONE } = {}) {
  const t = TONES[tone] ? tone : DEFAULT_TONE;
  const ctx = makeCtx(reading, question, t);
  const selfharm = ctx.q.sensitive === 'selfharm';
  const out = {
    tone: t, topic: ctx.q.topic, decision: ctx.q.decision, sensitive: ctx.q.sensitive,
    intro: intro(ctx, question), summary: summary(ctx),
    positions: selfharm ? [] : ctx.cards.map((c, i) => positionText(ctx, i)),
    threads: threads(ctx), closing: closing(ctx), questions: questions(ctx), note: selfharm ? '' : CLOSE.note[t],
  };
  out.text = readingText(out, reading);
  return out;
}

// Plain text of an interpretation (Copy reading, the journal, Markdown export).
export function readingText(it, reading) {
  const lines = [`Tarot reading: ${SPREADS[reading.spread].label} (${TONES[it.tone]})`, ''];
  for (const p of it.intro.concat(it.summary)) lines.push(p, '');
  if (it.positions.length) {
    lines.push('The cards', '');
    for (const p of it.positions) lines.push(p.heading, p.text, '');
  }
  if (it.threads.length) {
    lines.push('Threads', '');
    for (const t of it.threads) lines.push(`${t.title}: ${t.text}`, '');
  }
  if (it.closing.length) lines.push('Reflection', '', ...it.closing, '');
  if (it.questions.length) lines.push('Questions to consider', '', ...it.questions.map(x => '- ' + x), '');
  if (it.note) lines.push(it.note);
  return lines.join('\n').trimEnd();
}
