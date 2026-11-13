"""Start the Tarot Reading web app locally: python run_web.py [--port 8238]  ->  http://127.0.0.1:8238

Readings saved to the journal go to data/journal.json (git-ignored; set TAROT_DATA_DIR to keep them elsewhere).
"""
import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import uvicorn  # noqa: E402

if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--port", type=int, default=8238)
    ap.add_argument("--reload", action="store_true")
    a = ap.parse_args()
    print(f"Tarot Reading web app on http://127.0.0.1:{a.port}")
    uvicorn.run("web.app:app", host="127.0.0.1", port=a.port, reload=a.reload)
