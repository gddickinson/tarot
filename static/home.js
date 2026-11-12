// #/ : hero with a fan of cards, counts, the card of the day, the spreads and the deck.
import { $, $$, route, app, list, esc } from './core.js';
import { CARDS, CARD, SPREADS, drawReading, seedFrom, imageFile, BACK_FILE } from './engine.js';
import { cardEl, cardTags, meaningHTML, cite, journal, reducedMotion } from './widgets.js';
import { flip } from './anim.js';

const FAN = ['ar00', 'ar01', 'ar02', 'ar17', 'ar19', 'ar21', 'cu01'];

route('home', async () => {
  const deck = 'night';
  const today = new Date().toISOString().slice(0, 10);
  const daily = drawReading({ seed: seedFrom('daily ' + today), spread: 'single' }).cards[0];
  const saved = journal.load().length;
  app().innerHTML = `
    <section class="hero">
      <p class="kicker">Tarot card reading</p>
      <h1 class="glow">Tarot Reading</h1>
      <p class="lead">A web-based tarot card reading with its own deck of 78 original cards. Shuffle, cut and deal a single card,
        three cards, the original four-card draw or a full Celtic Cross; turn the cards over and read the traditional
        meanings from A. E. Waite's 1910 <i>Pictorial Key to the Tarot</i>. For entertainment.</p>
      <a class="btn" href="#/read">Start a reading</a><a class="btn alt" href="#/cards">The 78 cards</a>
      <a class="btn alt" href="#/journal">Journal</a>
    </section>
    <div class="fan" id="fan" aria-hidden="true">${FAN.map(id => cardEl(id, { deck, up: true, still: true })).join('')}</div>
    <div class="tiles">
      <div class="tile"><b>${CARDS.length}</b><span>cards: 22 major, 56 minor</span></div>
      <div class="tile"><b>22</b><span>major arcana, each its own picture</span></div>
      <div class="tile"><b>${Object.keys(SPREADS).length}</b><span>spreads</span></div>
      <div class="tile"><b>${saved}</b><span>reading${saved === 1 ? '' : 's'} in your journal</span></div>
    </div>
    <h2>Card of the day</h2>
    <div class="panel daily">
      <div>${cardEl(daily.id, { deck, reversed: daily.reversed, label: 'Card of the day' })}</div>
      <div id="daily-text"><p class="quote">One card for ${today}, the same for everyone today. Press it to turn it over.</p></div>
    </div>
    <h2>Spreads</h2>
    <div class="grid">${list(Object.entries(SPREADS), ([k, s]) => `<a class="card" href="#/read?spread=${k}">
      <b>${s.label}</b><small>${s.positions.length} card${s.positions.length > 1 ? 's' : ''}</small><span>${esc(s.blurb)}</span></a>`)}</div>
    <h2>The deck</h2>
    <p>Seventy-eight original cards drawn for this site: night-blue and gold, each major arcanum a picture built from the
      card's traditional symbols, the minor arcana in suit emblems over the landscape of their element.
      <a href="#/cards">See them all</a>.</p>
    <div class="cardgrid">${['back', 'ar17', 'ar09', 'cu03', 'wa12', 'pe13'].map(id => `<a class="cg" href="${id === 'back' ? '#/cards' : `#/card/${id}`}">
      <img src="${id === 'back' ? BACK_FILE : imageFile(deck, CARD[id])}" alt="" loading="lazy"><span>${id === 'back' ? 'The back' : esc(CARD[id].name)}</span></a>`).join('')}</div>`;
  layoutFan();
  const card = $('.daily .tcard');
  card.onclick = async () => {
    if (card.classList.contains('up')) return;
    await flip(card);
    const c = CARD[daily.id];
    card.setAttribute('aria-label', `Card of the day: ${c.name}${daily.reversed ? ', reversed' : ''}`);
    $('#daily-text').innerHTML = `<h3>Card of the day</h3><b class="serif" style="font-size:24px">${c.name}</b>
      <span class="pill ${daily.reversed ? 'rev' : 'up'}">${daily.reversed ? 'reversed' : 'upright'}</span> ${cardTags(c)}
      ${meaningHTML(c.id, daily.reversed)}<a href="#/card/${c.id}">More about ${c.name}</a>${cite()}`;
  };
});

// Spread the hero cards in an arc; they open further on hover (no motion if reduced motion is set).
function layoutFan() {
  const els = $$('#fan .tcard'), n = els.length, fan = $('#fan');
  const place = spread => els.forEach((el, i) => {
    const t = i - (n - 1) / 2;
    el.style.left = `calc(50% - var(--cw) / 2)`;
    el.style.transform = `translateX(${t * spread * 0.55}px) rotate(${t * spread / 9}deg) translateY(${Math.abs(t) * spread / 14}px)`;
  });
  place(56);
  if (reducedMotion()) return;
  fan.onmouseenter = () => place(78);
  fan.onmouseleave = () => place(56);
}
