# SpellBloc - Kids Word Game 🎮

A simple, engaging word game app for kids aged 4-7 that teaches spelling and pronunciation of basic words.

## Features ✨

- **4 Categories**: Animals, Fruits, Colors, and Objects
- **8 words per category** (3-5 letter words)
- **Audio pronunciation** using Web Speech API
- **Drag-and-drop/tap gameplay** for letter arrangement
- **Progress tracking** with stars and levels
- **Responsive design** - works on phones, tablets, and computers
- **No ads** - safe for children
- **Parental controls** - volume settings
- **Colorful animations** and sound effects

## How to Play 🎯

1. **Choose a Category**: Select from Animals, Fruits, Colors, or Objects
2. **See & Hear**: View the emoji and tap "Hear Word" to listen
3. **Spell It**: Tap the scrambled letters below to spell the word correctly
4. **Earn Stars**: Get 3 stars for each correct answer
5. **Level Up**: Earn 10 stars to advance to the next level

## Installation 🚀

Simply open `index.html` in any modern web browser:
- Chrome, Firefox, Safari, Edge (desktop)
- Mobile browsers on iOS and Android

No installation or server required!

## File Structure 📁

```
game2/
├── index.html      # Main HTML structure
├── styles.css      # Colorful, responsive styling
├── game.js         # Game logic and interactivity
└── README.md       # This file
```

## Customization 🎨

### Adding More Words

Edit `game.js` and add words to the `wordData` object:

```javascript
const wordData = {
    animals: [
        { word: 'cat', emoji: '🐱' },
        { word: 'elephant', emoji: '🐘' }, // Add new word
    ],
    // Add new category
    vehicles: [
        { word: 'car', emoji: '🚗' },
        { word: 'bus', emoji: '🚌' },
    ]
};
```

### Changing Colors

Edit `styles.css` to customize the color scheme:
- Background gradients
- Button colors
- Text colors

### Audio Assets (Optional Enhancement)

The game currently uses:
- **Web Speech API** for word pronunciation (built-in, no files needed)
- **Web Audio API** for sound effects (synthesized, no files needed)

To add custom audio files:
1. Create an `audio/` folder
2. Add MP3 files (e.g., `cat.mp3`, `success.mp3`)
3. Update `game.js` to use `new Audio('audio/cat.mp3').play()`

### Image Assets (Optional Enhancement)

Currently using emojis (no image files needed). To add custom images:
1. Create an `images/` folder
2. Add PNG/JPG files (e.g., `cat.png`)
3. Update `game.js`:
   ```javascript
   wordImage.innerHTML = `<img src="images/${wordObj.word}.png" alt="${wordObj.word}">`;
   ```

## Free Asset Sources 🎨

If you want to replace emojis with custom graphics:

- **Images**: 
  - [Freepik](https://www.freepik.com) - Free cartoon illustrations
  - [Flaticon](https://www.flaticon.com) - Free icons
  - [OpenGameArt](https://opengameart.org) - Free game assets

- **Audio**:
  - [Freesound](https://freesound.org) - Free sound effects
  - [Zapsplat](https://www.zapsplat.com) - Free sound effects
  - Record your own voice for word pronunciation

## Browser Compatibility 🌐

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Educational Value 📚

This game helps children:
- Learn spelling of basic words
- Improve letter recognition
- Develop fine motor skills (tapping/dragging)
- Build vocabulary
- Practice pronunciation
- Gain confidence through positive reinforcement

## Parental Controls 👨‍👩‍👧‍👦

- **Volume Control**: Tap the ⚙️ icon to adjust sound
- **Progress Tracking**: Stars and levels saved in browser
- **No External Links**: Completely self-contained
- **No Ads**: Safe, distraction-free environment

## Technical Details 💻

- **Pure HTML5/CSS3/JavaScript** - no frameworks
- **LocalStorage** for progress persistence
- **Responsive Grid Layout** for all screen sizes
- **Touch-optimized** for mobile devices
- **Accessible** with large buttons and clear visuals

## Future Enhancements 🚀

Ideas for expansion:
- More categories (numbers, shapes, body parts)
- Difficulty levels (longer words)
- Daily challenges
- Multiplayer mode
- Achievement badges
- Parent dashboard
- Multiple language support

## License 📄

Free to use and modify for educational purposes.

## Support 💬

For issues or questions, check that:
1. You're using a modern browser
2. JavaScript is enabled
3. Browser supports Web Speech API (for audio)

Enjoy learning! 🎉
