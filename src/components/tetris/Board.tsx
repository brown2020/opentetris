// src/components/tetris/Board.tsx
import React from "react";
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
  // Function to check if a cell is part of the current piece
  const isCurrentPieceCell = (row: number, col: number): boolean => {
    if (!currentPiece) return false;

    const shape = getRotatedShape(currentPiece);
    const pieceRow = row - currentPiece.position.y;
    const pieceCol = col - currentPiece.position.x;

    if (
      pieceRow >= 0 &&
      pieceRow < shape.length &&
      pieceCol >= 0 &&
      pieceCol < shape[0].length
    ) {
      return Boolean(shape[pieceRow][pieceCol]);
    }

    return false;
  };

  // Function to check if a cell is part of the ghost piece
  const isGhostPieceCell = (row: number, col: number): boolean => {
    if (!ghostPiece) return false;

    const shape = getRotatedShape(ghostPiece);
    const pieceRow = row - ghostPiece.position.y;
    const pieceCol = col - ghostPiece.position.x;

    if (
      pieceRow >= 0 &&
      pieceRow < shape.length &&
      pieceCol >= 0 &&
      pieceCol < shape[0].length
    ) {
      return Boolean(shape[pieceRow][pieceCol]);
    }

    return false;
  };

  // Function to get cell content (board, current piece, or ghost piece)
  const getCellContent = (row: number, col: number) => {
    // First check if it's part of the current piece
    if (isCurrentPieceCell(row, col)) {
      return {
        type: currentPiece!.type,
        isActive: true,
        isGhost: false,
      };
    }

    // Then check if it's part of the ghost piece
    if (isGhostPieceCell(row, col) && !isCurrentPieceCell(row, col)) {
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
      className={`grid gap-0 bg-gray-900 p-1 rounded border-2 border-gray-700 ${className}`}
      style={{
        gridTemplateColumns: `repeat(${BOARD_WIDTH}, minmax(0, 1fr))`,
        width: "fit-content",
      }}
      aria-label="Tetris game board"
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
