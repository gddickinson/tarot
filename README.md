# Tarot Reading

A web-based tarot card reading application with multiple deck options and card interpretations.

## Live Demo

Experience it now: [https://gddickinson.github.io/tarot/](https://gddickinson.github.io/tarot/)

## Features

This Tarot Reading web application offers:

- Three classic tarot deck designs to choose from:
  - Rider-Waite
  - Marseilles
  - Colman-Smith
- Intuitive card drawing interface
- Random card orientation (upright or inverted)
- Beautifully designed card backs unique to each deck
- Animated and visually appealing interface
- Four-card reading spread

## How to Use

### Getting Started

1. **Select a Deck**: Choose your preferred tarot deck style from the dropdown menu
2. **Shuffle Deck**: Click the "Shuffle Deck" button to begin your reading
3. **Draw Cards**: Click the red "Draw" button to reveal each card in your reading
4. **Interpret**: Read the card names and meanings as they appear
5. **New Reading**: Once complete, you can start a new reading with the same or a different deck

### Card Interpretation

The application displays:
- The card's name (e.g., "The Fool", "Queen of Cups")
- The card's suit (Major Arcana, Wands, Pentacles, Cups, or Swords)
- The card's orientation (upright or inverted)

## Technical Details

### Deck Structure

The application includes all 78 cards of a traditional tarot deck:
- 22 Major Arcana cards (from The Fool to The World)
- 56 Minor Arcana cards across four suits:
  - Wands (associated with creativity and passion)
  - Pentacles (associated with material aspects and wealth)
  - Cups (associated with emotions and relationships)
  - Swords (associated with intellect and conflict)

Each Minor Arcana suit contains:
- Number cards (Ace through 10)
- Court cards (Page, Knight, Queen, King)

### Card Display

Each card features:
- A top label with the card name
- A visual representation of the card from the selected deck
- A bottom label (inverted when the card is drawn reversed)
- Custom styling based on the card's suit

### Design Elements

The application incorporates:
- Animated background in the header
- Custom-designed card backs for each deck option
- Card rotation for inverted readings
- Visual arrangement of cards in a linear spread
- Responsive design elements

## Project Structure

```
tarot/
├── index.html          # Main HTML document
├── style.css           # CSS styling and animations
├── script.js           # JavaScript functionality
├── README.md           # Project documentation
└── [Deck Folders]/     # Card image directories
    ├── Rider_Waite/    # Rider-Waite deck images
    ├── Marseilles/     # Marseilles deck images
    └── Colman-Smith/   # Colman-Smith deck images
```

## Code Implementation

The application uses:
- Vanilla JavaScript for card logic and interactions
- CSS for styling and animations
- Dynamic image loading based on deck selection
- Array manipulation for deck shuffling
- Random number generation for card inversion
- DOM manipulation for displaying cards and messages

## Browser Compatibility

This application works best in modern browsers that support:
- CSS animations and transforms
- ES6 JavaScript features
- Modern CSS styling properties

## Future Enhancements

Potential improvements for future versions:
- Card meaning interpretations
- Additional deck options
- Different spread layouts (Celtic Cross, Three-Card, etc.)
- Save and share reading results
- Detailed card descriptions and history
- Search functionality for specific cards
- Custom background options

## Contributing

Contributions to the Tarot Reading application are welcome! Feel free to submit pull requests or open issues with suggestions for improvements.

## License

This project is available under an open source license.

## Credits

Developed by G.D. Dickinson

---

*Tarot Reading - Explore the mystical world of tarot with multiple decks and intuitive readings*
