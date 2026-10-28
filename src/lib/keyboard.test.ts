import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { directionStillHeld, shouldIgnoreGameKey } from "./keyboard";

describe("game key guard", () => {
  it("ignores modifier chords and interactive targets", () => {
    assert.equal(shouldIgnoreGameKey({ ctrlKey: true, target: { tagName: "BODY" } }), true);
    assert.equal(shouldIgnoreGameKey({ metaKey: true }), true);
    assert.equal(shouldIgnoreGameKey({ altKey: true }), true);
    assert.equal(shouldIgnoreGameKey({ target: { tagName: "BUTTON" } }), true);
    assert.equal(shouldIgnoreGameKey({ target: { tagName: "input" } }), true);
    assert.equal(shouldIgnoreGameKey({ target: { tagName: "DIV", isContentEditable: true } }), true);
    assert.equal(shouldIgnoreGameKey({ target: { tagName: "BODY" } }), false);
    assert.equal(shouldIgnoreGameKey({}), false);
  });

  it("keeps DAS running while another key for that direction is held", () => {
    assert.equal(directionStillHeld(["a"], "left"), true);
    assert.equal(directionStillHeld(["ArrowLeft"], "left"), true);
    assert.equal(directionStillHeld(["d"], "left"), false);
    assert.equal(directionStillHeld(["ArrowRight", "d"], "right"), true);
    assert.equal(directionStillHeld([], "right"), false);
  });
});
