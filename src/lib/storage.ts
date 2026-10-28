import {
  DEFAULT_CLASSIC_SETTINGS,
  DEFAULT_MODERN_SETTINGS,
  type GameMode,
  type GameSettings,
} from "@/types";

export const HIGH_SCORE_KEY = "tetris-highscore";
export const SETTINGS_KEY = "tetris-settings";

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const GAME_MODES = ["classic", "modern"] as const;
const SCORING_SYSTEMS = ["nes", "modern"] as const;
const COLOR_THEMES = ["nes", "gameboy", "modern"] as const;
const ROTATION_SYSTEMS = ["nes", "srs"] as const;
const RANDOMIZERS = ["nes", "7bag"] as const;

function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

function finiteInt(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return Math.trunc(parsed);
  }
  return fallback;
}

function clampStartingLevel(level: number, mode: GameMode): number {
  if (mode === "classic") return Math.min(19, Math.max(0, level));
  return Math.min(15, Math.max(1, level));
}

export function parseHighScore(stored: string | null | undefined): number {
  if (stored == null || stored.trim() === "") return 0;
  const value = Number(stored);
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.floor(value);
}

export function sanitizeSettings(input: unknown): GameSettings {
  const source =
    input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const mode = isOneOf(source.mode, GAME_MODES) ? source.mode : DEFAULT_MODERN_SETTINGS.mode;
  const base = mode === "classic" ? DEFAULT_CLASSIC_SETTINGS : DEFAULT_MODERN_SETTINGS;
  const nextPieceCount =
    source.nextPieceCount === 1 || source.nextPieceCount === 3
      ? source.nextPieceCount
      : base.nextPieceCount;

  return {
    mode,
    ghostPiece: typeof source.ghostPiece === "boolean" ? source.ghostPiece : base.ghostPiece,
    holdPiece: typeof source.holdPiece === "boolean" ? source.holdPiece : base.holdPiece,
    nextPieceCount,
    scoringSystem: isOneOf(source.scoringSystem, SCORING_SYSTEMS)
      ? source.scoringSystem
      : base.scoringSystem,
    colorTheme: isOneOf(source.colorTheme, COLOR_THEMES) ? source.colorTheme : base.colorTheme,
    rotationSystem: isOneOf(source.rotationSystem, ROTATION_SYSTEMS)
      ? source.rotationSystem
      : base.rotationSystem,
    randomizer: isOneOf(source.randomizer, RANDOMIZERS) ? source.randomizer : base.randomizer,
    startingLevel: clampStartingLevel(finiteInt(source.startingLevel, base.startingLevel), mode),
  };
}

export function browserStore(): KeyValueStore | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readHighScore(store: KeyValueStore | null = browserStore()): number {
  if (!store) return 0;
  try {
    return parseHighScore(store.getItem(HIGH_SCORE_KEY));
  } catch {
    return 0;
  }
}

export function readSettings(store: KeyValueStore | null = browserStore()): GameSettings {
  if (!store) return sanitizeSettings(undefined);
  try {
    const raw = store.getItem(SETTINGS_KEY);
    if (!raw) return sanitizeSettings(undefined);
    return sanitizeSettings(JSON.parse(raw) as unknown);
  } catch {
    return sanitizeSettings(undefined);
  }
}

export function persistSettings(
  settings: GameSettings,
  store: KeyValueStore | null = browserStore()
): void {
  if (!store) return;
  try {
    store.setItem(SETTINGS_KEY, JSON.stringify(sanitizeSettings(settings)));
  } catch {
    // Private mode and full storage throw. The in-memory round still runs.
  }
}

export function persistHighScore(
  score: number,
  store: KeyValueStore | null = browserStore()
): number {
  const incoming = Number.isFinite(score) && score > 0 ? Math.floor(score) : 0;
  if (!store) return incoming;
  const stored = readHighScore(store);
  const next = Math.max(incoming, stored);
  try {
    if (next !== stored || store.getItem(HIGH_SCORE_KEY) !== String(next)) {
      store.setItem(HIGH_SCORE_KEY, String(next));
    }
  } catch {
    // Ignore quota and security errors from localStorage.
  }
  return next;
}
