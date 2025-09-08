// src/components/tetris/Board.tsx
import React, { useMemo } from "react";
import Cell from "./Cell";
import { BOARD_WIDTH } from "@/lib/constants";
import { Board as BoardType, Tetromino } from "@/types";
import { getRotatedShape } from "@/lib/utils";

interface BoardProps {
  board: BoardType;
  currentPiece: Tetromino | null;
  ghostPiece: Tetromino | null;
  className?: string;
}

const Board: React.FC<BoardProps> = ({
  board,
  currentPiece,
  ghostPiece,
  className = "",
}) => {
  // Precompute occupied board coordinates for current and ghost pieces
  const currentCells = useMemo(() => {
    if (!currentPiece) return null;
    const shape = getRotatedShape(currentPiece);
    const set = new Set<string>();
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardY = currentPiece.position.y + y;
          const boardX = currentPiece.position.x + x;
          set.add(`${boardY},${boardX}`);
        }
      }
    }
    return set;
  }, [currentPiece]);

  const ghostCells = useMemo(() => {
    if (!ghostPiece) return null;
    const shape = getRotatedShape(ghostPiece);
    const set = new Set<string>();
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardY = ghostPiece.position.y + y;
          const boardX = ghostPiece.position.x + x;
          set.add(`${boardY},${boardX}`);
        }
      }
    }
    return set;
  }, [ghostPiece]);

  // Function to get cell content (board, current piece, or ghost piece)
  const getCellContent = (row: number, col: number) => {
    // First check if it's part of the current piece
    if (currentCells?.has(`${row},${col}`)) {
      return {
        type: currentPiece!.type,
        isActive: true,
        isGhost: false,
      };
    }

    // Then check if it's part of the ghost piece
    if (
      ghostCells?.has(`${row},${col}`) &&
      !currentCells?.has(`${row},${col}`)
    ) {
      return {
        type: ghostPiece!.type,
        isActive: false,
        isGhost: true,
      };
    }

    // Finally, return the board cell content
    return {
      type: board[row][col],
      isActive: false,
      isGhost: false,
    };
  };

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
          return (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              type={cellContent.type}
              isActive={cellContent.isActive}
              isGhost={cellContent.isGhost}
            />
          );
        })
      )}
    </div>
  );
};

export default React.memo(Board);
