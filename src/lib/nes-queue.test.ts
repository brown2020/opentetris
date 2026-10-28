import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createInitialState, tetrisReducer } from "../hooks/useTetris";
import { DEFAULT_CLASSIC_SETTINGS } from "../types";
import { TETROMINO_TYPES } from "./constants";
import { createEmptyBoard } from "./utils";

function roll(index: number): number {
  return (index + 0.5) / TETROMINO_TYPES.length;
}

function withRandom<T>(values: number[], run: () => T): T {
  const original = Math.random;
  let cursor = 0;
  Math.random = () => values[Math.min(cursor++, values.length - 1)];
  try {
    return run();
  } finally {
    Math.random = original;
  }
}

describe("classic next queue", () => {
  it("spawns the preview piece on lock and after a line clear", () => {
    const state = withRandom([roll(0), roll(1), roll(2), roll(3)], () => {
      let next = tetrisReducer(createInitialState(), {
        type: "INIT",
        highScore: 0,
        settings: DEFAULT_CLASSIC_SETTINGS,
      });
      assert.equal(next.currentPiece?.type, "I");
      assert.deepEqual(next.nextPieces, ["O"]);

      const board = createEmptyBoard();
      for (let col = 0; col < board[19].length; col++) {
        if (col < 3 || col > 6) board[19][col] = "T";
      }
      next = {
        ...next,
        board,
        currentPiece: next.currentPiece
          ? { ...next.currentPiece, position: { x: next.currentPiece.position.x, y: 18 } }
          : null,
      };

      next = tetrisReducer(next, { type: "TICK" });
      assert.equal(next.gameState, "LINE_CLEAR");
      assert.deepEqual(next.nextPieces, ["O"]);

      for (let frame = 0; frame < 8; frame++) {
        next = tetrisReducer(next, { type: "LINE_CLEAR_TICK" });
      }
      assert.equal(next.currentPiece?.type, "O");
      assert.deepEqual(next.nextPieces, ["T"]);
      return next;
    });

    assert.equal(state.currentPiece?.type, "O");
  });

  it("uses the queued piece when holding with an empty hold slot", () => {
    const next = withRandom([roll(0), roll(1), roll(6)], () => {
      const started = tetrisReducer(createInitialState(), {
        type: "INIT",
        highScore: 0,
        settings: { ...DEFAULT_CLASSIC_SETTINGS, holdPiece: true },
      });
      assert.deepEqual(started.nextPieces, ["O"]);
      return tetrisReducer(started, { type: "HOLD_PIECE" });
    });

    assert.equal(next.currentPiece?.type, "O");
    assert.equal(next.heldPiece, "I");
    assert.deepEqual(next.nextPieces, ["L"]);
    assert.equal(next.canHold, false);
  });
});
