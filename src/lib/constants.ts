// src/lib/constants.ts
import { TetrominoShapes, TetrominoType, NESPalette, PieceColorSlot } from "@/types";

// Board dimensions
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

// Game settings
export const INITIAL_SPEED = 1000; // Base speed in milliseconds
export const LEVEL_SPEED_MULTIPLIER = 50; // Speed increase per level
export const LINES_PER_LEVEL = 10;
export const PREVIEW_PIECES = 3; // Number of next pieces to show (modern mode)

// All tetromino types
export const TETROMINO_TYPES: TetrominoType[] = [
  "I",
  "O",
  "T",
  "S",
  "Z",
  "J",
  "L",
];

// ============================================================================
// Scoring Systems
// ============================================================================

// Modern scoring (Guideline-inspired)
export const MODERN_POINTS = {
  SINGLE: 100,
  DOUBLE: 300,
  TRIPLE: 500,
  TETRIS: 800,
  SOFT_DROP: 1,
  HARD_DROP: 2,
} as const;

// NES Tetris scoring (base points, multiplied by level+1)
export const NES_POINTS = {
  SINGLE: 40,
  DOUBLE: 100,
  TRIPLE: 300,
  TETRIS: 1200,
  SOFT_DROP: 0, // NES had no soft drop points
  HARD_DROP: 0, // NES had no hard drop
} as const;

// Default points (for backwards compatibility)
export const POINTS = MODERN_POINTS;

// ============================================================================
// NES Gravity / Speed Table
// ============================================================================

// NES Tetris uses frame-based gravity, converted to milliseconds (60fps)
// Level -> milliseconds per drop
export const NES_GRAVITY_TABLE: Record<number, number> = {
  0: 800,  // 48 frames
  1: 717,  // 43 frames
  2: 633,  // 38 frames
  3: 550,  // 33 frames
  4: 467,  // 28 frames
  5: 383,  // 23 frames
  6: 300,  // 18 frames
  7: 217,  // 13 frames
  8: 133,  // 8 frames
  9: 100,  // 6 frames
  10: 83,  // 5 frames
  11: 83,
  12: 83,
  13: 67,  // 4 frames
  14: 67,
  15: 67,
  16: 50,  // 3 frames
  17: 50,
  18: 50,
};

// Level 19-28: 2 frames = 33ms
export const NES_GRAVITY_FAST = 33;
// Level 29+ (killscreen): 1 frame = 17ms
export const NES_GRAVITY_KILLSCREEN = 17;

// ============================================================================
// DAS (Delayed Auto Shift) Settings
// ============================================================================

export const DAS_SETTINGS = {
  // NES Tetris DAS timing
  NES: {
    initialDelay: 267, // ~16 frames at 60fps
    repeatRate: 100,   // ~6 frames at 60fps
  },
  // Modern/faster DAS
  MODERN: {
    initialDelay: 170,
    repeatRate: 50,
  },
} as const;

// ============================================================================
// Line Clear Animation
// ============================================================================

export const LINE_CLEAR_ANIMATION = {
  totalFrames: 8,      // 4 on/off cycles
  frameDelay: 50,      // ms per frame (~400ms total)
} as const;

// ============================================================================
// Tetromino Shapes
// ============================================================================

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

// ============================================================================
// Modern Color Scheme (Guideline colors)
// ============================================================================

export const TETROMINO_COLORS: Record<
  TetrominoType,
  { bg: string; border: string }
> = {
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

// ============================================================================
// NES Color Palettes (level-based, cycles every 10 levels)
// ============================================================================

export const NES_LEVEL_PALETTES: Record<number, NESPalette> = {
  0: { color1: "#0000FC", color2: "#0078F8", color3: "#3CBCFC" }, // Blue
  1: { color1: "#00A800", color2: "#00E800", color3: "#B8F8B8" }, // Green
  2: { color1: "#B800FC", color2: "#D800CC", color3: "#F8B8F8" }, // Purple/Pink
  3: { color1: "#0058F8", color2: "#00B800", color3: "#58F858" }, // Blue/Green
  4: { color1: "#E45C10", color2: "#00A844", color3: "#58F898" }, // Orange/Teal
  5: { color1: "#00B800", color2: "#6844FC", color3: "#A878FC" }, // Green/Purple
  6: { color1: "#F83800", color2: "#7C7C7C", color3: "#BCBCBC" }, // Red/Gray
  7: { color1: "#6844FC", color2: "#A800A8", color3: "#F878F8" }, // Purple/Magenta
  8: { color1: "#0058F8", color2: "#F83800", color3: "#F87858" }, // Blue/Red
  9: { color1: "#F83800", color2: "#E45C10", color3: "#FCA044" }, // Red/Orange
};

// Which palette slot each piece uses in NES mode
export const NES_PIECE_COLOR_SLOTS: Record<TetrominoType, PieceColorSlot> = {
  T: 1,
  J: 1,
  Z: 1,
  O: 2,
  S: 2,
  L: 2,
  I: 3,
};

// ============================================================================
// Game Boy Color Palette (monochrome green)
// ============================================================================

export const GAMEBOY_PALETTE = {
  lightest: "#9BBC0F",
  light: "#8BAC0F",
  dark: "#306230",
  darkest: "#0F380F",
} as const;

// Game Boy piece color mapping (4 shades)
export const GAMEBOY_PIECE_COLORS: Record<TetrominoType, keyof typeof GAMEBOY_PALETTE> = {
  I: "lightest",
  O: "light",
  T: "light",
  S: "dark",
  Z: "dark",
  J: "lightest",
  L: "lightest",
};
