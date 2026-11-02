import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BOARD_HEIGHT, BOARD_WIDTH } from "../lib/constants";
import { createEmptyBoard, generateNewPiece } from "../lib/utils";
import { createInitialState, tetrisReducer } from "./useTetris";

function start(highScore = 0) {
  return tetrisReducer(createInitialState(), { type: "INIT", highScore });
}

describe("tetris round", () => {
  it("spawns a piece in play", () => {
    const state = start();
    assert.equal(state.gameState, "PLAYING");
    assert.ok(state.currentPiece);
    assert.equal(state.score, 0);
    assert.equal(state.lines, 0);
    assert.equal(state.nextPieces.length, 3);
  });

  it("rotates, hard-drops a line, then pauses and resumes", () => {
    const spawned = start();
    const piece = generateNewPiece("T");
    const rotated = tetrisReducer(
      { ...spawned, currentPiece: piece },
      { type: "ROTATE_PIECE" }
    );
    assert.equal(rotated.currentPiece?.rotation, 1);
    assert.equal(rotated.gameState, "PLAYING");

    const board = createEmptyBoard();
    for (let x = 0; x < BOARD_WIDTH; x++) {
      if (x < 3 || x > 6) board[BOARD_HEIGHT - 1][x] = "T";
    }
    const horizontal = generateNewPiece("I");
    horizontal.position = { x: 3, y: BOARD_HEIGHT - 2 };

    const cleared = tetrisReducer(
      {
        ...rotated,
        board,
        currentPiece: horizontal,
        score: 0,
        lines: 0,
        level: 1,
      },
      { type: "HARD_DROP" }
    );
    assert.equal(cleared.lines, 1);
    assert.equal(cleared.score, 100);
    assert.equal(cleared.gameState, "PLAYING");
    assert.ok(cleared.currentPiece);
    assert.ok(cleared.board.every((row) => row.every((cell) => cell === null)));

    const paused = tetrisReducer(cleared, { type: "TOGGLE_PAUSE" });
    assert.equal(paused.gameState, "PAUSED");
    const heldX = paused.currentPiece?.position.x;
    const ignored = tetrisReducer(paused, { type: "MOVE_PIECE", dx: 1, dy: 0 });
    assert.equal(ignored.gameState, "PAUSED");
    assert.equal(ignored.currentPiece?.position.x, heldX);

    const resumed = tetrisReducer(paused, { type: "TOGGLE_PAUSE" });
    assert.equal(resumed.gameState, "PLAYING");
  });

  it("saves the higher score at game over and restarts on reset", () => {
    const board = createEmptyBoard();
    // Leave column 0 open so these rows are not already complete, and block
    // every column a spawned piece occupies.
    for (let y = 0; y < BOARD_HEIGHT - 2; y++) {
      for (let x = 1; x < BOARD_WIDTH; x++) board[y][x] = "L";
    }
    const piece = generateNewPiece("O");
    piece.position = { x: 3, y: BOARD_HEIGHT - 2 };

    const over = tetrisReducer(
      {
        ...start(100),
        board,
        currentPiece: piece,
        score: 500,
        gameState: "PLAYING",
      },
      { type: "HARD_DROP" }
    );
    assert.equal(over.gameState, "GAME_OVER");
    assert.equal(over.score, 500);
    assert.equal(over.highScore, 500);
    assert.equal(tetrisReducer(over, { type: "TOGGLE_PAUSE" }).gameState, "GAME_OVER");

    const restarted = tetrisReducer(over, { type: "RESET_GAME" });
    assert.equal(restarted.gameState, "PLAYING");
    assert.equal(restarted.score, 0);
    assert.equal(restarted.lines, 0);
    assert.equal(restarted.highScore, 500);
    assert.ok(restarted.currentPiece);
    assert.ok(restarted.board.every((row) => row.every((cell) => cell === null)));
  });

  it("moves one cell on classic hard drop and does not lock", () => {
    const classic = tetrisReducer(createInitialState(), {
      type: "UPDATE_SETTINGS",
      settings: { mode: "classic" },
    });
    assert.equal(classic.settings.mode, "classic");
    assert.equal(classic.gameState, "PLAYING");
    assert.equal(classic.currentPiece?.position.y, 0);

    const dropped = tetrisReducer(classic, { type: "HARD_DROP" });
    assert.equal(dropped.gameState, "PLAYING");
    assert.equal(dropped.currentPiece?.type, classic.currentPiece?.type);
    assert.equal(dropped.currentPiece?.position.y, 1);
    assert.equal(dropped.score, 0);
    assert.ok(dropped.board.every((row) => row.every((cell) => cell === null)));
  });
});
