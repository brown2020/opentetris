// src/hooks/useKeyboard.ts
import { useEffect, useCallback, useMemo } from "react";

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

const PREVENT_DEFAULT_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  " ",
]);

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
  // Key mapping for cleaner lookup
  const keyActions = useMemo(
    () =>
      new Map<string, () => void>([
        ["ArrowLeft", onMoveLeft],
        ["a", onMoveLeft],
        ["A", onMoveLeft],
        ["ArrowRight", onMoveRight],
        ["d", onMoveRight],
        ["D", onMoveRight],
        ["ArrowDown", onMoveDown],
        ["s", onMoveDown],
        ["S", onMoveDown],
        ["ArrowUp", onRotate],
        ["w", onRotate],
        ["W", onRotate],
        [" ", onHardDrop],
        ["c", onHold],
        ["C", onHold],
        ["p", onPause],
        ["P", onPause],
        ["r", onReset],
        ["R", onReset],
      ]),
    [
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

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!isEnabled) return;

      if (PREVENT_DEFAULT_KEYS.has(event.key)) {
        event.preventDefault();
      }

      const action = keyActions.get(event.key);
      action?.();
    },
    [isEnabled, keyActions]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);
}
