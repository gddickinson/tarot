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

The three image folders were added in December 2017 (commits b5117a2 "initial upload", 9c2feca "add
decks", e45e45a "add Colman-Smith"). Their source was not recorded in the repository. What could be
established on 2026-11-11:

### `Rider_Waite/` (78 cards + `thesun.jpg`)
The pictures are Pamela Colman Smith's designs for the Rider-Waite deck (published by William Rider & Son,
1909), with the captions of that deck ("THE FOOL.", "KNIGHT of CUPS."). The 1909 deck is in the public domain
in the United States (published before 1930) and, Smith having died in 1951, in life + 70 countries since
2022. The file names (`ar00.jpg` ... and the removed duplicates `cuac.jpg`, `cupa.jpg`, `cukn.jpg`,
`cuqu.jpg`, `cuki.jpg`) follow the naming of the card scans on sacred-texts.com
(https://sacred-texts.com/tarot/), which publishes its scans as public domain in the US; that is the likely
origin, but the files could not be compared byte for byte (the site refuses automated downloads), so this is
not confirmed. A specific scan or restoration can carry its own claims in some countries; none is recorded here.

### `Marseilles/` (78 cards)
A coloured Tarot de Marseille with French captions ("LE MAT", "CAVALIER DE COUPE", "LA FORCE"); the files carry
Adobe Photoshop 7.0 metadata dated 2005-12-14 and no author or copyright field. **Source and licence not
established.** The Tarot de Marseille pattern itself is centuries old, but this particular drawing or
restoration may be a modern work with its own copyright.

### `Colman-Smith/` (78 cards)
Brightly recoloured versions of the Rider-Waite designs with added captions ("O THE FOOL", "KNIGHT CUPS").
**Source and licence not established.** The underlying designs are Smith's (public domain as above), but the
recolouring is a later work whose author and terms are unknown.

## Card backs
The three card-back patterns (`static/style_app.css`, `.back-0/1/2`) are the CSS gradients of the original
2017 page.
