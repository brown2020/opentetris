// src/components/tetris/Cell.tsx
import React from "react";
import { TetrominoType } from "@/types";
import { TETROMINO_COLORS } from "@/lib/constants";

// Pre-computed class maps for performance - avoids string concatenation on every render
const CELL_CLASSES = Object.fromEntries(
  Object.entries(TETROMINO_COLORS).map(([type, colors]) => [
    type,
    {
      ghost: `w-6 h-6 ${colors.bg} opacity-30 border-2 border-white/30`,
      active: `w-6 h-6 ${colors.bg} ${colors.border} border-2 brightness-110`,
      placed: `w-6 h-6 ${colors.bg} ${colors.border} border-2`,
    },
  ])
) as Record<TetrominoType, { ghost: string; active: string; placed: string }>;

const EMPTY_CELL_CLASS = "w-6 h-6 border border-gray-800 bg-gray-900";

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
    return <div className={EMPTY_CELL_CLASS} />;
  }

  const classes = CELL_CLASSES[type];
  const cellClass = isGhost
    ? classes.ghost
    : isActive
    ? classes.active
    : classes.placed;

  return <div className={cellClass} />;
};

export default React.memo(Cell);
