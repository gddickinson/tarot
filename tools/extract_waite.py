"""Extract card texts from A. E. Waite, "The Pictorial Key to the Tarot" (1910/1922 printing),
as transcribed on Wikisource, into static/waite_pkt.js (an ES module the site and the node tests import).

The text is public domain in the US (published before 1923). Nothing is paraphrased: every string
written is a verbatim slice of the Wikisource transcription, only whitespace is normalised.

Usage (no third-party packages needed):
    curl -A "tarot-site" -o p2.html "https://en.wikisource.org/w/index.php?title=The_Pictorial_Key_to_the_Tarot/Part_2&action=render"
    curl -A "tarot-site" -o p3.html "https://en.wikisource.org/w/index.php?title=The_Pictorial_Key_to_the_Tarot/Part_3&action=render"
    python3 tools/extract_waite.py p2.html p3.html > static/waite_pkt.js
"""
import html
import json
import re
import sys

ROMAN = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII",
         "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"]
SUITS = {"WANDS": "wa", "CUPS": "cu", "SWORDS": "sw", "PENTACLES": "pe"}
RANKS = {"Ace": 1, "Two": 2, "Three": 3, "Four": 4, "Five": 5, "Six": 6, "Seven": 7, "Eight": 8,
         "Nine": 9, "Ten": 10, "Page": 11, "Knight": 12, "Queen": 13, "King": 14}


def to_text(path):
    t = open(path, encoding="utf-8").read()
    t = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", t, flags=re.S)
    t = re.sub(r"<br\s*/?>", "\n", t)
    t = re.sub(r"</(p|div|h\d|li|tr)>", "\n", t)
    t = re.sub(r"<[^>]+>", "", t)
    t = html.unescape(t).replace("\u200b", "").replace("\xad", "")
    t = re.sub(r"<span>\",\{\"template\".*?'>", "", t, flags=re.S)  # page-number widgets
    lines = [re.sub(r"\s+", " ", ln).strip() for ln in t.split("\n")]
    return [ln for ln in lines if ln]


def cid(prefix, n):
    return "%s%02d" % (prefix, n)


def split_meanings(par):
    """'<description> Divinatory Meanings: <up> Reversed: <rev>' -> three strings."""
    m = re.match(r"(.*?)\s*Divinatory Meanings:\s*(.*?)(?:\s*Reversed:\s*(.*))?$", par)
    if not m:
        raise ValueError("no meanings in: " + par[:80])
    desc = m.group(1)
    # Five of Wands runs into its meanings: "It is mimic warfare, and hereto correspond the
    # Divinatory Meanings:"; end that description at "warfare."
    desc = re.sub(r", and hereto correspond the$", ".", desc)
    return desc, m.group(2), m.group(3) or ""  # Two of Cups has no reversed reading


def parse(p2, p3):
    out = {}
    # Part III §2: lesser arcana descriptions and meanings
    i3 = p3.index("§ 3")
    for i, ln in enumerate(p3[:i3]):
        m = re.match(r"^(?:THE SUIT OF )?(WANDS|CUPS|SWORDS|PENTACLES)(King|Queen|Knight|Page|Ten|"
                     r"Nine|Eight|Seven|Six|Five|Four|Three|Two|Ace)$", ln)
        if m:
            d, up, rev = split_meanings(p3[i + 1])
            out[cid(SUITS[m.group(1)], RANKS[m.group(2)])] = {"description": d, "upright": up,
                                                              "reversed": rev}
    # Part III §3: greater arcana meanings
    i4 = p3.index("§ 4")
    for ln in p3[i3:i4]:
        m = re.match(r"^(\d+|Zero)\. (.*?)\.—(.*?)\s*Reversed:\s*(.*)$", ln)
        if m:
            n = 0 if m.group(1) == "Zero" else int(m.group(1))
            up = m.group(3).rstrip(", ")
            out[cid("ar", n)] = {"waite_title": m.group(2), "upright": up, "reversed": m.group(4)}
    # Part III §4: additional meanings of the lesser arcana
    i5 = p3.index("§ 5")
    suit = None
    for ln in p3[i4:i5]:
        m = re.match(r"^(?:(Wands|Cups|Swords|Pentacles)\. )?(King|Queen|Knight|Page|Ten|Nine|Eight|"
                     r"Seven|Six|Five|Four|Three|Two|Ace)\.—(.*)$", ln)
        if not m:
            continue
        suit = SUITS[m.group(1).upper()] if m.group(1) else suit
        body = m.group(3)
        up, _, rev = body.partition(" Reversed: ")
        out[cid(suit, RANKS[m.group(2)])]["additional"] = {"upright": up, "reversed": rev}
    # Part II §2: first paragraph of each Trump's description
    i_end = p2.index("§ 3")
    for i, ln in enumerate(p2[:i_end]):
        m = re.match(r"^(0ZERO|[IVX]+)(The .*|Wheel of Fortune|Strength, or Fortitude|Justice|Death|"
                     r"Temperance)$", ln)
        if m:
            n = 0 if m.group(1) == "0ZERO" else ROMAN.index(m.group(1))
            out[cid("ar", n)]["description"] = p2[i + 1]
    # Part III §7: the Celtic method's positions
    i7, i8 = p3.index("§ 7"), p3.index("§ 8")
    pos = [ln for ln in p3[i7:i8] if re.match(r"^\d+\. ", ln)]
    # Part III §5: the recurrence of cards in dealing ("4 Kings = great honour; ...")
    plural = {"Kings": 14, "Queens": 13, "Knights": 12, "Pages": 11, "Tens": 10, "Nines": 9,
              "Eights": 8, "Sevens": 7, "Sixes": 6, "Fives": 5, "Fours": 4, "Threes": 3, "Twos": 2,
              "Aces": 1}
    rec, mode = {"natural": {}, "reversed": {}}, "natural"
    for ln in p3[i5:p3.index("§ 6")]:
        if ln == "Reversed":
            mode = "reversed"
        for k, word, meaning in re.findall(r"([234]) (\w+) = ([^;]+?)\.?(?:;|$)", ln):
            rec[mode].setdefault(str(plural[word]), {})[k] = meaning
    return out, pos, rec


def main():
    p2, p3 = to_text(sys.argv[1]), to_text(sys.argv[2])
    cards, celtic, recurrence = parse(p2, p3)
    assert len(cards) == 78, len(cards)
    for k, v in cards.items():
        assert v.get("upright") and v.get("description") and "reversed" in v, k
    print("// Generated by tools/extract_waite.py from A. E. Waite, \"The Pictorial Key to the Tarot\"")
    print("// (London: W. Rider, 1910/1911), Wikisource transcription. Public domain in the US.")
    print("// Verbatim text; do not edit by hand. Keys: ar00-ar21 (Waite numbering: 8 Strength,")
    print("// 11 Justice), wa/cu/sw/pe 01-14 (01 Ace ... 10, 11 Page, 12 Knight, 13 Queen, 14 King).")
    print("export const WAITE_SOURCE = %s;" % json.dumps({
        "title": "The Pictorial Key to the Tarot", "author": "Arthur Edward Waite",
        "illustrator": "Pamela Colman Smith", "year": "1910",
        "url": "https://en.wikisource.org/wiki/The_Pictorial_Key_to_the_Tarot"}))
    print("export const CELTIC_POSITIONS = %s;" % json.dumps(celtic, ensure_ascii=False))
    assert all(len(v) == 14 for v in recurrence.values()), recurrence
    print("// Part III §5, keyed by rank (1 Ace ... 14 King), then by how many of that rank appear.")
    print("export const RECURRENCE = %s;" % json.dumps(recurrence, ensure_ascii=False))
    print("export const WAITE = {")
    for k in sorted(cards):
        print("  %s: %s," % (k, json.dumps(cards[k], ensure_ascii=False)))
    print("};")


if __name__ == "__main__":
    main()
