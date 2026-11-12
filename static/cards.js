// #/cards : the encyclopedia of all 78 cards (filters by arcana and suit, search);
// #/card/<id> : one card, its picture's description and Waite's description and meanings.
import { $, $$, esc, route, app, list, go } from './core.js';
import { CARDS, CARD, SUITS, RANK_PLURAL, imageFile, suitOf } from './engine.js';
import { WAITE, RECURRENCE } from './waite_pkt.js';
import { DECK_DESC } from './deck_desc.js';
import { cardEl, cardTags, meaningHTML, cite } from './widgets.js';

const FILTERS = [['all', 'All 78'], ['major', 'Major arcana'], ['minor', 'Minor arcana'],
  ...SUITS.map(s => [s.key, `${s.sym} ${s.name}`])];

function matches(c, f, q) {
  if (f === 'major' && c.arcana !== 'major') return false;
  if (f === 'minor' && c.arcana !== 'minor') return false;
  if (SUITS.some(s => s.key === f) && c.suit !== f) return false;
  if (!q) return true;
  const w = WAITE[c.id];
  return (c.name + ' ' + w.upright + ' ' + w.reversed).toLowerCase().includes(q.toLowerCase());
}

route('cards', async (args, query) => {
  const f = FILTERS.some(([k]) => k === query.f) ? query.f : 'all';
  app().innerHTML = `
    <div class="hero"><p class="kicker">Encyclopedia</p><h1 class="glow">The 78 cards</h1>
      <p class="lead">Twenty-two major arcana and four suits of fourteen. Pick a card for its picture and Waite's meanings,
      upright and reversed.</p></div>
    <div class="filters">
      <div><label id="f-l">Show</label><div class="seg" role="group" aria-labelledby="f-l" id="fseg">${list(FILTERS,
        ([k, t]) => `<button type="button" data-f="${k}" aria-pressed="${k === f}" class="${k === f ? 'on' : ''}">${t}</button>`)}</div></div>
      <div class="q"><label for="cq">Search names and meanings</label><input id="cq" type="search" value="${esc(query.q || '')}" placeholder="e.g. Queen, journey, success"></div>
    </div>
    <p class="small mute" id="count" role="status"></p>
    <div class="cardgrid" id="grid"></div>`;
  const state = { f, q: query.q || '' };
  const draw = () => {
    const shown = CARDS.filter(c => matches(c, state.f, state.q));
    $('#count').textContent = `${shown.length} card${shown.length === 1 ? '' : 's'}`;
    $('#grid').innerHTML = shown.map(c => `<a class="cg" href="#/card/${c.id}">
      <img src="${imageFile('night', c)}" alt="" loading="lazy"><span>${c.arcana === 'major' ? c.roman + ' · ' : ''}${esc(c.name)}</span></a>`).join('')
      || '<p class="mute">No card matches.</p>';
    const qs = new URLSearchParams({ f: state.f, keep: '1', ...(state.q ? { q: state.q } : {}) });
    history.replaceState(null, '', '#/cards?' + qs);
  };
  $$('#fseg button').forEach(b => {
    b.onclick = () => {
      state.f = b.dataset.f;
      $$('#fseg button').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
      draw();
    };
  });
  $('#cq').oninput = e => { state.q = e.target.value.trim(); draw(); };
  draw();
});

route('card', async ([id], query) => {
  const c = CARD[id];
  if (!c) { app().innerHTML = '<h1>No such card</h1><p><a href="#/cards">All cards</a></p>'; return; }
  const w = WAITE[c.id], i = CARDS.indexOf(c);
  const prev = CARDS[(i + 77) % 78], next = CARDS[(i + 1) % 78];
  const s = suitOf(c);
  const recur = c.arcana === 'minor' ? `<h3>Several ${RANK_PLURAL[c.rank]} in one reading</h3>
    <table><tr><th></th><th>Upright</th><th>Reversed</th></tr>${[4, 3, 2].map(n => `<tr><td>${n}</td>
      <td>${esc(RECURRENCE.natural[c.rank][n])}</td><td>${esc(RECURRENCE.reversed[c.rank][n])}</td></tr>`).join('')}</table>
    <p class="src">Waite, Part III §5, "The Recurrence of Cards in Dealing".</p>` : '';
  const add = w.additional ? `<h3>Additional meanings (Waite, Part III §4)</h3>
    <p class="quote">${esc(w.additional.upright)}</p>${w.additional.reversed ? `<p class="quote"><b style="color:var(--accent2)">Reversed.</b> ${esc(w.additional.reversed)}</p>` : ''}` : '';
  app().innerHTML = `
    <p class="small"><a href="#/cards?f=${c.arcana === 'major' ? 'major' : c.suit}">← ${c.arcana === 'major' ? 'Major arcana' : s.name}</a></p>
    <div class="detail">
      <div>
        <div class="big">${cardEl(c.id, { up: true, label: c.name })}</div>
        <p class="small mute">Press the card to turn it upside down (reversed).</p>
        <h3>The picture on this card</h3><p class="small">${esc(DECK_DESC[c.id])}</p>
      </div>
      <div>
        <p class="kicker">${c.arcana === 'major' ? `Major arcana ${c.roman}` : `${s.name} · ${c.court ? 'court card' : 'pip card'}`}</p>
        <h1 class="glow">${esc(c.name)}</h1>
        <p>${cardTags(c)}${w.waite_title && w.waite_title !== c.name ? `<span class="tag">Waite: ${esc(w.waite_title)}</span>` : ''}</p>
        <h3>Waite's picture</h3>
        <p class="quote">${esc(w.description)}</p>
        <p class="src">Waite's description of the 1909 Rider-Waite design, not of the card shown here (${c.arcana === 'major' ? 'Part II §2, first paragraph' : 'Part III §2'}).</p>
        <h3>Divinatory meanings</h3>
        <div id="m-up" class="callout">${meaningHTML(c.id, false)}</div><div id="m-rev">${meaningHTML(c.id, true)}</div>
        ${add}${recur}${cite()}
      </div>
    </div>
    <div class="pager"><a class="btn alt" href="#/card/${prev.id}">← ${esc(prev.name)}</a>
      <a class="btn alt" href="#/card/${next.id}">${esc(next.name)} →</a></div>`;
  const big = $('.big .tcard');
  big.onclick = () => {
    const rev = big.classList.toggle('rev');
    big.setAttribute('aria-label', `${c.name}${rev ? ', reversed' : ''}`);
    $('#m-rev').classList.toggle('callout', rev);
    $('#m-up').classList.toggle('callout', !rev);
  };
  document.onkeydown = e => {
    if (!location.hash.startsWith('#/card/') || e.target.matches('input, textarea, select')) return;
    if (e.key === 'ArrowLeft') go(`#/card/${prev.id}`);
    if (e.key === 'ArrowRight') go(`#/card/${next.id}`);
  };
});
