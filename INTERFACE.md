# INTERFACE: navigation map

A static site (no build, no server code) served by GitHub Pages from the `master` branch root. Hash routes:
`#/` home, `#/read` reading table, `#/cards` encyclopedia, `#/card/<id>` one card, `#/journal`, `#/about`.

## Card ids
`ar00`-`ar21` major arcana in Waite numbering (8 Strength, 11 Justice); `wa`/`cu`/`sw`/`pe` + `01`-`14` for Wands,
Cups, Swords, Pentacles (01 Ace ... 10, 11 Page, 12 Knight, 13 Queen, 14 King). Image files share the id
(`Rider_Waite/ar00.jpg`), except the Marseilles majors 8 and 11, which are swapped (`engine.imageFile`).

## Files
| File | Contents |
|---|---|
| `index.html` | page shell: header/nav, `#app`, footer, loads `static/main.js` |
| `static/style.css`, `static/core.js` | web kit, unchanged: theme; `route`, `lazy`, `start`, `esc`, `download`, `rng` (mulberry32) |
| `static/style_app.css` | palette (gold/violet/teal), `.tcard` 3D flip, `.back-0/1/2` card backs, table, spread grids, page styles |
| `static/main.js` | registers pages lazily, not-found page, starry `#bg` canvas, `start()` |
| `static/engine.js` | **pure**: `CARDS`, `CARD`, `SUITS`, `RANKS`, `MAJORS`, `DECKS`, `imageFile`, `printedNumber`, `seedFrom`, `shuffle`, `cut`, `SPREADS`, `drawReading`, `recurrences`, `readingToQuery`, `queryToReading` |
| `static/journal_model.js` | **pure**: `makeEntry`, `cleanEntry`, `serialiseJournal`, `parseJournal`, `mergeJournals`, `journalToMarkdown` |
| `static/waite_pkt.js` | generated data: `WAITE` (78 cards: description, upright, reversed, additional), `CELTIC_POSITIONS`, `RECURRENCE`, `WAITE_SOURCE` |
| `static/widgets.js` | `cardEl` (flippable card), `thumb`, `cardTags`, `meaningHTML`, `cite`, `journal` (localStorage, try/catch), `prefs`, `reducedMotion` |
| `static/anim.js` | `packHTML`, `shuffleAnim` (riffle), `cutAnim`, `dealAnim` (FLIP from the pack), `flip` |
| `static/home.js` | `#/`: hero, card fan, tiles, card of the day, spreads, decks |
| `static/read.js` | `#/read`: options, phases ready → shuffled → cut → dealt → revealed, interpretation, save, share link |
| `static/cards.js` | `#/cards` (filters, search, deck) and `#/card/<id>` (all decks, Waite texts, recurrence table, prev/next) |
| `static/journal_page.js` | `#/journal`: list, notes, delete, export JSON/Markdown, import |
| `static/about.js` | `#/about`: features, running, sources, credits |
| `tools/extract_waite.py` | builds `static/waite_pkt.js` from the Wikisource HTML of Parts 2 and 3 |
| `tests/engine.test.mjs`, `tests/journal.test.mjs` | node tests of the pure modules (`node --test tests/*.test.mjs`) |
| `tests/smoke_test.py` | Playwright smoke test against the `http.server` server (`--shots` refreshes `docs/img/`) |
| `THIRD_PARTY.md` | sources and licences of the images and texts |

## How modules connect
`main.js` → pages (`home`, `read`, `cards`, `journal_page`, `about`) → `widgets.js` / `anim.js` → `engine.js` and
`journal_model.js` → `core.js` (rng) and `waite_pkt.js`. Only the pure modules are imported by the node tests.
