# OpenTetris

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, performant, open-source implementation of the classic Tetris game built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4. This project provides a clean, educational codebase for learning game development with modern web technologies.

![OpenTetris Screenshot](https://via.placeholder.com/800x500?text=OpenTetris+Screenshot)

## ✨ Features

### 🎮 Classic Tetris Gameplay

- **7 Standard Tetrominoes** - I, O, T, S, Z, J, L pieces with authentic colors
- **Super Rotation System (SRS)** - Professional wall kick implementation
- **Ghost Piece** - Preview where your piece will land
- **Hold Piece** - Store a piece for later use
- **Next Pieces Preview** - See the upcoming 3 pieces (7-bag randomizer)
- **Hard Drop & Soft Drop** - Full control over piece placement

### 🏆 Scoring & Progression

- **Level System** - Speed increases every 10 lines
- **Combo Scoring** - Single, Double, Triple, and Tetris bonuses
- **High Score Persistence** - Saved to localStorage automatically
- **Drop Bonuses** - Points for soft drops and hard drops

### 📱 Cross-Platform

- **Responsive Design** - Works on desktop and mobile
- **Touch Controls** - On-screen buttons for mobile devices
- **Keyboard Support** - Full keyboard controls with WASD alternative

### ⚡ Performance

- **React 19** - Latest React with improved rendering
- **useReducer Architecture** - Single source of truth, no stale closures
- **Derived State** - Ghost piece computed via `useMemo`, not stored
- **Pre-computed Classes** - Cell styling optimized at module level
- **SSR Compatible** - Proper hydration handling for Next.js

## 🎯 Controls

### Keyboard

| Key       | Action       |
| --------- | ------------ |
| `←` / `A` | Move left    |
| `→` / `D` | Move right   |
| `↓` / `S` | Soft drop    |
| `↑` / `W` | Rotate       |
| `Space`   | Hard drop    |
| `C`       | Hold piece   |
| `P`       | Pause/Resume |
| `R`       | Reset game   |

### Mobile

Touch controls appear automatically on mobile devices with on-screen directional buttons.

## 🛠️ Tech Stack

| Category   | Technology                                    | Version |
| ---------- | --------------------------------------------- | ------- |
| Framework  | [Next.js](https://nextjs.org/)                | 16.x    |
| UI Library | [React](https://react.dev/)                   | 19.x    |
| Language   | [TypeScript](https://www.typescriptlang.org/) | 5.x     |
| Styling    | [Tailwind CSS](https://tailwindcss.com/)      | 4.x     |
| Icons      | [Lucide React](https://lucide.dev/)           | 0.561.x |
| Variants   | [CVA](https://cva.style/)                     | 0.7.x   |

**Only 5 runtime dependencies** - Keeping the bundle lean and fast.

## 🚀 Quick Start

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/brown2020/opentetris.git
cd opentetris

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Create optimized build
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
opentetris/
├── src/
│   ├── app/
│   │   ├── globals.css       # Tailwind v4 styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Main page (Server Component)
│   │
│   ├── components/
│   │   ├── tetris/           # Game components
│   │   │   ├── Board.tsx     # 10x20 game board with ghost piece
│   │   │   ├── Cell.tsx      # Individual cell with pre-computed styles
│   │   │   ├── Controls.tsx  # Pause/Reset + mobile touch controls
│   │   │   ├── GameOver.tsx  # Game over overlay
│   │   │   ├── HoldPiece.tsx # Hold piece display
│   │   │   ├── NextPiece.tsx # Next pieces queue
│   │   │   ├── Score.tsx     # Score, level, lines display
│   │   │   ├── TetrisGame.tsx    # Main game container (Client Component)
│   │   │   └── TetrominoPreview.tsx  # Reusable piece preview
│   │   │
│   │   └── ui/
│   │       └── Button.tsx    # CVA-styled button component
│   │
│   ├── hooks/
│   │   ├── useInterval.ts    # setInterval hook with cleanup
│   │   ├── useIsMobile.ts    # Responsive breakpoint detection
│   │   ├── useKeyboard.ts    # Keyboard event handling
│   │   └── useTetris.ts      # Main game logic (useReducer)
│   │
│   ├── lib/
│   │   ├── constants.ts      # Game constants, tetromino shapes/colors
│   │   └── utils.ts          # Pure functions: rotation, collision, scoring
│   │
│   └── types/
│       └── index.ts          # TypeScript type definitions
│
├── public/                   # Static assets
├── package.json
├── tsconfig.json
├── next.config.ts
└── postcss.config.mjs
```

## 🎮 Game Mechanics

### Scoring System

| Lines Cleared | Base Points | At Level 5 |
| ------------- | ----------- | ---------- |
| Single (1)    | 100         | 500        |
| Double (2)    | 300         | 1,500      |
| Triple (3)    | 500         | 2,500      |
| Tetris (4)    | 800         | 4,000      |

**Drop Bonuses:**

- Soft Drop: 1 point per cell
- Hard Drop: 2 points per cell

### Level Progression

- Level increases every 10 lines cleared
- Drop speed: `1000ms - (level - 1) × 50ms` (minimum 100ms)
- All line clear points multiplied by current level

### 7-Bag Randomizer

Pieces are drawn from shuffled bags of all 7 tetrominoes, ensuring fair distribution and preventing long droughts of specific pieces.

### Super Rotation System (SRS)

Professional wall kick tables for both standard pieces and I-piece, allowing rotations near walls and in tight spaces.

## 🏗️ Architecture

### State Management

The game uses a single `useReducer` hook (`useTetris.ts`) for all game state:

```typescript
type TetrisAction =
  | { type: "INIT"; highScore: number }
  | { type: "RESET_GAME" }
  | { type: "MOVE_PIECE"; dx: number; dy: number }
  | { type: "ROTATE_PIECE" }
  | { type: "HARD_DROP" }
  | { type: "SOFT_DROP" }
  | { type: "HOLD_PIECE" }
  | { type: "TOGGLE_PAUSE" }
  | { type: "TICK" };
```

### Key Design Decisions

1. **Single Source of Truth** - All game state in one reducer, no cross-hook dependencies
2. **Derived State** - Ghost piece calculated via `useMemo`, not stored
3. **SSR Safety** - Deterministic initial state, random initialization deferred to client
4. **Pre-computed Styles** - Cell classes computed at module level, not per render
5. **DRY Reducer** - Shared `lockAndSpawnNext` helper eliminates code duplication
6. **Minimal Dependencies** - Only 5 runtime dependencies for a lean bundle

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines

- Follow existing code style (TypeScript strict mode)
- Use functional components with hooks
- Prefer `useReducer` for complex state
- Add types for all props and state
- Test on both desktop and mobile

### Ideas for Contributions

- [ ] Sound effects and music
- [ ] Multiplayer mode
- [ ] Leaderboard with backend
- [ ] Custom themes/skins
- [ ] T-spin detection and scoring
- [ ] Replay system
- [ ] PWA support for offline play

## 📜 Scripts

| Command         | Description                             |
| --------------- | --------------------------------------- |
| `npm run dev`   | Start development server with Turbopack |
| `npm run build` | Create production build                 |
| `npm start`     | Start production server                 |
| `npm run lint`  | Run ESLint                              |

## 📞 Support

- **GitHub Issues**: [Open an issue](https://github.com/brown2020/opentetris/issues)
- **Email**: info@ignitechannel.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Original Tetris® designed by Alexey Pajitnov
- [Next.js](https://nextjs.org/) team for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Lucide](https://lucide.dev/) for beautiful icons
- All contributors and the open source community

---

<p align="center">
  <a href="https://opentetris.vercel.app">Live Demo</a> •
  <a href="https://github.com/brown2020/opentetris/issues">Report Bug</a> •
  <a href="https://github.com/brown2020/opentetris/issues">Request Feature</a>
</p>
