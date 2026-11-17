// #/read : a reading at the table: choose a spread, shuffle, cut, deal, turn the cards over,
// then read the written reading (reading_view.js), save it to the journal, copy it, or copy a link that reproduces it.
import { $, $$, esc, route, app, list, api, isStatic } from './core.js';
import { CARD, CARDS, SPREADS, SUITS, deckById, randomSeed, shareQuery, queryToArgs,
  drawQuery } from './engine.js';
import { cardEl, prefs } from './widgets.js';
import { TONES } from './reading_phrases.js';
import { readingHTML } from './reading_view.js';
import { makeEntry } from './journal_model.js';
import { journalApi, inBrowser } from './journal_api.js';
import { packHTML, shuffleAnim, cutAnim, dealAnim, flip } from './anim.js';

let S = null; // state of the reading on screen

// A reading and its written interpretation from the API (the Python server's /api/reading, or static_api.js on the
// static site): the same arguments, question and tone give the same cards and text either way. A copy, because the
// page marks cards as shown.
const readingQuery = (args, question, tone) => `/reading?${drawQuery(args)}&${new URLSearchParams({ q: question, tone,
  qw: S.withheld && !question.trim() ? '1' : '0' })}`;
async function draw(args) {
  const { interpretation, ...r } = structuredClone(await api(readingQuery(args, S.question, S.tone)));
  S.interp = interpretation;
  return r;
}
// The question or tone changed: the same cards, the text written again.
async function rewrite() {
  if (!S.reading) return;
  const r = S.reading;
  try {
    S.interp = (await api(readingQuery({ seed: r.seed, spread: r.spread, cutAt: r.cutAt, reversals: r.reversals,
      significator: r.significator }, S.question, S.tone))).interpretation;
    S.saved = false; S.aiText = null;
    redraw();
  } catch (e) { setStatus('Could not write the reading: ' + e.message); }
}

route('read', async (args, q) => {
  const link = queryToArgs(q);
  S = { question: String(q.q || '').slice(0, 300), tone: TONES[q.tone] ? q.tone : prefs.get('tone', 'modern'),
    withheld: q.qw === '1', shareQ: false };
  if (!TONES[S.tone]) S.tone = 'modern';
  const shared = link ? await draw(link) : null;
  S = { ...S, interp: S.interp || null,
    deck: 'night',
    spread: SPREADS[q.spread] ? q.spread : 'three',
    reversals: q.rev ? q.rev !== '0' : prefs.get('rev', '1') !== '0',
    significator: shared ? shared.significator : null,
    seed: shared ? shared.seed : randomSeed(), reading: shared, saved: false, phase: 'ready',
  };
  app().innerHTML = `
    <div class="hero"><p class="kicker">A reading</p><h1 class="glow">${shared ? 'A shared reading' : 'Time to choose a card'}</h1>
      <p class="lead">Pick a spread, shuffle, cut and deal. Tarot here is for entertainment.</p></div>
    <section class="panel" aria-label="Reading options">
      <div class="row">
        <div><label for="question">Your question (optional)</label><input id="question" maxlength="300" placeholder="What is on your mind?"></div>
      </div>
      <label id="tone-l">Style of reading</label>
      <div class="seg" role="group" aria-labelledby="tone-l" id="tones">${list(Object.entries(TONES),
        ([k, t]) => `<button type="button" data-tone="${k}" aria-pressed="false">${t}</button>`)}</div>
      <label id="spread-l">Spread</label>
      <div class="seg" role="group" aria-labelledby="spread-l" id="spreads">${list(Object.entries(SPREADS),
        ([k, s]) => `<button type="button" data-sp="${k}" aria-pressed="false">${s.label}</button>`)}</div>
      <p class="small mute" id="blurb"></p>
      <div class="row">
        <div><label><input type="checkbox" id="rev"> Reversed cards (each card has an even chance of landing upside down)</label></div>
        <div id="sigrow"><label for="sig">Significator (Celtic Cross, optional)</label><select id="sig"><option value="">None</option>
          ${list(SUITS, s => `<optgroup label="${s.name} court cards">${list(CARDS.filter(c => c.suit === s.key && c.court),
            c => `<option value="${c.id}">${c.name}</option>`)}</optgroup>`)}
          <optgroup label="Major arcana">${list(CARDS.filter(c => c.arcana === 'major'), c => `<option value="${c.id}">${c.roman} ${c.name}</option>`)}</optgroup>
        </select></div>
      </div>
    </section>
    <section class="table" id="table" aria-label="Card table">
      <p class="status" id="status" role="status" aria-live="polite"></p>
      <div class="pack-wrap"><div class="pack" id="pack"></div><span class="small mute" id="packn"></span></div>
      <div class="cutrow" id="cutrow" hidden><label for="cut">Cut after card <b id="cutv"></b></label>
        <input type="range" id="cut" min="1" max="76" value="39"></div>
      <div class="controls" id="controls"></div>
      <div id="layout"></div>
    </section>
    <section id="interp" aria-labelledby="reading-h"></section>`;
  $('#rev').checked = S.reversals;
  $('#sig').value = S.significator || '';
  $('#rev').onchange = e => { S.reversals = e.target.checked; prefs.set('rev', S.reversals ? '1' : '0'); restart(); };
  $('#sig').onchange = e => { S.significator = e.target.value || null; restart(); };
  $('#question').value = S.question;
  $('#question').oninput = e => { S.question = e.target.value; };
  $('#question').onchange = rewrite;
  $$('#tones button').forEach(b => {
    b.onclick = () => { S.tone = b.dataset.tone; prefs.set('tone', S.tone); toneButtons(); rewrite(); };
  });
  toneButtons();
  // the optional local-AI button: only in the local app started with --ollama MODEL (web/elaborate.py)
  if (!isStatic()) {
    api('/info', { fresh: true }).then(i => { S.ai = i.elaborate || null; if (S.phase === 'revealed') redraw(); })
      .catch(() => { S.ai = null; });
  }
  $$('#spreads button').forEach(b => { b.onclick = () => { S.spread = b.dataset.sp; restart(); }; });
  $('#cut').oninput = e => { $('#cutv').textContent = e.target.value; };
  if (shared) { S.phase = 'revealed'; redraw(); } else restart();
});

function toneButtons() {
  $$('#tones button').forEach(b => { const on = b.dataset.tone === S.tone; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
}

function restart() {
  S.seed = randomSeed(); S.reading = null; S.interp = null; S.aiText = null; S.saved = false; S.phase = 'ready';
  redraw();
}

function setStatus(t) { $('#status').textContent = t; }

// Re-render the table for the current phase.
function redraw() {
  const sp = SPREADS[S.spread], d = deckById(S.deck);
  $$('#spreads button').forEach(b => { const on = b.dataset.sp === S.spread; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  $('#blurb').textContent = sp.blurb;
  $('#sigrow').hidden = !sp.significator;
  const pack = $('#pack');
  pack.innerHTML = packHTML(d.back);
  pack.parentElement.classList.toggle('gone', S.phase === 'dealt' || S.phase === 'revealed');
  $('#packn').textContent = S.phase === 'ready' || S.phase === 'shuffled' || S.phase === 'cut'
    ? `${S.significator && sp.significator ? 77 : 78} cards` : '';
  $('#cutrow').hidden = S.phase !== 'shuffled';
  $('#cutv').textContent = $('#cut').value;
  const ctl = $('#controls');
  const btn = (id, text, alt = false) => `<button type="button" id="${id}"${alt ? ' class="alt"' : ''}>${text}</button>`;
  ctl.innerHTML = {
    ready: btn('b-shuffle', 'Shuffle deck'),
    shuffled: btn('b-cut', 'Cut') + btn('b-skipcut', 'Let the cards decide', true),
    cut: btn('b-deal', 'Deal'),
    dealt: btn('b-reveal', 'Reveal all') + btn('b-new', 'New reading', true),
    revealed: btn('b-new', 'New reading') + btn('b-save', S.saved ? 'Saved' : 'Save to journal', true)
      + btn('b-copy', 'Copy reading', true) + btn('b-share', 'Copy link', true)
      + `<label class="share-q"><input type="checkbox" id="share-q"${S.shareQ ? ' checked' : ''}> Include my question in the link</label>`
      + (S.ai && S.interp && !S.interp.sensitive ? btn('b-ai', 'Ask a local AI to elaborate', true) : ''),
  }[S.phase];
  setStatus({ ready: 'Time to choose a card.', shuffled: 'Shuffled. Cut the deck wherever you like.',
    cut: 'Reading started! Deal the cards.', dealt: 'Turn the cards over one at a time, or reveal them all.',
    revealed: 'Reading finished.' }[S.phase]);
  $('#layout').innerHTML = S.reading && (S.phase === 'dealt' || S.phase === 'revealed') ? layoutHTML() : '';
  const on = (id, fn) => { const b = $('#' + id); if (b) b.onclick = fn; };
  on('b-shuffle', doShuffle); on('b-cut', () => doCut(+$('#cut').value)); on('b-skipcut', () => doCut(null));
  on('b-deal', doDeal); on('b-reveal', revealAll); on('b-new', restart); on('b-save', save); on('b-share', share);
  on('b-copy', copyReading); on('b-ai', elaborate);
  if ($('#share-q')) $('#share-q').onchange = e => { S.shareQ = e.target.checked; };
  if ($('#b-save') && S.saved) $('#b-save').disabled = true;
  $$('#layout .tcard').forEach(el => { el.onclick = () => turn(el); });
  renderInterp();
}

async function busy(fn) {
  $$('#controls button, #table select').forEach(b => { b.disabled = true; });
  try { await fn(); } finally { redraw(); }
}

function doShuffle() {
  return busy(async () => { setStatus('Shuffling...'); await shuffleAnim($('#pack')); S.phase = 'shuffled'; });
}

function doCut(at) {
  return busy(async () => {
    S.reading = await draw({ seed: S.seed, spread: S.spread, cutAt: at, reversals: S.reversals,
      significator: SPREADS[S.spread].significator ? S.significator : null });
    setStatus('Cutting...');
    await cutAnim($('#pack'), S.reading.cutAt / 78);
    S.phase = 'cut';
  });
}

function doDeal() {
  return busy(async () => {
    S.phase = 'dealt';
    $('#layout').innerHTML = layoutHTML();
    const items = $$('#layout .slot:not(.sig) .tcard').map(el => {
      el.style.visibility = 'hidden';
      return { el, rot: el.closest('.p2') ? 90 : 0 };
    });
    setStatus('Dealing...');
    await dealAnim($('#pack'), items);
  });
}

async function turn(el) {
  if (S.phase !== 'dealt' || el.classList.contains('up') || el.closest('.sig')) return;
  const i = +el.dataset.i, c = S.reading.cards[i];
  el.setAttribute('aria-label', `${c.pos}: ${CARD[c.id].name}${c.reversed ? ', reversed' : ''}`);
  const nm = el.closest('.slot').querySelector('.nm');
  await flip(el);
  if (nm) nm.textContent = CARD[c.id].name + (c.reversed ? ' (reversed)' : '');
  setStatus(`Card drawn: ${CARD[c.id].name}${c.reversed ? ', reversed' : ''}.`);
  c.shown = true;
  renderInterp();
  if (S.reading.cards.every(x => x.shown)) { S.phase = 'revealed'; setTimeout(redraw, 200); }
}

async function revealAll() {
  const els = $$('#layout .slot:not(.sig) .tcard:not(.up)');
  for (const el of els) { turn(el); await new Promise(r => setTimeout(r, 160)); }
}

function layoutHTML() {
  const r = S.reading, sp = SPREADS[S.spread];
  const up = S.phase === 'revealed';
  if (up) r.cards.forEach(c => { c.shown = true; });
  const slots = r.cards.map((c, i) => `<div class="slot p${i + 1}"><span class="lbl">${i + 1}. ${esc(c.pos)}</span>
    ${cardEl(c.id, { deck: S.deck, reversed: c.reversed, up: up || c.shown, label: `${i + 1}. ${c.pos}` }).replace('class="tcard', `data-i="${i}" class="tcard`)}
    <span class="nm">${up || c.shown ? esc(CARD[c.id].name + (c.reversed ? ' (reversed)' : '')) : ''}</span></div>`).join('');
  const sig = r.significator ? `<div class="slot sig"><span class="lbl">Significator</span>
    ${cardEl(r.significator, { deck: S.deck, up: true, still: true })}<span class="nm"></span></div>` : '';
  const key = S.spread === 'celtic' ? '<p class="cross-key">Card 1 covers the Significator (if one was chosen) and card 2 lies across card 1. Waite lays the cross out for a Significator facing left: 5 (behind) on the right, 6 (before) on the left; 7 to 10 rise in a column.</p>' : '';
  return `<div class="spread ${S.spread}">${sig}${slots}</div>${key}`;
}

function renderInterp() {
  const host = $('#interp');
  if (!host) return;
  const r = S.reading;
  if (!r || !S.interp || !r.cards.some(c => c.shown)) { host.innerHTML = ''; return; }
  host.innerHTML = readingHTML(S.interp, r, { complete: S.phase === 'revealed', deck: S.deck })
    + (S.aiText ? `<section class="panel ai-note" aria-labelledby="ai-h"><h3 id="ai-h">A local AI's elaboration</h3>
      <p class="small mute">Written by ${esc(S.aiText.model)} through Ollama on this computer, not by the reading engine. For
      entertainment, like the rest.</p>${S.aiText.text.split(/\n+/).map(t => `<p>${esc(t)}</p>`).join('')}</section>` : '');
}

async function save() {
  const entry = makeEntry(S.reading, { deck: S.deck, question: S.question, tone: S.interp && S.interp.tone,
    text: S.interp ? S.interp.text : '' });
  try {
    await journalApi('/journal/add', { entry });
    S.saved = true; $('#b-save').textContent = 'Saved'; $('#b-save').disabled = true;
    setStatus(`Saved to your journal (${await inBrowser() ? 'in this browser' : 'on this computer, data/journal.json'}).`);
  } catch (e) { setStatus('Could not save: ' + e.message); }
}

// The link deals the same cards and writes the same text; the question goes in only if the box is ticked.
async function share() {
  const url = location.href.split('#')[0] + '#/read?' + shareQuery(S.reading, S.deck,
    { tone: S.tone, question: S.question, includeQuestion: S.shareQ });
  const note = S.question.trim() ? (S.shareQ ? ' (your question is part of the link)' : ' (without your question)') : '';
  try { await navigator.clipboard.writeText(url); setStatus(`Link copied: it opens this same reading${note}.`); }
  catch (e) { setStatus('Copy this link: ' + url); }
}

async function copyReading() {
  if (!S.interp) return;
  try { await navigator.clipboard.writeText(S.interp.text); setStatus('Reading copied as text.'); }
  catch (e) { setStatus('Could not copy: select the text of the reading instead.'); }
}

// Local app only, and only when started with --ollama MODEL: the server rebuilds this reading and asks the model.
async function elaborate() {
  const r = S.reading, b = $('#b-ai');
  if (b) b.disabled = true;
  setStatus('Asking the local AI (this can take a minute)...');
  try {
    S.aiText = await api('/elaborate', { body: { spread: r.spread, seed: r.seed, cut: r.cutAt, rev: r.reversals,
      sig: r.significator, q: S.question, tone: S.tone } });
    setStatus('The local AI has answered (below the reading).');
    renderInterp();
  } catch (e) { setStatus('The local AI could not answer: ' + e.message); }
  if (b) b.disabled = false;
}
