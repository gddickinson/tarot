"""Python port of static/reading_engine.js: a written interpretation of a dealt reading (introduction, summary, one
passage per position, threads across the spread, closing reflection and questions), deterministic by the reading's
seed. Same inputs give the same text as the browser; tests/fixtures/readings.json checks it.
"""
import re

from .engine import CARD, RANK_PLURAL, SPREADS, seed_from
from .reading_patterns import NUM_WORDS, analyse, classify_question, element_of, relation, valence
from .texts import reading_data

DEFAULT_TONE = "modern"
ANCHOR = {"single": 0, "three": 2, "four": 3, "celtic": 9}
REFLECTIVE = ["health", "legal", "money"]
SKIP_RECURRENCE = re.compile(r"illness|infirmity|women")
THREAD_ORDER = ["weight", "suits", "cross", "pairs", "elements", "courts", "numbers", "reversals"]
REFLECTIVE_THREADS = ["pairs", "elements", "courts"]
_PLACEHOLDER = re.compile(r"\{(\w+)\}", re.ASCII)
_JS_WS = "\t\n\v\f\r                " \
         "  　﻿"


def D() -> dict:
    return reading_data()


def fill(template: str, vars_: dict) -> str:
    def sub(m):
        if vars_.get(m.group(1)) is None:
            raise ValueError(f"no value for {{{m.group(1)}}} in: {template}")
        return str(vars_[m.group(1)])
    return _PLACEHOLDER.sub(sub, template)


def cap(s: str) -> str:
    return s[:1].upper() + s[1:] if s else s


def _sign(v: int) -> int:
    return (v > 0) - (v < 0)


def join_list(items: list[str], sep: str = ", ", last: str = " and ") -> str:
    if len(items) <= 1:
        return "".join(items)
    return sep.join(items[:-1]) + last + items[-1]


def card_ref(card_id: str, reversed_: bool = False) -> str:
    """The card's name as it reads mid-sentence: "the Tower", "Strength", "the Three of Cups" (+ " reversed")."""
    c = CARD[card_id]
    name = c["name"]
    if c["arcana"] == "minor" or name == "Wheel of Fortune":
        name = "the " + name
    elif name.startswith("The "):
        name = "the " + name[4:]
    return name + " reversed" if reversed_ else name


class Ctx:
    def __init__(self, reading: dict, question, tone: str):
        self.reading, self.tone, self.spread = reading, tone, reading["spread"]
        self.seed = reading["seed"] & 0xFFFFFFFF
        self.cards = reading["cards"]
        self.roles = D()["POSITIONS"][self.spread]
        self.an = analyse(reading)
        self.q = classify_question(question)
        self.topic_key = self.q["topic"] if self.q["topic"] != "general" else "decision" if self.q["decision"] else None
        self.used_topic = set()

    def pick(self, options, key: str):
        return options[seed_from(f"{self.seed}|{key}") % len(options)] if isinstance(options, list) else options

    def ref(self, i: int) -> str:
        return card_ref(self.cards[i]["id"], bool(self.cards[i].get("reversed")))

    def pair_vars(self, a: int, b: int) -> dict:
        return {"a": self.ref(a), "A": cap(self.ref(a)), "b": self.ref(b), "B": cap(self.ref(b)),
                "sa": self.roles[a]["short"], "sb": self.roles[b]["short"]}


def position_text(ctx: Ctx, i: int) -> dict:
    d, tone, c, role = D(), ctx.tone, ctx.cards[i], ctx.roles[i]
    ct, card = d["CARD_TEXT"][c["id"]], CARD[c["id"]]
    rev = bool(c.get("reversed"))
    r = card_ref(c["id"], rev)
    reflect = ctx.q["sensitive"] in REFLECTIVE and role["time"] == "future"
    vars_ = {"card": r, "Card": cap(r), "meaning": ct["rev"] if rev else ct["up"], "short": role["short"],
             "Short": cap(role["short"])}
    parts = [fill(ctx.pick(d["REFLECT"][tone] if reflect else role["frames"][tone], f"pos{i}"), vars_)]
    if rev:
        parts.append(ctx.pick(d["MODE"][tone][ct["mode"]], f"mode{i}"))
    v, ex = valence(c), d["EXTRAS"]
    if ctx.spread == "celtic":
        if i == 1 and v > 0:
            parts.append(ex["cross_kind"][tone])
        if i == 8 and v != 0:
            parts.append(ex["hope" if v > 0 else "fear"][tone])
        if i == 9 and not reflect and card["arcana"] == "major":
            parts.append(ex["outcome_major"][tone])
        if i == 9 and not reflect and card.get("court"):
            parts.append(ex["outcome_court"][tone])
    if role["key"] and ctx.topic_key and tone != "brief" and not ctx.q["sensitive"]:
        group = "major" if card["arcana"] == "major" else card["suit"]
        if group not in ctx.used_topic:
            parts.append(d["SUIT_TOPIC"][group][ctx.topic_key])
            ctx.used_topic.add(group)
    return {"i": i, "pos": c["pos"], "id": c["id"], "reversed": rev,
            "heading": f"{i + 1}. {c['pos']}: {card['name']}{' (reversed)' if rev else ''}", "text": " ".join(parts)}


def intro(ctx: Ctx, question) -> list[str]:
    d, tone, q = D(), ctx.tone, ctx.q
    if q["sensitive"] == "selfharm":
        return [d["SENSITIVE_MSG"]["selfharm"][tone]]
    text = str(question or "").strip(_JS_WS)
    first = fill(ctx.pick(d["OPEN"]["question"][tone], "q"), {"q": text}) if text \
        else ctx.pick(d["OPEN"]["noquestion"][tone], "noq")
    rest = []
    if q["sensitive"]:
        rest.append(d["SENSITIVE_MSG"][q["sensitive"]][tone])
    elif q["topic"] != "general":
        rest.append(fill(d["OPEN"]["topic_decision" if q["decision"] else "topic"][tone],
                         {"topic": d["TOPIC_NAMES"][q["topic"]]}))
    elif q["decision"]:
        rest.append(d["OPEN"]["decision"][tone])
    sig = ctx.reading.get("significator")
    if sig:
        rest.append(fill(d["OPEN"]["sig"][tone], {"card": card_ref(sig), "Card": cap(card_ref(sig))}))
    return [x for x in [first, " ".join(x for x in rest if x)] if x]


def summary(ctx: Ctx) -> list[str]:
    n, a = len(ctx.cards), ANCHOR[ctx.spread]
    if n < 2 or ctx.q["sensitive"]:
        return []
    return [fill(ctx.pick(D()["SUMMARY"][ctx.tone][ctx.an["tenor"]], "sum"),
                 {"Count": cap(NUM_WORDS[n]), "count": NUM_WORDS[n], "spread": D()["SPREAD_NAMES"][ctx.spread],
                  "anchor": ctx.ref(a), "short": ctx.roles[a]["short"]})]


# --- threads: patterns across the spread -------------------------------------------------------
def _weight(ctx: Ctx) -> str:
    th, tone, an = D()["THREAD"], ctx.tone, ctx.an
    k, n = len(an["majors"]), an["n"]
    if n < 3:
        return ""
    vars_ = {"K": cap(NUM_WORDS[k]), "k": NUM_WORDS[k], "n": NUM_WORDS[n]}
    if k >= 2 and k * 2 >= n:
        return fill(th["majors_many"][tone], vars_)
    if k == 0:
        return th["majors_none"][tone]
    if k == 1 and n >= 5:
        i = an["majors"][0]
        return fill(th["majors_one"][tone], {"card": ctx.ref(i), "short": ctx.roles[i]["short"]})
    return ""


def _suits(ctx: Ctx) -> str:
    d, tone, an, out = D(), ctx.tone, ctx.an, []
    if an["dominant"]:
        out.append(fill(d["SUIT_LORE"][an["dominant"]]["dominant"][tone],
                        {"k": NUM_WORDS[an["suitCounts"][an["dominant"]]]}))
    if an["missing"]:
        items = [d["SUIT_LORE"][s]["missing"][tone] for s in an["missing"]]
        out.append(fill(d["THREAD"]["missing"][tone], {"list": join_list(items, "; ", "; and ")}))
    return " ".join(out)


def _cross(ctx: Ctx) -> str:
    if ctx.spread != "celtic":
        return ""
    th, tone, out = D()["THREAD"], ctx.tone, []
    v = [valence(c) for c in ctx.cards]

    def t(key, a, b):
        return fill(th[key][tone], ctx.pair_vars(a, b))
    centre = ("centre_kind_hard" if v[0] > 0 and v[1] < 0 else "centre_hard_kind" if v[0] < 0 and v[1] > 0
              else "centre_hard" if v[0] < 0 and v[1] < 0 else "centre_kind" if v[0] > 0 and v[1] > 0
              else "centre_mixed")
    out.append(t(centre, 0, 1))
    if not ctx.q["sensitive"]:
        out.append(t("trend_up" if v[5] > v[4] else "trend_down" if v[5] < v[4] else "trend_flat", 4, 5))
    out.append(t("aim_close" if _sign(v[2]) == _sign(v[3]) else "aim_gap", 2, 3))
    e6, e7 = element_of(ctx.cards[6]["id"]), element_of(ctx.cards[7]["id"])
    if e6 and e7:
        out.append(t("self_odds" if relation(e6, e7) == "contrary" else "self_step", 6, 7))
    if not ctx.q["sensitive"]:
        h = ("fear_bigger" if v[8] < 0 and v[9] > 0 else "hope_ahead" if v[8] > 0 and v[9] < 0
             else "hope_met" if v[8] > 0 and v[9] > 0 else "fear_met" if v[8] < 0 and v[9] < 0 else "hope_mixed")
        out.append(t(h, 8, 9))
    sig, own = ctx.reading.get("significator"), CARD[ctx.cards[6]["id"]]
    if sig and CARD[sig]["arcana"] == "minor" and own["arcana"] == "minor" and CARD[sig]["suit"] == own["suit"]:
        out.append(th["sig_suit"][tone])
    return " ".join(out)


def _pairs(ctx: Ctx) -> str:
    key = "traditional" if ctx.tone == "traditional" else "modern"
    return " ".join(D()["PAIRS"][i][key] for i in ctx.an["pairs"])


def _elements(ctx: Ctx) -> str:
    th, tone, an = D()["THREAD"], ctx.tone, ctx.an
    digs = an["dignities"]
    items = [x for x in digs if x["rel"] == "contrary"][:2] + [x for x in digs if x["rel"] == "same"][:1]
    if not items and digs and digs[0]["rel"] == "friendly":
        items.append(digs[0])
    out = [fill(th["dig_" + x["rel"]][tone], {**ctx.pair_vars(x["a"], x["b"]), "ea": x["ea"], "eb": x["eb"]})
           for x in items]
    if an["middle"]:
        out.append(fill(th["dig_middle_" + an["middle"]][tone], {"A": cap(ctx.ref(1))}))
    return " ".join(x for x in [th["dig_lead"][tone], *out] if x) if out else ""


def _courts(ctx: Ctx) -> str:
    d, tone, an, out = D(), ctx.tone, ctx.an, []
    k = len(an["courts"])
    if k >= 3:
        out.append(fill(d["THREAD"]["courts_many"][tone], {"K": cap(NUM_WORDS[k]), "k": NUM_WORDS[k]}))
    for i in an["courts"][:4]:
        c = CARD[ctx.cards[i]["id"]]
        lore = d["COURT_LORE"][str(c["rank"])]
        out.append(fill(d["THREAD"]["court"][tone], {"Card": cap(ctx.ref(i)), "adj": d["SUIT_ADJ"][c["suit"]],
                                                     "person": lore["person"], "aspect": lore["aspect"]}))
    return " ".join(out)


def _numbers(ctx: Ctx) -> str:
    d, tone, an, out = D(), ctx.tone, ctx.an, []
    th, lore = d["THREAD"], d["NUMBER_LORE"]
    for r in an["recurrences"]:
        vars_ = {"Count": cap(NUM_WORDS[r["count"]]), "plural": RANK_PLURAL[r["rank"]],
                 "orient": "reversed" if r["mode"] == "reversed" else "upright", "meaning": r["meaning"]}
        if SKIP_RECURRENCE.search(r["meaning"]):
            out.append(fill(th["recur_skip"][tone], vars_))
        elif r["rank"] > 10:
            out.append(fill(th["recur_court"][tone], vars_))
        else:
            num = lore[str(r["rank"])]
            out.append(fill(th["recur"][tone], {**vars_, "num": num["name"].lower(), "theme": num["theme"]}))
    run = an["run"]
    if run:
        out.append(fill(th["run"][tone], {"list": join_list([lore[str(x)]["name"].lower() for x in run]),
                                          "from": lore[str(run[0])]["theme"], "to": lore[str(run[-1])]["theme"]}))
    if an["stage"]:
        out.append(th[an["stage"]][tone])
    if an["trend"]:
        out.append(th[an["trend"]][tone])
    return " ".join(out)


def _reversals(ctx: Ctx) -> str:
    th, tone, an = D()["THREAD"], ctx.tone, ctx.an
    if not ctx.reading.get("reversals") or an["n"] < 3:
        return ""
    vars_ = {"K": cap(NUM_WORDS[an["reversed"]]), "n": NUM_WORDS[an["n"]]}
    if an["reversed"] * 2 > an["n"]:
        return fill(th["rev_many"][tone], vars_)
    if an["reversed"] == 0 and an["n"] >= 5:
        return th["rev_none"][tone]
    return ""


THREADS = {"weight": _weight, "suits": _suits, "cross": _cross, "pairs": _pairs, "elements": _elements,
           "courts": _courts, "numbers": _numbers, "reversals": _reversals}


def threads(ctx: Ctx) -> list[dict]:
    if ctx.q["sensitive"] == "selfharm":
        return []
    out = []
    for key in THREAD_ORDER:
        if ctx.q["sensitive"] and key not in REFLECTIVE_THREADS:
            continue
        text = THREADS[key](ctx)
        if text:
            out.append({"key": key, "title": D()["THREAD_TITLES"][key], "text": text})
    return out[:3] if ctx.tone == "brief" else out


def closing(ctx: Ctx) -> list[str]:
    d, tone, q, an = D(), ctx.tone, ctx.q, ctx.an
    close = d["CLOSE"]
    if q["sensitive"] == "selfharm":
        return [close["sensitive"]["selfharm"][tone]]
    ct = d["CARD_TEXT"]
    kws = [ct[c["id"]]["rkw"] if c.get("reversed") else ct[c["id"]]["kw"] for c in ctx.cards]
    parts = []
    if q["sensitive"]:
        parts.append(fill(close["arc_reflect"][tone], {"list": join_list(list(dict.fromkeys(kws)))}))
    else:
        vars_ = {}
        for i, k in enumerate(kws):
            vars_[f"k{i}"], vars_[f"K{i}"] = k, cap(k)
        parts += [fill(close["arc"][ctx.spread][tone], vars_), close["tenor"][an["tenor"]][tone]]
    if q["sensitive"]:
        parts.append(close["sensitive"][q["sensitive"]][tone])
    elif q["topic"] == "money":
        parts.append(close["money_note"][tone])
    return [" ".join(parts)]


def question_banks(ctx: Ctx) -> list[tuple[str, int]]:
    an, q = ctx.an, ctx.q
    if q["sensitive"]:
        return [("sensitive", 2), ("general", 3)]
    banks = []
    if ctx.reading.get("reversals") and an["n"] >= 3 and an["reversed"] * 2 > an["n"]:
        pattern = "reversed"
    elif an["n"] >= 3 and len(an["majors"]) >= 2 and len(an["majors"]) * 2 >= an["n"]:
        pattern = "majors"
    elif an["courts"]:
        pattern = "courts"
    elif an["missing"]:
        pattern = "missing_" + an["missing"][0]
    elif an["dominant"]:
        pattern = "dominant_" + an["dominant"]
    else:
        pattern = None
    if pattern:
        banks.append((pattern, 1))
    if q["decision"]:
        banks.append(("decision", 1))
    if q["topic"] != "general":
        banks.append((q["topic"], 3))
    banks.append(("general", 3))
    return banks


def questions(ctx: Ctx) -> list[str]:
    if ctx.q["sensitive"] == "selfharm":
        return []
    want, out = (2 if ctx.tone == "brief" else 3), []
    for bank, quota in question_banks(ctx):
        items = D()["QUESTIONS"][bank]
        start, taken = seed_from(f"{ctx.seed}|q|{bank}") % len(items), 0
        for j in range(len(items)):
            if taken >= quota or len(out) >= want:
                break
            item = items[(start + j) % len(items)]
            if item not in out:
                out.append(item)
                taken += 1
    return out


def interpret(reading: dict, question="", tone: str = DEFAULT_TONE) -> dict:
    """The full interpretation; reading as returned by engine.draw_reading (or the same shape)."""
    t = tone if tone in D()["TONES"] else DEFAULT_TONE
    ctx = Ctx(reading, question, t)
    selfharm = ctx.q["sensitive"] == "selfharm"
    out = {"tone": t, "topic": ctx.q["topic"], "decision": ctx.q["decision"], "sensitive": ctx.q["sensitive"],
           "intro": intro(ctx, question), "summary": summary(ctx),
           "positions": [] if selfharm else [position_text(ctx, i) for i in range(len(ctx.cards))]}
    out.update({"threads": threads(ctx), "closing": closing(ctx), "questions": questions(ctx),
                "note": "" if selfharm else D()["CLOSE"]["note"][t]})
    out["text"] = reading_text(out, reading)
    return out


def reading_text(it: dict, reading: dict) -> str:
    """Plain text of an interpretation (as readingText() in the JS)."""
    lines = [f"Tarot reading: {SPREADS[reading['spread']]['label']} ({D()['TONES'][it['tone']]})", ""]
    for p in it["intro"] + it["summary"]:
        lines += [p, ""]
    if it["positions"]:
        lines += ["The cards", ""]
        for p in it["positions"]:
            lines += [p["heading"], p["text"], ""]
    if it["threads"]:
        lines += ["Threads", ""]
        for t in it["threads"]:
            lines += [f"{t['title']}: {t['text']}", ""]
    if it["closing"]:
        lines += ["Reflection", "", *it["closing"], ""]
    if it["questions"]:
        lines += ["Questions to consider", "", *("- " + x for x in it["questions"]), ""]
    if it["note"]:
        lines.append(it["note"])
    return "\n".join(lines).rstrip(_JS_WS)
