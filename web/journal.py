"""The reading journal on the local server: the entry rules of static/journal_model.js (cleanEntry, merge, sort)
and a JSON file store in a git-ignored data folder (default <repo>/data/journal.json, or $TAROT_DATA_DIR).

The file uses the same format as the site's "Export JSON" ({format, version, entries}), so it can be imported into
the static site's journal and back.
"""
import json
import math
import os
import threading
from datetime import datetime, timezone
from pathlib import Path

from .engine import CARD, SPREADS, deck_by_id

FORMAT = "tarot-journal"
VERSION = 1
MAX_ENTRIES = 5000
ROOT = Path(__file__).resolve().parent.parent
_lock = threading.Lock()


def data_dir() -> Path:
    return Path(os.environ.get("TAROT_DATA_DIR") or ROOT / "data")


def journal_file() -> Path:
    return data_dir() / "journal.json"


def _iso(value) -> str | None:
    """new Date(x).toISOString() for an ISO 8601 text; None if it is not a date. Times without an offset are UTC."""
    if not isinstance(value, str):
        return None
    try:
        d = datetime.fromisoformat(value.strip().replace("Z", "+00:00"))
    except ValueError:
        return None
    if d.tzinfo is None:
        d = d.replace(tzinfo=timezone.utc)
    d = d.astimezone(timezone.utc)
    return d.strftime("%Y-%m-%dT%H:%M:%S.") + f"{d.microsecond // 1000:03d}Z"


def _text(v, limit: int) -> str:
    if v is None:
        return ""
    if isinstance(v, bool):
        v = "true" if v else "false"
    return str(v)[:limit]


def _seed(v) -> int:
    """Number(x) >>> 0."""
    try:
        f = float(v)
    except (TypeError, ValueError):
        return 0
    if math.isnan(f) or math.isinf(f):
        return 0
    return int(f) & 0xFFFFFFFF


def clean_entry(e) -> dict | None:
    """One entry from untrusted JSON: keep only known, valid fields (as cleanEntry in journal_model.js)."""
    if not isinstance(e, dict) or not isinstance(e.get("cards"), list) or not e["cards"]:
        return None
    date = _iso(e.get("date"))
    if e.get("spread") not in SPREADS or not date:
        return None
    cards = []
    for c in e["cards"]:
        if not isinstance(c, dict) or c.get("id") not in CARD:
            return None
        cards.append({"pos": _text(c.get("pos"), 10**6), "id": c["id"], "reversed": bool(c.get("reversed"))})
    cut_at = e.get("cutAt")
    sig = e.get("significator")
    return {
        "id": _text(e.get("id") or e.get("date"), 200), "date": date, "deck": deck_by_id(e.get("deck"))["id"],
        "spread": e["spread"], "seed": _seed(e.get("seed")),
        "cutAt": cut_at if isinstance(cut_at, int) and not isinstance(cut_at, bool) else None,
        "reversals": e.get("reversals") is not False, "significator": sig if sig in CARD else None,
        "question": _text(e.get("question"), 500), "note": _text(e.get("note"), 5000), "cards": cards,
    }


def sort_entries(entries: list[dict]) -> list[dict]:
    return sorted(entries, key=lambda e: e["date"], reverse=True)


def merge(current: list[dict], incoming: list[dict]) -> list[dict]:
    """An entry with the same id is kept once (the one in `incoming` wins)."""
    by_id = {e["id"]: e for e in current}
    for e in incoming:
        by_id[e["id"]] = e
    return sort_entries(list(by_id.values()))


def parse(data) -> list[dict]:
    """The exported object or a bare list; ValueError on anything else. Invalid entries are dropped."""
    if isinstance(data, list):
        items = data
    elif isinstance(data, dict) and data.get("format") == FORMAT and isinstance(data.get("entries"), list):
        items = data["entries"]
    else:
        raise ValueError("Not a tarot journal file")
    return sort_entries([x for x in map(clean_entry, items) if x])


def load() -> list[dict]:
    f = journal_file()
    if not f.exists():
        return []
    try:
        return parse(json.loads(f.read_text(encoding="utf-8")))
    except (ValueError, OSError):
        return []


def save(entries: list[dict]) -> None:
    f = journal_file()
    f.parent.mkdir(parents=True, exist_ok=True)
    tmp = f.with_suffix(".json.tmp")
    tmp.write_text(json.dumps({"format": FORMAT, "version": VERSION, "entries": entries[:MAX_ENTRIES]},
                              ensure_ascii=False, indent=1), encoding="utf-8")
    os.replace(tmp, f)


def update(fn) -> list[dict]:
    """Load, change with fn(entries) -> entries, save; one writer at a time."""
    with _lock:
        entries = fn(load())
        save(entries)
        return entries
