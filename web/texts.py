"""Read the card texts from the site's own generated data modules (no second copy of the data in Python).

static/waite_pkt.js (tools/extract_waite.py): WAITE_SOURCE, CELTIC_POSITIONS, RECURRENCE (JSON values) and WAITE
(one `id: {json},` line per card). static/deck_desc.js (tools/make_deck.mjs): DECK_DESC (a JSON object).
"""
import json
import re
from functools import lru_cache
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STATIC = ROOT / "static"

CONST_RE = re.compile(r"^export const (\w+) = ", re.M)
WAITE_LINE_RE = re.compile(r"^\s*(\w+): (\{.*\}),?\s*$")


def js_consts(path: Path) -> dict:
    """Every `export const NAME = <JSON>;` in a generated module whose value is plain JSON."""
    text = path.read_text(encoding="utf-8")
    dec = json.JSONDecoder()
    out = {}
    for m in CONST_RE.finditer(text):
        try:
            out[m.group(1)], _ = dec.raw_decode(text, m.end())
        except json.JSONDecodeError:
            continue  # WAITE: unquoted keys, read line by line below
    return out


def waite_cards(path: Path) -> dict:
    """The WAITE object: lines `  ar00: {...},` between `export const WAITE = {` and `};`."""
    text = path.read_text(encoding="utf-8")
    body = text.split("export const WAITE = {", 1)[1].split("\n};", 1)[0]
    cards = {}
    for line in body.splitlines():
        m = WAITE_LINE_RE.match(line)
        if m:
            cards[m.group(1)] = json.loads(m.group(2))
    return cards


@lru_cache(maxsize=1)
def load() -> dict:
    """{'WAITE', 'WAITE_SOURCE', 'CELTIC_POSITIONS', 'RECURRENCE', 'DECK_DESC'} from the static modules."""
    data = js_consts(STATIC / "waite_pkt.js")
    data["WAITE"] = waite_cards(STATIC / "waite_pkt.js")
    data.update(js_consts(STATIC / "deck_desc.js"))
    missing = {"WAITE", "WAITE_SOURCE", "CELTIC_POSITIONS", "RECURRENCE", "DECK_DESC"} - set(data)
    if missing:
        raise RuntimeError(f"card data modules lack {sorted(missing)}")
    return data


READING_MODULES = ["reading_cards.js", "reading_lore.js", "reading_positions.js", "reading_phrases.js"]


@lru_cache(maxsize=1)
def reading_data() -> dict:
    """The reading engine's text and correspondence tables (CARD_TEXT, SUIT_LORE, POSITIONS, THREAD, ...), every
    `export const` of static/reading_*.js, the same objects static/reading_engine.js imports."""
    data = {}
    for name in READING_MODULES:
        data.update(js_consts(STATIC / name))
    need = {"CARD_TEXT", "MAJOR_ELEMENT", "ELEMENTS", "CONTRARY", "SUIT_LORE", "SUIT_TOPIC", "NUMBER_LORE",
            "COURT_LORE", "SUIT_ADJ", "PAIRS", "TOPICS", "TOPIC_NAMES", "DECISION_WORDS", "SENSITIVE", "POSITIONS",
            "REFLECT", "EXTRAS", "TONES", "SPREAD_NAMES", "MODE", "OPEN", "SUMMARY", "SENSITIVE_MSG",
            "THREAD_TITLES", "THREAD", "CLOSE", "QUESTIONS"}
    if need - set(data):
        raise RuntimeError(f"reading modules lack {sorted(need - set(data))}")
    return data
