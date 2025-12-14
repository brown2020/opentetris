// src/hooks/useTetris.ts
import { useReducer, useCallback, useMemo, useEffect } from "react";
import { Board, Tetromino, TetrominoType, GameState } from "@/types";
import {
  createEmptyBoard,
  generateNewPiece,
  generateBag,
  isValidMove,
  getGhostPiecePosition,
  getWallKicks,
  addPieceToBoard,
  clearLines,
  calculateScore,
  calculateLevel,
  calculateSpeed,
} from "@/lib/utils";
import { INITIAL_SPEED, PREVIEW_PIECES, POINTS } from "@/lib/constants";

// ============================================================================
// Types
// ============================================================================

interface TetrisState {
  // Board
  board: Board;
  // Piece management
  currentPiece: Tetromino | null;
  nextPieces: TetrominoType[];
  heldPiece: TetrominoType | null;
  canHold: boolean;
  bag: TetrominoType[];
  // Game stats
  score: number;
  level: number;
  lines: number;
  highScore: number;
  // Game status
  gameState: GameState;
  dropSpeed: number;
}

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

// ============================================================================
// Helper Functions
// ============================================================================

const HIGH_SCORE_KEY = "tetris-highscore";

function getStoredHighScore(): number {
  if (typeof window === "undefined") return 0;
  const stored = localStorage.getItem(HIGH_SCORE_KEY);
  return stored ? parseInt(stored, 10) : 0;
}

function saveHighScore(score: number): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(HIGH_SCORE_KEY, String(score));
  }
}

function ensureBag(bag: TetrominoType[]): TetrominoType[] {
  let newBag = [...bag];
  if (newBag.length < PREVIEW_PIECES + 1) {
    newBag.push(...generateBag());
  }
  return newBag;
}

function getNextPiece(bag: TetrominoType[]): {
  piece: Tetromino;
  nextPieces: TetrominoType[];
  newBag: TetrominoType[];
} {
  let newBag = ensureBag(bag);
  const nextType = newBag.shift() as TetrominoType;
  newBag = ensureBag(newBag);
  return {
    piece: generateNewPiece(nextType),
    nextPieces: newBag.slice(0, PREVIEW_PIECES),
    newBag,
  };
}

function lockPieceOnBoard(
  board: Board,
  piece: Tetromino
): { newBoard: Board; linesCleared: number } {
  const boardWithPiece = addPieceToBoard(board, piece);
  return clearLines(boardWithPiece);
}

function tryRotate(piece: Tetromino, board: Board): Tetromino | null {
  const newRotation = (piece.rotation + 1) % 4;
  const rotatedPiece = { ...piece, rotation: newRotation };
  const kicks = getWallKicks(piece, piece.rotation);

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
// Lock & Spawn Helper (DRY - used by MOVE_PIECE/TICK and HARD_DROP)
// ============================================================================

interface LockAndSpawnResult {
  board: Board;
  currentPiece: Tetromino;
  nextPieces: TetrominoType[];
  bag: TetrominoType[];
  score: number;
  lines: number;
  level: number;
  dropSpeed: number;
  highScore: number;
  gameState: GameState;
}

function lockAndSpawnNext(
  state: TetrisState,
  pieceToLock: Tetromino,
  bonusPoints: number = 0
): LockAndSpawnResult {
  const { newBoard, linesCleared } = lockPieceOnBoard(state.board, pieceToLock);
  const newLines = state.lines + linesCleared;
  const newLevel = calculateLevel(newLines);
  const linePoints =
    linesCleared > 0 ? calculateScore(linesCleared, newLevel) : 0;
  const newScore = state.score + bonusPoints + linePoints;

  const { piece: newPiece, nextPieces, newBag } = getNextPiece(state.bag);

  // Check for game over
  const isGameOver = !isValidMove(newPiece, newBoard);
  const finalHighScore = isGameOver
    ? Math.max(newScore, state.highScore)
    : state.highScore;

  if (isGameOver) {
    saveHighScore(finalHighScore);
  }

  return {
    board: newBoard,
    currentPiece: newPiece,
    nextPieces,
    bag: newBag,
    score: newScore,
    lines: newLines,
    level: newLevel,
    dropSpeed: calculateSpeed(newLevel),
    highScore: finalHighScore,
    gameState: isGameOver ? "GAME_OVER" : state.gameState,
  };
}

// ============================================================================
// Initial State
// ============================================================================

// Deterministic initial state for SSR - no random values
function createInitialState(): TetrisState {
  return {
    board: createEmptyBoard(),
    currentPiece: null,
    nextPieces: [],
    heldPiece: null,
    canHold: true,
    bag: [],
    score: 0,
    level: 1,
    lines: 0,
    highScore: 0, // Will be loaded from localStorage on client
    gameState: "INITIAL", // Not playing until client initializes
    dropSpeed: INITIAL_SPEED,
  };
}

// Initialize game with random pieces - only called on client
function initializeGame(highScore: number): TetrisState {
  const initialBag = ensureBag([]);
  const { piece, nextPieces, newBag } = getNextPiece(initialBag);

  return {
    board: createEmptyBoard(),
    currentPiece: piece,
    nextPieces,
    heldPiece: null,
    canHold: true,
    bag: newBag,
    score: 0,
    level: 1,
    lines: 0,
    highScore,
    gameState: "PLAYING",
    dropSpeed: INITIAL_SPEED,
  };
}

// ============================================================================
// Reducer
// ============================================================================

function tetrisReducer(state: TetrisState, action: TetrisAction): TetrisState {
  switch (action.type) {
    case "INIT": {
      return initializeGame(action.highScore);
    }

    case "RESET_GAME": {
      const initialBag = ensureBag([]);
      const { piece, nextPieces, newBag } = getNextPiece(initialBag);
      return {
        ...state,
        board: createEmptyBoard(),
        currentPiece: piece,
        nextPieces,
        heldPiece: null,
        canHold: true,
        bag: newBag,
        score: 0,
        level: 1,
        lines: 0,
        gameState: "PLAYING",
        dropSpeed: INITIAL_SPEED,
      };
    }

    case "TOGGLE_PAUSE": {
      if (state.gameState === "GAME_OVER") return state;
      return {
        ...state,
        gameState: state.gameState === "PLAYING" ? "PAUSED" : "PLAYING",
      };
    }

    case "MOVE_PIECE":
    case "TICK": {
      if (state.gameState !== "PLAYING" || !state.currentPiece) return state;

      const dx = action.type === "TICK" ? 0 : action.dx;
      const dy = action.type === "TICK" ? 1 : action.dy;

      const newPosition = {
        x: state.currentPiece.position.x + dx,
        y: state.currentPiece.position.y + dy,
      };

      const movedPiece = { ...state.currentPiece, position: newPosition };

      if (isValidMove(movedPiece, state.board)) {
        return { ...state, currentPiece: movedPiece };
      }

      // If moving down failed, lock the piece and spawn next
      if (dy > 0) {
        const result = lockAndSpawnNext(state, state.currentPiece);
        return { ...state, ...result, canHold: true };
      }

      return state;
    }

    case "ROTATE_PIECE": {
      if (state.gameState !== "PLAYING" || !state.currentPiece) return state;

      const rotatedPiece = tryRotate(state.currentPiece, state.board);
      if (rotatedPiece) {
        return { ...state, currentPiece: rotatedPiece };
      }
      return state;
    }

    case "SOFT_DROP": {
      if (state.gameState !== "PLAYING" || !state.currentPiece) return state;

      const newPosition = {
        x: state.currentPiece.position.x,
        y: state.currentPiece.position.y + 1,
      };

      const movedPiece = { ...state.currentPiece, position: newPosition };

      if (isValidMove(movedPiece, state.board)) {
        return {
          ...state,
          currentPiece: movedPiece,
          score: state.score + POINTS.SOFT_DROP,
        };
      }

      return state;
    }

    case "HARD_DROP": {
      if (state.gameState !== "PLAYING" || !state.currentPiece) return state;

      const ghost = getGhostPiecePosition(state.currentPiece, state.board);
      const dropDistance = ghost.position.y - state.currentPiece.position.y;
      const dropPoints = dropDistance * POINTS.HARD_DROP;

      const result = lockAndSpawnNext(state, ghost, dropPoints);
      return { ...state, ...result, canHold: true };
    }

    case "HOLD_PIECE": {
      if (
        state.gameState !== "PLAYING" ||
        !state.currentPiece ||
        !state.canHold
      ) {
        return state;
      }

      const pieceToHold = state.currentPiece.type;

      if (state.heldPiece) {
        const newCurrentPiece = generateNewPiece(state.heldPiece);
        return {
          ...state,
          currentPiece: newCurrentPiece,
          heldPiece: pieceToHold,
          canHold: false,
        };
      } else {
        const { piece: newPiece, nextPieces, newBag } = getNextPiece(state.bag);
        return {
          ...state,
          currentPiece: newPiece,
          nextPieces,
          bag: newBag,
          heldPiece: pieceToHold,
          canHold: false,
        };
      }
    }

    default:
      return state;
  }
}

// ============================================================================
// Hook
// ============================================================================

export function useTetris() {
  const [state, dispatch] = useReducer(tetrisReducer, null, createInitialState);

  // Initialize game on client mount (avoids hydration mismatch from Math.random)
  useEffect(() => {
    dispatch({ type: "INIT", highScore: getStoredHighScore() });
  }, []);

  // Derive ghost piece from current piece (no extra state/render)
  const ghostPiece = useMemo(
    () =>
      state.currentPiece
        ? getGhostPiecePosition(state.currentPiece, state.board)
        : null,
    [state.currentPiece, state.board]
  );

  // Stable action creators
  const movePiece = useCallback((dx: number, dy: number) => {
    dispatch({ type: "MOVE_PIECE", dx, dy });
  }, []);

  const rotatePiece = useCallback(() => {
    dispatch({ type: "ROTATE_PIECE" });
  }, []);

  const hardDrop = useCallback(() => {
    dispatch({ type: "HARD_DROP" });
  }, []);

  const softDropStep = useCallback(() => {
    dispatch({ type: "SOFT_DROP" });
  }, []);

  const holdPiece = useCallback(() => {
    dispatch({ type: "HOLD_PIECE" });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: "RESET_GAME" });
  }, []);

  const pauseGame = useCallback(() => {
    dispatch({ type: "TOGGLE_PAUSE" });
  }, []);

  const tick = useCallback(() => {
    dispatch({ type: "TICK" });
  }, []);

  return {
    // State
    board: state.board,
    currentPiece: state.currentPiece,
    ghostPiece,
    nextPieces: state.nextPieces,
    heldPiece: state.heldPiece,
    canHold: state.canHold,
    score: state.score,
    level: state.level,
    lines: state.lines,
    highScore: state.highScore,
    gameState: state.gameState,
    dropSpeed: state.dropSpeed,

    // Actions
    movePiece,
    rotatePiece,
    hardDrop,
    softDropStep,
    holdPiece,
    resetGame,
    pauseGame,
    tick,
  };
}
