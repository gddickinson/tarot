"""The Python reading engine (web/reading.py, web/reading_patterns.py) reproduces the JS engine exactly
(tests/fixtures/readings.json, written by tools/make_reading_fixture.mjs), and the /api/reading endpoint.

Run: python -m pytest -q tests/test_reading.py
"""
import json
import shutil
import subprocess
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from web import engine as E  # noqa: E402
from web.reading import interpret  # noqa: E402
from web.reading_patterns import classify_question  # noqa: E402

FIX = json.loads((ROOT / "tests" / "fixtures" / "readings.json").read_text(encoding="utf-8"))
NODE = shutil.which("node")


def test_classify_matches_js():
    for q, want in FIX["classify"]:
        assert classify_question(q) == want, q


@pytest.mark.parametrize("case", FIX["cases"], ids=lambda c: f"{c['reading']['spread']}-{c['reading']['seed']}-{c['tone']}")
def test_interpretation_matches_js(case):
    assert interpret(case["reading"], case["question"], case["tone"], case.get("withheld", False)) == case["out"]


def test_fixture_covers_every_spread_tone_and_sensitive_kind():
    cases = FIX["cases"]
    assert {c["reading"]["spread"] for c in cases} == set(E.SPREADS)
    assert {c["out"]["tone"] for c in cases} == {"traditional", "modern", "brief"}
    assert {c["out"]["sensitive"] for c in cases} >= {None, "health", "legal", "money", "selfharm"}
    assert any(c["reading"]["significator"] for c in cases)


@pytest.mark.skipif(not NODE, reason="node not installed")
def test_fixture_is_current():
    r = subprocess.run([NODE, "tools/make_reading_fixture.mjs", "--check"], cwd=ROOT, capture_output=True, text=True)
    assert r.returncode == 0, r.stdout + r.stderr


# --- the API --------------------------------------------------------------------------------------------
from fastapi.testclient import TestClient  # noqa: E402

from web import elaborate as AI  # noqa: E402
from web.app import app  # noqa: E402

client = TestClient(app, client=("127.0.0.1", 50000))
remote = TestClient(app, client=("192.168.1.20", 50000))


def test_reading_endpoint_is_draw_plus_interpretation():
    params = {"seed": 5, "spread": "celtic", "cut": 33, "sig": "cu13", "tone": "traditional", "q": "Will I find love?"}
    r = client.get("/api/reading", params=params).json()
    draw = E.draw_reading(5, "celtic", 33, True, "cu13")
    assert {k: r[k] for k in draw} == draw
    assert r["interpretation"] == interpret(draw, "Will I find love?", "traditional")
    assert r["interpretation"]["topic"] == "love" and "Querent" in r["interpretation"]["text"]
    plain = client.get("/api/reading?seed=5&spread=three&tone=shouty").json()["interpretation"]
    assert plain["tone"] == "modern", "an unknown tone falls back to modern"
    assert client.get("/api/reading", params={"seed": 1, "q": "x" * 501}).status_code == 422
    assert client.get("/api/reading?spread=nope").status_code == 400
    assert remote.get("/api/reading?seed=1").status_code == 200, "readings are not private, only the journal"
    hidden = client.get("/api/reading?seed=5&spread=three&qw=1").json()["interpretation"]
    open_ = client.get("/api/reading?seed=5&spread=three").json()["interpretation"]
    assert hidden["intro"] == [] and open_["intro"][0].startswith(("No question", "Without a question"))


def test_elaborate_is_off_by_default(monkeypatch):
    monkeypatch.delenv("TAROT_OLLAMA_MODEL", raising=False)
    assert client.get("/api/info").json()["elaborate"] is None
    assert client.post("/api/elaborate", json={"seed": 1}).status_code == 404


def test_elaborate_with_a_model(monkeypatch):
    """With --ollama MODEL: this computer only, the reading rebuilt on the server, sensitive questions refused.
    Ollama itself is never called by the tests (ask_ollama is replaced)."""
    sent = []
    monkeypatch.setenv("TAROT_OLLAMA_MODEL", "test-model")
    monkeypatch.setattr(AI, "ask_ollama", lambda prompt, model: sent.append((prompt, model)) or "More words.")
    assert client.get("/api/info").json()["elaborate"] == "test-model"
    assert remote.get("/api/info").json()["elaborate"] is None
    body = {"spread": "three", "seed": 7, "q": "Should I change jobs?", "tone": "brief"}
    assert client.post("/api/elaborate", json=body).json() == {"model": "test-model", "text": "More words."}
    want = interpret(E.draw_reading(7, "three"), "Should I change jobs?", "brief")["text"]
    assert want in sent[0][0] and sent[0][1] == "test-model"
    assert remote.post("/api/elaborate", json=body).status_code == 403
    assert client.post("/api/elaborate", json={**body, "q": "Is it cancer?"}).status_code == 400
    assert len(sent) == 1

    def down(prompt, model):
        raise OSError("connection refused")
    monkeypatch.setattr(AI, "ask_ollama", down)
    assert client.post("/api/elaborate", json=body).status_code == 502
