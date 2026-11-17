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
| `static/reading_engine.js` | **pure**: `interpret(reading, {question, tone})` -> `{tone, topic, decision, sensitive, intro, summary, positions[{i, heading, text}], threads[{key, title, text}], closing, questions, note, text}`; `readingText`, `cardRef`, `fill`, `cap`, `joinList`, `TONES`, `DEFAULT_TONE`; phrase variants picked by `seedFrom(seed + '|' + key)` |
| `static/reading_patterns.js` | **pure**: `classifyQuestion` (topic love/work/money/general, decision, sensitive selfharm/health/legal/money), `analyse(reading)` (majors, suits, dominant/missing, courts, pips, run, stage, trend, reversals, recurrences, dignities, middle, pairs, score, tenor), `elementOf`, `relation`, `valence`, `longestRun`, `NUM_WORDS`, `DIGNITY_PAIRS` |
| `static/reading_cards.js`, `reading_lore.js`, `reading_positions.js`, `reading_phrases.js` | plain-JSON text tables of the reading engine, written for this site (`CARD_TEXT` glosses + tenor + reversal mode, `MAJOR_ELEMENT`; suits, numbers, courts, pairs, topic and sensitive keywords; `POSITIONS` roles and frames per spread, `REFLECT`, `EXTRAS`; `MODE`, `OPEN`, `SUMMARY`, `SENSITIVE_MSG`, `THREAD`, `CLOSE`, `QUESTIONS` per tone). Read by Python through `web/texts.reading_data()` |
| `static/reading_view.js` | `readingHTML(interp, reading, {complete, deck})`: the reading on the Read page (progressive) |
| `static/journal_api.js` | `journalApi(path, body)`, `inBrowser()`: the app's journal for this computer, else localStorage via static_api |
| `static/static_api.js` | `staticApi(path, body)`: the local app's API answered in the browser (engine + localStorage journal) |
| `static/journal_model.js` | **pure**: `makeEntry` (with `tone`, `reading` text), `cleanEntry`, `serialiseJournal`, `parseJournal`, `mergeJournals`, `journalToMarkdown`, `READING_TONES` |
| `static/waite_pkt.js` | generated data: `WAITE` (78 cards: description, upright, reversed, additional), `CELTIC_POSITIONS`, `RECURRENCE`, `WAITE_SOURCE` |
| `static/deck_desc.js` | generated: `DECK_DESC` (what each card picture shows) |
| `static/widgets.js` | `cardEl` (flippable card), `thumb`, `cardTags`, `meaningHTML`, `cite`, `journal` (localStorage, try/catch), `prefs`, `reducedMotion` |
| `static/anim.js` | `packHTML`, `shuffleAnim` (riffle), `cutAnim`, `dealAnim` (FLIP from the pack), `flip` |
| `static/home.js` | `#/`: hero, card fan, tiles (`/info`), card of the day (`/daily`), spreads (`/spreads`), decks |
| `static/read.js` | `#/read`: options (question, style of reading, spread, reversals, significator), phases ready → shuffled → cut (`/reading`) → dealt → revealed, the written reading (rewritten when the tone or question changes), save (`/journal/add`, with tone and text), Copy reading, share link (with `tone`, `q`), optional local-AI button (`/elaborate`) |
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
| `web/app.py` | FastAPI `app`: `/` (index.html with APP_STATIC false), `/static`, `/cards`, `/api/info`, `/api/deck`, `/api/cards/{id}`, `/api/spreads`, `/api/draw`, `/api/reading`, `/api/daily`, `/api/elaborate` (optional, loopback), `/api/journal` + POST `add`/`note`/`delete`/`import`/`clear` (loopback only: `is_loopback`, `local_only`, 403); `STATIC_ENDPOINTS` |
| `web/reading.py`, `web/reading_patterns.py` | Python port of the reading engine: `interpret(reading, question, tone)`, `reading_text`; `analyse`, `classify_question` |
| `web/elaborate.py` | optional local AI (Ollama) for `POST /api/elaborate`: `model()` (env `TAROT_OLLAMA_MODEL`, set by `run_web.py --ollama`), `ask_ollama`, `elaborate` |
| `web/engine.py` | Python port of engine.js + core.js `rng`: `CARDS`, `CARD`, `SPREADS`, `rng`, `seed_from`, `shuffle`, `cut`, `draw_reading`, `recurrences` |
| `web/texts.py` | `load()`: `WAITE`, `CELTIC_POSITIONS`, `RECURRENCE`, `WAITE_SOURCE`, `DECK_DESC` read from the generated JS modules; `reading_data()`: the reading engine's tables from `static/reading_*.js` |
| `web/journal.py` | `clean_entry`, `merge`, `parse` (journal_model.js rules); `load`/`save`/`update` of `data/journal.json` (`$TAROT_DATA_DIR`) |
| `tools/make_engine_fixture.mjs` | writes `tests/fixtures/engine.json` from the JS engine (`--check` compares) |
| `tools/make_reading_fixture.mjs` | writes `tests/fixtures/readings.json` (50 interpretations) from the reading engine (`--check` compares) |
| `tests/reading.test.mjs`, `tests/reading_fixture.test.mjs` | node: reading engine (patterns, sensitive questions, determinism, every card x position x spread x tone); fixture current |
| `tests/test_reading.py` | pytest: Python reading engine == fixture, `/api/reading`, `/api/elaborate` (Ollama mocked) |
| `tests/test_web.py` | pytest: API, assets, Python port == fixture, static_api == server, journal store, cleanEntry parity, node tests |
| `tests/engine_fixture.test.mjs`, `tests/static_api.test.mjs` | node: the fixture is current; static_api draw and journal endpoints |
| `scripts/screenshots.py` | kit smoke test of routes (`--static` serves the repo root, `--base URL` the app; `--shots`) |
| `THIRD_PARTY.md` | sources and licences of the images and texts |

## How modules connect
`main.js` → pages (`home`, `read`, `cards`, `journal_page`, `about`) → `widgets.js` / `anim.js` → `engine.js` and
`journal_model.js` → `core.js` (rng) and `waite_pkt.js`. `read.js` → `reading_view.js`; `static_api.js` →
`reading_engine.js` → `reading_patterns.js` → `engine.js` and the `reading_*.js` tables. Only the pure modules are imported by the node tests.
`web/app.py` → `web/engine.py` / `web/journal.py` / `web/reading.py` (→ `reading_patterns.py`) / `web/elaborate.py` → `web/texts.py` → `static/waite_pkt.js`, `static/deck_desc.js` (data only).
