"""Render a contact sheet of the generated deck (cards/*.svg) with Playwright, to inspect the art.

    python tools/contact_sheet.py OUT.png [--width 120]
"""
import argparse
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
ORDER = ["back"] + [f"ar{n:02d}" for n in range(22)] + [f"{s}{r:02d}" for s in ("wa", "cu", "sw", "pe") for r in range(1, 15)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out")
    ap.add_argument("--width", type=int, default=120, help="card width in px")
    ap.add_argument("--cols", type=int, default=14)
    ap.add_argument("--only", default="", help="comma-separated id prefixes, e.g. ar or back,cu")
    a = ap.parse_args()
    imgs = "".join(f'<figure><img src="{(ROOT / "cards" / (i + ".svg")).as_uri()}" width="{a.width}"><figcaption>{i}</figcaption></figure>'
                   for i in ORDER if not a.only or i.startswith(tuple(a.only.split(","))))
    html = (f"<html><body style='margin:0;background:#05060c;color:#94a3c6;font:11px monospace'>"
            f"<div style='display:grid;grid-template-columns:repeat({a.cols},{a.width}px);gap:8px;padding:10px'>{imgs}</div>"
            "<style>figure{margin:0;text-align:center}img{display:block}</style></body></html>")
    page_file = Path(a.out).with_suffix(".html")
    page_file.write_text(html)
    with sync_playwright() as p:
        try:
            b = p.chromium.launch(channel="chrome")
        except Exception:
            b = p.chromium.launch()
        pg = b.new_page(viewport={"width": a.cols * (a.width + 8) + 20, "height": 800})
        pg.goto(page_file.as_uri())
        pg.wait_for_timeout(800)
        pg.screenshot(path=a.out, full_page=True)
        b.close()
    page_file.unlink()
    print(a.out)


if __name__ == "__main__":
    main()
