import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Tetromino } from "../types";
import { createEmptyBoard, generateNewPiece, getRotatedShape, tryRotate } from "./utils";

function cellsOf(piece: Tetromino): string[] {
  const shape = getRotatedShape(piece);
  const cells: string[] = [];
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) cells.push(`${piece.position.x + x},${piece.position.y + y}`);
    }
  }
  return cells.sort();
}

describe("SRS rotation", () => {
  const board = createEmptyBoard();

  it("keeps the O piece on its centered spawn cells when rotated", () => {
    const spawned = generateNewPiece("O");
    assert.deepEqual(cellsOf(spawned), ["4,0", "4,1", "5,0", "5,1"]);

    const once = tryRotate(spawned, board, "srs");
    const twice = once && tryRotate(once, board, "srs");
    assert.ok(once);
    assert.ok(twice);
    assert.deepEqual(cellsOf(once), cellsOf(spawned));
    assert.deepEqual(cellsOf(twice), cellsOf(spawned));

    const againstWall = { ...spawned, position: { x: 7, y: 0 } };
    const rotated = tryRotate(againstWall, board, "srs");
    assert.ok(rotated);
    assert.deepEqual(cellsOf(rotated), cellsOf(againstWall));
  });

  it("rotates T, J, L, S, and Z inside the 3x3 instead of shifting the 4x4", () => {
    const expected: Record<"T" | "J" | "L" | "S" | "Z", [string[], string[], string[]]> = {
      T: [
        ["3,1", "4,0", "4,1", "5,1"],
        ["4,0", "4,1", "4,2", "5,1"],
        ["3,1", "4,1", "4,2", "5,1"],
      ],
      J: [
        ["3,0", "3,1", "4,1", "5,1"],
        ["4,0", "4,1", "4,2", "5,0"],
        ["3,1", "4,1", "5,1", "5,2"],
      ],
      L: [
        ["3,1", "4,1", "5,0", "5,1"],
        ["4,0", "4,1", "4,2", "5,2"],
        ["3,1", "3,2", "4,1", "5,1"],
      ],
      S: [
        ["3,1", "4,0", "4,1", "5,0"],
        ["4,0", "4,1", "5,1", "5,2"],
        ["3,2", "4,1", "4,2", "5,1"],
      ],
      Z: [
        ["3,0", "4,0", "4,1", "5,1"],
        ["4,1", "4,2", "5,0", "5,1"],
        ["3,1", "4,1", "4,2", "5,2"],
      ],
    };

    for (const type of ["T", "J", "L", "S", "Z"] as const) {
      const spawned = generateNewPiece(type);
      const once = tryRotate(spawned, board, "srs");
      const twice = once && tryRotate(once, board, "srs");
      assert.ok(once, type);
      assert.ok(twice, type);
      assert.deepEqual(cellsOf(spawned), expected[type][0], `${type} spawn`);
      assert.deepEqual(cellsOf(once), expected[type][1], `${type} rotate 1`);
      assert.deepEqual(cellsOf(twice), expected[type][2], `${type} rotate 2`);
    }
  });

  it("keeps I on the SRS 4x4 poses", () => {
    const spawned = generateNewPiece("I");
    const once = tryRotate(spawned, board, "srs");
    const twice = once && tryRotate(once, board, "srs");
    assert.ok(once);
    assert.ok(twice);
    assert.deepEqual(cellsOf(spawned), ["3,1", "4,1", "5,1", "6,1"]);
    assert.deepEqual(cellsOf(once), ["5,0", "5,1", "5,2", "5,3"]);
    assert.deepEqual(cellsOf(twice), ["3,2", "4,2", "5,2", "6,2"]);
  });
});
