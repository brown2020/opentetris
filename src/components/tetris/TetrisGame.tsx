"use client";
// src/components/tetris/TetrisGame.tsx
import React, { useCallback } from "react";
import { useInterval } from "@/hooks/useInterval";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useTetris } from "@/hooks/useTetris";
import { useIsMobile } from "@/hooks/useIsMobile";
import { LINE_CLEAR_ANIMATION } from "@/lib/constants";

import Board from "./Board";
import Controls from "./Controls";
import GameOver from "./GameOver";
import HoldPiece from "./HoldPiece";
import NextPiece from "./NextPiece";
import Score from "./Score";
import SettingsPanel from "./SettingsPanel";
import Statistics from "./Statistics";

const TetrisGame: React.FC = () => {
  const isMobile = useIsMobile();
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
    settings,
    statistics,
    lineClearAnimation,

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
  } = useTetris();

  // Memoized keyboard handlers
  const onMoveLeft = useCallback(() => movePiece(-1, 0), [movePiece]);
  const onMoveRight = useCallback(() => movePiece(1, 0), [movePiece]);

  // Keyboard controls - only enabled when game is active
  const isGameActive = gameState === "PLAYING" || gameState === "PAUSED";
  useKeyboard({
    onMoveLeft,
    onMoveRight,
    onMoveDown: softDropStep,
    onRotate: rotatePiece,
    onHardDrop: hardDrop,
    onHold: holdPiece,
    onPause: pauseGame,
    onReset: resetGame,
    isEnabled: isGameActive,
    gameMode: settings.mode,
  });

  // Memoized move handler for Controls
  const handleMove = useCallback(
    (direction: "left" | "right" | "down") => {
      if (direction === "left") movePiece(-1, 0);
      else if (direction === "right") movePiece(1, 0);
      else softDropStep();
    },
    [movePiece, softDropStep]
  );

  // Game tick for piece falling
  useInterval(tick, gameState === "PLAYING" ? dropSpeed : null);

  // Line clear animation tick
  useInterval(
    lineClearTick,
    gameState === "LINE_CLEAR" ? LINE_CLEAR_ANIMATION.frameDelay : null
  );

  const isClassicMode = settings.mode === "classic";

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Settings toggle */}
      <SettingsPanel
        settings={settings}
        onUpdateSettings={updateSettings}
        disabled={gameState === "PLAYING" || gameState === "LINE_CLEAR"}
      />

      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
        {/* Left panel */}
        <div className="flex flex-col gap-4">
          {/* Hold piece - only in modern mode */}
          {settings.holdPiece && (
            <HoldPiece piece={heldPiece} isLocked={!canHold} className="md:mb-4" />
          )}
          <Score
            score={score}
            level={level}
            lines={lines}
            highScore={highScore}
          />
          {/* Statistics - only in classic mode */}
          {isClassicMode && <Statistics statistics={statistics} />}
        </div>

        {/* Game board */}
        <div className="relative">
          <Board
            board={board}
            currentPiece={currentPiece}
            ghostPiece={ghostPiece}
            lineClearAnimation={lineClearAnimation}
            level={level}
            colorTheme={settings.colorTheme}
          />
          {gameState === "PAUSED" && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center">
              <div className="text-3xl font-bold text-white">PAUSED</div>
            </div>
          )}
          {gameState === "GAME_OVER" && (
            <GameOver score={score} highScore={highScore} onRestart={resetGame} />
          )}
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-4">
          <NextPiece
            pieces={nextPieces}
            maxPieces={settings.nextPieceCount}
            level={level}
            colorTheme={settings.colorTheme}
          />
          <Controls
            onMove={handleMove}
            onRotate={rotatePiece}
            onHardDrop={hardDrop}
            onPause={pauseGame}
            onReset={resetGame}
            isPaused={gameState === "PAUSED"}
            gameOver={gameState === "GAME_OVER"}
            isMobile={isMobile}
            isClassicMode={isClassicMode}
          />
        </div>
      </div>
    </div>
  );
};

export default TetrisGame;
