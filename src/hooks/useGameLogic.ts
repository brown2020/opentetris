// src/hooks/useGameLogic.ts
import { useState, useCallback, useEffect, useRef } from "react";
import { Board, Tetromino, TetrominoType, GameState } from "@/types";
import { POINTS, PREVIEW_PIECES, INITIAL_SPEED } from "@/lib/constants";
import {
  createEmptyBoard,
  generateNewPiece,
  generateBag,
  isValidMove,
  addPieceToBoard,
  clearLines,
  getGhostPiecePosition,
  calculateScore,
  calculateLevel,
  calculateSpeed,
  getWallKicks,
} from "@/lib/utils";

export function useGameLogic() {
  // Board state
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState<Tetromino | null>(null);
  const [nextPieces, setNextPieces] = useState<TetrominoType[]>([]);
  const bagRef = useRef<TetrominoType[]>([]);
  const [heldPiece, setHeldPiece] = useState<TetrominoType | null>(null);
  const [canHold, setCanHold] = useState(true);
  const [ghostPiece, setGhostPiece] = useState<Tetromino | null>(null);

  // Game state
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>("INITIAL");
  const [dropSpeed, setDropSpeed] = useState(INITIAL_SPEED);

  // Get next piece from queue
  const getNextPiece = useCallback((): TetrominoType => {
    // Ensure bag has pieces
    if (bagRef.current.length === 0) {
      bagRef.current.push(...generateBag());
    }
    const next = bagRef.current.shift() as TetrominoType;
    // Refill to keep previews populated
    if (bagRef.current.length < PREVIEW_PIECES + 1) {
      bagRef.current.push(...generateBag());
    }
    // Update preview state from the bag head
    setNextPieces(bagRef.current.slice(0, PREVIEW_PIECES));
    return next;
  }, []);

  // Update ghost piece
  const updateGhostPiece = useCallback(
    (piece: Tetromino) => {
      setGhostPiece(getGhostPiecePosition(piece, board));
    },
    [board]
  );

  // Move piece
  const movePiece = useCallback(
    (dx: number, dy: number): boolean => {
      if (!currentPiece || gameState !== "PLAYING") return false;

      const newPosition = {
        x: currentPiece.position.x + dx,
        y: currentPiece.position.y + dy,
      };

      const movedPiece = { ...currentPiece, position: newPosition };

      if (isValidMove(movedPiece, board)) {
        setCurrentPiece(movedPiece);
        updateGhostPiece(movedPiece);
        return true;
      }

      if (dy > 0) {
        // Piece has landed
        const newBoard = addPieceToBoard(board, currentPiece);
        const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);

        if (linesCleared > 0) {
          const points = calculateScore(linesCleared, level);
          setScore((prev) => prev + points);
          setLines((prev) => {
            const newLines = prev + linesCleared;
            const newLevel = calculateLevel(newLines);
            if (newLevel !== level) {
              setLevel(newLevel);
              setDropSpeed(calculateSpeed(newLevel));
            }
            return newLines;
          });
        }

        setBoard(clearedBoard);
        const nextType = getNextPiece();
        const newPiece = generateNewPiece(nextType);

        if (!isValidMove(newPiece, clearedBoard)) {
          setGameState("GAME_OVER");
          if (score > highScore) setHighScore(score);
        } else {
          setCurrentPiece(newPiece);
          updateGhostPiece(newPiece);
          setCanHold(true);
        }
      }
      return false;
    },
    [
      currentPiece,
      board,
      gameState,
      level,
      score,
      highScore,
      getNextPiece,
      updateGhostPiece,
    ]
  );

  // Rotate piece
  const rotatePiece = useCallback(() => {
    if (!currentPiece || gameState !== "PLAYING") return;

    // Only rotate the current piece, not the entire board
    const newRotation = (currentPiece.rotation + 1) % 4;
    const rotatedPiece = {
      ...currentPiece,
      rotation: newRotation,
    };

    // Try wall kicks
    const kicks = getWallKicks(currentPiece, currentPiece.rotation);

    for (const kick of kicks) {
      const kickedPiece = {
        ...rotatedPiece,
        position: {
          x: rotatedPiece.position.x + kick.x,
          y: rotatedPiece.position.y + kick.y,
        },
      };

      if (isValidMove(kickedPiece, board)) {
        setCurrentPiece(kickedPiece);
        updateGhostPiece(kickedPiece);
        return;
      }
    }
  }, [currentPiece, board, gameState, updateGhostPiece]);

  // Hard drop
  const hardDrop = useCallback(() => {
    if (!currentPiece || gameState !== "PLAYING") return;

    let dropDistance = 0;
    let newY = currentPiece.position.y;

    while (
      isValidMove(
        {
          ...currentPiece,
          position: { ...currentPiece.position, y: newY + 1 },
        },
        board
      )
    ) {
      newY++;
      dropDistance++;
    }

    setScore((prev) => prev + dropDistance * POINTS.HARD_DROP);
    movePiece(0, dropDistance);
  }, [currentPiece, gameState, board, movePiece]);

  // Soft drop one step (player initiated)
  const softDropStep = useCallback(() => {
    const moved = movePiece(0, 1);
    if (moved) {
      setScore((prev) => prev + POINTS.SOFT_DROP);
    }
    return moved;
  }, [movePiece]);

  // Hold piece
  const holdPiece = useCallback(() => {
    if (!currentPiece || !canHold || gameState !== "PLAYING") return;

    const pieceToHold = currentPiece.type;
    let newCurrentPiece;

    if (heldPiece) {
      newCurrentPiece = generateNewPiece(heldPiece);
    } else {
      const nextType = getNextPiece();
      newCurrentPiece = generateNewPiece(nextType);
    }

    setHeldPiece(pieceToHold);
    setCurrentPiece(newCurrentPiece);
    updateGhostPiece(newCurrentPiece);
    setCanHold(false);
  }, [
    currentPiece,
    heldPiece,
    canHold,
    gameState,
    getNextPiece,
    updateGhostPiece,
  ]);

  // Reset game
  const resetGame = useCallback(() => {
    const emptyBoard = createEmptyBoard();
    // Initialize bag and previews
    bagRef.current = generateBag();
    if (bagRef.current.length < PREVIEW_PIECES + 1) {
      bagRef.current.push(...generateBag());
    }
    setNextPieces(bagRef.current.slice(0, PREVIEW_PIECES));
    const firstType = getNextPiece();
    const firstPiece = generateNewPiece(firstType);
    const ghostPiece = getGhostPiecePosition(firstPiece, emptyBoard);

    // Reset all state
    setBoard(emptyBoard);
    setScore(0);
    setLevel(1);
    setLines(0);
    setHeldPiece(null);
    setCanHold(true);
    setGameState("PLAYING");
    setDropSpeed(INITIAL_SPEED);
    setCurrentPiece(firstPiece);
    setGhostPiece(ghostPiece);
  }, [getNextPiece]);

  // Pause game
  const pauseGame = useCallback(() => {
    setGameState((prev) => (prev === "PLAYING" ? "PAUSED" : "PLAYING"));
  }, []);

  // Initialize game on mount
  useEffect(() => {
    resetGame();
  }, [resetGame]);

  return {
    // State
    board,
    currentPiece,
    ghostPiece,
    nextPieces,
    heldPiece,
    canHold,
    score,
    level,
    lines,
    highScore,
    gameState,
    dropSpeed,

    // Actions
    movePiece,
    rotatePiece,
    hardDrop,
    softDropStep,
    holdPiece,
    resetGame,
    pauseGame,
  };
}
