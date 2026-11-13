"""FastAPI app for Tarot Reading: serves the site (index.html, static/, cards/) unchanged and a JSON API under /api.

Run with `python run_web.py` (http://127.0.0.1:8238, local only). The same front end is published as a static site by
GitHub Pages from the repository root; there, static/static_api.js answers the same api() calls in the browser.
The server's copy of index.html says `window.APP_STATIC = false`, so the pages use this API instead.
The journal file is private to this computer: its endpoints answer only loopback requests (403 for other devices,
whose pages then keep a journal in their own browser, as on the static site; see static/journal_api.js).
"""
import ipaddress
from datetime import date as Date

from fastapi import Body, Depends, FastAPI, HTTPException, Query, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

from . import engine as E
from . import journal as J
from .texts import ROOT, STATIC, load

STATIC_MARK = "window.APP_STATIC = true;"

app = FastAPI(title="Tarot Reading")
app.mount("/static", StaticFiles(directory=STATIC), name="static")
app.mount("/cards", StaticFiles(directory=ROOT / "cards"), name="cards")


def is_loopback(host: str | None) -> bool:
    """True for 127.0.0.0/8, ::1 and IPv4-mapped loopback; False for anything else (other devices, unknown)."""
    try:
        ip = ipaddress.ip_address(host or "")
    except ValueError:
        return False
    return ip.is_loopback or bool(getattr(ip, "ipv4_mapped", None) and ip.ipv4_mapped.is_loopback)


def local_only(request: Request) -> None:
    """Journal endpoints: only requests from this computer read or write data/journal.json."""
    if not is_loopback(request.client.host if request.client else None):
        raise HTTPException(403, "the journal on this computer is private; this browser keeps its own journal")


@app.get("/", include_in_schema=False)
def index():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    return HTMLResponse(html.replace(STATIC_MARK, "window.APP_STATIC = false;", 1))


@app.get("/api/info")
def info(request: Request):
    """Project summary and counts for the home page (the journal count only for requests from this computer)."""
    local = is_loopback(request.client.host if request.client else None)
    return {"title": "Tarot Reading", "mode": "server", "cards": len(E.CARDS),
            "majors": sum(c["arcana"] == "major" for c in E.CARDS), "spreads": len(E.SPREADS),
            "journal": len(J.load()) if local else None,
            "journal_store": "data/journal.json (this computer)" if local else "this browser (localStorage)",
            "source": load()["WAITE_SOURCE"]}


@app.get("/api/deck")
def deck():
    """All 78 cards in deck order, with picture file and Waite's upright/reversed meanings."""
    w = load()["WAITE"]
    return {"decks": E.DECKS, "back": E.BACK_FILE, "suits": E.SUITS,
            "cards": [{**c, "image": E.image_file("night", c["id"]), "upright": w[c["id"]]["upright"],
                       "reversed": w[c["id"]]["reversed"]} for c in E.CARDS]}


@app.get("/api/cards/{card_id}")
def card(card_id: str):
    """One card: its data, the picture's description and Waite's texts."""
    if card_id not in E.CARD:
        raise HTTPException(404, f"no card {card_id}")
    d = load()
    return {**E.CARD[card_id], "image": E.image_file("night", card_id), "waite": d["WAITE"][card_id],
            "picture": d["DECK_DESC"][card_id]}


@app.get("/api/spreads")
def spreads():
    return E.SPREADS


def _reading(seed, spread, cut, rev, sig) -> dict:
    if spread not in E.SPREADS:
        raise HTTPException(400, f"unknown spread {spread}")
    if sig and sig not in E.CARD:
        raise HTTPException(400, f"unknown significator {sig}")
    r = E.draw_reading(E.random_seed() if seed is None else seed, spread, cut, rev, sig or None)
    return {**r, "recurrences": E.recurrences(r["cards"])}


@app.get("/api/draw")
def draw(spread: str = "three", seed: int | None = Query(None, description="32-bit seed; random if left out"),
         cut: int | None = Query(None, description="cut after this card; drawn from the seed if left out"),
         rev: bool = True, sig: str | None = None):
    """A seeded reading: the same seed, spread, cut, reversals and significator give the same cards as the JS."""
    return _reading(seed, spread, cut, rev, sig)


@app.get("/api/daily")
def daily(date: str = Query(..., description="YYYY-MM-DD")):
    """Card of the day: one card per date, the same for everyone (seed from 'daily <date>')."""
    try:
        Date.fromisoformat(date)
    except ValueError:
        raise HTTPException(400, "date must be YYYY-MM-DD")
    r = E.draw_reading(E.seed_from("daily " + date), "single")
    return {"date": date, **r["cards"][0]}


# --- reading journal (data/journal.json, git-ignored) ---------------------------------------------
@app.get("/api/journal", dependencies=[Depends(local_only)])
def journal_list():
    return {"entries": J.load()}


@app.post("/api/journal/add", dependencies=[Depends(local_only)])
def journal_add(entry: dict = Body(..., embed=True)):
    e = J.clean_entry(entry)
    if not e:
        raise HTTPException(400, "not a valid journal entry")
    return {"ok": True, "count": len(J.update(lambda es: J.merge(es, [e])))}


@app.post("/api/journal/note", dependencies=[Depends(local_only)])
def journal_note(id: str = Body(...), note: str = Body("")):
    found = []

    def change(es):
        for e in es:
            if e["id"] == id:
                e["note"] = note[:5000]
                found.append(e)
        return es
    J.update(change)
    if not found:
        raise HTTPException(404, "no such reading")
    return {"ok": True}


@app.post("/api/journal/delete", dependencies=[Depends(local_only)])
def journal_delete(id: str = Body(..., embed=True)):
    return {"ok": True, "count": len(J.update(lambda es: [e for e in es if e["id"] != id]))}


@app.post("/api/journal/import", dependencies=[Depends(local_only)])
def journal_import(journal=Body(..., embed=True)):
    try:
        incoming = J.parse(journal)
    except ValueError as err:
        raise HTTPException(400, str(err))
    return {"ok": True, "imported": len(incoming), "count": len(J.update(lambda es: J.merge(es, incoming)))}


@app.post("/api/journal/clear", dependencies=[Depends(local_only)])
def journal_clear():
    J.update(lambda es: [])
    return {"ok": True, "count": 0}


# GET paths (without /api) checked by tests/test_web.py; the static site answers them in static_api.js.
STATIC_ENDPOINTS = ["/info", "/deck", "/spreads", "/cards/ar00", "/draw?seed=1&spread=three",
                    "/draw?seed=5&spread=celtic&cut=33&rev=0&sig=cu13", "/daily?date=2026-11-13", "/journal"]
