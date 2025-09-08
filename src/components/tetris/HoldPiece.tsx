// src/components/tetris/HoldPiece.tsx
import React from "react";
import { TetrominoType } from "@/types";
import { TETROMINO_SHAPES, TETROMINO_COLORS } from "@/lib/constants";

interface HoldPieceProps {
  piece: TetrominoType | null;
  isLocked: boolean;
  className?: string;
}

const HoldPiece: React.FC<HoldPieceProps> = ({
  piece,
  isLocked,
  className = "",
}) => {
  const renderGrid = () => {
    if (!piece) {
      return (
        <div className="grid grid-cols-4 gap-0.5">
          {Array.from({ length: 16 }).map((_, index) => (
            <div
              key={index}
              className="w-4 h-4 bg-gray-800 border border-gray-700"
            />
          ))}
        </div>
      );
    }

    const shape = TETROMINO_SHAPES[piece];
    const color = TETROMINO_COLORS[piece];

    return (
      <div className="grid grid-cols-4 gap-0.5">
        {Array.from({ length: 16 }).map((_, index) => {
          const row = Math.floor(index / 4);
          const col = index % 4;
          const isActive = shape[row]?.[col] === 1;

          return (
            <div
              key={index}
              className={`w-4 h-4 border ${
                isActive
                  ? `${color.bg} border-t-white/20 border-l-white/20 border-r-black/20 border-b-black/20`
                  : "bg-gray-800 border-gray-700"
              }`}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      <div className="mb-2 text-sm font-semibold text-gray-300">Hold</div>
      <div
        className={`p-2 bg-gray-900 rounded border border-gray-700 ${
          isLocked ? "opacity-50" : ""
        }`}
      >
        {renderGrid()}
      </div>
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-xs text-gray-400">Locked</div>
        </div>
      )}
    </div>
  );
};

export default React.memo(HoldPiece);
