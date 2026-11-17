// Sentence templates of the reading engine, by tone (plain JSON; web/texts.py reads it). Written for this site.
// A list means variants: the engine picks one deterministically from the reading's seed (reading_engine.js pick()).
// Placeholders in braces are filled by the engine; a missing value is an error (tests check every combination).
export const TONES = {"traditional": "Traditional", "modern": "Modern", "brief": "Brief"};
export const SPREAD_NAMES = {"single": "single card", "three": "three-card spread", "four": "four-card draw", "celtic": "Celtic Cross"};

// What reversal does to a card (reading_cards.js "mode"). "other": the reversed gloss already says it, no clause.
export const MODE = {
"traditional": {
 "blocked": ["Being reversed, its force is hindered.", "Reversed, it is obstructed and cannot work freely."],
 "inward": ["Being reversed, its working is inward and hidden.", "Reversed, it acts within rather than without."],
 "delay": ["Being reversed, it comes late or in a lesser degree.", "Reversed, its effect is deferred."],
 "excess": ["Being reversed, its quality runs to excess.", "Reversed, it is carried too far."],
 "easing": ["Being reversed, its trouble is lessened.", "Reversed, the affliction it signifies is passing."],
 "other": []},
"modern": {
 "blocked": ["Reversed, its energy is blocked: it is there, but something stands in the way.", "Reversed, so this is held back rather than absent."],
 "inward": ["Reversed, it turns inward: this is happening inside you more than around you.", "Reversed, so look for this in your own thoughts and feelings first."],
 "delay": ["Reversed, it is slow to arrive: delayed rather than denied.", "Reversed, so give it time: what it promises comes later, or in a smaller measure."],
 "excess": ["Reversed, it shows too much of its own quality, a strength pushed until it becomes a problem.", "Reversed, so this is the card's quality overdone."],
 "easing": ["Reversed, its weight lifts: the hardest part is passing.", "Reversed, which softens it: the difficulty is easing."],
 "other": []},
"brief": {
 "blocked": ["Held back."], "inward": ["Turned inward."], "delay": ["Delayed."], "excess": ["Overdone."],
 "easing": ["Easing."], "other": []}
};

export const OPEN = {
"question": {"traditional": ["The question put to the cards: “{q}”", "The Querent asks: “{q}”"], "modern": ["You asked: “{q}”", "Your question: “{q}”"], "brief": ["“{q}”"]},
"noquestion": {"traditional": ["No question was put, so the cards speak to the Querent's affairs in general."], "modern": ["No question was asked, so the cards speak to whatever is most alive for you just now.", "Without a question, the cards speak to what is on your mind, whether or not you have put it into words."], "brief": ["No question: a general reading."]},
"topic": {"traditional": "The matter concerns {topic}.", "modern": "It reads as a question about {topic}, so the cards are read in that light.", "brief": ""},
"topic_decision": {"traditional": "The matter is a choice concerning {topic}.", "modern": "It reads as a choice about {topic}, so the cards are read as light on the options.", "brief": ""},
"decision": {"traditional": "The matter is a choice to be made.", "modern": "It reads as a decision to be made, so the cards are read as light on the options.", "brief": ""},
"sig": {"traditional": "{Card} is taken as the Significator, representing the Querent, and the first card covers it.", "modern": "{Card} is your Significator: it stands for you, and the first card is laid over it.", "brief": "Significator: {card}."}
};

// Summary once every card is face up (spreads of more than one card), by overall tenor.
export const SUMMARY = {
"traditional": {
 "favourable": ["On the whole the cards of the {spread} are favourable to the Querent. The card on which the reading turns is {anchor}, as {short}."],
 "mixed": ["The cards of the {spread} are favourable and adverse together. The card on which the reading turns is {anchor}, as {short}."],
 "challenging": ["The cards of the {spread} speak chiefly of difficulty. The card on which the reading turns is {anchor}, as {short}."]},
"modern": {
 "favourable": ["On the whole these {count} cards lean in your favour. The card that sets the tone is {anchor}, as {short}.", "Across the {spread} the cards are mostly encouraging, and the one to watch is {anchor}, as {short}."],
 "mixed": ["These {count} cards are mixed: some help, some ask more of you. The card that sets the tone is {anchor}, as {short}.", "The cards of the {spread} pull in more than one direction, and the one to watch is {anchor}, as {short}."],
 "challenging": ["These {count} cards are a demanding set. The card that sets the tone is {anchor}, as {short}.", "The cards of the {spread} are heavy going, and the one to watch is {anchor}, as {short}."]},
"brief": {
 "favourable": ["Overall encouraging; key card {anchor}."], "mixed": ["Overall mixed; key card {anchor}."],
 "challenging": ["Overall demanding; key card {anchor}."]}
};

export const SENSITIVE_MSG = {
"health": {"traditional": "This question touches on health, which the cards cannot answer and should not be asked to: it belongs with a doctor or other qualified health professional. The cards below are read only as a reflection on the Querent's state of mind, not as a prediction.", "modern": "This touches on health, and tarot can't answer health questions: please talk to a doctor, nurse or pharmacist about it. The cards below are read only as a reflection on how you are approaching it, not as a prediction.", "brief": "Tarot can't answer health questions: please ask a doctor. The cards are for reflection only."},
"legal": {"traditional": "This question touches on a legal matter, which the cards cannot decide: it belongs with a qualified lawyer or a legal advice service. The cards below are read only as a reflection, not as a prediction.", "modern": "This touches on a legal matter, and tarot can't tell you how that will go: a qualified lawyer or a free legal advice service can. The cards below are read only as a reflection on how you are approaching it, not as a prediction.", "brief": "Tarot can't answer legal questions: please ask a lawyer. The cards are for reflection only."},
"money": {"traditional": "This question touches on a financial decision, which the cards cannot make: it belongs with a qualified, independent financial adviser. The cards below are read only as a reflection, not as a prediction.", "modern": "This touches on a money decision, and tarot can't tell you what to do with your money: a qualified, independent financial adviser can. The cards below are read only as a reflection on how you are approaching it, not as a prediction.", "brief": "Tarot can't make money decisions: please ask a financial adviser. The cards are for reflection only."},
"selfharm": {"traditional": "It sounds as though you may be going through something very painful. The cards are not the right thing for this, so this question gets no reading. Please reach out to someone now: a person you trust, a doctor, or a local helpline or crisis line, and in an emergency your local emergency number. You do not have to carry this alone.", "modern": "It sounds like you might be going through something really painful. The cards aren't the right thing for this, so there's no reading of this question. Please reach out to someone now: a person you trust, a doctor, or a local helpline or crisis line, and in an emergency your local emergency number. You don't have to carry this alone.", "brief": "It sounds like you're going through something painful. There's no reading for this: please reach out to someone you trust or a local helpline now, or your local emergency number in an emergency. You don't have to carry this alone."}
};

export const THREAD_TITLES = {"weight": "Major and minor arcana", "suits": "Suits and elements", "cross": "How the cross fits together", "pairs": "Cards that speak to each other", "elements": "Elemental dignities", "courts": "Court cards", "numbers": "Numbers", "reversals": "Reversed cards"};

export const THREAD = {
"majors_many": {"traditional": "{K} of the {n} cards are Trumps Major. When the greater arcana crowd a spread the matter is of more than ordinary weight, and forces larger than the Querent's own plans are at work.", "modern": "{K} of the {n} cards are Major Arcana. That is a lot: this is about more than day-to-day events, and part of what is happening is bigger than your own plans.", "brief": "{K} of {n} cards are Major Arcana: a big-picture matter."},
"majors_none": {"traditional": "There is no Trump Major among the cards: the matter belongs to the ordinary course of life and lies within the Querent's own management.", "modern": "There are no Major Arcana here, so this is an everyday matter: what happens next is mostly in your hands.", "brief": "No Major Arcana: an everyday matter, in your hands."},
"majors_one": {"traditional": "Only one Trump Major appears, {card}, as {short}, and the reading turns upon it.", "modern": "Only one Major Arcana card turns up, {card}, as {short}, so that is the card to watch.", "brief": "One trump, {card}: the key card."},
"missing": {"traditional": "There are {list}.", "modern": "There are {list}.", "brief": "Also {list}."},
"court": {"traditional": "{Card} may signify a person of {adj} temper, {person}, or else the Querent's own {aspect}.", "modern": "{Card} may be someone in your life, {person}, with a {adj} manner; or it may be your own {aspect}.", "brief": "{Card}: a person, or your {aspect}."},
"courts_many": {"traditional": "{K} court cards appear, so many persons have a hand in the matter.", "modern": "With {k} court cards on the table, other people have a lot of say in this.", "brief": "{K} court cards: other people matter here."},
"recur": {"traditional": "{Count} {plural} {orient}: Waite's table of recurring cards gives “{meaning}”. The number {num} speaks of {theme}.", "modern": "{Count} {plural} {orient}. Waite's old table of recurring cards reads this as “{meaning}”, and {num} is the number of {theme}.", "brief": "{Count} {plural}: “{meaning}” (Waite)."},
"recur_court": {"traditional": "{Count} {plural} {orient}: Waite's table of recurring cards gives “{meaning}”.", "modern": "{Count} {plural} {orient}. Waite's old table of recurring cards reads this as “{meaning}”.", "brief": "{Count} {plural}: “{meaning}” (Waite)."},
"recur_skip": {"traditional": "{Count} {plural} {orient}: Waite's table gives a reading here that touches on health or is simply of its time, and it is left aside.", "modern": "{Count} {plural} {orient}. Waite's 1910 table gives a reading for this that is about health or simply dated, so it is left aside here.", "brief": "{Count} {plural}: Waite's reading left aside."},
"run": {"traditional": "The numbers {list} follow in order, as steps from {from} towards {to}.", "modern": "The numbers {list} run in sequence: a story that moves step by step from {from} to {to}.", "brief": "Numbers {list} in a row: step by step."},
"early": {"traditional": "The numbered cards are all low: the matter is in its beginnings.", "modern": "All the numbered cards are low, so this is early days: things are still forming.", "brief": "Low numbers: early days."},
"late": {"traditional": "The numbered cards are all high: the matter draws towards its close.", "modern": "All the numbered cards are high, so this is late in the cycle: something is close to finishing.", "brief": "High numbers: late in the cycle."},
"rising": {"traditional": "The numbers rise from card to card, as of a matter gathering strength.", "modern": "The numbers climb from card to card, a sign of something building.", "brief": "Rising numbers: building."},
"falling": {"traditional": "The numbers fall from card to card, as of a matter running down.", "modern": "The numbers fall from card to card, as if something is winding down.", "brief": "Falling numbers: winding down."},
"rev_many": {"traditional": "{K} of the {n} cards fall reversed: much in the matter is hindered, deferred or kept within.", "modern": "{K} of the {n} cards are reversed. That many reversals suggest energy that is blocked, delayed or turned inward: read the spread as what is held back, not what is absent.", "brief": "{K} of {n} reversed: much is held back."},
"rev_none": {"traditional": "All the cards fall upright: the matter goes forward openly.", "modern": "Every card is upright: what is happening is out in the open.", "brief": "All upright: things are in the open."},
"dig_lead": {"traditional": "By the rule of elemental dignities, cards lying together strengthen or weaken one another according to their elements.", "modern": "By the Golden Dawn rule of elemental dignities, neighbouring cards strengthen or weaken each other through their elements.", "brief": ""},
"dig_contrary": {"traditional": "{A}, of {ea}, and {b}, of {eb}, are of contrary elements and weaken one another: there is opposition between {sa} and {sb}.", "modern": "{A} ({ea}) and {b} ({eb}) are contrary elements, so they weaken each other: expect friction between {sa} and {sb}.", "brief": "{A} and {b}: contrary elements, friction."},
"dig_same": {"traditional": "{A} and {b} are both of {ea}, and each strengthens the other: {sa} and {sb} work together.", "modern": "{A} and {b} share the element of {ea}, which strengthens both: {sa} and {sb} pull the same way.", "brief": "{A} and {b}: both {ea}, strengthened."},
"dig_friendly": {"traditional": "{A}, of {ea}, and {b}, of {eb}, are friendly elements: {sa} and {sb} support one another.", "modern": "{A} ({ea}) and {b} ({eb}) are friendly elements: {sa} and {sb} support each other.", "brief": "{A} and {b}: friendly elements."},
"dig_middle_weak": {"traditional": "{A} stands between two cards of the element contrary to its own, and by the rule of dignities is much weakened.", "modern": "{A}, in the middle, is flanked by two cards of its contrary element, which by the Golden Dawn rule weakens it a good deal.", "brief": "{A} weakened by its neighbours."},
"dig_middle_strong": {"traditional": "{A} stands between cards of its own or friendly elements, and is strengthened by them.", "modern": "{A}, in the middle, is supported by its neighbours' elements, which strengthens it.", "brief": "{A} strengthened by its neighbours."},
"centre_kind_hard": {"traditional": "The covering card, {a}, is favourable, but {b} opposes it in earnest.", "modern": "The atmosphere ({a}) is good, but {b} lies across it: the obstacle is a real one, not just a mood.", "brief": "Good atmosphere, real obstacle."},
"centre_hard_kind": {"traditional": "The covering card, {a}, is heavy, while the crossing card, {b}, is favourable, so the opposition will not be serious.", "modern": "The atmosphere ({a}) is heavy, and what crosses it ({b}) is the kinder card, so the opposition is lighter than the mood suggests.", "brief": "Heavy mood, mild obstacle."},
"centre_hard": {"traditional": "Both {a} and {b} are adverse cards, and the pressure at the heart of the matter is real.", "modern": "Both {a} and {b} are difficult cards, so the pressure at the centre of this is real; it will take time and care.", "brief": "Real pressure at the centre."},
"centre_kind": {"traditional": "Both {a} and {b} are favourable, so the knot at the heart of the matter is a gentle one.", "modern": "Both central cards, {a} and {b}, are favourable: the knot at the centre is a gentle one.", "brief": "A gentle knot at the centre."},
"centre_mixed": {"traditional": "At the heart of the matter {a} and {b} draw in different directions.", "modern": "At the centre, {a} and {b} pull in different directions: the knot is in how they meet.", "brief": "Mixed centre."},
"trend_up": {"traditional": "From {a} behind to {b} before, the matter is improving.", "modern": "From {a} behind you to {b} ahead, the tide is turning in your favour.", "brief": "Improving."},
"trend_down": {"traditional": "From {a} behind to {b} before, the matter grows more difficult for a time.", "modern": "From {a} behind you to {b} ahead, things may get harder before they ease: prepare rather than worry.", "brief": "Harder for a while."},
"trend_flat": {"traditional": "{A} behind and {b} before are of one character: the near future continues the recent past.", "modern": "{A} behind you and {b} ahead are of a piece: the near future carries on from the recent past.", "brief": "Steady."},
"aim_close": {"traditional": "The crown, {a}, agrees with the foundation, {b}: the Querent's aim rests on ground already won.", "modern": "Your aim ({a}) and your foundation ({b}) agree: what you want is built on ground you already stand on.", "brief": "Aim and foundation agree."},
"aim_gap": {"traditional": "Between the crown, {a}, and the foundation, {b}, there is a gap: the aim is not yet supported by what has been made actual.", "modern": "There is a gap between your aim ({a}) and your foundation ({b}): what you want and what you have to build on are not the same yet.", "brief": "A gap between aim and foundation."},
"self_step": {"traditional": "The Querent's card, {a}, and the house, {b}, are in accord.", "modern": "You ({a}) and your surroundings ({b}) are in step.", "brief": "You and your surroundings agree."},
"self_odds": {"traditional": "The Querent's card, {a}, and the house, {b}, are at odds: some of the opposition comes from the surroundings.", "modern": "You ({a}) and your surroundings ({b}) are at odds: some of the resistance comes from around you, not from within.", "brief": "You and your surroundings clash."},
"fear_bigger": {"traditional": "The fear, {a}, is greater than the issue, {b}, which is kinder than the Querent dreads.", "modern": "Your fear ({a}) is larger than the outcome ({b}): the cards suggest it turns out better than you dread.", "brief": "Better than you fear."},
"hope_ahead": {"traditional": "The hope, {a}, runs ahead of the issue, {b}: let the Querent temper the expectation, though not abandon it.", "modern": "Your hopes ({a}) run ahead of the outcome ({b}): keep the hope, but adjust the expectation.", "brief": "Hopes run ahead."},
"hope_met": {"traditional": "The hope, {a}, and the issue, {b}, are in agreement.", "modern": "Your hope ({a}) and the outcome ({b}) agree.", "brief": "Hope and outcome agree."},
"fear_met": {"traditional": "The fear, {a}, and the issue, {b}, share their heaviness: a reason to prepare, not to despair.", "modern": "Fear ({a}) and outcome ({b}) share a heaviness: take it as a reason to prepare, not to give up.", "brief": "Prepare, don't despair."},
"hope_mixed": {"traditional": "Hopes or fears, {a}, and the issue, {b}, only partly agree.", "modern": "Your hopes or fears ({a}) and the outcome ({b}) only partly match: the result is neither what you dread nor quite what you wish.", "brief": "Outcome only partly as hoped."},
"sig_suit": {"traditional": "The Querent's own card shares the Significator's suit: the Querent acts true to character.", "modern": "Your own card shares the Significator's suit: you are acting very much in character.", "brief": "In character."}
};

export const CLOSE = {
"arc": {
 "single": {"traditional": "Let the Querent carry the thought of {k0} through the coming days and see where it shows itself.", "modern": "Sit with {k0} for a day or two and notice where it turns up.", "brief": "Theme: {k0}."},
 "three": {"traditional": "Read together, the matter runs from {k0}, through {k1}, towards {k2}.", "modern": "Put together, the story runs from {k0}, through {k1}, to {k2}.", "brief": "From {k0} to {k1} to {k2}."},
 "four": {"traditional": "Read together, the matter opens with {k0}, passes through {k1} and {k2}, and comes to {k3}.", "modern": "The story runs from {k0}, through {k1} and {k2}, to {k3}.", "brief": "From {k0} to {k3}."},
 "celtic": {"traditional": "The heart of the matter is {k0} crossed by {k1}; the Querent's own card speaks of {k6}, the house of {k7}, and the end is {k9}.", "modern": "The heart of it is {k0}, crossed by {k1}. Your own card speaks of {k6} and your surroundings of {k7}, and it all comes to {k9}.", "brief": "{K0}, crossed by {k1}, coming to {k9}."}},
"arc_reflect": {"traditional": "The themes upon the table are {list}: let them be matter for reflection.", "modern": "The themes on the table are {list}. Take them as prompts for reflection.", "brief": "Themes: {list}."},
"tenor": {
 "favourable": {"traditional": "On the whole the cards are favourable to the Querent.", "modern": "On balance the cards are encouraging. That is not a promise, but it is a good wind to sail with.", "brief": "Encouraging."},
 "mixed": {"traditional": "The cards are divided, and much depends on the Querent's own conduct of the matter.", "modern": "The cards are mixed, which is honest: there are good things here and real difficulties, and how it goes depends on how you handle both.", "brief": "Mixed: much depends on you."},
 "challenging": {"traditional": "The cards are severe, but the Querent may yet meet them with prudence.", "modern": "This is a demanding spread. Difficult cards are rarely a verdict: they show where the work is.", "brief": "Demanding: they show where the work is."}},
"sensitive": {
 "health": {"traditional": "Whatever the cards show, the question itself belongs with a doctor.", "modern": "Whatever the cards show, please take the question itself to a doctor or another qualified health professional.", "brief": "Please ask a doctor."},
 "legal": {"traditional": "Whatever the cards show, the question itself belongs with a qualified lawyer.", "modern": "Whatever the cards show, please take the question itself to a qualified lawyer or a legal advice service.", "brief": "Please ask a lawyer."},
 "money": {"traditional": "Whatever the cards show, the decision itself belongs with a qualified financial adviser.", "modern": "Whatever the cards show, please talk the decision through with a qualified, independent financial adviser.", "brief": "Please ask a financial adviser."},
 "selfharm": {"traditional": "If you are in danger now, please call your local emergency number. Speaking with someone, a friend, a family member or a helpline, can help.", "modern": "If you're in danger right now, please call your local emergency number. Talking to someone, a friend, a family member or a helpline, can really help.", "brief": "In danger now? Call your local emergency number."}},
"money_note": {"traditional": "For any real decision about money, a qualified adviser is the one to consult.", "modern": "And for real money decisions, a qualified adviser is worth more than any card.", "brief": "Real money decisions: ask an adviser."},
"note": {"traditional": "For entertainment: the cards are a mirror for reflection, not a forecast.", "modern": "For entertainment: the cards are a mirror for reflection, not a forecast, and no substitute for advice from people qualified to give it.", "brief": "For entertainment only."}
};

export const QUESTIONS = {
"general": ["What would change if you trusted what you already know about this?", "Which card made you react most strongly, and why?", "What is one small thing you could do this week that fits the reading's kindest card?", "What were you hoping the cards would say, and what would you do if they had?", "What would you advise a friend in exactly your position?"],
"love": ["What do you most want to feel in this relationship, and is it there now?", "What have you not yet said that needs saying?", "How much of this is about the other person, and how much about you?", "What would a kind but honest friend say about this?", "What are you ready to give, and what do you need in return?"],
"work": ["What part of your work gives you energy, and what drains it?", "If a colleague were in your place, what would you tell them?", "What skill or strength are you underusing right now?", "What would success look like a year from now, in plain terms?", "Who could you talk to who sees your work clearly?"],
"money": ["What does security actually mean to you, in practical terms?", "Which money worry is real, and which is borrowed from the past?", "What would a careful, unhurried next step look like?", "What do you value that money cannot buy?"],
"decision": ["If you had to choose today, which option would you feel relieved about?", "What would each choice ask of you, and which price are you willing to pay?", "What are you afraid you would lose by choosing?", "Which option fits the person you are becoming?"],
"sensitive": ["Who is the right person to ask about this, and what will you ask them?", "Who could support you while you deal with this?", "What would help you feel steadier while you wait for real answers?"],
"reversed": ["What are you holding back, or waiting for, that you could let move?"],
"majors": ["What here is bigger than you, and what is still yours to choose?"],
"courts": ["Who are the people in this reading, and which of them is really you?"],
"missing_wands": ["Where could you find more energy or initiative?"],
"missing_cups": ["Where are your feelings in all this?"],
"missing_swords": ["What needs to be thought through, or said, that hasn't been?"],
"missing_pentacles": ["What practical step would make this real?"],
"dominant_wands": ["Where is your energy best spent?"],
"dominant_cups": ["What is your heart telling you?"],
"dominant_swords": ["What conversation have you been avoiding?"],
"dominant_pentacles": ["What could you build, slowly and steadily?"]
};
