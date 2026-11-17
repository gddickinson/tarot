// Traditional correspondences used by the reading engine, in this site's own words (plain JSON; web/texts.py reads it).
// Suits and elements: the Golden Dawn attributions (Wands fire, Cups water, Swords air, Pentacles earth). Elemental
// dignities: the Golden Dawn's "Book T" rule, contrary elements weaken each other (fire/water, air/earth), the same
// element strengthens, every other pair is friendly. Number meanings: the usual reading of the pip numbers
// (1 beginning ... 10 completion). Court cards: a person, or a side of the person asking. Pairings: a few classic
// combinations, described here from the cards' own meanings.
export const ELEMENTS = {"wands": "fire", "cups": "water", "swords": "air", "pentacles": "earth"};
export const CONTRARY = {"fire": "water", "water": "fire", "air": "earth", "earth": "air"};

export const SUIT_LORE = {
"wands": {"name": "Wands", "element": "fire", "domain": "energy, ambition and getting things moving",
  "dominant": {"traditional": "The suit of Wands rules this spread ({k} cards). Fire predominates: enterprise, ambition and the will to act, so the matter turns on what the Querent does rather than on what is felt or thought.", "modern": "Wands lead the spread with {k} cards. This is a fire question: energy, ambition and momentum. The answer is more in what you do than in what you feel or think.", "brief": "Mostly Wands: action and drive matter most."},
  "missing": {"traditional": "no Wands, so there is little fire of enterprise in the matter", "modern": "no Wands, so drive and initiative are in short supply here", "brief": "no Wands (little drive)"}},
"cups": {"name": "Cups", "element": "water", "domain": "feelings, love and relationships",
  "dominant": {"traditional": "The suit of Cups rules this spread ({k} cards). Water predominates: the affections, pleasure and the bonds between people, so the heart of the matter is a matter of the heart.", "modern": "Cups lead the spread with {k} cards. This is a water question: feelings, relationships and what you care about. Whatever the surface issue, the real story is emotional.", "brief": "Mostly Cups: feelings are at the centre."},
  "missing": {"traditional": "no Cups, so the affections stand apart from the matter", "modern": "no Cups, so feelings are being kept out of this, or are not the point", "brief": "no Cups (feelings set aside)"}},
"swords": {"name": "Swords", "element": "air", "domain": "thought, words and conflict",
  "dominant": {"traditional": "The suit of Swords rules this spread ({k} cards). Air predominates: thought, strife and decision, so there is contention to be faced and the mind must do the work.", "modern": "Swords lead the spread with {k} cards. This is an air question: thoughts, words, decisions and some conflict. Clear thinking, and honest conversations, are the way through.", "brief": "Mostly Swords: thought and conflict dominate."},
  "missing": {"traditional": "no Swords, so there is little strife, and perhaps too little hard thinking", "modern": "no Swords, so there is little conflict, though perhaps also too little hard thinking", "brief": "no Swords (little conflict)"}},
"pentacles": {"name": "Pentacles", "element": "earth", "domain": "work, money and practical matters",
  "dominant": {"traditional": "The suit of Pentacles rules this spread ({k} cards). Earth predominates: work, possessions and the solid affairs of life, so the matter will be settled in practical terms.", "modern": "Pentacles lead the spread with {k} cards. This is an earth question: work, money, home and the practical side of life. Look at what is concrete and what can be built.", "brief": "Mostly Pentacles: practical matters lead."},
  "missing": {"traditional": "no Pentacles, so material affairs are not at stake", "modern": "no Pentacles, so practical and material matters are not what this is about", "brief": "no Pentacles (not material)"}}
};

// How a suit (or a trump) colours a question on a given topic: used once per reading at a key position.
export const SUIT_TOPIC = {
"wands": {"love": "In a question of love, Wands bring passion and initiative: someone may need to make the first move.", "work": "For work, Wands are a good sign of energy and ambition: projects that move, and the drive to push them.", "money": "In money matters Wands speak of enterprise, of earning by effort rather than waiting for luck.", "decision": "For a decision, Wands favour the option that gets things moving."},
"cups": {"love": "In a question of love, Cups speak directly to the heart: this is the suit of the affections.", "work": "In a question about work, Cups point to the people and feelings around the job more than the job itself.", "money": "In money matters Cups suggest that feelings, not figures, are driving things.", "decision": "For a decision, Cups ask which option your heart is already leaning towards."},
"swords": {"love": "In a question of love, Swords bring words and tension: what needs to be said, and what has been said.", "work": "For work, Swords point to decisions, arguments and the need for a clear head.", "money": "In money matters Swords counsel clear thinking and a careful look at the facts.", "decision": "For a decision, Swords say think it through: the clearest reasoning wins."},
"pentacles": {"love": "In a question of love, Pentacles are about steadiness and commitment: what can actually be built together.", "work": "For work, Pentacles are the most practical suit: skill, pay and steady progress.", "money": "In money matters Pentacles speak directly to the question: the suit of resources and security.", "decision": "For a decision, Pentacles favour the practical, solid option."},
"major": {"love": "A trump here suggests the question of love touches something larger than the day-to-day.", "work": "A trump here suggests the question of work is tied to a bigger turn in your life.", "money": "A trump here suggests that money is not the whole story: something larger is in play.", "decision": "A trump here suggests the choice matters more than it may look."}
};

// Pip numbers 1-10.
export const NUMBER_LORE = {
"1": {"name": "Ace", "plural": "Aces", "theme": "beginnings and raw potential"},
"2": {"name": "Two", "plural": "Twos", "theme": "balance, partnership and choice"},
"3": {"name": "Three", "plural": "Threes", "theme": "growth and the first results"},
"4": {"name": "Four", "plural": "Fours", "theme": "stability and structure"},
"5": {"name": "Five", "plural": "Fives", "theme": "disruption and challenge"},
"6": {"name": "Six", "plural": "Sixes", "theme": "harmony restored and give and take"},
"7": {"name": "Seven", "plural": "Sevens", "theme": "testing and taking stock"},
"8": {"name": "Eight", "plural": "Eights", "theme": "movement, effort and mastery"},
"9": {"name": "Nine", "plural": "Nines", "theme": "nearing fulfilment"},
"10": {"name": "Ten", "plural": "Tens", "theme": "completion, and the weight of a full cycle"}
};

// Court ranks 11-14: as a person, and as a side of the one who asks. Suit adjectives colour the person.
export const COURT_LORE = {
"11": {"person": "someone young or new to the matter, a learner or a messenger", "aspect": "curiosity and willingness to learn"},
"12": {"person": "someone on the move, eager and quick to act", "aspect": "urge to act and to go after things"},
"13": {"person": "a mature person who holds things together and looks after others", "aspect": "capacity to nurture and to understand from within"},
"14": {"person": "a person of authority and experience", "aspect": "ability to take charge and decide"}
};
export const SUIT_ADJ = {"wands": "warm, energetic", "cups": "gentle, feeling", "swords": "sharp, analytical", "pentacles": "practical, steady"};

// Pairs of cards that comment on each other when both appear (either orientation).
export const PAIRS = [
{"a": "ar16", "b": "ar17", "modern": "The Tower and the Star together are the classic storm and calm: whatever falls, hope follows it.", "traditional": "The Tower with the Star: calamity is followed by hope and the return of bright prospects."},
{"a": "ar13", "b": "ar20", "modern": "Death and Judgement together mark an ending that is also a renewal: something finishes so that something else can rise.", "traditional": "Death with Judgement: an end which is also a renewal and a change of position."},
{"a": "ar18", "b": "ar19", "modern": "The Moon and the Sun both appear: confusion and clarity side by side. What is uncertain now can be seen plainly later.", "traditional": "The Moon with the Sun: darkness and error give way to clear daylight."},
{"a": "ar03", "b": "ar04", "modern": "The Empress and the Emperor together balance growth and structure, care and order.", "traditional": "The Empress with the Emperor: fruitfulness joined to stability and protection."},
{"a": "ar01", "b": "ar02", "modern": "The Magician and the High Priestess together pair what you can do with what you quietly know.", "traditional": "The Magician with the High Priestess: skill and will joined to hidden wisdom."},
{"a": "ar00", "b": "ar21", "modern": "The Fool and the World are the first and last steps of the same journey: an ending and a new start meet here.", "traditional": "The Fool with the World: the journey's beginning and its completion in one reading."},
{"a": "ar06", "b": "ar15", "modern": "The Lovers and the Devil together ask whether a bond is freely chosen or a habit that binds.", "traditional": "The Lovers with the Devil: love and attraction set against bondage and appetite."},
{"a": "ar07", "b": "ar08", "modern": "The Chariot and Strength together: outward drive and inner patience. Both kinds of strength are needed.", "traditional": "The Chariot with Strength: victory by force joined to the power of gentleness."},
{"a": "ar10", "b": "ar21", "modern": "The Wheel of Fortune and the World suggest a cycle turning to its close.", "traditional": "The Wheel of Fortune with the World: a turn of fortune brought to completion."},
{"a": "ar09", "b": "ar02", "modern": "The Hermit and the High Priestess both point inward: the answer is found in quiet, not in more information.", "traditional": "The Hermit with the High Priestess: prudence and silence, the answer withheld until it is ready."},
{"a": "ar11", "b": "ar20", "modern": "Justice and Judgement together make this a time of reckoning: things are weighed and decided.", "traditional": "Justice with Judgement: equity and a final decision in the matter."},
{"a": "ar06", "b": "cu02", "modern": "The Lovers and the Two of Cups together double the theme of partnership: a bond between two people is at the heart of this.", "traditional": "The Lovers with the Two of Cups: love and union confirmed twice over."},
{"a": "cu03", "b": "cu07", "modern": "The Three and Seven of Cups together: Waite's additional meanings say the Seven reversed means success when the Three is with it, so daydreams have a chance of becoming real.", "traditional": "The Seven of Cups with the Three: by Waite's additional meanings, success, if the Seven is reversed."},
{"a": "sw03", "b": "ar17", "modern": "The Three of Swords and the Star: hurt that has a way through it, and hope on the far side.", "traditional": "The Three of Swords with the Star: sorrow relieved by hope."},
{"a": "wa01", "b": "pe01", "modern": "The Aces of Wands and Pentacles together: an idea with the means to make it real.", "traditional": "The Ace of Wands with the Ace of Pentacles: an enterprise beginning with the means to sustain it."},
{"a": "sw10", "b": "ar19", "modern": "The Ten of Swords and the Sun: the worst is over, and daylight follows.", "traditional": "The Ten of Swords with the Sun: affliction ended and contentment restored."}
];

// Rough topic of a question, from keywords (whole words, lower case). The first topic that matches wins.
export const TOPICS = {
"love": ["love", "lover", "loves", "partner", "relationship", "relationships", "boyfriend", "girlfriend", "husband", "wife", "spouse", "crush", "date", "dating", "marriage", "marry", "married", "ex", "romance", "romantic", "soulmate", "breakup", "divorce", "together", "feelings", "come back", "get back", "back together", "miss me", "text me", "call me", "kiss", "flirt"],
"work": ["job", "jobs", "career", "work", "working", "boss", "interview", "promotion", "colleague", "colleagues", "coworker", "business", "project", "study", "studies", "exam", "exams", "school", "university", "college", "degree", "team", "company", "client", "clients", "hired", "fired", "redundancy", "application", "office"],
"money": ["money", "finance", "finances", "financial", "salary", "pay", "rent", "savings", "income", "afford", "budget", "wealth", "rich", "cash"]
};
export const TOPIC_NAMES = {"love": "love and relationships", "work": "work", "money": "money", "general": "life in general"};
export const DECISION_WORDS = ["should", "choose", "choice", "decide", "decision", "whether", "which", "or"];

// Questions the cards should not try to answer. Phrases are matched as whole words in the lower-cased question;
// the first category that matches wins, in this order.
export const SENSITIVE = {
"selfharm": ["suicide", "suicidal", "kill myself", "killing myself", "end my life", "ending my life", "self harm", "self-harm", "harm myself", "hurt myself", "hurting myself", "cut myself", "want to die", "wanna die", "better off dead", "no reason to live", "not want to live", "don't want to live", "dont want to live", "do not want to live"],
"health": ["health", "healthy", "ill", "illness", "sick", "sickness", "disease", "cancer", "tumour", "tumor", "pregnant", "pregnancy", "fertility", "diagnosis", "diagnosed", "doctor", "surgery", "symptom", "symptoms", "medication", "medicine", "medical", "hospital", "covid", "infection", "die", "dying", "death", "depression", "depressed", "therapy", "operation", "test results", "baby"],
"legal": ["lawsuit", "sue", "suing", "sued", "court", "lawyer", "solicitor", "attorney", "legal", "illegal", "custody", "visa", "immigration", "police", "arrest", "arrested", "trial", "prison", "jail", "judge", "tribunal", "settlement"],
"money": ["invest", "investing", "investment", "investments", "stock", "stocks", "shares", "crypto", "bitcoin", "trading", "mortgage", "loan", "loans", "debt", "debts", "bankrupt", "bankruptcy", "gamble", "gambling", "lottery", "bet", "betting", "casino", "pension", "buy a house", "sell my house"]
};
