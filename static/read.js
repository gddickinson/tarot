// #/read : a reading at the table: choose deck and spread, shuffle, cut, deal, turn the cards over,
// then read Waite's meanings, save to the journal or copy a link that reproduces the reading.
import { $, $$, esc, route, app, list } from './core.js';
import { CARD, CARDS, DECKS, SPREADS, SUITS, RANK_PLURAL, deckById, drawReading, randomSeed, recurrences, readingToQuery,
  queryToReading } from './engine.js';
import { cardEl, cardTags, meaningHTML, cite, journal, prefs } from './widgets.js';
import { makeEntry } from './journal_model.js';
import { packHTML, shuffleAnim, cutAnim, dealAnim, flip } from './anim.js';

let S = null; // state of the reading on screen

route('read', async (args, q) => {
  const shared = queryToReading(q);
  S = {
    deck: deckById(q.deck || prefs.get('deck', 'rider')).id,
    spread: SPREADS[q.spread] ? q.spread : 'three',
    reversals: q.rev ? q.rev !== '0' : prefs.get('rev', '1') !== '0',
    significator: shared ? shared.significator : null,
    question: '', seed: shared ? shared.seed : randomSeed(), reading: shared, saved: false, phase: 'ready',
  };
  app().innerHTML = `
    <div class="hero"><p class="kicker">A reading</p><h1 class="glow">${shared ? 'A shared reading' : 'Time to choose a card'}</h1>
      <p class="lead">Pick a deck and a spread, shuffle, cut and deal. Tarot here is for entertainment.</p></div>
    <section class="panel" aria-label="Reading options">
      <div class="row">
        <div><label for="deck">Deck</label><select id="deck">${list(DECKS, d => `<option value="${d.id}">${d.label}</option>`)}</select></div>
        <div><label for="question">Your question (optional)</label><input id="question" maxlength="300" placeholder="What is on your mind?"></div>
      </div>
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
    <section id="interp" aria-live="polite"></section>`;
  $('#deck').value = S.deck;
  $('#rev').checked = S.reversals;
  $('#sig').value = S.significator || '';
  $('#deck').onchange = e => { S.deck = e.target.value; prefs.set('deck', S.deck); redraw(); };
  $('#rev').onchange = e => { S.reversals = e.target.checked; prefs.set('rev', S.reversals ? '1' : '0'); restart(); };
  $('#sig').onchange = e => { S.significator = e.target.value || null; restart(); };
  $('#question').oninput = e => { S.question = e.target.value; };
  $$('#spreads button').forEach(b => { b.onclick = () => { S.spread = b.dataset.sp; restart(); }; });
  $('#cut').oninput = e => { $('#cutv').textContent = e.target.value; };
  if (shared) { S.phase = 'revealed'; redraw(); } else restart();
});

function restart() {
  S.seed = randomSeed(); S.reading = null; S.saved = false; S.phase = 'ready';
  redraw();
}

function setStatus(t) { $('#status').textContent = t; }

// Re-render the table for the current phase (also after a deck change, keeping the cards).
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
      + btn('b-share', 'Copy link', true),
  }[S.phase];
  setStatus({ ready: 'Time to choose a card.', shuffled: 'Shuffled. Cut the deck wherever you like.',
    cut: 'Reading started! Deal the cards.', dealt: 'Turn the cards over one at a time, or reveal them all.',
    revealed: 'Reading finished.' }[S.phase]);
  $('#layout').innerHTML = S.reading && (S.phase === 'dealt' || S.phase === 'revealed') ? layoutHTML() : '';
  const on = (id, fn) => { const b = $('#' + id); if (b) b.onclick = fn; };
  on('b-shuffle', doShuffle); on('b-cut', () => doCut(+$('#cut').value)); on('b-skipcut', () => doCut(null));
  on('b-deal', doDeal); on('b-reveal', revealAll); on('b-new', restart); on('b-save', save); on('b-share', share);
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
    S.reading = drawReading({ seed: S.seed, spread: S.spread, cutAt: at, reversals: S.reversals,
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
  if (!r || !r.cards.some(c => c.shown)) { host.innerHTML = ''; return; }
  const shown = r.cards.map((c, i) => [c, i]).filter(([c]) => c.shown);
  const rec = S.phase === 'revealed' ? recurrences(r.cards) : [];
  host.innerHTML = `<h2>The cards</h2>
    ${S.question ? `<p class="quote">“${esc(S.question)}”</p>` : ''}
    ${r.significator ? `<p>Significator: <a href="#/card/${r.significator}">${CARD[r.significator].name}</a></p>` : ''}
    <div class="interp">${shown.map(([c, i]) => `<div class="panel it">
      ${cardEl(c.id, { deck: S.deck, reversed: c.reversed, up: true, still: true })}
      <div><h3>${i + 1}. ${esc(c.pos)}</h3>
        <b class="serif" style="font-size:20px">${CARD[c.id].name}</b>
        <span class="pill ${c.reversed ? 'rev' : 'up'}">${c.reversed ? 'reversed' : 'upright'}</span> ${cardTags(CARD[c.id])}
        ${meaningHTML(c.id, c.reversed)}
        <a class="small" href="#/card/${c.id}?deck=${S.deck}">More about this card</a></div></div>`).join('')}</div>
    ${rec.length ? `<h2>Cards that recur</h2><div class="callout">${rec.map(x => `<p class="quote">${x.count} ${RANK_PLURAL[x.rank]}
      ${x.mode === 'reversed' ? 'reversed' : 'upright'}: <b>${esc(x.meaning)}</b></p>`).join('')}
      <p class="src">From Waite, Part III §5, "The Recurrence of Cards in Dealing" (upright and reversed counted separately).</p></div>` : ''}
    ${cite()}`;
}

function save() {
  const e = makeEntry(S.reading, { deck: S.deck, question: S.question });
  if (journal.add(e)) { S.saved = true; setStatus('Saved to your journal (in this browser).'); $('#b-save').textContent = 'Saved'; $('#b-save').disabled = true; }
  else setStatus('Could not save: this browser is not letting the page store data.');
}

async function share() {
  const url = location.href.split('#')[0] + '#/read?' + readingToQuery(S.reading, S.deck);
  try { await navigator.clipboard.writeText(url); setStatus('Link copied: it opens this same reading.'); }
  catch (e) { setStatus('Copy this link: ' + url); }
}
