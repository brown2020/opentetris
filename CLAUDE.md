# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## Project Overview

OpenTetris is a modern, performant Tetris implementation built with Next.js 16, React 19, TypeScript 5, and Tailwind CSS 4. The project emphasizes clean architecture, minimal dependencies (only 5 runtime deps), and SSR compatibility.

## Common Commands

```bash
# Development
npm run dev          # Start dev server at localhost:3000

# Production
npm run build        # Create optimized production build
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## Architecture

### State Management
- **Single useReducer pattern** in `src/hooks/useTetris.ts` manages all game state
- Actions: INIT, RESET_GAME, MOVE_PIECE, ROTATE_PIECE, HARD_DROP, SOFT_DROP, HOLD_PIECE, TOGGLE_PAUSE, TICK
- Ghost piece is derived state computed via `useMemo`, not stored in state
- Uses `lockAndSpawnNext` helper to avoid code duplication in reducer

### Directory Structure
```
src/
├── app/              # Next.js App Router (layout.tsx, page.tsx, globals.css)
├── components/
│   ├── tetris/       # Game components (Board, Cell, Controls, TetrisGame, etc.)
│   └── ui/           # Reusable UI components (Button with CVA)
├── hooks/            # Custom hooks (useTetris, useInterval, useKeyboard, useIsMobile)
├── lib/              # Pure functions and constants
│   ├── constants.ts  # Tetromino shapes, colors, wall kick tables
│   └── utils.ts      # Collision detection, rotation, scoring functions
└── types/            # TypeScript type definitions
```

### Key Design Patterns
- **Server/Client Component separation**: `page.tsx` is a Server Component, `TetrisGame.tsx` is the Client Component boundary
- **Pre-computed styles**: Cell classes computed at module level in `Cell.tsx` for performance
- **SSR safety**: Deterministic initial state, random piece initialization deferred to client via useEffect
- **7-bag randomizer**: Ensures fair piece distribution

## Code Style Guidelines

- Use functional components with hooks exclusively
- Prefer `useReducer` for complex state over multiple `useState` calls
- Prefer `useSyncExternalStore` for reading browser/external state (see `useIsMobile.ts`)
- Add TypeScript types for all props, state, and function parameters
- Follow existing patterns in the codebase (strict TypeScript mode)
- Test changes on both desktop and mobile (touch controls)
- ESLint 9 flat config in `eslint.config.mjs` (uses eslint-config-next)

## Game Logic Reference

- **Board**: 10 columns x 20 rows
- **Scoring**: Single=100, Double=300, Triple=500, Tetris=800 (multiplied by level)
- **Drop speed**: `1000ms - (level - 1) * 50ms` (min 100ms)
- **Level up**: Every 10 lines cleared
- **Rotation**: Super Rotation System (SRS) with wall kicks
