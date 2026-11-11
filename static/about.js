// #/about : what this is, how to run it, where the pictures and meanings come from, credits.
import { route, app } from './core.js';
import { CELTIC_POSITIONS } from './waite_pkt.js';

route('about', async () => {
  app().innerHTML = `
    <div class="hero"><p class="kicker">About</p><h1 class="glow">Tarot Reading</h1>
      <p class="lead">A tarot card reading webpage, first written in 2017 and redone in 2026 with spreads, animations,
      an encyclopedia of the cards and a reading journal. It is a game: readings are random and for entertainment only.</p></div>
    <div class="two">
      <section class="panel"><h3>What you can do</h3>
        <ul>
          <li><a href="#/read">Read</a>: choose a deck and a spread, shuffle (a riffle), cut the deck where you like, deal,
            and turn the cards over. Each card has an even chance of being reversed (switchable).</li>
          <li>Spreads: one card; three cards (past, present, future, the common modern layout); the original page's
            four-card draw; and the Celtic Cross as Waite describes it, with an optional Significator.</li>
          <li>Copy a link to a reading: the same link always deals the same cards (the shuffle is seeded).</li>
          <li><a href="#/cards">Cards</a>: all 78, filtered by arcana or suit or searched, each with its picture in all
            three decks and Waite's description and meanings.</li>
          <li><a href="#/journal">Journal</a>: save readings with notes in this browser; export as JSON or Markdown and
            import them elsewhere.</li>
        </ul></section>
      <section class="panel"><h3>Run it yourself</h3>
        <p>It is a static page: no build step and no server code. Serve the repository folder with any web server and open it,
          for example:</p>
        <pre>git clone https://github.com/gddickinson/tarot
cd tarot
python3 -m http.server 8000
# open http://127.0.0.1:8000/</pre>
        <p class="small mute">Opening index.html straight from disk does not work, because browsers block ES modules on file:// pages.</p>
        <h3>Tests</h3><pre>node --test tests/*.test.mjs
python tests/smoke_test.py   # Playwright</pre></section>
    </div>
    <h2>Where the words come from</h2>
    <p>The meanings, the card descriptions, Waite's "recurrence" table and the Celtic Cross are quoted, unchanged, from
      Arthur Edward Waite, <i>The Pictorial Key to the Tarot</i> (London: W. Rider, 1910; illustrated by
      Pamela Colman Smith), Part II §2 and Part III §2-§5 and §7, using the
      <a href="https://en.wikisource.org/wiki/The_Pictorial_Key_to_the_Tarot" target="_blank" rel="noopener">Wikisource transcription</a>.
      The book is in the public domain in the US. Waite himself calls the fortune-telling meanings of the trumps "artificial and arbitrary".</p>
    <p class="small mute">Waite's ten Celtic Cross positions: ${CELTIC_POSITIONS.join(' ')}</p>
    <h2>Where the pictures come from</h2>
    <p>The three decks are the image sets that have been in this repository since 2017. See
      <a href="https://github.com/gddickinson/tarot/blob/master/THIRD_PARTY.md" target="_blank" rel="noopener">THIRD_PARTY.md</a>
      for what is known about each. In short: the Rider-Waite pictures are Pamela Colman Smith's 1909 designs (public domain
      in the US); where the Marseilles and Colman-Smith image files came from is not recorded.</p>
    <p>The three card-back patterns are the CSS designs of the original page.</p>
    <h2>Credits</h2>
    <p>Developed by G.D. Dickinson. Code released under the MIT licence.
      <a href="https://github.com/gddickinson/tarot" target="_blank" rel="noopener">Source on GitHub</a>.</p>`;
});
