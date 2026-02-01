// src/lib/utils.ts
import { Board, Tetromino, TetrominoType, ScoringSystem, ColorTheme, RotationSystem } from "@/types";
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  TETROMINO_SHAPES,
  TETROMINO_TYPES,
  INITIAL_SPEED,
  LEVEL_SPEED_MULTIPLIER,
  LINES_PER_LEVEL,
  MODERN_POINTS,
  NES_POINTS,
  NES_GRAVITY_TABLE,
  NES_GRAVITY_FAST,
  NES_GRAVITY_KILLSCREEN,
  NES_LEVEL_PALETTES,
  NES_PIECE_COLOR_SLOTS,
  GAMEBOY_PALETTE,
  GAMEBOY_PIECE_COLORS,
} from "@/lib/constants";

// ============================================================================
// Game board creation
// ============================================================================

export function createEmptyBoard(): Board {
  return Array(BOARD_HEIGHT)
    .fill(null)
    .map(() => Array(BOARD_WIDTH).fill(null));
}

// ============================================================================
// Piece Rotation
// ============================================================================

// Get rotated shape for a piece - direct calculation without iteration
export function getRotatedShape(piece: Tetromino): number[][] {
  const shape = piece.shape;
  const N = shape.length;
  const rotation = piece.rotation % 4;

  // No rotation needed
  if (rotation === 0) {
    return shape.map((row) => [...row]);
  }

  const rotated: number[][] = Array(N)
    .fill(0)
    .map(() => Array(N).fill(0));

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      switch (rotation) {
        case 1: // 90 clockwise
          rotated[j][N - 1 - i] = shape[i][j];
          break;
        case 2: // 180
          rotated[N - 1 - i][N - 1 - j] = shape[i][j];
          break;
        case 3: // 270 clockwise (90 counter-clockwise)
          rotated[N - 1 - j][i] = shape[i][j];
          break;
      }
    }
  }

  return rotated;
}

// ============================================================================
// Piece Generation
// ============================================================================

// Generate new tetromino piece
export function generateNewPiece(type?: TetrominoType): Tetromino {
  const randomType =
    type || TETROMINO_TYPES[Math.floor(Math.random() * TETROMINO_TYPES.length)];

  // Create a deep copy of the shape
  const shape = TETROMINO_SHAPES[randomType].map((row) => [...row]);

  return {
    type: randomType,
    shape,
    position: {
      x: Math.floor((BOARD_WIDTH - shape[0].length) / 2),
      y: 0,
    },
    rotation: 0,
  };
}

// 7-bag generator for fair piece distribution (modern mode)
export function generateBag(): TetrominoType[] {
  const bag = [...TETROMINO_TYPES];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

// NES-style random piece generator (biased - rerolls once if same as previous)
export function generateNESRandom(previousPiece: TetrominoType | null): TetrominoType {
  let piece = TETROMINO_TYPES[Math.floor(Math.random() * TETROMINO_TYPES.length)];

  // NES rerolls once if same as previous piece
  if (piece === previousPiece) {
    piece = TETROMINO_TYPES[Math.floor(Math.random() * TETROMINO_TYPES.length)];
  }

  return piece;
}

// ============================================================================
// Collision Detection
// ============================================================================

// Check if move is valid
export function isValidMove(piece: Tetromino, board: Board): boolean {
  const shape = getRotatedShape(piece);

  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const boardX = piece.position.x + x;
        const boardY = piece.position.y + y;

        if (
          boardX < 0 ||
          boardX >= BOARD_WIDTH ||
          boardY >= BOARD_HEIGHT ||
          (boardY >= 0 && board[boardY][boardX])
        ) {
          return false;
        }
      }
    }
  }
  return true;
}

// ============================================================================
// Board Operations
// ============================================================================

// Add piece to board
export function addPieceToBoard(board: Board, piece: Tetromino): Board {
  const newBoard = board.map((row) => [...row]);
  const shape = getRotatedShape(piece);

  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const boardY = piece.position.y + y;
        const boardX = piece.position.x + x;

        if (boardY >= 0 && boardY < BOARD_HEIGHT) {
          newBoard[boardY][boardX] = piece.type;
        }
      }
    }
  }

  return newBoard;
}

// Find completed lines (returns row indices)
export function findCompletedLines(board: Board): number[] {
  const completedRows: number[] = [];

  for (let row = 0; row < board.length; row++) {
    if (board[row].every((cell) => cell !== null)) {
      completedRows.push(row);
    }
  }

  return completedRows;
}

// Clear specific rows from board
export function clearSpecificLines(board: Board, rowsToClear: number[]): Board {
  if (rowsToClear.length === 0) return board;

  const rowSet = new Set(rowsToClear);
  const newBoard: Board = [];

  // Add empty rows at the top for each cleared line
  for (let i = 0; i < rowsToClear.length; i++) {
    newBoard.push(Array(BOARD_WIDTH).fill(null));
  }

  // Add remaining rows
  for (let row = 0; row < board.length; row++) {
    if (!rowSet.has(row)) {
      newBoard.push([...board[row]]);
    }
  }

  return newBoard;
}

// Clear completed lines and return new board and number of lines cleared
export function clearLines(board: Board): {
  newBoard: Board;
  linesCleared: number;
  clearedRows: number[];
} {
  const clearedRows = findCompletedLines(board);
  const linesCleared = clearedRows.length;

  if (linesCleared === 0) {
    return { newBoard: board, linesCleared: 0, clearedRows: [] };
  }

  const newBoard = clearSpecificLines(board, clearedRows);
  return { newBoard, linesCleared, clearedRows };
}

// ============================================================================
// Ghost Piece
// ============================================================================

export function getGhostPiecePosition(
  piece: Tetromino,
  board: Board
): Tetromino {
  const ghost = {
    ...piece,
    position: { ...piece.position },
  };

  while (
    isValidMove(
      {
        ...ghost,
        position: { ...ghost.position, y: ghost.position.y + 1 },
      },
      board
    )
  ) {
    ghost.position.y++;
  }

  return ghost;
}

// ============================================================================
// SRS (Super Rotation System) Wall Kicks
// ============================================================================

type KickTable = Record<string, readonly { x: number; y: number }[]>;

const STANDARD_KICKS: KickTable = {
  "01": [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: -1, y: -1 },
    { x: 0, y: 2 },
    { x: -1, y: 2 },
  ],
  "12": [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: -2 },
    { x: 1, y: -2 },
  ],
  "23": [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: -1 },
    { x: 0, y: 2 },
    { x: 1, y: 2 },
  ],
  "30": [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: -1, y: 1 },
    { x: 0, y: -2 },
    { x: -1, y: -2 },
  ],
} as const;

const I_KICKS: KickTable = {
  "01": [
    { x: 0, y: 0 },
    { x: -2, y: 0 },
    { x: 1, y: 0 },
    { x: -2, y: 1 },
    { x: 1, y: -2 },
  ],
  "12": [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: 2, y: 0 },
    { x: -1, y: -2 },
    { x: 2, y: 1 },
  ],
  "23": [
    { x: 0, y: 0 },
    { x: 2, y: 0 },
    { x: -1, y: 0 },
    { x: 2, y: -1 },
    { x: -1, y: 2 },
  ],
  "30": [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: -2, y: 0 },
    { x: 1, y: 2 },
    { x: -2, y: -1 },
  ],
} as const;

const O_KICK = [{ x: 0, y: 0 }] as const;
const NO_KICK = [{ x: 0, y: 0 }] as const;

// Get wall kicks based on current rotation state (SRS)
export function getWallKicks(
  piece: Tetromino,
  currentRotation: number
): readonly { x: number; y: number }[] {
  if (piece.type === "O") return O_KICK;

  const kickKey = `${currentRotation}${(currentRotation + 1) % 4}`;
  const kicks = piece.type === "I" ? I_KICKS : STANDARD_KICKS;

  return kicks[kickKey] ?? kicks["01"];
}

// NES rotation - no wall kicks, just basic rotation check
export function getNESWallKicks(): readonly { x: number; y: number }[] {
  return NO_KICK;
}

// Try to rotate with appropriate wall kick system
export function tryRotate(
  piece: Tetromino,
  board: Board,
  rotationSystem: RotationSystem = "srs"
): Tetromino | null {
  const newRotation = (piece.rotation + 1) % 4;
  const rotatedPiece = { ...piece, rotation: newRotation };

  const kicks = rotationSystem === "srs"
    ? getWallKicks(piece, piece.rotation)
    : getNESWallKicks();

  for (const kick of kicks) {
    const kickedPiece = {
      ...rotatedPiece,
      position: {
        x: rotatedPiece.position.x + kick.x,
        y: rotatedPiece.position.y + kick.y,
      },
    };

    if (isValidMove(kickedPiece, board)) {
      return kickedPiece;
    }
  }

  return null;
}

// ============================================================================
// Scoring
// ============================================================================

// Points map for line clears
const MODERN_LINE_POINTS: Record<number, number> = {
  1: MODERN_POINTS.SINGLE,
  2: MODERN_POINTS.DOUBLE,
  3: MODERN_POINTS.TRIPLE,
  4: MODERN_POINTS.TETRIS,
};

const NES_LINE_POINTS: Record<number, number> = {
  1: NES_POINTS.SINGLE,
  2: NES_POINTS.DOUBLE,
  3: NES_POINTS.TRIPLE,
  4: NES_POINTS.TETRIS,
};

// Score calculation with scoring system support
export function calculateScore(
  lines: number,
  level: number,
  scoringSystem: ScoringSystem = "modern"
): number {
  if (scoringSystem === "nes") {
    // NES: base points * (level + 1)
    const basePoints = NES_LINE_POINTS[lines] ?? 0;
    return basePoints * (level + 1);
  }

  // Modern: base points * level
  const basePoints = MODERN_LINE_POINTS[lines] ?? 0;
  return basePoints * Math.max(level, 1);
}

// Get drop points based on scoring system
export function getDropPoints(
  dropType: "soft" | "hard",
  distance: number,
  scoringSystem: ScoringSystem = "modern"
): number {
  if (scoringSystem === "nes") {
    // NES had no drop bonuses
    return 0;
  }

  const pointsPerCell = dropType === "hard"
    ? MODERN_POINTS.HARD_DROP
    : MODERN_POINTS.SOFT_DROP;

  return distance * pointsPerCell;
}

// ============================================================================
// Level & Speed
// ============================================================================

// Level calculation based on lines cleared
export function calculateLevel(lines: number, startingLevel: number = 1): number {
  return Math.floor(lines / LINES_PER_LEVEL) + startingLevel;
}

// Modern speed calculation (linear decrease)
export function calculateModernSpeed(level: number): number {
  const minSpeed = 100; // Maximum speed (minimum delay)
  const calculatedSpeed = INITIAL_SPEED - (level - 1) * LEVEL_SPEED_MULTIPLIER;
  return Math.max(calculatedSpeed, minSpeed);
}

// NES speed calculation (lookup table)
export function calculateNESSpeed(level: number): number {
  // Check lookup table first
  if (level in NES_GRAVITY_TABLE) {
    return NES_GRAVITY_TABLE[level];
  }

  // Level 19-28: fast speed
  if (level >= 19 && level <= 28) {
    return NES_GRAVITY_FAST;
  }

  // Level 29+: killscreen speed
  return NES_GRAVITY_KILLSCREEN;
}

// Speed calculation with mode support
export function calculateSpeed(
  level: number,
  scoringSystem: ScoringSystem = "modern"
): number {
  if (scoringSystem === "nes") {
    return calculateNESSpeed(level);
  }
  return calculateModernSpeed(level);
}

// ============================================================================
// Color Helpers
// ============================================================================

// Get the color for a piece based on theme and level
export function getPieceColor(
  pieceType: TetrominoType,
  level: number,
  theme: ColorTheme
): string {
  if (theme === "nes") {
    const paletteIndex = level % 10;
    const palette = NES_LEVEL_PALETTES[paletteIndex];
    const slot = NES_PIECE_COLOR_SLOTS[pieceType];

    switch (slot) {
      case 1: return palette.color1;
      case 2: return palette.color2;
      case 3: return palette.color3;
    }
  }

  if (theme === "gameboy") {
    const shade = GAMEBOY_PIECE_COLORS[pieceType];
    return GAMEBOY_PALETTE[shade];
  }

  // Modern theme returns empty - use Tailwind classes instead
  return "";
}

// Get lighter shade for 3D effect
export function getLighterColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const lighten = (c: number) => Math.min(255, c + 60);

  return `#${lighten(r).toString(16).padStart(2, '0')}${lighten(g).toString(16).padStart(2, '0')}${lighten(b).toString(16).padStart(2, '0')}`;
}

// Get darker shade for 3D effect
export function getDarkerColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const darken = (c: number) => Math.max(0, c - 60);

  return `#${darken(r).toString(16).padStart(2, '0')}${darken(g).toString(16).padStart(2, '0')}${darken(b).toString(16).padStart(2, '0')}`;
}
