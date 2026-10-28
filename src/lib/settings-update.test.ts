import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createInitialState, tetrisReducer } from "../hooks/useTetris";
import { DEFAULT_CLASSIC_SETTINGS, DEFAULT_MODERN_SETTINGS } from "../types";
import { calculateSpeed } from "./utils";

describe("high score sync", () => {
  it("raises the in-memory high score and never lowers it", () => {
    let state = tetrisReducer(createInitialState(), {
      type: "INIT",
      highScore: 40,
      settings: DEFAULT_MODERN_SETTINGS,
    });
    state = tetrisReducer(state, { type: "SYNC_HIGH_SCORE", highScore: 90 });
    assert.equal(state.highScore, 90);
    state = tetrisReducer(state, { type: "SYNC_HIGH_SCORE", highScore: 10 });
    assert.equal(state.highScore, 90);
    state = tetrisReducer(state, { type: "SYNC_HIGH_SCORE", highScore: Number.NaN });
    assert.equal(state.highScore, 90);
  });
});

describe("settings updates", () => {
  it("applies a new starting level without resetting a paused round", () => {
    let state = tetrisReducer(createInitialState(), {
      type: "INIT",
      highScore: 42,
      settings: DEFAULT_MODERN_SETTINGS,
    });
    state = tetrisReducer(state, { type: "TOGGLE_PAUSE" });
    const piece = state.currentPiece;
    state = tetrisReducer(state, {
      type: "UPDATE_SETTINGS",
      settings: { startingLevel: 5 },
    });

    assert.equal(state.gameState, "PAUSED");
    assert.equal(state.level, 5);
    assert.equal(state.dropSpeed, calculateSpeed(5, "modern"));
    assert.equal(state.lines, 0);
    assert.equal(state.score, 0);
    assert.equal(state.highScore, 42);
    assert.equal(state.currentPiece, piece);
  });

  it("recomputes classic gravity from the NES level curve", () => {
    let state = tetrisReducer(createInitialState(), {
      type: "INIT",
      highScore: 0,
      settings: DEFAULT_CLASSIC_SETTINGS,
    });
    state = { ...state, lines: 40, level: 0, gameState: "PAUSED" };
    state = tetrisReducer(state, {
      type: "UPDATE_SETTINGS",
      settings: { startingLevel: 5 },
    });

    assert.equal(state.gameState, "PAUSED");
    assert.equal(state.lines, 40);
    assert.equal(state.level, 5);
    assert.equal(state.dropSpeed, calculateSpeed(5, "nes"));
  });

  it("starts a new round when the mode changes while paused", () => {
    let state = tetrisReducer(createInitialState(), {
      type: "INIT",
      highScore: 42,
      settings: DEFAULT_MODERN_SETTINGS,
    });
    state = tetrisReducer(state, { type: "TOGGLE_PAUSE" });
    state = tetrisReducer(state, {
      type: "UPDATE_SETTINGS",
      settings: { startingLevel: 5 },
    });
    state = tetrisReducer(state, {
      type: "UPDATE_SETTINGS",
      settings: DEFAULT_CLASSIC_SETTINGS,
    });

    assert.equal(state.settings.mode, "classic");
    assert.equal(state.gameState, "PLAYING");
    assert.equal(state.score, 0);
    assert.equal(state.lines, 0);
    assert.equal(state.level, 0);
    assert.equal(state.highScore, 42);
    assert.equal(state.dropSpeed, calculateSpeed(0, "nes"));
  });
});
