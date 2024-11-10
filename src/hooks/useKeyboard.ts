// src/hooks/useKeyboard.ts
import { useEffect, useCallback } from "react";

interface KeyboardControls {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onMoveDown: () => void;
  onRotate: () => void;
  onHardDrop: () => void;
  onHold: () => void;
  onPause: () => void;
  onReset: () => void;
  isEnabled?: boolean;
}

export function useKeyboard({
  onMoveLeft,
  onMoveRight,
  onMoveDown,
  onRotate,
  onHardDrop,
  onHold,
  onPause,
  onReset,
  isEnabled = true,
}: KeyboardControls) {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!isEnabled) return;

      // Prevent default behavior for game controls
      if (
        event.key === "ArrowUp" ||
        event.key === "ArrowDown" ||
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight" ||
        event.key === " "
      ) {
        event.preventDefault();
      }

      switch (event.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          onMoveLeft();
          break;

        case "ArrowRight":
        case "d":
        case "D":
          onMoveRight();
          break;

        case "ArrowDown":
        case "s":
        case "S":
          onMoveDown();
          break;

        case "ArrowUp":
        case "w":
        case "W":
          onRotate();
          break;

        case " ":
          onHardDrop();
          break;

        case "c":
        case "C":
          onHold();
          break;

        case "p":
        case "P":
          onPause();
          break;

        case "r":
        case "R":
          onReset();
          break;
      }
    },
    [
      isEnabled,
      onMoveLeft,
      onMoveRight,
      onMoveDown,
      onRotate,
      onHardDrop,
      onHold,
      onPause,
      onReset,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);
}
