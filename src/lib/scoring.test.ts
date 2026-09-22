import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateScore, getDropPoints, calculateLevel } from "./utils";

describe("calculateScore", () => {
  it("scores modern single at level 1 as 100", () => {
    assert.equal(calculateScore(1, 1, "modern"), 100);
  });

  it("scores NES tetris with level multiplier", () => {
    // NES tetris base 1200 * (level + 1)
    assert.equal(calculateScore(4, 0, "nes"), 1200);
    assert.equal(calculateScore(4, 1, "nes"), 2400);
  });

  it("returns 0 for zero lines", () => {
    assert.equal(calculateScore(0, 5, "modern"), 0);
  });
});

describe("getDropPoints", () => {
  it("awards modern hard drop points by distance", () => {
    assert.equal(getDropPoints("hard", 10, "modern"), 20);
  });

  it("awards no drop points in NES mode", () => {
    assert.equal(getDropPoints("hard", 10, "nes"), 0);
  });
});

describe("calculateLevel", () => {
  it("starts at starting level until lines threshold", () => {
    assert.equal(calculateLevel(0, 1), 1);
    assert.equal(calculateLevel(9, 1), 1);
  });
});
