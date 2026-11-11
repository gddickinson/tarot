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
