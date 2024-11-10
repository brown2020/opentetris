// src/components/tetris/TetrisGame.tsx
import React from "react";
import { useInterval } from "@/hooks/useInterval";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useGameLogic } from "@/hooks/useGameLogic";

import Board from "./Board";
import Controls from "./Controls";
import GameOver from "./GameOver";
import HoldPiece from "./HoldPiece";
import NextPiece from "./NextPiece";
import Score from "./Score";

const TetrisGame: React.FC = () => {
  const {
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
    holdPiece,
    resetGame,
    pauseGame,
  } = useGameLogic();

  // Keyboard controls
  useKeyboard({
    onMoveLeft: () => movePiece(-1, 0),
    onMoveRight: () => movePiece(1, 0),
    onMoveDown: () => {
      if (movePiece(0, 1)) {
        // Add points for soft drop
        // score update is handled in the game logic
      }
    },
    onRotate: rotatePiece,
    onHardDrop: hardDrop,
    onHold: holdPiece,
    onPause: pauseGame,
    onReset: resetGame,
    isEnabled: gameState !== "GAME_OVER",
  });

  // Game tick for piece falling
  useInterval(
    () => {
      movePiece(0, 1);
    },
    gameState === "PLAYING" ? dropSpeed : null
  );

  return (
    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
      {/* Left panel */}
      <div className="flex flex-col gap-4">
        <HoldPiece piece={heldPiece} isLocked={!canHold} className="md:mb-4" />
        <Score
          score={score}
          level={level}
          lines={lines}
          highScore={highScore}
        />
      </div>

      {/* Game board */}
      <div className="relative">
        <Board
          board={board}
          currentPiece={currentPiece}
          ghostPiece={ghostPiece}
        />
        {gameState === "PAUSED" && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center">
            <div className="text-3xl font-bold text-white">PAUSED</div>
          </div>
        )}
        {gameState === "GAME_OVER" && (
          <GameOver score={score} highScore={highScore} onRestart={resetGame} />
        )}
      </div>

      {/* Right panel */}
      <div className="flex flex-col gap-4">
        <NextPiece pieces={nextPieces} />
        <Controls
          onMove={(direction) => {
            switch (direction) {
              case "left":
                movePiece(-1, 0);
                break;
              case "right":
                movePiece(1, 0);
                break;
              case "down":
                if (movePiece(0, 1)) {
                  // Add points for soft drop
                  // score update is handled in the game logic
                }
                break;
            }
          }}
          onRotate={rotatePiece}
          onHardDrop={hardDrop}
          onPause={pauseGame}
          onReset={resetGame}
          isPaused={gameState === "PAUSED"}
          gameOver={gameState === "GAME_OVER"}
          isMobile={typeof window !== "undefined" && window.innerWidth < 768}
        />
      </div>
    </div>
  );
};

export default TetrisGame;
