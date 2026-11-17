"""Python port of static/reading_patterns.js: the kind of question asked and the patterns of a spread (Major Arcana,
suits and elements, court cards, numbers, reversals, elemental dignities, pairings, overall tenor).

Ported statement for statement; tests/fixtures/readings.json (tools/make_reading_fixture.mjs) checks that the two
agree. The tables come from the JS data modules through texts.reading_data().
"""
import re

from .engine import CARD, recurrences
from .texts import reading_data

NUM_WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"]
SUIT_KEYS = ["wands", "cups", "swords", "pentacles"]
DIGNITY_PAIRS = {
    "single": [], "three": [[0, 1], [1, 2]], "four": [[0, 1], [1, 2], [2, 3]],
    "celtic": [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [6, 7], [7, 8], [8, 9]],
}
_NON_WORD = re.compile(r"[^a-z0-9']+")


def normalise(text) -> str:
    """Lower-case words separated by single spaces, with a space at each end (as normalise() in the JS)."""
    return " " + _NON_WORD.sub(" ", str(text or "").lower().replace("’", "'")).strip() + " "


def _has(norm: str, phrase: str) -> bool:
    return normalise(phrase) in norm


def classify_question(question) -> dict:
    """{topic: love|work|money|general, decision: bool, sensitive: selfharm|health|legal|money|None}"""
    d = reading_data()
    q = normalise(question)
    sensitive = next((cat for cat in ["selfharm", "health", "legal", "money"]
                      if any(_has(q, p) for p in d["SENSITIVE"][cat])), None)
    topic = next((t for t in ["love", "work", "money"] if any(_has(q, p) for p in d["TOPICS"][t])), "general")
    return {"topic": topic, "decision": any(_has(q, p) for p in d["DECISION_WORDS"]), "sensitive": sensitive}


def element_of(card_id: str):
    card = CARD[card_id]
    d = reading_data()
    return d["ELEMENTS"][card["suit"]] if card["arcana"] == "minor" else d["MAJOR_ELEMENT"][card_id]


def relation(ea: str, eb: str) -> str:
    if ea == eb:
        return "same"
    return "contrary" if reading_data()["CONTRARY"][ea] == eb else "friendly"


def valence(c: dict) -> int:
    t = reading_data()["CARD_TEXT"][c["id"]]
    return t["rv"] if c.get("reversed") else t["v"]


def longest_run(ranks: list[int]):
    """The longest run (3 or more) of consecutive numbers among the pip ranks, lowest first; None if none."""
    best, cur = [], []
    for r in sorted(set(ranks)):
        cur = cur + [r] if cur and r == cur[-1] + 1 else [r]
        if len(cur) > len(best):
            best = cur
    return best if len(best) >= 3 else None


def analyse(reading: dict) -> dict:
    cards, spread = reading["cards"], reading["spread"]
    n = len(cards)
    majors, courts, pips = [], [], []
    suit_counts = {s: 0 for s in SUIT_KEYS}
    reversed_n = score = 0
    for i, c in enumerate(cards):
        card = CARD[c["id"]]
        if c.get("reversed"):
            reversed_n += 1
        score += valence(c)
        if card["arcana"] == "major":
            majors.append(i)
            continue
        suit_counts[card["suit"]] += 1
        (courts.append(i) if card["rank"] >= 11 else pips.append(card["rank"]))
    top = max(suit_counts[s] for s in SUIT_KEYS)
    leaders = [s for s in SUIT_KEYS if suit_counts[s] == top]
    dominant = leaders[0] if len(leaders) == 1 and top >= 2 and top * 10 >= n * 3 else None
    missing = [s for s in SUIT_KEYS if suit_counts[s] == 0] if n >= 6 else []

    stage = trend = None
    if len(pips) >= 3 and all(r <= 4 for r in pips):
        stage = "early"
    if len(pips) >= 3 and all(r >= 7 for r in pips):
        stage = "late"
    if spread in ("three", "four") and len(pips) == n and n >= 3:
        if all(i == 0 or r > pips[i - 1] for i, r in enumerate(pips)):
            trend = "rising"
        if all(i == 0 or r < pips[i - 1] for i, r in enumerate(pips)):
            trend = "falling"

    dignities = []
    for a, b in DIGNITY_PAIRS.get(spread, []):
        ea, eb = element_of(cards[a]["id"]), element_of(cards[b]["id"])
        if ea and eb:
            dignities.append({"a": a, "b": b, "ea": ea, "eb": eb, "rel": relation(ea, eb)})
    middle = None
    if spread == "three":
        e0, e1, e2 = (element_of(c["id"]) for c in cards)
        if e0 and e1 and e2:
            r0, r2 = relation(e1, e0), relation(e1, e2)
            if r0 == "contrary" and r2 == "contrary":
                middle = "weak"
            if r0 == "same" and r2 == "same":
                middle = "strong"

    ids = {c["id"] for c in cards}
    pairs = [i for i, p in enumerate(reading_data()["PAIRS"]) if p["a"] in ids and p["b"] in ids]
    tenor = "favourable" if score * 3 >= n else "challenging" if score * 3 <= -n else "mixed"
    return {"n": n, "majors": majors, "courts": courts, "pips": pips, "suitCounts": suit_counts,
            "dominant": dominant, "missing": missing, "reversed": reversed_n, "score": score, "tenor": tenor,
            "stage": stage, "trend": trend, "run": longest_run(pips), "recurrences": recurrences(cards),
            "dignities": dignities, "middle": middle, "pairs": pairs}
