// src/lib/utils.ts
import { Board, Tetromino, TetrominoType } from "@/types";
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  TETROMINO_SHAPES,
  TETROMINO_TYPES,
  INITIAL_SPEED,
  LEVEL_SPEED_MULTIPLIER,
  LINES_PER_LEVEL,
  POINTS,
} from "@/lib/constants";

// Game board creation
export function createEmptyBoard(): Board {
  return Array(BOARD_HEIGHT)
    .fill(null)
    .map(() => Array(BOARD_WIDTH).fill(null));
}

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
        case 1: // 90° clockwise
          rotated[j][N - 1 - i] = shape[i][j];
          break;
        case 2: // 180°
          rotated[N - 1 - i][N - 1 - j] = shape[i][j];
          break;
        case 3: // 270° clockwise (90° counter-clockwise)
          rotated[N - 1 - j][i] = shape[i][j];
          break;
      }
    }
  }

  return rotated;
}

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

// 7-bag generator for fair piece distribution
export function generateBag(): TetrominoType[] {
  const bag = [...TETROMINO_TYPES];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

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

// Clear completed lines and return new board and number of lines cleared
export function clearLines(board: Board): {
  newBoard: Board;
  linesCleared: number;
} {
  let linesCleared = 0;
  const newBoard = board.reduce((acc, row) => {
    if (row.every((cell) => cell !== null)) {
      linesCleared++;
      acc.unshift(Array(BOARD_WIDTH).fill(null));
    } else {
      acc.push([...row]);
    }
    return acc;
  }, [] as Board);

  return { newBoard, linesCleared };
}

// Get ghost piece position
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

// SRS (Super Rotation System) wall kicks - defined at module level for performance
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

// Get wall kicks based on current rotation state
export function getWallKicks(
  piece: Tetromino,
  currentRotation: number
): readonly { x: number; y: number }[] {
  if (piece.type === "O") return O_KICK;

  const kickKey = `${currentRotation}${(currentRotation + 1) % 4}`;
  const kicks = piece.type === "I" ? I_KICKS : STANDARD_KICKS;

  return kicks[kickKey] ?? kicks["01"];
}

// Points map at module level for performance
const LINE_POINTS: Record<number, number> = {
  1: POINTS.SINGLE,
  2: POINTS.DOUBLE,
  3: POINTS.TRIPLE,
  4: POINTS.TETRIS,
};

// Score calculation
export function calculateScore(lines: number, level: number): number {
  return (LINE_POINTS[lines] ?? 0) * level;
}

// Level calculation
export function calculateLevel(lines: number): number {
  return Math.floor(lines / LINES_PER_LEVEL) + 1;
}

// Speed calculation
export function calculateSpeed(level: number): number {
  const minSpeed = 100; // Maximum speed (minimum delay)
  const calculatedSpeed = INITIAL_SPEED - (level - 1) * LEVEL_SPEED_MULTIPLIER;
  return Math.max(calculatedSpeed, minSpeed);
}
