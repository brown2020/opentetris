// src/hooks/useIsMobile.ts
import { useState, useEffect, useRef } from "react";

const MOBILE_BREAKPOINT = 768;
const DEBOUNCE_MS = 150;

export function useIsMobile(): boolean {
  // Initialize with actual value to avoid hydration mismatch
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < MOBILE_BREAKPOINT;
  });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      // Clear any pending debounce
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Debounce resize events
      timeoutRef.current = setTimeout(() => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      }, DEBOUNCE_MS);
    };

    // Re-check on mount in case SSR value differs (immediate, no debounce)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return isMobile;
}
