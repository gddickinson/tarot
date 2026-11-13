"""Python port of static/engine.js and the mulberry32 rng of static/core.js: the 78-card deck, seeded
shuffle/cut/deal, reversals, spreads and Waite's recurrence table.

Ported operation for operation so that the same seed gives the same reading in the browser and on the server
(checked against tests/fixtures/engine.json, written by tools/make_engine_fixture.mjs from the JS engine).
All 32-bit arithmetic is done on unsigned values masked with M (JS int32/uint32 bit patterns are the same).
"""
import re
import secrets

from .texts import load

M = 0xFFFFFFFF

SUITS = [
    {"id": "wa", "key": "wands", "name": "Wands", "sym": "☤"},
    {"id": "cu", "key": "cups", "name": "Cups", "sym": "☕"},
    {"id": "sw", "key": "swords", "name": "Swords", "sym": "†"},
    {"id": "pe", "key": "pentacles", "name": "Pentacles", "sym": "✪"},
]
RANKS = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
         "Page", "Knight", "Queen", "King"]
RANK_PLURAL = ["", "Aces", "Twos", "Threes", "Fours", "Fives", "Sixes", "Sevens", "Eights", "Nines",
               "Tens", "Pages", "Knights", "Queens", "Kings"]
MAJORS = ["The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor",
          "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit", "Wheel of Fortune", "Justice",
          "The Hanged Man", "Death", "Temperance", "The Devil", "The Tower", "The Star", "The Moon", "The Sun",
          "Judgement", "The World"]
ROMAN = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV",
         "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"]
DECKS = [{"id": "night", "label": "Night", "dir": "cards", "back": 0}]
BACK_FILE = "cards/back.svg"


def build_deck() -> list[dict]:
    """Card ids: ar00-ar21 (majors, Waite numbering), wa/cu/sw/pe + 01..14 (01 Ace ... 11 Page, 14 King)."""
    deck = [{"id": f"ar{n:02d}", "arcana": "major", "suit": None, "number": n, "roman": ROMAN[n], "name": name}
            for n, name in enumerate(MAJORS)]
    for s in SUITS:
        for i, r in enumerate(RANKS):
            deck.append({"id": f"{s['id']}{i + 1:02d}", "arcana": "minor", "suit": s["key"], "rank": i + 1,
                         "court": i >= 10, "name": f"{r} of {s['name']}"})
    return deck


CARDS = build_deck()
CARD = {c["id"]: c for c in CARDS}


def deck_by_id(deck_id) -> dict:
    return next((d for d in DECKS if d["id"] == deck_id), DECKS[0])


def image_file(deck_id, card_id: str) -> str:
    return f"{deck_by_id(deck_id)['dir']}/{card_id}.svg"


def imul(a: int, b: int) -> int:
    """Math.imul on uint32 bit patterns: the low 32 bits of the product."""
    return (a * b) & M


def rng(seed: int = 1):
    """mulberry32, as core.js rng(): returns a function giving floats in [0, 1)."""
    a = seed & M

    def nxt() -> float:
        nonlocal a
        a = (a + 0x6D2B79F5) & M
        t = imul(a ^ (a >> 15), 1 | a)
        t = ((t + imul(t ^ (t >> 7), 61 | t)) & M) ^ t
        return ((t ^ (t >> 14)) & M) / 4294967296
    return nxt


def seed_from(text) -> int:
    """FNV-1a over the code points of a text (a date, a question): a 32-bit seed."""
    h = 0x811C9DC5
    for ch in str(text):
        h = imul(h ^ ord(ch), 0x01000193)
    return h


def random_seed() -> int:
    return secrets.randbits(32)


def shuffle(items: list, rand) -> list:
    """Fisher-Yates on a copy, driven by rand()."""
    a = list(items)
    for i in range(len(a) - 1, 0, -1):
        j = int(rand() * (i + 1))
        a[i], a[j] = a[j], a[i]
    return a


def cut(items: list, at: int) -> list:
    """The top `at` cards go to the bottom."""
    k = at % len(items)
    return items[k:] + items[:k]


def _position(p: str) -> str:
    p = re.sub(r"^\d+\.\s*", "", p)
    return p[:-1] if p.endswith(".") else p


def spreads() -> dict:
    celtic = [_position(p) for p in load()["CELTIC_POSITIONS"]]
    return {
        "single": {"label": "Single card", "blurb": "One card for a quick look.", "positions": ["The card"]},
        "three": {"label": "Three cards", "blurb": "Past, present and future, the usual three-card layout.",
                  "positions": ["Past", "Present", "Future"]},
        "four": {"label": "Four-card draw", "blurb": "The reading of the original page: four cards drawn in a row.",
                 "positions": ["First card", "Second card", "Third card", "Fourth card"]},
        "celtic": {"label": "Celtic Cross", "blurb": "Ten cards, \"An Ancient Celtic Method of Divination\" from "
                   "Waite's Pictorial Key (1910), with an optional Significator.", "significator": True,
                   "positions": celtic},
    }


SPREADS = spreads()


def draw_reading(seed: int, spread: str = "three", cut_at: int | None = None, reversals: bool = True,
                 significator: str | None = None) -> dict:
    """Same inputs, same cards as drawReading() in engine.js (seed, spread, cut, reversals, significator)."""
    sp = SPREADS.get(spread)
    if not sp:
        raise ValueError(f"unknown spread {spread}")
    seed &= M
    rand = rng(seed)
    pack = shuffle([c["id"] for c in CARDS if c["id"] != significator], rand)
    auto = 1 + int(rand() * (len(pack) - 1))  # always drawn, so a chosen cut keeps the reversals
    at = auto if cut_at is None else cut_at
    pack = cut(pack, at)
    cards = [{"pos": pos, "id": pack[i], "reversed": bool(reversals) and rand() < 0.5}
             for i, pos in enumerate(sp["positions"])]
    return {"seed": seed, "spread": spread, "cutAt": at, "reversals": bool(reversals),
            "significator": significator or None, "cards": cards}


def recurrences(cards: list[dict]) -> list[dict]:
    """Waite, Part III §5: two to four cards of one rank, upright and reversed counted separately."""
    table = load()["RECURRENCE"]
    counts: dict[tuple, int] = {}
    for c in cards:
        card = CARD.get(c.get("id"))
        if not card or card["arcana"] != "minor":
            continue
        k = ("reversed" if c.get("reversed") else "natural", card["rank"])
        counts[k] = counts.get(k, 0) + 1
    out = [{"mode": mode, "rank": rank, "count": min(n, 4), "meaning": table[mode][str(rank)][str(min(n, 4))]}
           for (mode, rank), n in counts.items() if n >= 2]
    return sorted(out, key=lambda x: -x["rank"])
