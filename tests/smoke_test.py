"""Browser smoke test (Playwright + the `python -m http.server` server): every page loads without console errors,
nothing overflows a 390 px phone screen, and a full reading (shuffle, cut, deal, reveal, save) works.

    python tests/smoke_test.py            # needs: pip install playwright && playwright install chromium
    python tests/smoke_test.py --shots    # also saves README screenshots (JPEG) to docs/img/
    python tests/smoke_test.py --base http://127.0.0.1:8238   # the same against the local app (python run_web.py);
        # start it with TAROT_DATA_DIR=<a temporary folder>: the test clears the journal of the app it runs against
"""
import argparse
import functools
import http.server
import sys
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
ROUTES = ["", "read", "read?spread=celtic", "cards", "cards?f=cups", "card/ar00", "card/sw13", "card/wa12",
          "card/ar08?deck=marseilles", "read?spread=three&deck=rider&seed=5&cut=9&rev=1", "journal", "about", "nonsense"]


def serve(directory):
    """The server of `python -m http.server` (ThreadingHTTPServer + SimpleHTTPRequestHandler), run in a
    thread with a longer listen queue: the card grid asks for ~80 images at once and the default backlog
    of 5 makes macOS reset some connections (a limit of the test server, not an error of the page)."""
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass

    class Server(http.server.ThreadingHTTPServer):
        request_queue_size = 128

    srv = Server(("127.0.0.1", 0), functools.partial(Quiet, directory=str(directory)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, f"http://127.0.0.1:{srv.server_address[1]}/"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--shots", action="store_true")
    ap.add_argument("--base", help="URL of a running local app (default: serve the folder as GitHub Pages does)")
    a = ap.parse_args()
    srv, base = (None, a.base.rstrip("/") + "/") if a.base else serve(ROOT)
    bad = 0

    def check(ok, what):
        nonlocal bad
        bad += not ok
        print(f"{'ok  ' if ok else 'FAIL'} {what}")

    try:
        with sync_playwright() as p:
            try:
                browser = p.chromium.launch(channel="chrome")  # installed Chrome, if any
            except Exception:
                browser = p.chromium.launch()
            errors = []

            def page_for(width, motion="no-preference"):
                pg = browser.new_page(viewport={"width": width, "height": 900}, reduced_motion=motion)
                pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
                pg.on("pageerror", lambda e: errors.append(str(e)))
                pg.on("requestfailed", lambda r: errors.append("failed " + r.url))
                pg.on("response", lambda r: errors.append(f"{r.status} {r.url}") if r.status >= 400 else None)
                return pg

            for width in (1280, 390):
                pg = page_for(width)
                for r in ROUTES:
                    errors.clear()
                    pg.goto(base + "#/" + r)
                    pg.wait_for_timeout(700)
                    pg.evaluate("window.scrollTo(0, document.body.scrollHeight)")  # load lazy images
                    pg.wait_for_timeout(300)
                    text = pg.inner_text("#app")
                    over = pg.evaluate("document.documentElement.scrollWidth - innerWidth")
                    ok = not errors and "Something went wrong" not in text and (width > 400 or over <= 1)
                    check(ok, f"{width}px #/{r} overflow={over}px {' | '.join(errors)[:300]}")
                    if a.shots and width == 1280 and r in ("", "cards", "card/ar00"):
                        out = ROOT / "docs" / "img"
                        out.mkdir(parents=True, exist_ok=True)
                        pg.evaluate("window.scrollTo(0, 0)")
                        pg.screenshot(path=str(out / f"{(r or 'home').replace('/', '_')}.jpg"), quality=82)
                pg.close()

            # a full reading, with animations (desktop) and with reduced motion (phone)
            for width, motion in ((1280, "no-preference"), (390, "reduce")):
                errors.clear()
                pg = page_for(width, motion)
                if a.base:  # the local app keeps one journal for every browser: start empty
                    pg.request.post(base + "api/journal/clear")
                pg.goto(base + "#/read?spread=celtic")
                pg.wait_for_timeout(500)
                pg.select_option("#sig", "cu13")
                pg.click("#b-shuffle")
                pg.wait_for_selector("#b-cut", timeout=8000)
                pg.fill("#question", "Will the tests pass?")
                pg.click("#b-cut")
                pg.wait_for_selector("#b-deal", timeout=8000)
                pg.click("#b-deal")
                pg.wait_for_selector("#b-reveal", timeout=8000)
                n = pg.locator("#layout .slot:not(.sig) .tcard").count()
                pg.locator("#layout .slot.p1 .tcard").click(position={"x": 10, "y": 8})  # its top shows above card 2
                pg.wait_for_timeout(1000)
                one = pg.locator("#interp .it").count()
                pg.click("#b-reveal")
                pg.wait_for_selector("#b-save", timeout=15000)
                up = pg.locator("#layout .tcard.up").count()
                sig_dealt = pg.locator("#layout .slot:not(.sig) .tcard[data-id=cu13]").count()
                over = pg.evaluate("document.documentElement.scrollWidth - innerWidth")
                if a.shots and width == 1280:
                    pg.screenshot(path=str(ROOT / "docs" / "img" / "reading_celtic.jpg"), quality=82)
                pg.click("#b-save")
                pg.wait_for_selector("#b-save:disabled", timeout=5000)
                pg.goto(base + "#/journal")
                pg.wait_for_timeout(600)
                saved = pg.locator(".jentry").count()
                check(n == 10 and one == 1 and up >= 10 and sig_dealt == 0 and saved == 1 and over <= 1 and not errors,
                      f"{width}px reading ({motion}): dealt={n} first={one} face-up={up} saved={saved} overflow={over}px "
                      + " | ".join(errors)[:300])
                # export works and the share link reproduces the cards
                with pg.expect_download() as dl:
                    pg.click("#x-json")
                check(dl.value.suggested_filename.endswith(".json"), f"{width}px journal export {dl.value.suggested_filename}")
                href = pg.locator(".jentry a.btn").get_attribute("href")
                names = pg.locator(".jentry figcaption").all_inner_texts()
                pg.goto(base + href)
                pg.wait_for_timeout(800)
                again = [t.strip() for t in pg.locator("#layout .slot:not(.sig) .nm").all_text_contents()]
                same = [t.split(". ", 1)[1].replace(" (rev.)", " (reversed)") for t in names] == again
                check(same and not errors, f"{width}px share link reproduces the reading {'' if same else (names, again)}")
                pg.close()
            browser.close()
    finally:
        if srv:
            srv.shutdown()
    print("all ok" if not bad else f"{bad} failure(s)")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
