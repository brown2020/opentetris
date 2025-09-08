// src/components/tetris/PreviewBox.tsx
import React from "react";
import { TetrominoType } from "@/types";
import { TETROMINO_SHAPES, TETROMINO_COLORS } from "@/lib/constants";

interface PreviewBoxProps {
  piece: TetrominoType;
  isMainPreview?: boolean;
  className?: string;
}

const PreviewBox: React.FC<PreviewBoxProps> = ({
  piece,
  isMainPreview = false,
  className = "",
}) => {
  const shape = TETROMINO_SHAPES[piece];
  const color = TETROMINO_COLORS[piece];

  // Calculate the actual size of the piece
  const getPieceSize = () => {
    let minRow = 4,
      maxRow = 0,
      minCol = 4,
      maxCol = 0;

    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          minRow = Math.min(minRow, row);
          maxRow = Math.max(maxRow, row);
          minCol = Math.min(minCol, col);
          maxCol = Math.max(maxCol, col);
        }
      }
    }

    return {
      width: maxCol - minCol + 1,
      height: maxRow - minRow + 1,
      offset: { row: minRow, col: minCol },
    };
  };

  const pieceSize = getPieceSize();

  // Center the piece in the preview box
  const centerOffset = {
    x: Math.floor((4 - pieceSize.width) / 2),
    y: Math.floor((4 - pieceSize.height) / 2),
  };

  return (
    <div
      className={`
        ${className}
        ${isMainPreview ? "p-2" : "p-1.5 scale-90"}
        bg-gray-900 
        rounded 
        border 
        border-gray-700
      `}
    >
      <div
        className="grid grid-cols-4 gap-0.5"
        style={{
          opacity: isMainPreview ? 1 : 0.7,
        }}
      >
        {Array.from({ length: 16 }).map((_, index) => {
          const row = Math.floor(index / 4);
          const col = index % 4;

          // Calculate if this cell should be filled based on the centered piece
          const pieceRow = row - centerOffset.y;
          const pieceCol = col - centerOffset.x;
          const isActive = shape[pieceRow]?.[pieceCol] === 1;

          return (
            <div
              key={index}
              className={`
                ${isMainPreview ? "w-4 h-4" : "w-3 h-3"}
                border
                ${
                  isActive
                    ? `${color.bg} border-t-white/20 border-l-white/20 border-r-black/20 border-b-black/20`
                    : "bg-gray-800 border-gray-700"
                }
              `}
            />
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(PreviewBox);
