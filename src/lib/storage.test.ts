import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_CLASSIC_SETTINGS, DEFAULT_MODERN_SETTINGS } from "../types";
import {
  HIGH_SCORE_KEY,
  SETTINGS_KEY,
  type KeyValueStore,
  parseHighScore,
  persistHighScore,
  persistSettings,
  readHighScore,
  readSettings,
  sanitizeSettings,
} from "./storage";

function memoryStore(initial: Record<string, string> = {}): KeyValueStore & { map: Map<string, string> } {
  const map = new Map(Object.entries(initial));
  return {
    map,
    getItem: (key) => (map.has(key) ? map.get(key)! : null),
    setItem: (key, value) => {
      map.set(key, value);
    },
  };
}

describe("high score storage", () => {
  it("rejects blank, non-numeric, and negative values", () => {
    assert.equal(parseHighScore(null), 0);
    assert.equal(parseHighScore(""), 0);
    assert.equal(parseHighScore("NaN"), 0);
    assert.equal(parseHighScore("abc"), 0);
    assert.equal(parseHighScore("12px"), 0);
    assert.equal(parseHighScore("-4"), 0);
    assert.equal(parseHighScore("10.9"), 10);
    assert.equal(parseHighScore("2500"), 2500);
  });

  it("reads a safe score and ignores storage failures", () => {
    const store = memoryStore({ [HIGH_SCORE_KEY]: "NaN" });
    assert.equal(readHighScore(store), 0);
    assert.equal(
      readHighScore({
        getItem: () => {
          throw new Error("blocked");
        },
        setItem: () => undefined,
      }),
      0
    );
  });

  it("does not throw when writing the high score fails", () => {
    assert.doesNotThrow(() =>
      persistHighScore(100, {
        getItem: () => null,
        setItem: () => {
          throw new Error("quota");
        },
      })
    );
    const store = memoryStore();
    assert.equal(persistHighScore(Number.NaN, store), 0);
    persistHighScore(80, store);
    assert.equal(store.map.get(HIGH_SCORE_KEY), "80");
  });

  it("keeps the higher score already stored by another tab", () => {
    const store = memoryStore({ [HIGH_SCORE_KEY]: "500" });
    assert.equal(persistHighScore(120, store), 500);
    assert.equal(store.map.get(HIGH_SCORE_KEY), "500");
    assert.equal(persistHighScore(900, store), 900);
    assert.equal(store.map.get(HIGH_SCORE_KEY), "900");
  });
});

describe("settings storage", () => {
  it("merges partial or corrupt settings onto the matching preset", () => {
    assert.deepEqual(sanitizeSettings(null), DEFAULT_MODERN_SETTINGS);
    assert.deepEqual(sanitizeSettings({ mode: "classic" }), DEFAULT_CLASSIC_SETTINGS);
    assert.equal(sanitizeSettings({ mode: "modern", startingLevel: "nope" }).startingLevel, 1);
    assert.equal(sanitizeSettings({ mode: "classic", startingLevel: 99 }).startingLevel, 19);
    assert.equal(sanitizeSettings({ mode: "modern", startingLevel: -4 }).startingLevel, 1);
    assert.equal(sanitizeSettings({ mode: "modern", nextPieceCount: 9 }).nextPieceCount, 3);
    const classic = sanitizeSettings({ mode: "classic", ghostPiece: true, holdPiece: "yes" });
    assert.equal(classic.ghostPiece, true);
    assert.equal(classic.holdPiece, false);
    assert.equal(sanitizeSettings({ mode: "modern", scoringSystem: "nope" }).scoringSystem, "modern");
  });

  it("falls back when stored JSON is unreadable and ignores write failures", () => {
    const broken = memoryStore({ [SETTINGS_KEY]: "{not json" });
    assert.deepEqual(readSettings(broken), DEFAULT_MODERN_SETTINGS);
    assert.doesNotThrow(() =>
      persistSettings(DEFAULT_MODERN_SETTINGS, {
        getItem: () => null,
        setItem: () => {
          throw new Error("quota");
        },
      })
    );
  });
});
