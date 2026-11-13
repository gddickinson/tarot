"""Tests of the local web app (web/): the API, the Python port of the JS engine (same deck, same draws for the same
seed), the static-site API (static_api.js) giving the same answers, and the journal file store.

Run: python -m pytest -q tests/test_web.py      (node 18+ is needed for the JS comparisons; skipped without it)
"""
import json
import shutil
import subprocess
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from web import engine as E  # noqa: E402
from web import journal as J  # noqa: E402
from web.app import STATIC_ENDPOINTS, app  # noqa: E402
from web.texts import load  # noqa: E402

FIX = json.loads((ROOT / "tests" / "fixtures" / "engine.json").read_text())
NODE = shutil.which("node")
needs_node = pytest.mark.skipif(not NODE, reason="node not installed")
client = TestClient(app)


@pytest.fixture(autouse=True)
def data_dir(tmp_path, monkeypatch):
    """Every test gets its own journal folder: never the repository's data/."""
    monkeypatch.setenv("TAROT_DATA_DIR", str(tmp_path / "data"))
    return tmp_path / "data"


def node(script: str):
    r = subprocess.run([NODE, "--input-type=module", "-e", script], cwd=ROOT, capture_output=True, text=True)
    assert r.returncode == 0, r.stderr
    return json.loads(r.stdout)


# --- the site --------------------------------------------------------------------------------------
def test_index_served_in_server_mode():
    r = client.get("/")
    assert r.status_code == 200 and "static/main.js" in r.text
    assert "window.APP_STATIC = false;" in r.text and "window.APP_STATIC = true;" not in r.text
    # the file itself (what GitHub Pages serves) stays in static mode
    assert (ROOT / "index.html").read_text().count("window.APP_STATIC = true;") == 1


@pytest.mark.parametrize("path", ["/static/main.js", "/static/style.css", "/static/static_api.js", "/static/icon.svg",
                                  "/cards/ar00.svg", "/cards/back.svg"])
def test_assets_served(path):
    assert client.get(path).status_code == 200


@pytest.mark.parametrize("path", STATIC_ENDPOINTS)
def test_endpoint(path):
    r = client.get("/api" + path)
    assert r.status_code == 200, r.text
    assert r.json() is not None


# --- Python port == JS engine (fixture written from the JS by tools/make_engine_fixture.mjs) --------------
def test_deck_and_spreads_match_js():
    assert E.CARDS == FIX["deck"]
    assert E.SPREADS == FIX["spreads"]


def test_rng_seed_shuffle_cut_match_js():
    for seed, values in FIX["rng"].items():
        r = E.rng(int(seed))
        assert [r() for _ in values] == values, seed  # k / 2**32: exact on every platform
    for text, h in FIX["seedFrom"]:
        assert E.seed_from(text) == h, text
    ids = [c["id"] for c in E.CARDS]
    for seed, order in FIX["shuffle"]:
        assert E.shuffle(ids, E.rng(seed)) == order
    for at, order in FIX["cut"]:
        assert E.cut(ids, at) == order


def test_draws_match_js():
    for d in FIX["draws"]:
        a = d["args"]
        out = E.draw_reading(a["seed"], a["spread"], a.get("cutAt"), a.get("reversals", True), a.get("significator"))
        assert out == d["out"], a


def test_recurrences_match_js():
    assert FIX["recurrences"]
    for r in FIX["recurrences"]:
        assert E.recurrences(r["cards"]) == r["out"]


@needs_node
def test_fixture_is_current():
    r = subprocess.run([NODE, "tools/make_engine_fixture.mjs", "--check"], cwd=ROOT, capture_output=True, text=True)
    assert r.returncode == 0, r.stdout + r.stderr


@needs_node
def test_node_tests_pass():
    tests = sorted(str(p) for p in (ROOT / "tests").glob("*.test.mjs"))
    r = subprocess.run([NODE, "--test", *tests], cwd=ROOT, capture_output=True, text=True)
    assert r.returncode == 0, r.stdout[-3000:] + r.stderr[-2000:]


# --- the API -----------------------------------------------------------------------------------------
def test_draw_endpoint_is_the_engine():
    r = client.get("/api/draw", params={"seed": 5, "spread": "celtic", "cut": 33, "rev": 0, "sig": "cu13"}).json()
    want = E.draw_reading(5, "celtic", 33, False, "cu13")
    assert {k: r[k] for k in want} == want
    assert r["recurrences"] == E.recurrences(want["cards"])
    assert all(c["id"] != "cu13" for c in r["cards"]) and len(r["cards"]) == 10
    a, b = client.get("/api/draw?spread=three").json(), client.get("/api/draw?spread=three").json()
    assert 0 <= a["seed"] < 2**32 and len(a["cards"]) == 3
    again = client.get(f"/api/draw?spread=three&seed={a['seed']}").json()
    assert again == a, "the returned seed reproduces a random reading"
    assert b["seed"] != a["seed"] or b == a


@pytest.mark.parametrize("query, status", [("spread=nope&seed=1", 400), ("spread=three&sig=zz99", 400),
                                           ("spread=three&seed=x", 422), ("spread=three&cut=1.5", 422)])
def test_draw_rejects_bad_input(query, status):
    assert client.get("/api/draw?" + query).status_code == status


def test_daily_and_cards():
    d = client.get("/api/daily?date=2026-11-13").json()
    assert d["id"] == E.draw_reading(E.seed_from("daily 2026-11-13"), "single")["cards"][0]["id"]
    assert client.get("/api/daily?date=13/11/2026").status_code == 400
    c = client.get("/api/cards/ar08").json()
    assert c["name"] == "Strength" and c["waite"]["upright"].startswith("Power, energy") and c["picture"]
    assert client.get("/api/cards/zz01").status_code == 404
    deck = client.get("/api/deck").json()
    assert [x["id"] for x in deck["cards"]] == [x["id"] for x in FIX["deck"]]
    assert len(load()["WAITE"]) == 78 and len(load()["DECK_DESC"]) == 79


@needs_node
def test_static_api_answers_like_the_server():
    """static_api.js (the GitHub Pages site) gives the same JSON as the Python API for every deterministic GET."""
    paths = [p for p in STATIC_ENDPOINTS if not p.startswith(("/info", "/journal"))]
    js = node(f"""globalThis.localStorage = {{ getItem: () => null, setItem() {{}} }};
      globalThis.matchMedia = () => ({{ matches: false }});
      const {{ staticApi }} = await import('./static/static_api.js');
      const out = {{}};
      for (const p of {json.dumps(paths)}) out[p] = await staticApi(p);
      console.log(JSON.stringify(out));""")
    for p in paths:
        assert js[p] == client.get("/api" + p).json(), p


# --- the journal --------------------------------------------------------------------------------------
def entry(seed=99, spread="three", date="2026-01-02T03:04:05Z", **kw):
    r = E.draw_reading(seed, spread)
    return {"id": f"e{seed}", "date": date, "deck": "night", "spread": spread, "seed": seed, "cutAt": r["cutAt"],
            "reversals": True, "significator": None, "question": "What next?", "note": "",
            "cards": r["cards"], **kw}


def test_journal_round_trip(data_dir):
    assert client.get("/api/journal").json() == {"entries": []}
    assert client.post("/api/journal/add", json={"entry": entry()}).json() == {"ok": True, "count": 1}
    assert client.post("/api/journal/add", json={"entry": entry(5, "celtic", "2026-02-01T00:00:00Z")}).json()["count"] == 2
    es = client.get("/api/journal").json()["entries"]
    assert [e["id"] for e in es] == ["e5", "e99"], "newest first"
    assert es[1]["date"] == "2026-01-02T03:04:05.000Z"
    saved = json.loads((data_dir / "journal.json").read_text())
    assert saved["format"] == "tarot-journal" and len(saved["entries"]) == 2
    assert client.post("/api/journal/note", json={"id": "e99", "note": "fun"}).json() == {"ok": True}
    assert client.get("/api/journal").json()["entries"][1]["note"] == "fun"
    assert client.post("/api/journal/note", json={"id": "nope", "note": "x"}).status_code == 404
    assert client.post("/api/journal/delete", json={"id": "e5"}).json()["count"] == 1
    exported = {"format": "tarot-journal", "version": 1, "entries": [entry(7, date="2025-01-01T00:00:00Z"), {"bad": 1}]}
    r = client.post("/api/journal/import", json={"journal": exported}).json()
    assert r == {"ok": True, "imported": 1, "count": 2}
    assert client.post("/api/journal/import", json={"journal": [entry(8)]}).json()["count"] == 3
    assert client.post("/api/journal/import", json={"journal": {"format": "other"}}).status_code == 400
    assert client.post("/api/journal/add", json={"entry": {"cards": []}}).status_code == 400
    assert client.post("/api/journal/clear").json()["count"] == 0
    assert client.get("/api/info").json()["journal"] == 0


@needs_node
def test_clean_entry_matches_js():
    cases = [entry(), entry(question="x" * 600, note=None, seed=-1), entry(cutAt=True, reversals=False, deck="rider"),
             entry(significator="pe13", date="2026-03-04T05:06:07.891+02:00"), {**entry(), "seed": "12"}, {**entry(), "seed": 2.7e10}, {**entry(), "spread": "nope"},
             {**entry(), "cards": [{"id": "zz"}]}, {**entry(), "date": "never"}, {**entry(), "id": None}, None, []]
    js = node(f"""const {{ cleanEntry }} = await import('./static/journal_model.js');
      console.log(JSON.stringify({json.dumps(cases)}.map(cleanEntry)));""")
    assert [J.clean_entry(c) for c in cases] == js


def test_data_folder_is_git_ignored():
    assert "/data/" in (ROOT / ".gitignore").read_text().splitlines()
