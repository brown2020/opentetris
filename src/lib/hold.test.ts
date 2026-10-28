import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createInitialState, tetrisReducer } from "../hooks/useTetris";
import { DEFAULT_MODERN_SETTINGS, type TetrominoType } from "../types";
import { createEmptyBoard, generateNewPiece } from "./utils";

function playing(held: TetrominoType | null, current: TetrominoType = "T") {
  const state = createInitialState();
  state.gameState = "PLAYING";
  state.settings = { ...DEFAULT_MODERN_SETTINGS };
  state.currentPiece = generateNewPiece(current);
  state.heldPiece = held;
  state.canHold = true;
  state.board = createEmptyBoard();
  state.bag = ["S", "Z", "J"];
  state.nextPieces = ["S", "Z", "J"];
  return state;
}

describe("hold collision", () => {
  it("swaps a held piece that fits", () => {
    const next = tetrisReducer(playing("O"), { type: "HOLD_PIECE" });
    assert.equal(next.currentPiece?.type, "O");
    assert.equal(next.heldPiece, "T");
    assert.equal(next.canHold, false);
  });

  it("leaves state unchanged when the swapped piece spawns inside the stack", () => {
    const state = playing("I");
    state.board[1][3] = "T";
    state.board[1][4] = "T";
    state.board[1][5] = "T";
    state.board[1][6] = "T";
    const next = tetrisReducer(state, { type: "HOLD_PIECE" });
    assert.equal(next, state);
    assert.equal(next.heldPiece, "I");
    assert.equal(next.currentPiece?.type, "T");
    assert.equal(next.canHold, true);
  });

  it("does not consume the next queue when the incoming piece is blocked", () => {
    const state = playing(null, "O");
    state.board[1][3] = "J";
    state.board[1][4] = "J";
    state.board[1][5] = "J";
    const next = tetrisReducer(state, { type: "HOLD_PIECE" });
    assert.equal(next, state);
    assert.deepEqual(next.nextPieces, ["S", "Z", "J"]);
    assert.equal(next.heldPiece, null);
  });
});
