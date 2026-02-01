// src/types/index.ts
export type TetrominoType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

export type CellType = TetrominoType | null;

export type Board = CellType[][];

export type GameState = "INITIAL" | "PLAYING" | "PAUSED" | "GAME_OVER" | "LINE_CLEAR";

export interface Position {
  x: number;
  y: number;
}

export type TetrominoShape = readonly (readonly number[])[];

export interface Tetromino {
  type: TetrominoType;
  shape: number[][]; // Mutable shape for piece manipulation
  position: Position;
  rotation: number;
}

export type TetrominoShapes = {
  readonly [K in TetrominoType]: TetrominoShape;
};

export interface TetrominoColor {
  bg: string;
  border: string;
}

// ============================================================================
// Game Settings & Configuration
// ============================================================================

export type GameMode = "classic" | "modern";
export type ScoringSystem = "nes" | "modern";
export type ColorTheme = "nes" | "gameboy" | "modern";
export type RotationSystem = "nes" | "srs";
export type RandomizerType = "nes" | "7bag";

export interface GameSettings {
  mode: GameMode;
  ghostPiece: boolean;
  holdPiece: boolean;
  nextPieceCount: 1 | 3;
  scoringSystem: ScoringSystem;
  colorTheme: ColorTheme;
  rotationSystem: RotationSystem;
  randomizer: RandomizerType;
  startingLevel: number;
}

export const DEFAULT_CLASSIC_SETTINGS: GameSettings = {
  mode: "classic",
  ghostPiece: false,
  holdPiece: false,
  nextPieceCount: 1,
  scoringSystem: "nes",
  colorTheme: "nes",
  rotationSystem: "nes",
  randomizer: "nes",
  startingLevel: 0,
};

export const DEFAULT_MODERN_SETTINGS: GameSettings = {
  mode: "modern",
  ghostPiece: true,
  holdPiece: true,
  nextPieceCount: 3,
  scoringSystem: "modern",
  colorTheme: "modern",
  rotationSystem: "srs",
  randomizer: "7bag",
  startingLevel: 1,
};

// ============================================================================
// Line Clear Animation
// ============================================================================

export interface LineClearAnimation {
  rows: number[];
  frame: number; // 0-7 for 4 flashes (on/off cycles)
  isComplete: boolean;
}

// ============================================================================
// Statistics
// ============================================================================

export type PieceStatistics = Record<TetrominoType, number>;

export const INITIAL_STATISTICS: PieceStatistics = {
  I: 0,
  O: 0,
  T: 0,
  S: 0,
  Z: 0,
  J: 0,
  L: 0,
};

// ============================================================================
// NES Color Palette Types
// ============================================================================

export interface NESPalette {
  color1: string;
  color2: string;
  color3: string;
}

// Which palette color each piece uses (1, 2, or 3)
export type PieceColorSlot = 1 | 2 | 3;
