# Third-party content

The code in this repository is MIT-licensed (see `LICENSE`). The card pictures and the card texts are not
George's own work; this is what is known about them.

## Card texts: A. E. Waite, *The Pictorial Key to the Tarot* (1910)

`static/waite_pkt.js` holds verbatim extracts (whitespace normalised only) from Arthur Edward Waite,
*The Pictorial Key to the Tarot: Being Fragments of a Secret Tradition under the Veil of Divination*,
illustrated by Pamela Colman Smith (London: W. Rider, 1910; the transcription follows a later printing,
dated 1910/1922 on Wikisource):

- Part II §2, first paragraph on each trump: the description of each major arcanum's picture;
- Part III §2: the description, divinatory meanings and reversed meanings of each minor arcanum;
- Part III §3: the divinatory meanings of the major arcana;
- Part III §4: "Some additional meanings of the Lesser Arcana";
- Part III §5: "The Recurrence of Cards in Dealing";
- Part III §7: the ten positions of "An Ancient Celtic Method of Divination".

Source: the Wikisource transcription, https://en.wikisource.org/wiki/The_Pictorial_Key_to_the_Tarot
(Part 2 and Part 3), fetched 2026-11-11 and extracted with `tools/extract_waite.py`. Wikisource marks the
work `PD-US`: published before 1930, it is in the public domain in the United States. Waite died in 1942 and
Pamela Colman Smith in 1951, so the book is also out of copyright in countries with a life + 70 years term.

One editorial change: the Five of Wands description ends "It is mimic warfare, and hereto correspond the
Divinatory Meanings:"; the site ends that description at "It is mimic warfare." Waite gives no reversed
meaning for the Two of Cups, and the site says so.

The three-card positions (Past, Present, Future) are the common modern convention, not from Waite.

## Card pictures

The cards in `cards/` (78 faces and `back.svg`) are original art made for this repository in November 2026: SVG
drawings produced by `tools/make_deck.mjs` and `tools/deck/*.mjs` from simple shapes, using each card's traditional
symbols (for example The Star: a kneeling figure pouring water under one large and seven small stars) without tracing
or copying the compositions of the Rider-Waite-Smith, Marseille or any other deck. They are covered by the
repository's MIT licence (`LICENSE`), like the code.

`static/deck_desc.js` (what each picture shows) is generated from the same script.

### Earlier images (removed)
From 2017 until November 2026 the site used three scanned decks in `Rider_Waite/`, `Marseilles/` and `Colman-Smith/`
(see the git history). They were removed and are no longer published. What was known about them: the Rider-Waite
pictures were Pamela Colman Smith's 1909 designs (public domain in the US), probably from the sacred-texts.com scans
(file names matched; not byte-verified); the source and licence of the Marseilles and Colman-Smith image sets were
never established.
