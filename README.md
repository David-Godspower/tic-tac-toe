# 🎮 Neon Tic-Tac-Toe

A neon-themed Tic-Tac-Toe game built with HTML, CSS, and vanilla JavaScript. Play against an AI opponent or challenge a friend locally, choose an AI difficulty level, and track your results across games.

## ✨ Features

- **Two game modes**
  - **Vs AI:** Play as X against a computer-controlled O opponent.
  - **Vs Friend:** Take turns with another player on the same device.
- **AI difficulty levels**
  - **Easy:** Mostly random moves with occasional optimal moves.
  - **Medium:** A balance of random and optimal moves.
  - **Impossible:** Uses the minimax algorithm to select the strongest available move.
- **Persistent scoreboard:** Wins for X, wins for O, and draws are saved in `localStorage`.
- **Scoreboard reset:** Clear all saved scores with the reset-score button.
- **Sound effects:** Web Audio API tones provide feedback for moves, wins, and draws.
- **Mute control:** Enable or disable game sounds at any time.
- **Winning highlights:** The winning three-cell combination is animated when a player wins.
- **Confetti celebration:** Successful wins trigger a colorful confetti animation.
- **Responsive neon interface:** The layout is designed for desktop and mobile browsers.

## 🛠️ Built with

- **HTML5** for the game structure and controls
- **CSS3** for the neon theme, responsive layout, animations, and visual effects
- **JavaScript (ES6+)** for game state, player turns, AI logic, scoring, persistence, and audio
- **Minimax algorithm** for the unbeatable AI difficulty
- **Web Audio API** for sound effects
- **Font Awesome** for interface icons
- **Canvas Confetti** for win celebrations

## 🚀 Getting started

### Prerequisites

You only need a modern web browser. No build tools, package manager, or backend server is required.

### Run locally

1. **Clone the repository**

   ```bash
   git clone <https://github.com/david-godspower/tic-tac-toe>
   ```

2. **Open the project directory**

   ```bash
   cd tic-tac-toe
   ```

3. **Launch the game**

   Open `index.html` directly in your browser, or use the **Live Server** extension in VS Code:

   ```text
   Right-click index.html → Open with Live Server
   ```

## 🎯 How to play

1. The game starts in **Vs AI** mode with X as the human player.
2. Select **Easy**, **Medium**, or **Impossible** to change the AI difficulty.
3. Click an empty cell to place your mark.
4. In Vs AI mode, the computer responds automatically as O.
5. Use the **Vs AI / Vs Friend** button to switch game modes.
6. Select **Restart Game** to clear the current board without clearing the scoreboard.
7. Select **Play Again** after a completed round to start another game.
8. Use the trash icon to reset the saved scoreboard.
9. Use the volume icon to mute or restore sound effects.

## 🧠 Game logic

The board contains nine cells and checks all eight possible winning combinations:

- Three rows
- Three columns
- Two diagonals

The Impossible AI evaluates possible future moves with minimax. It scores outcomes for both players and chooses the move that maximizes the AI's result while minimizing the opponent's advantage.

## 💾 Score persistence

Scores are stored in the browser's local storage under the key `tttScores`:

```json
{
  "x": 0,
  "o": 0,
  "tie": 0
}
```

Clearing browser storage or using a different browser/device will reset the scoreboard.

## 📁 Project structure

```text
tic-tac-toe/
├── index.html    # Game markup, controls, scoreboard, and footer
├── styles.css    # Neon theme, layout, responsive styles, and animations
├── script.js     # Game state, AI, scoring, audio, and event handling
├── LICENSE       # MIT license
└── README.md     # Project documentation
```

## 👤 Author

**David Godspower Ajala**

- [Portfolio](http://davidgodspowerajala.me/)
- [LinkedIn](https://www.linkedin.com/in/david-godspower-ajala/)
- [Facebook](https://facebook.com/DavidGodspowerAjalaDGA/)
- [Twitter/X](https://x.com/DavidGAjala)
- [Email](mailto:ajaladavid11@gmail.com)

## 📄 License

This project is available under the [MIT License](LICENSE).
