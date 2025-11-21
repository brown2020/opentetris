import { useCallback, useEffect } from "react";
import { useBoard } from "./useBoard";
import { useGameState } from "./useGameState";
import { usePiece } from "./usePiece";
import { isValidMove } from "@/lib/utils";
import { POINTS } from "@/lib/constants";

export function useGameLogic() {
  const { board, resetBoard, lockPiece } = useBoard();
  const {
    score,
    level,
    lines,
    highScore,
    gameState,
    dropSpeed,
    setGameState,
    resetGameState,
    addScore,
    addLines,
    setGameOver,
    togglePause,
  } = useGameState();
  const {
    currentPiece,
    setCurrentPiece,
    nextPieces,
    heldPiece,
    canHold,
    ghostPiece,
    move,
    rotate,
    hold,
    spawnNewPiece,
    resetPieces,
  } = usePiece(board);

  const handleLanding = useCallback(() => {
    if (!currentPiece) return;

    // Lock piece and clear lines
    const { linesCleared, newBoard } = lockPiece(currentPiece);
    addLines(linesCleared);

    // Spawn new piece
    const newPiece = spawnNewPiece();

    // Check for game over
    if (!isValidMove(newPiece, newBoard)) {
      setGameOver();
    }
  }, [currentPiece, lockPiece, addLines, spawnNewPiece, setGameOver]);

  const movePiece = useCallback(
    (dx: number, dy: number) => {
      if (gameState !== "PLAYING") return false;

      const moved = move(dx, dy);

      if (!moved && dy > 0) {
        // Piece has landed
        handleLanding();
      }

      return moved;
    },
    [gameState, move, handleLanding]
  );

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

    addScore(dropDistance * POINTS.HARD_DROP);

    const droppedPiece = {
      ...currentPiece,
      position: { ...currentPiece.position, y: newY },
    };
    setCurrentPiece(droppedPiece);

    // Lock piece and clear lines
    const { linesCleared, newBoard } = lockPiece(droppedPiece);
    addLines(linesCleared);

    // Spawn new piece
    const newPiece = spawnNewPiece();

    // Check for game over
    if (!isValidMove(newPiece, newBoard)) {
      setGameOver();
    }

  }, [currentPiece, gameState, board, addScore, setCurrentPiece, lockPiece, addLines, spawnNewPiece, setGameOver]);

  const softDropStep = useCallback(() => {
    const moved = movePiece(0, 1);
    if (moved) {
      addScore(POINTS.SOFT_DROP);
    }
    return moved;
  }, [movePiece, addScore]);

  const resetGame = useCallback(() => {
    resetBoard();
    resetGameState();
    resetPieces();
  }, [resetBoard, resetGameState, resetPieces]);

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
    rotatePiece: rotate,
    hardDrop,
    softDropStep,
    holdPiece: hold,
    resetGame,
    pauseGame: togglePause,
  };
}
