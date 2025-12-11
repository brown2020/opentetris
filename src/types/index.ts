// src/types/index.ts
export type TetrominoType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

export type CellType = TetrominoType | null;

export type Board = CellType[][];

export type GameState = "INITIAL" | "PLAYING" | "PAUSED" | "GAME_OVER";

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
