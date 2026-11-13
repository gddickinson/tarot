"""Local Python backend for the Tarot Reading site (FastAPI).

- app.py      the FastAPI `app`: serves index.html, static/, cards/ and the JSON API under /api
- engine.py   port of static/engine.js + core.js rng: deck, seeded shuffle/cut/draw, spreads, recurrences
- texts.py    reads Waite's texts and the picture descriptions from static/waite_pkt.js and static/deck_desc.js
- journal.py  reading journal rules (cleanEntry/merge) and the JSON file store in data/ (git-ignored)
"""
