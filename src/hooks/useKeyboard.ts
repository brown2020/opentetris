// src/hooks/useKeyboard.ts
import { useEffect, useCallback, useMemo, useRef } from "react";
import { useDAS } from "./useDAS";
import { DAS_SETTINGS } from "@/lib/constants";
import { GameMode } from "@/types";

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
  gameMode?: GameMode;
}

const PREVENT_DEFAULT_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  " ",
]);

const LEFT_KEYS = new Set(["ArrowLeft", "a", "A"]);
const RIGHT_KEYS = new Set(["ArrowRight", "d", "D"]);

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
  gameMode = "modern",
}: KeyboardControls) {
  // Track which movement keys are currently held
  const heldKeysRef = useRef<Set<string>>(new Set());

  // DAS configuration based on game mode
  const dasConfig = gameMode === "classic" ? DAS_SETTINGS.NES : DAS_SETTINGS.MODERN;

  // DAS handler for horizontal movement
  const handleDASMove = useCallback((direction: "left" | "right") => {
    if (direction === "left") {
      onMoveLeft();
    } else {
      onMoveRight();
    }
  }, [onMoveLeft, onMoveRight]);

  const { startDAS, stopDAS } = useDAS(dasConfig, handleDASMove, isEnabled);

  // Non-DAS key actions
  const instantKeyActions = useMemo(
    () =>
      new Map<string, () => void>([
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
    [onMoveDown, onRotate, onHardDrop, onHold, onPause, onReset]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isEnabled) return;

      // Prevent default for game keys
      if (PREVENT_DEFAULT_KEYS.has(event.key)) {
        event.preventDefault();
      }

      // Skip if key is already held (avoid repeat events)
      if (heldKeysRef.current.has(event.key)) {
        return;
      }

      heldKeysRef.current.add(event.key);

      // Handle left/right movement with DAS
      if (LEFT_KEYS.has(event.key)) {
        startDAS("left");
        return;
      }

      if (RIGHT_KEYS.has(event.key)) {
        startDAS("right");
        return;
      }

      // Handle other keys instantly
      const action = instantKeyActions.get(event.key);
      action?.();
    },
    [isEnabled, instantKeyActions, startDAS]
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      heldKeysRef.current.delete(event.key);

      // Stop DAS for left/right
      if (LEFT_KEYS.has(event.key)) {
        stopDAS("left");
      } else if (RIGHT_KEYS.has(event.key)) {
        stopDAS("right");
      }
    },
    [stopDAS]
  );

  // Clear held keys when window loses focus
  const handleBlur = useCallback(() => {
    heldKeysRef.current.clear();
    stopDAS();
  }, [stopDAS]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [handleKeyDown, handleKeyUp, handleBlur]);

  // Clear held keys when disabled
  useEffect(() => {
    if (!isEnabled) {
      heldKeysRef.current.clear();
    }
  }, [isEnabled]);
}
