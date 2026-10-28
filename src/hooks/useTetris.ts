// src/hooks/useTetris.ts
import { useReducer, useCallback, useMemo, useEffect } from "react";
import {
  Board,
  Tetromino,
  TetrominoType,
  GameState,
  GameSettings,
  PieceStatistics,
  LineClearAnimation,
  DEFAULT_MODERN_SETTINGS,
  INITIAL_STATISTICS,
} from "@/types";
import {
  createEmptyBoard,
  generateNewPiece,
  generateBag,
  generateNESRandom,
  isValidMove,
  getGhostPiecePosition,
  addPieceToBoard,
  findCompletedLines,
  clearSpecificLines,
  calculateScore,
  calculateLevel,
  calculateSpeed,
  getDropPoints,
  tryRotate,
} from "@/lib/utils";
import { LINE_CLEAR_ANIMATION } from "@/lib/constants";
import {
  parseHighScore,
  persistHighScore,
  persistSettings,
  readHighScore,
  readSettings,
  sanitizeSettings,
  HIGH_SCORE_KEY,
} from "@/lib/storage";

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
  lastPieceType: TetrominoType | null; // For NES random
  // Game stats
  score: number;
  level: number;
  lines: number;
  highScore: number;
  statistics: PieceStatistics;
  // Game status
  gameState: GameState;
  dropSpeed: number;
  // Line clear animation
  lineClearAnimation: LineClearAnimation | null;
  // Settings
  settings: GameSettings;
}

type TetrisAction =
  | { type: "INIT"; highScore: number; settings?: GameSettings }
  | { type: "RESET_GAME" }
  | { type: "UPDATE_SETTINGS"; settings: Partial<GameSettings> }
  | { type: "MOVE_PIECE"; dx: number; dy: number }
  | { type: "ROTATE_PIECE" }
  | { type: "HARD_DROP" }
  | { type: "SOFT_DROP" }
  | { type: "HOLD_PIECE" }
  | { type: "TOGGLE_PAUSE" }
  | { type: "TICK" }
  | { type: "LINE_CLEAR_TICK" }
  | { type: "SYNC_HIGH_SCORE"; highScore: number };

// ============================================================================
// Helper Functions
// ============================================================================

function safeHighScore(score: number): number {
  if (!Number.isFinite(score) || score < 0) return 0;
  return Math.floor(score);
}

function ensureBag(bag: TetrominoType[], previewCount: number): TetrominoType[] {
  const newBag = [...bag];
  if (newBag.length < previewCount + 1) {
    newBag.push(...generateBag());
  }
  return newBag;
}

function getNextPieceModern(
  bag: TetrominoType[],
  previewCount: number
): {
  piece: Tetromino;
  nextPieces: TetrominoType[];
  newBag: TetrominoType[];
} {
  let newBag = ensureBag(bag, previewCount);
  const nextType = newBag.shift() as TetrominoType;
  newBag = ensureBag(newBag, previewCount);
  return {
    piece: generateNewPiece(nextType),
    nextPieces: newBag.slice(0, previewCount),
    newBag,
  };
}

// Spawn the already queued NES piece and roll exactly one new preview from it.
function spawnQueuedNES(state: TetrisState): {
  piece: Tetromino;
  nextPieces: TetrominoType[];
  lastPieceType: TetrominoType;
} {
  const queued = state.nextPieces[0] ?? generateNESRandom(state.lastPieceType);
  return {
    piece: generateNewPiece(queued),
    nextPieces: [generateNESRandom(queued)],
    lastPieceType: queued,
  };
}

function updateStatistics(
  stats: PieceStatistics,
  pieceType: TetrominoType
): PieceStatistics {
  return {
    ...stats,
    [pieceType]: stats[pieceType] + 1,
  };
}

// ============================================================================
// Lock & Spawn Helper
// ============================================================================

interface LockAndSpawnResult {
  board: Board;
  currentPiece: Tetromino | null;
  nextPieces: TetrominoType[];
  bag: TetrominoType[];
  lastPieceType: TetrominoType | null;
  score: number;
  lines: number;
  level: number;
  dropSpeed: number;
  highScore: number;
  gameState: GameState;
  lineClearAnimation: LineClearAnimation | null;
  statistics: PieceStatistics;
}

function lockAndSpawnNext(
  state: TetrisState,
  pieceToLock: Tetromino,
  bonusPoints: number = 0
): LockAndSpawnResult {
  const boardWithPiece = addPieceToBoard(state.board, pieceToLock);
  const clearedRows = findCompletedLines(boardWithPiece);
  const linesCleared = clearedRows.length;

  // If lines are cleared and we're in classic mode, start animation
  if (linesCleared > 0 && state.settings.mode === "classic") {
    return {
      board: boardWithPiece,
      currentPiece: null,
      nextPieces: state.nextPieces,
      bag: state.bag,
      lastPieceType: pieceToLock.type,
      score: state.score + bonusPoints,
      lines: state.lines,
      level: state.level,
      dropSpeed: state.dropSpeed,
      highScore: state.highScore,
      gameState: "LINE_CLEAR",
      lineClearAnimation: {
        rows: clearedRows,
        frame: 0,
        isComplete: false,
      },
      statistics: state.statistics,
    };
  }

  // Immediately clear lines (modern mode or no lines to clear)
  const newBoard = linesCleared > 0
    ? clearSpecificLines(boardWithPiece, clearedRows)
    : boardWithPiece;

  const newLines = state.lines + linesCleared;
  const newLevel = calculateLevel(
    newLines,
    state.settings.startingLevel,
    state.settings.mode === "classic"
  );
  const linePoints = linesCleared > 0
    ? calculateScore(linesCleared, newLevel, state.settings.scoringSystem)
    : 0;
  const newScore = state.score + bonusPoints + linePoints;

  // Get next piece based on randomizer type
  let newPiece: Tetromino;
  let newNextPieces: TetrominoType[];
  let newBag: TetrominoType[];
  let newLastPieceType: TetrominoType | null;

  if (state.settings.randomizer === "nes") {
    const result = spawnQueuedNES(state);
    newPiece = result.piece;
    newNextPieces = result.nextPieces;
    newBag = state.bag;
    newLastPieceType = result.lastPieceType;
  } else {
    const result = getNextPieceModern(state.bag, state.settings.nextPieceCount);
    newPiece = result.piece;
    newNextPieces = result.nextPieces;
    newBag = result.newBag;
    newLastPieceType = newPiece.type;
  }

  // Update statistics
  const newStatistics = updateStatistics(state.statistics, newPiece.type);

  // Check for game over
  const isGameOver = !isValidMove(newPiece, newBoard);
  const finalHighScore = isGameOver
    ? Math.max(safeHighScore(newScore), safeHighScore(state.highScore))
    : state.highScore;

  return {
    board: newBoard,
    currentPiece: newPiece,
    nextPieces: newNextPieces,
    bag: newBag,
    lastPieceType: newLastPieceType,
    score: newScore,
    lines: newLines,
    level: newLevel,
    dropSpeed: calculateSpeed(newLevel, state.settings.scoringSystem),
    highScore: finalHighScore,
    gameState: isGameOver ? "GAME_OVER" : state.gameState,
    lineClearAnimation: null,
    statistics: newStatistics,
  };
}

// ============================================================================
// Initial State
// ============================================================================

export function createInitialState(): TetrisState {
  return {
    board: createEmptyBoard(),
    currentPiece: null,
    nextPieces: [],
    heldPiece: null,
    canHold: true,
    bag: [],
    lastPieceType: null,
    score: 0,
    level: 1,
    lines: 0,
    highScore: 0,
    statistics: { ...INITIAL_STATISTICS },
    gameState: "INITIAL",
    dropSpeed: 1000,
    lineClearAnimation: null,
    settings: DEFAULT_MODERN_SETTINGS,
  };
}

function initializeGame(highScore: number, settings: GameSettings): TetrisState {
  let piece: Tetromino;
  let nextPieces: TetrominoType[];
  let bag: TetrominoType[];
  let lastPieceType: TetrominoType | null;

  if (settings.randomizer === "nes") {
    const first = generateNESRandom(null);
    const next = generateNESRandom(first);
    piece = generateNewPiece(first);
    nextPieces = [next];
    bag = [];
    lastPieceType = first;
  } else {
    const initialBag = ensureBag([], settings.nextPieceCount);
    const result = getNextPieceModern(initialBag, settings.nextPieceCount);
    piece = result.piece;
    nextPieces = result.nextPieces;
    bag = result.newBag;
    lastPieceType = piece.type;
  }

  const initialStats = updateStatistics({ ...INITIAL_STATISTICS }, piece.type);
  const startingLevel = settings.startingLevel;
  const dropSpeed = calculateSpeed(startingLevel, settings.scoringSystem);

  return {
    board: createEmptyBoard(),
    currentPiece: piece,
    nextPieces,
    heldPiece: null,
    canHold: true,
    bag,
    lastPieceType,
    score: 0,
    level: startingLevel,
    lines: 0,
    highScore,
    statistics: initialStats,
    gameState: "PLAYING",
    dropSpeed,
    lineClearAnimation: null,
    settings,
  };
}

// ============================================================================
// Reducer
// ============================================================================

export function tetrisReducer(state: TetrisState, action: TetrisAction): TetrisState {
  switch (action.type) {
    case "INIT": {
      const settings = sanitizeSettings(action.settings ?? DEFAULT_MODERN_SETTINGS);
      return initializeGame(safeHighScore(action.highScore), settings);
    }

    case "RESET_GAME": {
      return initializeGame(state.highScore, state.settings);
    }

    case "SYNC_HIGH_SCORE": {
      const incoming = safeHighScore(action.highScore);
      if (incoming <= state.highScore) return state;
      return { ...state, highScore: incoming };
    }

    case "UPDATE_SETTINGS": {
      const newSettings = sanitizeSettings({ ...state.settings, ...action.settings });

      const modeChanged = newSettings.mode !== state.settings.mode;
      // A mode preset starts a new round. Starting level applies immediately.
      if (
        modeChanged ||
        state.gameState === "INITIAL" ||
        state.gameState === "GAME_OVER"
      ) {
        return initializeGame(state.highScore, newSettings);
      }

      const level = calculateLevel(
        state.lines,
        newSettings.startingLevel,
        newSettings.mode === "classic"
      );
      return {
        ...state,
        settings: newSettings,
        level,
        dropSpeed: calculateSpeed(level, newSettings.scoringSystem),
      };
    }

    case "TOGGLE_PAUSE": {
      if (state.gameState === "GAME_OVER" || state.gameState === "LINE_CLEAR") {
        return state;
      }
      return {
        ...state,
        gameState: state.gameState === "PLAYING" ? "PAUSED" : "PLAYING",
      };
    }

    case "LINE_CLEAR_TICK": {
      if (!state.lineClearAnimation || state.gameState !== "LINE_CLEAR") {
        return state;
      }

      const newFrame = state.lineClearAnimation.frame + 1;

      if (newFrame >= LINE_CLEAR_ANIMATION.totalFrames) {
        // Animation complete - now clear the lines and spawn next piece
        const newBoard = clearSpecificLines(state.board, state.lineClearAnimation.rows);
        const linesCleared = state.lineClearAnimation.rows.length;
        const newLines = state.lines + linesCleared;
        const newLevel = calculateLevel(
          newLines,
          state.settings.startingLevel,
          state.settings.mode === "classic"
        );
        const linePoints = calculateScore(linesCleared, newLevel, state.settings.scoringSystem);
        const newScore = state.score + linePoints;

        // Get next piece
        let newPiece: Tetromino;
        let newNextPieces: TetrominoType[];
        let newBag: TetrominoType[];
        let newLastPieceType: TetrominoType | null;

        if (state.settings.randomizer === "nes") {
          const result = spawnQueuedNES(state);
          newPiece = result.piece;
          newNextPieces = result.nextPieces;
          newBag = state.bag;
          newLastPieceType = result.lastPieceType;
        } else {
          const result = getNextPieceModern(state.bag, state.settings.nextPieceCount);
          newPiece = result.piece;
          newNextPieces = result.nextPieces;
          newBag = result.newBag;
          newLastPieceType = newPiece.type;
        }

        const newStatistics = updateStatistics(state.statistics, newPiece.type);
        const isGameOver = !isValidMove(newPiece, newBoard);
        const finalHighScore = isGameOver
          ? Math.max(safeHighScore(newScore), safeHighScore(state.highScore))
          : state.highScore;

        return {
          ...state,
          board: newBoard,
          currentPiece: newPiece,
          nextPieces: newNextPieces,
          bag: newBag,
          lastPieceType: newLastPieceType,
          score: newScore,
          lines: newLines,
          level: newLevel,
          dropSpeed: calculateSpeed(newLevel, state.settings.scoringSystem),
          highScore: finalHighScore,
          gameState: isGameOver ? "GAME_OVER" : "PLAYING",
          lineClearAnimation: null,
          statistics: newStatistics,
          canHold: true,
        };
      }

      return {
        ...state,
        lineClearAnimation: {
          ...state.lineClearAnimation,
          frame: newFrame,
        },
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

      const rotatedPiece = tryRotate(
        state.currentPiece,
        state.board,
        state.settings.rotationSystem
      );
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
        const dropPoints = getDropPoints("soft", 1, state.settings.scoringSystem);
        return {
          ...state,
          currentPiece: movedPiece,
          score: state.score + dropPoints,
        };
      }

      return state;
    }

    case "HARD_DROP": {
      if (state.gameState !== "PLAYING" || !state.currentPiece) return state;

      // In classic/NES mode, hard drop just does a soft drop (no instant drop)
      if (state.settings.mode === "classic") {
        const newPosition = {
          x: state.currentPiece.position.x,
          y: state.currentPiece.position.y + 1,
        };
        const movedPiece = { ...state.currentPiece, position: newPosition };

        if (isValidMove(movedPiece, state.board)) {
          return { ...state, currentPiece: movedPiece };
        }
        return state;
      }

      const ghost = getGhostPiecePosition(state.currentPiece, state.board);
      const dropDistance = ghost.position.y - state.currentPiece.position.y;
      const dropPoints = getDropPoints("hard", dropDistance, state.settings.scoringSystem);

      const result = lockAndSpawnNext(state, ghost, dropPoints);
      return { ...state, ...result, canHold: true };
    }

    case "HOLD_PIECE": {
      if (
        state.gameState !== "PLAYING" ||
        !state.currentPiece ||
        !state.canHold ||
        !state.settings.holdPiece
      ) {
        return state;
      }

      const pieceToHold = state.currentPiece.type;

      if (state.heldPiece) {
        const newCurrentPiece = generateNewPiece(state.heldPiece);
        if (!isValidMove(newCurrentPiece, state.board)) return state;
        return {
          ...state,
          currentPiece: newCurrentPiece,
          heldPiece: pieceToHold,
          canHold: false,
        };
      } else {
        let newPiece: Tetromino;
        let newNextPieces: TetrominoType[];
        let newBag: TetrominoType[];
        let newLastPieceType = state.lastPieceType;

        if (state.settings.randomizer === "nes") {
          const result = spawnQueuedNES(state);
          newPiece = result.piece;
          newNextPieces = result.nextPieces;
          newBag = state.bag;
          newLastPieceType = result.lastPieceType;
        } else {
          const result = getNextPieceModern(state.bag, state.settings.nextPieceCount);
          newPiece = result.piece;
          newNextPieces = result.nextPieces;
          newBag = result.newBag;
          newLastPieceType = newPiece.type;
        }

        if (!isValidMove(newPiece, state.board)) return state;

        return {
          ...state,
          currentPiece: newPiece,
          nextPieces: newNextPieces,
          bag: newBag,
          lastPieceType: newLastPieceType,
          heldPiece: pieceToHold,
          canHold: false,
          statistics: updateStatistics(state.statistics, newPiece.type),
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

  // Initialize game on client mount. Storage stays out of the reducer.
  useEffect(() => {
    dispatch({
      type: "INIT",
      highScore: readHighScore(),
      settings: readSettings(),
    });
  }, []);

  useEffect(() => {
    if (state.gameState === "INITIAL") return;
    persistSettings(state.settings);
  }, [state.gameState, state.settings]);

  useEffect(() => {
    if (state.gameState !== "GAME_OVER") return;
    const saved = persistHighScore(state.highScore);
    if (saved > state.highScore) {
      dispatch({ type: "SYNC_HIGH_SCORE", highScore: saved });
    }
  }, [state.gameState, state.highScore]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== HIGH_SCORE_KEY) return;
      dispatch({ type: "SYNC_HIGH_SCORE", highScore: parseHighScore(event.newValue) });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Derive ghost piece from current piece (only if ghost is enabled)
  const ghostPiece = useMemo(() => {
    if (!state.currentPiece || !state.settings.ghostPiece) return null;
    return getGhostPiecePosition(state.currentPiece, state.board);
  }, [state.currentPiece, state.board, state.settings.ghostPiece]);

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

  const lineClearTick = useCallback(() => {
    dispatch({ type: "LINE_CLEAR_TICK" });
  }, []);

  const updateSettings = useCallback((settings: Partial<GameSettings>) => {
    dispatch({ type: "UPDATE_SETTINGS", settings });
  }, []);

  return {
    // State
    board: state.board,
    currentPiece: state.currentPiece,
    ghostPiece,
    nextPieces: state.nextPieces,
    heldPiece: state.heldPiece,
    canHold: state.canHold && state.settings.holdPiece,
    score: state.score,
    level: state.level,
    lines: state.lines,
    highScore: state.highScore,
    gameState: state.gameState,
    dropSpeed: state.dropSpeed,
    settings: state.settings,
    statistics: state.statistics,
    lineClearAnimation: state.lineClearAnimation,

    // Actions
    movePiece,
    rotatePiece,
    hardDrop,
    softDropStep,
    holdPiece,
    resetGame,
    pauseGame,
    tick,
    lineClearTick,
    updateSettings,
  };
}
