# INTERFACE: navigation map

A static site (no build) served by GitHub Pages from the `master` branch root, and the same pages as a local app with a
Python backend (`python run_web.py`, FastAPI, port 8238). Pages call `api(path)` (core.js): the server's `/api/...` when
served by the app, `static_api.js` in the browser when `window.APP_STATIC` is true (index.html sets it; the app's copy
says false). Hash routes:
`#/` home, `#/read` reading table, `#/cards` encyclopedia, `#/card/<id>` one card, `#/journal`, `#/about`.

## Card ids
`ar00`-`ar21` major arcana in Waite numbering (8 Strength, 11 Justice); `wa`/`cu`/`sw`/`pe` + `01`-`14` for Wands,
Cups, Swords, Pentacles (01 Ace ... 10, 11 Page, 12 Knight, 13 Queen, 14 King). Picture files share the id
(`cards/ar00.svg`; back: `cards/back.svg`). `DECKS` holds the one deck (`night`); any other deck id (from older saved
readings or links) maps to it.

## Files
| File | Contents |
|---|---|
| `index.html` | page shell: header/nav, `#app`, footer, loads `static/main.js` |
| `static/style.css`, `static/core.js` | web kit, unchanged: theme; `route`, `lazy`, `start`, `esc`, `download`, `rng` (mulberry32) |
| `static/style_app.css` | palette (gold/violet/teal), `.tcard` 3D flip, `.back-0` card back (cards/back.svg), table, spread grids, page styles |
| `static/main.js` | registers pages lazily, not-found page, starry `#bg` canvas, `start()` |
| `static/engine.js` | **pure**: `CARDS`, `CARD`, `SUITS`, `RANKS`, `MAJORS`, `DECKS`, `deckById`, `imageFile`, `BACK_FILE`, `seedFrom`, `shuffle`, `cut`, `SPREADS`, `drawReading`, `recurrences`, `readingToQuery`, `queryToArgs`, `queryToReading`, `drawQuery` |
| `static/static_api.js` | `staticApi(path, body)`: the local app's API answered in the browser (engine + localStorage journal) |
| `static/journal_model.js` | **pure**: `makeEntry`, `cleanEntry`, `serialiseJournal`, `parseJournal`, `mergeJournals`, `journalToMarkdown` |
| `static/waite_pkt.js` | generated data: `WAITE` (78 cards: description, upright, reversed, additional), `CELTIC_POSITIONS`, `RECURRENCE`, `WAITE_SOURCE` |
| `static/deck_desc.js` | generated: `DECK_DESC` (what each card picture shows) |
| `static/widgets.js` | `cardEl` (flippable card), `thumb`, `cardTags`, `meaningHTML`, `cite`, `journal` (localStorage, try/catch), `prefs`, `reducedMotion` |
| `static/anim.js` | `packHTML`, `shuffleAnim` (riffle), `cutAnim`, `dealAnim` (FLIP from the pack), `flip` |
| `static/home.js` | `#/`: hero, card fan, tiles (`/info`), card of the day (`/daily`), spreads (`/spreads`), decks |
| `static/read.js` | `#/read`: options, phases ready → shuffled → cut (`/draw`) → dealt → revealed, interpretation, save (`/journal/add`), share link |
| `static/cards.js` | `#/cards` (filters, search) and `#/card/<id>` (picture, its description, Waite texts, recurrence table, prev/next) |
| `static/journal_page.js` | `#/journal`: list, notes, delete, export JSON/Markdown, import (all through `/journal...`) |
| `static/about.js` | `#/about`: features, running, sources, credits |
| `cards/*.svg` | the original deck: 78 faces + `back.svg` (generated, do not edit) |
| `tools/make_deck.mjs` | writes `cards/*.svg` and `static/deck_desc.js` (`--check` compares); exports `buildDeck`, `back`, `descModule` |
| `tools/deck/lib.mjs` | palette `C`, `rng`, card frame `card()`, stars, sun, moon, hills, waves, `person()` figures, horse, dog, lion, suit `EMBLEM`s |
| `tools/deck/majors1.mjs`, `majors2.mjs` | `MAJOR_A` (0-X), `MAJOR_B` (XI-XXI): one composition per trump |
| `tools/deck/minors.mjs` | `minor(suit, rank, id)`: aces, pip layouts with element landscape and number roundel, court cards |
| `tools/contact_sheet.py` | Playwright contact sheet of the deck (`--only` prefixes) |
| `tools/extract_waite.py` | builds `static/waite_pkt.js` from the Wikisource HTML of Parts 2 and 3 |
| `tests/engine.test.mjs`, `tests/journal.test.mjs`, `tests/deck.test.mjs` | node tests of the pure modules (`node --test tests/*.test.mjs`) |
| `tests/smoke_test.py` | Playwright smoke test against the `http.server` server, or `--base URL` of the app (`--shots` refreshes `docs/img/`) |
| `run_web.py` | starts the local app: uvicorn `web.app:app` on 127.0.0.1:8238 (`--port`) |
| `web/app.py` | FastAPI `app`: `/` (index.html with APP_STATIC false), `/static`, `/cards`, `/api/info`, `/api/deck`, `/api/cards/{id}`, `/api/spreads`, `/api/draw`, `/api/daily`, `/api/journal` + POST `add`/`note`/`delete`/`import`/`clear`; `STATIC_ENDPOINTS` |
| `web/engine.py` | Python port of engine.js + core.js `rng`: `CARDS`, `CARD`, `SPREADS`, `rng`, `seed_from`, `shuffle`, `cut`, `draw_reading`, `recurrences` |
| `web/texts.py` | `load()`: `WAITE`, `CELTIC_POSITIONS`, `RECURRENCE`, `WAITE_SOURCE`, `DECK_DESC` read from the generated JS modules |
| `web/journal.py` | `clean_entry`, `merge`, `parse` (journal_model.js rules); `load`/`save`/`update` of `data/journal.json` (`$TAROT_DATA_DIR`) |
| `tools/make_engine_fixture.mjs` | writes `tests/fixtures/engine.json` from the JS engine (`--check` compares) |
| `tests/test_web.py` | pytest: API, assets, Python port == fixture, static_api == server, journal store, cleanEntry parity, node tests |
| `tests/engine_fixture.test.mjs`, `tests/static_api.test.mjs` | node: the fixture is current; static_api draw and journal endpoints |
| `scripts/screenshots.py` | kit smoke test of routes (`--static` serves the repo root, `--base URL` the app; `--shots`) |
| `THIRD_PARTY.md` | sources and licences of the images and texts |

## How modules connect
`main.js` → pages (`home`, `read`, `cards`, `journal_page`, `about`) → `widgets.js` / `anim.js` → `engine.js` and
`journal_model.js` → `core.js` (rng) and `waite_pkt.js`. Only the pure modules are imported by the node tests.
`web/app.py` → `web/engine.py` / `web/journal.py` → `web/texts.py` → `static/waite_pkt.js`, `static/deck_desc.js` (data only).
