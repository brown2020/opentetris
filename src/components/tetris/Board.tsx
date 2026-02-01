// src/components/tetris/Board.tsx
import React, { useMemo, useCallback } from "react";
import Cell from "./Cell";
import { BOARD_WIDTH, LINE_CLEAR_ANIMATION } from "@/lib/constants";
import { Board as BoardType, Tetromino, LineClearAnimation, ColorTheme } from "@/types";
import { getRotatedShape } from "@/lib/utils";

interface BoardProps {
  board: BoardType;
  currentPiece: Tetromino | null;
  ghostPiece: Tetromino | null;
  lineClearAnimation?: LineClearAnimation | null;
  level?: number;
  colorTheme?: ColorTheme;
  className?: string;
}

// Helper to compute cell coordinates for a piece
function getPieceCells(piece: Tetromino | null): Set<string> | null {
  if (!piece) return null;
  const shape = getRotatedShape(piece);
  const set = new Set<string>();
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        set.add(`${piece.position.y + y},${piece.position.x + x}`);
      }
    }
  }
  return set;
}

const Board: React.FC<BoardProps> = ({
  board,
  currentPiece,
  ghostPiece,
  lineClearAnimation,
  level = 0,
  colorTheme = "modern",
  className = "",
}) => {
  const currentCells = useMemo(
    () => getPieceCells(currentPiece),
    [currentPiece]
  );
  const ghostCells = useMemo(() => getPieceCells(ghostPiece), [ghostPiece]);

  // Determine which rows are clearing and if they should flash
  const clearingRows = useMemo(() => {
    if (!lineClearAnimation) return new Set<number>();
    return new Set(lineClearAnimation.rows);
  }, [lineClearAnimation]);

  // Flash state: alternate based on frame number (0,2,4,6 = on; 1,3,5,7 = off)
  const isFlashOn = lineClearAnimation
    ? lineClearAnimation.frame % 2 === 0
    : false;

  const getCellContent = useCallback(
    (row: number, col: number) => {
      const key = `${row},${col}`;

      if (currentCells?.has(key)) {
        return { type: currentPiece!.type, isActive: true, isGhost: false };
      }

      if (ghostCells?.has(key)) {
        return { type: ghostPiece!.type, isActive: false, isGhost: true };
      }

      return { type: board[row][col], isActive: false, isGhost: false };
    },
    [currentCells, ghostCells, currentPiece, ghostPiece, board]
  );

  return (
    <div
      className={`grid gap-0 bg-gray-900 p-1 rounded-sm border-2 border-gray-700 ${className}`}
      style={{
        gridTemplateColumns: `repeat(${BOARD_WIDTH}, minmax(0, 1fr))`,
        width: "fit-content",
      }}
      aria-label="OpenTetris game board"
    >
      {board.map((row, rowIndex) =>
        row.map((_, colIndex) => {
          const cellContent = getCellContent(rowIndex, colIndex);
          const isClearing = clearingRows.has(rowIndex);
          return (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              type={cellContent.type}
              isActive={cellContent.isActive}
              isGhost={cellContent.isGhost}
              isClearing={isClearing}
              isFlashOn={isClearing && isFlashOn}
              level={level}
              colorTheme={colorTheme}
            />
          );
        })
      )}
    </div>
  );
};

export default React.memo(Board);
