// What each position of each spread means, and the sentence frames that weave a card into it (plain JSON; read by
// web/texts.py). Celtic Cross roles paraphrase Waite, The Pictorial Key to the Tarot, Part III §7. Three cards: the
// common past/present/future convention. Four cards: this site reads the original page's four-card draw in order, as
// a short story (opening, development, turn, outcome); that reading is this site's convention, not Waite's.
// Placeholders: {card}/{Card} the card's name mid-sentence/at the start, {meaning} its gloss (reading_cards.js).
// Per position: short (how the threads refer to it), time (past/present/future/none), key (gets the topic sentence).
export const POSITIONS = {
"single": [
 {"short": "the card", "time": "present", "key": true, "frames": {
  "traditional": ["The single card drawn is {card}, and it answers for the whole matter: {meaning}.", "One card speaks for the whole question, {card}, signifying {meaning}."],
  "modern": ["Your one card is {card}: {meaning}. With a single card there is no story to follow, just a theme to sit with.", "{Card} answers on its own: {meaning}.", "One card, so it carries everything: {card}, which speaks of {meaning}."],
  "brief": ["{Card}: {meaning}."]}}
],
"three": [
 {"short": "the past", "time": "past", "key": false, "frames": {
  "traditional": ["In the place of the past lies {card}, signifying {meaning}. This is what has shaped the matter so far.", "The first card, for what has gone before, is {card}: {meaning}."],
  "modern": ["Behind you is {card}: {meaning}. That is the ground this question grew out of.", "Looking back, {card} shows {meaning}.", "The past card is {card}, {meaning}, and some of it is still with you."],
  "brief": ["Past: {card}, {meaning}."]}},
 {"short": "the present", "time": "present", "key": true, "frames": {
  "traditional": ["In the place of the present stands {card}, signifying {meaning}. This is the matter as it stands now.", "The second card, for the present, is {card}: {meaning}."],
  "modern": ["Right now the card is {card}: {meaning}.", "At the centre of things today is {card}, {meaning}.", "The present card is {card}: {meaning}. This is where the energy is."],
  "brief": ["Present: {card}, {meaning}."]}},
 {"short": "the future", "time": "future", "key": true, "frames": {
  "traditional": ["In the place of what is to come lies {card}, signifying {meaning}. If matters continue as they are, this is where they tend.", "The third card, for the future, is {card}: {meaning}."],
  "modern": ["Ahead lies {card}: {meaning}. Read it as where things are heading if nothing changes, not as fixed fate.", "The future card is {card}, {meaning}.", "Looking ahead, {card} suggests {meaning}."],
  "brief": ["Future: {card}, {meaning}."]}}
],
"four": [
 {"short": "the opening", "time": "past", "key": false, "frames": {
  "traditional": ["The first card opens the matter: {card}, signifying {meaning}.", "The reading begins with {card}: {meaning}."],
  "modern": ["The story opens with {card}: {meaning}.", "First comes {card}, setting the scene with {meaning}."],
  "brief": ["Opening: {card}, {meaning}."]}},
 {"short": "the development", "time": "present", "key": true, "frames": {
  "traditional": ["The second card shows how the matter develops: {card}, signifying {meaning}.", "Next comes {card}: {meaning}."],
  "modern": ["Then it develops through {card}: {meaning}.", "The second card, {card}, shows what is building: {meaning}."],
  "brief": ["Then: {card}, {meaning}."]}},
 {"short": "the turn", "time": "present", "key": false, "frames": {
  "traditional": ["The third card is the turn of the matter: {card}, signifying {meaning}.", "At the turning point lies {card}: {meaning}."],
  "modern": ["The turn in the story is {card}: {meaning}.", "Something shifts with {card}, which brings {meaning}."],
  "brief": ["The turn: {card}, {meaning}."]}},
 {"short": "the outcome", "time": "future", "key": true, "frames": {
  "traditional": ["The fourth card shows where it leads: {card}, signifying {meaning}.", "The matter comes at last to {card}: {meaning}."],
  "modern": ["It ends, for now, with {card}: {meaning}.", "Where it leads is {card}: {meaning}."],
  "brief": ["Where it leads: {card}, {meaning}."]}}
],
"celtic": [
 {"short": "the covering card", "time": "present", "key": true, "frames": {
  "traditional": ["This covers the Querent: {card}. It gives the influence at work in the matter generally, the atmosphere in which the other currents move, and here that is {meaning}.", "The first card, which covers the Querent, is {card}, showing the atmosphere of the whole affair: {meaning}."],
  "modern": ["Covering you is {card}. This is the atmosphere around the whole question, the weather everything else happens in: {meaning}.", "The first card sets the scene. {Card} covers you, so the climate of this matter is {meaning}.", "{Card} lies over you as the general influence: {meaning}."],
  "brief": ["Covers you: {card}, {meaning}."]}},
 {"short": "the crossing card", "time": "present", "key": false, "frames": {
  "traditional": ["This crosses the Querent: {card}, showing the nature of the obstacles in the matter, which is {meaning}.", "Across the first card lies {card}, the opposing force: {meaning}."],
  "modern": ["Across it lies {card}, the challenge: {meaning}.", "What crosses you is {card}. The obstacle takes the shape of {meaning}.", "The crossing card, {card}, names what is in the way: {meaning}."],
  "brief": ["Crosses you: {card}, {meaning}."]}},
 {"short": "the crown", "time": "none", "key": false, "frames": {
  "traditional": ["This crowns the Querent: {card}. It is the aim or ideal in the matter, the best that can be arrived at but not yet made actual, which here is {meaning}.", "Above the Querent lies {card}, the ideal not yet made actual: {meaning}."],
  "modern": ["Crowning the cross is {card}: {meaning}. This is what you are aiming for, or the best this situation can become, though it is not real yet.", "The crown card is {card}. Think of it as the ideal within reach: {meaning}."],
  "brief": ["Crowns you: {card}, {meaning}."]}},
 {"short": "the foundation", "time": "past", "key": false, "frames": {
  "traditional": ["This is beneath the Querent: {card}, the foundation of the matter, that which has already passed into actuality and been made the Querent's own: {meaning}.", "Beneath the Querent lies {card}, the basis of the affair: {meaning}."],
  "modern": ["Beneath it all lies {card}: {meaning}. This is the foundation, something already real and already yours.", "At the root of the question is {card}, {meaning}."],
  "brief": ["Beneath you: {card}, {meaning}."]}},
 {"short": "the passing influence", "time": "past", "key": false, "frames": {
  "traditional": ["This is behind the Querent: {card}, an influence just passed or now passing away, namely {meaning}.", "Behind the Querent lies {card}: {meaning}, whose influence is now departing."],
  "modern": ["Behind you, and fading, is {card}: {meaning}.", "{Card} is the influence that is just passing: {meaning}. Its hold is loosening."],
  "brief": ["Behind you: {card}, {meaning}."]}},
 {"short": "the coming influence", "time": "future", "key": false, "frames": {
  "traditional": ["This is before the Querent: {card}, the influence coming into action which will operate in the near future, namely {meaning}.", "Before the Querent lies {card}: {meaning}, soon to come into play."],
  "modern": ["Ahead of you, coming into play soon, is {card}: {meaning}.", "The next influence to arrive is {card}, {meaning}."],
  "brief": ["Before you: {card}, {meaning}."]}},
 {"short": "the self", "time": "present", "key": false, "frames": {
  "traditional": ["The seventh card signifies the Querent and shows the Querent's position or attitude in the circumstances: {card}, {meaning}.", "For the Querent's own attitude there falls {card}: {meaning}."],
  "modern": ["This card is you, and how you stand in all this: {card}, {meaning}.", "Your own attitude shows as {card}: {meaning}."],
  "brief": ["You: {card}, {meaning}."]}},
 {"short": "the house", "time": "present", "key": false, "frames": {
  "traditional": ["The eighth card is the Querent's house, the surroundings and the tendencies at work in them, the influence of friends and position in life: {card}, {meaning}.", "In the place of the house falls {card}: {meaning}."],
  "modern": ["Your surroundings, the people and pressures around you, show as {card}: {meaning}.", "The house card, for the world around you, is {card}: {meaning}."],
  "brief": ["Around you: {card}, {meaning}."]}},
 {"short": "the hopes and fears", "time": "none", "key": false, "frames": {
  "traditional": ["The ninth card gives the Querent's hopes or fears in the matter: {card}, {meaning}.", "For hopes or fears there falls {card}: {meaning}."],
  "modern": ["Your hopes, or fears, appear as {card}: {meaning}. Often the two are the same thing seen from different sides.", "What you hope for, or dread, is {card}: {meaning}."],
  "brief": ["Hopes or fears: {card}, {meaning}."]}},
 {"short": "the outcome", "time": "future", "key": true, "frames": {
  "traditional": ["The tenth card is what will come, the culmination brought about by all the influences on the table: {card}, {meaning}.", "What will come is {card}, the final result of the matter: {meaning}."],
  "modern": ["What will come, the culmination of everything else on the table, is {card}: {meaning}.", "The last card, the outcome, is {card}: {meaning}. It gathers up the rest of the spread."],
  "brief": ["What will come: {card}, {meaning}."]}}
]
};

// Future positions when the question is one the cards should not forecast (health, legal, money decisions).
export const REFLECT = {
"traditional": ["In the place of {short} lies {card}. The cards cannot forecast such a matter, so let it stand as a subject for reflection only: {meaning}."],
"modern": ["In the place of {short} is {card}. This is not a question the cards can forecast, so take it as something to think about, not a prediction: {meaning}."],
"brief": ["{Short}: {card}, {meaning} (for reflection, not a forecast)."]
};

// Extra sentences for particular positions, chosen by what lands there.
export const EXTRAS = {
"cross_kind": {"traditional": "Since it is a favourable card, the opposing forces will not be serious, or else something good in itself is not productive of good in this particular case.", "modern": "Because this is a kindly card, the obstacle is either mild or something good in itself that just isn't helping here.", "brief": "A mild obstacle."},
"hope": {"traditional": "So bright a card is to be read as a hope.", "modern": "With a card this bright, it is probably a hope.", "brief": "More hope than fear."},
"fear": {"traditional": "So heavy a card is to be read as a fear.", "modern": "With a card this heavy, it reads more like a fear.", "brief": "More fear than hope."},
"outcome_major": {"traditional": "It is a Trump Major, and Waite bids the Diviner give the final card, above all others, the closest attention.", "modern": "It is a Major Arcana card, so give it extra weight: Waite says the reader should concentrate above all on this last card.", "brief": "A trump: give it extra weight."},
"outcome_court": {"traditional": "Being a court card, it shows, as Waite says, that the matter falls at last into the hands of the person it represents, and its end depends mainly on that person.", "modern": "It is a court card, and Waite says that then the matter ends up in the hands of the person it stands for: how it ends depends mainly on them.", "brief": "A court card: someone else decides."}
};
