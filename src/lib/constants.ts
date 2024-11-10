// src/lib/constants.ts
import { TetrominoShapes } from "@/types";

// Board dimensions
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

// Game settings
export const INITIAL_SPEED = 1000; // Base speed in milliseconds
export const LEVEL_SPEED_MULTIPLIER = 50; // Speed increase per level
export const LINES_PER_LEVEL = 10;
export const PREVIEW_PIECES = 3; // Number of next pieces to show

// Scoring system
export const POINTS = {
  SINGLE: 100, // Points for 1 line
  DOUBLE: 300, // Points for 2 lines
  TRIPLE: 500, // Points for 3 lines
  TETRIS: 800, // Points for 4 lines
  SOFT_DROP: 1, // Points per cell for soft drop
  HARD_DROP: 2, // Points per cell for hard drop
} as const;

// Tetromino definitions
export const TETROMINO_SHAPES: TetrominoShapes = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1, 0, 0],
    [1, 1, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  T: [
    [0, 1, 0, 0],
    [1, 1, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  S: [
    [0, 1, 1, 0],
    [1, 1, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  Z: [
    [1, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [1, 0, 0, 0],
    [1, 1, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  L: [
    [0, 0, 1, 0],
    [1, 1, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
} as const;

// Visual styles
export const TETROMINO_COLORS = {
  I: {
    bg: "bg-cyan-500",
    border:
      "border-t-cyan-300 border-l-cyan-300 border-r-cyan-700 border-b-cyan-700",
  },
  O: {
    bg: "bg-yellow-500",
    border:
      "border-t-yellow-300 border-l-yellow-300 border-r-yellow-700 border-b-yellow-700",
  },
  T: {
    bg: "bg-purple-500",
    border:
      "border-t-purple-300 border-l-purple-300 border-r-purple-700 border-b-purple-700",
  },
  S: {
    bg: "bg-green-500",
    border:
      "border-t-green-300 border-l-green-300 border-r-green-700 border-b-green-700",
  },
  Z: {
    bg: "bg-red-500",
    border:
      "border-t-red-300 border-l-red-300 border-r-red-700 border-b-red-700",
  },
  J: {
    bg: "bg-blue-500",
    border:
      "border-t-blue-300 border-l-blue-300 border-r-blue-700 border-b-blue-700",
  },
  L: {
    bg: "bg-orange-500",
    border:
      "border-t-orange-300 border-l-orange-300 border-r-orange-700 border-b-orange-700",
  },
} as const;

// Game speeds
export const SPEEDS = {
  NORMAL: INITIAL_SPEED,
  SOFT_DROP: INITIAL_SPEED / 4,
  HARD_DROP: 0,
} as const;
