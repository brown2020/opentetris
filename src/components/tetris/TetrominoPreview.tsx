// src/components/tetris/TetrominoPreview.tsx
import React, { useMemo } from "react";
import { TetrominoType } from "@/types";
import { TETROMINO_SHAPES, TETROMINO_COLORS } from "@/lib/constants";

type PreviewVariant = "hold" | "next-main" | "next-secondary";

interface TetrominoPreviewProps {
  piece: TetrominoType | null;
  variant?: PreviewVariant;
  className?: string;
}

// Pre-computed variant styles
const VARIANT_CONFIG = {
  hold: {
    cellSize: "w-4 h-4",
    containerClass: "p-2 bg-gray-900 rounded border border-gray-700",
    opacity: 1,
    scale: "",
  },
  "next-main": {
    cellSize: "w-4 h-4",
    containerClass: "p-2 bg-gray-900 rounded border border-gray-700",
    opacity: 1,
    scale: "",
  },
  "next-secondary": {
    cellSize: "w-3 h-3",
    containerClass: "p-1.5 bg-gray-900 rounded border border-gray-700",
    opacity: 0.7,
    scale: "scale-90",
  },
} as const;

// Pre-compute active cell classes for each tetromino type
const ACTIVE_CELL_CLASSES = Object.fromEntries(
  Object.entries(TETROMINO_COLORS).map(([type, colors]) => [
    type,
    `${colors.bg} border-t-white/20 border-l-white/20 border-r-black/20 border-b-black/20`,
  ])
) as Record<TetrominoType, string>;

const EMPTY_CELL_CLASS = "bg-gray-800 border-gray-700";

const TetrominoPreview: React.FC<TetrominoPreviewProps> = ({
  piece,
  variant = "next-main",
  className = "",
}) => {
  const config = VARIANT_CONFIG[variant];

  // Memoize center offset calculation (always center pieces)
  const centerOffset = useMemo(() => {
    if (!piece) return { x: 0, y: 0 };

    const shape = TETROMINO_SHAPES[piece];
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
      x: Math.floor((4 - (maxCol - minCol + 1)) / 2),
      y: Math.floor((4 - (maxRow - minRow + 1)) / 2),
    };
  }, [piece]);

  const renderGrid = () => {
    const shape = piece ? TETROMINO_SHAPES[piece] : null;

    return (
      <div className="grid grid-cols-4 gap-0.5">
        {Array.from({ length: 16 }).map((_, index) => {
          const row = Math.floor(index / 4);
          const col = index % 4;

          const pieceRow = row - centerOffset.y;
          const pieceCol = col - centerOffset.x;
          const isActive = piece && shape?.[pieceRow]?.[pieceCol] === 1;

          return (
            <div
              key={index}
              className={`${config.cellSize} border ${
                isActive ? ACTIVE_CELL_CLASSES[piece] : EMPTY_CELL_CLASS
              }`}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={`${config.containerClass} ${config.scale} ${className}`}
      style={{ opacity: config.opacity }}
    >
      {renderGrid()}
    </div>
  );
};

export default React.memo(TetrominoPreview);
