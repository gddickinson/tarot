"""Optional, local app only: ask a local AI model (Ollama, http://127.0.0.1:11434) to elaborate on a written reading.

Off unless the app is started with a model: `python run_web.py --ollama llama3.2` (or TAROT_OLLAMA_MODEL=llama3.2).
Never used by the static site, the tests or CI (the tests replace `ask_ollama`). The server rebuilds the reading from
its arguments with web/reading.py, so it sends only text this app wrote, and it refuses questions the reading engine
treats as sensitive (health, legal, money decisions, self-harm).
"""
import json
import os
import urllib.request

OLLAMA_URL = os.environ.get("TAROT_OLLAMA_URL", "http://127.0.0.1:11434")
TIMEOUT = 180

PROMPT = """You are helping with a tarot reading app that is for entertainment only. Below is a reading written by
the app's rule-based engine. Elaborate on it in about 200 words of warm, plain English, as an experienced reader
would: connect the cards to each other and to the question. Do not invent cards that are not in the reading. Do not
predict health, legal or financial outcomes and do not give medical, legal or financial advice. Do not use headings.

{text}
"""


def model() -> str | None:
    """The Ollama model to use, or None when the feature is off (the default)."""
    return os.environ.get("TAROT_OLLAMA_MODEL") or None


def ask_ollama(prompt: str, model_name: str) -> str:
    """One non-streaming request to Ollama's /api/generate; raises OSError/ValueError on failure."""
    body = json.dumps({"model": model_name, "prompt": prompt, "stream": False}).encode()
    req = urllib.request.Request(OLLAMA_URL + "/api/generate", data=body, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:  # noqa: S310 (a fixed local URL)
        return str(json.loads(r.read().decode("utf-8")).get("response", "")).strip()


def elaborate(interpretation: dict) -> str:
    return ask_ollama(PROMPT.format(text=interpretation["text"]), model())
