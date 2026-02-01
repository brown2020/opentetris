// src/hooks/useIsMobile.ts
import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768;

function getIsMobile(): boolean {
  return window.innerWidth < MOBILE_BREAKPOINT;
}

function getServerSnapshot(): boolean {
  return false;
}

function subscribe(callback: () => void): () => void {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getIsMobile, getServerSnapshot);
}
