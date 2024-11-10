// src/components/tetris/Cell.tsx
import React from "react";
import { TetrominoType } from "@/types";
import { TETROMINO_COLORS } from "@/lib/constants";

interface CellProps {
  type: TetrominoType | null;
  isActive?: boolean;
  isGhost?: boolean;
}

const Cell: React.FC<CellProps> = ({
  type,
  isActive = false,
  isGhost = false,
}) => {
  if (!type) {
    return (
      <div
        className="w-6 h-6 border border-gray-800 bg-gray-900"
        data-empty="true"
      />
    );
  }

  const baseColor = TETROMINO_COLORS[type];
  let cellStyle: string;

  if (isGhost) {
    // Ghost piece is semi-transparent
    cellStyle = `${baseColor.bg} opacity-30 border-2 border-white/30`;
  } else if (isActive) {
    // Active piece has bright borders
    cellStyle = `${baseColor.bg} ${baseColor.border} border-2 brightness-110`;
  } else {
    // Placed pieces
    cellStyle = `${baseColor.bg} ${baseColor.border} border-2`;
  }

  return (
    <div
      className={`w-6 h-6 ${cellStyle}`}
      data-type={type}
      data-active={isActive}
      data-ghost={isGhost}
    />
  );
};

export default React.memo(Cell);
