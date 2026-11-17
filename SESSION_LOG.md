# Session log

## 2026-11-11: redo in the dark neon web style
- Branch `web-interface` (not pushed). Replaced the 2017 page (index.html, script.js, style.css) with a static
  ES-module site in the shared web-kit style: reading table with four spreads, shuffle/cut/deal/flip animations,
  reversals, share links, card of the day, 78-card encyclopedia, reading journal (localStorage, JSON/Markdown export).
- Card texts: verbatim from Waite, *The Pictorial Key to the Tarot* (1910), Wikisource; `tools/extract_waite.py`.
- Bugs fixed in the original page first, each with a node regression test:
  1. Colman-Smith images were `*.JPG` but requested as `*.jpg` (whole deck broken on Pages, which is
     case-sensitive); Rider-Waite Knight of Cups was `cu12jpg.jpg` (broken); URLs used a backslash.
  2. Strength and Justice swapped in the Rider-Waite and Colman-Smith decks (names in Marseilles order, pictures in
     Waite's order).
  Also removed 20 unused byte-identical duplicate images and a stray .DS_Store. The invalid CSS selector
  `.pents,{` went away with the old style.css.
- Image sources: Rider-Waite = Smith's 1909 designs (PD in US), probably the sacred-texts.com scans (naming matches;
  not byte-verified). Marseilles and Colman-Smith: source not established (THIRD_PARTY.md).
- Images not re-encoded: 255 small JPEGs (10-80 KB each, ~9 MB in all); only the duplicates were removed.
- Tests: `node --test tests/*.test.mjs` (19 pass); `python tests/smoke_test.py` (all ok, 390 px no overflow).

## 2026-11-11 (later): original card art
- George: replace the cards with original art. `tools/make_deck.mjs` (+ `tools/deck/`) now generates the "Night" deck,
  `cards/<id>.svg` x 78 + `cards/back.svg` (deterministic, 3-9 kB each, 358 kB total), and `static/deck_desc.js`.
  Majors: one composition per trump from its traditional symbols; minors: suit emblems in number layouts over the
  suit's element with a number roundel; courts: standing page, mounted knight, queen on arched throne, king with sceptre.
- Inspected with contact sheets (`tools/contact_sheet.py`); fixed: thin wand/sword emblems, small pips and court
  emblems, Hanged Man off-frame, Wheel glyphs rendered as emoji (now drawn stars), Fool's "0" in old-style figures,
  dark pillar invisible, Chariot sphinxes hidden.
- Removed the three JPG decks (git rm) and deck switching; old `deck=` values in links/journal map to the new deck.
  THIRD_PARTY.md: art original, MIT; Waite quotes still cited.
- Tests: node 24 pass (incl. tests/deck.test.mjs); Playwright smoke test all ok.

## 2026-11-13: local app with a Python backend (branch web-interface)
- George: make the site runnable as a real local app through Project Hub. Added `web/` (FastAPI `web.app:app`),
  `run_web.py` (127.0.0.1:8238; 8160 is taken by go in the hub registry), `requirements-web.txt` (pinned).
- API: info, deck, cards/<id>, spreads, draw (seeded, same rules as the JS), daily, journal (+ add/note/delete/import/
  clear) stored in `data/journal.json` (git-ignored, `TAROT_DATA_DIR` overrides). Card texts are read from the
  generated JS modules, not copied.
- Front end: pages call `api()`; `index.html` keeps `window.APP_STATIC = true` for GitHub Pages (legacy, master root,
  unchanged) and `static/static_api.js` answers there; the app serves the page with `false`. Added `.nojekyll`.
- JS == Python: `tools/make_engine_fixture.mjs` -> `tests/fixtures/engine.json` (deck, mulberry32, FNV seeds, shuffle,
  cut, 49 draws, recurrences); node checks it is current, pytest checks the port reproduces it exactly; pytest also
  compares static_api.js with the server and cleanEntry with clean_entry.
- Tests: pytest tests 31 pass (also CI=1 in a clean venv from requirements-web.txt); node 28 pass; smoke_test.py and
  scripts/screenshots.py all ok in static mode and against the app (0 px overflow at 390 px).
- Journal privacy (lead): journal endpoints answer only loopback clients (403 otherwise, /api/info gives journal
  null); `static/journal_api.js` sends other devices' journals to their own localStorage. Tests: pytest 42 pass
  (TestClient as 127.0.0.1 and as 192.168.1.20); smoke_test.py `--as-remote` (X-Forwarded-For through uvicorn
  --forwarded-allow-ips) all ok with nothing written to the data folder; static and local runs all ok.

## 2026-11-16: written readings (branch web-interface)
- George: "add realistic tarot card readings". New rule-based, deterministic reading engine in pure JS
  (`static/reading_engine.js`, `reading_patterns.js` + text tables `reading_cards.js`, `reading_lore.js`,
  `reading_positions.js`, `reading_phrases.js`), ported to Python (`web/reading.py`, `web/reading_patterns.py`,
  `GET /api/reading`); `tools/make_reading_fixture.mjs` -> `tests/fixtures/readings.json` (50 readings) checked by
  pytest. Position x card frames (Waite's Celtic Cross roles), reversal modes, whole-spread threads (majors, suits,
  courts, Waite recurrences, numbers, reversals, Golden Dawn dignities, pairings, Celtic Cross relations), closing
  reflection and questions; three tones; phrasing picked from the seed, so share links (now with `tone`, `q`) give
  the same text. All interpretive text written for this site (THIRD_PARTY.md, About).
- Safety: health / legal / money-decision questions: no forecast, pointer to a professional, reflective frames and
  threads only; self-harm wording: no reading, a short supportive line (someone you trust, local helpline, emergency
  number). Waite's recurrence readings about health ("dangerous illness", "infirmity") and dated ones are left out;
  the old "Cards that recur" box that quoted them is gone.
- UI: reading below the table, progressive (passages as cards turn, synthesis when all are up), Waite's words folded
  under each card, Style of reading control, Copy reading; journal keeps tone + text (JSON, Markdown, journal page).
- Optional, local app only: `run_web.py --ollama MODEL` -> "Ask a local AI to elaborate" (`POST /api/elaborate`,
  loopback only, sensitive questions refused, off by default, mocked in tests). Checked once by hand with
  qwen2.5:14b on this computer's Ollama.
- Fix (separate commit, regression test first): the Four of Pentacles' reversed meaning was glued to its upright
  text (Wikisource prints "Reversed;"), so the site said Waite gave none; extractor fixed, waite_pkt.js regenerated.
- Tests: node 42 pass; pytest 101 pass (tests/, without the Playwright file); smoke_test.py all ok static and
  against the app (written reading, journal, share-link text, 390 px 0 overflow); scripts/screenshots.py --static
  and --base all ok. Screenshot docs/img/reading_text.jpg (full Celtic Cross reading).
- Lead review: (1) the reading speaks in the second person: `SPREADS.celtic.positions` are now "What covers you" ...
  "What will come" (JS and Python; Waite's names kept in `SPREADS.celtic.waite`, shown only in the "Waite's own
  words" detail and About, labelled as his 1910 wording); headings come from SPREADS, so old journal entries with
  Waite's names still read in the second person; node test: no him/his/her... in any engine-written text across the
  8,424-reading sweep. Dropped the empty "other face" reversal clause (the reversed gloss already says it).
  (2) Share links omit the question by default (`qw=1`; the shared reading leaves the question line out); a checkbox
  "Include my question in the link" adds it. Node + smoke tests for both. Fixtures regenerated (engine, readings).
  Tests: node 45 pass; pytest 106 pass; smoke_test.py all ok static and --base; screenshots.py ok.
