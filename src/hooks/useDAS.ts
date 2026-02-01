// src/hooks/useDAS.ts
// DAS (Delayed Auto Shift) implementation for authentic NES-style movement
import { useRef, useCallback, useEffect } from "react";

interface DASConfig {
  initialDelay: number; // ms before auto-repeat starts
  repeatRate: number;   // ms between repeats
}

interface DASState {
  key: string | null;
  isCharging: boolean;
  lastRepeat: number;
  startTime: number;
}

export function useDAS(
  config: DASConfig,
  onMove: (direction: "left" | "right") => void,
  isEnabled: boolean = true
) {
  const stateRef = useRef<DASState>({
    key: null,
    isCharging: false,
    lastRepeat: 0,
    startTime: 0,
  });

  const animationFrameRef = useRef<number | null>(null);
  const onMoveRef = useRef(onMove);
  const configRef = useRef(config);
  const isEnabledRef = useRef(isEnabled);
  const tickRef = useRef<() => void>(() => {});

  // Keep refs up to date
  useEffect(() => {
    onMoveRef.current = onMove;
    configRef.current = config;
    isEnabledRef.current = isEnabled;
  }, [onMove, config, isEnabled]);

  // Initialize the tick function in the ref
  useEffect(() => {
    tickRef.current = () => {
      if (!isEnabledRef.current || !stateRef.current.key) {
        animationFrameRef.current = null;
        return;
      }

      const now = performance.now();
      const elapsed = now - stateRef.current.startTime;

      // Check if we've passed the initial delay
      if (elapsed >= configRef.current.initialDelay) {
        // Check if enough time has passed since last repeat
        const timeSinceRepeat = now - stateRef.current.lastRepeat;

        if (timeSinceRepeat >= configRef.current.repeatRate) {
          // Trigger the move
          const direction = stateRef.current.key === "left" ? "left" : "right";
          onMoveRef.current(direction);
          stateRef.current.lastRepeat = now;
        }
      }

      // Continue the loop
      animationFrameRef.current = requestAnimationFrame(tickRef.current);
    };
  }, []);

  const startDAS = useCallback((direction: "left" | "right") => {
    if (!isEnabledRef.current) return;

    // Immediate first move
    onMoveRef.current(direction);

    // Start DAS charging
    stateRef.current = {
      key: direction,
      isCharging: true,
      lastRepeat: performance.now(),
      startTime: performance.now(),
    };

    // Start the repeat loop
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(tickRef.current);
  }, []);

  const stopDAS = useCallback((direction?: "left" | "right") => {
    // Only stop if the released key matches the currently held key
    if (direction && stateRef.current.key !== direction) {
      return;
    }

    stateRef.current = {
      key: null,
      isCharging: false,
      lastRepeat: 0,
      startTime: 0,
    };

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Stop DAS when disabled
  useEffect(() => {
    if (!isEnabled) {
      stopDAS();
    }
  }, [isEnabled, stopDAS]);

  return {
    startDAS,
    stopDAS,
  };
}
