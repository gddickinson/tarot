// The written reading on the Read page, as HTML: the introduction at once, one passage per card as it is turned,
// and the summary, threads, reflection and questions once every card is face up. The text itself comes from the
// reading engine (reading_engine.js, or the local app's /api/reading, which gives the same text).
import { esc } from './core.js';
import { CARD } from './engine.js';
import { cardEl, cardTags, meaningHTML, WAITE_CITE } from './widgets.js';

const paras = list => list.map(p => `<p>${esc(p)}</p>`).join('');

export function readingHTML(it, reading, { complete = false, deck = 'night' } = {}) {
  const shown = it.positions.filter(p => reading.cards[p.i] && reading.cards[p.i].shown);
  const sig = reading.significator;
  return `<h2 id="reading-h">Your reading</h2>
    <div class="reading-intro">${paras(it.intro)}${complete ? paras(it.summary) : ''}</div>
    ${sig && it.positions.length ? `<p class="small">Significator: <a href="#/card/${sig}">${esc(CARD[sig].name)}</a></p>` : ''}
    ${shown.length ? `<div class="interp">${shown.map(p => `<article class="panel it" aria-labelledby="pos-${p.i}">
      ${cardEl(p.id, { deck, reversed: p.reversed, up: true, still: true })}
      <div><h3 id="pos-${p.i}">${esc(p.heading)}</h3>
        <p class="reading-text">${esc(p.text)}</p>
        <details><summary>Waite's own words ${cardTags(CARD[p.id])}</summary>${meaningHTML(p.id, p.reversed)}</details>
        <a class="small" href="#/card/${p.id}">More about this card</a></div></article>`).join('')}</div>` : ''}
    ${complete ? completeHTML(it) : it.positions.length ? '<p class="small mute">Turn every card over for the whole reading.</p>' : ''}`;
}

function completeHTML(it) {
  return `${it.threads.length ? `<h2>Threads</h2><div class="threads">${it.threads.map(t => `<section class="panel thread">
      <h3>${esc(t.title)}</h3><p>${esc(t.text)}</p></section>`).join('')}</div>` : ''}
    ${it.closing.length ? `<h2>Reflection</h2>${paras(it.closing)}` : ''}
    ${it.questions.length ? `<h3>Questions to consider</h3><ul class="questions">${it.questions.map(q => `<li>${esc(q)}</li>`).join('')}</ul>` : ''}
    ${it.note ? `<p class="small mute">${esc(it.note)}</p>` : ''}
    <p class="src">The reading is written by this site's rule-based reading engine from ${WAITE_CITE}, and from traditional
      correspondences (Golden Dawn elements and dignities, number and court-card meanings); see <a href="#/about">About</a>.</p>`;
}
