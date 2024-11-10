# OpenTetris

A modern, open-source implementation of the classic Tetris game built with Next.js, TypeScript, and Tailwind CSS. This project aims to provide a clean, educational codebase for learning game development with modern web technologies.

## 🎮 Features

- **Classic Tetris Gameplay**

  - Standard seven tetromino pieces (I, O, T, S, Z, J, L)
  - Super Rotation System (SRS)
  - Ghost piece preview
  - Hold piece functionality
  - Next pieces preview
  - Wall kick system

- **Modern Tech Stack**
  - Built with Next.js 14
  - Written in TypeScript
  - Styled with Tailwind CSS
  - Custom React Hooks
  - Mobile-responsive design

## 🎯 Game Controls

- **←/→** : Move piece left/right
- **↓** : Soft drop
- **↑** : Rotate piece
- **Space** : Hard drop
- **C** : Hold piece
- **P** : Pause game
- **R** : Reset game

## 🛠️ Installation

1. Clone the repository:

```bash
git clone https://github.com/brown2020/opentetris.git
cd opentetris
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
opentetris/
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Main page
│   │
│   ├── components/
│   │   ├── tetris/         # Game components
│   │   │   ├── Board.tsx   # Game board
│   │   │   ├── Cell.tsx    # Cell component
│   │   │   ├── Controls.tsx
│   │   │   ├── GameOver.tsx
│   │   │   ├── HoldPiece.tsx
│   │   │   ├── NextPiece.tsx
│   │   │   ├── Score.tsx
│   │   │   └── TetrisGame.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       └── Card.tsx
│   │
│   ├── hooks/
│   │   ├── useGameLogic.ts
│   │   ├── useInterval.ts
│   │   └── useKeyboard.ts
│   │
│   ├── lib/
│   │   ├── constants.ts
│   │   └── utils.ts
│   │
│   └── types/
│       └── index.ts
```

## 🎮 Game Mechanics

### Scoring System

- Single line: 100 × level
- Double line: 300 × level
- Triple line: 500 × level
- Tetris (4 lines): 800 × level
- Soft drop: 1 point per cell
- Hard drop: 2 points per cell

### Level Progression

- Level increases every 10 lines
- Speed increases with each level
- Points multiplied by current level

## 🚀 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support & Questions

For support or questions, please contact:

- Email: info@ignitechannel.com
- GitHub Issues: [Open an issue](https://github.com/brown2020/opentetris/issues)

## 📜 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Original Tetris design by Alexey Pajitnov
- Next.js and React communities
- All contributors and supporters

---

[View Demo](https://github.com/brown2020/opentetris) | [Report Bug](https://github.com/brown2020/opentetris/issues) | [Request Feature](https://github.com/brown2020/opentetris/issues)
